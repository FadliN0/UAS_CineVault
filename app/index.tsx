import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const [progress, setProgress] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const router = useRouter();

  useEffect(() => {
    // Animasi fade in dan scale
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Simulasi loading progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // Pindah ke home screen setelah loading selesai
          setTimeout(() => {
            router.replace('/(tabs)/home');
          }, 500);
          return 100;
        }
        return prev + 2; // Increase by 2% every 50ms
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <LinearGradient
      colors={[ '#000', '#000','#f1c40f']}

      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >

      {/* Main content */}
      <Animated.View style={[
        styles.content,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}>

        {/* Title */}
        <Text style={styles.title}>CineVault</Text>
        
        {/* Underline */}
        <View style={styles.underline} />
        
        {/* Subtitle */}
        <Text style={styles.subtitle}>Discover Amazing Movies</Text>
        
        {/* Loading section */}
        <View style={styles.loadingContainer}>
          {/* Loading bar */}
          <View style={styles.loadingBarContainer}>
            <View style={[styles.loadingBar, { width: `${progress}%` }]} />
          </View>
          
          {/* Loading text */}
          <View style={styles.loadingTextContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
            <Text style={styles.progressText}>{progress}%</Text>
          </View>
        </View>
      </Animated.View>

      {/* Bottom dots */}
      <View style={styles.bottomDots}>
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backgroundElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    alignItems: 'center',
    maxWidth: 350,
    width: '100%',
  },
  movieIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#f1c40f',
    marginBottom: 10,
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  underline: {
    width: 120,
    height: 4,
    backgroundColor: '#2c3e50',
    marginBottom: 20,
    borderRadius: 2,
  },
  subtitle: {
    fontSize: 18,
    color: '#34495e',
    marginBottom: 60,
    fontWeight: '300',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  loadingContainer: {
    width: '100%',
    maxWidth: 300,
  },
  loadingBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(44, 62, 80, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  loadingBar: {
    height: '100%',
    backgroundColor: '#f1c40f',
    borderRadius: 4,
    shadowColor: '#f1c40f',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  progressText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  bottomDots: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(44, 62, 80, 0.5)',
    marginHorizontal: 4,
  },
});