# Cloudinary Setup Guide

## What is Cloudinary?
Cloudinary is a cloud-based image and video management service. We use it to:
- Store and serve user avatars and profile banners
- Automatically optimize images (compression, format)
- Generate thumbnails and responsive images
- Deliver images via global CDN (fast loading worldwide)

---

## Step 1: Create Cloudinary Account

1. **Go to Cloudinary:**
   - Visit: https://cloudinary.com/
   - Click "Sign Up" (Free tier: 25 credits/month - plenty for development)

2. **Sign up options:**
   - Email + Password
   - Or sign in with Google/GitHub

3. **Complete registration:**
   - Verify your email
   - Skip any product tours

---

## Step 2: Get Your Credentials

1. **Navigate to Dashboard:**
   - After login, you'll land on the Dashboard
   - Look for "Product Environment Credentials" section

2. **Copy these values:**
   ```
   Cloud Name: your_cloud_name
   API Key: 123456789012345
   API Secret: abc-xyz_123456789
   ```

3. **Add to `.env` file:**
   ```bash
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
   CLOUDINARY_API_KEY="123456789012345"
   CLOUDINARY_API_SECRET="abc-xyz_123456789"
   ```

---

## Step 3: Configure Upload Presets (Optional but Recommended)

1. **Go to Settings:**
   - Click Settings (gear icon) in top right
   - Navigate to "Upload" tab

2. **Create Upload Preset:**
   - Scroll to "Upload presets"
   - Click "Add upload preset"

3. **Configure preset:**
   ```
   Preset name: dynasty-academy-avatars
   Signing Mode: Signed (more secure)
   Folder: dynasty-academy/avatars
   
   Transformations:
   - Width: 400
   - Height: 400
   - Crop: Fill
   - Gravity: Face
   - Quality: Auto
   - Format: Auto
   ```

4. **Save preset**

---

## Step 4: Test the Integration

1. **Restart dev server:**
   ```bash
   npm run dev
   ```

2. **Test avatar upload:**
   - Navigate to `/settings/profile`
   - Click "Upload Avatar"
   - Select an image
   - Crop it
   - Click "Upload Avatar"

3. **Verify:**
   - Check if avatar updates in UI
   - Check Cloudinary dashboard → Media Library
   - You should see your uploaded image in `dynasty-academy/avatars/` folder

---

## Cloudinary Features We Use

### 1. **Automatic Transformations**
```javascript
{
  transformation: [
    { width: 400, height: 400, crop: 'fill', gravity: 'face' },
    { quality: 'auto', fetch_format: 'auto' }
  ]
}
```
- Resizes to 400x400px
- Centers on face (if detected)
- Automatic quality optimization
- Automatic format selection (WebP for modern browsers)

### 2. **Organized Storage**
```
dynasty-academy/
├── avatars/
│   ├── avatar_user123_1234567890.jpg
│   └── avatar_user456_1234567891.png
└── banners/
    ├── banner_user123_1234567892.jpg
    └── banner_user456_1234567893.png
```

### 3. **CDN Delivery**
- Images served from global CDN
- Fast loading worldwide
- Automatic caching

---

## Free Tier Limits

**Cloudinary Free Plan:**
- ✅ 25 credits/month (each transformation = 1 credit)
- ✅ 25GB storage
- ✅ 25GB bandwidth/month
- ✅ Unlimited transformations (charged per credit)
- ✅ Global CDN delivery

**Estimated usage for small app:**
- 100 avatar uploads/month = ~3-5 credits
- 1000 image views = ~0 credits (cached)
- Free tier is MORE than enough for development + small production

---

## Alternative (If you prefer not to use Cloudinary)

### Option 1: Local Storage
Store images in `public/uploads/avatars/`:
```typescript
// Save file locally
const filePath = path.join(process.cwd(), 'public/uploads/avatars', filename)
await fs.writeFile(filePath, buffer)
```
**Pros:** Free, simple
**Cons:** No CDN, no optimization, files in Git

### Option 2: Vercel Blob Storage
```bash
npm install @vercel/blob
```
**Pros:** Integrated with Vercel, auto CDN
**Cons:** Paid only, 5GB = $10/month

### Option 3: AWS S3
**Pros:** Industry standard, very cheap ($0.023/GB)
**Cons:** Complex setup, requires AWS account

---

## Troubleshooting

### Error: "Missing Cloudinary credentials"
- Check `.env` file has all 3 variables
- Restart dev server after adding env vars
- Don't wrap values in extra quotes

### Error: "Upload failed"
- Check API key/secret are correct
- Verify cloud name matches dashboard
- Check file size (max 2MB for avatars)

### Images not loading
- Check Cloudinary dashboard → Media Library
- Verify `secure_url` is returned from API
- Check browser console for CORS errors

---

## Security Best Practices

1. **Never commit secrets:**
   - `.env` is in `.gitignore`
   - Use environment variables in production

2. **Use signed uploads:**
   - Our API signs uploads server-side
   - Prevents unauthorized uploads

3. **Validate uploads:**
   - Check file type
   - Check file size
   - Sanitize filenames

4. **Rate limiting:**
   - Consider adding rate limits to upload endpoint
   - Prevent abuse

---

## Next Steps

After Cloudinary is set up:
1. ✅ Avatar upload (DONE)
2. 📋 Banner upload (16:5 ratio, 5MB limit)
3. 📋 Delete avatar/banner functionality
4. 📋 Image compression settings
5. 📋 Responsive image delivery

---

## Resources

- **Cloudinary Dashboard:** https://cloudinary.com/console
- **Cloudinary Docs:** https://cloudinary.com/documentation
- **Node.js SDK:** https://cloudinary.com/documentation/node_integration
- **Transformations:** https://cloudinary.com/documentation/image_transformations

---

**Need help?** Check the Cloudinary documentation or ask in chat!
