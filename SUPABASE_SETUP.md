# Supabase Integration Setup Guide

This guide will help you connect your Mika Log app to Supabase for cloud storage and real-time sync.

## Prerequisites

- A Supabase account (free tier is fine)
- Your Supabase project created at https://app.supabase.com

---

## Step 1: Get Your Supabase Credentials

1. Go to https://app.supabase.com
2. Select your project
3. Go to **Settings** → **API**
4. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Project API Key** (anon/public key - starts with `eyJ...`)

---

## Step 2: Add Credentials to Your App

Open `.env.local` in your project root and update the Supabase variables:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important:** Replace the placeholder values with your actual credentials!

---

## Step 3: Set Up Database Tables

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New query**
3. Copy the entire contents of `supabase-schema.sql` (in project root)
4. Paste it into the SQL Editor
5. Click **Run** (or press Cmd/Ctrl + Enter)

This will create:

- `library_items` table (for books, films, and shows you're tracking)
- `user_reviews` table (for your reviews and ratings)
- Row Level Security (RLS) policies (keeps your data private)
- Automatic triggers (for timestamps and user IDs)

---

## Step 4: Enable Email Authentication (Optional but Recommended)

For multi-device sync, you'll need user authentication:

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates if desired
4. In your app, users will need to sign up/log in

**Note:** For now, the app works without authentication (data is stored locally). Adding auth enables cloud sync across devices.

---

## Step 5: Restart Your App

After adding credentials, restart your Expo server:

```bash
npx expo start --clear
```

Press `w` for web or `i` for iOS.

---

## How It Works

### Automatic Sync

- When you add/edit/delete items in your library → syncs to Supabase
- When you post/delete reviews → syncs to Supabase
- On app launch → loads data from Supabase if available

### Offline Support

- Data is always saved to **AsyncStorage** (local device storage)
- Works offline - changes sync when you're back online
- Supabase is optional - app works fine without it

### Data Flow

```
User Action → Local State Update → AsyncStorage Save → Supabase Sync (if configured)
```

---

## Verify It's Working

1. Open your app
2. Add a book/film/show to your library
3. Go to Supabase dashboard → **Table Editor**
4. Select `library_items` table
5. You should see your item appear!

---

## Troubleshooting

### Not syncing to Supabase?

**Check credentials:**

```bash
# Make sure these are in .env.local:
cat .env.local | grep SUPABASE
```

**Check console for errors:**
Look for Supabase errors in your terminal or browser console.

**Verify tables exist:**
Go to Supabase → Table Editor → should see `library_items` and `user_reviews`

### RLS Policy Errors?

If you see "new row violates row-level security policy":

- Make sure you're logged in as a user
- Or temporarily disable RLS for testing (not recommended for production)

### Clear local data and re-sync:

```javascript
// In your app's AsyncStorage, clear everything:
import AsyncStorage from "@react-native-async-storage/async-storage";
await AsyncStorage.clear();
```

Then restart the app - it will fetch fresh data from Supabase.

---

## Next Steps

### Add User Authentication

To enable multi-device sync, add authentication:

1. Install Supabase Auth UI:

   ```bash
   npm install @supabase/auth-ui-react @supabase/auth-ui-shared
   ```

2. Create login/signup screens using Supabase Auth
3. Store user session and use it for RLS

### Enable Real-time Sync

Add real-time subscriptions to sync changes instantly:

```typescript
// In LibraryContext
useEffect(() => {
  const subscription = supabase
    .channel("library_changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "library_items" },
      (payload) => {
        // Handle real-time updates
        console.log("Change received!", payload);
      },
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

---

## Security Notes

- ✅ Row Level Security (RLS) is enabled - users only see their own data
- ✅ API keys in `.env.local` are safe for client-side use (anon key is public)
- ✅ Never commit `.env.local` to git (already in `.gitignore`)
- ⚠️ For production, consider adding more security rules
- ⚠️ Service role key should NEVER be in client code

---

## Support

- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- React Native Guide: https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native

---

## Summary

✅ Installed `@supabase/supabase-js`  
✅ Added credentials to `.env.local`  
✅ Created database schema in Supabase  
✅ Integrated with LibraryContext  
✅ Added offline-first sync

Your app now supports cloud storage and multi-device sync! 🎉
