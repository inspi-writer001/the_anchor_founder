import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Boxes,
  CalendarDays,
  Copy,
  Database,
  ExternalLink,
  PlayCircle,
  Video,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  fallbackLandingData,
  type ArticleRecord,
  type EpisodeLink,
  type EpisodeRecord,
  type LandingData,
} from "../../data/archive";
import { classNames } from "../lib/admin";

type ArchiveMode = "landing" | "spotlights" | "archive";

function CardFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={classNames(
        "relative h-[400px] w-[384px] overflow-hidden rounded-[12px] border border-white/10 shadow-panel",
        className,
      )}
    >
      {children}
    </article>
  );
}

function parseArchiveRoute() {
  const pathname =
    typeof window === "undefined" ? "/" : window.location.pathname.replace(/\/+$/, "") || "/";
  const segments = pathname.split("/").filter(Boolean);

  if (!segments.length) {
    return { mode: "landing" as ArchiveMode, selectedIssue: null };
  }

  if (segments[0] === "spotlights") {
    return { mode: "spotlights" as ArchiveMode, selectedIssue: segments[1] ? `#${segments[1]}` : null };
  }

  if (segments[0] === "archive") {
    return { mode: "archive" as ArchiveMode, selectedIssue: segments[1] ? `#${segments[1]}` : null };
  }

  return { mode: "landing" as ArchiveMode, selectedIssue: null };
}

function navigateTo(pathname: string) {
  if (typeof window === "undefined") {
    return;
  }

  if (window.location.pathname === pathname) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  window.history.pushState({}, "", pathname);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function findYoutubeLink(episode: EpisodeRecord): EpisodeLink | undefined {
  return episode.links.find((link) => link.platform === "youtube");
}

function toEmbedUrl(url: string) {
  const short = url.match(/youtu\.be\/([^?&/]+)/);
  if (short?.[1]) {
    return `https://www.youtube.com/embed/${short[1]}?autoplay=1&rel=0`;
  }

  const watch = url.match(/[?&]v=([^?&/]+)/);
  if (watch?.[1]) {
    return `https://www.youtube.com/embed/${watch[1]}?autoplay=1&rel=0`;
  }

  const live = url.match(/\/live\/([^?&/]+)/);
  if (live?.[1]) {
    return `https://www.youtube.com/embed/${live[1]}?autoplay=1&rel=0`;
  }

  return null;
}

function LinkPills({ episode }: { episode: EpisodeRecord }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {episode.links.slice(0, 2).map((link) => (
        <a
          key={link.url}
          href={link.url}
          target="_blank"
          rel="noreferrer"
          onClick={(event) => event.stopPropagation()}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/6 px-2.5 py-1 font-barlow text-[9px] uppercase tracking-[0.16em] text-[#f3ead8]/78 transition hover:bg-white/10"
        >
          {link.label}
          <ExternalLink className="h-3 w-3" />
        </a>
      ))}
    </div>
  );
}

function HeroCard({ data }: { data: LandingData }) {
  return (
    <CardFrame className="bg-[#120f0b]">
      <img
        src="/the-anchor-founder.png"
        alt="The Anchor Founder artwork"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,10,8,0.1)_0%,rgba(12,10,8,0.58)_44%,rgba(12,10,8,0.94)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(169,201,191,0.16),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(214,160,107,0.18),transparent_38%)]" />

      <div className="relative z-10 flex h-full flex-col justify-between p-7">
        <div>
          <p className="mb-3 mt-2 font-condiment text-[20px] text-[#d6a06b]">
            {data.tagline}
          </p>
          <h1 className="font-grotesk text-[44px] uppercase leading-[0.92] tracking-tight text-[#f5ecdc]">
            The
            <br />
            Anchor
            <br />
            Founder
          </h1>
          <p className="mt-4 max-w-[252px] font-barlow text-[12px] leading-relaxed text-[#f3ead8]/72">
            {data.heroBlurb}
          </p>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className="font-inter text-[28px] font-semibold leading-none text-[#f5ecdc]">
              {data.issueCount}
            </div>
            <div className="mt-1 font-barlow text-[10px] uppercase tracking-[0.22em] text-[#c8b89d]">
              Archived Issues
            </div>
          </div>
          <div className="rounded-full border border-[#d6a06b]/30 bg-[#d6a06b]/10 px-3 py-1.5 font-barlow text-[10px] uppercase tracking-[0.18em] text-[#eadcc2]">
            {data.dateRange}
          </div>
        </div>
      </div>
    </CardFrame>
  );
}

function SpotlightCard({ sessions }: { sessions: EpisodeRecord[] }) {
  return (
    <button
      type="button"
      onClick={() => navigateTo("/spotlights")}
      className="block text-left"
    >
      <CardFrame className="bg-[#17120e] bg-[radial-gradient(circle_at_top,rgba(214,160,107,0.2),transparent_52%)] p-7 transition hover:translate-y-[-2px]">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))]" />
        <div className="relative z-10 flex h-full flex-col">
          <div className="mb-6 flex items-center gap-2">
            <Video className="h-4 w-4 text-[#d6a06b]" />
            <span className="font-barlow text-[10px] uppercase tracking-[0.24em] text-[#c8b89d]">
              Spotlight Series
            </span>
          </div>

          <h2 className="font-instrument text-[38px] leading-[0.92] tracking-tight text-[#f5ecdc]">
            Five Hours of Solana.
            <br />
            <span className="text-[#c8b89d]">Three Days of DeFi.</span>
          </h2>

          <div className="mt-6 space-y-3">
            {sessions.map((session) => (
              <div
                key={session.issue}
                className="liquid-glass rounded-[18px] px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-inter text-[11px] font-semibold text-[#f5ecdc]">
                    {session.issue}
                  </span>
                  <span className="font-barlow text-[10px] uppercase tracking-[0.18em] text-[#c8b89d]">
                    {session.dateLabel}
                  </span>
                </div>
                <div className="mt-1 font-inter text-[13px] font-medium leading-snug text-white">
                  {session.title}
                </div>
                <div className="mt-1 font-instrument text-[15px] italic text-[#a9c9bf]">
                  {session.subtitle}
                </div>
                <LinkPills episode={session} />
              </div>
            ))}
          </div>
        </div>
      </CardFrame>
    </button>
  );
}

function LatestIssuesCard({ issues }: { issues: EpisodeRecord[] }) {
  return (
    <button
      type="button"
      onClick={() => navigateTo("/archive")}
      className="block text-left"
    >
      <CardFrame className="bg-[#f3ead8] text-[#18130f] transition hover:translate-y-[-2px]">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(234,220,194,0.92))]" />
        <div className="absolute inset-x-0 bottom-0 top-[142px] bg-[url('/the-anchor-founder.png')] bg-cover bg-center opacity-[0.12]" />

        <div className="relative z-10 flex h-full flex-col p-7">
          <div className="mb-5 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-[#6f533b]" />
            <span className="font-barlow text-[10px] uppercase tracking-[0.24em] text-[#6f533b]">
              Latest Archive
            </span>
          </div>

          <h2 className="font-inter text-[34px] font-semibold leading-[0.96] tracking-[-0.04em] text-[#18130f]">
            Current
            <br />
            releases,
            <br />
            <span className="font-instrument font-normal italic text-[#6f533b]">
              founder-first.
            </span>
          </h2>

          <div className="mt-6 space-y-3">
            {issues.map((entry) => (
              <div
                key={entry.issue}
                className="rounded-[18px] border border-[#6f533b]/12 bg-white/56 px-4 py-3 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-inter text-[11px] font-semibold">
                    {entry.issue}
                  </span>
                  <span className="font-barlow text-[10px] uppercase tracking-[0.18em] text-[#6f533b]">
                    {entry.dateLabel}
                  </span>
                </div>
                <div className="mt-1 font-inter text-[13px] font-semibold leading-snug">
                  {entry.subtitle}
                </div>
                <div className="mt-1 text-[11px] leading-relaxed text-[#5a4a3d]">
                  {entry.summary}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardFrame>
    </button>
  );
}

function TopicsCard({ topics }: { topics: string[] }) {
  return (
    <CardFrame className="bg-[#15110d] p-7">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(169,201,191,0.14),transparent_38%),radial-gradient(circle_at_top_left,rgba(214,160,107,0.1),transparent_32%)]" />
      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-5 flex items-center gap-2">
          <Boxes className="h-4 w-4 text-[#a9c9bf]" />
          <span className="font-barlow text-[10px] uppercase tracking-[0.24em] text-[#c8b89d]">
            Topic Surface
          </span>
        </div>

        <h2 className="font-poppins text-[33px] font-medium leading-[0.95] tracking-[-0.04em] text-[#f5ecdc]">
          Real Solana
          <br />
          builder
          <br />
          <span className="font-source-serif font-medium italic text-[#a9c9bf]">
            territory.
          </span>
        </h2>

        <div className="mt-6 flex flex-wrap gap-2.5">
          {topics.map((topic) => (
            <span
              key={topic}
              className="liquid-glass rounded-full px-3 py-1.5 font-barlow text-[10px] uppercase tracking-[0.16em] text-[#f3ead8]/84"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>
    </CardFrame>
  );
}

function TimelineCard({ data }: { data: LandingData }) {
  return (
    <CardFrame className="bg-[#f5ecdc] p-7 text-[#18130f]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(184,138,90,0.12),transparent_48%)]" />
      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-5 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-[#6f533b]" />
          <span className="font-barlow text-[10px] uppercase tracking-[0.24em] text-[#6f533b]">
            Release Arc
          </span>
        </div>

        <h2 className="font-instrument text-[36px] leading-[0.92] tracking-tight">
          From hooks
          <br />
          to lending,
          <br />
          <span className="italic text-[#6f533b]">without filler.</span>
        </h2>

        <div className="mt-6 space-y-3">
          {data.timeline.map((item) => (
            <div key={item.label} className="grid grid-cols-[88px_1fr] gap-3">
              <div className="font-barlow text-[10px] uppercase tracking-[0.18em] text-[#8f7f6a]">
                {item.label}
              </div>
              <div className="text-[11px] leading-relaxed text-[#3b3026]">
                {item.body}
              </div>
            </div>
          ))}
        </div>
      </div>
    </CardFrame>
  );
}

function NotesCard({ data }: { data: LandingData }) {
  return (
    <CardFrame className="bg-[#130f0c] p-7">
      <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.02),rgba(255,255,255,0)),radial-gradient(circle_at_top_right,rgba(169,201,191,0.1),transparent_28%)]" />
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div>
          <div className="mb-5 flex items-center gap-2">
            <Database className="h-4 w-4 text-[#d6a06b]" />
            <span className="font-barlow text-[10px] uppercase tracking-[0.24em] text-[#c8b89d]">
              Archive Notes
            </span>
          </div>

          <h2 className="font-inter text-[32px] font-semibold leading-[0.96] tracking-[-0.04em] text-[#f5ecdc]">
            The missing
            <br />
            early broadcasts
            <br />
            <span className="font-instrument font-normal italic text-[#c8b89d]">
              accounted for.
            </span>
          </h2>

          <div className="mt-5 space-y-3 text-[11px] leading-relaxed text-[#c8b89d]">
            {data.archiveNotes.map((note) => (
              <p key={note}>{note}</p>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="rounded-full px-3 py-1.5 font-barlow text-[10px] uppercase tracking-[0.18em] text-[#a9c9bf]" />
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5">
            <ArrowRight className="h-4 w-4 text-[#f5ecdc]" />
          </div>
        </div>
      </div>
    </CardFrame>
  );
}

function ArticlesWideCard({ articles }: { articles: ArticleRecord[] }) {
  return (
    <article className="col-span-3 overflow-hidden rounded-[12px] border border-white/10 bg-[#0f0e0d]/92 shadow-panel">
      <div className="border-b border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0))] px-7 py-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-barlow text-[10px] uppercase tracking-[0.24em] text-[#c8b89d]">
              Articles
            </p>
            <h2 className="mt-2 font-instrument text-[36px] leading-none text-[#f5ecdc]">
              Writing beneath the archive.
            </h2>
          </div>
          <div className="rounded-full border border-[#d6a06b]/20 bg-[#d6a06b]/8 px-3 py-1.5 font-barlow text-[10px] uppercase tracking-[0.18em] text-[#eadcc2]">
            Long-form notes
          </div>
        </div>
      </div>

      {articles.length ? (
        <div className="grid grid-cols-4 gap-4 p-6">
          {articles.map((article) => (
            <a
              key={article.slug}
              href={article.articleUrl}
              target="_blank"
              rel="noreferrer"
              className="group overflow-hidden rounded-[18px] border border-white/8 bg-black/30 transition hover:border-white/16 hover:bg-black/40"
            >
              <div className="aspect-[2.45] overflow-hidden bg-[#1a1612]">
                {article.imageUrl ? (
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(214,160,107,0.18),transparent_52%)] font-barlow text-[10px] uppercase tracking-[0.2em] text-[#c8b89d]">
                    Awaiting screenshot
                  </div>
                )}
              </div>
              <div className="space-y-2 px-3.5 py-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-barlow text-[9px] uppercase tracking-[0.16em] text-[#8f7f6a]">
                    {article.sourceLabel}
                  </span>
                  <span className="font-barlow text-[9px] uppercase tracking-[0.16em] text-[#c8b89d]">
                    {article.dateLabel}
                  </span>
                </div>
                <h3 className="font-inter text-[15px] font-semibold leading-snug text-[#f5ecdc]">
                  {article.title}
                </h3>
                <p className="text-[11px] leading-relaxed text-[#c8b89d]">
                  {article.excerpt}
                </p>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="px-7 py-10">
          <div className="rounded-[20px] border border-dashed border-white/12 bg-white/[0.02] px-6 py-12 text-center">
            <p className="font-inter text-[16px] text-[#f5ecdc]">
              No articles yet.
            </p>
            <p className="mt-2 text-[12px] text-[#8f7f6a]">
              Use `/admin` to upload article screenshots and connect each one to
              its article URL.
            </p>
          </div>
        </div>
      )}
    </article>
  );
}

function ArchiveWatchPage({
  title,
  eyebrow,
  episodes,
  selectedIssue,
}: {
  title: string;
  eyebrow: string;
  episodes: EpisodeRecord[];
  selectedIssue: string | null;
}) {
  const sortedEpisodes = useMemo(
    () => [...episodes].sort((left, right) => right.number - left.number),
    [episodes],
  );
  const selectedEpisode =
    sortedEpisodes.find((episode) => episode.issue === selectedIssue) ??
    sortedEpisodes[0];
  const youtubeLink = selectedEpisode ? findYoutubeLink(selectedEpisode) : undefined;
  const embedUrl = youtubeLink ? toEmbedUrl(youtubeLink.url) : null;

  return (
    <div className="min-h-screen bg-[#120d09] px-6 py-8 text-[#f5ecdc]">
      <div className="mx-auto max-w-[1480px] space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-barlow text-[10px] uppercase tracking-[0.24em] text-[#c8b89d]">
              {eyebrow}
            </div>
            <h1 className="mt-2 font-inter text-[38px] font-semibold tracking-[-0.05em] text-[#f5ecdc]">
              {title}
            </h1>
          </div>
          <button
            type="button"
            onClick={() => navigateTo("/")}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 font-barlow text-[11px] uppercase tracking-[0.18em] text-[#f5ecdc]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back home
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.9fr)_220px]">
          <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#1a120d] shadow-panel">
            <div className="border-b border-white/8 px-6 py-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-barlow text-[10px] uppercase tracking-[0.2em] text-[#c8b89d]">
                    {selectedEpisode?.issue} • {selectedEpisode?.dateLabel}
                  </div>
                  <h2 className="mt-2 font-inter text-[28px] font-semibold leading-tight text-[#f5ecdc]">
                    {selectedEpisode?.subtitle}
                  </h2>
                  <p className="mt-3 max-w-[720px] text-[13px] leading-relaxed text-[#c8b89d]">
                    {selectedEpisode?.summary}
                  </p>
                </div>
                {youtubeLink && (
                  <a
                    href={youtubeLink.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#d6a06b]/22 bg-[#d6a06b]/10 px-4 py-2 font-barlow text-[11px] uppercase tracking-[0.18em] text-[#eadcc2]"
                  >
                    Open in YouTube
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>

            <div className="p-6">
              {embedUrl ? (
                <div className="overflow-hidden rounded-[24px] border border-white/8 bg-black">
                  <div className="aspect-video w-full">
                    <iframe
                      src={embedUrl}
                      title={selectedEpisode?.subtitle ?? "Video player"}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              ) : (
                <div className="flex aspect-video items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-black/30">
                  <div className="text-center">
                    <p className="font-inter text-[18px] text-[#f5ecdc]">No embeddable video found</p>
                    <p className="mt-2 text-[13px] text-[#8f7f6a]">
                      This episode does not currently have a YouTube link to embed.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-[#15110d] p-3 shadow-panel">
            <div className="mb-3 flex items-center gap-2 px-1.5">
              <PlayCircle className="h-3.5 w-3.5 text-[#d6a06b]" />
              <span className="font-barlow text-[9px] uppercase tracking-[0.2em] text-[#c8b89d]">
                Session list
              </span>
            </div>
            <div className="max-h-[760px] space-y-2 overflow-auto pr-1">
              {sortedEpisodes.map((episode) => {
                const href =
                  eyebrow === "Spotlights" ? `/spotlights/${episode.issue.slice(1)}` : `/archive/${episode.issue.slice(1)}`;
                const active = selectedEpisode?.issue === episode.issue;
                return (
                  <button
                    type="button"
                    key={episode.issue}
                    onClick={() => navigateTo(href)}
                    className={classNames(
                      "block w-full rounded-[16px] border px-3 py-3 text-left transition",
                      active
                        ? "border-[#d6a06b]/26 bg-[#d6a06b]/10"
                        : "border-white/8 bg-white/[0.02] hover:bg-white/[0.04]",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-barlow text-[9px] uppercase tracking-[0.16em] text-[#c8b89d]">
                        {episode.issue}
                      </span>
                      <span className="font-barlow text-[9px] uppercase tracking-[0.16em] text-[#8f7f6a]">
                        {episode.dateLabel}
                      </span>
                    </div>
                    <div className="mt-1.5 font-inter text-[13px] font-semibold leading-snug text-[#f5ecdc]">
                      {episode.subtitle}
                    </div>
                    <div className="mt-1 text-[11px] leading-relaxed text-[#8f7f6a]">
                      {episode.title}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ArchiveLanding({
  data,
  live,
}: {
  data: LandingData;
  live: boolean;
}) {
  const [copiedTipAddress, setCopiedTipAddress] = useState(false);
  const tipAddress = "3VTFkwREXHkU2H1M6AsGjjoiRGXphJ8MyWjnMTFEtXAY";

  return (
    <div
      className="flex min-h-screen items-center justify-center overflow-auto px-6 py-12"
      style={{
        backgroundImage:
          'linear-gradient(180deg, rgba(10,8,6,0.68) 0%, rgba(10,8,6,0.88) 100%), url("/the-anchor-founder.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(214,160,107,0.2),transparent_22%),radial-gradient(circle_at_82%_18%,rgba(169,201,191,0.14),transparent_18%),radial-gradient(circle_at_bottom,rgba(111,83,59,0.24),transparent_30%)]" />
      <div className="fixed bottom-5 left-5 z-20 group">
        <div className="absolute bottom-full left-0 mb-3 w-[340px] translate-y-1 rounded-[16px] border border-white/10 bg-[#15110d]/96 px-4 py-3 opacity-0 shadow-panel transition duration-200 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="font-barlow text-[10px] uppercase tracking-[0.2em] text-[#c8b89d]">
            Tip the Crab Maintainer
          </div>
          <div className="mt-2 flex items-start gap-3">
            <div className="min-w-0 break-all font-mono text-[12px] leading-relaxed text-[#f5ecdc]">
              {tipAddress}
            </div>
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(tipAddress);
                setCopiedTipAddress(true);
                window.setTimeout(() => setCopiedTipAddress(false), 1200);
              }}
              className="shrink-0 rounded-full border border-white/10 bg-white/5 p-2 text-[#f5ecdc] transition hover:bg-white/10"
              aria-label="Copy tip address"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mt-2 text-[11px] text-[#8f7f6a]">
            {copiedTipAddress
              ? "Copied to clipboard"
              : "Hover here and click copy."}
          </div>
        </div>
        <span
          className={classNames(
            "block cursor-default text-[30px] leading-none transition duration-300",
            !live && "grayscale opacity-60",
          )}
          aria-hidden="true"
        >
          🦀
        </span>
      </div>

      <div
        className="relative z-10 grid shrink-0 gap-4"
        style={{ gridTemplateColumns: "repeat(3, 384px)" }}
      >
        <HeroCard data={data} />
        <SpotlightCard sessions={data.spotlightSessions} />
        <LatestIssuesCard issues={data.latestIssues} />
        <TopicsCard topics={data.topicClusters} />
        <TimelineCard data={data} />
        <NotesCard data={data} />
        <ArticlesWideCard articles={data.articles} />
      </div>
    </div>
  );
}

function ArchiveRouter({ data, live }: { data: LandingData; live: boolean }) {
  const [route, setRoute] = useState(parseArchiveRoute);

  useEffect(() => {
    const syncRoute = () => setRoute(parseArchiveRoute());
    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);

  if (route.mode === "spotlights") {
    return (
      <ArchiveWatchPage
        title="Spotlights"
        eyebrow="Spotlights"
        episodes={data.spotlightSessions}
        selectedIssue={route.selectedIssue}
      />
    );
  }

  if (route.mode === "archive") {
    return (
      <ArchiveWatchPage
        title="Archive"
        eyebrow="Latest archive"
        episodes={data.allEpisodes.filter((episode) => episode.series === "issue")}
        selectedIssue={route.selectedIssue}
      />
    );
  }

  return <ArchiveLanding data={data} live={live} />;
}

export function ConvexArchive() {
  const liveData = useQuery(api.content.getLandingData, {}) as
    | LandingData
    | undefined;
  const data = liveData ?? fallbackLandingData;
  return <ArchiveRouter data={data} live={Boolean(liveData)} />;
}

export function StaticArchive() {
  return <ArchiveRouter data={fallbackLandingData} live={false} />;
}
