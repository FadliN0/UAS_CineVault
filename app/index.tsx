import { View, Text, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
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

    // Pindah ke home screen setelah 3 detik
    const timer = setTimeout(() => {
      router.replace('/(tabs)/home');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[
        styles.logoContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}>
        <Text style={styles.logo}>🎬</Text>
        <Text style={styles.title}>CineVault</Text>
        <Text style={styles.subtitle}>Discover Amazing Movies</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f39c12',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#bdc3c7',
    fontStyle: 'italic',
  },
});