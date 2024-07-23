import { Stack } from 'expo-router';
import 'react-native-reanimated';




export default function RootLayout() {


  return (
    <Stack
      screenOptions={{
        
      }}
      >
      <Stack.Screen name="(stack)"  options={{headerShown:false}} />
    </Stack>
  );
}
