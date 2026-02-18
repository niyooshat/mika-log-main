export interface User {
  id: string;
  name: string;
  avatar: string;
}

export interface ReviewInteraction {
  id: string;
  reviewId: string;
  type: 'like' | 'comment';
  userId: string;
  userName: string;
  userAvatar: string;
  content?: string; // For comments
  createdAt: string;
}

export interface Post {
  id: string;
  author: User;
  title: string;
  review: string;
  coverImage: string;
  rating: number;
  type: 'book' | 'film' | 'show';
  tags: string[];
  createdAt: Date;
  itemId?: string; // Reference to library item
  likes?: number;
  comments?: ReviewInteraction[];
}

export interface UserReview {
  id: string;
  itemId: string;
  itemTitle: string;
  itemCoverImage: string;
  itemType: 'book' | 'film' | 'show';
  rating: number;
  reviewText: string;
  tags: string[];
  createdAt: string; // ISO date string
  likes?: number;
  comments?: ReviewInteraction[];
}

export type LibraryItemType = 'book' | 'film' | 'show';
export type LibraryItemStatus = 'want' | 'current' | 'finished';

export interface LibraryItem {
  id: string;
  type: LibraryItemType;
  title: string;
  authorDirector: string;
  coverImage: string;
  synopsis: string;
  tags: string[];
  status: LibraryItemStatus;
  rating?: number;
  personalRating?: number; // User's own rating (1-5)
  personalTags?: string[]; // User's custom tags
  personalNotes?: string; // User's personal notes/review
  dateAdded?: string; // ISO date string when added to library
}

