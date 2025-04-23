import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, StatusBar, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import GoogleLogo from '@/assets/images/google_logo.svg';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { auth } from '@/firebase/config';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import Constants from 'expo-constants';


// Complete any pending auth session
WebBrowser.maybeCompleteAuthSession();

const MomentumApp: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Configure Google Sign-In with web client ID and Firebase redirect handler
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: Constants.expoConfig?.extra?.googleWebClientId,
    scopes: ['openid', 'https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
    redirectUri: 'https://momentum0821.firebaseapp.com/__/auth/handler',
  });

  // Log for debugging
  useEffect(() => {
    if (request) {
      console.log('Auth request ready with scopes:', request.scopes);
      console.log('Redirect URI:', request.redirectUri);
      console.log('Client ID:', Constants.expoConfig?.extra?.googleWebClientId);
    }
  }, [request]);

  // Log response for debugging
  useEffect(() => {
    if (response) {
      console.log('Response received:', JSON.stringify(response, null, 2));
      if (response?.type === 'error') {
        console.log('Error details:', response.error);
        console.log('Error params:', response.params);
      }
    }
  }, [response]);

  // Handle Google Auth response
  useEffect(() => {
    if (response?.type === 'success') {
      setLoading(true);
      console.log('Success response received');
      try {
        const { id_token } = response.params;
        console.log('ID token received:', id_token ? 'Yes' : 'No');
        if (!id_token) {
          setError('No ID token received from Google');
          setLoading(false);
          return;
        }
        const credential = GoogleAuthProvider.credential(id_token);
        signInWithCredential(auth, credential)
          .then(() => {
            console.log('Successfully signed in with Firebase');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          })
          .catch((error) => {
            console.error('Firebase credential error:', error);
            setError('Firebase sign-in failed: ' + error.message);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          })
          .finally(() => {
            setLoading(false);
          });
      } catch (error) {
        console.error('Google auth error:', error);
        setError('Error processing Google sign-in');
        setLoading(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } else if (response?.type === 'error') {
      console.error('Google Sign-In Error:', response.error);
      setError('Google sign-in failed: ' + (response.error?.message || 'Unknown error'));
    } else if (response?.type === 'dismiss') {
      console.log('User dismissed the auth session');
      setError('Sign-in cancelled');
    }
  }, [response]);

  const handleGoogleSignUp = async () => {
    if (!request) {
      setError('Auth request not ready');
      return;
    }
    try {
      setError(null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setLoading(true);
      console.log('Starting Google sign-in process with redirect:', request?.redirectUri);
      const result = await promptAsync();
      console.log('Prompt result:', JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Google sign-in prompt error:', error);
      setError('Could not open Google sign-in: ' + (error instanceof Error ? error.message : String(error)));
      Alert.alert('Error', 'Could not start Google Sign-In process');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
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

      {/* Error message display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

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
    overflow: 'hidden',
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
  errorContainer: {
    padding: 10,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    marginHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
});

export default MomentumApp;

export const screenOptions = {
  headerShown: false,
};