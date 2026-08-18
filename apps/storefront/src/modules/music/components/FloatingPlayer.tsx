import {
  $currentTime,
  $currentTrack,
  $duration,
  $isMuted,
  $isPlaying,
  $isWidgetExpanded,
  $isWidgetMinimized,
  $playbackMode,
  $volume,
  cyclePlaybackMode,
  nextTrack,
  prevTrack,
  seekTo,
  setVolume,
  toggleExpandWidget,
  toggleMinimizeWidget,
  toggleMute,
  togglePlay,
} from '@lib/stores/playerStore';
import { useStore } from '@nanostores/react';
import React, { useState } from 'react';

interface FloatingPlayerProps {
  countryCode?: string;
}

export const FloatingPlayer: React.FC<FloatingPlayerProps> = ({ countryCode = 'us' }) => {
  const currentTrack = useStore($currentTrack);
  const isPlaying = useStore($isPlaying);
  const isWidgetExpanded = useStore($isWidgetExpanded);
  const isWidgetMinimized = useStore($isWidgetMinimized);
  const volume = useStore($volume);
  const isMuted = useStore($isMuted);
  const currentTime = useStore($currentTime);
  const duration = useStore($duration);
  const playbackMode = useStore($playbackMode);

  const [isHovered, setIsHovered] = useState(false);

  if (!currentTrack) return null;

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // 1. Minimized State (Compact Floating Orb)
  if (isWidgetMinimized) {
    return (
      <div className="fixed bottom-6 left-6 z-50 transition-all duration-300">
        <button
          onClick={toggleMinimizeWidget}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          aria-label={`Open Sacred Music Player - ${currentTrack.title}`}
          className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-[var(--color-bg-surface-elevated)] border-2 border-[var(--color-accent-gold)] shadow-[0_8px_32px_rgba(0,0,0,0.5)] glass-panel hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden"
        >
          {/* Cover art background blur */}
          <img
            src={currentTrack.cover}
            alt={currentTrack.title}
            className={`absolute inset-0 w-full h-full object-cover opacity-40 transition-transform duration-700 ${isPlaying ? 'animate-spin-slow scale-110' : ''}`}
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

          {/* Equalizer bars animation when playing */}
          {isPlaying ? (
            <div className="relative z-10 flex items-end gap-1 h-5">
              <span className="w-1 bg-[var(--color-accent-gold)] rounded-full animate-bounce h-full" style={{ animationDelay: '0ms' }} />
              <span className="w-1 bg-[var(--color-accent-gold)] rounded-full animate-bounce h-3/4" style={{ animationDelay: '150ms' }} />
              <span className="w-1 bg-[var(--color-accent-gold)] rounded-full animate-bounce h-full" style={{ animationDelay: '300ms' }} />
            </div>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="relative z-10 w-6 h-6 text-[var(--color-accent-gold)] ml-0.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
            </svg>
          )}

          {/* Tooltip on hover */}
          {isHovered && (
            <div className="absolute left-16 bottom-2 px-3 py-1.5 rounded-lg bg-[var(--color-bg-surface)] text-xs font-semibold text-[var(--color-text-primary)] border border-[var(--color-border-subtle)] whitespace-nowrap shadow-xl">
              {currentTrack.title}
            </div>
          )}
        </button>
      </div>
    );
  }

  // 2. Expanded Glass Drawer Card State
  if (isWidgetExpanded) {
    return (
      <div className="fixed bottom-6 left-6 z-50 transition-all duration-300 max-w-[calc(100vw-32px)]">
        <div className="glass-panel w-full sm:w-[380px] rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-[var(--color-border-accent)] bg-[var(--color-bg-surface)]/95 backdrop-blur-2xl flex flex-col gap-4 text-[var(--color-text-primary)] relative overflow-hidden">
          
          {/* Header Controls */}
          <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--color-accent-gold)] animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-accent-gold)]">
                Sacred Soundscapes
              </span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`/${countryCode}/music`}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[var(--color-bg-surface-elevated)] hover:bg-[var(--color-accent-gold)] hover:text-black transition-colors text-[var(--color-text-secondary)]"
                title="Open Playlist Page"
              >
                Full Playlist ↗
              </a>
              <button
                onClick={toggleExpandWidget}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] p-1 rounded-full hover:bg-[var(--color-bg-surface-elevated)] transition-colors cursor-pointer"
                aria-label="Collapse Player"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
            </div>
          </div>

          {/* Track Display with Album Cover */}
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-lg border border-[var(--color-border-accent)]">
              <img
                src={currentTrack.cover}
                alt={currentTrack.title}
                className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? 'scale-105' : 'scale-100'}`}
              />
              {isPlaying && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="flex items-end gap-1 h-5">
                    <span className="w-1 bg-[var(--color-accent-gold)] rounded-full animate-bounce h-full" style={{ animationDelay: '0ms' }} />
                    <span className="w-1 bg-[var(--color-accent-gold)] rounded-full animate-bounce h-2/3" style={{ animationDelay: '200ms' }} />
                    <span className="w-1 bg-[var(--color-accent-gold)] rounded-full animate-bounce h-full" style={{ animationDelay: '400ms' }} />
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[var(--color-accent-emerald)]/20 text-[var(--color-accent-emerald)] border border-[var(--color-accent-emerald)]/30">
                  {currentTrack.categoryLabel}
                </span>
                {currentTrack.frequency && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[var(--color-accent-gold)]/20 text-[var(--color-accent-gold)] border border-[var(--color-accent-gold)]/30">
                    {currentTrack.frequency}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-[var(--color-text-primary)] truncate" title={currentTrack.title}>
                {currentTrack.title}
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] truncate">
                {currentTrack.artist}
              </p>
            </div>
          </div>

          {/* Progress Bar & Seek */}
          <div className="flex flex-col gap-1.5">
            <div className="relative w-full h-2 rounded-full bg-[var(--color-bg-surface-elevated)] overflow-hidden cursor-pointer group">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={(e) => seekTo(parseFloat(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                aria-label="Seek time slider"
              />
              <div
                className="h-full bg-gradient-to-r from-[var(--color-accent-emerald)] to-[var(--color-accent-gold)] rounded-full transition-all duration-150"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)] font-medium">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={cyclePlaybackMode}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                playbackMode !== 'normal'
                  ? 'text-[var(--color-accent-gold)] bg-[var(--color-accent-gold)]/10'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
              title={`Playback mode: ${playbackMode}`}
              aria-label={`Playback mode: ${playbackMode}`}
            >
              {playbackMode === 'shuffle' ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              )}
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={prevTrack}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] p-2 rounded-full hover:bg-[var(--color-bg-surface-elevated)] transition-colors cursor-pointer"
                aria-label="Previous Track"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>

              <button
                onClick={togglePlay}
                className="w-12 h-12 rounded-full bg-[var(--color-accent-gold)] text-black hover:bg-[var(--color-accent-gold-hover)] flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
                    <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75.75v12a.75.75 0 0 1-1.5 0v-12a.75.75 0 0 1 .75-.75Zm10.5 0a.75.75 0 0 1 .75.75v12a.75.75 0 0 1-1.5 0v-12a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6 ml-0.5">
                    <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                  </svg>
                )}
              </button>

              <button
                onClick={nextTrack}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] p-2 rounded-full hover:bg-[var(--color-bg-surface-elevated)] transition-colors cursor-pointer"
                aria-label="Next Track"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>

            {/* Volume toggle */}
            <div className="flex items-center gap-1 group relative">
              <button
                onClick={toggleMute}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] p-2 rounded-full hover:bg-[var(--color-bg-surface-elevated)] transition-colors cursor-pointer"
                aria-label="Mute / Unmute"
              >
                {isMuted || volume === 0 ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-red-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.5a.75.75 0 01-.75-.75V9.75a.75.75 0 01.75-.75h2.25z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.5a.75.75 0 01-.75-.75V9.75a.75.75 0 01.75-.75h2.25z" />
                  </svg>
                )}
              </button>

              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-16 h-1 bg-[var(--color-bg-surface-elevated)] accent-[var(--color-accent-gold)] rounded-lg cursor-pointer"
                aria-label="Volume slider"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Compact Floating Pill State (Default Collapsed View)
  return (
    <div className="fixed bottom-6 left-6 z-50 transition-all duration-300">
      <div className="glass-panel flex items-center gap-3 p-2.5 pr-4 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.5)] border border-[var(--color-border-accent)] bg-[var(--color-bg-surface)]/90 backdrop-blur-xl text-[var(--color-text-primary)] hover:border-[var(--color-accent-gold)]/60 transition-all">
        
        {/* Thumbnail + Equalizer */}
        <button
          onClick={toggleExpandWidget}
          className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 group border border-[var(--color-border-subtle)] cursor-pointer"
          aria-label="Expand player"
        >
          <img
            src={currentTrack.cover}
            alt={currentTrack.title}
            className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? 'scale-110' : ''}`}
          />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            {isPlaying ? (
              <div className="flex items-end gap-0.5 h-4">
                <span className="w-0.5 bg-[var(--color-accent-gold)] rounded-full animate-bounce h-full" style={{ animationDelay: '0ms' }} />
                <span className="w-0.5 bg-[var(--color-accent-gold)] rounded-full animate-bounce h-2/3" style={{ animationDelay: '150ms' }} />
                <span className="w-0.5 bg-[var(--color-accent-gold)] rounded-full animate-bounce h-full" style={{ animationDelay: '300ms' }} />
              </div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4 text-white ml-0.5">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </button>

        {/* Track Title Info */}
        <div
          onClick={toggleExpandWidget}
          className="flex flex-col min-w-0 max-w-[140px] sm:max-w-[180px] cursor-pointer"
        >
          <span className="text-xs font-bold text-[var(--color-text-primary)] truncate hover:text-[var(--color-accent-gold)] transition-colors">
            {currentTrack.title}
          </span>
          <span className="text-[11px] text-[var(--color-text-muted)] truncate">
            {currentTrack.artist}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 ml-1 border-l border-[var(--color-border-subtle)] pl-2">
          <button
            onClick={togglePlay}
            className="w-9 h-9 rounded-full bg-[var(--color-accent-gold)] text-black hover:bg-[var(--color-accent-gold-hover)] flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
                <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75.75v12a.75.75 0 0 1-1.5 0v-12a.75.75 0 0 1 .75-.75Zm10.5 0a.75.75 0 0 1 .75.75v12a.75.75 0 0 1-1.5 0v-12a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4 ml-0.5">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          <button
            onClick={nextTrack}
            className="p-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] rounded-full hover:bg-[var(--color-bg-surface-elevated)] transition-colors cursor-pointer"
            aria-label="Next track"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>

          <button
            onClick={toggleMinimizeWidget}
            className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] rounded-full hover:bg-[var(--color-bg-surface-elevated)] transition-colors cursor-pointer"
            title="Minimize to Orb"
            aria-label="Minimize player"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
