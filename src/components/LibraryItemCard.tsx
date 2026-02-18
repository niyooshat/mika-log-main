import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
        <MaterialCommunityIcons key={`full-${i}`} name="star" size={14} color="#e98dca" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <MaterialCommunityIcons key="half" name="star-half-full" size={14} color="#e98dca" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <MaterialCommunityIcons
          key={`empty-${i}`}
          name="star-outline"
          size={14}
          color="#999"
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  coverImage: {
    width: 100,
    aspectRatio: 150 / 220,
    backgroundColor: '#f0f0f0',
  },
  content: {
    flex: 1,
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    marginBottom: 2,
  },
  authorDirector: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  synopsis: {
    fontSize: 11,
    color: '#555',
    lineHeight: 15,
    marginBottom: 6,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 6,
  },
  tag: {
    backgroundColor: '#f0e6f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#e98dca',
  },
  tagText: {
    fontSize: 10,
    color: '#c2516b',
    fontWeight: '500',
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
    fontWeight: '600',
    color: '#333',
  },
});
