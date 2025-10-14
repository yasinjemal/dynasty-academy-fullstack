# 🎯 Profile Vision - Next Actions

## Immediate Priorities (Complete Sprint A)

### 1. Test Current Implementation ✅

```bash
# Visit these URLs to test:
/@your-username          # Profile page
/api/users/your-username # API response
/settings/profile        # Edit page (needs creation)
```

### 2. Fix Profile Hero Issues (if any)

The ProfileHero component references `user.id` but we need to pass it:

- Update ProfileHero props to include `id`
- Update page.tsx to pass `id: user.id`

### 3. Create Profile Edit Page

Location: `src/app/(dashboard)/settings/profile/page.tsx`

**Required fields:**

- Name, Username (with availability check)
- Bio (280 char limit, live counter)
- Location
- Website (https validation)
- Social handles (X, Instagram, YouTube)
- Theme selector (5 options with previews)
- Privacy toggles (isPrivate, dmOpen)

**Components needed:**

- `ProfileEditForm.tsx`
- `AvatarUpload.tsx` (with cropper)
- `BannerUpload.tsx`
- `UsernameAvailability.tsx` (live check)
- `ThemeSelector.tsx`

### 4. Avatar & Banner Upload APIs

**Create these routes:**

```typescript
// POST /api/users/avatar
// - Accept image upload
// - Validate: JPG/PNG/WebP, max 2MB, 1:1 aspect
// - Crop to 512x512
// - Upload to storage
// - Return URL

// POST /api/users/banner
// - Accept image upload
// - Validate: JPG/PNG/WebP, max 5MB, 16:5 aspect
// - Crop to 1600x500
// - Upload to storage
// - Return URL
```

### 5. Complete Overview Tab Content

**Components to create:**

- `AboutCard.tsx` - Bio + links in glass panel
- `PostsHighlight.tsx` - Last 3 posts carousel
- `ReflectionsHighlight.tsx` - Last 3 reflections
- `CollectionsHighlight.tsx` - Last 3 collections grid
- `AchievementsShowcase.tsx` - Up to 6 badges
- `ReadingSnapshot.tsx` - Current book, minutes, completion map

### 6. Build Remaining Tabs

#### Posts Tab (`ProfilePostsTab.tsx`)

- Fetch `/api/users/[username]/posts`
- Filters: All | Published | Drafts (owner only)
- Sort: New | Top | Most Discussed
- Masonry or list layout
- Infinite scroll

#### Reflections Tab (`ProfileReflectionsTab.tsx`)

- Fetch `/api/users/[username]/reflections`
- Show book context
- Link to book page
- Sort: Recent | Most Liked | Most Discussed

#### Collections Tab (`ProfileCollectionsTab.tsx`)

- Fetch `/api/users/[username]/collections`
- Grid of collection covers
- Hover: item count, description
- Click: View collection detail

#### Achievements Tab (`ProfileAchievementsTab.tsx`)

- Fetch `/api/users/[username]/achievements`
- Filter by tier: All | Elite | Gold | Silver | Bronze
- Grid layout with tier colors
- Click: Achievement detail modal
- Show rarity % (if < 5%)

#### Activity Tab (`ProfileActivityTab.tsx`)

- Fetch `/api/users/[username]/activity`
- Mixed timeline of:
  - Posts published
  - Reflections shared
  - Achievements unlocked
  - Users followed
  - Level-ups
- Infinite scroll with cursor

### 7. Add Missing API Routes

```typescript
// GET /api/users/[username]/posts
// GET /api/users/[username]/reflections
// GET /api/users/[username]/collections
// GET /api/users/[username]/achievements
// GET /api/users/[username]/stats (owner analytics)
```

### 8. SEO & OG Tags

Already in page.tsx, but verify:

- Title format correct
- Description uses bio
- OG image uses banner or avatar
- Twitter card works

### 9. Loading States

Create:

- `ProfileHeroSkeleton.tsx`
- `ProfileTabsSkeleton.tsx`
- Suspense boundaries in page.tsx

### 10. Empty States

Create:

- `EmptyPosts.tsx` - "Every empire starts with a first brick..."
- `EmptyReflections.tsx` - "Share your first insight"
- `EmptyCollections.tsx` - "Curate your first collection"
- `EmptyAchievements.tsx` - "Complete quests to earn badges"

## Sprint B Priority Order

1. Posts tab (most visible)
2. Reflections tab (core feature)
3. Activity timeline (engagement)
4. Achievements showcase (gamification)
5. Collections (power user feature)

## Quick Wins

- [ ] Add profile link to navbar (user dropdown)
- [ ] Add "View Profile" to settings sidebar
- [ ] Create `/@me` redirect to own profile
- [ ] Add profile preview hover cards on follow lists
- [ ] Show "Followed by X people you follow" social proof

## Known Issues to Fix

1. **ProfileHero missing userId prop**

   - Add `id: string` to ProfileHeroProps
   - Pass from page.tsx

2. **Tooltip component import**

   - Verify @/components/ui/tooltip exists
   - Or create basic Tooltip wrapper

3. **Missing Tabs component**

   - Verify @/components/ui/tabs exists
   - Or use headless UI tabs

4. **Badge component**
   - Verify @/components/ui/badge exists
   - Or create simple badge component

## Testing Checklist

- [ ] Create/claim username
- [ ] Change username (verify redirect works)
- [ ] Try username change within 30 days (should fail)
- [ ] Follow/unfollow user
- [ ] View own profile (see Edit button)
- [ ] View others' profile (see Follow button)
- [ ] Private profile shows restricted view
- [ ] Banned user returns 404
- [ ] Social links open correctly
- [ ] Dynasty Score tooltip shows XP to next level
- [ ] Streak shows days
- [ ] Mobile responsive

## Documentation

Update these files:

- [ ] README.md - Add profile feature section
- [ ] API_REFERENCE.md - Document new endpoints
- [ ] PROFILE_VISION_STATUS.md - Update progress %

---

**Current Status:** Sprint A at 60%
**Next Milestone:** Complete Sprint A (MVP Profile) at 100%
**Target:** Profile viewing fully functional with edit capabilities
