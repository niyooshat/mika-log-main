import { useRef, useEffect } from 'react';
import { PanResponder, GestureResponderEvent, PanResponderGestureState } from 'react-native';

interface SwipeGestureConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number; // minimum distance to trigger swipe (default: 50)
}

export const useSwipeGesture = ({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
}: SwipeGestureConfig) => {
  const panResponderRef = useRef<any>(null);

  useEffect(() => {
    panResponderRef.current = PanResponder.create({
      // Don't claim the gesture on touch start; allow scroll views to begin.
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_evt, gestureState) => {
        const { dx, dy } = gestureState;
        // Only capture when a horizontal swipe is clearly intended.
        return Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy);
      },
      onPanResponderRelease: (
        _evt: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        const { dx, dy } = gestureState;

        // Check if it's more horizontal than vertical
        if (Math.abs(dx) > Math.abs(dy)) {
          // Swipe right (back gesture)
          if (dx > threshold && onSwipeRight) {
            onSwipeRight();
          }
          // Swipe left
          if (dx < -threshold && onSwipeLeft) {
            onSwipeLeft();
          }
        }
      },
    });
  }, [onSwipeLeft, onSwipeRight, threshold]);

  return panResponderRef.current?.panHandlers || {};
};
