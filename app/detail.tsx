import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

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
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color="#f1c40f" />
        </TouchableOpacity>
      </View>

      {/* Top Section */}
      <View style={styles.topSection}>
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

      {/* Plot */}
      <View style={{ marginBottom: 16 }}>
        <SkeletonBox width="100%" height={16} style={{ marginBottom: 6 }} />
        <SkeletonBox width="100%" height={16} style={{ marginBottom: 6 }} />
        <SkeletonBox width="100%" height={16} style={{ marginBottom: 6 }} />
        <SkeletonBox width="80%" height={16} />
      </View>

      {/* Info Block */}
      <View style={styles.infoBlock}>
        <SkeletonBox width="100%" height={16} style={{ marginBottom: 8 }} />
        <SkeletonBox width="100%" height={16} style={{ marginBottom: 8 }} />
        <SkeletonBox width="100%" height={16} />
      </View>

      {/* Box Office */}
      <View style={styles.boxOfficeSection}>
        <SkeletonBox width="40%" height={16} style={{ marginBottom: 8 }} />
        <SkeletonBox width="30%" height={18} />
      </View>

      {/* Score Row */}
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

      {/* Award Box */}
      <View style={styles.awardBox}>
        <SkeletonBox width="100%" height={16} />
      </View>
    </ScrollView>
  );
};

export default function DetailPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await axios.get(`http://www.omdbapi.com/?apikey=${API_KEY}&i=${id}`);
        setMovie(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return <DetailSkeleton />;
  }

  if (!movie) {
    return (
      <View style={styles.loading}>
        <Text style={{ color: '#fff' }}>Film tidak ditemukan</Text>
      </View>
    );
  }

  const posterUri =
    movie.Poster && movie.Poster !== 'N/A'
      ? movie.Poster
      : 'https://via.placeholder.com/400x600?text=No+Image';

  const genres = movie.Genre?.split(',').map((genre: string) => genre.trim());

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#f1c40f" />
        </TouchableOpacity>
      </View>

      <View style={styles.topSection}>
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
              <Text style={styles.votes}>{movie.imdbVotes} ratings</Text>
            </View>
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

      <Text style={styles.plot}>{movie.Plot}</Text>

      <View style={styles.infoBlock}>
        <Text style={styles.infoLabel}>Director <Text style={styles.infoValue}>{movie.Director}</Text></Text>
        <Text style={styles.infoLabel}>Writers <Text style={styles.infoValue}>{movie.Writer}</Text></Text>
        <Text style={styles.infoLabel}>Stars <Text style={styles.infoValue}>{movie.Actors}</Text></Text>
      </View>

      <View style={styles.boxOfficeSection}>
        <Text style={styles.boxOfficeLabel}>| BOX OFFICE</Text>
        <Text style={styles.boxOfficeValue}>{movie.BoxOffice || '-'}</Text>
      </View>

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

      <View style={styles.awardBox}>
        <Text style={styles.awardText}>{movie.Awards}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#121212',
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 16,
  },
  topSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  poster: {
    width: 120,
    height: 180,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  meta: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f1c40f',
    marginBottom: 4,
  },
  subtitle: {
    color: '#bdc3c7',
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  votes: {
    color: '#aaa',
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
    backgroundColor: '#2c2c2c',
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    fontSize: 12,
  },
  plot: {
    color: '#ecf0f1',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  infoBlock: {
    marginBottom: 16,
  },
  infoLabel: {
    color: '#aaa',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  infoValue: {
    color: '#fff',
    fontWeight: 'normal',
  },
  boxOfficeSection: {
    marginBottom: 16,
  },
  boxOfficeLabel: {
    color: '#f1c40f',
    fontWeight: 'bold',
    fontSize: 14,
  },
  boxOfficeValue: {
    color: '#fff',
    fontSize: 16,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  scoreBox: {
    backgroundColor: '#2c2c2c',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
  },
  scoreNumber: {
    color: '#f1c40f',
    fontWeight: 'bold',
    fontSize: 18,
  },
  scoreLabel: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  awardBox: {
    backgroundColor: '#f1c40f',
    padding: 14,
    borderRadius: 12,
    marginBottom: 40,
  },
  awardText: {
    color: '#121212',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
});