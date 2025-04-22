import React, { useState, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, TextInput, Button, Alert, ImageBackground, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { auth } from '@/firebase/config';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, User } from 'firebase/auth';

// Background image (replace with your actual image path)

// Login Screen
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);


  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLogin();
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert('Forgot Password', 'This feature is not implemented yet.');
  };

  const handleGoogleLogin = () => {
    Alert.alert('Google Login', 'This feature is not implemented yet.');
  };

  const handleFacebookLogin = () => {
    Alert.alert('Facebook Login', 'This feature is not implemented yet.');
  };

  return (
      <View style={styles.container}>
        <Text style={styles.title}>Login</Text>

        <Text style={styles.label}>Email or username</Text>
        <TextInput
          style={styles.input}
          placeholder="example@gmail.com"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="minimum 6 characters"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
        />

        <TouchableOpacity onPress={handleForgotPassword}>
          <Text style={styles.forgotPassword}>Forget Password?</Text>
        </TouchableOpacity>

        {loading ? ( <ActivityIndicator size="large" color="#0000ff" /> ) 
        : <>
        <Button title="login" onPress={handleLogin} color="#555" />
        </>}

        <Text style={styles.orText}>or</Text>

        <TouchableOpacity style={styles.socialButton} onPress={handleGoogleLogin}>
          <Text style={styles.socialButtonText}>Sign in with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton} onPress={handleFacebookLogin}>
          <Text style={styles.socialButtonText}>Login with Facebook</Text>
        </TouchableOpacity>

        <Button title="Go to Register" onPress={onLogin} color="#888" />
      </View>
  );
}

// Register Screen (keeping the same for now, you can style it similarly if needed)
function RegisterScreen({ onRegister }: { onRegister: () => void }) {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      onRegister();
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message);
    }
  };

  return (
      <View style={styles.container}>
        <Text style={styles.title}>Register</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="example@gmail.com"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="minimum 6 characters"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.loginButton} onPress={handleRegister}>
          <Text style={styles.loginButtonText}>Register</Text>
        </TouchableOpacity>

        <Button title="Go to Login" onPress={onRegister} color="#888" />
      </View>
  );
}

// Root Layout
export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState<boolean>(true);
  const [showLogin, setShowLogin] = useState<boolean>(true);

  useEffect(() => {
    const subscriber = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });
    return subscriber;
  }, []);

  if (initializing) return null;

  if (!user) {
    return showLogin ? (
      <LoginScreen onLogin={() => setShowLogin(false)} />
    ) : (
      <RegisterScreen onRegister={() => setShowLogin(true)} />
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent overlay for readability
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    height: 40,
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  forgotPassword: {
    color: '#00f',
    textAlign: 'right',
    marginBottom: 15,
  },
  loginButton: {
    backgroundColor: '#555',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orText: {
    color: '#888',
    textAlign: 'center',
    marginVertical: 10,
  },
  socialButton: {
    backgroundColor: '#444',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  socialButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});