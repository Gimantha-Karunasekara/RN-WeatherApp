import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import AppNavigation from './src/navigation/appNavigation';
import { Provider } from 'react-redux';

import store from './store/store';

export default function App() {

  return (
    <Provider store={store}>
      <AppNavigation/>
    </Provider>
  );
}
