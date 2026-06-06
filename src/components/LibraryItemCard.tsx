import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { LibraryItem } from '../types';

interface LibraryItemCardProps {
  item: LibraryItem;
}

export const LibraryItemCard: React.FC<LibraryItemCardProps> = ({ item }) => {
  const renderStars = (rating: number | undefined) => {
    if (!rating) return null;
    
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <MaterialCommunityIcons key={`full-${i}`} name="star" size={14} color="#d4849b" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <MaterialCommunityIcons key="half" name="star-half-full" size={14} color="#d4849b" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <MaterialCommunityIcons
          key={`empty-${i}`}
          name="star-outline"
          size={14}
          color="#e8ddd0"
        />
      );
    }

    return stars;
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: item.coverImage }} style={styles.coverImage} />
      
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.authorDirector}>{item.authorDirector}</Text>
        
        <Text style={styles.synopsis} numberOfLines={3}>
          {item.synopsis}
        </Text>

        <View style={styles.tagsContainer}>
          {item.tags.slice(0, 2).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        {item.rating && (
          <View style={styles.ratingContainer}>
            <View style={styles.stars}>{renderStars(item.rating)}</View>
            <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const CREAM    = '#fdf6ee';
const PARCHMENT= '#fffaf5';
const ROSE     = '#d4849b';
const BLUSH    = '#e8a0b0';
const ROSE_MIST= '#f9e8ed';
const BARK     = '#6b5040';
const MUSHROOM = '#9e8a78';
const LINEN    = '#e8ddd0';

const styles = StyleSheet.create({
  container: {
    backgroundColor: PARCHMENT,
    borderRadius: 16,
    marginHorizontal: 14,
    marginVertical: 7,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: LINEN,
    shadowColor: '#6b5040',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  coverImage: {
    width: 95,
    aspectRatio: 2 / 3,
    backgroundColor: LINEN,
  },
  content: {
    flex: 1,
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: BARK,
    marginBottom: 2,
  },
  authorDirector: {
    fontSize: 12,
    color: MUSHROOM,
    marginBottom: 6,
  },
  synopsis: {
    fontSize: 11,
    color: MUSHROOM,
    lineHeight: 15,
    marginBottom: 6,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 6,
  },
  tag: {
    backgroundColor: ROSE_MIST,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BLUSH,
  },
  tagText: {
    fontSize: 10,
    color: ROSE,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stars: {
    flexDirection: 'row',
    gap: 1,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: BARK,
  },
});
