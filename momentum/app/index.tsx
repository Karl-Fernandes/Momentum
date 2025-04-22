// app/index.tsx

import { Redirect } from 'expo-router';

export default function Index() {
  // This will be redirected based on auth state in _layout.tsx
  return <Redirect href="/(auth)/home" />;
}