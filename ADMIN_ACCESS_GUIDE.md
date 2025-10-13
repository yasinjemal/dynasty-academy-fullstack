# 🔐 Admin Access Guide - Dynasty Academy

## 🎯 How to Access Admin Panel

### **Quick Answer:**

```
URL: http://localhost:3000/admin/books
```

But first, you need to be an ADMIN user! 👇

---

## ✅ **STEP-BY-STEP GUIDE**

### **Step 1: Check if You're Signed In**

1. Open: http://localhost:3000
2. Look at top-right corner
3. Do you see your profile picture/name?

**If NO:** Go to Step 2  
**If YES:** Go to Step 3

---

### **Step 2: Sign In / Register**

#### **Option A: Sign In with Google OAuth**

```
URL: http://localhost:3000/auth/signin
```

1. Click "Sign in with Google"
2. Choose your Google account
3. Allow permissions
4. You'll be redirected to homepage

#### **Option B: Register New Account**

```
URL: http://localhost:3000/auth/signup
```

1. Enter your email
2. Create password
3. Fill in your name
4. Click "Sign Up"

**Important:** Remember the email you used! You'll need it for Step 3.

---

### **Step 3: Make Yourself Admin**

Now you need to run the admin script!

#### **Method 1: Run the Script (EASIEST)**

Open a **NEW terminal** (don't close the dev server) and run:

```bash
node make-admin.mjs
```

**What it does:**

- Looks for user with email: `yasinyutbr@gmail.com`
- Updates their role to `ADMIN`
- Shows success message

#### **Method 2: Edit Script for Your Email**

If you used a different email, edit the script first:

1. Open `make-admin.mjs`
2. Find line 6:
   ```javascript
   const email = "yasinyutbr@gmail.com"; // Change this to your email
   ```
3. Change to YOUR email:
   ```javascript
   const email = "your-email@gmail.com"; // Your actual email
   ```
4. Save file
5. Run: `node make-admin.mjs`

#### **Expected Output:**

```
🔍 Looking for user: your-email@gmail.com
✅ Found user: Your Name
   Current role: USER
📝 Updating user to ADMIN...
🎉 Success! User is now an ADMIN!
   Name: Your Name
   Email: your-email@gmail.com
   Role: ADMIN
```

---

### **Step 4: Access Admin Panel**

Now you can access admin areas!

#### **Admin URLs:**

```bash
# Admin Dashboard (main)
http://localhost:3000/admin

# Books Management
http://localhost:3000/admin/books

# Create New Book
http://localhost:3000/admin/books/new

# Edit Book
http://localhost:3000/admin/books/{bookId}
```

#### **What You Can Do:**

- ✅ Upload new books (PDF, DOCX, Markdown, Text)
- ✅ Edit book details
- ✅ Set prices and sale prices
- ✅ Upload cover images
- ✅ Manage categories
- ✅ Publish/unpublish books
- ✅ Delete books
- ✅ View analytics

---

## 🐛 **Troubleshooting**

### **Problem: "Unauthorized" Error**

**Symptoms:**

- Can't access `/admin` routes
- Redirected to home page
- "Access denied" message

**Solutions:**

1. **Check if you're signed in:**

   ```
   Look at top-right corner of website
   Should see your profile picture
   ```

2. **Run make-admin script:**

   ```bash
   node make-admin.mjs
   ```

3. **Verify in database:**

   - Open Supabase dashboard
   - Go to Table Editor → users
   - Find your user
   - Check `role` column = `ADMIN`

4. **Clear browser cookies:**

   - Press F12 (Dev Tools)
   - Application tab → Cookies
   - Delete all cookies for localhost:3000
   - Sign in again

5. **Restart dev server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

---

### **Problem: "User not found" in Script**

**Symptoms:**

```
❌ User not found. Please register first.
```

**Solutions:**

1. **Check your email is correct:**

   - Open `make-admin.mjs`
   - Verify email matches the one you registered with
   - Check for typos (case-sensitive!)

2. **Register an account first:**

   - Go to: http://localhost:3000/auth/signup
   - Complete registration
   - Then run script again

3. **Check database connection:**
   ```bash
   node test-db-connection.mjs
   ```
   Should show: ✅ Database connection successful!

---

### **Problem: Script Already Says "User is Admin"**

**Symptoms:**

```
✅ User is already an ADMIN!
```

**But still can't access admin panel?**

**Solutions:**

1. **Sign out and sign back in:**

   - Click profile → Sign Out
   - Sign in again
   - Try accessing admin

2. **Check middleware:**

   - Session might be cached
   - Clear cookies
   - Restart dev server

3. **Verify URL:**
   - Make sure you're going to:
   - http://localhost:3000/admin/books
   - NOT: http://localhost:3000/dashboard

---

## 🚀 **Quick Test**

After making yourself admin, test access:

### **1. Access Admin Dashboard:**

```bash
http://localhost:3000/admin
```

**Expected:** See admin interface (not redirected)

### **2. Access Books Management:**

```bash
http://localhost:3000/admin/books
```

**Expected:** See "Add New Book" button and books list

### **3. Try Creating a Book:**

1. Click "Add New Book"
2. See form with all fields
3. Can upload files

**If all work:** ✅ You're an admin!

---

## 📋 **Admin Checklist**

```
✅ Step 1: Signed in with account
✅ Step 2: Ran make-admin.mjs script
✅ Step 3: Saw "Success! User is now an ADMIN!"
✅ Step 4: Signed out and back in
✅ Step 5: Can access /admin/books
✅ Step 6: Can see "Add New Book" button
```

---

## 💡 **Pro Tips**

### **Multiple Admins:**

Want to make another user admin?

```bash
# Method 1: Edit script
# Change email in make-admin.mjs
# Run: node make-admin.mjs

# Method 2: Direct Prisma command
node -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
await prisma.user.update({
  where: { email: 'other-user@gmail.com' },
  data: { role: 'ADMIN' }
});
console.log('Done!');
await prisma.\$disconnect();
"
```

### **Remove Admin Rights:**

Change role back to USER:

```javascript
// Edit make-admin.mjs
data: {
  role: "USER";
} // Change ADMIN to USER
```

### **Check Your Current Role:**

Run this to see your role:

```bash
node -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const user = await prisma.user.findUnique({
  where: { email: 'your-email@gmail.com' }
});
console.log('Role:', user?.role);
await prisma.\$disconnect();
"
```

---

## 🎯 **Summary**

**To access admin panel:**

1. ✅ Sign in to website
2. ✅ Run: `node make-admin.mjs`
3. ✅ Sign out and back in
4. ✅ Go to: http://localhost:3000/admin/books

**That's it!** 🎉

---

## 📞 **Still Need Help?**

**Common Issues:**

| Issue              | Solution                                 |
| ------------------ | ---------------------------------------- |
| Can't sign in      | Check OAuth credentials in `.env`        |
| Script fails       | Check database connection                |
| Still can't access | Clear cookies and retry                  |
| Wrong email        | Edit `make-admin.mjs` with correct email |

**Check these files:**

- `.env` - Has all credentials
- `make-admin.mjs` - Has correct email
- Database - User exists with correct email

---

**Version:** 1.0  
**Last Updated:** October 13, 2025

**Now go make yourself admin and start uploading books!** 🚀📚
