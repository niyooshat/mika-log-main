/**
 * API Configuration
 * 
 * TMDB API Key: Used for movies and TV shows
 * Get your free key at: https://www.themoviedb.org/settings/api
 * 
 * Open Library API: No key required (free to use)
 */

export const API_CONFIG = {
  TMDB_API_KEY: process.env.EXPO_PUBLIC_TMDB_API_KEY || 'e5ece594eaeda9520fed72231336fc97',
  OPEN_LIBRARY_BASE: 'https://openlibrary.org',
  TMDB_BASE: 'https://api.themoviedb.org/3',
  TMDB_IMAGE_BASE: 'https://image.tmdb.org/t/p',
};

/**
 * To set up your own API keys:
 * 
 * 1. Create a .env.local file in the project root
 * 2. Add your keys:
 *    EXPO_PUBLIC_TMDB_API_KEY=your_api_key_here
 * 
 * The EXPO_PUBLIC_ prefix makes it available to the app
 */
