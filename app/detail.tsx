import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Animated,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const API_KEY = 'b45dad4f';

// Custom Skeleton Components
const SkeletonBox = ({ width, height, style = {} }: { width: string | number, height: number, style?: any }) => {
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
    <Animated.View 
      style={[
        {
          width,
          height,
          backgroundColor: '#2c2c2c',
          borderRadius: 8,
        },
        shimmerStyle,
        style
      ]} 
    />
  );
};

const DetailSkeleton = () => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color="#f1c40f" />
        </TouchableOpacity>
      </View>

      {/* Skeleton Content */}
      <View style={styles.skeletonContent}>
        <View style={styles.topCard}>
          <SkeletonBox width={120} height={180} />
          <View style={styles.meta}>
            <SkeletonBox width="90%" height={20} style={{ marginBottom: 8 }} />
            <SkeletonBox width="70%" height={16} style={{ marginBottom: 12 }} />
            <SkeletonBox width="60%" height={16} style={{ marginBottom: 12 }} />
            <View style={styles.genreRow}>
              <SkeletonBox width={60} height={24} style={{ borderRadius: 12 }} />
              <SkeletonBox width={80} height={24} style={{ borderRadius: 12 }} />
              <SkeletonBox width={70} height={24} style={{ borderRadius: 12 }} />
            </View>
          </View>
        </View>

        {/* Plot Card */}
        <View style={styles.card}>
          <SkeletonBox width="100%" height={16} style={{ marginBottom: 6 }} />
          <SkeletonBox width="100%" height={16} style={{ marginBottom: 6 }} />
          <SkeletonBox width="100%" height={16} style={{ marginBottom: 6 }} />
          <SkeletonBox width="80%" height={16} />
        </View>

        {/* Info Card */}
        <View style={styles.card}>
          <SkeletonBox width="100%" height={16} style={{ marginBottom: 8 }} />
          <SkeletonBox width="100%" height={16} style={{ marginBottom: 8 }} />
          <SkeletonBox width="100%" height={16} />
        </View>

        {/* Box Office Card */}
        <View style={styles.card}>
          <SkeletonBox width="40%" height={16} style={{ marginBottom: 8 }} />
          <SkeletonBox width="30%" height={18} />
        </View>

        {/* Score Card */}
        <View style={styles.card}>
          <View style={styles.scoreRow}>
            <View style={styles.scoreBox}>
              <SkeletonBox width={40} height={20} style={{ marginBottom: 8 }} />
              <SkeletonBox width={80} height={12} />
            </View>
            <View style={styles.scoreBox}>
              <SkeletonBox width={40} height={20} style={{ marginBottom: 8 }} />
              <SkeletonBox width={80} height={12} />
            </View>
            <View style={styles.scoreBox}>
              <SkeletonBox width={40} height={20} style={{ marginBottom: 8 }} />
              <SkeletonBox width={80} height={12} />
            </View>
          </View>
        </View>

        {/* Award Card */}
        <View style={styles.awardSection}>
          <SkeletonBox width="100%" height={16} />
        </View>
      </View>
    </View>
  );
};

export default function DetailPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = async () => {
    try {
      const res = await axios.get(`http://www.omdbapi.com/?apikey=${API_KEY}&i=${id}`);
      if (res.data.Response === "True") {
        setMovie(res.data);
      } else {
        setError(res.data.Error || 'Film tidak ditemukan');
        setMovie(null);
      }
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data film. Silakan coba lagi.');
      setMovie(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  // Pull to refresh handler - Reset everything and show skeleton
  const onRefresh = useCallback(() => {
    setMovie(null); // Clear current movie data
    setError(null);  // Clear any error
    fetchDetail();   // This will set loading to true and show skeleton
  }, [id]);

  // Manual reload handler - Reset everything and show skeleton
  const handleReload = () => {
    setMovie(null); // Clear current movie data
    setError(null);  // Clear any error
    fetchDetail();   // This will set loading to true and show skeleton
  };

  // Function to format names with dots
  const formatNames = (names: string) => {
    if (!names || names === 'N/A') return '-';
    return names.split(',').map(name => name.trim()).join(' • ');
  };

  // Render header
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#f1c40f" />
      </TouchableOpacity>
    </View>
  );

  // Render movie content
  const renderMovieContent = () => {
    if (!movie) return null;

    const posterUri =
      movie.Poster && movie.Poster !== 'N/A'
        ? movie.Poster
        : 'https://via.placeholder.com/400x600?text=No+Image';

    const genres = movie.Genre?.split(',').map((genre: string) => genre.trim());

    return (
      <LinearGradient
        colors={['#e0aa3e', '#000', '#000', '#000']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.contentContainer}
      >
        {/* Top Section */}
        <View style={styles.topSection}>
          <View style={styles.posterSection}>
            <Image source={{ uri: posterUri }} style={styles.poster} />
            <View style={styles.meta}>
              <Text style={styles.title}>{movie.Title}</Text>
              <Text style={styles.subtitle}>
                {movie.Year} • {movie.Rated} • {movie.Runtime}
              </Text>
              <View style={styles.ratingRow}>
                <View style={styles.ratingBox}>
                  <Ionicons name="star" color="#f1c40f" size={14} />
                  <Text style={styles.ratingText}>{movie.imdbRating}/10</Text>
                </View>
                <Text style={styles.votes}>{movie.imdbVotes} ratings</Text>
              </View>
              <View style={styles.genreRow}>
                {genres?.map((genre: string) => (
                  <Text key={genre} style={styles.genreBadge}>
                    {genre}
                  </Text>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Plot Section */}
        <View style={styles.plotSection}>
          <Text style={styles.plot}>{movie.Plot}</Text>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Director</Text>
            <Text style={styles.infoValue}>{formatNames(movie.Director)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Writers</Text>
            <Text style={styles.infoValue}>{formatNames(movie.Writer)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Stars</Text>
            <Text style={styles.infoValue}>{formatNames(movie.Actors)}</Text>
          </View>
        </View>

        {/* Box Office Section */}
        <View style={styles.boxOfficeSection}>
          <Text style={styles.boxOfficeLabel}>BOX OFFICE</Text>
          <Text style={styles.boxOfficeValue}>{movie.BoxOffice || 'Not Available'}</Text>
        </View>

        {/* Ratings Section */}
        <View style={styles.ratingsSection}>
          <View style={styles.scoreRow}>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreNumber}>{movie.imdbRating}</Text>
              <Text style={styles.scoreLabel}>IMDB RATING</Text>
            </View>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreNumber}>
                {movie.Ratings?.[1]?.Value || 'N/A'}
              </Text>
              <Text style={styles.scoreLabel}>ROTTEN TOMATOES</Text>
            </View>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreNumber}>
                {movie.Metascore}/100
              </Text>
              <Text style={styles.scoreLabel}>METACRITIC</Text>
            </View>
          </View>
          {/* Awards Section */}
          <View style={styles.awardSection}>
            <Text style={styles.awardText}>{movie.Awards}</Text>
          </View>
        </View>
      </LinearGradient>
    );
  };

  // Render error state with retry that shows skeleton
  const renderError = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle-outline" size={48} color="#e74c3c" />
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={handleReload}>
        <Text style={styles.retryText}>Coba Lagi</Text>
      </TouchableOpacity>
    </View>
  );

  // Show loading skeleton
  if (loading) {
    return <DetailSkeleton />;
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <FlatList
        data={[1]} // Dummy data array with one item
        renderItem={() => (
          <View style={styles.contentWrapper}>
            {error ? renderError() : renderMovieContent()}
          </View>
        )}
        keyExtractor={() => 'movie-detail'}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={onRefresh}
            colors={['#f1c40f']} // Android
            tintColor="#f1c40f" // iOS
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#121212',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  reloadButton: {
    padding: 8,
    backgroundColor: 'rgba(241, 196, 15, 0.1)',
    borderRadius: 8,
  },
  skeletonContent: {
    flex: 1,
  },
  flatListContent: {
    flexGrow: 1,
  },
  contentWrapper: {
    flex: 1,
    minHeight: 600, // Ensure minimum height for content
  },
  contentContainer: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1e1e1e',
    marginBottom: 40,
  },
  topCard: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    alignItems: 'center',
  },
  topSection: {
    padding: 16,
  },
  posterSection: {
    flexDirection: 'row',
    gap: 12,
  },
  poster: {
    width: 120,
    height: 180,
    borderRadius: 12,
    backgroundColor: '#333',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  meta: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f1c40f',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    color: '#e8e8e8',
    marginBottom: 8,
    fontSize: 15,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingBox: {
    backgroundColor: 'rgba(173, 135, 12, 0.56)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {  
    color: '#f1c40f',
    fontWeight: 'bold',
    fontSize: 15,
  },
  votes: {
    color: '#ddd',
    fontSize: 12,
    marginLeft: 4,
  },
  genreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  genreBadge: {
    backgroundColor: 'rgba(100, 95, 95, 0.86)',
    color: 'rgb(220, 220, 213)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    fontSize: 12,
    fontWeight: '600',
  },
  plotSection: {
    backgroundColor: 'black',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  plot: {
    color: '#ecf0f1',
    fontSize: 15,
    lineHeight: 22,
  },
  infoSection: {
    backgroundColor: 'black',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  boxOfficeSection: {
    backgroundColor: 'black',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  boxOfficeLabel: {
    color: '#f1c40f',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 8,
  },
  ratingsSection: {
    backgroundColor: 'black',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  awardSection: {
    backgroundColor: 'rgba(230, 210, 34, 0.34)',
    padding: 16,
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1c40f',
  },
  awardText: {
    color: '#f1c40f',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 15,
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  infoValue: {
    color: '#4A90E2',
    fontSize: 14,
    lineHeight: 20,
  },
  boxOfficeValue: {
    color: '#fff',
    fontSize: 18,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  scoreBox: {
    backgroundColor: '#1e1e1e',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
  },
  scoreNumber: {
    color: '#f1c40f',
    fontWeight: 'bold',
    fontSize: 16,
  },
  scoreLabel: {
    color: '#fff',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '600',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  card: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 20,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#f1c40f',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#000',
    fontWeight: 'bold',
  },
});