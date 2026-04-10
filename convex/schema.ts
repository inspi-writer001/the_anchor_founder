import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  episodes: defineTable({
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
  }).index('by_number', ['number']),
  articles: defineTable({
    title: v.string(),
    slug: v.string(),
    dateLabel: v.string(),
    dateISO: v.string(),
    excerpt: v.string(),
    articleUrl: v.string(),
    sourceLabel: v.string(),
    imageStorageId: v.optional(v.id('_storage')),
  }).index('by_date', ['dateISO']),
  adminChallenges: defineTable({
    action: v.string(),
    address: v.string(),
    message: v.string(),
    nonce: v.string(),
    expiresAt: v.number(),
    usedAt: v.optional(v.number()),
  }).index('by_nonce', ['nonce']),
  landing: defineTable({
    tagline: v.string(),
    heroBlurb: v.string(),
    archiveNotesTitle: v.string(),
    archiveNotes: v.array(v.string()),
    timeline: v.array(
      v.object({
        label: v.string(),
        body: v.string(),
      }),
    ),
  }),
});
