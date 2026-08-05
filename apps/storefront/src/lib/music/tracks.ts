export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  durationFormatted: string;
  cover: string;
  category: 'icaros' | 'binaural' | 'nature' | 'drums' | 'soundbath';
  categoryLabel: string;
  frequency?: string; // e.g. "432 Hz" or "528 Hz"
  description: string;
  audioUrl?: string; // Standard mp3 or synthesized fallback
  synthConfig?: {
    type: 'binaural' | 'shamanic_flute' | 'jungle_rain' | 'sacred_drums' | 'solfeggio_528' | 'icaros_hum';
    baseFreq: number;
    binauralBeat?: number;
  };
}

export const CATEGORIES = [
  { id: 'all', label: 'All Soundscapes', icon: 'sparkles' },
  { id: 'icaros', label: 'Sacred Icaros', icon: 'microphone' },
  { id: 'binaural', label: '432Hz & Binaural', icon: 'waves' },
  { id: 'nature', label: 'Jungle Acoustics', icon: 'cloud-rain' },
  { id: 'drums', label: 'Ceremonial Drums', icon: 'drum' },
  { id: 'soundbath', label: 'Solfeggio Soundbath', icon: 'bell' },
] as const;

export const TRACKS: Track[] = [
  {
    id: 'track-1',
    title: 'Amazonian Dawn (Pachamama Icaros)',
    artist: 'Master Maestro Shaman & Forest Wind',
    album: 'Sacred Ceremonial Journeys',
    duration: 272,
    durationFormatted: '04:32',
    cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    category: 'icaros',
    categoryLabel: 'Sacred Icaros',
    frequency: '432 Hz',
    description: 'Traditional Amazonian chanting harmonized with authentic jungle wind and shamanic bamboo flute.',
    synthConfig: {
      type: 'shamanic_flute',
      baseFreq: 432,
      binauralBeat: 4.5, // Theta wave for deep trance state
    },
  },
  {
    id: 'track-2',
    title: 'Jungle Rapé Solitude (Deep Focus)',
    artist: 'Ayni Sound Sanctuary',
    album: 'Harmonic Spirit Transmissions',
    duration: 320,
    durationFormatted: '05:20',
    cover: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80',
    category: 'binaural',
    categoryLabel: '432Hz & Binaural',
    frequency: '432 Hz',
    description: 'Deep grounding theta binaural beat (432Hz) with subtle forest rain and maraca rattle.',
    synthConfig: {
      type: 'binaural',
      baseFreq: 432,
      binauralBeat: 6.0,
    },
  },
  {
    id: 'track-3',
    title: 'Heart of Yawanawa (Ritual Rhythm)',
    artist: 'Tribal Elders of Amazonia',
    album: 'Voices of Sacred Earth',
    duration: 225,
    durationFormatted: '03:45',
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
    category: 'drums',
    categoryLabel: 'Ceremonial Drums',
    frequency: 'Earth Resonant',
    description: 'Organic hand drums, seed shakers, and acoustic resonance designed for deep grounding rituals.',
    synthConfig: {
      type: 'sacred_drums',
      baseFreq: 110,
    },
  },
  {
    id: 'track-4',
    title: 'Forest Rain & Maraca Solitude',
    artist: 'Amazon Bio-Acoustics',
    album: 'Rainforest Ambient Echoes',
    duration: 375,
    durationFormatted: '06:15',
    cover: 'https://images.unsplash.com/photo-1511497584788-876761c119ee?auto=format&fit=crop&w=600&q=80',
    category: 'nature',
    categoryLabel: 'Jungle Acoustics',
    frequency: 'Natural Frequency',
    description: 'Pure high-definition natural soundscape recorded deep in the Amazon basin during gentle rainfall.',
    synthConfig: {
      type: 'jungle_rain',
      baseFreq: 220,
    },
  },
  {
    id: 'track-5',
    title: 'Kaxinawá Visionary Meditation',
    artist: 'Solfeggio Resonance Project',
    album: 'Transformation Frequencies',
    duration: 290,
    durationFormatted: '04:50',
    cover: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    category: 'soundbath',
    categoryLabel: 'Solfeggio Soundbath',
    frequency: '528 Hz',
    description: 'Miracle frequency (528Hz) sound bath crafted to open the third eye and clear energy fields.',
    synthConfig: {
      type: 'solfeggio_528',
      baseFreq: 528,
      binauralBeat: 7.83, // Schumann resonance
    },
  },
  {
    id: 'track-6',
    title: 'Sacred Fire Icaro & Humming',
    artist: 'Curandero Ancestral Voices',
    album: 'Sacred Ceremonial Journeys',
    duration: 250,
    durationFormatted: '04:10',
    cover: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
    category: 'icaros',
    categoryLabel: 'Sacred Icaros',
    frequency: '432 Hz',
    description: 'Hypnotic vocal hums, crackling ceremonial fire, and sacred tobacco blowing soundscape.',
    synthConfig: {
      type: 'icaros_hum',
      baseFreq: 216,
    },
  },
];
