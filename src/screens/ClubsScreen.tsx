import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ClubsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.emoji}>🌸</Text>
      <Text style={styles.title}>Clubs</Text>
      <Text style={styles.subtitle}>Join and create cozy book & film clubs — coming soon ✦</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fdf6ee',
    paddingHorizontal: 32,
  },
  emoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#6b5040',
    marginBottom: 10,
    letterSpacing: 2,
    fontStyle: 'italic',
  },
  subtitle: {
    fontSize: 14,
    color: '#9e8a78',
    textAlign: 'center',
    lineHeight: 21,
  },
});
