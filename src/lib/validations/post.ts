import { z } from "zod";

/**
 * Post Creation Schema
 * Validates input for creating a new community post
 */
export const createPostSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be less than 200 characters")
    .trim(),
  
  content: z
    .string()
    .min(10, "Content must be at least 10 characters")
    .max(50000, "Content must be less than 50,000 characters"),
  
  excerpt: z
    .string()
    .max(300, "Excerpt must be less than 300 characters")
    .optional()
    .nullable(),
  
  coverImage: z
    .string()
    .url("Cover image must be a valid URL")
    .optional()
    .nullable(),
  
  tags: z
    .array(z.string().trim().min(1).max(30))
    .max(5, "Maximum 5 tags allowed")
    .default([])
    .transform((tags) => tags.map((tag) => tag.toLowerCase())),
  
  published: z
    .boolean()
    .default(true),
});

/**
 * Post Update Schema
 * Allows partial updates to existing posts
 */
export const updatePostSchema = createPostSchema.partial();

/**
 * Comment Creation Schema
 */
export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(5000, "Comment must be less than 5,000 characters")
    .trim(),
  
  parentId: z
    .string()
    .cuid()
    .optional()
    .nullable(),
});

/**
 * Post Query Schema
 * For GET /api/posts with filters
 */
export const postQuerySchema = z.object({
  cursor: z.string().cuid().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
  tag: z.string().optional(),
  authorId: z.string().cuid().optional(),
  published: z.coerce.boolean().optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type PostQueryInput = z.infer<typeof postQuerySchema>;
