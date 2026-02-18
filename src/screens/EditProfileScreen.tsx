import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSwipeGesture } from '../hooks/useSwipeGesture';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLibrary } from '../context/LibraryContext';

interface EditProfileScreenProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function EditProfileScreen({ isVisible, onClose }: EditProfileScreenProps) {
  const insets = useSafeAreaInsets();

  const swipeGestures = useSwipeGesture({
    onSwipeRight: onClose,
  });

  const { userProfile, updateUserProfile, libraryItems } = useLibrary();
  const [username, setUsername] = useState(userProfile?.username || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [pronouns, setPronouns] = useState(userProfile?.pronouns || '');
  const [profilePicture, setProfilePicture] = useState(userProfile?.profilePicture || null);
  const [selectedFavorites, setSelectedFavorites] = useState({
    book: userProfile?.favoriteBookIds || [],
    film: userProfile?.favoriteFilmIds || [],
    show: userProfile?.favoriteShowIds || [],
  });
  const [activeCategory, setActiveCategory] = useState<'book' | 'film' | 'show'>('book');

  // Update state when modal becomes visible or userProfile changes
  React.useEffect(() => {
    if (isVisible && userProfile) {
      setUsername(userProfile.username || '');
      setBio(userProfile.bio || '');
      setPronouns(userProfile.pronouns || '');
      setProfilePicture(userProfile.profilePicture || null);
      setSelectedFavorites({
        book: userProfile.favoriteBookIds || [],
        film: userProfile.favoriteFilmIds || [],
        show: userProfile.favoriteShowIds || [],
      });
      setActiveCategory('book');
    }
  }, [isVisible, userProfile]);

  const availableItems = useMemo(() => {
    return libraryItems
      .filter((item) => item.type === activeCategory && item.status === 'finished')
      .sort((a, b) => {
        const dateA = new Date(a.dateAdded || 0).getTime();
        const dateB = new Date(b.dateAdded || 0).getTime();
        return dateB - dateA;
      });
  }, [libraryItems, activeCategory]);

  const currentFavorites = useMemo(() => {
    const ids =
      activeCategory === 'book'
        ? selectedFavorites.book
        : activeCategory === 'film'
          ? selectedFavorites.film
          : selectedFavorites.show;
    return libraryItems.filter((item) => ids.includes(item.id));
  }, [selectedFavorites, libraryItems, activeCategory]);

  const toggleFavorite = (itemId: string) => {
    setSelectedFavorites((prev) => {
      const key = activeCategory as 'book' | 'film' | 'show';
      const currentList = prev[key];

      if (currentList.includes(itemId)) {
        return {
          ...prev,
          [key]: currentList.filter((id) => id !== itemId),
        };
      } else if (currentList.length < 4) {
        return {
          ...prev,
          [key]: [...currentList, itemId],
        };
      }
      return prev;
    });
  };

  const handlePickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission needed', 'Please allow photo library access to choose a picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfilePicture(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open the photo library. Please try again.');
      console.error('Image picker error:', error);
    }
  };

  const handleSave = () => {
    updateUserProfile({
      username: username.trim() || 'Your Profile',
      bio,
      pronouns,
      profilePicture,
      favoriteBookIds: selectedFavorites.book,
      favoriteFilmIds: selectedFavorites.film,
      favoriteShowIds: selectedFavorites.show,
    });
    onClose();
  };

  const getCategoryLabel = (type: 'book' | 'film' | 'show') => {
    switch (type) {
      case 'book':
        return 'Top Books';
      case 'film':
        return 'Top Films';
      case 'show':
        return 'Top Shows';
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide">
      <SafeAreaView style={styles.container} edges={['bottom']} {...swipeGestures}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={24} color="#e98dca" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Username Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Username</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Your name"
              placeholderTextColor="#ccc"
              value={username}
              onChangeText={setUsername}
              maxLength={40}
            />
          </View>

          {/* Bio Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bio</Text>
            <TextInput
              style={styles.bioInput}
              placeholder="Tell us about yourself..."
              placeholderTextColor="#ccc"
              value={bio}
              onChangeText={setBio}
              multiline
              maxLength={150}
            />
            <Text style={styles.characterCount}>{bio.length}/150</Text>
          </View>

          {/* Pronouns Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pronouns</Text>
            <TextInput
              style={styles.bioInput}
              placeholder="e.g., she/her, they/them, he/him..."
              placeholderTextColor="#ccc"
              value={pronouns}
              onChangeText={setPronouns}
              maxLength={50}
            />
            <Text style={styles.characterCount}>{pronouns.length}/50</Text>
          </View>

          {/* Profile Picture Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profile Picture</Text>
            <View style={styles.profilePictureContainer}>
              <View style={styles.profilePicturePreview}>
                {profilePicture ? (
                  <Image source={{ uri: profilePicture }} style={styles.profilePictureImage} />
                ) : (
                  <MaterialCommunityIcons name="account-circle" size={60} color="#e98dca" />
                )}
              </View>
              <TouchableOpacity style={styles.uploadButton} onPress={handlePickImage}>
                <MaterialCommunityIcons name="cloud-upload" size={18} color="#fff" />
                <Text style={styles.uploadButtonText}>Choose Photo</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Favorites Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pick Your Favorites</Text>
            
            {/* Category Tabs */}
            <View style={styles.categoryTabs}>
              {(['book', 'film', 'show'] as const).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryTab, activeCategory === cat && styles.activeTab]}
                  onPress={() => setActiveCategory(cat)}>
                  <Text
                    style={[
                      styles.categoryTabText,
                      activeCategory === cat && styles.activeTabText,
                    ]}>
                    {getCategoryLabel(cat)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Selected Favorites */}
            {currentFavorites.length > 0 && (
              <View style={styles.selectedFavoritesContainer}>
                <Text style={styles.selectedLabel}>Selected ({currentFavorites.length}/4)</Text>
                <View style={styles.selectedGrid}>
                  {currentFavorites.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.selectedFavoriteCard}
                      onPress={() => toggleFavorite(item.id)}>
                      <Image
                        source={{ uri: item.coverImage }}
                        style={styles.selectedCover}
                      />
                      <MaterialCommunityIcons
                        name="close-circle"
                        size={24}
                        color="#e98dca"
                        style={styles.removeIcon}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Available Items */}
            <Text style={styles.availableLabel}>
              {currentFavorites.length >= 4
                ? "You've selected 4 favorites!"
                : `Select up to 4 ${getCategoryLabel(activeCategory).toLowerCase()}`}
            </Text>
            {availableItems.length === 0 ? (
              <Text style={styles.emptyText}>
                No finished {activeCategory}s yet. Add one to your library first!
              </Text>
            ) : (
              <FlatList
                data={availableItems}
                renderItem={({ item }) => {
                  const isSelected = selectedFavorites[activeCategory].includes(item.id);
                  const isAtLimit =
                    !isSelected && selectedFavorites[activeCategory].length >= 4;

                  return (
                    <TouchableOpacity
                      style={[
                        styles.itemCard,
                        isSelected && styles.itemCardSelected,
                        isAtLimit && !isSelected && styles.itemCardDisabled,
                      ]}
                      onPress={() => toggleFavorite(item.id)}
                      disabled={isAtLimit && !isSelected}>
                      <Image
                        source={{ uri: item.coverImage }}
                        style={styles.itemCover}
                      />
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemTitle} numberOfLines={2}>
                          {item.title}
                        </Text>
                        <Text style={styles.itemAuthor} numberOfLines={1}>
                          {item.authorDirector}
                        </Text>
                      </View>
                      {isSelected && (
                        <MaterialCommunityIcons
                          name="check-circle"
                          size={24}
                          color="#e98dca"
                        />
                      )}
                    </TouchableOpacity>
                  );
                }}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                nestedScrollEnabled={false}
              />
            )}
          </View>
        </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    zIndex: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  saveButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#e98dca',
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#000',
    backgroundColor: '#f9f9f9',
  },
  bioInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#000',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  profilePictureContainer: {
    alignItems: 'center',
    gap: 12,
  },
  profilePicturePreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  profilePictureImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#e98dca',
    borderRadius: 8,
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  categoryTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  categoryTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#e98dca',
    borderColor: '#e98dca',
  },
  categoryTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  selectedFavoritesContainer: {
    marginBottom: 16,
  },
  selectedLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  selectedGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  selectedFavoriteCard: {
    position: 'relative',
    width: 80,
    height: 110,
  },
  selectedCover: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  removeIcon: {
    position: 'absolute',
    top: -10,
    right: -10,
  },
  availableLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  itemCardSelected: {
    backgroundColor: '#f0e6f0',
    borderColor: '#e98dca',
  },
  itemCardDisabled: {
    opacity: 0.5,
  },
  itemCover: {
    width: 50,
    height: 75,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  itemAuthor: {
    fontSize: 12,
    color: '#666',
  },
  emptyText: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
});
