import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface FolderProps {
  label: string;
  icon: string;
  count: number;
  onPress: () => void;
}

export const LibraryFolder: React.FC<FolderProps> = ({ label, icon, count, onPress }) => {
  return (
    <TouchableOpacity style={styles.folderContainer} onPress={onPress}>
      <MaterialCommunityIcons name={icon as any} size={46} color="#d4849b" />
      <Text style={styles.folderLabel}>{label}</Text>
      <Text style={styles.folderCount}>{count} items</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  folderContainer: {
    flex: 1,
    margin: 8,
    paddingVertical: 22,
    paddingHorizontal: 16,
    backgroundColor: '#fffaf5',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#e8ddd0',
    shadowColor: '#6b5040',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  folderLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6b5040',
    marginTop: 8,
    textAlign: 'center',
  },
  folderCount: {
    fontSize: 11,
    color: '#9e8a78',
    marginTop: 4,
  },
});
