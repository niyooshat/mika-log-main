import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
          size={17}
          color={isLiked ? '#d4849b' : '#b09a8a'}
        />
        <Text style={[styles.interactionText, isLiked && { color: '#d4849b' }]}>
          {likes} {likes === 1 ? 'Like' : 'Likes'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.interactionButton}
        onPress={() => onOpenComments?.(reviewId)}
        activeOpacity={0.6}>
        <MaterialCommunityIcons name="comment-outline" size={17} color="#b09a8a" />
        <Text style={styles.interactionText}>Comment</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.interactionButton}
        onPress={() => alert('Share feature coming soon!')}
        activeOpacity={0.6}>
        <MaterialCommunityIcons name="share-variant-outline" size={17} color="#b09a8a" />
        <Text style={styles.interactionText}>Share</Text>
      </TouchableOpacity>
    </View>
  );
};

const ROSE     = '#d4849b';
const MUSHROOM = '#9e8a78';
const LINEN    = '#e8ddd0';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingTop: 10,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: LINEN,
    gap: 8,
  },
  interactionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: 'rgba(232,221,208,0.4)',
  },
  interactionText: {
    fontSize: 11,
    fontWeight: '600',
    color: MUSHROOM,
  },
});
