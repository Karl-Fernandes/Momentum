import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';

export default function AuthLayout() {
  return (
    <>
      {/* Set the StatusBar globally for all screens in this stack */}
      <StatusBar backgroundColor="#222222" barStyle="light-content" />
      <Stack>
        <Stack.Screen name="home" options={{ headerShown: false, statusBarHidden: true }} />
        <Stack.Screen 
          name="register" 
          options={{ 
            headerTitleAlign: 'center',
            title: 'Sign Up',
            headerStyle: {
              backgroundColor: '#222222', // Ensure header is grey
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'thin',
              fontSize: 18,
            },
          }} 
        />
        <Stack.Screen 
          name="login" 
          options={{ 
            headerTitleAlign: 'center',
            title: 'Sign In',
            headerStyle: {
              backgroundColor: '#222222', // Ensure header is grey
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'thin',
              fontSize: 18,
            },
          }}
        />
      </Stack>
    </>
  );
}