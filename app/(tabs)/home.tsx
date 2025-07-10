import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  Animated
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
    {[1, 2, 3, 4, 5].map((item) => (
      <SkeletonMovieCard key={item} />
    ))}
  </View>
);

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const router = useRouter();

  const onGetData = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `http://www.omdbapi.com/?apikey=b45dad4f&s=${searchQuery}`
      );

      if (response.data.Response === 'True') {
        setMovies(response.data.Search);
      } else {
        setMovies([]);
        Alert.alert('Info', response.data.Error || 'Film tidak ditemukan');
      }
      setSearched(true);
    } catch (error) {
      const err = error as Error;
      const message = err?.message || 'Gagal mengambil data';
      Alert.alert('Error', message);
      setMovies([]);
    } finally {
      setLoading(false);
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerWrapper}>
  <View style={styles.header}>
    <Text style={styles.logo}>CineVault</Text>
    {/* <View style={styles.avatar} /> */}
  </View>

  <View style={styles.searchWrapper}>
    <Ionicons name="search" size={18} color="#2c3e50" style={{ marginLeft: 10 }} />
    <TextInput
      placeholder="Cari film..."
      placeholderTextColor="#2c3e50"
      value={searchQuery}
      onChangeText={setSearchQuery}
      onSubmitEditing={onGetData}
      style={styles.searchInput}
    />
  </View>

  <View style={styles.separator} />
</View>


      {/* Skeleton Loading */}
      {loading && <SkeletonLoadingList />}

      {/* Empty Search */}
      {!loading && !searched && (
        <View style={styles.emptyContainer}>
  <Ionicons name="film-outline" size={64} color="#7f8c8d" style={{ marginBottom: 20 }} />
  <Text style={styles.emptyTitle}>Temukan Film Favoritmu</Text>
  <Text style={styles.emptySubtitle}>Mulai cari judul film, serial, atau episode di atas.</Text>
</View>

      )}

      {/* No Result */}
      {!loading && searched && movies.length === 0 && (
  <View style={styles.emptyContainer}>
    <Ionicons name="film-outline" size={64} color="#7f8c8d" style={{ marginBottom: 20 }} />
    <Text style={styles.emptyNotFoundText}>Movie not found!</Text>
  </View>
)}


      {/* List Result */}
      {!loading && movies.length > 0 && (
        <FlatList
          data={movies}
          renderItem={renderMovieCard}
          keyExtractor={(item) => item.imdbID}
          contentContainerStyle={styles.list}
        />
      )}
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
    justifyContent: 'space-between',
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
  // (Removed duplicate searchWrapper and searchInput)
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
},
emptyNotFoundText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
},

});