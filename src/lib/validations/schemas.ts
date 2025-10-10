import { z } from 'zod'

// ============================================
// AUTH SCHEMAS
// ============================================

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  image: z.string().url('Invalid image URL').optional(),
  socialLinks: z.object({
    twitter: z.string().url().optional().or(z.literal('')),
    linkedin: z.string().url().optional().or(z.literal('')),
    instagram: z.string().url().optional().or(z.literal('')),
    website: z.string().url().optional().or(z.literal('')),
  }).optional(),
})

// ============================================
// BOOK SCHEMAS
// ============================================

export const bookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  excerpt: z.string().max(500).optional(),
  coverImage: z.string().url('Invalid image URL').optional(),
  price: z.number().min(0, 'Price must be positive'),
  salePrice: z.number().min(0).optional(),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()),
  contentType: z.enum(['PDF', 'Video Course', 'Audio Book', 'Bundle']),
  fileUrl: z.string().url().optional(),
  previewUrl: z.string().url().optional(),
  pages: z.number().int().positive().optional(),
  duration: z.string().optional(),
  featured: z.boolean().default(false),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
})

export type BookFormData = z.infer<typeof bookSchema>

// ============================================
// BLOG SCHEMAS
// ============================================

export const blogPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().min(1, 'Slug is required'),
  content: z.string().min(100, 'Content must be at least 100 characters'),
  excerpt: z.string().max(500).optional(),
  coverImage: z.string().url('Invalid image URL').optional(),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()),
  featured: z.boolean().default(false),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
})

export type BlogPostFormData = z.infer<typeof blogPostSchema>

// ============================================
// COMMENT SCHEMA
// ============================================

export const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(1000),
  postId: z.string(),
  parentId: z.string().optional(),
})

// ============================================
// REVIEW SCHEMA
// ============================================

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
  bookId: z.string(),
})

// ============================================
// ORDER SCHEMA
// ============================================

export const checkoutSchema = z.object({
  email: z.string().email('Invalid email address'),
  items: z.array(z.object({
    bookId: z.string(),
    quantity: z.number().int().positive(),
  })),
})

// ============================================
// CONTACT FORM SCHEMA
// ============================================

export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
})
