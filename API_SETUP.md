# MikaDiary - Real Data Integration

This document explains how to set up the real APIs for MikaDiary to fetch actual books, movies, and TV shows.

## APIs Used

### 1. Open Library API (Books)
- **Free**: No API key required
- **Rate Limit**: Reasonable limits for public use
- **Docs**: https://openlibrary.org/developers/api
- **Features**:
  - Search for books
  - Get book metadata (title, author, cover images, ratings)
  - Trending/popular books

### 2. TMDb API (Movies & TV Shows)
- **Free**: Yes, with registration
- **Rate Limit**: Free tier allows 40 requests/10 seconds
- **Docs**: https://www.themoviedb.org/settings/api
- **Features**:
  - Search for movies and TV shows
  - Get trending content
  - Get detailed metadata (title, cover images, ratings, descriptions)

## Setup Instructions

### For Open Library API
No setup needed! The API works out of the box without authentication.

### For TMDb API

1. **Create an Account**
   - Go to https://www.themoviedb.org/settings/api
   - Create a free account

2. **Get Your API Key**
   - After login, go to Settings → API
   - Copy your API key (v3 auth key)

3. **Add to Your Project**
   
   **Option A: Environment Variables (Recommended)**
   ```bash
   # Create a .env.local file in the project root
   EXPO_PUBLIC_TMDB_API_KEY=your_api_key_here
   ```
   
   **Option B: Direct in Code**
   - Open `src/config/apiConfig.ts`
   - Replace the placeholder key with your actual key

## Current Setup

The app uses a default TMDb API key for demonstration. This key has limited requests per day. For production:

1. Create your own TMDb account
2. Get your free API key
3. Add it to `.env.local` as shown above

## API Endpoints

### Open Library
- **Search Books**: `https://openlibrary.org/search.json?title={query}`
- **Trending**: `https://openlibrary.org/search.json?subject=fiction&sort=newest`

### TMDb
- **Search Movies**: `https://api.themoviedb.org/3/search/movie?api_key={key}&query={query}`
- **Search Shows**: `https://api.themoviedb.org/3/search/tv?api_key={key}&query={query}`
- **Trending Movies**: `https://api.themoviedb.org/3/trending/movie/week?api_key={key}`
- **Trending Shows**: `https://api.themoviedb.org/3/trending/tv/week?api_key={key}`

## Data Returned

Each search returns:

### Books (Open Library)
- Title
- Author
- Cover image (300x400px)
- Publication year
- Synopsis (first sentence)
- Ratings (if available)
- ISBN

### Movies & Shows (TMDb)
- Title/Name
- Poster image (300x450px)
- Release/Air date
- Overview/Synopsis
- Vote average (0-10, converted to 0-5 stars)
- Genres
- IMDb ID

## Error Handling

The app includes error handling for:
- Network timeouts
- Invalid API responses
- Missing images/metadata
- Rate limiting

If an API fails, the app will:
1. Show a loading state
2. Display an error message
3. Allow the user to retry
4. Use cached data if available

## Testing

To test the integration:

1. **Search Books**
   - Go to Explore → Books tab
   - Search for "Dune" or any book title
   - See real results from Open Library

2. **Search Movies**
   - Go to Explore → Films tab
   - Search for "Oppenheimer" or any movie
   - See real results from TMDb

3. **Search Shows**
   - Go to Explore → TV Shows tab
   - Search for "Breaking Bad" or any show
   - See real results from TMDb

## Rate Limits

### Open Library
- ~Unlimited for public use
- Be respectful of their servers

### TMDb (Free Tier)
- 40 requests per 10 seconds
- 2 million requests per 24 hours

If you hit rate limits, the app will show a "Please try again later" message.

## Future Enhancements

- [ ] Caching search results
- [ ] Pagination for large result sets
- [ ] Detailed movie/show pages with cast info
- [ ] User ratings stored per item
- [ ] Recommendations based on library
- [ ] Multi-language support

## Troubleshooting

**Getting "No results found" even though items exist?**
- Check your internet connection
- Verify API keys in `src/config/apiConfig.ts`
- Check if you've hit the rate limit

**Images not loading?**
- The APIs might return images without URLs in certain cases
- The app will show a placeholder image

**App crashes on search?**
- Check the console for error messages
- Make sure you're on Expo Go or simulator
- Try a different search query

## Support

For issues with:
- **Open Library**: https://openlibrary.org/
- **TMDb**: https://www.themoviedb.org/about/stay-in-the-loop
