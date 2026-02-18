import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, Modal, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PostCard } from '../components/PostCard';
import WriteReviewScreen from './WriteReviewScreen';
import { useLibrary } from '../context/LibraryContext';
import { Post, LibraryItem, LibraryItemStatus } from '../types';

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const [refreshing, setRefreshing] = useState(false);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [selectedItemForReview, setSelectedItemForReview] = useState<LibraryItem | null>(null);
  const [viewMode, setViewMode] = useState<'feed' | 'detail'>('feed');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const { libraryItems, userReviews, addToLibrary } = useLibrary();

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  };

  const handleWriteReview = () => {
    // Find a finished item to review
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
    
    // Check if item already exists in library
    const existingItem = libraryItems.find((item) => item.id === selectedPost.itemId);
    
    if (existingItem) {
      alert(`This ${selectedPost.type} is already in your library!`);
      return;
    }

    // Create new library item
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
      stars.push(
        <MaterialCommunityIcons key={`full-${i}`} name="star" size={20} color="#e98dca" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <MaterialCommunityIcons key="half" name="star-half-full" size={20} color="#e98dca" />
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
        />
      );
    }

    return stars;
  };

  // Combine and sort all posts
  const allPosts = useMemo(() => {
    // Convert user reviews to posts
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

    return reviewPosts.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }, [userReviews]);

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>No Activity Yet</Text>
      <Text style={styles.emptyStateText}>
        Start adding finished books, films, and shows to your library to see your activity here!
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
          {/* Header with Back Button */}
          <View style={styles.detailHeader}>
            <TouchableOpacity onPress={handleCloseDetail} style={styles.backButton}>
              <MaterialCommunityIcons name="chevron-left" size={24} color="#e98dca" />
            </TouchableOpacity>
            <Text style={styles.detailHeaderTitle}>{selectedPost.title}</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.detailContent} showsVerticalScrollIndicator={false}>
            {/* Cover Image */}
            <View style={styles.coverImageContainer}>
              <Image
                source={{ uri: selectedPost.coverImage }}
                style={styles.detailCoverImage}
                resizeMode="cover"
              />
            </View>

            {/* Detail Info Section */}
            <View style={styles.detailInfo}>
              <Text style={styles.detailTitle}>
                {selectedPost.title.replace(/^(Finished: )/, '')}
              </Text>
              <Text style={styles.detailAuthor}>
                {selectedPost.type.charAt(0).toUpperCase() + selectedPost.type.slice(1)}
              </Text>

              {/* Tags */}
              {selectedPost.tags.length > 0 && (
                <View style={styles.detailTagsContainer}>
                  {selectedPost.tags.map((tag, index) => (
                    <View key={index} style={styles.detailTag}>
                      <Text style={styles.detailTagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Rating */}
              {selectedPost.rating && (
                <View style={styles.detailRatingContainer}>
                  <View style={styles.stars}>{renderStars(selectedPost.rating)}</View>
                  <Text style={styles.detailRatingText}>{selectedPost.rating.toFixed(1)}</Text>
                </View>
              )}

              {/* Description */}
              <Text style={styles.synopsisTitle}>Description</Text>
              <Text style={styles.synopsis}>{selectedPost.review}</Text>
            </View>

            {/* My Activity Section */}
            {(() => {
              const userReview = getUserReviewForItem(selectedPost.itemId);
              if (!userReview) return null;
              return (
                <View style={styles.myActivitySection}>
                  <Text style={styles.myActivityTitle}>My Activity</Text>
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

            {/* Action Buttons */}
            <View style={styles.addToLibrarySection}>
              <Text style={styles.addToLibraryTitle}>Add to Library</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => handleAddToLibrary('want')}>
                <MaterialCommunityIcons name="heart-outline" size={18} color="#e98dca" />
                <Text style={styles.addButtonText}>Want to {selectedPost.type === 'book' ? 'Read' : 'Watch'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => handleAddToLibrary('current')}>
                <MaterialCommunityIcons name="book-open" size={18} color="#e98dca" />
                <Text style={styles.addButtonText}>Currently {selectedPost.type === 'book' ? 'Reading' : 'Watching'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => handleAddToLibrary('finished')}>
                <MaterialCommunityIcons name="check-circle" size={18} color="#e98dca" />
                <Text style={styles.addButtonText}>Finished</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.appTitle}>MikaDiary</Text>
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
            tintColor="#e98dca"
            title="Pull to refresh"
          />
        }
      />

      {/* Write Review Button */}
      <TouchableOpacity
        style={styles.writeReviewButton}
        onPress={handleWriteReview}
        activeOpacity={0.8}>
        <MaterialCommunityIcons name="pencil-plus" size={20} color="#fff" />
        <Text style={styles.writeReviewButtonText}>Write Review</Text>
      </TouchableOpacity>

      {/* Write Review Modal */}
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

      {/* Detail View Modal */}
      {renderDetailView()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  feedContainer: {
    paddingVertical: 8,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 0.5,
  },
  emptyState: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  writeReviewButton: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#e98dca',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  writeReviewButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  detailContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  detailHeader: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
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
    paddingVertical: 24,
  },
  detailCoverImage: {
    width: 150,
    aspectRatio: 150 / 220,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
  },
  detailInfo: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000',
    marginBottom: 4,
  },
  detailAuthor: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  detailTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  detailTag: {
    backgroundColor: '#f0e6f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e98dca',
  },
  detailTagText: {
    fontSize: 12,
    color: '#c2516b',
    fontWeight: '500',
  },
  detailRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  detailRatingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  synopsisTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  synopsis: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
  },
  myActivitySection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  myActivityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  myActivityContent: {
    gap: 12,
  },
  myActivityText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
  },
  myActivityRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  myActivityStars: {
    flexDirection: 'row',
    gap: 2,
  },
  myActivityRatingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  myActivityTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  myActivityTag: {
    backgroundColor: '#f0e6f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e98dca',
  },
  myActivityTagText: {
    fontSize: 12,
    color: '#c2516b',
    fontWeight: '500',
  },
  addToLibrarySection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  addToLibraryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e98dca',
    marginBottom: 10,
    gap: 10,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e98dca',
  },
  scrollContent: {
    flexGrow: 1,
  },
  detailCoverContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  detailTitleSection: {
    marginBottom: 16,
  },
  detailType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e98dca',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
