import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { API_CONFIG } from "../config/apiConfig";
import { isSupabaseConfigured } from "../config/supabaseClient";
import {
    getTrendingBooks,
    getTrendingMovies,
    getTrendingShows,
} from "../services/apiService";
import {
    deleteLibraryItem as deleteLibraryItemFromDb,
    deleteUserReview as deleteUserReviewFromDb,
    fetchLibraryItems,
    fetchUserReviews,
    upsertLibraryItem,
    upsertUserReview,
} from "../services/databaseService";
import { LibraryItem, LibraryItemStatus, UserReview } from "../types";

export interface UserProfile {
  username: string;
  bio: string;
  pronouns: string;
  profilePicture: string | null;
  favoriteBookIds: string[];
  favoriteFilmIds: string[];
  favoriteShowIds: string[];
}

interface LibraryContextType {
  libraryItems: LibraryItem[];
  userReviews: UserReview[];
  userProfile: UserProfile;
  isLoading: boolean;
  addToLibrary: (item: LibraryItem, status: LibraryItemStatus) => void;
  removeFromLibrary: (itemId: string) => void;
  updateItemStatus: (itemId: string, status: LibraryItemStatus) => void;
  updateItemRating: (itemId: string, rating: number) => void;
  updateItemTags: (itemId: string, tags: string[]) => void;
  updateItemNotes: (itemId: string, notes: string) => void;
  postReview: (review: UserReview) => void;
  deleteReview: (reviewId: string) => void;
  updateUserProfile: (profile: UserProfile) => void;
  getItemsByType: (type: string) => LibraryItem[];
  getItemsByStatus: (type: string, status: LibraryItemStatus) => LibraryItem[];
  getFavoritesByType: (type: "book" | "film" | "show") => LibraryItem[];
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);
const LIBRARY_STORAGE_KEY = "mikadiaryLibrary";
const REVIEWS_STORAGE_KEY = "mikadiaryReviews";
const PROFILE_STORAGE_KEY = "mikadiaryProfile";

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [userReviews, setUserReviews] = useState<UserReview[]>([]);
  const defaultProfile: UserProfile = {
    username: "Your Profile",
    bio: "Sharing my thoughts on books, films, and shows",
    pronouns: "",
    profilePicture: null,
    favoriteBookIds: [],
    favoriteFilmIds: [],
    favoriteShowIds: [],
  };
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultProfile);
  const [isLoading, setIsLoading] = useState(true);

  // Load from AsyncStorage and Supabase on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("[LibraryContext] Starting data load");

        // Try loading from Supabase first if configured
        if (isSupabaseConfigured()) {
          console.log("[LibraryContext] Supabase configured, fetching data");
          try {
            // Add timeout to prevent hanging on web
            const supabaseLoadPromise = Promise.all([
              fetchLibraryItems(),
              fetchUserReviews(),
            ]);
            const timeoutPromise = new Promise<never>((_, reject) =>
              setTimeout(
                () => reject(new Error("Supabase load timeout")),
                3000,
              ),
            );
            const [dbLibraryItems, dbReviews] = (await Promise.race([
              supabaseLoadPromise,
              timeoutPromise,
            ])) as [any[], any[]];

            console.log("[LibraryContext] Supabase load success:", {
              items: dbLibraryItems.length,
              reviews: dbReviews.length,
            });

            if (dbLibraryItems.length > 0) {
              setLibraryItems(dbLibraryItems);
            }

            if (dbReviews.length > 0) {
              setUserReviews(dbReviews);
            }

            // Also load profile from AsyncStorage (not synced to DB yet)
            const storedProfile =
              await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
            if (storedProfile) {
              const parsedProfile = JSON.parse(storedProfile);
              setUserProfile({ ...defaultProfile, ...parsedProfile });
            }

            // If we got data from Supabase, we're done
            if (dbLibraryItems.length > 0 || dbReviews.length > 0) {
              console.log(
                "[LibraryContext] Loaded from Supabase, skipping AsyncStorage",
              );
              return;
            }
          } catch (error) {
            console.warn(
              "[LibraryContext] Supabase load failed, falling back to AsyncStorage:",
              error,
            );
          }
        } else {
          console.log("[LibraryContext] Supabase not configured");
        }

        // Fallback to AsyncStorage if Supabase not configured or empty
        console.log("[LibraryContext] Loading from AsyncStorage");
        const [storedLibrary, storedReviews, storedProfile] = await Promise.all(
          [
            AsyncStorage.getItem(LIBRARY_STORAGE_KEY),
            AsyncStorage.getItem(REVIEWS_STORAGE_KEY),
            AsyncStorage.getItem(PROFILE_STORAGE_KEY),
          ],
        );

        if (storedLibrary) {
          setLibraryItems(JSON.parse(storedLibrary));
        } else {
          // Load initial trending data if no stored library
          await loadInitialData();
        }

        if (storedReviews) {
          setUserReviews(JSON.parse(storedReviews));
        }

        if (storedProfile) {
          const parsedProfile = JSON.parse(storedProfile);
          setUserProfile({ ...defaultProfile, ...parsedProfile });
        }
      } catch (error) {
        console.error(
          "[LibraryContext] Error loading data from storage:",
          error,
        );
      } finally {
        console.log("[LibraryContext] Data load complete");
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Load initial data from APIs
  const loadInitialData = async () => {
    try {
      const [books, films, shows] = await Promise.all([
        getTrendingBooks(5),
        getTrendingMovies(API_CONFIG.TMDB_API_KEY, 5),
        getTrendingShows(API_CONFIG.TMDB_API_KEY, 5),
      ]);

      const initialItems = [...books, ...films, ...shows];
      setLibraryItems(initialItems);
    } catch (error) {
      console.error("Error loading initial data:", error);
    }
  };

  // Save library items to AsyncStorage and Supabase whenever they change
  useEffect(() => {
    if (!isLoading) {
      const saveLibraryItems = async () => {
        try {
          // Always save to AsyncStorage for offline support
          await AsyncStorage.setItem(
            LIBRARY_STORAGE_KEY,
            JSON.stringify(libraryItems),
          );

          // Sync to Supabase if configured
          if (isSupabaseConfigured()) {
            // Note: Individual items are synced in their respective functions
            // This is just a safety backup
          }
        } catch (error) {
          console.error("Error saving library to storage:", error);
        }
      };

      saveLibraryItems();
    }
  }, [libraryItems, isLoading]);

  // Save user reviews to AsyncStorage and Supabase whenever they change
  useEffect(() => {
    if (!isLoading) {
      const saveUserReviews = async () => {
        try {
          // Always save to AsyncStorage for offline support
          await AsyncStorage.setItem(
            REVIEWS_STORAGE_KEY,
            JSON.stringify(userReviews),
          );

          // Sync to Supabase if configured
          if (isSupabaseConfigured()) {
            // Note: Individual reviews are synced in their respective functions
            // This is just a safety backup
          }
        } catch (error) {
          console.error("Error saving reviews to storage:", error);
        }
      };

      saveUserReviews();
    }
  }, [userReviews, isLoading]);

  // Save user profile to AsyncStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      const saveUserProfile = async () => {
        try {
          await AsyncStorage.setItem(
            PROFILE_STORAGE_KEY,
            JSON.stringify(userProfile),
          );
        } catch (error) {
          console.error("Error saving profile to storage:", error);
        }
      };

      saveUserProfile();
    }
  }, [userProfile, isLoading]);

  const addToLibrary = async (item: LibraryItem, status: LibraryItemStatus) => {
    const updatedItem = {
      ...item,
      status,
      dateAdded: item.dateAdded || new Date().toISOString(),
    };

    setLibraryItems((prev) => {
      // Check if item already exists
      const exists = prev.some((i) => i.id === item.id);
      if (exists) {
        // Update status if item already exists
        return prev.map((i) => (i.id === item.id ? { ...i, status } : i));
      }
      // Add new item with date added
      return [...prev, updatedItem];
    });

    // Sync to Supabase
    if (isSupabaseConfigured()) {
      await upsertLibraryItem(updatedItem);
    }
  };

  const removeFromLibrary = async (itemId: string) => {
    setLibraryItems((prev) => prev.filter((item) => item.id !== itemId));

    // Sync to Supabase
    if (isSupabaseConfigured()) {
      await deleteLibraryItemFromDb(itemId);
    }
  };

  const updateItemStatus = async (
    itemId: string,
    status: LibraryItemStatus,
  ) => {
    let updatedItem: LibraryItem | undefined;

    setLibraryItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          updatedItem = { ...item, status };
          return updatedItem;
        }
        return item;
      }),
    );

    // Sync to Supabase
    if (isSupabaseConfigured() && updatedItem) {
      await upsertLibraryItem(updatedItem);
    }
  };

  const updateItemRating = async (itemId: string, rating: number) => {
    let updatedItem: LibraryItem | undefined;

    setLibraryItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          updatedItem = { ...item, personalRating: rating };
          return updatedItem;
        }
        return item;
      }),
    );

    // Sync to Supabase
    if (isSupabaseConfigured() && updatedItem) {
      await upsertLibraryItem(updatedItem);
    }
  };

  const updateItemTags = async (itemId: string, tags: string[]) => {
    let updatedItem: LibraryItem | undefined;

    setLibraryItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          updatedItem = { ...item, personalTags: tags };
          return updatedItem;
        }
        return item;
      }),
    );

    // Sync to Supabase
    if (isSupabaseConfigured() && updatedItem) {
      await upsertLibraryItem(updatedItem);
    }
  };

  const updateItemNotes = async (itemId: string, notes: string) => {
    let updatedItem: LibraryItem | undefined;

    setLibraryItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          updatedItem = { ...item, personalNotes: notes };
          return updatedItem;
        }
        return item;
      }),
    );

    // Sync to Supabase
    if (isSupabaseConfigured() && updatedItem) {
      await upsertLibraryItem(updatedItem);
    }
  };

  const getItemsByType = (type: string) => {
    return libraryItems.filter((item) => item.type === type);
  };

  const getItemsByStatus = (type: string, status: LibraryItemStatus) => {
    return libraryItems.filter(
      (item) => item.type === type && item.status === status,
    );
  };

  const postReview = async (review: UserReview) => {
    const newReview = { ...review, id: review.id || Date.now().toString() };

    // Add the review
    setUserReviews((prev) => [newReview, ...prev]);

    // Update the library item with rating and notes if it exists in library
    // Otherwise, add it to the library as a finished item with the review details
    let updatedOrNewItem: LibraryItem | undefined;

    setLibraryItems((prev) => {
      const existingItemIndex = prev.findIndex(
        (item) => item.id === review.itemId,
      );

      if (existingItemIndex >= 0) {
        // Update existing item with rating and notes
        const updated = [...prev];
        updatedOrNewItem = {
          ...updated[existingItemIndex],
          personalRating: review.rating,
          personalNotes: review.reviewText,
          personalTags: review.tags,
        };
        updated[existingItemIndex] = updatedOrNewItem;
        return updated;
      } else {
        // Add new item to library as finished with review details
        updatedOrNewItem = {
          id: review.itemId,
          type: review.itemType,
          title: review.itemTitle,
          authorDirector: "Unknown",
          coverImage: review.itemCoverImage,
          synopsis: "",
          tags: review.tags,
          status: "finished",
          personalRating: review.rating,
          personalNotes: review.reviewText,
          personalTags: review.tags,
          dateAdded: new Date().toISOString(),
        };
        return [...prev, updatedOrNewItem];
      }
    });

    // Sync to Supabase
    if (isSupabaseConfigured()) {
      await upsertUserReview(newReview);
      if (updatedOrNewItem) {
        await upsertLibraryItem(updatedOrNewItem);
      }
    }
  };

  const deleteReview = async (reviewId: string) => {
    setUserReviews((prev) => prev.filter((review) => review.id !== reviewId));

    // Sync to Supabase
    if (isSupabaseConfigured()) {
      await deleteUserReviewFromDb(reviewId);
    }
  };

  const updateUserProfile = (profile: UserProfile) => {
    setUserProfile(profile);
  };

  const getFavoritesByType = (
    type: "book" | "film" | "show",
  ): LibraryItem[] => {
    let favoriteIds: string[] = [];

    if (type === "book") {
      favoriteIds = userProfile.favoriteBookIds;
    } else if (type === "film") {
      favoriteIds = userProfile.favoriteFilmIds;
    } else {
      favoriteIds = userProfile.favoriteShowIds;
    }

    return libraryItems.filter((item) => favoriteIds.includes(item.id));
  };

  return (
    <LibraryContext.Provider
      value={{
        libraryItems,
        userReviews,
        userProfile,
        isLoading,
        addToLibrary,
        removeFromLibrary,
        updateItemStatus,
        updateItemRating,
        updateItemTags,
        updateItemNotes,
        postReview,
        deleteReview,
        updateUserProfile,
        getItemsByType,
        getItemsByStatus,
        getFavoritesByType,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error("useLibrary must be used within LibraryProvider");
  }
  return context;
};
