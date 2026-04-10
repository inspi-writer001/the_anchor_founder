export type EpisodeLink = {
  platform: "x" | "youtube";
  label: string;
  url: string;
};

export type EpisodeRecord = {
  number: number;
  issue: string;
  dateLabel: string;
  dateISO: string;
  title: string;
  subtitle: string;
  summary: string;
  year: number;
  series: "issue" | "spotlight";
  topics: string[];
  links: EpisodeLink[];
  archiveState: "available" | "x_removed";
};

export type TimelineEntry = {
  label: string;
  body: string;
};

export type ArticleRecord = {
  title: string;
  slug: string;
  dateLabel: string;
  dateISO: string;
  excerpt: string;
  articleUrl: string;
  sourceLabel: string;
  imageUrl: string | null;
};

export type LandingConfig = {
  tagline: string;
  heroBlurb: string;
  archiveNotesTitle: string;
  archiveNotes: string[];
  timeline: TimelineEntry[];
};

export type LandingData = {
  tagline: string;
  heroBlurb: string;
  issueCount: number;
  dateRange: string;
  allEpisodes: EpisodeRecord[];
  spotlightSessions: EpisodeRecord[];
  latestIssues: EpisodeRecord[];
  topicClusters: string[];
  timeline: TimelineEntry[];
  archiveNotesTitle: string;
  archiveNotes: string[];
  articles: ArticleRecord[];
};

export const seedEpisodes: EpisodeRecord[] = [
  {
    number: 1,
    issue: "#1",
    dateLabel: "Oct 7, 2025",
    dateISO: "2025-10-07",
    title: "the_anchor_founder x switched",
    subtitle: "Launch issue",
    summary: "The early session that kicked off the archive run.",
    year: 2025,
    series: "issue",
    topics: ["Anchor", "Founder Workflow"],
    archiveState: "x_removed",
    links: [
      {
        platform: "x",
        label: "X Broadcast",
        url: "https://x.com/i/broadcasts/1PlJQOdqMRyKE",
      },
    ],
  },
  {
    number: 2,
    issue: "#2",
    dateLabel: "Oct 8, 2025",
    dateISO: "2025-10-08",
    title: "Transfer Hooks and LiteSVM",
    subtitle: "Runtime testing and token extension flow",
    summary:
      "Working through transfer hooks while validating behavior with LiteSVM.",
    year: 2025,
    series: "issue",
    topics: ["Transfer Hooks", "LiteSVM", "Token Extensions"],
    archiveState: "x_removed",
    links: [
      {
        platform: "x",
        label: "X Broadcast",
        url: "https://x.com/i/broadcasts/1RDxlAORVlOKL",
      },
    ],
  },
  {
    number: 3,
    issue: "#3",
    dateLabel: "Oct 10, 2025",
    dateISO: "2025-10-10",
    title: "LiteSVM and Transfer hooks",
    subtitle: "Iteration on the hook pipeline",
    summary: "Continuation of token extension work with more LiteSVM coverage.",
    year: 2025,
    series: "issue",
    topics: ["LiteSVM", "Transfer Hooks"],
    archiveState: "x_removed",
    links: [
      {
        platform: "x",
        label: "X Broadcast",
        url: "https://x.com/i/broadcasts/1yNxabwYpWvKj",
      },
    ],
  },
  {
    number: 4,
    issue: "#4",
    dateLabel: "Oct 13, 2025",
    dateISO: "2025-10-13",
    title: "Transfer Hooks + Vault + LiteSVM",
    subtitle: "Vault mechanics join the stack",
    summary:
      "Combining transfer hooks, vault design, and local simulation workflows.",
    year: 2025,
    series: "issue",
    topics: ["Transfer Hooks", "Vaults", "LiteSVM"],
    archiveState: "x_removed",
    links: [
      {
        platform: "x",
        label: "X Broadcast",
        url: "https://x.com/i/broadcasts/1yNGabRAleWJj",
      },
    ],
  },
  {
    number: 5,
    issue: "#5",
    dateLabel: "Oct 15, 2025",
    dateISO: "2025-10-15",
    title: "LiteSVM + Transfer Hooks + Vault II",
    subtitle: "YouTube backups begin",
    summary:
      "The archive becomes durable from here onward with mirrored YouTube uploads.",
    year: 2025,
    series: "issue",
    topics: ["LiteSVM", "Transfer Hooks", "Vaults"],
    archiveState: "available",
    links: [
      {
        platform: "x",
        label: "X Broadcast",
        url: "https://x.com/i/broadcasts/1kvJpMZeMqPxE",
      },
      {
        platform: "youtube",
        label: "YouTube",
        url: "https://youtube.com/live/egFoRccG980?feature=share",
      },
    ],
  },
  {
    number: 6,
    issue: "#6",
    dateLabel: "Oct 17, 2025",
    dateISO: "2025-10-17",
    title: "VRF + ER [Magicblock] + signoff on Token extensions",
    subtitle: "Randomness and token extension review",
    summary:
      "Covering VRF mechanics, Magicblock tooling, and token extension signoff.",
    year: 2025,
    series: "issue",
    topics: ["VRF", "Magicblock", "Token Extensions"],
    archiveState: "available",
    links: [
      {
        platform: "x",
        label: "X Broadcast",
        url: "https://x.com/i/broadcasts/1jMKgRyzVyexL?s=20",
      },
      {
        platform: "youtube",
        label: "YouTube",
        url: "https://youtube.com/live/LQHc-HGRdSg?feature=share",
      },
    ],
  },
  {
    number: 7,
    issue: "#7",
    dateLabel: "Oct 20, 2025",
    dateISO: "2025-10-20",
    title: "solana-gpt + pinocchio escrow",
    subtitle: "AI-assisted Solana work and escrow patterns",
    summary:
      "Pairing solana-gpt workflows with early Pinocchio escrow exploration.",
    year: 2025,
    series: "issue",
    topics: ["Pinocchio", "Escrow", "AI Tooling"],
    archiveState: "available",
    links: [
      {
        platform: "x",
        label: "X Broadcast",
        url: "https://x.com/i/broadcasts/1OyJAjbeYzDxb?s=20",
      },
      {
        platform: "youtube",
        label: "YouTube",
        url: "https://youtube.com/live/a6p3dH9StkY?feature=share",
      },
    ],
  },
  {
    number: 8,
    issue: "#8",
    dateLabel: "Oct 21, 2025",
    dateISO: "2025-10-21",
    title: "pinocchio counter + escrow",
    subtitle: "Counter programs and state handling",
    summary: "Basic Pinocchio primitives paired with escrow mechanics.",
    year: 2025,
    series: "issue",
    topics: ["Pinocchio", "Escrow", "Counters"],
    archiveState: "available",
    links: [
      {
        platform: "x",
        label: "X Broadcast",
        url: "https://x.com/i/broadcasts/1RDGlAklBOgJL?s=20",
      },
      {
        platform: "youtube",
        label: "YouTube",
        url: "https://youtube.com/live/QfX1A5v0eEE?feature=share",
      },
    ],
  },
  {
    number: 9,
    issue: "#9",
    dateLabel: "Oct 22, 2025",
    dateISO: "2025-10-22",
    title: "porting Anchor fundraiser program to Pinocchio",
    subtitle: "Migration exercise",
    summary: "Moving a fundraiser program from Anchor into Pinocchio idioms.",
    year: 2025,
    series: "issue",
    topics: ["Anchor", "Pinocchio", "Fundraiser Programs"],
    archiveState: "available",
    links: [
      {
        platform: "x",
        label: "X Broadcast",
        url: "https://x.com/i/broadcasts/1djGXWYBdDzKZ?s=20",
      },
      {
        platform: "youtube",
        label: "YouTube",
        url: "https://youtube.com/live/PuzdiC1dq4M?feature=share",
      },
    ],
  },
  {
    number: 10,
    issue: "#10",
    dateLabel: "Oct 24, 2025",
    dateISO: "2025-10-24",
    title: "pinocchio Fundraiser - LiteSVM + bytemuck",
    subtitle: "Testing and memory layout",
    summary: "Fundraiser implementation details with LiteSVM and bytemuck.",
    year: 2025,
    series: "issue",
    topics: ["Pinocchio", "Fundraiser Programs", "LiteSVM", "Bytemuck"],
    archiveState: "available",
    links: [
      {
        platform: "x",
        label: "X Broadcast",
        url: "https://x.com/i/broadcasts/1gqxvrdZzAjxB?s=20",
      },
      {
        platform: "youtube",
        label: "YouTube",
        url: "https://youtube.com/live/wcHGaJ4qoGk?feature=share",
      },
    ],
  },
  {
    number: 11,
    issue: "#11",
    dateLabel: "Nov 12, 2025",
    dateISO: "2025-11-12",
    title: "Back to Basics I",
    subtitle: "solid Fundamentals on Solana",
    summary: "A fundamentals-first return after the travel break.",
    year: 2025,
    series: "issue",
    topics: ["Solana Fundamentals", "Anchor"],
    archiveState: "available",
    links: [
      {
        platform: "x",
        label: "X Broadcast",
        url: "https://x.com/i/broadcasts/1mrGmBekzAzJy?s=20",
      },
      {
        platform: "youtube",
        label: "YouTube",
        url: "https://youtube.com/live/CsLixWhuZqs?feature=share",
      },
    ],
  },
  {
    number: 12,
    issue: "#12",
    dateLabel: "Nov 13, 2025",
    dateISO: "2025-11-13",
    title: "Back to Basics II",
    subtitle: "write and test Anchor programs",
    summary: "Practical Anchor authoring and testing from scratch.",
    year: 2025,
    series: "issue",
    topics: ["Anchor", "Testing", "LiteSVM"],
    archiveState: "available",
    links: [
      {
        platform: "x",
        label: "X Broadcast",
        url: "https://x.com/i/broadcasts/1mnxeNELrXQKX?s=20",
      },
      {
        platform: "youtube",
        label: "YouTube",
        url: "https://youtube.com/live/GofTr6Xehfs?feature=share",
      },
    ],
  },
  {
    number: 13,
    issue: "#13",
    dateLabel: "Nov 14, 2025",
    dateISO: "2025-11-14",
    title: "Back to Basics III",
    subtitle: "write and integrate Anchor programs on the frontend",
    summary: "Frontend integration patterns for Anchor programs.",
    year: 2025,
    series: "issue",
    topics: ["Anchor", "Frontend Integration"],
    archiveState: "available",
    links: [
      {
        platform: "x",
        label: "X Broadcast",
        url: "https://x.com/i/broadcasts/1nAKEEBjQzVKL?s=20",
      },
      {
        platform: "youtube",
        label: "YouTube",
        url: "https://youtube.com/live/-AhIhmYkHIo?feature=share",
      },
    ],
  },
  {
    number: 14,
    issue: "#14",
    dateLabel: "Nov 17, 2025",
    dateISO: "2025-11-17",
    title: "Cleaning up a Pinocchio Rust SDK - Mojo",
    subtitle: "The ultimate state machine for building Games on Solana",
    summary: "Rust SDK cleanup work and Mojo state-machine discussion.",
    year: 2025,
    series: "issue",
    topics: ["Pinocchio", "Rust SDKs", "Games"],
    archiveState: "available",
    links: [
      {
        platform: "x",
        label: "X Broadcast",
        url: "https://x.com/i/broadcasts/1LyxBXBNXDaGN?s=20",
      },
      {
        platform: "youtube",
        label: "YouTube",
        url: "https://youtube.com/live/9CS3kr8c160?feature=share",
      },
    ],
  },
  {
    number: 15,
    issue: "#15",
    dateLabel: "Dec 1, 2025",
    dateISO: "2025-12-01",
    title: "Porting an Anchor program to Pinocchio",
    subtitle: "Beginner friendly",
    summary:
      "A beginner-accessible migration from Anchor patterns into Pinocchio.",
    year: 2025,
    series: "issue",
    topics: ["Anchor", "Pinocchio", "Program Porting"],
    archiveState: "available",
    links: [
      {
        platform: "x",
        label: "X Broadcast",
        url: "https://x.com/i/broadcasts/1kvJpMWqVyMxE?s=20",
      },
      {
        platform: "youtube",
        label: "YouTube",
        url: "https://youtube.com/live/RDHPuMBQHCA?feature=share",
      },
    ],
  },
  {
    number: 16,
    issue: "#16",
    dateLabel: "Dec 6, 2025",
    dateISO: "2025-12-06",
    title: "5 Hrs of Solana",
    subtitle: "Anchor and Pinocchio",
    summary:
      "An extended deep work session on the two major Solana program authoring paths.",
    year: 2025,
    series: "spotlight",
    topics: ["Anchor", "Pinocchio"],
    archiveState: "available",
    links: [
      {
        platform: "x",
        label: "X Broadcast",
        url: "https://x.com/i/broadcasts/1OwGWeWyDzDxQ?s=20",
      },
      {
        platform: "youtube",
        label: "YouTube",
        url: "https://youtube.com/live/WY0HOajz5bs?feature=share",
      },
    ],
  },
  {
    number: 17,
    issue: "#17",
    dateLabel: "Jan 13, 2026",
    dateISO: "2026-01-13",
    title: "3 Days of Defi x SolanaTurbine",
    subtitle: "AMM",
    summary:
      "AMM design and implementation under the SolanaTurbine collaboration.",
    year: 2026,
    series: "spotlight",
    topics: ["AMMs", "DeFi", "SolanaTurbine"],
    archiveState: "available",
    links: [
      {
        platform: "youtube",
        label: "YouTube Watch",
        url: "https://www.youtube.com/watch?v=mJNc7ZLKuKE",
      },
      {
        platform: "youtube",
        label: "YouTube Live",
        url: "https://www.youtube.com/live/fqdsVsR14pg?si=scN5ItCtah2FvxXs",
      },
    ],
  },
  {
    number: 18,
    issue: "#18",
    dateLabel: "Jan 15, 2026",
    dateISO: "2026-01-15",
    title: "3 Days of Defi x SolanaTurbine",
    subtitle: "Lending Protocol",
    summary:
      "A lending protocol session focused on DeFi primitives and execution.",
    year: 2026,
    series: "spotlight",
    topics: ["Lending", "DeFi", "SolanaTurbine"],
    archiveState: "available",
    links: [
      {
        platform: "youtube",
        label: "YouTube Live",
        url: "https://www.youtube.com/live/D_gd-Rn8WuM?si=0L5YhEg6WNnj7ihe",
      },
    ],
  },
  {
    number: 19,
    issue: "#19",
    dateLabel: "Jan 26, 2026",
    dateISO: "2026-01-26",
    title: "the_anchor_founder",
    subtitle: "wtf is zero-copy [pinocchio breaking changes]",
    summary:
      "Understanding zero-copy patterns while handling Pinocchio breaking changes.",
    year: 2026,
    series: "issue",
    topics: ["Zero-Copy", "Pinocchio"],
    archiveState: "available",
    links: [
      {
        platform: "x",
        label: "X Broadcast",
        url: "https://x.com/i/broadcasts/1djxXWlQLBOJZ",
      },
      {
        platform: "youtube",
        label: "YouTube",
        url: "https://youtube.com/live/zCUm3ULe5gA?feature=share",
      },
    ],
  },
  {
    number: 20,
    issue: "#20",
    dateLabel: "Feb 2, 2026",
    dateISO: "2026-02-02",
    title: "the_anchor_founder",
    subtitle: "Nighttime QnA edition",
    summary:
      "A QnA issue for founder and builder questions late into the cycle.",
    year: 2026,
    series: "issue",
    topics: ["QnA", "Founder Workflow"],
    archiveState: "available",
    links: [
      {
        platform: "x",
        label: "X Broadcast",
        url: "https://x.com/i/broadcasts/1YqKDNkYaDNJV",
      },
      {
        platform: "youtube",
        label: "YouTube",
        url: "https://youtube.com/live/XjiDoQra0JI?feature=share",
      },
    ],
  },
  {
    number: 21,
    issue: "#21",
    dateLabel: "Feb 10, 2026",
    dateISO: "2026-02-10",
    title: "the_anchor_founder",
    subtitle: "Token Extensions Accel QnA",
    summary: "Acceleration-focused token extension QnA for advanced builders.",
    year: 2026,
    series: "issue",
    topics: ["Token Extensions", "QnA"],
    archiveState: "available",
    links: [
      {
        platform: "x",
        label: "X Broadcast",
        url: "https://x.com/i/broadcasts/1LyxBXWRXRzGN",
      },
      {
        platform: "youtube",
        label: "YouTube",
        url: "https://youtube.com/live/XDaa0BNera0?feature=share",
      },
    ],
  },
] as const;

export const landingConfig: LandingConfig = {
  tagline: "For technical founders, coding CTOs, and great devs",
  heroBlurb:
    "A live archive of deep Solana sessions covering Anchor, Pinocchio, LiteSVM, token extensions, DeFi primitives, and the mechanics behind shipping serious products.",
  archiveNotesTitle: "The missing early broadcasts are accounted for.",
  archiveNotes: [
    "Issues #1 - #4 were originally hosted on X and later nuked.",
    "YouTube backup started on Oct 15, 2025, so the archive becomes durable from issue #5 onward.",
    "",
  ],
  timeline: [
    {
      label: "Oct 2025",
      body: "Launch run: transfer hooks, LiteSVM, vaults, VRF, escrow, fundraiser ports.",
    },
    {
      label: "Nov 2025",
      body: "Back to Basics: fundamentals, writing Anchor programs, and frontend integration.",
    },
    {
      label: "Dec 2025 - Jan 2026",
      body: "Pinocchio ports, 5 Hours of Solana, then SolanaTurbine AMM and lending sessions.",
    },
    {
      label: "Feb 2026",
      body: "QnA issues focused on token extensions and ecosystem acceleration topics.",
    },
  ],
};

export function buildLandingData(
  episodes: EpisodeRecord[],
  config: LandingConfig,
): LandingData {
  const byNumberAsc = [...episodes].sort((a, b) => a.number - b.number);
  const byNumberDesc = [...episodes].sort((a, b) => b.number - a.number);
  const spotlight = byNumberAsc.filter(
    (episode) => episode.series === "spotlight",
  );
  const latest = byNumberDesc
    .filter((episode) => episode.series === "issue")
    .slice(0, 3);
  const topicClusters = Array.from(
    new Set(byNumberDesc.flatMap((episode) => episode.topics)),
  );

  const first = byNumberAsc[0];
  const last = byNumberAsc[byNumberAsc.length - 1];
  const dateRange =
    first && last ? `${first.year} - ${last.year}` : "Archive in progress";

  return {
    tagline: config.tagline,
    heroBlurb: config.heroBlurb,
    issueCount: episodes.length,
    dateRange,
    allEpisodes: byNumberDesc,
    spotlightSessions: spotlight,
    latestIssues: latest,
    topicClusters,
    timeline: config.timeline,
    archiveNotesTitle: config.archiveNotesTitle,
    archiveNotes: config.archiveNotes,
    articles: [],
  };
}

export const fallbackLandingData = buildLandingData(
  seedEpisodes,
  landingConfig,
);
