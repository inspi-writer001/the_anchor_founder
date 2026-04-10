import { v } from 'convex/values';
import { internalMutation, internalQuery, mutation, query } from './_generated/server';

function normalizeSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function getAdminAddress() {
  const address = process.env.ADMIN_WALLET_ADDRESS;
  if (!address) {
    throw new Error('ADMIN_WALLET_ADDRESS is not configured.');
  }
  return address;
}

function randomNonce() {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export const getAdminGate = query({
  args: {},
  returns: v.object({
    adminAddress: v.string(),
    enabled: v.boolean(),
  }),
  handler: async () => {
    const adminAddress = process.env.ADMIN_WALLET_ADDRESS ?? '';
    return {
      adminAddress,
      enabled: Boolean(adminAddress),
    };
  },
});

export const createAdminChallenge = mutation({
  args: {
    address: v.string(),
    action: v.string(),
  },
  returns: v.object({
    address: v.string(),
    nonce: v.string(),
    message: v.string(),
    expiresAt: v.number(),
  }),
  handler: async (ctx, args) => {
    const adminAddress = getAdminAddress();
    if (args.address !== adminAddress) {
      throw new Error('Unauthorized.');
    }

    const now = Date.now();
    const nonce = randomNonce();
    const expiresAt = now + 1000 * 60 * 5;
    const message = [
      'the_anchor_founder admin authorization',
      `action:${args.action}`,
      `address:${args.address}`,
      `nonce:${nonce}`,
      `expiresAt:${expiresAt}`,
    ].join('\n');

    await ctx.db.insert('adminChallenges', {
      action: args.action,
      address: args.address,
      message,
      nonce,
      expiresAt,
    });

    return {
      address: args.address,
      nonce,
      message,
      expiresAt,
    };
  },
});

export const getDashboardData = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const episodes = await ctx.db.query('episodes').withIndex('by_number').collect();
    const articles = await ctx.db.query('articles').withIndex('by_date').collect();

    const articleRows = await Promise.all(
      articles
        .sort((a, b) => b.dateISO.localeCompare(a.dateISO))
        .map(async (article) => ({
          ...article,
          imageUrl: article.imageStorageId
            ? await ctx.storage.getUrl(article.imageStorageId)
            : null,
        })),
    );

    return {
      episodes: episodes.sort((a, b) => b.number - a.number),
      articles: articleRows,
    };
  },
});

export const getChallengeByNonce = internalQuery({
  args: {
    nonce: v.string(),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await ctx.db
      .query('adminChallenges')
      .withIndex('by_nonce', (q) => q.eq('nonce', args.nonce))
      .first();
  },
});

export const markChallengeUsed = internalMutation({
  args: {
    id: v.id('adminChallenges'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { usedAt: Date.now() });
    return null;
  },
});

export const generateUploadUrlInternal = internalMutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const createEpisodeInternal = internalMutation({
  args: {
    number: v.number(),
    issue: v.string(),
    dateLabel: v.string(),
    dateISO: v.string(),
    title: v.string(),
    subtitle: v.string(),
    summary: v.string(),
    year: v.number(),
    series: v.union(v.literal('issue'), v.literal('spotlight')),
    topics: v.array(v.string()),
    archiveState: v.union(v.literal('available'), v.literal('x_removed')),
    links: v.array(
      v.object({
        platform: v.union(v.literal('x'), v.literal('youtube')),
        label: v.string(),
        url: v.string(),
      }),
    ),
  },
  returns: v.id('episodes'),
  handler: async (ctx, args) => {
    return await ctx.db.insert('episodes', args);
  },
});

export const updateEpisodeInternal = internalMutation({
  args: {
    id: v.id('episodes'),
    number: v.number(),
    issue: v.string(),
    dateLabel: v.string(),
    dateISO: v.string(),
    title: v.string(),
    subtitle: v.string(),
    summary: v.string(),
    year: v.number(),
    series: v.union(v.literal('issue'), v.literal('spotlight')),
    topics: v.array(v.string()),
    archiveState: v.union(v.literal('available'), v.literal('x_removed')),
    links: v.array(
      v.object({
        platform: v.union(v.literal('x'), v.literal('youtube')),
        label: v.string(),
        url: v.string(),
      }),
    ),
  },
  returns: v.null(),
  handler: async (ctx, { id, ...patch }) => {
    await ctx.db.patch(id, patch);
    return null;
  },
});

export const deleteEpisodeInternal = internalMutation({
  args: {
    id: v.id('episodes'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return null;
  },
});

export const createArticleInternal = internalMutation({
  args: {
    title: v.string(),
    slug: v.optional(v.string()),
    dateLabel: v.string(),
    dateISO: v.string(),
    excerpt: v.string(),
    articleUrl: v.string(),
    sourceLabel: v.string(),
    imageStorageId: v.optional(v.id('_storage')),
  },
  returns: v.id('articles'),
  handler: async (ctx, args) => {
    return await ctx.db.insert('articles', {
      ...args,
      slug: normalizeSlug(args.slug || args.title),
    });
  },
});

export const updateArticleInternal = internalMutation({
  args: {
    id: v.id('articles'),
    title: v.string(),
    slug: v.optional(v.string()),
    dateLabel: v.string(),
    dateISO: v.string(),
    excerpt: v.string(),
    articleUrl: v.string(),
    sourceLabel: v.string(),
    imageStorageId: v.optional(v.id('_storage')),
    removeImage: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, { id, removeImage, ...patch }) => {
    const existing = await ctx.db.get(id);
    if (!existing) {
      return null;
    }

    const nextImageId = removeImage ? undefined : patch.imageStorageId;

    if (
      existing.imageStorageId &&
      (removeImage || existing.imageStorageId !== nextImageId)
    ) {
      await ctx.storage.delete(existing.imageStorageId);
    }

    await ctx.db.patch(id, {
      ...patch,
      slug: normalizeSlug(patch.slug || patch.title),
      imageStorageId: nextImageId,
    });
    return null;
  },
});

export const deleteArticleInternal = internalMutation({
  args: {
    id: v.id('articles'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (existing?.imageStorageId) {
      await ctx.storage.delete(existing.imageStorageId);
    }
    await ctx.db.delete(args.id);
    return null;
  },
});
