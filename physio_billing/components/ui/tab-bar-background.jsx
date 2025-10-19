import { View } from 'react-native';

export default function TabBarBackground() {
  // Provides a consistent dark background behind the tab icons.
  // Purpose: visually separate the floating tab bar from the page content.
  return <View style={{ backgroundColor: '#1C1C1E', flex: 1 }} />;
}
