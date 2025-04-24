import React, { useState, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, TextInput, Button, Alert, ImageBackground, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import * as Haptics from 'expo-haptics';
import Constants from 'expo-constants';
import { auth } from '@/firebase/config';
import { 
  signInWithEmailAndPassword, 
  signInWithCredential 
} from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { GoogleAuthProvider } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import GoogleLogo from '@/assets/images/google_logo.svg';
import { FocusAwareStatusBar } from "@/components/FocusAwareStatusBar";

// Background image (replace with your actual image path)

// Login Screen
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  
  const [emailOrUsername, setEmailorUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async () => {
    // Handle login logic here
    setLoading(true);
    setError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (!emailOrUsername || !password) {
      setError("Please enter both email/username and password");
      setLoading(false);
      return;
    }
    
    try {
      // Determine if input is email (contains @) or username
      const isEmail = emailOrUsername.includes('@');
      
      if (isEmail) {
        // Direct email login with Firebase
        await signInWithEmailAndPassword(auth, emailOrUsername, password);
        console.log("Email login successful:", emailOrUsername);
      } else {
        // If username, we need to query Firestore first to get the email
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", emailOrUsername));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          throw new Error("No user found with this username");
        }
        
        // Get the email from the first matching user
        const userDoc = querySnapshot.docs[0];
        const email = userDoc.data().email;
        
        // Then sign in with the email
        await signInWithEmailAndPassword(auth, email, password);
        console.log("Username login successful:", emailOrUsername);
      }
      
      // Success feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Navigate to main app
      router.replace('/(tabs)');
      
    } catch (error: any) {
      console.error("Login error:", error.code, error.message);
      
      // Handle different error types
      let errorMessage = "Login failed. Please try again.";
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = "Invalid email/username or password";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email format";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many failed login attempts. Please try again later.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

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


  

  return (
    <SafeAreaView style={styles.container}>
      <FocusAwareStatusBar
        barStyle="light-content"
        backgroundColor="#222222"
      />
      
      
      
      
      {/* Form Inputs */}
      <View style={styles.formContainer}>
        <Text style={styles.inputLabel}>Email or Username</Text>
        <TextInput
          style={styles.input}
          placeholder="example@gmail.com"
          placeholderTextColor="#666"
          value={emailOrUsername}
          onChangeText={setEmailorUsername}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <Text style={styles.inputLabel}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="minimum 6 characters"
          placeholderTextColor="#666"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Text style={styles.forgotText}>Forgot Password? </Text>

        {/* Error message */}
        {error && <Text style={styles.errorText}>{error}</Text>}
            
        {/* Continue Button */}
        <TouchableOpacity 
          style={[styles.loginButton, loading && styles.disabledButton]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.orContainer}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.orLine} />
        </View>  

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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  forgotText: {
    color: '#0074E4',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  statusInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  timeText: {
    color: '#fff',
    fontSize: 14,
  },
  rightStatusIcons: {
    flexDirection: 'row',
    gap: 5,
  },
  statusIconText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 5,
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
    marginTop: -90,
  },
  formContainer: {
    marginTop: 20,
    width: '100%',
  },
  inputLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    color: '#fff',
    paddingVertical: 10,
    marginBottom: 20,
    fontSize: 15,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  termsText: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
  termsLink: {
    color: '#0074E4',
  },
  privacyLink: {
    color: '#0074E4',
  },
  loginButton: {
    backgroundColor: '#0074E4',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
  },
  orText: {
    color: '#fff',
    paddingHorizontal: 10,
    fontSize: 14,
    fontWeight: '500',
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
  errorText: {
    color: '#ff4d4d',
    fontSize: 14,
    marginVertical: 10,
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: '#0074E4AA',
    opacity: 0.7,
  },
});

export default LoginScreen;
