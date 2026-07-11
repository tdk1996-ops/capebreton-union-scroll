import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cape Breton Union History — IBEW Local 1852" },
      {
        name: "description",
        content:
          "A horizontal timeline of the labour movement in Cape Breton, Nova Scotia, and the story of IBEW Local 1852.",
      },
      { property: "og:title", content: "Cape Breton Union History — IBEW Local 1852" },
      {
        property: "og:description",
        content:
          "From the coal pits of Glace Bay to the linemen of IBEW Local 1852 — a scrollable timeline of Cape Breton labour.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Era = "early" | "coal" | "steel" | "modern" | "ibew";

interface TimelineEvent {
  year: string;
  title: string;
  body: string;
  era: Era;
  tag?: string;
}

const EVENTS: TimelineEvent[] = [
  {
    year: "1876",
    era: "early",
    title: "Provincial Workmen's Association founded",
    body: "Robert Drummond organizes the PWA in Springhill — the first lasting miners' union in Canada. Its lodges spread quickly through Cape Breton's coalfields.",
  },
  {
    year: "1882",
    era: "coal",
    title: "PWA reaches Cape Breton coalfields",
    body: "Lodges open across Glace Bay, Sydney Mines and Reserve Mines, giving Cape Breton miners their first collective voice against the coal operators.",
  },
  {
    year: "1891",
    era: "early",
    tag: "Legislation",
    title: "Nova Scotia Mines Regulation Act",
    body: "After years of PWA lobbying, the province passes safety rules on ventilation, checkweighmen and boy labour — a rare early legislative win for organized labour.",
  },
  {
    year: "1901",
    era: "steel",
    title: "Dominion Iron & Steel opens in Sydney",
    body: "The Sydney steel plant fires up, drawing thousands of workers from across the Maritimes, Newfoundland and beyond. A new industrial working class takes shape.",
  },
  {
    year: "1909",
    era: "coal",
    tag: "Strike",
    title: "UMW strike against Dominion Coal",
    body: "The United Mine Workers of America challenges the PWA and Dominion Coal. Troops are sent to Glace Bay; strikers are evicted from company houses. The strike is broken, but the UMW takes root.",
  },
  {
    year: "1917",
    era: "coal",
    title: "UMW District 26 recognized",
    body: "After years of dual unionism, District 26 of the UMWA becomes the recognized union of Nova Scotia coal miners, absorbing what remained of the PWA.",
  },
  {
    year: "1922",
    era: "coal",
    tag: "Strike",
    title: "\"Standing the Gaff\"",
    body: "BESCO slashes wages by up to a third. Miners strike under the slogan \"Standing the Gaff.\" J.B. McLachlan and Dan Livingstone lead a militant District 26.",
  },
  {
    year: "1923",
    era: "steel",
    tag: "Strike",
    title: "Sydney steelworkers' strike",
    body: "Provincial police charge strikers and residents on a Sunday evening in Whitney Pier — \"Bloody Sunday.\" Miners walk out in sympathy; McLachlan is jailed for seditious libel.",
  },
  {
    year: "1925",
    era: "coal",
    tag: "Strike",
    title: "The death of William Davis",
    body: "During a five-month strike against BESCO, company police shoot miner William Davis at Waterford Lake, New Waterford. June 11 is still marked as Davis Day across Cape Breton.",
  },
  {
    year: "1935",
    era: "steel",
    title: "Steelworkers organize in Sydney",
    body: "Sydney steelworkers begin organizing under what will become the United Steelworkers, winning recognition at the Sydney plant by the early 1940s (Local 1064).",
  },
  {
    year: "1946",
    era: "modern",
    tag: "IBEW",
    title: "IBEW Local 1852 chartered",
    body: "The International Brotherhood of Electrical Workers charters Local 1852 to represent electrical workers on Cape Breton Island — linemen, powerhouse operators and inside wiremen serving a rapidly electrifying region.",
  },
  {
    year: "1947",
    era: "modern",
    title: "Nova Scotia Power expands island-wide",
    body: "Post-war rural electrification pushes lines into every corner of Cape Breton and northern mainland Nova Scotia. IBEW 1852 members string the wire that lights the coast.",
  },
  {
    year: "1967",
    era: "coal",
    title: "DEVCO takes over the coal mines",
    body: "The Cape Breton Development Corporation is created to wind down and modernize the coal industry after Dominion Steel and Coal Corporation pulls out. Union locals fight to protect jobs.",
  },
  {
    year: "1967",
    era: "steel",
    title: "\"Parade of Concern\"",
    body: "20,000 people march in Sydney after Hawker Siddeley announces it will close the steel plant. The province takes it over as Sydney Steel Corporation (Sysco).",
  },
  {
    year: "1972",
    era: "modern",
    tag: "IBEW",
    title: "IBEW 1852 through the NS Power era",
    body: "As the province consolidates utilities into Nova Scotia Power Corporation, Local 1852 becomes the core union for line and trades workers across Cape Breton and eastern Nova Scotia.",
  },
  {
    year: "1992",
    era: "modern",
    tag: "IBEW",
    title: "Privatization of Nova Scotia Power",
    body: "NSPC is privatized into Nova Scotia Power Inc. IBEW 1852 negotiates through the transition, protecting pensions, seniority and the trades classifications members had built over decades.",
  },
  {
    year: "2001",
    era: "steel",
    title: "Sysco closes",
    body: "The Sydney steel plant shuts down for good, ending a century of steelmaking on the harbour and leaving the tar ponds cleanup as its legacy.",
  },
  {
    year: "2001",
    era: "coal",
    title: "The last deep mine closes",
    body: "Prince Colliery in Point Aconi is shuttered, ending large-scale underground coal mining in Cape Breton — the industry that built the island's unions.",
  },
  {
    year: "2003",
    era: "modern",
    tag: "IBEW",
    title: "Storms, restorations, mutual aid",
    body: "Hurricane Juan and later White Juan test the grid. IBEW 1852 crews work around the clock and host mutual-aid crews from across North America — a tradition that repeats with every major storm.",
  },
  {
    year: "2019",
    era: "modern",
    tag: "IBEW",
    title: "Hurricane Dorian",
    body: "Dorian knocks out power to over 400,000 Nova Scotians. Local 1852 line crews lead one of the largest restorations in provincial history.",
  },
  {
    year: "2022",
    era: "modern",
    tag: "IBEW",
    title: "Hurricane Fiona",
    body: "Fiona devastates Cape Breton. IBEW 1852 members rebuild the grid pole by pole alongside mutual-aid crews from Ontario, Quebec, New Brunswick and Maine.",
  },
  {
    year: "Today",
    era: "ibew",
    tag: "IBEW 1852",
    title: "Powering Cape Breton",
    body: "From the PWA lodges of the 1880s to linemen climbing in a January nor'easter, the through-line is the same: workers on this island organized, and stayed organized. IBEW Local 1852 carries that forward.",
  },
];

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

function Index() {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollWidth - el.clientWidth;
      setProgress(max > 0 ? el.scrollLeft / max : 0);
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });

    // Enable horizontal scroll via vertical wheel on desktop
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
  }, []);

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div
      className="min-h-screen text-foreground"
      style={{
        // Local design tokens for era colors, so we don't hardcode in components.
        // Coal black, steel amber, sea/modern teal, IBEW electric.
        // Kept scoped to this page.
        // eslint-disable-next-line @typescript-eslint/consestent-type-assertions
        ["--era-early" as string]: "oklch(0.55 0.09 40)",
        ["--era-coal" as string]: "oklch(0.35 0.02 260)",
        ["--era-steel" as string]: "oklch(0.62 0.16 55)",
        ["--era-modern" as string]: "oklch(0.55 0.12 200)",
        ["--era-ibew" as string]: "oklch(0.72 0.19 85)",
        backgroundColor: "var(--color-background)",
      }}
    >
      <div className="mx-auto max-w-7xl px-6 pt-12 pb-6 sm:pt-16">
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

        <div className="mt-8 flex flex-wrap gap-2">
          {(Object.keys(ERA_META) as Era[]).map((era) => (
            <span
              key={era}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${ERA_META[era].chip}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${ERA_META[era].dot}`} />
              {ERA_META[era].label}
            </span>
          ))}
        </div>

        <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-[color:var(--era-ibew)] transition-[width] duration-150"
            style={{ width: `${Math.max(4, progress * 100)}%` }}
          />
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="relative w-full overflow-x-auto overflow-y-hidden pb-16"
        style={{ scrollbarWidth: "thin" }}
      >
        <div className="relative min-w-max px-6 pt-10">
          {/* Rail */}
          <div className="pointer-events-none absolute left-6 right-6 top-[168px] h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          <ol className="relative flex items-stretch gap-6">
            {EVENTS.map((e, i) => {
              const meta = ERA_META[e.era];
              const above = i % 2 === 0;
              return (
                <li
                  key={`${e.year}-${e.title}`}
                  className="relative flex w-[320px] shrink-0 flex-col sm:w-[360px]"
                >
                  {above ? (
                    <>
                      <EventCard event={e} meta={meta} />
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
                      <div className="min-h-[240px]" />
                      <div className="relative flex h-[72px] items-end justify-center">
                        <span
                          className={`absolute top-0 h-3 w-3 rounded-full ring-4 ring-background ${meta.dot}`}
                        />
                        <div className={`h-full w-px ${meta.dot}`} />
                      </div>
                      <YearLabel year={e.year} meta={meta} />
                      <EventCard event={e} meta={meta} className="mt-4" />
                    </>
                  )}
                </li>
              );
            })}
          </ol>
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
  className = "",
}: {
  event: TimelineEvent;
  meta: (typeof ERA_META)[Era];
  className?: string;
}) {
  return (
    <article
      className={`group relative flex min-h-[240px] flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${className}`}
    >
      <div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${meta.chip}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
            {event.tag ?? meta === ERA_META.ibew ? event.tag ?? "IBEW 1852" : meta.label}
          </span>
        </div>
        <h3 className="mt-3 text-lg font-bold leading-snug text-card-foreground">
          {event.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{event.body}</p>
      </div>
    </article>
  );
}
