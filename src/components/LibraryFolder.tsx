import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface FolderProps {
  label: string;
  icon: string;
  count: number;
  onPress: () => void;
}

export const LibraryFolder: React.FC<FolderProps> = ({ label, icon, count, onPress }) => {
  return (
    <TouchableOpacity style={styles.folderContainer} onPress={onPress}>
      <MaterialCommunityIcons name={icon as any} size={48} color="#e98dca" />
      <Text style={styles.folderLabel}>{label}</Text>
      <Text style={styles.folderCount}>{count} items</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  folderContainer: {
    flex: 1,
    margin: 8,
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  folderLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginTop: 8,
    textAlign: 'center',
  },
  folderCount: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});
