# 🔌 API Routes Reference

Complete API documentation for Dynasty Built Academy.

## 📚 Base URL

**Development:** `http://localhost:3000/api`  
**Production:** `https://your-domain.com/api`

## 🔐 Authentication

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "user": {
    "id": "clx...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER"
  }
}
```

### Login (via NextAuth)
```http
POST /api/auth/signin
```
Use NextAuth's built-in sign-in flow.

### Logout
```http
POST /api/auth/signout
```

### Get Session
```http
GET /api/auth/session
```

**Response:**
```json
{
  "user": {
    "id": "clx...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER"
  },
  "expires": "2024-12-31T23:59:59.999Z"
}
```

---

## 📖 Books API

### List All Books
```http
GET /api/books?page=1&limit=10&category=Business&featured=true
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `category` (string, optional)
- `featured` (boolean, optional)
- `search` (string, optional)

**Response:**
```json
{
  "books": [
    {
      "id": "clx...",
      "title": "The Dynasty Blueprint",
      "slug": "the-dynasty-blueprint",
      "description": "Build your empire...",
      "excerpt": "Short description...",
      "coverImage": "https://...",
      "price": 29.99,
      "salePrice": 19.99,
      "category": "Business",
      "tags": ["entrepreneurship", "wealth"],
      "contentType": "PDF",
      "rating": 4.5,
      "reviewCount": 42,
      "author": {
        "id": "clx...",
        "name": "Dynasty Admin",
        "image": "https://..."
      },
      "publishedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

### Get Single Book
```http
GET /api/books/[slug]
```

**Response:**
```json
{
  "id": "clx...",
  "title": "The Dynasty Blueprint",
  "slug": "the-dynasty-blueprint",
  "description": "Full description...",
  "coverImage": "https://...",
  "price": 29.99,
  "salePrice": 19.99,
  "category": "Business",
  "tags": ["entrepreneurship", "wealth"],
  "contentType": "PDF",
  "pages": 250,
  "rating": 4.5,
  "reviewCount": 42,
  "viewCount": 1520,
  "salesCount": 89,
  "author": {
    "id": "clx...",
    "name": "Dynasty Admin",
    "bio": "...",
    "image": "https://..."
  },
  "reviews": [...],
  "publishedAt": "2024-01-01T00:00:00.000Z"
}
```

### Create Book (Admin Only)
```http
POST /api/books
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "New Book Title",
  "slug": "new-book-title",
  "description": "Full description...",
  "excerpt": "Short description...",
  "coverImage": "https://...",
  "price": 29.99,
  "salePrice": 19.99,
  "category": "Business",
  "tags": ["tag1", "tag2"],
  "contentType": "PDF",
  "fileUrl": "https://...",
  "pages": 250,
  "featured": true,
  "metaTitle": "SEO Title",
  "metaDescription": "SEO Description"
}
```

**Response:**
```json
{
  "book": {
    "id": "clx...",
    "title": "New Book Title",
    ...
  }
}
```

### Update Book (Admin Only)
```http
PUT /api/books/[id]
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "price": 34.99,
  ...
}
```

### Delete Book (Admin Only)
```http
DELETE /api/books/[id]
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Book deleted successfully"
}
```

---

## 📝 Blog API

### List All Posts
```http
GET /api/blog?page=1&limit=10&category=Business&featured=true
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `category` (string, optional)
- `featured` (boolean, optional)
- `search` (string, optional)

**Response:**
```json
{
  "posts": [
    {
      "id": "clx...",
      "title": "How to Build Wealth",
      "slug": "how-to-build-wealth",
      "excerpt": "Learn the strategies...",
      "coverImage": "https://...",
      "category": "Finance",
      "tags": ["wealth", "investing"],
      "readTime": "5 min read",
      "viewCount": 1250,
      "author": {
        "id": "clx...",
        "name": "Dynasty Admin",
        "image": "https://..."
      },
      "publishedAt": "2024-01-15T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

### Get Single Post
```http
GET /api/blog/[slug]
```

**Response:**
```json
{
  "id": "clx...",
  "title": "How to Build Wealth",
  "slug": "how-to-build-wealth",
  "content": "Full post content...",
  "coverImage": "https://...",
  "category": "Finance",
  "tags": ["wealth", "investing"],
  "readTime": "5 min read",
  "viewCount": 1250,
  "author": {
    "id": "clx...",
    "name": "Dynasty Admin",
    "bio": "...",
    "image": "https://..."
  },
  "comments": [...],
  "likes": 42,
  "publishedAt": "2024-01-15T00:00:00.000Z"
}
```

### Create Post (Admin/Author)
```http
POST /api/blog
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "New Post Title",
  "slug": "new-post-title",
  "content": "Full content...",
  "excerpt": "Short excerpt...",
  "coverImage": "https://...",
  "category": "Business",
  "tags": ["tag1", "tag2"],
  "featured": true,
  "metaTitle": "SEO Title",
  "metaDescription": "SEO Description"
}
```

### Update Post (Admin/Author)
```http
PUT /api/blog/[id]
Authorization: Bearer <token>
```

### Delete Post (Admin)
```http
DELETE /api/blog/[id]
Authorization: Bearer <token>
```

---

## 💬 Comments API

### Get Comments for Post
```http
GET /api/blog/[postId]/comments
```

**Response:**
```json
{
  "comments": [
    {
      "id": "clx...",
      "content": "Great post!",
      "user": {
        "id": "clx...",
        "name": "John Doe",
        "image": "https://..."
      },
      "replies": [
        {
          "id": "clx...",
          "content": "Thanks!",
          "user": {...}
        }
      ],
      "createdAt": "2024-01-15T12:00:00.000Z"
    }
  ]
}
```

### Create Comment (Authenticated)
```http
POST /api/blog/[postId]/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Great post!",
  "parentId": "clx..." // optional, for replies
}
```

### Delete Comment (Owner/Admin)
```http
DELETE /api/comments/[id]
Authorization: Bearer <token>
```

---

## 💰 Orders API

### Create Order (Checkout)
```http
POST /api/orders/checkout
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "bookId": "clx...",
      "quantity": 1
    }
  ],
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "order": {
    "id": "clx...",
    "orderNumber": "ORD-2024-00001",
    "total": 29.99,
    "status": "PENDING"
  },
  "paymentIntent": {
    "clientSecret": "pi_..._secret_...",
    "amount": 2999
  }
}
```

### Get User's Orders
```http
GET /api/orders
Authorization: Bearer <token>
```

**Response:**
```json
{
  "orders": [
    {
      "id": "clx...",
      "orderNumber": "ORD-2024-00001",
      "total": 29.99,
      "status": "COMPLETED",
      "items": [
        {
          "book": {
            "id": "clx...",
            "title": "The Dynasty Blueprint",
            "coverImage": "https://..."
          },
          "quantity": 1,
          "price": 29.99
        }
      ],
      "createdAt": "2024-01-15T12:00:00.000Z"
    }
  ]
}
```

### Get Single Order
```http
GET /api/orders/[id]
Authorization: Bearer <token>
```

---

## ❤️ Social API

### Like Post
```http
POST /api/blog/[postId]/like
Authorization: Bearer <token>
```

### Unlike Post
```http
DELETE /api/blog/[postId]/like
Authorization: Bearer <token>
```

### Bookmark Item
```http
POST /api/bookmarks
Authorization: Bearer <token>
Content-Type: application/json

{
  "bookId": "clx..." // or "postId"
}
```

### Remove Bookmark
```http
DELETE /api/bookmarks/[id]
Authorization: Bearer <token>
```

### Follow User
```http
POST /api/users/[userId]/follow
Authorization: Bearer <token>
```

### Unfollow User
```http
DELETE /api/users/[userId]/follow
Authorization: Bearer <token>
```

---

## 👤 User API

### Get User Profile
```http
GET /api/users/[userId]
```

**Response:**
```json
{
  "id": "clx...",
  "name": "John Doe",
  "bio": "Entrepreneur...",
  "image": "https://...",
  "socialLinks": {
    "twitter": "https://twitter.com/johndoe",
    "linkedin": "https://linkedin.com/in/johndoe"
  },
  "followersCount": 125,
  "followingCount": 89,
  "booksCount": 3,
  "postsCount": 12
}
```

### Update Profile (Own Profile)
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe",
  "bio": "Updated bio...",
  "image": "https://...",
  "socialLinks": {...}
}
```

---

## 🔔 Notifications API

### Get Notifications
```http
GET /api/notifications?unread=true
Authorization: Bearer <token>
```

**Response:**
```json
{
  "notifications": [
    {
      "id": "clx...",
      "type": "COMMENT",
      "title": "New comment on your post",
      "message": "John Doe commented...",
      "link": "/blog/your-post",
      "read": false,
      "createdAt": "2024-01-15T12:00:00.000Z"
    }
  ]
}
```

### Mark as Read
```http
PUT /api/notifications/[id]/read
Authorization: Bearer <token>
```

### Mark All as Read
```http
PUT /api/notifications/read-all
Authorization: Bearer <token>
```

---

## 🛡️ Admin API

### Get Dashboard Stats (Admin Only)
```http
GET /api/admin/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "stats": {
    "totalUsers": 1250,
    "totalBooks": 45,
    "totalPosts": 120,
    "totalOrders": 890,
    "totalRevenue": 25650.00,
    "recentOrders": [...],
    "topBooks": [...],
    "recentUsers": [...]
  }
}
```

### Get All Users (Admin Only)
```http
GET /api/admin/users?page=1&limit=50
Authorization: Bearer <token>
```

### Update User Role (Admin Only)
```http
PUT /api/admin/users/[userId]/role
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "ADMIN" // USER, AUTHOR, ADMIN, PREMIUM
}
```

### Delete User (Admin Only)
```http
DELETE /api/admin/users/[userId]
Authorization: Bearer <token>
```

---

## 📊 Analytics API

### Get Book Analytics (Admin Only)
```http
GET /api/analytics/books/[bookId]
Authorization: Bearer <token>
```

**Response:**
```json
{
  "views": 1520,
  "sales": 89,
  "revenue": 2659.11,
  "rating": 4.5,
  "reviewCount": 42,
  "viewsOverTime": [...],
  "salesOverTime": [...]
}
```

---

## 🔍 Search API

### Global Search
```http
GET /api/search?q=wealth&type=all
```

**Query Parameters:**
- `q` (string, required) - Search query
- `type` (string) - `all`, `books`, `posts`, `users`

**Response:**
```json
{
  "books": [...],
  "posts": [...],
  "users": [...]
}
```

---

## ⚙️ Error Responses

All API errors follow this format:

```json
{
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE",
    "details": {...}
  }
}
```

### Common Error Codes

| Status | Code | Message |
|--------|------|---------|
| 400 | `VALIDATION_ERROR` | Invalid request data |
| 401 | `UNAUTHORIZED` | Authentication required |
| 403 | `FORBIDDEN` | Insufficient permissions |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Resource already exists |
| 429 | `RATE_LIMIT` | Too many requests |
| 500 | `INTERNAL_ERROR` | Server error |

---

## 🔐 Authentication

Most endpoints require authentication. Include the session token:

**Using NextAuth session:**
```javascript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'

const session = await getServerSession(authOptions)
if (!session) {
  return Response.json({ error: 'Unauthorized' }, { status: 401 })
}
```

**Client-side with fetch:**
```javascript
const response = await fetch('/api/books', {
  credentials: 'include' // Includes session cookie
})
```

---

## 📝 Rate Limiting

API endpoints are rate-limited to prevent abuse:
- **Anonymous**: 60 requests/hour
- **Authenticated**: 300 requests/hour
- **Admin**: 1000 requests/hour

---

## 🧪 Testing

### Using cURL
```bash
# Get all books
curl http://localhost:3000/api/books

# Create book (requires auth)
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Book","slug":"test-book",...}'
```

### Using Postman/Insomnia
Import the API collection (coming soon) or manually create requests using the examples above.

---

## 📚 Next Steps

1. **Implement API routes** in `src/app/api/`
2. **Add validation** using Zod schemas from `src/lib/validations/schemas.ts`
3. **Use Prisma Client** from `src/lib/db/prisma.ts`
4. **Protect routes** with auth checks
5. **Test endpoints** with Postman or cURL

---

**Need help?** Check [README.md](./README.md) for full documentation.
