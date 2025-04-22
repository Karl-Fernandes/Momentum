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

const RegisterScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [checked, setChecked] = useState(false);

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
            onPress={() => setChecked(!checked)}
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
        
        {/* Continue Button */}
        <TouchableOpacity style={styles.continueButton}>
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