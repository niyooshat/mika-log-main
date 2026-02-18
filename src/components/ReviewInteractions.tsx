import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ReviewInteractionsProps {
  reviewId: string;
  initialLikes?: number;
  onToggleLike?: (reviewId: string, liked: boolean) => void;
  onOpenComments?: (reviewId: string) => void;
}

export const ReviewInteractions: React.FC<ReviewInteractionsProps> = ({
  reviewId,
  initialLikes = 0,
  onToggleLike,
  onOpenComments,
}) => {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);

  const handleToggleLike = () => {
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikes((prev) => (newLiked ? prev + 1 : prev - 1));
    onToggleLike?.(reviewId, newLiked);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.interactionButton}
        onPress={handleToggleLike}
        activeOpacity={0.6}>
        <MaterialCommunityIcons
          name={isLiked ? 'heart' : 'heart-outline'}
          size={18}
          color={isLiked ? '#e98dca' : '#999'}
        />
        <Text style={[styles.interactionText, isLiked && { color: '#e98dca' }]}>
          {likes} {likes === 1 ? 'Like' : 'Likes'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.interactionButton}
        onPress={() => onOpenComments?.(reviewId)}
        activeOpacity={0.6}>
        <MaterialCommunityIcons name="comment-outline" size={18} color="#999" />
        <Text style={styles.interactionText}>Comment</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.interactionButton}
        onPress={() => alert('Share feature coming soon!')}
        activeOpacity={0.6}>
        <MaterialCommunityIcons name="share-variant-outline" size={18} color="#999" />
        <Text style={styles.interactionText}>Share</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  interactionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  interactionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
  },
});
