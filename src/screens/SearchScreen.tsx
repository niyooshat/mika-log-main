import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LibraryItemCard } from '../components/LibraryItemCard';
import { LibraryItemType, LibraryItem, LibraryItemStatus } from '../types';
import { useLibrary } from '../context/LibraryContext';
import { searchBooks, searchMovies, searchShows, getTrendingMovies, getTrendingShows, getTrendingBooksByGenre } from '../services/apiService';
import { API_CONFIG } from '../config/apiConfig';
import { useSwipeGesture } from '../hooks/useSwipeGesture';

type ViewMode = 'search' | 'detail';

const BOOK_GENRES = ['fantasy', 'romance', 'science_fiction', 'mystery', 'thriller', 'historical_fiction'];

export default function SearchScreen() {
  const [selectedCategory, setSelectedCategory] = useState<LibraryItemType>('book');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('search');
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<LibraryItem[]>([]);
  const [trendingItems, setTrendingItems] = useState<LibraryItem[]>([]);
  const [trendingByGenre, setTrendingByGenre] = useState<{ [key: string]: LibraryItem[] }>({});
  const { addToLibrary } = useLibrary();
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load trending items on mount and when category changes
  React.useEffect(() => {
    let isMounted = true;

    const loadTrendingItems = async () => {
      setIsLoading(true);
      try {
        if (selectedCategory === 'book') {
          // Load trending by genre for books
          const genreData: { [key: string]: LibraryItem[] } = {};
          for (const genre of BOOK_GENRES) {
            if (!isMounted) return;
            const items = await getTrendingBooksByGenre(genre, 8);
            genreData[genre] = items;
          }
          if (isMounted) {
            setTrendingByGenre(genreData);
          }
        } else if (selectedCategory === 'film') {
          const items = await getTrendingMovies(API_CONFIG.TMDB_API_KEY, 10);
          if (isMounted) {
            setTrendingItems(items);
          }
        } else {
          const items = await getTrendingShows(API_CONFIG.TMDB_API_KEY, 10);
          if (isMounted) {
            setTrendingItems(items);
          }
        }
      } catch (error) {
        console.error('Error loading trending items:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadTrendingItems();

    return () => {
      isMounted = false; // Cleanup to prevent state updates after unmount
    };
  }, [selectedCategory]);

  // Cleanup debounce timeout on unmount
  React.useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (query.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    // Set new timeout - wait 400ms before searching (user stops typing)
    debounceTimeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        let results: LibraryItem[] = [];
        if (selectedCategory === 'book') {
          results = await searchBooks(query);
        } else if (selectedCategory === 'film') {
          results = await searchMovies(query, API_CONFIG.TMDB_API_KEY);
        } else {
          results = await searchShows(query, API_CONFIG.TMDB_API_KEY);
        }
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching:', error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 400);
  };

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

  const getCategoryPlaceholder = (type: LibraryItemType) => {
    switch (type) {
      case 'book':
        return 'Search books...';
      case 'film':
        return 'Search films...';
      case 'show':
        return 'Search TV shows...';
    }
  };

  const getAddButtonLabel = (status: LibraryItemStatus) => {
    if (selectedCategory === 'book') {
      switch (status) {
        case 'want':
          return 'Want to Read';
        case 'current':
          return 'Currently Reading';
        case 'finished':
          return 'Finished';
      }
    } else {
      switch (status) {
        case 'want':
          return 'Want to Watch';
        case 'current':
          return 'Currently Watching';
        case 'finished':
          return 'Finished';
      }
    }
  };

  const renderStars = (rating: number | undefined) => {
    if (!rating) return null;
    
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <MaterialCommunityIcons key={`full-${i}`} name="star" size={16} color="#FFD700" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <MaterialCommunityIcons key="half" name="star-half-full" size={16} color="#FFD700" />
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

  const handleSelectItem = (item: LibraryItem) => {
    setSelectedItem(item);
    setViewMode('detail');
  };

  const handleAddToLibrary = (status: LibraryItemStatus) => {
    if (selectedItem) {
      addToLibrary(selectedItem, status);
      alert(`Added to library as "${getAddButtonLabel(status)}"`);
      
      setTimeout(() => {
        setViewMode('search');
        setSelectedItem(null);
      }, 500);
    }
  };

  // Build navigable list (prefer current search results, fallback to trending)
  const itemsList = searchResults && searchResults.length > 0 ? searchResults : trendingItems;
  const currentIndexSearch = selectedItem ? itemsList.findIndex((it) => it.id === selectedItem.id) : -1;

  const goToIndexSearch = (idx: number) => {
    if (idx < 0) {
      setSelectedItem(null);
      return;
    }
    if (idx >= 0 && idx < itemsList.length) {
      setSelectedItem(itemsList[idx]);
    }
  };

  const handleSwipeLeftSearch = () => {
    if (currentIndexSearch >= 0 && currentIndexSearch < itemsList.length - 1) {
      goToIndexSearch(currentIndexSearch + 1);
    }
  };

  const handleSwipeRightSearch = () => {
    if (currentIndexSearch > 0) {
      goToIndexSearch(currentIndexSearch - 1);
    } else {
      setSelectedItem(null);
    }
  };

  const swipeGesturesSearch = useSwipeGesture({
    onSwipeLeft: handleSwipeLeftSearch,
    onSwipeRight: handleSwipeRightSearch,
  });

  const renderDetailView = () => {
    if (!selectedItem) return null;

    return (
      <SafeAreaView style={styles.container} edges={['top']} {...swipeGesturesSearch}>
        {/* Header with Back Button */}
        <View style={styles.detailHeader}>
          <TouchableOpacity
            onPress={() => {
              setViewMode('search');
              setSelectedItem(null);
            }}
            style={styles.backButton}>
            <MaterialCommunityIcons name="chevron-left" size={24} color="#e98dca" />
          </TouchableOpacity>
          <Text style={styles.detailHeaderTitle}>{selectedItem.title}</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.detailContent} showsVerticalScrollIndicator={false}>
          {/* Cover Image */}
          <View style={styles.coverImageContainer}>
            <Image source={{ uri: selectedItem.coverImage }} style={styles.detailCoverImage} />
          </View>

          {/* Title and Author */}
          <View style={styles.detailInfo}>
            <Text style={styles.detailTitle}>{selectedItem.title}</Text>
            <Text style={styles.detailAuthor}>{selectedItem.authorDirector}</Text>

            {/* Tags */}
            <View style={styles.detailTagsContainer}>
              {selectedItem.tags.map((tag, index) => (
                <View key={index} style={styles.detailTag}>
                  <Text style={styles.detailTagText}>{tag}</Text>
                </View>
              ))}
            </View>

            {/* Rating */}
            {selectedItem.rating && (
              <View style={styles.detailRatingContainer}>
                <View style={styles.stars}>{renderStars(selectedItem.rating)}</View>
                <Text style={styles.detailRatingText}>{selectedItem.rating.toFixed(1)}</Text>
              </View>
            )}

            {/* Description */}
            <Text style={styles.synopsisTitle}>Description</Text>
            <Text style={styles.synopsis}>{selectedItem.synopsis}</Text>
          </View>

          {/* Add to Library Buttons */}
          <View style={styles.addToLibrarySection}>
            <Text style={styles.addToLibraryTitle}>Add to Library</Text>

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handleAddToLibrary('want')}>
              <MaterialCommunityIcons name="heart-outline" size={18} color="#e98dca" />
              <Text style={styles.addButtonText}>{getAddButtonLabel('want')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handleAddToLibrary('current')}>
              <MaterialCommunityIcons name="book-open" size={18} color="#e98dca" />
              <Text style={styles.addButtonText}>{getAddButtonLabel('current')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handleAddToLibrary('finished')}>
              <MaterialCommunityIcons name="check-circle" size={18} color="#e98dca" />
              <Text style={styles.addButtonText}>{getAddButtonLabel('finished')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  };

  const renderSearchView = () => {
    const displayHorizontalTrending = (items: LibraryItem[], title: string) => (
      <View style={styles.trendingSection}>
        <Text style={styles.genreLabel}>{title}</Text>
        <FlatList
          data={items}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleSelectItem(item)}
              activeOpacity={0.7}
              style={styles.horizontalTrendingCard}>
              <Image source={{ uri: item.coverImage }} style={styles.horizontalCardImage} />
              <Text style={styles.horizontalCardTitle} numberOfLines={2}>
                {item.title}
              </Text>
              {item.rating && (
                <Text style={styles.horizontalCardRating}>⭐ {item.rating.toFixed(1)}</Text>
              )}
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        />
      </View>
    );

    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Explore</Text>
        </View>

        {/* Category Tabs */}
        <View style={styles.tabsContainer}>
          {(['book', 'film', 'show'] as LibraryItemType[]).map((category) => (
            <TouchableOpacity
              key={category}
              style={[styles.tab, selectedCategory === category && styles.activeTab]}
              onPress={() => {
                setSelectedCategory(category);
                setSearchQuery('');
                setSearchResults([]);
              }}>
              <Text
                style={[styles.tabText, selectedCategory === category && styles.activeTabText]}>
                {getCategoryLabel(category)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={getCategoryPlaceholder(selectedCategory)}
            placeholderTextColor="#ccc"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')} style={styles.clearButton}>
              <MaterialCommunityIcons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {/* Main Content - Scrollable */}
        <ScrollView
          style={styles.contentScroll}
          showsVerticalScrollIndicator={false}
          scrollEnabled={true}>
          {/* Loading Indicator */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#e98dca" />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          )}

          {/* Results or Trending */}
          {searchQuery.trim().length === 0 ? (
            // Show trending based on category
            !isLoading && selectedCategory === 'book' ? (
              // Book genres trending
              <View>
                {BOOK_GENRES.map((genre) => (
                  trendingByGenre[genre] && trendingByGenre[genre].length > 0 && (
                    <View key={genre}>
                      {displayHorizontalTrending(
                        trendingByGenre[genre],
                        `Trending ${genre.charAt(0).toUpperCase() + genre.slice(1).replace(/_/g, ' ')}`
                      )}
                    </View>
                  )
                ))}
              </View>
            ) : !isLoading && (selectedCategory === 'film' || selectedCategory === 'show') ? (
              // Movies/Shows trending
              <View>
                <Text style={styles.sectionLabel}>Trending Now</Text>
                {trendingItems.length === 0 ? (
                  <View style={styles.emptyState}>
                    <MaterialCommunityIcons name="magnify" size={48} color="#ddd" />
                    <Text style={styles.emptyStateText}>No trending items available</Text>
                  </View>
                ) : (
                  <FlatList
                    data={trendingItems}
                    renderItem={({ item }) => (
                      <TouchableOpacity onPress={() => handleSelectItem(item)} activeOpacity={0.7}>
                        <LibraryItemCard item={item} />
                      </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.resultsList}
                    scrollEnabled={false}
                  />
                )}
              </View>
            ) : null
          ) : searchResults.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="magnify" size={48} color="#ddd" />
              <Text style={styles.emptyStateText}>
                {isLoading ? 'Searching...' : 'No results found'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={searchResults}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleSelectItem(item)} activeOpacity={0.7}>
                  <LibraryItemCard item={item} />
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.resultsList}
              scrollEnabled={false}
            />
          )}
        </ScrollView>
      </SafeAreaView>
    );
  };

  return viewMode === 'search' ? renderSearchView() : renderDetailView();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 0.5,
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
    borderBottomColor: '#e98dca',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
  },
  activeTabText: {
    color: '#e98dca',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#000',
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
  },
  loadingContainer: {
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultsList: {
    paddingVertical: 8,
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
  contentScroll: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  trendingSection: {
    marginTop: 12,
    marginBottom: 12,
  },
  genreLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  horizontalList: {
    paddingHorizontal: 16,
  },
  horizontalTrendingCard: {
    marginRight: 12,
    width: 120,
    alignItems: 'center',
  },
  horizontalCardImage: {
    width: 110,
    aspectRatio: 150 / 220,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    marginBottom: 8,
  },
  horizontalCardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 4,
  },
  horizontalCardRating: {
    fontSize: 11,
    fontWeight: '600',
    color: '#e98dca',
  },
});
