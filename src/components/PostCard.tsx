import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Post } from '../types';
import { ReviewInteractions } from './ReviewInteractions';

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
      stars.push(
        <MaterialCommunityIcons key={`full-${i}`} name="star" size={16} color="#e98dca" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <MaterialCommunityIcons key="half" name="star-half-full" size={16} color="#e98dca" />
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

  return (
    <View style={styles.container}>
      {/* Header with profile */}
      <View style={styles.header}>
        <Image source={{ uri: post.author.avatar }} style={styles.avatar} />
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{post.author.name}</Text>
          <Text style={styles.postType}>{post.type.charAt(0).toUpperCase() + post.type.slice(1)}</Text>
        </View>
      </View>

      {/* Content section with review and cover image */}
      <View style={styles.content}>
        <View style={styles.reviewSection}>
          <Text style={styles.title}>{post.title}</Text>
          <Text style={styles.review} numberOfLines={4}>
            {post.review}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => onCoverPress?.(post.itemId)}
          activeOpacity={0.7}>
          <Image source={{ uri: post.coverImage }} style={styles.coverImage} />
        </TouchableOpacity>
      </View>

      {/* Tags section */}
      <View style={styles.tagsContainer}>
        {post.tags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      {/* Rating section */}
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
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  postType: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  content: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  reviewSection: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    marginBottom: 6,
  },
  review: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
  coverImage: {
    width: 100,
    aspectRatio: 150 / 220,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  tag: {
    backgroundColor: '#f0e6f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e98dca',
  },
  tagText: {
    fontSize: 12,
    color: '#c2516b',
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
});
