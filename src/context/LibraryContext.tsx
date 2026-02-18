import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LibraryItem, LibraryItemStatus, UserReview } from '../types';
import { getTrendingBooks, getTrendingMovies, getTrendingShows } from '../services/apiService';
import { API_CONFIG } from '../config/apiConfig';

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
  getFavoritesByType: (type: 'book' | 'film' | 'show') => LibraryItem[];
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);
const LIBRARY_STORAGE_KEY = 'mikadiaryLibrary';
const REVIEWS_STORAGE_KEY = 'mikadiaryReviews';
const PROFILE_STORAGE_KEY = 'mikadiaryProfile';

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [userReviews, setUserReviews] = useState<UserReview[]>([]);
  const defaultProfile: UserProfile = {
    username: 'Your Profile',
    bio: 'Sharing my thoughts on books, films, and shows',
    pronouns: '',
    profilePicture: null,
    favoriteBookIds: [],
    favoriteFilmIds: [],
    favoriteShowIds: [],
  };
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultProfile);
  const [isLoading, setIsLoading] = useState(true);

  // Load from AsyncStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [storedLibrary, storedReviews, storedProfile] = await Promise.all([
          AsyncStorage.getItem(LIBRARY_STORAGE_KEY),
          AsyncStorage.getItem(REVIEWS_STORAGE_KEY),
          AsyncStorage.getItem(PROFILE_STORAGE_KEY),
        ]);

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
        console.error('Error loading data from storage:', error);
      } finally {
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
      console.error('Error loading initial data:', error);
    }
  };

  // Save library items to AsyncStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      const saveLibraryItems = async () => {
        try {
          await AsyncStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(libraryItems));
        } catch (error) {
          console.error('Error saving library to storage:', error);
        }
      };

      saveLibraryItems();
    }
  }, [libraryItems, isLoading]);

  // Save user reviews to AsyncStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      const saveUserReviews = async () => {
        try {
          await AsyncStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(userReviews));
        } catch (error) {
          console.error('Error saving reviews to storage:', error);
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
          await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(userProfile));
        } catch (error) {
          console.error('Error saving profile to storage:', error);
        }
      };

      saveUserProfile();
    }
  }, [userProfile, isLoading]);

  const addToLibrary = (item: LibraryItem, status: LibraryItemStatus) => {
    setLibraryItems((prev) => {
      // Check if item already exists
      const exists = prev.some((i) => i.id === item.id);
      if (exists) {
        // Update status if item already exists
        return prev.map((i) => (i.id === item.id ? { ...i, status } : i));
      }
      // Add new item with date added
      return [...prev, { ...item, status, dateAdded: new Date().toISOString() }];
    });
  };

  const removeFromLibrary = (itemId: string) => {
    setLibraryItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateItemStatus = (itemId: string, status: LibraryItemStatus) => {
    setLibraryItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, status } : item))
    );
  };

  const updateItemRating = (itemId: string, rating: number) => {
    setLibraryItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, personalRating: rating } : item))
    );
  };

  const updateItemTags = (itemId: string, tags: string[]) => {
    setLibraryItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, personalTags: tags } : item))
    );
  };

  const updateItemNotes = (itemId: string, notes: string) => {
    setLibraryItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, personalNotes: notes } : item))
    );
  };

  const getItemsByType = (type: string) => {
    return libraryItems.filter((item) => item.type === type);
  };

  const getItemsByStatus = (type: string, status: LibraryItemStatus) => {
    return libraryItems.filter((item) => item.type === type && item.status === status);
  };

  const postReview = (review: UserReview) => {
    // Add the review
    setUserReviews((prev) => [{ ...review, id: Date.now().toString() }, ...prev]);
    
    // Update the library item with rating and notes if it exists in library
    // Otherwise, add it to the library as a finished item with the review details
    setLibraryItems((prev) => {
      const existingItemIndex = prev.findIndex((item) => item.id === review.itemId);
      
      if (existingItemIndex >= 0) {
        // Update existing item with rating and notes
        const updated = [...prev];
        updated[existingItemIndex] = {
          ...updated[existingItemIndex],
          personalRating: review.rating,
          personalNotes: review.reviewText,
          personalTags: review.tags,
        };
        return updated;
      } else {
        // Add new item to library as finished with review details
        const newItem: LibraryItem = {
          id: review.itemId,
          type: review.itemType,
          title: review.itemTitle,
          authorDirector: 'Unknown',
          coverImage: review.itemCoverImage,
          synopsis: '',
          tags: review.tags,
          status: 'finished',
          personalRating: review.rating,
          personalNotes: review.reviewText,
          personalTags: review.tags,
          dateAdded: new Date().toISOString(),
        };
        return [...prev, newItem];
      }
    });
  };

  const deleteReview = (reviewId: string) => {
    setUserReviews((prev) => prev.filter((review) => review.id !== reviewId));
  };

  const updateUserProfile = (profile: UserProfile) => {
    setUserProfile(profile);
  };

  const getFavoritesByType = (type: 'book' | 'film' | 'show'): LibraryItem[] => {
    let favoriteIds: string[] = [];
    
    if (type === 'book') {
      favoriteIds = userProfile.favoriteBookIds;
    } else if (type === 'film') {
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
      }}>
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within LibraryProvider');
  }
  return context;
};
