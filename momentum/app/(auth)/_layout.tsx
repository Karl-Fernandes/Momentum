// app/(auth)/_layout.tsx
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack 
      screenOptions={{
        headerShown: false,
        // This completely removes the header from all auth screens
        statusBarHidden: true // Optional: hides the status bar too
      }}
    />
  );
}