import { getSupabase, isSupabaseConfigured } from "../config/supabaseClient";
import { LibraryItem, UserReview } from "../types";

/**
 * Helper to add timeout to promises
 */
function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 5000,
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), timeoutMs),
    ),
  ]);
}

/**
 * Supabase Database Service
 *
 * Expected Supabase table schemas:
 *
 * 1. library_items:
 *    - id (text, primary key)
 *    - user_id (uuid, foreign key to auth.users)
 *    - type (text: 'book' | 'film' | 'show')
 *    - title (text)
 *    - author_director (text)
 *    - cover_image (text)
 *    - synopsis (text)
 *    - tags (text[])
 *    - status (text: 'want' | 'current' | 'finished')
 *    - rating (numeric, nullable)
 *    - personal_rating (numeric, nullable)
 *    - personal_tags (text[], nullable)
 *    - personal_notes (text, nullable)
 *    - date_added (timestamptz)
 *    - created_at (timestamptz)
 *    - updated_at (timestamptz)
 *
 * 2. user_reviews:
 *    - id (text, primary key)
 *    - user_id (uuid, foreign key to auth.users)
 *    - item_id (text)
 *    - item_title (text)
 *    - item_cover_image (text)
 *    - item_type (text: 'book' | 'film' | 'show')
 *    - rating (numeric)
 *    - review_text (text)
 *    - tags (text[])
 *    - likes (integer, default 0)
 *    - created_at (timestamptz)
 *    - updated_at (timestamptz)
 */

// ==================== Library Items ====================

/**
 * Fetch all library items from Supabase
 */
export const fetchLibraryItems = async (): Promise<LibraryItem[]> => {
  const supabase = getSupabase();
  if (!isSupabaseConfigured() || !supabase) {
    console.log("[DB] Supabase not configured, skipping library items fetch");
    return [];
  }

  try {
    console.log("[DB] Fetching library items...");
    const query = supabase
      .from("library_items")
      .select("*")
      .order("date_added", { ascending: false });

    const { data, error } = await withTimeout(
      query as unknown as Promise<any>,
      5000,
    );

    if (error) throw error;

    console.log("[DB] Library items fetched:", data?.length || 0);
    return (data || []).map(dbItemToLibraryItem);
  } catch (error) {
    console.error("[DB] Error fetching library items:", error);
    return [];
  }
};

/**
 * Add or update a library item in Supabase
 */
export const upsertLibraryItem = async (
  item: LibraryItem,
): Promise<boolean> => {
  const supabase = getSupabase();
  if (!isSupabaseConfigured() || !supabase) {
    console.log("Supabase not configured, skipping upsert");
    return false;
  }

  try {
    const dbItem = libraryItemToDbItem(item);
    const query = supabase
      .from("library_items")
      .upsert(dbItem, { onConflict: "id" });

    const { error } = await withTimeout(query as unknown as Promise<any>, 5000);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error upserting library item:", error);
    return false;
  }
};

/**
 * Delete a library item from Supabase
 */
export const deleteLibraryItem = async (itemId: string): Promise<boolean> => {
  const supabase = getSupabase();
  if (!isSupabaseConfigured() || !supabase) {
    console.log("Supabase not configured, skipping delete");
    return false;
  }

  try {
    const { error } = await supabase
      .from("library_items")
      .delete()
      .eq("id", itemId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting library item:", error);
    return false;
  }
};

// ==================== User Reviews ====================

/**
 * Fetch all user reviews from Supabase
 */
export const fetchUserReviews = async (): Promise<UserReview[]> => {
  const supabase = getSupabase();
  if (!isSupabaseConfigured() || !supabase) {
    console.log("[DB] Supabase not configured, skipping reviews fetch");
    return [];
  }

  try {
    console.log("[DB] Fetching user reviews...");
    const query = supabase
      .from("user_reviews")
      .select("*")
      .order("created_at", { ascending: false });

    const { data, error } = await withTimeout(
      query as unknown as Promise<any>,
      5000,
    );

    if (error) throw error;

    console.log("[DB] User reviews fetched:", data?.length || 0);
    return (data || []).map(dbReviewToUserReview);
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    return [];
  }
};

/**
 * Add or update a user review in Supabase
 */
export const upsertUserReview = async (
  review: UserReview,
): Promise<boolean> => {
  const supabase = getSupabase();
  if (!isSupabaseConfigured() || !supabase) {
    console.log("Supabase not configured, skipping upsert");
    return false;
  }

  try {
    const dbReview = userReviewToDbReview(review);
    const { error } = await supabase
      .from("user_reviews")
      .upsert(dbReview, { onConflict: "id" });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error upserting user review:", error);
    return false;
  }
};

/**
 * Delete a user review from Supabase
 */
export const deleteUserReview = async (reviewId: string): Promise<boolean> => {
  const supabase = getSupabase();
  if (!isSupabaseConfigured() || !supabase) {
    console.log("Supabase not configured, skipping delete");
    return false;
  }

  try {
    const { error } = await supabase
      .from("user_reviews")
      .delete()
      .eq("id", reviewId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting user review:", error);
    return false;
  }
};

// ==================== Helper Functions ====================

/**
 * Convert database row to LibraryItem
 */
function dbItemToLibraryItem(dbItem: any): LibraryItem {
  return {
    id: dbItem.id,
    type: dbItem.type,
    title: dbItem.title,
    authorDirector: dbItem.author_director,
    coverImage: dbItem.cover_image,
    synopsis: dbItem.synopsis,
    tags: dbItem.tags || [],
    status: dbItem.status,
    rating: dbItem.rating,
    personalRating: dbItem.personal_rating,
    personalTags: dbItem.personal_tags,
    personalNotes: dbItem.personal_notes,
    dateAdded: dbItem.date_added,
  };
}

/**
 * Convert LibraryItem to database row
 */
function libraryItemToDbItem(item: LibraryItem): any {
  return {
    id: item.id,
    type: item.type,
    title: item.title,
    author_director: item.authorDirector,
    cover_image: item.coverImage,
    synopsis: item.synopsis,
    tags: item.tags,
    status: item.status,
    rating: item.rating,
    personal_rating: item.personalRating,
    personal_tags: item.personalTags,
    personal_notes: item.personalNotes,
    date_added: item.dateAdded || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Convert database row to UserReview
 */
function dbReviewToUserReview(dbReview: any): UserReview {
  return {
    id: dbReview.id,
    itemId: dbReview.item_id,
    itemTitle: dbReview.item_title,
    itemCoverImage: dbReview.item_cover_image,
    itemType: dbReview.item_type,
    rating: dbReview.rating,
    reviewText: dbReview.review_text,
    tags: dbReview.tags || [],
    createdAt: dbReview.created_at,
    likes: dbReview.likes || 0,
  };
}

/**
 * Convert UserReview to database row
 */
function userReviewToDbReview(review: UserReview): any {
  return {
    id: review.id,
    item_id: review.itemId,
    item_title: review.itemTitle,
    item_cover_image: review.itemCoverImage,
    item_type: review.itemType,
    rating: review.rating,
    review_text: review.reviewText,
    tags: review.tags,
    likes: review.likes || 0,
    created_at: review.createdAt,
    updated_at: new Date().toISOString(),
  };
}
