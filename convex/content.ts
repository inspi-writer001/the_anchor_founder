import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import {
  type ArticleRecord,
  buildLandingData,
  landingConfig,
  seedEpisodes,
  type EpisodeRecord,
} from '../data/archive';

export const getLandingData = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const episodes = (await ctx.db.query('episodes').collect()) as EpisodeRecord[];
    const landing = await ctx.db.query('landing').first();
    const articlesRaw = await ctx.db.query('articles').withIndex('by_date').collect();
    const articles = (
      await Promise.all(
        articlesRaw
          .sort((a, b) => b.dateISO.localeCompare(a.dateISO))
          .map(async (article) => ({
            title: article.title,
            slug: article.slug,
            dateLabel: article.dateLabel,
            dateISO: article.dateISO,
            excerpt: article.excerpt,
            articleUrl: article.articleUrl,
            sourceLabel: article.sourceLabel,
            imageUrl: article.imageStorageId
              ? await ctx.storage.getUrl(article.imageStorageId)
              : null,
          })),
      )
    ) as ArticleRecord[];

    if (!episodes.length || !landing) {
      return {
        ...buildLandingData(seedEpisodes.slice(), landingConfig),
        articles,
      };
    }

    return {
      ...buildLandingData(episodes, landing),
      articles,
    };
  },
});

export const seedArchive = mutation({
  args: {},
  returns: v.object({
    insertedEpisodes: v.number(),
    insertedLanding: v.number(),
    skipped: v.boolean(),
  }),
  handler: async (ctx) => {
    const existing = await ctx.db.query('episodes').first();
    if (existing) {
      return { insertedEpisodes: 0, insertedLanding: 0, skipped: true };
    }

    await ctx.db.insert('landing', landingConfig);

    for (const episode of seedEpisodes) {
      await ctx.db.insert('episodes', episode);
    }

    return {
      insertedEpisodes: seedEpisodes.length,
      insertedLanding: 1,
      skipped: false,
    };
  },
});
