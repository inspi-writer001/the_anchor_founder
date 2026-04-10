import { makeFunctionReference } from "convex/server";
import type { ArticleRecord, EpisodeRecord } from "../../data/archive";

export type AdminLink = {
  platform: "x" | "youtube";
  label: string;
  url: string;
};

export type AdminEpisode = EpisodeRecord & {
  _id: string;
  _creationTime: number;
};

export type AdminArticle = {
  _id: string;
  _creationTime: number;
  title: string;
  slug: string;
  dateLabel: string;
  dateISO: string;
  excerpt: string;
  articleUrl: string;
  sourceLabel: string;
  imageStorageId?: string;
  imageUrl: string | null;
};

export type DashboardData = {
  episodes: AdminEpisode[];
  articles: AdminArticle[];
};

export type SignedAdminAuth = {
  address: string;
  nonce: string;
  message: string;
  signature: number[];
};

export type EpisodeFormState = {
  number: string;
  issue: string;
  dateLabel: string;
  dateISO: string;
  title: string;
  subtitle: string;
  summary: string;
  year: string;
  series: "issue" | "spotlight";
  archiveState: "available" | "x_removed";
  topicsText: string;
  linksText: string;
};

export type ArticleFormState = {
  title: string;
  slug: string;
  dateLabel: string;
  dateISO: string;
  excerpt: string;
  articleUrl: string;
  sourceLabel: string;
};

export const emptyEpisodeForm: EpisodeFormState = {
  number: "",
  issue: "",
  dateLabel: "",
  dateISO: "",
  title: "",
  subtitle: "",
  summary: "",
  year: "",
  series: "issue",
  archiveState: "available",
  topicsText: "",
  linksText: "",
};

export const emptyArticleForm: ArticleFormState = {
  title: "",
  slug: "",
  dateLabel: "",
  dateISO: "",
  excerpt: "",
  articleUrl: "",
  sourceLabel: "X Article",
};

export const adminGetDashboardDataRef = makeFunctionReference<"query">(
  "admin:getDashboardData",
);
export const adminGetAdminGateRef = makeFunctionReference<"query">(
  "admin:getAdminGate",
);
export const adminCreateChallengeRef = makeFunctionReference<"mutation">(
  "admin:createAdminChallenge",
);
export const adminCreateEpisodeRef = makeFunctionReference<"action">(
  "adminActions:createEpisode",
);
export const adminUpdateEpisodeRef = makeFunctionReference<"action">(
  "adminActions:updateEpisode",
);
export const adminDeleteEpisodeRef = makeFunctionReference<"action">(
  "adminActions:deleteEpisode",
);
export const adminCreateArticleRef = makeFunctionReference<"action">(
  "adminActions:createArticle",
);
export const adminUpdateArticleRef = makeFunctionReference<"action">(
  "adminActions:updateArticle",
);
export const adminDeleteArticleRef = makeFunctionReference<"action">(
  "adminActions:deleteArticle",
);
export const adminGenerateUploadUrlRef = makeFunctionReference<"action">(
  "adminActions:generateUploadUrl",
);

export function classNames(
  ...parts: Array<string | false | null | undefined>
) {
  return parts.filter(Boolean).join(" ");
}

export function parseTopics(input: string) {
  return input
    .split(",")
    .map((topic) => topic.trim())
    .filter(Boolean);
}

export function linksToText(links: AdminLink[]) {
  return links.map((link) => `${link.platform}|${link.label}|${link.url}`).join("\n");
}

export function parseLinks(input: string): AdminLink[] {
  return input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line): AdminLink => {
      const [platformRaw, labelRaw, ...urlParts] = line.split("|");
      const platform: AdminLink["platform"] =
        platformRaw?.trim() === "youtube" ? "youtube" : "x";
      return {
        platform,
        label:
          labelRaw?.trim() ||
          (platform === "youtube" ? "YouTube" : "X Broadcast"),
        url: urlParts.join("|").trim(),
      };
    })
    .filter((link) => link.url.length > 0);
}

export function episodeToForm(episode: AdminEpisode): EpisodeFormState {
  return {
    number: String(episode.number),
    issue: episode.issue,
    dateLabel: episode.dateLabel,
    dateISO: episode.dateISO,
    title: episode.title,
    subtitle: episode.subtitle,
    summary: episode.summary,
    year: String(episode.year),
    series: episode.series,
    archiveState: episode.archiveState,
    topicsText: episode.topics.join(", "),
    linksText: linksToText(episode.links),
  };
}

export function articleToForm(article: AdminArticle): ArticleFormState {
  return {
    title: article.title,
    slug: article.slug,
    dateLabel: article.dateLabel,
    dateISO: article.dateISO,
    excerpt: article.excerpt,
    articleUrl: article.articleUrl,
    sourceLabel: article.sourceLabel,
  };
}

const MAX_ARTICLE_IMAGE_BYTES = 300 * 1024;

async function loadImageBitmap(file: File): Promise<HTMLImageElement> {
  return await new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load selected image."));
    };
    image.src = objectUrl;
  });
}

async function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number,
): Promise<Blob> {
  return await new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to compress image."));
          return;
        }
        resolve(blob);
      },
      type,
      quality,
    );
  });
}

export async function compressImageForUpload(file: File): Promise<File> {
  if (file.size <= MAX_ARTICLE_IMAGE_BYTES) {
    return file;
  }

  const image = await loadImageBitmap(file);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas is unavailable for image compression.");
  }

  let width = image.naturalWidth;
  let height = image.naturalHeight;
  const maxDimension = 1600;

  if (Math.max(width, height) > maxDimension) {
    const ratio = maxDimension / Math.max(width, height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0, width, height);

  let quality = 0.9;
  let currentWidth = width;
  let currentHeight = height;
  let blob = await canvasToBlob(canvas, "image/jpeg", quality);

  while (blob.size > MAX_ARTICLE_IMAGE_BYTES && quality > 0.45) {
    quality -= 0.08;
    blob = await canvasToBlob(canvas, "image/jpeg", quality);
  }

  while (
    blob.size > MAX_ARTICLE_IMAGE_BYTES &&
    currentWidth > 800 &&
    currentHeight > 800
  ) {
    currentWidth = Math.round(currentWidth * 0.9);
    currentHeight = Math.round(currentHeight * 0.9);
    canvas.width = currentWidth;
    canvas.height = currentHeight;
    ctx.drawImage(image, 0, 0, currentWidth, currentHeight);
    quality = Math.min(quality, 0.72);
    blob = await canvasToBlob(canvas, "image/jpeg", quality);
  }

  return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.jpg`, {
    type: "image/jpeg",
  });
}
