import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView, Image, Alert, RefreshControl, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LibraryItemCard } from '../components/LibraryItemCard';
import { LibraryItemType, LibraryItemStatus, LibraryItem } from '../types';
import { useLibrary } from '../context/LibraryContext';
import WriteReviewScreen from './WriteReviewScreen';
import { useSwipeGesture } from '../hooks/useSwipeGesture';

type ViewMode = 'main' | 'detail' | 'itemDetail';
type SortOption = 'dateAdded' | 'rating' | 'title' | 'author';

export default function LibraryScreen() {
  const [selectedCategory, setSelectedCategory] = useState<LibraryItemType>('book');
  const [viewMode, setViewMode] = useState<ViewMode>('main');
  const [selectedStatus, setSelectedStatus] = useState<LibraryItemStatus>('want');
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('dateAdded');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [showRatingFilter, setShowRatingFilter] = useState(false);
  const { getItemsByStatus, updateItemStatus, removeFromLibrary, updateItemRating, userReviews } = useLibrary();

  const getCategoryLabel = (type: LibraryItemType) => {
    switch (type) {
      case 'book':
        return 'Books';
      case 'film':
        return 'Films';
      case 'show':
        return 'TV Shows';
    }
  };

  const sortItems = (items: LibraryItem[]): LibraryItem[] => {
    const filtered = items.filter((item) => (item.personalRating || 0) >= minRating);
    
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.personalRating || 0) - (a.personalRating || 0);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return a.authorDirector.localeCompare(b.authorDirector);
        case 'dateAdded':
        default:
          const dateA = new Date(a.dateAdded || 0).getTime();
          const dateB = new Date(b.dateAdded || 0).getTime();
          return dateB - dateA;
      }
    });
    
    return sorted;
  };

  const getSortLabel = (sort: SortOption): string => {
    switch (sort) {
      case 'rating':
        return 'Rating';
      case 'title':
        return 'Title';
      case 'author':
        return 'Author';
      case 'dateAdded':
      default:
        return 'Date Added';
    }
  };

  const getSectionLabel = (status: LibraryItemStatus) => {
    const isReadable = selectedCategory === 'book';
    
    switch (status) {
      case 'want':
        return isReadable ? 'Want to Read' : 'Want to Watch';
      case 'current':
        return isReadable ? 'Currently Reading' : 'Currently Watching';
      case 'finished':
        return 'Finished';
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  };

  const renderCoverGrid = (items: any[]) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.coversScroll}>
      {items.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.coverWrapper}
          onPress={() => {
            setSelectedItem(item);
            setViewMode('itemDetail');
          }}>
          <View style={styles.coverContainer}>
            <Image
              source={{ uri: item.coverImage }}
              style={styles.coverImage}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.coverTitle} numberOfLines={1}>
            {item.title}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderSection = (status: LibraryItemStatus) => {
    const items = sortItems(getItemsByStatus(selectedCategory, status));
    if (items.length === 0) return null;

    return (
      <View key={status}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{getSectionLabel(status)}</Text>
          <TouchableOpacity
            onPress={() => {
              setSelectedStatus(status);
              setViewMode('detail');
            }}
            style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>See All</Text>
            <MaterialCommunityIcons name="chevron-right" size={16} color="#d4849b" />
          </TouchableOpacity>
        </View>

        {renderCoverGrid(items)}
      </View>
    );
  };

  const renderMainView = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Library</Text>
      </View>

      {/* Category Tabs */}
      <View style={styles.tabsContainer}>
        {(['book', 'film', 'show'] as LibraryItemType[]).map((category) => (
          <TouchableOpacity
            key={category}
            style={[styles.tab, selectedCategory === category && styles.activeTab]}
            onPress={() => {
              setSelectedCategory(category);
              setViewMode('main');
            }}>
            <Text
              style={[styles.tabText, selectedCategory === category && styles.activeTabText]}>
              {getCategoryLabel(category)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sorting and Filtering Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setShowSortMenu(!showSortMenu)}>
          <MaterialCommunityIcons name="sort" size={18} color="#d4849b" />
          <Text style={styles.controlButtonText}>Sort: {getSortLabel(sortBy)}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, minRating > 0 && styles.controlButtonActive]}
          onPress={() => setShowRatingFilter(!showRatingFilter)}>
          <MaterialCommunityIcons name="star" size={18} color={minRating > 0 ? '#d4849b' : '#ccc'} />
          <Text style={[styles.controlButtonText, minRating > 0 && { color: '#d4849b' }]}>
            {minRating > 0 ? `${minRating}+Ã¢Ëœâ€¦` : 'Rating'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sort Menu */}
      {showSortMenu && (
        <View style={styles.menuContainer}>
          {(['dateAdded', 'rating', 'title', 'author'] as SortOption[]).map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.menuItem,
                sortBy === option && styles.menuItemActive,
              ]}
              onPress={() => {
                setSortBy(option);
                setShowSortMenu(false);
              }}>
              <MaterialCommunityIcons
                name={sortBy === option ? 'check' : 'blank'}
                size={18}
                color="#d4849b"
              />
              <Text style={styles.menuItemText}>{getSortLabel(option)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Rating Filter Menu */}
      {showRatingFilter && (
        <View style={styles.menuContainer}>
          {[0, 1, 2, 3, 4, 5].map((rating) => (
            <TouchableOpacity
              key={rating}
              style={[
                styles.menuItem,
                minRating === rating && styles.menuItemActive,
              ]}
              onPress={() => {
                setMinRating(rating);
                setShowRatingFilter(false);
              }}>
              <MaterialCommunityIcons
                name={minRating === rating ? 'check' : 'blank'}
                size={18}
                color="#d4849b"
              />
              <Text style={styles.menuItemText}>
                {rating === 0 ? 'All Ratings' : `${rating}+ Stars`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <ScrollView 
        style={styles.mainScroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            tintColor="#d4849b"
            title="Pull to refresh"
          />
        }>
      {/* Sections */}
      <View style={styles.content}>
        {renderSection('want')}
        {renderSection('current')}
        {renderSection('finished')}
      </View>
      </ScrollView>
    </View>
  );

  const handleSwipeBack = () => {
    setViewMode('detail');
    setSelectedItem(null);
  };

  // Build the list of items shown in the current view so we can page through them
  const itemsInContext = getItemsByStatus(selectedCategory, selectedStatus);
  const currentIndex = selectedItem ? itemsInContext.findIndex((it) => it.id === selectedItem.id) : -1;

  const goToIndex = (idx: number) => {
    if (idx < 0) {
      handleSwipeBack();
      return;
    }
    if (idx >= 0 && idx < itemsInContext.length) {
      setSelectedItem(itemsInContext[idx]);
    }
  };

  const handleSwipeLeft = () => {
    // left swipe -> next item
    if (currentIndex >= 0 && currentIndex < itemsInContext.length - 1) {
      goToIndex(currentIndex + 1);
    }
  };

  const handleSwipeRightNavigation = () => {
    // right swipe -> previous item or exit if none
    if (currentIndex > 0) {
      goToIndex(currentIndex - 1);
    } else {
      handleSwipeBack();
    }
  };

  const swipeGestures = useSwipeGesture({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRightNavigation,
  });

  const renderItemDetailView = () => {
    if (!selectedItem) return null;

    const getUserReviewForItem = (itemId?: string) => {
      if (!itemId) return null;
      return userReviews.find((review) => review.itemId === itemId) || null;
    };

    const renderStars = (rating: number | undefined) => {
      if (!rating) return null;
      
      const stars = [];
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 !== 0;

      for (let i = 0; i < fullStars; i++) {
        stars.push(
          <MaterialCommunityIcons key={`full-${i}`} name="star" size={16} color="#d4849b" />
        );
      }

      if (hasHalfStar) {
        stars.push(
          <MaterialCommunityIcons key="half" name="star-half-full" size={16} color="#d4849b" />
        );
      }

      const emptyStars = 5 - Math.ceil(rating);
      for (let i = 0; i < emptyStars; i++) {
        stars.push(
          <MaterialCommunityIcons
            key={`empty-${i}`}
            name="star-outline"
            size={16}
            color="#999"
          />
        );
      }

      return stars;
    };

    const isReadable = selectedCategory === 'book';

    const statusOptions: LibraryItemStatus[] = ['want', 'current', 'finished'];
    const getStatusLabel = (status: LibraryItemStatus) => {
      if (isReadable) {
        switch (status) {
          case 'want': return 'Want to Read';
          case 'current': return 'Currently Reading';
          case 'finished': return 'Finished';
        }
      } else {
        switch (status) {
          case 'want': return 'Want to Watch';
          case 'current': return 'Currently Watching';
          case 'finished': return 'Finished';
        }
      }
    };

    return (
      <SafeAreaView style={styles.itemDetailContainer} edges={['top']} {...swipeGestures}>
        {/* Header */}
        <View style={styles.detailHeader}>
          <TouchableOpacity
            onPress={() => {
              setViewMode('detail');
              setSelectedItem(null);
            }}
            style={styles.backButton}>
            <MaterialCommunityIcons name="chevron-left" size={24} color="#d4849b" />
          </TouchableOpacity>
          <Text style={styles.itemDetailHeaderTitle}>{selectedItem.title}</Text>
          <TouchableOpacity onPress={() => removeFromLibrary(selectedItem.id)}>
            <MaterialCommunityIcons name="trash-can-outline" size={20} color="#d4849b" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.itemDetailContent}>
          {/* Cover Image */}
          <View style={styles.coverImageContainer}>
            <Image source={{ uri: selectedItem.coverImage }} style={styles.itemDetailCoverImage} />
          </View>

          {/* Detail Info Section */}
          <View style={styles.itemDetailInfo}>
            <Text style={styles.itemDetailTitle}>{selectedItem.title}</Text>
            <Text style={styles.itemDetailAuthor}>{selectedItem.authorDirector}</Text>

            {/* Tags */}
            {selectedItem.tags.length > 0 && (
              <View style={styles.itemDetailTagsContainer}>
                {selectedItem.tags.map((tag: any, index: any) => (
                  <View key={index} style={styles.itemDetailTag}>
                    <Text style={styles.itemDetailTagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Rating */}
            {selectedItem.rating && (
              <View style={styles.itemDetailRatingContainer}>
                <View style={styles.itemDetailStarsContainer}>{renderStars(selectedItem.rating)}</View>
                <Text style={styles.itemDetailRatingText}>{selectedItem.rating.toFixed(1)}</Text>
              </View>
            )}

            {/* Description */}
            <Text style={styles.itemSynopsisTitle}>Description</Text>
            <Text style={styles.itemSynopsis}>{selectedItem.synopsis}</Text>
          </View>

          {/* My Activity - User's Review */}
          {(() => {
            const userReview = getUserReviewForItem(selectedItem.id);
            if (!userReview) return null;
            return (
              <View style={styles.itemDetailMyActivitySection}>
                <Text style={styles.itemDetailMyActivityTitle}>My Activity</Text>
                <View style={styles.itemDetailMyActivityContent}>
                  {userReview.reviewText && (
                    <Text style={styles.itemDetailMyActivityText}>{userReview.reviewText}</Text>
                  )}
                  {userReview.rating && (
                    <View style={styles.itemDetailMyActivityRating}>
                      <View style={styles.itemDetailMyActivityStars}>
                        {renderStars(userReview.rating)}
                      </View>
                      <Text style={styles.itemDetailMyActivityRatingText}>{userReview.rating.toFixed(1)} / 5.0</Text>
                    </View>
                  )}
                  {userReview.tags && userReview.tags.length > 0 && (
                    <View style={styles.itemDetailMyActivityTags}>
                      {userReview.tags.map((tag, index) => (
                        <View key={index} style={styles.itemDetailMyActivityTag}>
                          <Text style={styles.itemDetailMyActivityTagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            );
          })()}

          {/* Status and Rating Section */}
          <View style={styles.statusSection}>
            <Text style={styles.statusTitle}>Status</Text>
            <View style={styles.statusButtonsContainer}>
              {statusOptions.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusButton,
                    selectedItem.status === status && styles.statusButtonActive,
                  ]}
                  onPress={() => {
                    updateItemStatus(selectedItem.id, status);
                    // Show review modal when marking as finished
                    if (status === 'finished') {
                      setShowWriteReview(true);
                    }
                  }}>
                  <Text
                    style={[
                      styles.statusButtonText,
                      selectedItem.status === status && styles.statusButtonTextActive,
                    ]}>
                    {getStatusLabel(status)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.statusTitle}>Your Rating</Text>
            <View style={styles.personalRatingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => updateItemRating(selectedItem.id, star)}
                  activeOpacity={0.7}>
                  <MaterialCommunityIcons
                    name={star <= (selectedItem.personalRating || 0) ? 'star' : 'star-outline'}
                    size={28}
                    color={star <= (selectedItem.personalRating || 0) ? '#d4849b' : '#e8ddd0'}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Share Review Button */}
          <TouchableOpacity
            style={styles.shareReviewButton}
            onPress={() => setShowWriteReview(true)}>
            <MaterialCommunityIcons name="pencil-plus" size={18} color="#fff" />
            <Text style={styles.shareReviewButtonText}>Share Your Review</Text>
          </TouchableOpacity>

          {/* Delete Button */}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => {
              Alert.alert(
                'Remove from Library',
                `Are you sure you want to remove "${selectedItem.title}"?`,
                [
                  { text: 'Cancel', onPress: () => {} },
                  {
                    text: 'Remove',
                    onPress: () => {
                      removeFromLibrary(selectedItem.id);
                      setViewMode('detail');
                      setSelectedItem(null);
                    },
                    style: 'destructive',
                  },
                ]
              );
            }}>
            <MaterialCommunityIcons name="trash-can-outline" size={18} color="#d4849b" />
            <Text style={styles.deleteButtonText}>Remove from Library</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  };

  const renderDetailView = () => {
    const items = sortItems(getItemsByStatus(selectedCategory, selectedStatus));

    return (
      <View style={styles.detailContainer}>
        {/* Header with Back Button */}
        <View style={styles.detailHeader}>
          <TouchableOpacity onPress={() => setViewMode('main')} style={styles.backButton}>
            <MaterialCommunityIcons name="chevron-left" size={24} color="#d4849b" />
          </TouchableOpacity>
          <Text style={styles.detailTitle}>{getSectionLabel(selectedStatus)}</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Items List */}
        <FlatList
          data={items}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                setSelectedItem(item);
                setViewMode('itemDetail');
              }}
              activeOpacity={0.7}>
              <LibraryItemCard item={item} />
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.detailList}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {viewMode === 'main' ? renderMainView() : viewMode === 'detail' ? renderDetailView() : renderItemDetailView()}
      
      {/* Write Review Modal */}
      <Modal
        visible={showWriteReview}
        animationType="slide"
        onRequestClose={() => setShowWriteReview(false)}>
        {selectedItem && (
          <WriteReviewScreen
            item={selectedItem}
            onClose={() => setShowWriteReview(false)}
          />
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainScroll: {
    flex: 1,
  },
  detailContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8ddd0',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#6b5040',
    letterSpacing: 0.5,
  },
  detailHeader: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8ddd0',
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
  detailTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#6b5040',
    flex: 1,
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8ddd0',
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#d4849b',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9e8a78',
  },
  activeTabText: {
    color: '#d4849b',
  },
  controlsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8ddd0',
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e8ddd0',
    backgroundColor: '#f5ead8',
    gap: 6,
  },
  controlButtonActive: {
    borderColor: '#d4849b',
    backgroundColor: '#fdf6ee',
  },
  controlButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9e8a78',
  },
  menuContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e8ddd0',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e8ddd0',
    gap: 10,
  },
  menuItemActive: {
    backgroundColor: '#fdf6ee',
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b5040',
  },
  content: {
    paddingVertical: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fffaf5',
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6b5040',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#d4849b',
  },
  coversScroll: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  coverWrapper: {
    marginRight: 12,
    alignItems: 'center',
    width: 100,
  },
  coverContainer: {
    width: 100,
    height: 150,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#e8ddd0',
    marginBottom: 4,
    shadowColor: '#6b5040',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e8ddd0',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  coverTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b5040',
    textAlign: 'center',
    lineHeight: 14,
  },
  detailList: {
    paddingVertical: 8,
  },
  itemDetailContainer: {
    flex: 1,
    backgroundColor: '#fdf6ee',
  },
  itemDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e8ddd0',
  },
  itemDetailHeaderButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemDetailHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6b5040',
    flex: 1,
    textAlign: 'center',
  },
  itemDetailContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  coverImageContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  itemDetailCoverImage: {
    width: 150,
    aspectRatio: 150 / 220,
    borderRadius: 12,
    backgroundColor: '#e8ddd0',
  },
  itemDetailInfo: {
    backgroundColor: '#fffaf5',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#e8ddd0',
  },
  itemDetailTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#6b5040',
    marginBottom: 4,
  },
  itemDetailAuthor: {
    fontSize: 14,
    color: '#9e8a78',
    marginBottom: 12,
  },
  itemDetailTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  itemDetailTag: {
    backgroundColor: '#f9e8ed',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d4849b',
  },
  itemDetailTagText: {
    fontSize: 12,
    color: '#b05060',
    fontWeight: '500',
  },
  itemDetailRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  itemDetailStarsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  itemDetailRatingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b5040',
  },
  itemSynopsisTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6b5040',
    marginBottom: 8,
  },
  itemSynopsis: {
    fontSize: 13,
    lineHeight: 20,
    color: '#9e8a78',
    marginBottom: 24,
  },
  itemDetailMyActivitySection: {
    backgroundColor: '#ede5f5',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#c8b4d4',
  },
  itemDetailMyActivityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6b5040',
    marginBottom: 12,
  },
  itemDetailMyActivityContent: {
    gap: 12,
  },
  itemDetailMyActivityText: {
    fontSize: 13,
    color: '#9e8a78',
    lineHeight: 20,
  },
  itemDetailMyActivityRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemDetailMyActivityStars: {
    flexDirection: 'row',
    gap: 2,
  },
  itemDetailMyActivityRatingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b5040',
  },
  itemDetailMyActivityTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  itemDetailMyActivityTag: {
    backgroundColor: '#f9e8ed',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d4849b',
  },
  itemDetailMyActivityTagText: {
    fontSize: 12,
    color: '#b05060',
    fontWeight: '500',
  },
  statusSection: {
    marginVertical: 20,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6b5040',
    marginBottom: 12,
  },
  statusButtonsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  personalRatingContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e8ddd0',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusButtonActive: {
    borderColor: '#d4849b',
    backgroundColor: '#fdf6ee',
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9e8a78',
    textAlign: 'center',
  },
  statusButtonTextActive: {
    color: '#d4849b',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#f9e8ed',
    marginVertical: 14,
    borderWidth: 1.5,
    borderColor: '#e8a0b0',
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d4849b',
  },
  shareReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#d4849b',
    marginVertical: 10,
    shadowColor: '#d4849b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  shareReviewButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});

