import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Image,
  FlatList,
  Animated,
} from 'react-native';
import TrackPlayer, {
  Capability,
  Event,
  RepeatMode,
  State,
  usePlaybackState,
  useProgress,
  useTrackPlayerEvents,
} from 'react-native-track-player';
import React, {useEffect, useState, useRef} from 'react';
import IonIcons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Slider from '@react-native-community/slider';
import audioClipsArray from '../model/data';

const {width, height} = Dimensions.get('window');

const setUpTrackPlayer = async () => {
  try {
    await TrackPlayer.setupPlayer(); // wait until track player is initialized
    await TrackPlayer.add(audioClipsArray); //add audio clips json objects array to the track player

    await TrackPlayer.updateOptions({
      alwaysPauseOnInterruption: true,
      stopWithApp: true, // should be placed above otherwise not working
      jumpInterval: 10,
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.JumpBackward,
        Capability.JumpForward,
        Capability.SeekTo,
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.SeekTo,
      ],
      notificationCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.JumpBackward,
        Capability.JumpForward,
        Capability.SeekTo,
      ],
    });
  } catch (e) {
    console.log(e);
  }
};

const toggleplayBack = async playBackState => {
  const currentTrack = await TrackPlayer.getCurrentTrack(); // to get the current track
  if (currentTrack != null) {
    if (playBackState == State.Paused) {
      await TrackPlayer.play();
    } else {
      await TrackPlayer.pause();
    }
  }
};

const AudioPlayer = () => {
  const playBackState = usePlaybackState(); // to fetch the state of the music player, ans pass it to the toggle play function
  const progress = useProgress(); // hook from track player to track the progress of audio file
  const [audioIndex, setaudioIndex] = useState(0);

  const [trackTitle, setTrackTitle] = useState();
  const [trackArtist, setTrackArtist] = useState();
  const [trackArtwork, setTrackArtwork] = useState();

  const [repeatMode, setRepeatMode] = useState('off');

  //custom references
  const scrollX = useRef(new Animated.Value(0)).current;
  const audioSlider = useRef(null); //flatlist references

  useTrackPlayerEvents([Event.PlaybackTrackChanged], async event => {
    //when the track changed we call an async function triggering an event
    if (event.type === Event.PlaybackTrackChanged && event.nextTrack !== null) {
      // if the type of event.type, trach should be changed and next track shouldn't be null, then move to the next track
      const track = await TrackPlayer.getTrack(event.nextTrack);
      const {title, artwork, artist} = track;
      setTrackTitle(title);
      setTrackArtist(artist);
      setTrackArtwork(artwork);
    }
  });

  const skipTo = async trackId => {
    await TrackPlayer.skip(trackId);
    console.log('the track id is' + trackId);
  };

  const repeatIcon = () => {
    if (repeatMode == 'off') {
      return 'repeat-off'; // icon name
    }
    if (repeatMode == 'track') {
      return 'repeat-once';
    }
    if (repeatMode == 'repeat') {
      return 'repeat';
    }
  };

  const changeRepeatMode = () => {
    if (repeatMode == 'off') {
      TrackPlayer.setRepeatMode(RepeatMode.Track);
      setRepeatMode('track'); // icon name
    }
    if (repeatMode == 'track') {
      TrackPlayer.setRepeatMode(RepeatMode.Queue);
      setRepeatMode('repeat');
    }
    if (repeatMode == 'repeat') {
      TrackPlayer.setRepeatMode(RepeatMode.Off);
      setRepeatMode('off');
    }
  };

  useEffect(() => {
    setUpTrackPlayer();
    scrollX.addListener(({value}) => {
      console.log(value);
      const index = Math.round(value / width);
      skipTo(index);
      setaudioIndex(index);
      console.log(index);
    });

    return () => {
      scrollX.removeAllListeners();
      TrackPlayer.destroy();
    };
  }, []);

  // to skip back and forth (button control)
  const skipToNext = () => {
    audioSlider.current.scrollToOffset({
      offset: (audioIndex + 1) * width,
    });
  };
  const skipToPrevious = () => {
    audioSlider.current.scrollToOffset({
      offset: (audioIndex - 1) * width,
    });
  };

  const renderAudioClips = ({item, index}) => {
    return (
      <Animated.View style={style.mainImageWrapper}>
        <View style={[style.imageWrapper, style.elevation]}>
          <Image source={{uri: trackArtwork}} style={style.audioImage} />
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={style.container}>
      <View style={style.mainContainer}>
        {/* image */}
        <Animated.FlatList
          ref={audioSlider}
          renderItem={renderAudioClips}
          data={audioClipsArray}
          keyExtractor={item => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [
              {
                nativeEvent: {
                  contentOffset: {x: scrollX},
                },
              },
            ],
            {useNativeDriver: true},
          )}
        />

        {/* Song metadata */}
        <View>
          <Text style={[style.songMetadata, style.songTitle]}>
            {trackTitle}
          </Text>
          <Text style={[style.songMetadata, style.songAuthor]}>
            By {trackArtist}
          </Text>
        </View>

        {/* slider */}
        <View>
          <Slider
            style={style.progressBar}
            value={progress.position}
            minimumValue={0}
            maximumValue={progress.duration}
            thumbTintColor="000"
            minimumTrackTintColor="#FFF"
            maximumTrackTintColor="#000"
            onSlidingComplete={async value => {
              await TrackPlayer.seekTo(value);
            }}
          />

          {/* audio durations */}
          <View style={style.progresBarTime}>
            <Text style={style.progressBarTimeText}>
              {new Date(progress.position * 1000)
                .toLocaleTimeString()
                .substring(4)}
            </Text>
            <Text style={style.progressBarTimeText}>
              {new Date((progress.duration - progress.position) * 1000)
                .toLocaleTimeString()
                .substring(4)}
            </Text>
          </View>
        </View>

        {/* audio controls */}
        <View style={style.audioControlContainer}>
          <TouchableOpacity onPress={skipToPrevious}>
            <IonIcons name="play-skip-back-outline" size={35} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => toggleplayBack(playBackState)}>
            <IonIcons
              name={
                playBackState === State.Playing
                  ? 'ios-pause-circle'
                  : 'ios-play-circle'
              }
              size={65}
              color="#333"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={skipToNext}>
            <IonIcons name="play-skip-forward-outline" size={35} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={style.bottonContainer}>
        <View style={style.bottomIconWrapper}>
          <TouchableOpacity onPress={() => {}}>
            <IonIcons name="heart-outline" size={30} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity onPress={changeRepeatMode}>
            <MaterialCommunityIcons
              name={`${repeatIcon()}`}
              size={30}
              color="#000"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {}}>
            <IonIcons name="share-outline" size={30} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {}}>
            <IonIcons name="ellipsis-horizontal" size={30} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AudioPlayer;

const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#888',
  },
  mainContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottonContainer: {
    width: width,
    alignItems: 'center',
    paddingVertical: 15,
    borderTopColor: '#555',
    borderWidth: 1,
  },
  bottomIconWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },

  mainImageWrapper: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    width: 300,
    height: 340,
    marginBottom: 25,
    marginTop: 15,
  },
  audioImage: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },

  elevation: {
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowOpacity: 0.5,
    shadowRadius: 3.8,
  },
  songMetadata: {
    textAlign: 'center',
    color: '#000',
    fontStyle: 'italic',
  },
  songTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  songAuthor: {
    fontSize: 16,
    fontWeight: '300',
  },

  progressBar: {
    width: 300,
    height: 50,
    marginTop: 15,
    flexDirection: 'row',
  },
  progresBarTime: {
    width: 270,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressBarTimeText: {
    color: '#fff',
    fontWeight: '500',
  },

  audioControlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '60%',
    marginTop: 10,
  },
});
