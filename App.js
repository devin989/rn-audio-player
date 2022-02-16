import {View, StatusBar, StyleSheet} from 'react-native';
import React from 'react';
import AudioPlayer from './screens/AudioPlayer';

const App = () => {
  return (
    <View style={style.container}>
      <StatusBar barStyle="light-content" />
      <AudioPlayer />
    </View>
  );
};

export default App;

const style = StyleSheet.create({
  container: {
    flex: 1,
  },
});
