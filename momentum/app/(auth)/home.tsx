import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, StatusBar, SafeAreaView } from 'react-native';
import GoogleLogo from '@/assets/images/google_logo.svg';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';


const MomentumApp: React.FC = () => {
  const router = useRouter();

  const handleGoogleSignUp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    console.log('Google sign up');
  };

  const handleEmailSignUp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(auth)/register');
  };

  const handleLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log('Login');
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
        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignUp}>
          <View style={styles.googleIconContainer}>
            <GoogleLogo width={18} height={18} />
          </View>
          <Text style={styles.googleButtonText}>Sign up with Google</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.emailButton} onPress={handleEmailSignUp}>
          <Text style={styles.emailButtonText}>Sign up with email</Text>
        </TouchableOpacity>
        
        <View style={styles.loginTextContainer}>
          <Text style={styles.loginText}>Already have account? </Text>
          <TouchableOpacity onPress={handleLogin}>
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
    borderRadius: 25,
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
    borderRadius: 25,
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