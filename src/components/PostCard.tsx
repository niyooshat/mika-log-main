import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Post } from '../types';
import { ReviewInteractions } from './ReviewInteractions';

// â”€â”€ Cottagecore palette â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const CREAM     = '#fdf6ee';
const PARCHMENT = '#fffaf5';
const ROSE      = '#d4849b';
const BLUSH     = '#e8a0b0';
const ROSE_MIST = '#f9e8ed';
const BARK      = '#6b5040';
const MUSHROOM  = '#9e8a78';
const LINEN     = '#e8ddd0';
const SAGE      = '#9aaa8a';

interface PostCardProps {
  post: Post;
  onCoverPress?: (itemId?: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onCoverPress }) => {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    for (let i = 0; i < fullStars; i++) {
      stars.push(<MaterialCommunityIcons key={`full-${i}`} name="star" size={15} color={ROSE} />);
    }
    if (hasHalfStar) {
      stars.push(<MaterialCommunityIcons key="half" name="star-half-full" size={15} color={ROSE} />);
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<MaterialCommunityIcons key={`empty-${i}`} name="star-outline" size={15} color={LINEN} />);
    }
    return stars;
  };

  const typeLabel = post.type === 'book' ? 'ðŸ“–' : post.type === 'film' ? 'ðŸŽ¬' : 'ðŸ“º';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={{ uri: post.author.avatar }} style={styles.avatar} />
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{post.author.name}</Text>
          <Text style={styles.postType}>{typeLabel} {post.type.charAt(0).toUpperCase() + post.type.slice(1)}</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.reviewSection}>
          <Text style={styles.title}>{post.title}</Text>
          <Text style={styles.review} numberOfLines={4}>{post.review}</Text>
        </View>
        <TouchableOpacity onPress={() => onCoverPress?.(post.itemId)} activeOpacity={0.8}>
          <Image source={{ uri: post.coverImage }} style={styles.coverImage} />
        </TouchableOpacity>
      </View>

      {/* Tags */}
      {post.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {post.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Divider */}
      <View style={styles.divider} />

      {/* Rating */}
      <View style={styles.ratingContainer}>
        <View style={styles.stars}>{renderStars(post.rating)}</View>
        <Text style={styles.ratingText}>{post.rating.toFixed(1)}</Text>
      </View>

      {/* Interactions */}
      <ReviewInteractions
        reviewId={post.id}
        initialLikes={post.likes || 0}
        onToggleLike={() => {}}
        onOpenComments={() => alert('Comments feature coming soon!')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: PARCHMENT,
    borderRadius: 20,
    marginHorizontal: 14,
    marginVertical: 8,
    padding: 16,
    borderWidth: 1.5,
    borderColor: LINEN,
    shadowColor: BARK,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
    borderWidth: 2,
    borderColor: ROSE_MIST,
  },
  authorInfo: { flex: 1 },
  authorName: {
    fontSize: 13,
    fontWeight: '700',
    color: BARK,
  },
  postType: {
    fontSize: 11,
    color: MUSHROOM,
    marginTop: 2,
  },
  content: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  reviewSection: { flex: 1 },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: BARK,
    marginBottom: 6,
  },
  review: {
    fontSize: 13,
    color: MUSHROOM,
    lineHeight: 19,
  },
  coverImage: {
    width: 90,
    aspectRatio: 2 / 3,
    borderRadius: 12,
    backgroundColor: LINEN,
    borderWidth: 1,
    borderColor: LINEN,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginBottom: 10,
  },
  tag: {
    backgroundColor: ROSE_MIST,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BLUSH,
  },
  tagText: {
    fontSize: 11,
    color: ROSE,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: LINEN,
    marginVertical: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 4,
  },
  stars: { flexDirection: 'row', gap: 2 },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: BARK,
  },
});