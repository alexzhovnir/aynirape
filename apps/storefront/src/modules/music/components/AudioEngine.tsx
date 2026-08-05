import {
  $currentTime,
  $currentTrack,
  $duration,
  $isMuted,
  $isPlaying,
  $playbackMode,
  $volume,
  nextTrack,
} from '@lib/stores/playerStore';
import { useStore } from '@nanostores/react';
import { useEffect, useRef } from 'react';

export const AudioEngine = () => {
  const currentTrack = useStore($currentTrack);
  const isPlaying = useStore($isPlaying);
  const volume = useStore($volume);
  const isMuted = useStore($isMuted);
  const currentTime = useStore($currentTime);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthNodesRef = useRef<{
    osc1?: OscillatorNode;
    osc2?: OscillatorNode;
    noiseNode?: AudioNode;
    gainNode?: GainNode;
    filterNode?: BiquadFilterNode;
  }>({});
  const timerRef = useRef<number | null>(null);

  // Initialize HTML Audio element
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      if (audioRef.current && !audioRef.current.paused) {
        $currentTime.set(audioRef.current.currentTime);
        if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
          $duration.set(audioRef.current.duration);
        }
      }
    };

    const handleEnded = () => {
      const mode = $playbackMode.get();
      if (mode === 'loop' && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      } else {
        nextTrack();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      stopSynth();
    };
  }, []);

  // Handle Synth Audio Generator for ambient soundscapes
  const startSynth = () => {
    if (!currentTrack?.synthConfig) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      stopSynth();

      const masterGain = ctx.createGain();
      const effectiveVol = isMuted ? 0 : volume;
      masterGain.gain.setValueAtTime(effectiveVol * 0.25, ctx.currentTime);
      masterGain.connect(ctx.destination);

      const config = currentTrack.synthConfig;
      const baseFreq = config.baseFreq || 432;

      if (config.type === 'binaural' || config.type === 'solfeggio_528' || config.type === 'shamanic_flute') {
        // Left channel oscillator
        const oscL = ctx.createOscillator();
        oscL.type = config.type === 'shamanic_flute' ? 'triangle' : 'sine';
        oscL.frequency.setValueAtTime(baseFreq, ctx.currentTime);

        // Right channel oscillator with binaural offset
        const oscR = ctx.createOscillator();
        oscR.type = config.type === 'shamanic_flute' ? 'sine' : 'sine';
        const beat = config.binauralBeat || 6;
        oscR.frequency.setValueAtTime(baseFreq + beat, ctx.currentTime);

        const merger = ctx.createChannelMerger(2);
        oscL.connect(merger, 0, 0); // left
        oscR.connect(merger, 0, 1); // right

        // Lowpass filter for smooth organic warmth
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, ctx.currentTime);

        merger.connect(filter);
        filter.connect(masterGain);

        oscL.start();
        oscR.start();

        synthNodesRef.current = { osc1: oscL, osc2: oscR, gainNode: masterGain, filterNode: filter };
      } else {
        // Nature rain / drums / humming simulation
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = config.type === 'jungle_rain' ? 'bandpass' : 'lowpass';
        filter.frequency.setValueAtTime(config.type === 'jungle_rain' ? 800 : 250, ctx.currentTime);
        filter.Q.setValueAtTime(3, ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(masterGain);

        whiteNoise.start();
        synthNodesRef.current = { noiseNode: whiteNoise, gainNode: masterGain, filterNode: filter };
      }
    } catch (e) {
      console.warn('Web Audio Synth initialization error:', e);
    }
  };

  const stopSynth = () => {
    try {
      if (synthNodesRef.current.osc1) {
        synthNodesRef.current.osc1.stop();
        synthNodesRef.current.osc1.disconnect();
      }
      if (synthNodesRef.current.osc2) {
        synthNodesRef.current.osc2.stop();
        synthNodesRef.current.osc2.disconnect();
      }
      if (synthNodesRef.current.noiseNode && 'stop' in synthNodesRef.current.noiseNode) {
        (synthNodesRef.current.noiseNode as AudioScheduledSourceNode).stop();
        synthNodesRef.current.noiseNode.disconnect();
      }
      if (synthNodesRef.current.gainNode) {
        synthNodesRef.current.gainNode.disconnect();
      }
    } catch {
      // Ignore cleanup errors
    }
    synthNodesRef.current = {};
  };

  // Sync track play/pause state
  useEffect(() => {
    if (!currentTrack) return;

    if (currentTrack.audioUrl && audioRef.current) {
      if (audioRef.current.src !== currentTrack.audioUrl) {
        audioRef.current.src = currentTrack.audioUrl;
      }
      if (isPlaying) {
        audioRef.current.play().catch(() => {
          // Fallback to Web Audio synth if audio URL fails to load
          startSynth();
        });
      } else {
        audioRef.current.pause();
      }
    } else {
      if (isPlaying) {
        startSynth();
      } else {
        stopSynth();
      }
    }

    // Media Session API integration
    if ('mediaSession' in navigator && currentTrack) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        album: currentTrack.album,
        artwork: [{ src: currentTrack.cover, sizes: '512x512', type: 'image/jpeg' }],
      });

      navigator.mediaSession.setActionHandler('play', () => $isPlaying.set(true));
      navigator.mediaSession.setActionHandler('pause', () => $isPlaying.set(false));
      navigator.mediaSession.setActionHandler('nexttrack', () => nextTrack());
      navigator.mediaSession.setActionHandler('previoustrack', () => nextTrack());
    }
  }, [currentTrack, isPlaying]);

  // Synthetic timer progress tick if audio element is not playing real media
  useEffect(() => {
    if (isPlaying && (!currentTrack?.audioUrl || audioRef.current?.paused)) {
      timerRef.current = window.setInterval(() => {
        const cur = $currentTime.get();
        const dur = $duration.get();
        if (cur >= dur) {
          const mode = $playbackMode.get();
          if (mode === 'loop') {
            $currentTime.set(0);
          } else {
            nextTrack();
          }
        } else {
          $currentTime.set(cur + 1);
        }
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, currentTrack]);

  // Sync volume & mute
  useEffect(() => {
    const effectiveVol = isMuted ? 0 : volume;
    if (audioRef.current) {
      audioRef.current.volume = effectiveVol;
    }
    if (synthNodesRef.current.gainNode && audioCtxRef.current) {
      synthNodesRef.current.gainNode.gain.setValueAtTime(effectiveVol * 0.25, audioCtxRef.current.currentTime);
    }
  }, [volume, isMuted]);

  // Seek position sync
  useEffect(() => {
    if (audioRef.current && Math.abs(audioRef.current.currentTime - currentTime) > 1.5) {
      audioRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  return null;
};
