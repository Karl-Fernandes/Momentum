import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, StatusBar, SafeAreaView, ActivityIndicator } from 'react-native';
import GoogleLogo from '@/assets/images/google_logo.svg';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { auth } from '@/firebase/config';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';

// Initialize WebBrowser for Google auth
WebBrowser.maybeCompleteAuthSession();

const MomentumApp: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Set up Google Auth Request
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '443859253397-j8r0bfv4lv1kptt5gpbfh5pr58e0df71.apps.googleusercontent.com',
    webClientId: '443859253397-j8r0bfv4lv1kptt5gpbfh5pr58e0df71.apps.googleusercontent.com',
    iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',         
    androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
    scopes: ['profile', 'email']
  });

  // Handle Google Auth response
  useEffect(() => {
    if (response?.type === 'success') {
      setLoading(true);
      
      try {
        const { id_token } = response.params;
        const credential = GoogleAuthProvider.credential(id_token);
        
        signInWithCredential(auth, credential)
          .then(() => {
            console.log("Logged in with Google!");
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            // Auth state listener in _layout.tsx will handle navigation
          })
          .catch(error => {
            console.error("Firebase credential error:", error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          })
          .finally(() => {
            setLoading(false);
          });
      } catch (error) {
        console.error("Google auth error:", error);
        setLoading(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  }, [response]);

  const handleGoogleSignUp = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    
    try {
      await promptAsync();
    } catch (error) {
      console.error('Google sign in prompt error:', error);
      setLoading(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleEmailSignUp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(auth)/register');
  };

  const handleLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image 
          source={require('@/assets/images/momentum_logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      
      {/* Main background image */}
      <View style={styles.imageContainer}>
        <Image 
          source={require('@/assets/images/muscular.jpeg')}
          style={styles.backgroundImage} 
          resizeMode="cover"
        />
      </View>
      
      {/* Login options */}
      <View style={styles.loginContainer}>
        <TouchableOpacity 
          style={styles.googleButton} 
          onPress={handleGoogleSignUp}
          disabled={loading || !request}
        >
          {loading ? (
            <ActivityIndicator color="#1E88E5" size="small" />
          ) : (
            <>
              <View style={styles.googleIconContainer}>
                <GoogleLogo width={18} height={18} />
              </View>
              <Text style={styles.googleButtonText}>Sign up with Google</Text>
            </>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.emailButton} 
          onPress={handleEmailSignUp}
          disabled={loading}
        >
          <Text style={styles.emailButtonText}>Sign up with email</Text>
        </TouchableOpacity>
        
        <View style={styles.loginTextContainer}>
          <Text style={styles.loginText}>Already have account? </Text>
          <TouchableOpacity onPress={handleLogin} disabled={loading}>
            <Text style={styles.loginLink}>Log in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  googleIcon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
  },
  
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 20,
  },
  logo: {
    width: 200,
    height: 200,
    marginTop: -40,
  },
  imageContainer: {
    flex: 1,
    marginTop: -40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  loginContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 10,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    overflow: 'hidden', // makes it cleanly rounded
  },
  googleIconText: {
    color: '#EA4335',
    fontSize: 16,
    fontWeight: 'bold',
  },
  googleButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    flex: 1,
  },
  emailButton: {
    backgroundColor: '#1E88E5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  emailButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  loginTextContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  loginText: {
    color: 'white',
    fontSize: 14,
  },
  loginLink: {
    color: '#1E88E5',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MomentumApp;

export const screenOptions = {
  headerShown: false,
};