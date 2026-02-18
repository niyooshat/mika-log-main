import { LibraryItem } from "../types";

const OPEN_LIBRARY_SEARCH = "https://openlibrary.org/search.json";
const OPEN_LIBRARY_BASE = "https://openlibrary.org";

/**
 * Create a timeout signal that works on all platforms (polyfill for AbortSignal.timeout)
 */
function createTimeoutSignal(timeoutMs: number): AbortSignal {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller.signal;
}

/**
 * Create headers for TMDb API requests
 * Supports both API Key (v3) and Bearer Token (v4)
 */
function getTMDbHeaders(apiKeyOrToken: string): HeadersInit {
  // Check if it's a JWT token (starts with eyJ which is base64 encoded JSON)
  if (apiKeyOrToken.startsWith("eyJ")) {
    return {
      Authorization: `Bearer ${apiKeyOrToken}`,
      "Content-Type": "application/json",
    };
  }
  // For API keys, we'll use query params (no special headers needed)
  return {
    "Content-Type": "application/json",
  };
}

/**
 * Build TMDb URL with proper authentication
 */
function buildTMDbUrl(
  endpoint: string,
  apiKeyOrToken: string,
  params?: Record<string, string>,
): string {
  const url = new URL(`https://api.themoviedb.org/3${endpoint}`);

  // If it's an API key (not JWT), add it as query param
  if (!apiKeyOrToken.startsWith("eyJ")) {
    url.searchParams.append("api_key", apiKeyOrToken);
  }

  // Add additional params
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  return url.toString();
}

export interface OpenLibraryBook {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number; // This is the correct field name for cover ID
  isbn?: string[];
  ratings_average?: number;
}

export interface TMDbMovie {
  id: number;
  title: string;
  poster_path: string | null;
  overview: string;
  release_date?: string;
  vote_average?: number;
  genres?: number[];
}

export interface TMDbShow {
  id: number;
  name: string;
  poster_path: string | null;
  overview: string;
  first_air_date?: string;
  vote_average?: number;
  genres?: number[];
}

/**
 * Get cover URL from Open Library
 */
function getCoverUrl(
  book: OpenLibraryBook,
  size: "S" | "M" | "L" = "M",
): string {
  if (book.cover_i) {
    return `https://covers.openlibrary.org/b/id/${book.cover_i}-${size}.jpg`;
  }
  return "https://via.placeholder.com/200x300?text=No+Cover";
}

/**
 * Get book details from Open Library (includes description)
 */
async function getBookDetails(workKey: string): Promise<string> {
  try {
    const response = await fetch(`${OPEN_LIBRARY_BASE}${workKey}.json`);
    const data = await response.json();

    if (data.description) {
      if (typeof data.description === "string") {
        return data.description;
      } else if (data.description.value) {
        return data.description.value;
      }
    }
    return "No description available.";
  } catch (error) {
    console.error("Error fetching book details:", error);
    return "No description available.";
  }
}

/**
 * Get director from movie credits
 */
async function getMovieDirector(
  movieId: number,
  tmdbApiKey: string,
): Promise<string> {
  try {
    const url = buildTMDbUrl(`/movie/${movieId}/credits`, tmdbApiKey);
    const response = await fetch(url, {
      headers: getTMDbHeaders(tmdbApiKey),
      signal: createTimeoutSignal(5000),
    });
    const data = await response.json();
    const director = data.crew?.find(
      (person: any) => person.job === "Director",
    );
    return director?.name || "Unknown Director";
  } catch (error) {
    console.error(`Error fetching movie director for ${movieId}:`, error);
    return "Unknown Director";
  }
}

/**
 * Get creator from TV show details
 */
async function getShowCreator(
  showId: number,
  tmdbApiKey: string,
): Promise<string> {
  try {
    const url = buildTMDbUrl(`/tv/${showId}`, tmdbApiKey);
    const response = await fetch(url, {
      headers: getTMDbHeaders(tmdbApiKey),
      signal: createTimeoutSignal(5000),
    });
    const data = await response.json();
    const creator = data.created_by?.[0]?.name;
    return creator || "Unknown Creator";
  } catch (error) {
    console.error(`Error fetching show creator for ${showId}:`, error);
    return "Unknown Creator";
  }
}

/**
 * Get trending books by genre/subject from Open Library
 */
export const getTrendingBooksByGenre = async (
  subject: string = "fantasy",
  limit: number = 10,
): Promise<LibraryItem[]> => {
  try {
    const response = await fetch(
      `${OPEN_LIBRARY_BASE}/subjects/${encodeURIComponent(subject)}.json?limit=${limit}`,
      { signal: createTimeoutSignal(10000) },
    );
    const data = await response.json();

    // Map books without await inside - fetch descriptions in parallel but with limit
    const bookPromises = (data.works || [])
      .slice(0, limit)
      .map(async (book: any) => {
        // Try to get cover image from multiple possible field names
        let coverImage = "https://via.placeholder.com/200x300?text=No+Cover";

        // Try cover_i first (standard field)
        if (book.cover_i) {
          coverImage = `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;
        }
        // Try cover_id as fallback (subjects endpoint alternative)
        else if (book.cover_id) {
          coverImage = `https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg`;
        }
        // Try using ISBN
        else if (book.isbn && book.isbn.length > 0) {
          coverImage = `https://covers.openlibrary.org/b/isbn/${book.isbn[0]}-M.jpg`;
        }

        // Fetch description asynchronously but don't block on it
        const description = await getBookDetails(book.key).catch(
          () => "No description available",
        );

        return {
          id: `book_${book.key}`,
          type: "book" as const,
          title: book.title,
          authorDirector: book.authors?.[0]?.name || "Unknown Author",
          coverImage,
          synopsis: description,
          tags: [
            subject.charAt(0).toUpperCase() + subject.slice(1),
            "Trending",
          ],
          status: "want" as const,
          rating: undefined,
        };
      });

    // Use Promise.allSettled to prevent one failure from blocking all
    const results = await Promise.allSettled(bookPromises);
    return results
      .filter((result) => result.status === "fulfilled")
      .map((result) => (result as PromiseFulfilledResult<any>).value);
  } catch (error) {
    console.error(`Error fetching trending books for ${subject}:`, error);
    return [];
  }
};

/**
 * Search for books on Open Library API (optimized for performance)
 */
export const searchBooks = async (
  query: string,
  limit: number = 20,
): Promise<LibraryItem[]> => {
  try {
    const response = await fetch(
      `${OPEN_LIBRARY_SEARCH}?q=${encodeURIComponent(query)}&limit=${limit}`,
      { signal: createTimeoutSignal(10000) },
    );
    const data = await response.json();

    // Return results quickly without waiting for descriptions
    // Only fetch descriptions for first 5 results to keep it fast
    const docs = (data.docs || []).slice(0, limit);

    const results = docs.map((book: OpenLibraryBook, index: number) => ({
      id: `book_${book.key}`,
      type: "book" as const,
      title: book.title,
      authorDirector: book.author_name?.[0] || "Unknown Author",
      coverImage: getCoverUrl(book, "M"),
      synopsis: "No description available",
      tags: ["Fiction", "Literature"],
      status: "want" as const,
      rating: book.ratings_average
        ? Math.min(5, book.ratings_average / 2)
        : undefined,
    }));

    // Fetch descriptions in background for first 3 results only (non-blocking)
    const topResults = docs.slice(0, 3);
    topResults.forEach((book: OpenLibraryBook) => {
      getBookDetails(book.key)
        .then((desc) => {
          const resultIndex = results.findIndex(
            (r: LibraryItem) => r.id === `book_${book.key}`,
          );
          if (resultIndex !== -1) {
            results[resultIndex].synopsis = desc;
          }
        })
        .catch(() => {
          // Silently fail - keep placeholder description
        });
    });

    return results;
  } catch (error) {
    console.error("Error searching Open Library:", error);
    return [];
  }
};

/**
 * Search for movies on TMDb API
 * Note: You'll need to add a TMDb API key to environment variables
 */
export const searchMovies = async (
  query: string,
  tmdbApiKey: string,
  limit: number = 20,
): Promise<LibraryItem[]> => {
  try {
    const url = buildTMDbUrl("/search/movie", tmdbApiKey, {
      query: query,
      page: "1",
    });
    const response = await fetch(url, {
      headers: getTMDbHeaders(tmdbApiKey),
    });
    const data = await response.json();

    const movies = (data.results || []).slice(0, limit);
    const moviePromises = movies.map(async (movie: TMDbMovie) => {
      const director = await getMovieDirector(movie.id, tmdbApiKey);
      return {
        id: `film_${movie.id}`,
        type: "film" as const,
        title: movie.title,
        authorDirector: director,
        coverImage: movie.poster_path
          ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
          : "https://via.placeholder.com/200x300?text=No+Poster",
        synopsis: movie.overview || "No description available.",
        tags: ["Film", "Cinema"],
        status: "want" as const,
        rating: movie.vote_average ? movie.vote_average / 2 : undefined,
      };
    });

    const results = await Promise.allSettled(moviePromises);
    return results
      .filter((result) => result.status === "fulfilled")
      .map((result) => (result as PromiseFulfilledResult<any>).value);
  } catch (error) {
    console.error("Error searching TMDb movies:", error);
    return [];
  }
};

/**
 * Search for TV shows on TMDb API
 */
export const searchShows = async (
  query: string,
  tmdbApiKey: string,
  limit: number = 20,
): Promise<LibraryItem[]> => {
  try {
    const url = buildTMDbUrl("/search/tv", tmdbApiKey, {
      query: query,
      page: "1",
    });
    const response = await fetch(url, {
      headers: getTMDbHeaders(tmdbApiKey),
    });
    const data = await response.json();

    const shows = (data.results || []).slice(0, limit);
    const showPromises = shows.map(async (show: TMDbShow) => {
      const creator = await getShowCreator(show.id, tmdbApiKey);
      return {
        id: `show_${show.id}`,
        type: "show" as const,
        title: show.name,
        authorDirector: creator,
        coverImage: show.poster_path
          ? `https://image.tmdb.org/t/p/w300${show.poster_path}`
          : "https://via.placeholder.com/200x300?text=No+Poster",
        synopsis: show.overview || "No description available.",
        tags: ["Television", "Series"],
        status: "want" as const,
        rating: show.vote_average ? show.vote_average / 2 : undefined,
      };
    });

    const results = await Promise.allSettled(showPromises);
    return results
      .filter((result) => result.status === "fulfilled")
      .map((result) => (result as PromiseFulfilledResult<any>).value);
  } catch (error) {
    console.error("Error searching TMDb shows:", error);
    return [];
  }
};

/**
 * Get trending books from Open Library
 */
export const getTrendingBooks = async (
  limit: number = 10,
): Promise<LibraryItem[]> => {
  try {
    // Fetch popular books using a simple search query (more reliable across endpoints)
    const url = `${OPEN_LIBRARY_SEARCH}?q=fiction&limit=${limit}`;
    console.log("[API] getTrendingBooks fetching", url);
    const response = await fetch(url, { signal: createTimeoutSignal(10000) });

    if (!response.ok) {
      const text = await response.text().catch(() => "<no-body>");
      console.error(
        "[API] getTrendingBooks bad response",
        response.status,
        text,
      );
      return [];
    }

    const data = await response.json();

    // Map books - fetch descriptions asynchronously but don't block on them
    const bookPromises = (data.docs || [])
      .slice(0, limit)
      .map(async (book: OpenLibraryBook) => {
        // Fetch description but don't fail if it times out
        const description = await getBookDetails(book.key).catch(
          () => "No description available",
        );

        return {
          id: `book_${book.key}`,
          type: "book" as const,
          title: book.title,
          authorDirector: book.author_name?.[0] || "Unknown Author",
          coverImage: getCoverUrl(book, "M"),
          synopsis: description,
          tags: ["Fiction", "Trending"],
          status: "want" as const,
          rating: book.ratings_average
            ? Math.min(5, book.ratings_average / 2)
            : undefined,
        };
      });

    // Use Promise.allSettled to prevent one failure from blocking all
    const results = await Promise.allSettled(bookPromises);
    return results
      .filter((result) => result.status === "fulfilled")
      .map((result) => (result as PromiseFulfilledResult<any>).value);
  } catch (error) {
    console.error("Error fetching trending books:", error);
    return [];
  }
};

/**
 * Get trending movies from TMDb
 */
export const getTrendingMovies = async (
  tmdbApiKey: string,
  limit: number = 10,
): Promise<LibraryItem[]> => {
  try {
    const url = buildTMDbUrl("/trending/movie/week", tmdbApiKey);
    const response = await fetch(url, {
      headers: getTMDbHeaders(tmdbApiKey),
    });
    const data = await response.json();

    const movies = (data.results || []).slice(0, limit);
    const moviePromises = movies.map(async (movie: TMDbMovie) => {
      const director = await getMovieDirector(movie.id, tmdbApiKey);
      return {
        id: `film_${movie.id}`,
        type: "film" as const,
        title: movie.title,
        authorDirector: director,
        coverImage: movie.poster_path
          ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
          : "https://via.placeholder.com/200x300?text=No+Poster",
        synopsis: movie.overview || "No description available.",
        tags: ["Film", "Trending"],
        status: "want" as const,
        rating: movie.vote_average ? movie.vote_average / 2 : undefined,
      };
    });

    const results = await Promise.allSettled(moviePromises);
    return results
      .filter((result) => result.status === "fulfilled")
      .map((result) => (result as PromiseFulfilledResult<any>).value);
  } catch (error) {
    console.error("Error fetching trending movies:", error);
    return [];
  }
};

/**
 * Get trending TV shows from TMDb
 */
export const getTrendingShows = async (
  tmdbApiKey: string,
  limit: number = 10,
): Promise<LibraryItem[]> => {
  try {
    const url = buildTMDbUrl("/trending/tv/week", tmdbApiKey);
    const response = await fetch(url, {
      headers: getTMDbHeaders(tmdbApiKey),
    });
    const data = await response.json();

    const shows = (data.results || []).slice(0, limit);
    const showPromises = shows.map(async (show: TMDbShow) => {
      const creator = await getShowCreator(show.id, tmdbApiKey);
      return {
        id: `show_${show.id}`,
        type: "show" as const,
        title: show.name,
        authorDirector: creator,
        coverImage: show.poster_path
          ? `https://image.tmdb.org/t/p/w300${show.poster_path}`
          : "https://via.placeholder.com/200x300?text=No+Poster",
        synopsis: show.overview || "No description available.",
        tags: ["Television", "Trending"],
        status: "want" as const,
        rating: show.vote_average ? show.vote_average / 2 : undefined,
      };
    });

    const results = await Promise.allSettled(showPromises);
    return results
      .filter((result) => result.status === "fulfilled")
      .map((result) => (result as PromiseFulfilledResult<any>).value);
  } catch (error) {
    console.error("Error fetching trending shows:", error);
    return [];
  }
};
