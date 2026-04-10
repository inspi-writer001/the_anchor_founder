'use node';

import { getPublicKeyFromAddress } from '@solana/addresses';
import { signatureBytes, verifySignature } from '@solana/keys';
import { anyApi } from 'convex/server';
import { v } from 'convex/values';
import { action } from './_generated/server';

const internal = anyApi;

const adminAuthValidator = v.object({
  address: v.string(),
  nonce: v.string(),
  message: v.string(),
  signature: v.array(v.number()),
});

function getAdminAddress() {
  const address = process.env.ADMIN_WALLET_ADDRESS;
  if (!address) {
    throw new Error('ADMIN_WALLET_ADDRESS is not configured.');
  }
  return address;
}

async function assertAdminAuth(ctx: any, auth: any, actionName: string) {
  const adminAddress = getAdminAddress();
  if (auth.address !== adminAddress) {
    throw new Error('Unauthorized.');
  }

  const challenge = await ctx.runQuery(internal.admin.getChallengeByNonce, {
    nonce: auth.nonce,
  });

  if (!challenge || challenge.usedAt) {
    throw new Error('Unauthorized.');
  }

  if (
    challenge.address !== auth.address ||
    challenge.action !== actionName ||
    challenge.message !== auth.message
  ) {
    throw new Error('Unauthorized.');
  }

  if (challenge.expiresAt < Date.now()) {
    throw new Error('Authentication challenge expired.');
  }

  const publicKey = await getPublicKeyFromAddress(auth.address as never);
  const isValid = await verifySignature(
    publicKey,
    signatureBytes(Uint8Array.from(auth.signature)),
    new TextEncoder().encode(auth.message),
  );

  if (!isValid) {
    throw new Error('Unauthorized.');
  }

  await ctx.runMutation(internal.admin.markChallengeUsed, { id: challenge._id });
}

export const generateUploadUrl = action({
  args: {
    auth: adminAuthValidator,
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    await assertAdminAuth(ctx, args.auth, 'generateUploadUrl');
    return await ctx.runMutation(internal.admin.generateUploadUrlInternal, {});
  },
});

export const createEpisode = action({
  args: {
    auth: adminAuthValidator,
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
  handler: async (ctx, { auth, ...episode }) => {
    await assertAdminAuth(ctx, auth, 'createEpisode');
    return await ctx.runMutation(internal.admin.createEpisodeInternal, episode);
  },
});

export const updateEpisode = action({
  args: {
    auth: adminAuthValidator,
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
  handler: async (ctx, { auth, ...payload }) => {
    await assertAdminAuth(ctx, auth, 'updateEpisode');
    return await ctx.runMutation(internal.admin.updateEpisodeInternal, payload);
  },
});

export const deleteEpisode = action({
  args: {
    auth: adminAuthValidator,
    id: v.id('episodes'),
  },
  returns: v.null(),
  handler: async (ctx, { auth, ...payload }) => {
    await assertAdminAuth(ctx, auth, 'deleteEpisode');
    return await ctx.runMutation(internal.admin.deleteEpisodeInternal, payload);
  },
});

export const createArticle = action({
  args: {
    auth: adminAuthValidator,
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
  handler: async (ctx, { auth, ...payload }) => {
    await assertAdminAuth(ctx, auth, 'createArticle');
    return await ctx.runMutation(internal.admin.createArticleInternal, payload);
  },
});

export const updateArticle = action({
  args: {
    auth: adminAuthValidator,
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
  handler: async (ctx, { auth, ...payload }) => {
    await assertAdminAuth(ctx, auth, 'updateArticle');
    return await ctx.runMutation(internal.admin.updateArticleInternal, payload);
  },
});

export const deleteArticle = action({
  args: {
    auth: adminAuthValidator,
    id: v.id('articles'),
  },
  returns: v.null(),
  handler: async (ctx, { auth, ...payload }) => {
    await assertAdminAuth(ctx, auth, 'deleteArticle');
    return await ctx.runMutation(internal.admin.deleteArticleInternal, payload);
  },
});
