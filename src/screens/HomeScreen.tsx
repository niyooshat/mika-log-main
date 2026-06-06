import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Dimensions, FlatList, Image, Modal, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PostCard } from '../components/PostCard';
import { useLibrary } from '../context/LibraryContext';
import { LibraryItem, LibraryItemStatus, Post } from '../types';
import WriteReviewScreen from './WriteReviewScreen';

const { width } = Dimensions.get('window');

// ── Cottagecore palette ──────────────────────────────────────────────────────
const CREAM     = '#fdf6ee';
const PARCHMENT = '#f5ead8';
const ROSE      = '#d4849b';
const BLUSH     = '#e8a0b0';
const ROSE_MIST = '#f9e8ed';
const BARK      = '#6b5040';
const MUSHROOM  = '#9e8a78';
const LINEN     = '#e8ddd0';
const SAGE      = '#9aaa8a';
const MOSS      = '#dde8d5';
const LAVENDER  = '#c8b4d4';
const LAV_MIST  = '#ede5f5';

export default function HomeScreen({ navigation }: any) {
  const [refreshing, setRefreshing] = useState(false);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [selectedItemForReview, setSelectedItemForReview] = useState<LibraryItem | null>(null);
  const [viewMode, setViewMode] = useState<'feed' | 'detail'>('feed');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const { libraryItems, userReviews, addToLibrary } = useLibrary();

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => { setRefreshing(false); }, 500);
  };

  const handleWriteReview = () => {
    const finishedItems = libraryItems.filter((item) => item.status === 'finished');
    if (finishedItems.length > 0) {
      setSelectedItemForReview(finishedItems[0]);
      setShowWriteReview(true);
    } else {
      alert('Add a finished item to your library first!');
    }
  };

  const handleCoverPress = (itemId?: string) => {
    if (!itemId) return;
    const post = allPosts.find((p) => p.itemId === itemId);
    if (post) {
      setSelectedPost(post);
      setViewMode('detail');
    }
  };

  const handleCloseDetail = () => {
    setViewMode('feed');
    setSelectedPost(null);
  };

  const getUserReviewForItem = (itemId?: string) => {
    if (!itemId) return null;
    return userReviews.find((review) => review.itemId === itemId) || null;
  };

  const handleAddToLibrary = (status: LibraryItemStatus) => {
    if (!selectedPost || !selectedPost.itemId) return;
    const existingItem = libraryItems.find((item) => item.id === selectedPost.itemId);
    if (existingItem) {
      alert(`This ${selectedPost.type} is already in your library!`);
      return;
    }
    const newItem: LibraryItem = {
      id: selectedPost.itemId,
      type: selectedPost.type,
      title: selectedPost.title.replace(/^(Finished: )/, ''),
      authorDirector: 'Unknown',
      coverImage: selectedPost.coverImage,
      synopsis: selectedPost.review,
      tags: selectedPost.tags,
      status: status,
      rating: selectedPost.rating,
      dateAdded: new Date().toISOString(),
    };
    addToLibrary(newItem, status);
    alert(`Added to ${status === 'want' ? 'Want to Read/Watch' : status === 'current' ? 'Currently Reading/Watching' : 'Finished'}!`);
    handleCloseDetail();
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    for (let i = 0; i < fullStars; i++) {
      stars.push(<MaterialCommunityIcons key={`full-${i}`} name="star" size={20} color={ROSE} />);
    }
    if (hasHalfStar) {
      stars.push(<MaterialCommunityIcons key="half" name="star-half-full" size={20} color={ROSE} />);
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<MaterialCommunityIcons key={`empty-${i}`} name="star-outline" size={20} color={LINEN} />);
    }
    return stars;
  };

  const allPosts = useMemo(() => {
    const reviewPosts: Post[] = userReviews.map((review) => ({
      id: review.id,
      author: {
        id: 'user1',
        name: 'You',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
      },
      title: review.itemTitle,
      review: review.reviewText,
      coverImage: review.itemCoverImage,
      rating: review.rating,
      type: review.itemType,
      tags: review.tags,
      createdAt: new Date(review.createdAt),
      itemId: review.itemId,
    }));
    return reviewPosts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [userReviews]);

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateEmoji}>🌿</Text>
      <Text style={styles.emptyStateTitle}>Your diary is waiting</Text>
      <Text style={styles.emptyStateText}>
        Add finished books, films, and shows to your library to begin your cozy diary ✦
      </Text>
    </View>
  );

  const renderDetailView = () => {
    if (!selectedPost) return null;
    return (
      <Modal
        visible={viewMode === 'detail'}
        animationType="slide"
        onRequestClose={handleCloseDetail}>
        <SafeAreaView style={styles.detailContainer} edges={['top']}>
          <View style={styles.detailHeader}>
            <TouchableOpacity onPress={handleCloseDetail} style={styles.backButton}>
              <MaterialCommunityIcons name="chevron-left" size={26} color={ROSE} />
            </TouchableOpacity>
            <Text style={styles.detailHeaderTitle} numberOfLines={1}>{selectedPost.title}</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView style={styles.detailContent} showsVerticalScrollIndicator={false}>
            <View style={styles.coverImageContainer}>
              <Image
                source={{ uri: selectedPost.coverImage }}
                style={styles.detailCoverImage}
                resizeMode="cover"
              />
              {/* Decorative ring */}
              <View style={styles.coverRing} />
            </View>

            <View style={styles.detailInfo}>
              <Text style={styles.detailTitle}>
                {selectedPost.title.replace(/^(Finished: )/, '')}
              </Text>
              <Text style={styles.detailAuthor}>
                {selectedPost.type.charAt(0).toUpperCase() + selectedPost.type.slice(1)}
              </Text>

              {selectedPost.tags.length > 0 && (
                <View style={styles.detailTagsContainer}>
                  {selectedPost.tags.map((tag, index) => (
                    <View key={index} style={styles.detailTag}>
                      <Text style={styles.detailTagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}

              {selectedPost.rating && (
                <View style={styles.detailRatingContainer}>
                  <View style={styles.stars}>{renderStars(selectedPost.rating)}</View>
                  <Text style={styles.detailRatingText}>{selectedPost.rating.toFixed(1)} / 5</Text>
                </View>
              )}

              <Text style={styles.synopsisTitle}>✦ Review</Text>
              <Text style={styles.synopsis}>{selectedPost.review}</Text>
            </View>

            {(() => {
              const userReview = getUserReviewForItem(selectedPost.itemId);
              if (!userReview) return null;
              return (
                <View style={styles.myActivitySection}>
                  <Text style={styles.myActivityTitle}>🌸 My Notes</Text>
                  <View style={styles.myActivityContent}>
                    {userReview.reviewText && (
                      <Text style={styles.myActivityText}>{userReview.reviewText}</Text>
                    )}
                    {userReview.rating && (
                      <View style={styles.myActivityRating}>
                        <View style={styles.myActivityStars}>{renderStars(userReview.rating)}</View>
                        <Text style={styles.myActivityRatingText}>{userReview.rating.toFixed(1)} / 5.0</Text>
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

            <View style={styles.addToLibrarySection}>
              <Text style={styles.addToLibraryTitle}>🍃 Add to Library</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => handleAddToLibrary('want')}>
                <MaterialCommunityIcons name="heart-outline" size={18} color={ROSE} />
                <Text style={styles.addButtonText}>Want to {selectedPost.type === 'book' ? 'Read' : 'Watch'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.addButton, { borderColor: SAGE }]} onPress={() => handleAddToLibrary('current')}>
                <MaterialCommunityIcons name="book-open" size={18} color={SAGE} />
                <Text style={[styles.addButtonText, { color: SAGE }]}>Currently {selectedPost.type === 'book' ? 'Reading' : 'Watching'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.addButton, { borderColor: LAVENDER }]} onPress={() => handleAddToLibrary('finished')}>
                <MaterialCommunityIcons name="check-circle" size={18} color={LAVENDER} />
                <Text style={[styles.addButtonText, { color: LAVENDER }]}>Finished</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>mika</Text>
          <Text style={styles.appSubtitle}>your cozy media diary ✦</Text>
        </View>
        <TouchableOpacity
          style={styles.headerWriteBtn}
          onPress={handleWriteReview}
          activeOpacity={0.8}>
          <MaterialCommunityIcons name="feather" size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={allPosts}
        renderItem={({ item }) => <PostCard post={item} onCoverPress={handleCoverPress} />}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyState}
        scrollEnabled={true}
        contentContainerStyle={[
          styles.feedContainer,
          allPosts.length === 0 && { flexGrow: 1, justifyContent: 'center' },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={ROSE}
            title="refreshing diary..."
          />
        }
      />

      {/* Write Review FAB */}
      <TouchableOpacity
        style={styles.writeReviewButton}
        onPress={handleWriteReview}
        activeOpacity={0.85}>
        <MaterialCommunityIcons name="feather" size={18} color="#fff" />
        <Text style={styles.writeReviewButtonText}>Write Review</Text>
      </TouchableOpacity>

      <Modal
        visible={showWriteReview}
        animationType="slide"
        onRequestClose={() => setShowWriteReview(false)}>
        {selectedItemForReview && (
          <WriteReviewScreen
            item={selectedItemForReview}
            onClose={() => {
              setShowWriteReview(false);
              setSelectedItemForReview(null);
            }}
            onSubmit={handleRefresh}
          />
        )}
      </Modal>

      {renderDetailView()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CREAM,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: PARCHMENT,
    borderBottomWidth: 1.5,
    borderBottomColor: LINEN,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: BARK,
    letterSpacing: 3,
    fontStyle: 'italic',
  },
  appSubtitle: {
    fontSize: 11,
    color: MUSHROOM,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  headerWriteBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: ROSE,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: ROSE,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  feedContainer: {
    paddingVertical: 12,
  },
  emptyState: {
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  emptyStateEmoji: {
    fontSize: 52,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: BARK,
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 14,
    color: MUSHROOM,
    textAlign: 'center',
    lineHeight: 22,
  },
  writeReviewButton: {
    position: 'absolute',
    bottom: 28,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: 30,
    backgroundColor: ROSE,
    shadowColor: ROSE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  writeReviewButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  // ── Detail Modal ─────────────────────────────────────────────────────────
  detailContainer: {
    flex: 1,
    backgroundColor: CREAM,
  },
  detailHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: PARCHMENT,
    borderBottomWidth: 1.5,
    borderBottomColor: LINEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailHeaderTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: BARK,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  detailContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  coverImageContainer: {
    alignItems: 'center',
    paddingVertical: 28,
    position: 'relative',
  },
  detailCoverImage: {
    width: 140,
    aspectRatio: 140 / 210,
    borderRadius: 14,
    backgroundColor: LINEN,
    shadowColor: BARK,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  coverRing: {
    position: 'absolute',
    width: 156,
    height: 226,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: ROSE_MIST,
    top: 22,
  },
  detailInfo: {
    backgroundColor: '#fffaf5',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: LINEN,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: BARK,
    marginBottom: 4,
  },
  detailAuthor: {
    fontSize: 13,
    color: SAGE,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  detailTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  detailTag: {
    backgroundColor: ROSE_MIST,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BLUSH,
  },
  detailTagText: {
    fontSize: 11,
    color: ROSE,
    fontWeight: '600',
  },
  detailRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  stars: { flexDirection: 'row', gap: 2 },
  detailRatingText: {
    fontSize: 13,
    fontWeight: '700',
    color: BARK,
  },
  synopsisTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: MUSHROOM,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  synopsis: {
    fontSize: 14,
    color: BARK,
    lineHeight: 22,
  },
  myActivitySection: {
    backgroundColor: LAV_MIST,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: LAVENDER,
  },
  myActivityTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: BARK,
    marginBottom: 12,
  },
  myActivityContent: { gap: 10 },
  myActivityText: {
    fontSize: 13,
    color: BARK,
    lineHeight: 20,
  },
  myActivityRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  myActivityStars: { flexDirection: 'row', gap: 2 },
  myActivityRatingText: {
    fontSize: 13,
    fontWeight: '600',
    color: BARK,
  },
  myActivityTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  myActivityTag: {
    backgroundColor: ROSE_MIST,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BLUSH,
  },
  myActivityTagText: {
    fontSize: 11,
    color: ROSE,
    fontWeight: '600',
  },
  addToLibrarySection: {
    backgroundColor: MOSS,
    borderRadius: 20,
    padding: 18,
    marginBottom: 36,
    borderWidth: 1.5,
    borderColor: SAGE,
  },
  addToLibraryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: BARK,
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
    backgroundColor: CREAM,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: ROSE,
    marginBottom: 10,
    gap: 10,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: ROSE,
  },
});