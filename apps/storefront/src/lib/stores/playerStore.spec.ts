import { describe, it, expect, beforeEach } from 'vitest';
import {
  $currentTrack,
  $isPlaying,
  $volume,
  $isMuted,
  $currentTime,
  $playbackMode,
  $isWidgetExpanded,
  $isWidgetMinimized,
  $selectedCategory,
  $searchQuery,
  $filteredTracks,
  playTrack,
  pauseTrack,
  togglePlay,
  nextTrack,
  prevTrack,
  seekTo,
  setVolume,
  toggleMute,
  cyclePlaybackMode,
  toggleExpandWidget,
  toggleMinimizeWidget,
  setSelectedCategory,
  setSearchQuery,
} from './playerStore';
import { TRACKS } from '../music/tracks';

describe('playerStore', () => {
  beforeEach(() => {
    $currentTrack.set(TRACKS[0]);
    $isPlaying.set(false);
    $volume.set(0.8);
    $isMuted.set(false);
    $currentTime.set(0);
    $playbackMode.set('normal');
    $isWidgetExpanded.set(false);
    $isWidgetMinimized.set(false);
    $selectedCategory.set('all');
    $searchQuery.set('');
  });

  it('initializes with default track', () => {
    expect($currentTrack.get()?.id).toBe('track-1');
    expect($isPlaying.get()).toBe(false);
  });

  it('playTrack changes track and sets isPlaying to true', () => {
    playTrack(TRACKS[1]);
    expect($currentTrack.get()?.id).toBe('track-2');
    expect($isPlaying.get()).toBe(true);
  });

  it('pauseTrack sets isPlaying to false', () => {
    $isPlaying.set(true);
    pauseTrack();
    expect($isPlaying.get()).toBe(false);
  });

  it('togglePlay flips isPlaying state', () => {
    expect($isPlaying.get()).toBe(false);
    togglePlay();
    expect($isPlaying.get()).toBe(true);
    togglePlay();
    expect($isPlaying.get()).toBe(false);
  });

  it('nextTrack advances to the next track in normal mode', () => {
    $currentTrack.set(TRACKS[0]);
    nextTrack();
    expect($currentTrack.get()?.id).toBe('track-2');
  });

  it('prevTrack goes to previous track or resets time if >3s', () => {
    $currentTrack.set(TRACKS[1]);
    $currentTime.set(5);
    prevTrack();
    expect($currentTime.get()).toBe(0);
    expect($currentTrack.get()?.id).toBe('track-2');

    // When currentTime is 0, goes to previous track
    prevTrack();
    expect($currentTrack.get()?.id).toBe('track-1');
  });

  it('seekTo updates current time safely within duration bounds', () => {
    seekTo(100);
    expect($currentTime.get()).toBe(100);
  });

  it('setVolume clamps volume between 0 and 1 and unmutes if muted', () => {
    $isMuted.set(true);
    setVolume(0.5);
    expect($volume.get()).toBe(0.5);
    expect($isMuted.get()).toBe(false);
  });

  it('toggleMute toggles mute state', () => {
    toggleMute();
    expect($isMuted.get()).toBe(true);
    toggleMute();
    expect($isMuted.get()).toBe(false);
  });

  it('cyclePlaybackMode loops through normal -> loop -> shuffle -> normal', () => {
    expect($playbackMode.get()).toBe('normal');
    cyclePlaybackMode();
    expect($playbackMode.get()).toBe('loop');
    cyclePlaybackMode();
    expect($playbackMode.get()).toBe('shuffle');
    cyclePlaybackMode();
    expect($playbackMode.get()).toBe('normal');
  });

  it('toggleExpandWidget and toggleMinimizeWidget work correctly', () => {
    toggleExpandWidget();
    expect($isWidgetExpanded.get()).toBe(true);

    toggleMinimizeWidget();
    expect($isWidgetMinimized.get()).toBe(true);
    expect($isWidgetExpanded.get()).toBe(false);
  });

  it('filters tracks by category and search query', () => {
    setSelectedCategory('icaros');
    let filtered = $filteredTracks.get();
    expect(filtered.every((t) => t.category === 'icaros')).toBe(true);

    setSearchQuery('Amazonian');
    filtered = $filteredTracks.get();
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered[0].title.toLowerCase()).toContain('amazonian');
  });
});
