import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
    Alert,
    Dimensions,
    Image,
    Modal,
    RefreshControl,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { useLibrary } from "../context/LibraryContext";
import { LibraryItem } from "../types";
import EditProfileScreen from "./EditProfileScreen";

const { width } = Dimensions.get("window");

export default function ProfileScreen() {
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showReviewDetail, setShowReviewDetail] = useState(false);
  const [selectedFavorite, setSelectedFavorite] = useState<LibraryItem | null>(
    null,
  );
  const [refreshing, setRefreshing] = useState(false);
  const {
    libraryItems,
    userReviews,
    userProfile,
    getItemsByType,
    getFavoritesByType,
  } = useLibrary();
  const { signOut, user } = useAuth();

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => signOut() },
    ]);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  };

  // Calculate stats from library data
  const stats = useMemo(() => {
    const finishedItems = libraryItems.filter(
      (item) => item.status === "finished",
    );
    return {
      reviewsCount: userReviews.length,
      booksCount: getItemsByType("book").length,
      filmsCount: getItemsByType("film").length,
      showsCount: getItemsByType("show").length,
      finishedCount: finishedItems.length,
    };
  }, [libraryItems, userReviews, getItemsByType]);

  // Get favorites or top rated as fallback
  const favoritesByCategory = useMemo(() => {
    return {
      books:
        getFavoritesByType("book").length > 0
          ? getFavoritesByType("book")
          : libraryItems
              .filter(
                (item) =>
                  item.type === "book" &&
                  item.status === "finished" &&
                  item.personalRating,
              )
              .sort((a, b) => (b.personalRating || 0) - (a.personalRating || 0))
              .slice(0, 4),
      films:
        getFavoritesByType("film").length > 0
          ? getFavoritesByType("film")
          : libraryItems
              .filter(
                (item) =>
                  item.type === "film" &&
                  item.status === "finished" &&
                  item.personalRating,
              )
              .sort((a, b) => (b.personalRating || 0) - (a.personalRating || 0))
              .slice(0, 4),
      shows:
        getFavoritesByType("show").length > 0
          ? getFavoritesByType("show")
          : libraryItems
              .filter(
                (item) =>
                  item.type === "show" &&
                  item.status === "finished" &&
                  item.personalRating,
              )
              .sort((a, b) => (b.personalRating || 0) - (a.personalRating || 0))
              .slice(0, 4),
    };
  }, [libraryItems, getFavoritesByType]);

  // Get recent reviews
  const recentReviews = useMemo(() => {
    return userReviews
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5);
  }, [userReviews]);

  const handleEditProfile = () => {
    setShowEditProfile(true);
  };

  const handleShareProfile = async () => {
    try {
      await Share.share({
        message: `Check out my MikaDiary profile! ${stats.reviewsCount} reviews so far.`,
        title: "My MikaDiary Profile",
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleFavoritePress = (item: LibraryItem) => {
    setSelectedFavorite(item);
    setShowReviewDetail(true);
  };

  const handleCloseReviewDetail = () => {
    setShowReviewDetail(false);
    setSelectedFavorite(null);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <MaterialCommunityIcons
          key={`full-${i}`}
          name="star"
          size={20}
          color="#d4849b"
        />,
      );
    }

    if (hasHalfStar) {
      stars.push(
        <MaterialCommunityIcons
          key="half"
          name="star-half-full"
          size={20}
          color="#d4849b"
        />,
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <MaterialCommunityIcons
          key={`empty-${i}`}
          name="star-outline"
          size={20}
          color="#999"
        />,
      );
    }

    return stars;
  };

  const renderReviewDetailModal = () => {
    if (!selectedFavorite) return null;

    const getUserReviewForItem = (itemId?: string) => {
      if (!itemId) return null;
      return userReviews.find((review) => review.itemId === itemId) || null;
    };

    return (
      <Modal
        visible={showReviewDetail}
        animationType="slide"
        onRequestClose={handleCloseReviewDetail}
      >
        <SafeAreaView style={styles.detailContainer} edges={["top"]}>
          {/* Header with Back Button */}
          <View style={styles.detailHeader}>
            <TouchableOpacity
              onPress={handleCloseReviewDetail}
              style={styles.backButton}
            >
              <MaterialCommunityIcons
                name="chevron-left"
                size={24}
                color="#d4849b"
              />
            </TouchableOpacity>
            <Text style={styles.detailHeaderTitle}>
              {selectedFavorite.title}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView
            style={styles.detailContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Cover Image */}
            <View style={styles.coverImageContainer}>
              <Image
                source={{ uri: selectedFavorite.coverImage }}
                style={styles.detailCoverImage}
                resizeMode="cover"
              />
            </View>

            {/* Detail Info Section */}
            <View style={styles.detailInfo}>
              <Text style={styles.detailTitle}>{selectedFavorite.title}</Text>
              <Text style={styles.detailAuthor}>
                {selectedFavorite.type === "book" ? "by " : "directed by "}
                {selectedFavorite.authorDirector}
              </Text>

              {/* Tags */}
              {(selectedFavorite.personalTags || selectedFavorite.tags)
                ?.length > 0 && (
                <View style={styles.detailTagsContainer}>
                  {(
                    selectedFavorite.personalTags || selectedFavorite.tags
                  )?.map((tag, index) => (
                    <View key={index} style={styles.detailTag}>
                      <Text style={styles.detailTagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Rating */}
              {selectedFavorite.personalRating && (
                <View style={styles.detailRatingContainer}>
                  <View style={styles.stars}>
                    {renderStars(selectedFavorite.personalRating)}
                  </View>
                  <Text style={styles.detailRatingText}>
                    {selectedFavorite.personalRating.toFixed(1)} / 5.0
                  </Text>
                </View>
              )}

              {/* Description */}
              {selectedFavorite.synopsis && (
                <>
                  <Text style={styles.synopsisTitle}>Description</Text>
                  <Text style={styles.synopsis}>
                    {selectedFavorite.synopsis}
                  </Text>
                </>
              )}
            </View>

            {/* My Activity Section */}
            {(() => {
              const userReview = getUserReviewForItem(selectedFavorite.id);
              if (!userReview) return null;
              return (
                <View style={styles.myActivitySection}>
                  <Text style={styles.myActivityTitle}>My Activity</Text>
                  <View style={styles.myActivityContent}>
                    {userReview.reviewText && (
                      <Text style={styles.myActivityText}>
                        {userReview.reviewText}
                      </Text>
                    )}
                    {userReview.rating && (
                      <View style={styles.myActivityRating}>
                        <View style={styles.myActivityStars}>
                          {renderStars(userReview.rating)}
                        </View>
                        <Text style={styles.myActivityRatingText}>
                          {userReview.rating.toFixed(1)} / 5.0
                        </Text>
                      </View>
                    )}
                    {userReview.tags && userReview.tags.length > 0 && (
                      <View style={styles.myActivityTags}>
                        {userReview.tags.map((tag, index) => (
                          <View key={index} style={styles.myActivityTag}>
                            <Text style={styles.myActivityTagText}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              );
            })()}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  const renderFavoritesGrid = (items: any[]) => {
    if (items.length === 0) {
      return (
        <Text style={styles.emptyText}>
          No finished items yet. Add some to your library!
        </Text>
      );
    }

    // Always render 4 slots so size stays consistent even with fewer items
    const displayItems = items.slice(0, 4);
    const slots = Array.from({ length: 4 });

    return (
      <View style={styles.favoritesGrid}>
        {slots.map((_, idx) => {
          const item = displayItems[idx];
          return (
            <TouchableOpacity
              key={idx}
              style={styles.favoriteItemWrapper}
              onPress={() => item && handleFavoritePress(item)}
              activeOpacity={item ? 0.7 : 1}
            >
              {item ? (
                <>
                  <Image
                    source={{ uri: item.coverImage }}
                    style={styles.favoriteCover}
                  />
                  <Text style={styles.favoriteTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                </>
              ) : (
                // Placeholder to preserve layout
                <>
                  <View style={styles.favoriteCoverPlaceholder} />
                  <Text
                    style={styles.favoriteTitlePlaceholder}
                    numberOfLines={1}
                  ></Text>
                </>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Profile</Text>
        <View style={styles.iconButtonsContainer}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleShareProfile}
            activeOpacity={0.6}
          >
            <MaterialCommunityIcons
              name="share-variant"
              size={20}
              color="#d4849b"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleEditProfile}
            activeOpacity={0.6}
          >
            <MaterialCommunityIcons name="cog" size={20} color="#d4849b" />
          </TouchableOpacity>
          {user ? (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleSignOut}
              activeOpacity={0.6}
            >
              <MaterialCommunityIcons name="logout" size={20} color="#d4849b" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#d4849b"
            title="Pull to refresh"
          />
        }
      >
        {/* Profile Header */}
        <View style={styles.header}>
          {/* Profile Picture */}
          <View style={styles.profileImage}>
            {userProfile.profilePicture ? (
              <Image
                source={{ uri: userProfile.profilePicture }}
                style={styles.profileImageContent}
              />
            ) : (
              <MaterialCommunityIcons
                name="account-circle"
                size={80}
                color="#d4849b"
              />
            )}
          </View>

          {/* Name */}
          <Text style={styles.name}>
            {userProfile.username || "Your Profile"}
          </Text>

          {/* Pronouns - if set */}
          {userProfile.pronouns && (
            <Text style={styles.pronouns}>{userProfile.pronouns}</Text>
          )}

          {/* Bio */}
          <Text style={styles.bio}>{userProfile.bio}</Text>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.reviewsCount}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.finishedCount}</Text>
            <Text style={styles.statLabel}>Finished</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {stats.booksCount + stats.filmsCount + stats.showsCount}
            </Text>
            <Text style={styles.statLabel}>In Library</Text>
          </View>
        </View>

        {/* Sections */}
        <View style={styles.sectionsContainer}>
          {/* Favorite Books */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Favorite Books</Text>
            {renderFavoritesGrid(favoritesByCategory.books)}
          </View>

          {/* Favorite Films */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Favorite Films</Text>
            {renderFavoritesGrid(favoritesByCategory.films)}
          </View>

          {/* Favorite Shows */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Favorite TV Shows</Text>
            {renderFavoritesGrid(favoritesByCategory.shows)}
          </View>

          {/* Recent Reviews */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Reviews</Text>
            </View>
            {recentReviews.length > 0 ? (
              recentReviews.map((review) => (
                <View key={review.id} style={styles.reviewItem}>
                  <Text style={styles.reviewTitle} numberOfLines={1}>
                    {review.itemTitle}
                  </Text>
                  <View style={styles.reviewMeta}>
                    <Text style={styles.reviewRating}>â­ {review.rating}</Text>
                    <Text style={styles.reviewDate}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.placeholderText}>
                No reviews yet. Write one to get started!
              </Text>
            )}
          </View>

          {/* Settings */}
          <View style={styles.section}>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingContent}>
                <MaterialCommunityIcons name="cog" size={20} color="#d4849b" />
                <Text style={styles.settingText}>Settings</Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color="#ccc"
              />
            </TouchableOpacity>
          </View>

          {/* About */}
          <View style={styles.section}>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingContent}>
                <MaterialCommunityIcons
                  name="information"
                  size={20}
                  color="#d4849b"
                />
                <Text style={styles.settingText}>About MikaDiary</Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color="#fff"
              />
            </TouchableOpacity>
          </View>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <EditProfileScreen
        isVisible={showEditProfile}
        onClose={() => setShowEditProfile(false)}
      />

      {/* Review Detail Modal */}
      {renderReviewDetailModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fdf6ee",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: "#e8ddd0",
    backgroundColor: "#f5ead8",
  },
  topBarTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#6b5040",
    letterSpacing: 2,
    fontStyle: "italic",
  },
  iconButtonsContainer: {
    flexDirection: "row",
    gap: 10,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#f9e8ed",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e8ddd0",
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    borderBottomWidth: 1.5,
    borderBottomColor: "#e8ddd0",
    backgroundColor: "#fffaf5",
  },
  profileImage: {
    width: 86,
    height: 86,
    borderRadius: 43,
    marginBottom: 10,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#f2c5ce",
  },
  profileImageContent: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
  },
  name: {
    fontSize: 20,
    fontWeight: "800",
    color: "#6b5040",
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  pronouns: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9aaa8a",
    marginBottom: 6,
  },
  bio: {
    fontSize: 13,
    lineHeight: 18,
    color: "#9e8a78",
    textAlign: "center",
    marginBottom: 0,
    paddingHorizontal: 8,
  },
  statsContainer: {
    flexDirection: "row",
    paddingVertical: 18,
    paddingHorizontal: 16,
    backgroundColor: "#f5ead8",
    borderBottomWidth: 1.5,
    borderBottomColor: "#e8ddd0",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "800",
    color: "#6b5040",
    marginBottom: 3,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9e8a78",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1.5,
    backgroundColor: "#e8ddd0",
  },
  sectionsContainer: {
    paddingVertical: 8,
  },
  section: {
    borderBottomWidth: 1,
    borderBottomColor: "#e8ddd0",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  favoritesGrid: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  favoriteItemWrapper: {
    width: "23%",
    alignItems: "center",
  },
  favoriteCover: {
    width: "100%",
    aspectRatio: 2 / 3,
    borderRadius: 10,
    backgroundColor: "#e8ddd0",
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#e8ddd0",
  },
  favoriteCoverPlaceholder: {
    width: "100%",
    aspectRatio: 2 / 3,
    borderRadius: 10,
    backgroundColor: "#f5ead8",
    borderWidth: 1.5,
    borderColor: "#e8ddd0",
    borderStyle: "dashed",
    marginBottom: 6,
  },
  favoriteTitlePlaceholder: {
    height: 12,
    width: "80%",
    backgroundColor: "transparent",
    marginBottom: 4,
  },
  favoriteTitle: {
    fontSize: 10,
    fontWeight: "600",
    color: "#6b5040",
    textAlign: "center",
    lineHeight: 13,
  },
  favoriteRating: {
    fontSize: 10,
    fontWeight: "600",
    color: "#d4849b",
    marginTop: 2,
  },
  emptyText: {
    fontSize: 13,
    color: "#9e8a78",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 12,
  },
  reviewItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e8ddd0",
  },
  reviewTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b5040",
    marginBottom: 4,
  },
  reviewMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewRating: {
    fontSize: 12,
    fontWeight: "700",
    color: "#d4849b",
  },
  reviewDate: {
    fontSize: 11,
    color: "#9e8a78",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#6b5040",
  },
  placeholderText: {
    fontSize: 13,
    color: "#9e8a78",
    fontStyle: "italic",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  settingContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6b5040",
  },
  logoutButton: {
    marginHorizontal: 16,
    marginVertical: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "#f9e8ed",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#e8a0b0",
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#d4849b",
  },
  detailContainer: {
    flex: 1,
    backgroundColor: "#fdf6ee",
  },
  detailHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#f5ead8",
    borderBottomWidth: 1.5,
    borderBottomColor: "#e8ddd0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  detailHeaderTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#6b5040",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 8,
  },
  detailContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  coverImageContainer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  detailCoverImage: {
    width: 140,
    aspectRatio: 2 / 3,
    borderRadius: 14,
    backgroundColor: "#e8ddd0",
    shadowColor: "#6b5040",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 5,
  },
  detailInfo: {
    backgroundColor: "#fffaf5",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: "#e8ddd0",
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#6b5040",
    marginBottom: 4,
  },
  detailAuthor: {
    fontSize: 13,
    color: "#9aaa8a",
    fontWeight: "600",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  detailTagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  detailTag: {
    backgroundColor: "#f9e8ed",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e8a0b0",
  },
  detailTagText: {
    fontSize: 11,
    color: "#d4849b",
    fontWeight: "600",
  },
  detailRatingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  stars: {
    flexDirection: "row",
    gap: 2,
  },
  detailRatingText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6b5040",
  },
  synopsisTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#9e8a78",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  synopsis: {
    fontSize: 14,
    color: "#6b5040",
    lineHeight: 22,
  },
  myActivitySection: {
    backgroundColor: "#ede5f5",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: "#c8b4d4",
  },
  myActivityTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#6b5040",
    marginBottom: 12,
  },
  myActivityContent: {
    gap: 10,
  },
  myActivityText: {
    fontSize: 13,
    color: "#6b5040",
    lineHeight: 20,
  },
  myActivityRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  myActivityStars: {
    flexDirection: "row",
    gap: 2,
  },
  myActivityRatingText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b5040",
  },
  myActivityTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  myActivityTag: {
    backgroundColor: "#f9e8ed",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e8a0b0",
  },
  myActivityTagText: {
    fontSize: 11,
    color: "#d4849b",
    fontWeight: "600",
  },
  detailNotesSection: {
    backgroundColor: "#fffaf5",
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: "#e8ddd0",
  },
  detailNotesTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#6b5040",
    marginBottom: 12,
  },
  detailNotesText: {
    fontSize: 13,
    color: "#6b5040",
    lineHeight: 20,
  },
  scrollContent: {
    flexGrow: 1,
  },
  detailCoverContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  detailTitleSection: {
    marginBottom: 16,
  },
  detailType: {
    fontSize: 13,
    fontWeight: "700",
    color: "#9aaa8a",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  detailMyActivitySection: {
    backgroundColor: "#ede5f5",
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: "#c8b4d4",
  },
  detailMyActivityTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#6b5040",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailMyActivityContent: {
    gap: 12,
  },
  detailMyActivityText: {
    fontSize: 14,
    color: "#6b5040",
    lineHeight: 22,
  },
  detailMyActivityRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailMyActivityStars: {
    flexDirection: "row",
    gap: 4,
  },
  detailMyActivityRatingText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#d4849b",
  },
  detailMyActivityTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  detailMyActivityTag: {
    backgroundColor: "#fdf6ee",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e8a0b0",
  },
  detailMyActivityTagText: {
    fontSize: 12,
    color: "#d4849b",
    fontWeight: "600",
  },
  detailSynopsisSection: {
    marginBottom: 32,
  },
  detailSynopsisTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#6b5040",
    marginBottom: 12,
  },
  detailSynopsisText: {
    fontSize: 14,
    color: "#6b5040",
    lineHeight: 22,
  },
});
  iconButtonsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  profileImageContent: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
  },
  name: {
    fontSize: 20,
    fontWeight: "800",
    color: "#000",
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  pronouns: {
    fontSize: 12,
    fontWeight: "600",
    color: "#999",
    marginBottom: 6,
  },
  bio: {
    fontSize: 12,
    lineHeight: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 0,
    paddingHorizontal: 4,
  },
  statsContainer: {
    flexDirection: "row",
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: "#f9f9f9",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "800",
    color: "#000",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#999",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#e0e0e0",
  },
  sectionsContainer: {
    paddingVertical: 8,
  },
  section: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  favoritesGrid: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  favoriteItemWrapper: {
    width: "23%",
    alignItems: "center",
  },
  favoriteCover: {
    width: "100%",
    aspectRatio: 150 / 220,
    borderRadius: 6,
    backgroundColor: "#f0f0f0",
    marginBottom: 6,
  },
  favoriteCoverPlaceholder: {
    width: "100%",
    aspectRatio: 150 / 220,
    borderRadius: 6,
    backgroundColor: "#f7f7f7",
    borderWidth: 1,
    borderColor: "#f0f0f0",
    marginBottom: 6,
  },
  favoriteTitlePlaceholder: {
    height: 14,
    width: "80%",
    backgroundColor: "transparent",
    marginBottom: 4,
  },
  favoriteTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#000",
    textAlign: "center",
    lineHeight: 13,
  },
  favoriteRating: {
    fontSize: 10,
    fontWeight: "600",
    color: "#d4849b",
    marginTop: 2,
  },
  emptyText: {
    fontSize: 13,
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 12,
  },
  reviewItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  reviewTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  reviewMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewRating: {
    fontSize: 12,
    fontWeight: "600",
    color: "#d4849b",
  },
  reviewDate: {
    fontSize: 11,
    color: "#999",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
  placeholderText: {
    fontSize: 13,
    color: "#999",
    fontStyle: "italic",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  settingContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  logoutButton: {
    marginHorizontal: 16,
    marginVertical: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#ffccdd",
    alignItems: "center",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#d4849b",
  },
  detailContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  detailHeader: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  detailHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 8,
  },
  detailContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  coverImageContainer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  detailCoverImage: {
    width: 150,
    aspectRatio: 150 / 220,
    borderRadius: 12,
    backgroundColor: "#e0e0e0",
  },
  detailInfo: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#000",
    marginBottom: 4,
  },
  detailAuthor: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  detailTagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  detailTag: {
    backgroundColor: "#f0e6f0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d4849b",
  },
  detailTagText: {
    fontSize: 12,
    color: "#c2516b",
    fontWeight: "500",
  },
  detailRatingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  stars: {
    flexDirection: "row",
    gap: 2,
  },
  detailRatingText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  synopsisTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
    marginBottom: 8,
  },
  synopsis: {
    fontSize: 13,
    color: "#555",
    lineHeight: 20,
  },
  myActivitySection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  myActivityTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    marginBottom: 12,
  },
  myActivityContent: {
    gap: 12,
  },
  myActivityText: {
    fontSize: 13,
    color: "#555",
    lineHeight: 20,
  },
  myActivityRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  myActivityStars: {
    flexDirection: "row",
    gap: 2,
  },
  myActivityRatingText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  myActivityTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  myActivityTag: {
    backgroundColor: "#f0e6f0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d4849b",
  },
  myActivityTagText: {
    fontSize: 12,
    color: "#c2516b",
    fontWeight: "500",
  },
  detailNotesSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  detailNotesTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    marginBottom: 12,
  },
  detailNotesText: {
    fontSize: 13,
    color: "#555",
    lineHeight: 20,
  },
  scrollContent: {
    flexGrow: 1,
  },
  detailCoverContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  detailTitleSection: {
    marginBottom: 16,
  },
  detailType: {
    fontSize: 14,
    fontWeight: "600",
    color: "#d4849b",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  detailMyActivitySection: {
    backgroundColor: "#fdf5f7",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#f0e6f0",
  },
  detailMyActivityTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#d4849b",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailMyActivityContent: {
    gap: 12,
  },
  detailMyActivityText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
  },
  detailMyActivityRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailMyActivityStars: {
    flexDirection: "row",
    gap: 4,
  },
  detailMyActivityRatingText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#d4849b",
  },
  detailMyActivityTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  detailMyActivityTag: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d4849b",
  },
  detailMyActivityTagText: {
    fontSize: 13,
    color: "#c2516b",
    fontWeight: "600",
  },
  detailSynopsisSection: {
    marginBottom: 32,
  },
  detailSynopsisTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    marginBottom: 12,
  },
  detailSynopsisText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
  },
});
