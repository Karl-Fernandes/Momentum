import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar,
  Image
} from 'react-native';
import { Checkbox } from 'react-native-paper';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase/config';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

const RegisterScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [checked, setChecked] = useState(false);
  const [termsError, setTermsError] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state
  const [error, setError] = useState<string | null>(null); // For general errors
  const router = useRouter();
  

  const signUp = async () => {
    // Reset previous error
    setTermsError('');
    setError(null);

    if (!email || !password || !username) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    // Check if terms are accepted
    if (!checked) {
      setTermsError('Please accept the terms and conditions to continue');
      return;
    }

    setLoading(true); // Set loading to true
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); // Trigger haptic feedback

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, {displayName: username});

      // 3. Store additional user data in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        username: username,
        email: email,
        createdAt: new Date(),
    });
    
    console.log('User registered successfully:', user.uid);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); // Trigger haptic feedback
    router.push('../(tabs)/'); // Navigate to login screen

  } catch (error: any) {
    let errorMessage = "Registration failed. Please try again.";

    if (error.code === 'auth/email-already-in-use') {
      errorMessage = "Email already in use. Please use a different email.";
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = "Invalid email address format.";
    } else if (error.code === 'auth/weak-password') {
      errorMessage = "Password is too weak. Please use a stronger password.";
    }
    
    setError(errorMessage);
    console.error("Registration error:", error);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); // Trigger haptic feedback
  } finally {
    setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#222222" barStyle="light-content" />
      
      
      {/* Logo */}
      <View style={styles.logoContainer}>
              <Image 
                source={require('@/assets/images/momentum_logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
        </View>
      
      {/* Form Inputs */}
      <View style={styles.formContainer}>
        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="example@gmail.com"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
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
        
        <Text style={styles.inputLabel}>Username</Text>
        <TextInput
          style={styles.input}
          placeholder="username"
          placeholderTextColor="#666"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        
        {/* Terms Checkbox */}
        <View style={styles.termsContainer}>
          <Checkbox
            status={checked ? 'checked' : 'unchecked'}
            onPress={() => {
              setChecked(!checked);
              if (termsError) setTermsError(''); // Clear error when they check the box
            }}
            color="#0074E4"
            uncheckedColor="#888"
          />
          <Text style={styles.termsText}>
            I accept the 
            <Text style={styles.termsLink}> terms & conditions </Text>
            and the
            <Text style={styles.privacyLink}> privacy policy</Text>
          </Text>
        </View>
        
        {/* Error message */}
        {termsError ? <Text style={styles.errorText}>{termsError}</Text> : null}
        
        {/* Continue Button */}
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={signUp}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
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
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 5,
  },
  continueButton: {
    backgroundColor: '#0074E4',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RegisterScreen;