import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  Animated,
  RefreshControl,
  ScrollView
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

interface Movie {
  imdbID: string;
  Title: string;
  Year: string;
  Type: string;
  Poster: string;
}

// Custom Skeleton Card Component
const SkeletonMovieCard = () => {
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = () => {
      shimmerAnimation.setValue(0);
      Animated.timing(shimmerAnimation, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }).start(() => shimmer());
    };
    shimmer();
  }, []);

  const shimmerStyle = {
    opacity: shimmerAnimation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.3, 0.7, 0.3],
    }),
  };

  return (
    <View style={styles.card}>
      <Animated.View style={[styles.poster, styles.skeletonBase, shimmerStyle]} />
      <View style={styles.cardInfo}>
        <Animated.View style={[styles.skeletonTitle, shimmerStyle]} />
        <Animated.View style={[styles.skeletonType, shimmerStyle]} />
        <Animated.View style={[styles.skeletonYear, shimmerStyle]} />
      </View>
    </View>
  );
};

// Skeleton Loading List
const SkeletonLoadingList = () => (
  <View style={styles.list}>
    {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
      <SkeletonMovieCard key={item} />
    ))}
  </View>
);

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searched, setSearched] = useState(false);
  const [lastSearchQuery, setLastSearchQuery] = useState('');
  const router = useRouter();

  const onGetData = async (isRefresh = false, queryToSearch = '') => {
    const searchTerm = queryToSearch || searchQuery;
    
    if (!searchTerm.trim()) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await axios.get(
        `https://www.omdbapi.com/?apikey=b45dad4f&s=${searchTerm}`
      );

      if (response.data.Response === 'True') {
        setMovies(response.data.Search);
        setLastSearchQuery(searchTerm);
      } else {
        setMovies([]);
        if (!isRefresh) {
          Alert.alert('Info', response.data.Error || 'Film tidak ditemukan');
        }
      }
      setSearched(true);
    } catch (error) {
      const err = error as Error;
      const message = err?.message || 'Gagal mengambil data';
      
      if (!isRefresh) {
        Alert.alert('Error', message);
      }
      setMovies([]);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const onRefresh = () => {
    // Set refreshing to true immediately to show skeleton
    setRefreshing(true);
    
    if (lastSearchQuery.trim()) {
      onGetData(true, lastSearchQuery);
    } else if (searchQuery.trim()) {
      onGetData(true, searchQuery);
    } else {
      // If no search query, just stop refreshing
      setRefreshing(false);
    }
  };

  const onMoviePress = (movie: Movie) => {
    router.push({
      pathname: '/detail',
      params: { id: movie.imdbID }
    });
  };

  const renderMovieCard = ({ item }: { item: Movie }) => {
    const isValidPoster = item.Poster && item.Poster !== 'N/A';
    return (
      <TouchableOpacity style={styles.card} onPress={() => onMoviePress(item)}>
        <Image
          source={{
            uri: isValidPoster
              ? item.Poster
              : 'https://via.placeholder.com/300x445?text=No+Image'
          }}
          style={styles.poster}
        />
        <View style={styles.cardInfo}>
          <Text style={styles.title} numberOfLines={2}>
            {item.Title}
          </Text>
          <Text style={styles.type}>{item.Type}</Text>
          <View style={styles.yearRow}>
            <Ionicons name="calendar-outline" size={14} color="#fff" />
            <Text style={styles.year}>{item.Year}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    // Skeleton Loading - show skeleton during refresh or initial loading
    if (loading || refreshing) {
      return (
        <ScrollView 
          style={styles.scrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#f1c40f']}
              tintColor={'#f1c40f'}
              title="Pull to refresh"
              titleColor={'#f1c40f'}
            />
          }
        >
          <SkeletonLoadingList />
        </ScrollView>
      );
    }

    // Empty Search State
    if (!loading && !searched) {
      return (
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.emptyScrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#f1c40f']}
              tintColor={'#f1c40f'}
              title="Pull to refresh"
              titleColor={'#f1c40f'}
            />
          }
        >
          <View style={styles.emptyContainer}>
            <Ionicons name="film-outline" size={64} color="#7f8c8d" style={{ marginBottom: 20 }} />
            <Text style={styles.emptyTitle}>Temukan Film Favoritmu</Text>
            <Text style={styles.emptySubtitle}>Mulai cari judul film, serial, atau episode di atas.</Text>
          </View>
        </ScrollView>
      );
    }

    // No Result State
    if (!loading && searched && movies.length === 0) {
      return (
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.emptyScrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#f1c40f']}
              tintColor={'#f1c40f'}
              title="Pull to refresh"
              titleColor={'#f1c40f'}
            />
          }
        >
          <View style={styles.emptyContainer}>
            <Ionicons name="film-outline" size={64} color="#7f8c8d" style={{ marginBottom: 20 }} />
            <Text style={styles.emptyNotFoundText}>Movie not found!</Text>
            <Text style={styles.emptySubtitle}>Try searching with different keywords.</Text>
          </View>
        </ScrollView>
      );
    }

    // Movies List
    return (
      <FlatList
        data={movies}
        renderItem={renderMovieCard}
        keyExtractor={(item) => item.imdbID}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#f1c40f']}
            tintColor={'#f1c40f'}
            title="Pull to refresh"
            titleColor={'#f1c40f'}
          />
        }
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerWrapper}>
        <View style={styles.header}>
          <Text style={styles.logo}>CineVault</Text>
        </View>

        <View style={styles.searchWrapper}>
          <Ionicons name="search" size={18} color="#2c3e50" style={{ marginLeft: 10 }} />
          <TextInput
            placeholder="Cari film..."
            placeholderTextColor="#2c3e50"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => onGetData(false)}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => {
                setSearchQuery('');
                setMovies([]);
                setSearched(false);
                setLastSearchQuery('');
              }}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={18} color="#2c3e50" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.separator} />
      </View>

      {/* Content */}
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f1c40f',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderColor: '#f1c40f',
    borderWidth: 2,
  },
  scrollContainer: {
    flex: 1,
  },
  emptyScrollContent: {
    flexGrow: 1,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    marginBottom: 16,
    overflow: 'hidden',
  },
  poster: {
    width: 100,
    height: 140,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    backgroundColor: '#333',
  },
  cardInfo: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  title: {
    color: '#f1c40f',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 6,
  },
  type: {
    color: '#bdc3c7',
    fontSize: 14,
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  year: {
    color: '#ecf0f1',
    fontSize: 13,
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    color: '#aaa',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Skeleton styles
  skeletonBase: {
    backgroundColor: '#2c2c2c',
  },
  skeletonTitle: {
    width: '80%',
    height: 16,
    borderRadius: 4,
    marginBottom: 8,
    backgroundColor: '#2c2c2c',
  },
  skeletonType: {
    width: '60%',
    height: 14,
    borderRadius: 4,
    marginBottom: 6,
    backgroundColor: '#2c2c2c',
  },
  skeletonYear: {
    width: '40%',
    height: 13,
    borderRadius: 4,
    backgroundColor: '#2c2c2c',
  },
  headerWrapper: {
    marginBottom: 24,
  },
  separator: {
    height: 2,
    backgroundColor: '#f1c40f',
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 1,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 10,
    marginTop: 8,
  },
  searchInput: {
    flex: 1,
    color: '#2c3e50',
    fontSize: 16,
    marginLeft: 10,
  },
  clearButton: {
    padding: 8,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  emptySubtitle: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyNotFoundText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});