import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSwipeGesture } from '../hooks/useSwipeGesture';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LibraryItem, UserReview } from '../types';
import { useLibrary } from '../context/LibraryContext';

const SUGGESTED_TAGS = [
  'Beautiful', 'Fast-paced', 'Gripping', 'Emotional', 'Thought-provoking',
  'Entertaining', 'Heartwarming', 'Intense', 'Witty', 'Romantic',
  'Dark', 'Inspiring', 'Quirky', 'Thrilling', 'Profound',
  'Character-driven', 'Plot-heavy', 'Wholesome', 'Funny', 'Tragic',
];

interface WriteReviewScreenProps {
  item: LibraryItem;
  onClose: () => void;
  onSubmit?: () => void;
}

export default function WriteReviewScreen({ item, onClose, onSubmit }: WriteReviewScreenProps) {
  const insets = useSafeAreaInsets();

  const swipeGestures = useSwipeGesture({
    onSwipeRight: onClose,
  });

  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchTags, setSearchTags] = useState('');
  const { postReview, updateItemStatus } = useLibrary();

  const filteredTags = useMemo(() => {
    const search = searchTags.toLowerCase();
    const itemTags = item.tags.map((tag) => tag.toLowerCase());
    const defaultTags = SUGGESTED_TAGS.filter(
      (tag) =>
        tag.toLowerCase().includes(search) &&
        !selectedTags.find((st) => st.toLowerCase() === tag.toLowerCase()) &&
        !itemTags.includes(tag.toLowerCase())
    );
    return defaultTags;
  }, [searchTags, selectedTags, item.tags]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.find((t) => t.toLowerCase() === tag.toLowerCase())
        ? prev.filter((t) => t.toLowerCase() !== tag.toLowerCase())
        : [...prev, tag]
    );
  };

  const handlePostReview = () => {
    if (!reviewText.trim()) {
      Alert.alert('Empty Review', 'Please write something in your review.');
      return;
    }

    if (rating === 0) {
      Alert.alert('No Rating', 'Please give this item a rating.');
      return;
    }

    const newReview: UserReview = {
      id: Date.now().toString(),
      itemId: item.id,
      itemTitle: item.title,
      itemCoverImage: item.coverImage,
      itemType: item.type,
      rating,
      reviewText,
      tags: selectedTags,
      createdAt: new Date().toISOString(),
    };

    postReview(newReview);
    // Mark item as finished when review is posted
    updateItemStatus(item.id, 'finished');
    Alert.alert('Success', 'Your review has been posted!', [
      {
        text: 'OK',
        onPress: () => {
          onClose();
          onSubmit?.();
        },
      },
    ]);
  };

  const renderStars = (currentRating: number) => (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.7}>
          <MaterialCommunityIcons
            name={star <= currentRating ? 'star' : 'star-outline'}
            size={32}
            color={star <= currentRating ? '#FFD700' : '#ddd'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']} {...swipeGestures}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <MaterialCommunityIcons name="close" size={24} color="#6b5040" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Share Your Review</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        {/* Item Info */}
        <View style={styles.itemInfo}>
          <Image source={{ uri: item.coverImage }} style={styles.itemCover} />
          <View style={styles.itemDetails}>
            <Text style={styles.itemTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.itemAuthor}>{item.authorDirector}</Text>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>
                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        {/* Rating Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Rating</Text>
          {renderStars(rating)}
          {rating > 0 && (
            <Text style={styles.ratingText}>
              You rated this {rating === 1 ? 'a' : rating === 2 ? 'a' : ''} {rating}
              {' '}
              â­
            </Text>
          )}
        </View>

        {/* Review Text */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Thoughts</Text>
          <TextInput
            style={styles.reviewInput}
            placeholder="Share your thoughts about this item..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={6}
            value={reviewText}
            onChangeText={setReviewText}
            textAlignVertical="top"
          />
          <Text style={styles.characterCount}>{reviewText.length} characters</Text>
        </View>

        {/* Tags Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Tags</Text>
          <TextInput
            style={styles.tagSearchInput}
            placeholder="Search tags..."
            placeholderTextColor="#999"
            value={searchTags}
            onChangeText={setSearchTags}
          />

          {/* Selected Tags */}
          {selectedTags.length > 0 && (
            <View style={styles.selectedTagsContainer}>
              <Text style={styles.selectedTagsLabel}>Selected:</Text>
              <View style={styles.tagsGrid}>
                {selectedTags.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={styles.selectedTag}
                    onPress={() => toggleTag(tag)}>
                    <Text style={styles.selectedTagText}>{tag}</Text>
                    <MaterialCommunityIcons name="close" size={14} color="#d4849b" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Suggested Tags */}
          <Text style={styles.suggestedTagsLabel}>Suggestions:</Text>
          <View style={styles.tagsGrid}>
            {filteredTags.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={styles.tagButton}
                onPress={() => toggleTag(tag)}>
                <MaterialCommunityIcons name="plus" size={14} color="#d4849b" />
                <Text style={styles.tagButtonText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Post Button */}
        <TouchableOpacity
          style={[styles.postButton, !reviewText.trim() || rating === 0 ? styles.postButtonDisabled : null]}
          onPress={handlePostReview}
          disabled={!reviewText.trim() || rating === 0}>
          <MaterialCommunityIcons name="send" size={18} color="#fff" />
          <Text style={styles.postButtonText}>Post Review</Text>
        </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e8ddd0',
    backgroundColor: '#fff',
    zIndex: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6b5040',
  },
  itemInfo: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  itemCover: {
    width: 80,
    aspectRatio: 150 / 220,
    borderRadius: 8,
    backgroundColor: '#e8ddd0',
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-around',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6b5040',
    lineHeight: 20,
  },
  itemAuthor: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9e8a78',
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#fff5fa',
    borderWidth: 1,
    borderColor: '#d4849b',
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#d4849b',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e8ddd0',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6b5040',
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    marginVertical: 12,
  },
  ratingText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#d4849b',
    marginTop: 8,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#e8ddd0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    lineHeight: 20,
    color: '#6b5040',
    backgroundColor: '#f9f9f9',
  },
  characterCount: {
    fontSize: 12,
    color: '#9e8a78',
    marginTop: 6,
    textAlign: 'right',
  },
  tagSearchInput: {
    borderWidth: 1,
    borderColor: '#e8ddd0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#6b5040',
    backgroundColor: '#f9f9f9',
    marginBottom: 12,
  },
  selectedTagsContainer: {
    marginBottom: 12,
  },
  selectedTagsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9e8a78',
    marginBottom: 8,
  },
  suggestedTagsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9e8a78',
    marginBottom: 8,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#fff5fa',
    borderWidth: 1,
    borderColor: '#d4849b',
  },
  selectedTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#d4849b',
  },
  tagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e8ddd0',
  },
  tagButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9e8a78',
  },
  postButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginVertical: 20,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#d4849b',
  },
  postButtonDisabled: {
    opacity: 0.6,
  },
  postButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
