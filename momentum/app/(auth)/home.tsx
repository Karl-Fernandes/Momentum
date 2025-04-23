import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, StatusBar, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import GoogleLogo from '@/assets/images/google_logo.svg';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { auth } from '@/firebase/config';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import Constants from 'expo-constants';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

// Complete any pending auth session
WebBrowser.maybeCompleteAuthSession();

const MomentumApp: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Google Sign-In configuration as early as possible
  useEffect(() => {
    try {
      // Log the client ID to ensure it's being loaded correctly
      const webClientId = Constants.expoConfig?.extra?.googleWebClientId;
      console.log("Google Web Client ID:", webClientId);
      
      if (!webClientId) {
        console.error("Missing Google Web Client ID in app config");
        setError("Missing Google configuration");
        return;
      }
      
      GoogleSignin.configure({
        webClientId: webClientId,
        offlineAccess: true,
        forceCodeForRefreshToken: true,
        // Make sure to add the following if on iOS
        iosClientId: Constants.expoConfig?.extra?.googleIosClientId
      });
      
      // Check if the user is already signed in - fixed method
      checkIfSignedIn();
    } catch (configError) {
      console.error("Failed to configure Google Sign-In:", configError);
      setError("Failed to initialize Google Sign-In");
    }
  }, []);

  // Check if user is already signed in - fixed implementation
  const checkIfSignedIn = async () => {
    try {
      // Use getCurrentUser instead of isSignedIn
      const currentUser = await GoogleSignin.getCurrentUser();
      const isSignedIn = currentUser !== null;
      console.log("Is user signed in:", isSignedIn);
      if (isSignedIn) {
        console.log("User already signed in:", currentUser);
        // You may want to navigate to the main app here
      }
    } catch (error) {
      console.error("Failed to check sign-in status:", error);
    }
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      console.log("Starting Google Sign In process...");
      
      // Sign out first to ensure clean state (helps with DEVELOPER_ERROR)
      try {
        await GoogleSignin.signOut();
        console.log("Signed out from previous session");
      } catch (signOutError) {
        console.log("No previous session to sign out from");
      }
      
      // First, check if Play Services are available
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      console.log("Play services check passed");
      
      // Sign in with Google
      const userInfo = await GoogleSignin.signIn();
      console.log("Google Sign In successful:", userInfo);

      // Get the ID token
      const { idToken } = await GoogleSignin.getTokens();
      console.log("Got ID token, length:", idToken?.length || 0);
      
      if (!idToken) {
        throw new Error("Failed to get ID token from Google");
      }

      // Create Firebase credential
      const credential = GoogleAuthProvider.credential(idToken);
      console.log("Created Firebase credential");
      
      // Sign in to Firebase
      const result = await signInWithCredential(auth, credential);
      console.log("Firebase sign in successful:", result.user.uid);

      // Success feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Navigate to the main app screen
      router.replace('/(tabs)');
    } catch (e: any) {
      console.error("Google Sign In error:", e.code, e);
      
      if (e.code === statusCodes.SIGN_IN_CANCELLED) {
        setError('Sign in was cancelled');
      } else if (e.code === statusCodes.IN_PROGRESS) {
        setError('Sign in is already in progress');
      } else if (e.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setError('Google Play services not available');
      } else if (e.message && e.message.includes('DEVELOPER_ERROR')) {
        // Handle the specific DEVELOPER_ERROR
        setError('Google sign-in configuration error. Please check Firebase Console and SHA-1 keys.');
        Alert.alert(
          'Developer Error',
          'There appears to be a mismatch between your app and Google credentials. Please verify that:\n\n' +
          '1. The SHA-1 fingerprint is correctly added to Firebase\n' +
          '2. The OAuth client ID is correct\n' +
          '3. The package name matches your app',
          [{ text: 'OK' }]
        );
      } else {
        // More detailed error message
        setError(`Authentication failed: ${e.message || 'Unknown error'}`);
        Alert.alert(
          'Authentication Error',
          `Failed to sign in with Google: ${e.message}`,
          [{ text: 'OK' }]
        );
      }
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
          disabled={loading}
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