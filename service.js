import TrackPlayer from 'react-native-track-player';

module.exports = async function () {
  TrackPlayer.addEventListener('remote-play', () => TrackPlayer.play());

  TrackPlayer.addEventListener('remote-pause', () => TrackPlayer.pause());

  TrackPlayer.addEventListener('remote-next', () => TrackPlayer.skipToNext());

  TrackPlayer.addEventListener('remote-previous', () =>
    TrackPlayer.skipToPrevious(),
  );

  TrackPlayer.addEventListener('remote-stop', () => TrackPlayer.destroy());

  TrackPlayer.addEventListener('playback-state', async data => {
    console.log('service file playback-state: ', data.state);
  });

  await TrackPlayer.addEventListener('remote-jump-forward', async event => {
    let position = await TrackPlayer.getPosition();
    let newPosition = position + event.interval;
    await TrackPlayer.seekTo(newPosition);
  });

  await TrackPlayer.addEventListener('remote-jump-backward', async event => {
    let position = await TrackPlayer.getPosition();
    let newPosition = position > 9 ? position - event.interval : 0;
    await TrackPlayer.seekTo(newPosition);
  });

  TrackPlayer.addEventListener('playback-queue-ended', infos => {
    TrackPlayer.reset();
  });

  TrackPlayer.addEventListener('remote-seek', ({position}) => {
    TrackPlayer.seekTo(position);
  });

  // ...
};
