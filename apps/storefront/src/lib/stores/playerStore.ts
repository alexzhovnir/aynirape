import { atom, computed } from 'nanostores';
import { TRACKS, type Track } from '../music/tracks';

// State atoms
export const $currentTrack = atom<Track | null>(TRACKS[0]);
export const $isPlaying = atom<boolean>(false);
export const $volume = atom<number>(0.8);
export const $isMuted = atom<boolean>(false);
export const $currentTime = atom<number>(0);
export const $duration = atom<number>(TRACKS[0].duration);
export const $queue = atom<Track[]>(TRACKS);
export const $playbackMode = atom<'normal' | 'loop' | 'shuffle'>('normal');
export const $isWidgetExpanded = atom<boolean>(false);
export const $isWidgetMinimized = atom<boolean>(false);
export const $selectedCategory = atom<string>('all');
export const $searchQuery = atom<string>('');

// Computed filtered tracks for playlist page
export const $filteredTracks = computed(
  [$queue, $selectedCategory, $searchQuery],
  (queue, category, query) => {
    return queue.filter((track) => {
      const matchesCat = category === 'all' || track.category === category;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        track.title.toLowerCase().includes(q) ||
        track.artist.toLowerCase().includes(q) ||
        track.description.toLowerCase().includes(q) ||
        (track.frequency && track.frequency.toLowerCase().includes(q));
      return matchesCat && matchesQuery;
    });
  }
);

// Helper actions
export function playTrack(track: Track) {
  const current = $currentTrack.get();
  if (current?.id === track.id) {
    if (!$isPlaying.get()) {
      $isPlaying.set(true);
    }
  } else {
    $currentTrack.set(track);
    $duration.set(track.duration);
    $currentTime.set(0);
    $isPlaying.set(true);
  }
}

export function pauseTrack() {
  $isPlaying.set(false);
}

export function togglePlay() {
  const playing = $isPlaying.get();
  if (!playing && !$currentTrack.get() && TRACKS.length > 0) {
    $currentTrack.set(TRACKS[0]);
  }
  $isPlaying.set(!playing);
}

export function nextTrack() {
  const queue = $queue.get();
  const current = $currentTrack.get();
  const mode = $playbackMode.get();

  if (queue.length === 0) return;

  if (mode === 'shuffle') {
    const randomIndex = Math.floor(Math.random() * queue.length);
    playTrack(queue[randomIndex]);
    return;
  }

  const currentIndex = queue.findIndex((t) => t.id === current?.id);
  const nextIndex = (currentIndex + 1) % queue.length;
  playTrack(queue[nextIndex]);
}

export function prevTrack() {
  const queue = $queue.get();
  const current = $currentTrack.get();
  const currentTime = $currentTime.get();

  // If played for > 3 seconds, restart current track
  if (currentTime > 3) {
    $currentTime.set(0);
    return;
  }

  if (queue.length === 0) return;

  const currentIndex = queue.findIndex((t) => t.id === current?.id);
  const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
  playTrack(queue[prevIndex]);
}

export function seekTo(seconds: number) {
  $currentTime.set(Math.max(0, Math.min(seconds, $duration.get())));
}

export function setVolume(vol: number) {
  const clamped = Math.max(0, Math.min(1, vol));
  $volume.set(clamped);
  if (clamped > 0 && $isMuted.get()) {
    $isMuted.set(false);
  }
}

export function toggleMute() {
  $isMuted.set(!$isMuted.get());
}

export function cyclePlaybackMode() {
  const current = $playbackMode.get();
  if (current === 'normal') $playbackMode.set('loop');
  else if (current === 'loop') $playbackMode.set('shuffle');
  else $playbackMode.set('normal');
}

export function toggleExpandWidget() {
  $isWidgetExpanded.set(!$isWidgetExpanded.get());
  if ($isWidgetMinimized.get()) {
    $isWidgetMinimized.set(false);
  }
}

export function toggleMinimizeWidget() {
  $isWidgetMinimized.set(!$isWidgetMinimized.get());
  if ($isWidgetExpanded.get()) {
    $isWidgetExpanded.set(false);
  }
}

export function setWidgetExpanded(expanded: boolean) {
  $isWidgetExpanded.set(expanded);
}

export function setWidgetMinimized(minimized: boolean) {
  $isWidgetMinimized.set(minimized);
}

export function setSelectedCategory(cat: string) {
  $selectedCategory.set(cat);
}

export function setSearchQuery(query: string) {
  $searchQuery.set(query);
}
