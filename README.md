<div align="center">

# 🌸 mika

*your cozy media diary*

**mika** is a soft, personal space to log the books you've read, films you've watched, and shows you've loved — all wrapped in a warm cottagecore aesthetic.

</div>

---

## ✦ what is mika?

mika is a mobile app (iOS & Android) for keeping a beautiful record of your media life. rate things, write little reviews, track your library, and one day — share it with friends in cozy clubs.

no algorithm. no noise. just you and your diary. 🍃

---

## 🌿 features

| | |
|---|---|
| 📖 | **library** — track books, films & shows with status (want, watching, finished) |
| ✍️ | **reviews** — write personal notes and star ratings |
| 🔍 | **discover** — search for new titles to add to your collection |
| 👤 | **profile** — see your stats, favourites, and recent activity |
| 🌸 | **clubs** — coming soon: share your diary with friends |

---

## 🍄 tech stack

- **[Expo](https://expo.dev) SDK 56** — React Native for iOS, Android & web
- **[expo-router](https://expo.github.io/router/)** — file-based navigation
- **[Supabase](https://supabase.com)** — auth & database backend
- **[@expo/vector-icons](https://icons.expo.fyi/)** (MaterialCommunityIcons) — all the little icons
- **TypeScript** throughout

---

## 🌼 getting started

### 1. install dependencies

```bash
npm install
```

### 2. set up environment variables

Create a `.env.local` file in the project root:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_TMDB_API_KEY=your_tmdb_api_key
```

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) and [API_SETUP.md](./API_SETUP.md) for details.

### 3. start the app

```bash
npx expo start
```

Then scan the QR code with **Expo Go** on your phone, or press `i` / `a` to open in a simulator.

---

## 🎀 palette

| token | hex | |
|---|---|---|
| cream | `#fdf6ee` | ![#fdf6ee](https://placehold.co/12x12/fdf6ee/fdf6ee.png) |
| dusty rose | `#d4849b` | ![#d4849b](https://placehold.co/12x12/d4849b/d4849b.png) |
| bark | `#6b5040` | ![#6b5040](https://placehold.co/12x12/6b5040/6b5040.png) |
| sage | `#9aaa8a` | ![#9aaa8a](https://placehold.co/12x12/9aaa8a/9aaa8a.png) |
| lavender | `#c8b4d4` | ![#c8b4d4](https://placehold.co/12x12/c8b4d4/c8b4d4.png) |
| linen | `#e8ddd0` | ![#e8ddd0](https://placehold.co/12x12/e8ddd0/e8ddd0.png) |
| parchment | `#f5ead8` | ![#f5ead8](https://placehold.co/12x12/f5ead8/f5ead8.png) |

---

## 🌱 project structure

```
app/              ← expo-router screens & layouts
  (tabs)/         ← main tab navigation
src/
  screens/        ← full screen components
  components/     ← reusable UI pieces
  context/        ← auth & library state
  services/       ← api & database calls
  types/          ← shared TypeScript types
constants/        ← theme & colour tokens
```

---

<div align="center">

made with 🌸 and a lot of tea

</div>

