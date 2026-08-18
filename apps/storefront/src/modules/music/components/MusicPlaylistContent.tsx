import { CATEGORIES, type Track } from '@lib/music/tracks';
import {
  $currentTime,
  $currentTrack,
  $duration,
  $filteredTracks,
  $isPlaying,
  $searchQuery,
  $selectedCategory,
  nextTrack,
  playTrack,
  setSearchQuery,
  setSelectedCategory,
  togglePlay,
} from '@lib/stores/playerStore';
import { useStore } from '@nanostores/react';
import React, { useState } from 'react';

interface MusicPlaylistContentProps {
  countryCode: string;
}

export const MusicPlaylistContent: React.FC<MusicPlaylistContentProps> = ({ countryCode }) => {
  const currentTrack = useStore($currentTrack);
  const isPlaying = useStore($isPlaying);
  const currentTime = useStore($currentTime);
  const duration = useStore($duration);
  const selectedCategory = useStore($selectedCategory);
  const searchQuery = useStore($searchQuery);
  const filteredTracks = useStore($filteredTracks);

  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handlePlayAll = () => {
    if (filteredTracks.length > 0) {
      playTrack(filteredTracks[0]);
    }
  };

  return (
    <div className="min-h-screen pb-32 pt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col gap-10">
      
      {/* 1. Hero Section */}
      <div className="relative rounded-3xl overflow-hidden glass-panel p-8 sm:p-12 border border-[var(--color-border-accent)] shadow-2xl bg-gradient-to-br from-[var(--color-accent-forest)]/40 via-[var(--color-bg-surface)] to-[var(--color-bg-primary)]">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-accent-gold)]/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--color-accent-emerald)]/20 blur-[120px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex flex-col gap-4 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--color-accent-gold)]/20 text-[var(--color-accent-gold)] border border-[var(--color-accent-gold)]/40">
                Ayni Sound Sanctuary
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">• High Vibration Frequencies</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[var(--color-text-primary)] leading-tight">
              Sacred Amazonian <span className="text-[var(--color-accent-gold)]">Soundscapes</span>
            </h1>

            <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed">
              Immerse yourself in authentic shamanic Icaros, 432Hz binaural tones, and jungle acoustics. Specially curated to elevate your sacred Rapé (Hapeh) ceremony, meditation, and spiritual grounding.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={handlePlayAll}
                className="h-12 px-6 rounded-full bg-[var(--color-accent-gold)] hover:bg-[var(--color-accent-gold-hover)] text-black font-bold text-sm transition-all duration-300 shadow-lg flex items-center gap-2.5 hover:scale-105 cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                  <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                </svg>
                <span>Play Soundscape</span>
              </button>

              <a
                href={`/${countryCode}/store`}
                className="h-12 px-6 rounded-full bg-[var(--color-bg-surface-elevated)] hover:bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] font-bold text-sm border border-[var(--color-border-subtle)] transition-all duration-300 flex items-center gap-2"
              >
                <span>Explore Rapé Blends 🌿</span>
              </a>
            </div>
          </div>

          {/* Currently Playing Card Widget on Hero */}
          {currentTrack && (
            <div className="glass-panel rounded-2xl p-5 border border-[var(--color-border-accent)] bg-[var(--color-bg-surface)]/90 shadow-xl w-full lg:w-80 flex flex-col gap-4">
              <div className="flex items-center justify-between text-xs font-semibold text-[var(--color-accent-gold)]">
                <span>NOW PLAYING</span>
                <span className="animate-pulse">● LIVE</span>
              </div>

              <div className="flex items-center gap-4">
                <img
                  src={currentTrack.cover}
                  alt={currentTrack.title}
                  className="w-16 h-16 rounded-xl object-cover border border-[var(--color-border-subtle)] shadow-md"
                />
                <div className="flex flex-col min-w-0">
                  <h4 className="text-sm font-bold text-[var(--color-text-primary)] truncate">{currentTrack.title}</h4>
                  <p className="text-xs text-[var(--color-text-muted)] truncate">{currentTrack.artist}</p>
                  <span className="text-[10px] text-[var(--color-accent-emerald)] font-bold mt-1">{currentTrack.frequency}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border-subtle)]">
                <span className="text-xs text-[var(--color-text-muted)] font-medium">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>

                <button
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-full bg-[var(--color-accent-gold)] text-black flex items-center justify-center font-bold shadow-md hover:scale-105 transition-transform cursor-pointer"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                      <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75.75v12a.75.75 0 0 1-1.5 0v-12a.75.75 0 0 1 .75-.75Zm10.5 0a.75.75 0 0 1 .75.75v12a.75.75 0 0 1-1.5 0v-12a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5 ml-0.5">
                      <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--color-border-subtle)] pb-6">
        
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer flex items-center gap-2 border ${
                  active
                    ? 'bg-[var(--color-accent-gold)] text-black border-[var(--color-accent-gold)] shadow-md'
                    : 'bg-[var(--color-bg-surface-elevated)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-accent)]'
                }`}
              >
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Input & View Toggle */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="Search track, frequency..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-full bg-[var(--color-bg-surface-elevated)] border border-[var(--color-border-subtle)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-gold)] transition-colors"
            />
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3 top-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>

          <div className="flex items-center rounded-full bg-[var(--color-bg-surface-elevated)] p-1 border border-[var(--color-border-subtle)]">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-full transition-colors ${viewMode === 'list' ? 'bg-[var(--color-accent-gold)] text-black' : 'text-[var(--color-text-muted)]'}`}
              title="List View"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm0 5.25h.007v.008H3.75V12Zm0 5.25h.007v.008H3.75v-.008Z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-full transition-colors ${viewMode === 'grid' ? 'bg-[var(--color-accent-gold)] text-black' : 'text-[var(--color-text-muted)]'}`}
              title="Grid View"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 8.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Track List Content */}
      {filteredTracks.length === 0 ? (
        <div className="py-16 text-center text-[var(--color-text-muted)] flex flex-col items-center gap-3">
          <p className="text-base font-semibold">No soundscapes match your search criteria.</p>
          <button
            onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
            className="text-xs text-[var(--color-accent-gold)] underline cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'list' ? (
        /* List View */
        <div className="flex flex-col gap-2">
          {filteredTracks.map((track, idx) => {
            const isCurrent = currentTrack?.id === track.id;
            const isCurrentPlaying = isCurrent && isPlaying;

            return (
              <div
                key={track.id}
                onClick={() => playTrack(track)}
                className={`group flex items-center justify-between p-3 sm:p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  isCurrent
                    ? 'bg-[var(--color-bg-surface-elevated)] border-[var(--color-accent-gold)] shadow-md'
                    : 'bg-[var(--color-bg-surface)]/60 border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-surface-elevated)] hover:border-[var(--color-border-accent)]'
                }`}
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  {/* Track Index / Play Indicator */}
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-[var(--color-text-muted)] group-hover:text-[var(--color-accent-gold)]">
                    {isCurrentPlaying ? (
                      <div className="flex items-end gap-0.5 h-4">
                        <span className="w-1 bg-[var(--color-accent-gold)] rounded-full animate-bounce h-full" style={{ animationDelay: '0ms' }} />
                        <span className="w-1 bg-[var(--color-accent-gold)] rounded-full animate-bounce h-2/3" style={{ animationDelay: '150ms' }} />
                        <span className="w-1 bg-[var(--color-accent-gold)] rounded-full animate-bounce h-full" style={{ animationDelay: '300ms' }} />
                      </div>
                    ) : (
                      <span>{String(idx + 1).padStart(2, '0')}</span>
                    )}
                  </div>

                  {/* Thumbnail Cover */}
                  <img
                    src={track.cover}
                    alt={track.title}
                    className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[var(--color-border-subtle)]"
                  />

                  {/* Title & Artist */}
                  <div className="flex flex-col min-w-0">
                    <h3 className={`text-sm font-bold truncate ${isCurrent ? 'text-[var(--color-accent-gold)]' : 'text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-gold)]'}`}>
                      {track.title}
                    </h3>
                    <p className="text-xs text-[var(--color-text-muted)] truncate">{track.artist}</p>
                  </div>
                </div>

                {/* Badges & Duration */}
                <div className="flex items-center gap-4 shrink-0">
                  {track.frequency && (
                    <span className="hidden md:inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-[var(--color-accent-gold)]/10 text-[var(--color-accent-gold)] border border-[var(--color-accent-gold)]/20">
                      {track.frequency}
                    </span>
                  )}
                  <span className="hidden sm:inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-[var(--color-bg-surface-elevated)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)]">
                    {track.categoryLabel}
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)] font-medium">{track.durationFormatted}</span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isCurrentPlaying) {
                        togglePlay();
                      } else {
                        playTrack(track);
                      }
                    }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-105 cursor-pointer ${
                      isCurrentPlaying
                        ? 'bg-[var(--color-accent-gold)] text-black'
                        : 'bg-[var(--color-bg-surface-elevated)] text-[var(--color-text-primary)] group-hover:bg-[var(--color-accent-gold)] group-hover:text-black'
                    }`}
                    aria-label={isCurrentPlaying ? 'Pause track' : 'Play track'}
                  >
                    {isCurrentPlaying ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
                        <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75.75v12a.75.75 0 0 1-1.5 0v-12a.75.75 0 0 1 .75-.75Zm10.5 0a.75.75 0 0 1 .75.75v12a.75.75 0 0 1-1.5 0v-12a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4 ml-0.5">
                        <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTracks.map((track) => {
            const isCurrent = currentTrack?.id === track.id;
            const isCurrentPlaying = isCurrent && isPlaying;

            return (
              <div
                key={track.id}
                onClick={() => playTrack(track)}
                className={`group rounded-3xl p-5 glass-panel border transition-all duration-300 flex flex-col gap-4 cursor-pointer hover:-translate-y-1 ${
                  isCurrent
                    ? 'border-[var(--color-accent-gold)] shadow-xl bg-[var(--color-bg-surface-elevated)]'
                    : 'border-[var(--color-border-subtle)] hover:border-[var(--color-border-accent)]'
                }`}
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden border border-[var(--color-border-subtle)]">
                  <img
                    src={track.cover}
                    alt={track.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playTrack(track);
                      }}
                      className="w-12 h-12 rounded-full bg-[var(--color-accent-gold)] text-black flex items-center justify-center font-bold shadow-lg hover:scale-110 transition-transform cursor-pointer ml-auto"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6 ml-0.5">
                        <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[var(--color-accent-emerald)] uppercase">
                      {track.categoryLabel}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)] font-medium">{track.durationFormatted}</span>
                  </div>

                  <h3 className="text-base font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-gold)] transition-colors line-clamp-1">
                    {track.title}
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2">{track.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Educational Rapé Sound Ceremony Guide */}
      <div className="mt-8 rounded-3xl glass-panel p-8 border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface-elevated)]/50 flex flex-col gap-6">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-[var(--color-text-primary)] flex items-center gap-2">
          <span>🌿 The Sacred Synergy of Rapé & Sound Frequencies</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-bold text-[var(--color-accent-gold)]">1. Grounding & Focus</h3>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              432Hz harmonic tuning aligns with the natural resonance of earth and water, calming mental chatter so you can receive the sacred tobacco spirit with clarity.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-bold text-[var(--color-accent-gold)]">2. Sacred Icaros</h3>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              In Amazonian traditions, Icaros are medicine songs gifted by plant spirits. They guide the energy flow and purge stagnancy during intense Rapé ceremonies.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-bold text-[var(--color-accent-gold)]">3. Solfeggio 528Hz</h3>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Known as the transformation frequency, 528Hz promotes deep cellular relaxation and heart opening following your Rapé administration.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
