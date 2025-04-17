// Web Audio API implementation for sound effects and voice
import { environmentSounds } from '../components/assets';

export class AudioHandler {
  private audioContext: AudioContext | null = null;
  private recognition: any = null; // SpeechRecognition
  private synthesis: SpeechSynthesis | null = null;
  private backgroundSound: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private isRecording = false;

  constructor() {
    this.initAudio();
    this.initSpeechRecognition();
    this.initSpeechSynthesis();
  }

  private initAudio() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create a gain node for volume control
      if (this.audioContext) {
        this.gainNode = this.audioContext.createGain();
        this.gainNode.connect(this.audioContext.destination);
      }
    } catch (error) {
      console.error('Web Audio API not supported:', error);
    }
  }

  private initSpeechRecognition() {
    // Work around typing issues with Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
    } else {
      console.error('Speech Recognition not supported in this browser');
    }
  }

  private initSpeechSynthesis() {
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    } else {
      console.error('Speech Synthesis not supported in this browser');
    }
  }

  public startVoiceRecognition(onResult: (text: string) => void, onError: (error: any) => void) {
    if (!this.recognition) {
      onError('Speech recognition not supported');
      return false;
    }
    
    if (this.isRecording) {
      return true; // Already recording
    }

    try {
      this.recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        
        onResult(transcript);
      };
      
      this.recognition.onerror = onError;
      
      this.recognition.start();
      this.isRecording = true;
      return true;
    } catch (error) {
      onError(error);
      return false;
    }
  }

  public stopVoiceRecognition() {
    if (this.recognition && this.isRecording) {
      this.recognition.stop();
      this.isRecording = false;
    }
  }

  public speak(text: string, onEnd?: () => void) {
    if (!this.synthesis) {
      console.error('Speech synthesis not supported');
      return false;
    }
    
    // Cancel any ongoing speech
    this.synthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    if (onEnd) {
      utterance.onend = onEnd;
    }
    
    this.synthesis.speak(utterance);
    return true;
  }

  public async playBackgroundSound(soundType: string) {
    if (!this.audioContext || !this.gainNode) {
      console.error('Audio context not initialized');
      return false;
    }
    
    // Stop any currently playing background sound
    this.stopBackgroundSound();
    
    // Choose a sound based on mood or environment type
    let soundUrl = '';
    
    // Environment sounds
    if (soundType.startsWith('env_')) {
      const environment = soundType.replace('env_', '') as keyof typeof environmentSounds;
      
      // Use the imported environment sounds from assets.ts
      if (environmentSounds[environment]) {
        soundUrl = environmentSounds[environment];
      } else {
        soundUrl = 'https://cdn.freesound.org/previews/440/440931_9159316-lq.mp3'; // Neutral ambient fallback
      }
    } 
    // Special features sounds
    else if (soundType.startsWith('feature_')) {
      const feature = soundType.replace('feature_', '');
      switch (feature) {
        case 'breathing':
          soundUrl = 'https://cdn.freesound.org/previews/363/363126_6182381-lq.mp3'; // Breathing exercise sound
          break;
        case 'meditation':
          soundUrl = 'https://cdn.freesound.org/previews/439/439472_9015615-lq.mp3'; // Meditation bells
          break;
        default:
          soundUrl = 'https://cdn.freesound.org/previews/440/440931_9159316-lq.mp3'; // Neutral ambient
      }
    }
    // Mood-based sounds
    else {
      switch (soundType) {
        case 'calm':
        case 'happy':
          soundUrl = 'https://cdn.freesound.org/previews/419/419512_8194345-lq.mp3'; // Calm ambient
          break;
        case 'anxious':
        case 'stressed':
          soundUrl = 'https://cdn.freesound.org/previews/523/523305_10908610-lq.mp3'; // Soothing
          break;
        case 'sad':
          soundUrl = 'https://cdn.freesound.org/previews/348/348128_5984982-lq.mp3'; // Soft piano
          break;
        case 'improved':
          soundUrl = 'https://cdn.freesound.org/previews/361/361715_6686038-lq.mp3'; // Uplifting
          break;
        default:
          soundUrl = 'https://cdn.freesound.org/previews/440/440931_9159316-lq.mp3'; // Neutral ambient
      }
    }
    
    try {
      const response = await fetch(soundUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      this.backgroundSound = this.audioContext.createBufferSource();
      this.backgroundSound.buffer = audioBuffer;
      this.backgroundSound.loop = true;
      
      // Connect to gain node for volume control
      this.backgroundSound.connect(this.gainNode);
      
      // Start playing
      this.backgroundSound.start();
      return true;
    } catch (error) {
      console.error('Error loading background sound:', error);
      return false;
    }
  }

  public stopBackgroundSound() {
    if (this.backgroundSound) {
      try {
        this.backgroundSound.stop();
        this.backgroundSound.disconnect();
        this.backgroundSound = null;
      } catch (error) {
        console.error('Error stopping background sound:', error);
      }
    }
  }

  public setBackgroundVolume(volume: number) {
    if (this.gainNode) {
      // Volume should be between 0 and 1
      const safeVolume = Math.max(0, Math.min(1, volume));
      this.gainNode.gain.value = safeVolume;
    }
  }
}

// Create a singleton instance
const audioHandler = new AudioHandler();
export default audioHandler;
