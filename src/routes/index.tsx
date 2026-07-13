import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession, useIsAdmin } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import imgIbew from "@/assets/era-ibew.jpg";
import imgEarly from "@/assets/era-early.jpg";
import imgCoal from "@/assets/era-coal.jpg";
import imgSteel from "@/assets/era-steel.jpg";
import imgStorm from "@/assets/era-storm.jpg";
import imgDavis from "@/assets/era-davis.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { property: "og:image", content: imgIbew },
      { name: "twitter:image", content: imgIbew },
    ],
  }),
  component: Index,
});

type Era = "early" | "coal" | "steel" | "modern" | "ibew";

interface TimelineEvent {
  id: string;
  sort_order: number;
  year: string;
  title: string;
  body: string;
  era: Era;
  tag: string | null;
  image_url: string | null;
  image_alt: string | null;
}

const ERA_META: Record<Era, { label: string; dot: string; chip: string; accent: string }> = {
  early: {
    label: "Early labour",
    dot: "bg-[color:var(--era-early)]",
    chip: "bg-[color:var(--era-early)]/15 text-[color:var(--era-early)] border-[color:var(--era-early)]/30",
    accent: "text-[color:var(--era-early)]",
  },
  coal: {
    label: "Coal",
    dot: "bg-[color:var(--era-coal)]",
    chip: "bg-[color:var(--era-coal)]/15 text-[color:var(--era-coal)] border-[color:var(--era-coal)]/30",
    accent: "text-[color:var(--era-coal)]",
  },
  steel: {
    label: "Steel",
    dot: "bg-[color:var(--era-steel)]",
    chip: "bg-[color:var(--era-steel)]/15 text-[color:var(--era-steel)] border-[color:var(--era-steel)]/30",
    accent: "text-[color:var(--era-steel)]",
  },
  modern: {
    label: "Modern",
    dot: "bg-[color:var(--era-modern)]",
    chip: "bg-[color:var(--era-modern)]/15 text-[color:var(--era-modern)] border-[color:var(--era-modern)]/30",
    accent: "text-[color:var(--era-modern)]",
  },
  ibew: {
    label: "IBEW 1852",
    dot: "bg-[color:var(--era-ibew)]",
    chip: "bg-[color:var(--era-ibew)]/20 text-[color:var(--era-ibew)] border-[color:var(--era-ibew)]/40",
    accent: "text-[color:var(--era-ibew)]",
  },
};

// Fallback image per era so seeded rows without an image_url still look right.
const FALLBACK_BY_ERA: Record<Era, string> = {
  early: imgEarly,
  coal: imgCoal,
  steel: imgSteel,
  modern: imgIbew,
  ibew: imgIbew,
};

// Quick-pick presets when editing images.
const PRESET_IMAGES: { label: string; url: string }[] = [
  { label: "Early miners", url: imgEarly },
  { label: "Coal picket line", url: imgCoal },
  { label: "Sydney steel", url: imgSteel },
  { label: "Davis memorial", url: imgDavis },
  { label: "IBEW lineman", url: imgIbew },
  { label: "Storm restoration", url: imgStorm },
];

const asEra = (v: string): Era =>
  (["early", "coal", "steel", "modern", "ibew"].includes(v) ? v : "modern") as Era;

const resolveImage = (e: TimelineEvent) => e.image_url || FALLBACK_BY_ERA[e.era];

function useEvents() {
  return useQuery({
    queryKey: ["timeline_events"],
    queryFn: async (): Promise<TimelineEvent[]> => {
      const { data, error } = await supabase
        .from("timeline_events")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((r) => ({
        id: r.id,
        sort_order: r.sort_order,
        year: r.year,
        title: r.title,
        body: r.body,
        era: asEra(r.era),
        tag: r.tag,
        image_url: r.image_url,
        image_alt: r.image_alt,
      }));
    },
  });
}

function Index() {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [activeIdx, setActiveIdx] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editing, setEditing] = useState<TimelineEvent | "new" | null>(null);

  const { session } = useSession();
  const isAdmin = useIsAdmin(session?.user?.id);
  const canEdit = editMode && isAdmin;

  const { data: events = [], isLoading, error } = useEvents();
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["timeline_events"] });

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollWidth - el.clientWidth;
      const p = max > 0 ? el.scrollLeft / max : 0;
      setProgress(p);
      setActiveIdx(Math.round(p * Math.max(events.length - 1, 0)));
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        el.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("wheel", onWheel);
    };
  }, [events.length]);

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  const backdrops = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    for (const e of events) {
      const src = resolveImage(e);
      if (!seen.has(src)) {
        seen.add(src);
        list.push(src);
      }
    }
    return list;
  }, [events]);

  const activeBackdrop = events[activeIdx] ? resolveImage(events[activeIdx]) : imgIbew;

  const handleMove = async (e: TimelineEvent, dir: -1 | 1) => {
    const idx = events.findIndex((x) => x.id === e.id);
    const swap = events[idx + dir];
    if (!swap) return;
    const { error: err1 } = await supabase
      .from("timeline_events")
      .update({ sort_order: swap.sort_order })
      .eq("id", e.id);
    const { error: err2 } = await supabase
      .from("timeline_events")
      .update({ sort_order: e.sort_order })
      .eq("id", swap.id);
    if (err1 || err2) toast.error((err1 || err2)!.message);
    else invalidate();
  };

  const handleDelete = async (e: TimelineEvent) => {
    if (!confirm(`Delete "${e.title}"?`)) return;
    const { error: err } = await supabase.from("timeline_events").delete().eq("id", e.id);
    if (err) toast.error(err.message);
    else {
      toast.success("Deleted");
      invalidate();
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setEditMode(false);
    toast.success("Signed out");
  };

  return (
    <div
      className="min-h-screen text-foreground"
      style={{
        ["--era-early" as string]: "oklch(0.55 0.09 40)",
        ["--era-coal" as string]: "oklch(0.35 0.02 260)",
        ["--era-steel" as string]: "oklch(0.62 0.16 55)",
        ["--era-modern" as string]: "oklch(0.55 0.12 200)",
        ["--era-ibew" as string]: "oklch(0.72 0.19 85)",
        backgroundColor: "var(--color-background)",
      }}
    >
      {/* Top bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-end gap-2 px-6 pt-4 text-sm">
        {!session ? (
          <Link
            to="/auth"
            className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
          >
            Sign in to edit
          </Link>
        ) : (
          <>
            {isAdmin && (
              <button
                onClick={() => setEditMode((v) => !v)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  editMode
                    ? "border-[color:var(--era-ibew)] bg-[color:var(--era-ibew)]/15 text-[color:var(--era-ibew)]"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {editMode ? "Editing ON" : "Enable editing"}
              </button>
            )}
            <button
              onClick={handleSignOut}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
            >
              Sign out
            </button>
          </>
        )}
      </div>

      <div className="mx-auto max-w-7xl px-6 pt-6 pb-6 sm:pt-8">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-6">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Cape Breton · Nova Scotia
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">
              A Coast That <span className="italic text-[color:var(--era-ibew)]">Organized</span>.
            </h1>
            <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
              From the coal pits of Glace Bay and the steel plant in Sydney to the line trucks of
              IBEW Local 1852 — scroll the timeline sideways to walk through 150 years of Cape
              Breton labour history.
            </p>
          </div>
          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            <button
              onClick={() => scrollBy(-1)}
              aria-label="Scroll timeline left"
              className="grid h-11 w-11 place-items-center rounded-full border border-border bg-card text-foreground transition hover:bg-accent"
            >
              ←
            </button>
            <button
              onClick={() => scrollBy(1)}
              aria-label="Scroll timeline right"
              className="grid h-11 w-11 place-items-center rounded-full border border-border bg-card text-foreground transition hover:bg-accent"
            >
              →
            </button>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-2">
          {(Object.keys(ERA_META) as Era[]).map((era) => (
            <span
              key={era}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${ERA_META[era].chip}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${ERA_META[era].dot}`} />
              {ERA_META[era].label}
            </span>
          ))}
          {canEdit && (
            <Button
              size="sm"
              onClick={() => setEditing("new")}
              className="ml-auto"
            >
              + Add event
            </Button>
          )}
        </div>

        <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-[color:var(--era-ibew)] transition-[width] duration-150"
            style={{ width: `${Math.max(4, progress * 100)}%` }}
          />
        </div>
      </div>

      <div className="relative">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {backdrops.map((src) => (
            <img
              key={src}
              src={src}
              alt=""
              width={1280}
              height={800}
              loading="lazy"
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out ${
                src === activeBackdrop ? "opacity-25" : "opacity-0"
              }`}
              style={{ filter: "saturate(0.85)" }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/70 to-background" />
        </div>

        <div
          ref={scrollerRef}
          className="relative w-full overflow-x-auto overflow-y-hidden pb-16"
          style={{ scrollbarWidth: "thin" }}
        >
          <div className="relative min-w-max px-6 pt-10">
            <div className="pointer-events-none absolute left-6 right-6 top-[300px] h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            {isLoading && (
              <div className="grid h-[420px] place-items-center text-sm text-muted-foreground">
                Loading timeline…
              </div>
            )}
            {error && (
              <div className="grid h-[420px] place-items-center text-sm text-destructive">
                Couldn't load events.
              </div>
            )}

            <ol className="relative flex items-stretch gap-6">
              {events.map((e, i) => {
                const meta = ERA_META[e.era];
                const above = i % 2 === 0;
                const card = (
                  <EventCard
                    event={e}
                    meta={meta}
                    canEdit={canEdit}
                    onEdit={() => setEditing(e)}
                    onDelete={() => handleDelete(e)}
                    onMoveLeft={i > 0 ? () => handleMove(e, -1) : undefined}
                    onMoveRight={i < events.length - 1 ? () => handleMove(e, 1) : undefined}
                  />
                );
                return (
                  <li
                    key={e.id}
                    className="relative flex w-[320px] shrink-0 flex-col sm:w-[360px]"
                  >
                    {above ? (
                      <>
                        {card}
                        <div className="relative flex h-[72px] items-start justify-center">
                          <div className={`h-full w-px ${meta.dot}`} />
                          <span
                            className={`absolute top-[64px] h-3 w-3 rounded-full ring-4 ring-background ${meta.dot}`}
                          />
                        </div>
                        <YearLabel year={e.year} meta={meta} />
                      </>
                    ) : (
                      <>
                        <div className="min-h-[372px]" />
                        <div className="relative flex h-[72px] items-end justify-center">
                          <span
                            className={`absolute top-0 h-3 w-3 rounded-full ring-4 ring-background ${meta.dot}`}
                          />
                          <div className={`h-full w-px ${meta.dot}`} />
                        </div>
                        <YearLabel year={e.year} meta={meta} />
                        <div className="mt-4">{card}</div>
                      </>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>

      <footer className="mx-auto max-w-7xl px-6 pb-16">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--era-ibew)]/40 bg-[color:var(--era-ibew)]/15 px-3 py-1 text-xs font-semibold text-[color:var(--era-ibew)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--era-ibew)]" />
              IBEW Local 1852
            </span>
            <h2 className="text-xl font-bold sm:text-2xl">Our local, in one line.</h2>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Chartered in 1946, IBEW Local 1852 represents electrical workers across Cape Breton and
            eastern Nova Scotia — the linemen, powerline technicians, powerhouse operators and
            trades who keep the lights on through nor'easters, hurricanes and everything in
            between. We stand on the shoulders of the PWA lodges, the UMW's District 26, and the
            steelworkers of Whitney Pier. Same island. Same fight.
          </p>
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Scroll sideways · drag · or use ← → to move through the timeline.
        </p>
      </footer>

      {editing && (
        <EditDialog
          initial={editing === "new" ? null : editing}
          maxOrder={events.reduce((m, e) => Math.max(m, e.sort_order), 0)}
          onClose={() => setEditing(null)}
          onSaved={() => {
            invalidate();
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function YearLabel({
  year,
  meta,
}: {
  year: string;
  meta: (typeof ERA_META)[Era];
}) {
  return (
    <div className="flex justify-center">
      <span className={`text-3xl font-black tracking-tight ${meta.accent}`}>{year}</span>
    </div>
  );
}

function EventCard({
  event,
  meta,
  canEdit,
  onEdit,
  onDelete,
  onMoveLeft,
  onMoveRight,
}: {
  event: TimelineEvent;
  meta: (typeof ERA_META)[Era];
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
}) {
  const img = resolveImage(event);
  return (
    <article className="group relative flex min-h-[372px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative h-40 w-full overflow-hidden">
        <img
          src={img}
          alt={event.image_alt ?? event.title}
          width={1280}
          height={800}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-card/10 to-transparent" />
        <span
          className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider backdrop-blur ${meta.chip}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
          {event.tag ?? meta.label}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold leading-snug text-card-foreground">{event.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{event.body}</p>
      </div>

      {canEdit && (
        <div className="absolute inset-x-2 top-2 flex justify-end gap-1">
          <button
            type="button"
            onClick={onMoveLeft}
            disabled={!onMoveLeft}
            title="Move earlier"
            className="grid h-7 w-7 place-items-center rounded-full bg-background/90 text-xs shadow-sm ring-1 ring-border disabled:opacity-30"
          >
            ←
          </button>
          <button
            type="button"
            onClick={onMoveRight}
            disabled={!onMoveRight}
            title="Move later"
            className="grid h-7 w-7 place-items-center rounded-full bg-background/90 text-xs shadow-sm ring-1 ring-border disabled:opacity-30"
          >
            →
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium shadow-sm ring-1 ring-border"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-full bg-destructive/90 px-2.5 py-1 text-xs font-medium text-destructive-foreground shadow-sm"
          >
            Delete
          </button>
        </div>
      )}
    </article>
  );
}

function EditDialog({
  initial,
  maxOrder,
  onClose,
  onSaved,
}: {
  initial: TimelineEvent | null;
  maxOrder: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [year, setYear] = useState(initial?.year ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [era, setEra] = useState<Era>(initial?.era ?? "modern");
  const [tag, setTag] = useState(initial?.tag ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
  const [imageAlt, setImageAlt] = useState(initial?.image_alt ?? "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!year.trim() || !title.trim() || !body.trim()) {
      toast.error("Year, title and description are required");
      return;
    }
    setSaving(true);
    const payload = {
      year: year.trim().slice(0, 40),
      title: title.trim().slice(0, 200),
      body: body.trim().slice(0, 2000),
      era,
      tag: tag.trim() ? tag.trim().slice(0, 40) : null,
      image_url: imageUrl.trim() ? imageUrl.trim().slice(0, 1000) : null,
      image_alt: imageAlt.trim() ? imageAlt.trim().slice(0, 300) : null,
    };
    const res = initial
      ? await supabase.from("timeline_events").update(payload).eq("id", initial.id)
      : await supabase
          .from("timeline_events")
          .insert({ ...payload, sort_order: maxOrder + 10 });
    setSaving(false);
    if (res.error) {
      toast.error(res.error.message);
      return;
    }
    toast.success(initial ? "Updated" : "Added");
    onSaved();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit event" : "Add event"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-[1fr_1fr] gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="year">Year / label</Label>
              <Input id="year" value={year} onChange={(e) => setYear(e.target.value)} placeholder="1946" />
            </div>
            <div className="space-y-1.5">
              <Label>Era</Label>
              <Select value={era} onValueChange={(v) => setEra(v as Era)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(ERA_META) as Era[]).map((k) => (
                    <SelectItem key={k} value={k}>
                      {ERA_META[k].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="body">Description</Label>
            <Textarea id="body" rows={4} value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tag">Tag (optional)</Label>
            <Input id="tag" value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Strike, IBEW, Legislation…" />
          </div>
          <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
            <Label>Image</Label>
            {imageUrl && (
              <div className="relative overflow-hidden rounded-md border border-border">
                <img src={imageUrl} alt="preview" className="h-32 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="absolute right-2 top-2 rounded-full bg-background/90 px-2 py-0.5 text-xs shadow ring-1 ring-border"
                >
                  Remove
                </button>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <label
                className={`inline-flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium shadow-sm transition hover:bg-accent ${
                  uploading ? "pointer-events-none opacity-60" : ""
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                {uploading ? "Uploading…" : imageUrl ? "Replace image" : "Upload image"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUpload(f);
                    e.target.value = "";
                  }}
                />
              </label>
              <span className="text-xs text-muted-foreground">PNG, JPG, WebP · max 10MB</span>
            </div>
            <div className="space-y-1.5 pt-1">
              <Label htmlFor="image" className="text-xs text-muted-foreground">Or paste an image URL</Label>
              <Input id="image" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" />
            </div>
            <div className="space-y-1.5 pt-1">
              <Label className="text-xs text-muted-foreground">Or pick a preset</Label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_IMAGES.map((p) => (
                  <button
                    key={p.url}
                    type="button"
                    onClick={() => setImageUrl(p.url)}
                    className={`overflow-hidden rounded-md ring-1 ring-border transition ${
                      imageUrl === p.url ? "ring-2 ring-primary" : "hover:ring-foreground/40"
                    }`}
                    title={p.label}
                  >
                    <img src={p.url} alt={p.label} className="h-10 w-16 object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="alt">Image alt text (describe the image)</Label>
            <Input id="alt" value={imageAlt} onChange={(e) => setImageAlt(e.target.value)} placeholder="e.g. IBEW linemen restoring power after a storm" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving…" : initial ? "Save" : "Add event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
