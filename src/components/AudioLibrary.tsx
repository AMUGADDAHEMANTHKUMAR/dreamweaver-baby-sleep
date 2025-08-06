import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, RotateCcw, Timer, Volume2, Search } from 'lucide-react';
import { toast } from 'sonner';

interface AudioTrack {
  id: string;
  title: string;
  category: string;
  duration: string;
  description: string;
  url: string;
}

interface SearchResult {
  id: string;
  title: string;
  artist: string;
  duration: number;
  preview_url: string;
}

// Generate gentle baby-safe audio using Web Audio API
const generateGentleAudio = (type: 'white' | 'brown' | 'rain' | 'ocean') => {
  return new Promise<string>((resolve) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const duration = 10; // 10 seconds for demo
    const sampleRate = audioContext.sampleRate;
    const frameCount = sampleRate * duration;
    const arrayBuffer = audioContext.createBuffer(1, frameCount, sampleRate);
    const channelData = arrayBuffer.getChannelData(0);

    // Generate gentle baby-safe sounds
    for (let i = 0; i < frameCount; i++) {
      let sample = 0;
      switch (type) {
        case 'white':
          // Very gentle white noise
          sample = (Math.random() - 0.5) * 0.1;
          break;
        case 'brown':
          // Warm, low-frequency brown noise
          sample = (Math.random() - 0.5) * 0.08 * Math.sin(i * 0.001);
          break;
        case 'rain':
          // Gentle rain simulation
          sample = Math.random() > 0.97 ? (Math.random() - 0.5) * 0.05 : 0;
          break;
        case 'ocean':
          // Gentle wave sounds
          sample = Math.sin(i * 0.001 + Math.sin(i * 0.0001) * 0.5) * 0.03;
          break;
      }
      channelData[i] = sample;
    }

    // Convert to data URL
    const wavArrayBuffer = audioBufferToWav(arrayBuffer);
    const blob = new Blob([wavArrayBuffer], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    resolve(url);
  });
};

// Convert AudioBuffer to WAV format
const audioBufferToWav = (buffer: AudioBuffer) => {
  const length = buffer.length;
  const arrayBuffer = new ArrayBuffer(44 + length * 2);
  const view = new DataView(arrayBuffer);
  const channelData = buffer.getChannelData(0);

  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, length * 2, true);

  // Convert float samples to 16-bit PCM
  let offset = 44;
  for (let i = 0; i < length; i++) {
    const sample = Math.max(-1, Math.min(1, channelData[i]));
    view.setInt16(offset, sample * 0x7FFF, true);
    offset += 2;
  }

  return arrayBuffer;
};

const predefinedTracks: AudioTrack[] = [
  {
    id: 'gentle-white-noise',
    title: 'Gentle White Noise',
    category: 'White Noise',
    duration: '60:00',
    description: 'Ultra-soft white noise perfect for baby sleep',
    url: ''
  },
  {
    id: 'warm-brown-noise',
    title: 'Warm Brown Noise',
    category: 'White Noise',
    duration: '60:00',
    description: 'Deep, warming sounds to soothe your baby',
    url: ''
  },
  {
    id: 'gentle-rain',
    title: 'Gentle Rain Drops',
    category: 'Nature Sounds',
    duration: '45:00',
    description: 'Soft rainfall sounds for peaceful sleep',
    url: ''
  },
  {
    id: 'ocean-lullaby',
    title: 'Ocean Lullaby',
    category: 'Nature Sounds',
    duration: '30:00',
    description: 'Gentle ocean waves to calm your little one',
    url: ''
  },
  {
    id: 'heartbeat',
    title: 'Heartbeat Rhythm',
    category: 'Lullabies',
    duration: '20:00',
    description: 'Comforting heartbeat sound like in the womb',
    url: ''
  },
  {
    id: 'soft-hum',
    title: 'Soft Humming',
    category: 'Lullabies',
    duration: '25:00',
    description: 'Gentle humming melody for sweet dreams',
    url: ''
  }
];

const AudioLibrary = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [volume, setVolume] = useState([0.7]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedTimer, setSelectedTimer] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const categories = ['all', 'White Noise', 'Nature Sounds', 'Lullabies', 'Ambient'];
  const timerOptions = [
    { label: '15 minutes', value: '15' },
    { label: '30 minutes', value: '30' },
    { label: '45 minutes', value: '45' },
    { label: '60 minutes', value: '60' },
    { label: '90 minutes', value: '90' },
    { label: '2 hours', value: '120' },
  ];

  const filteredTracks = selectedCategory === 'all' 
    ? predefinedTracks 
    : predefinedTracks.filter(track => track.category === selectedCategory);

  // Generate audio URLs when component mounts
  useEffect(() => {
    const generateAudioUrls = async () => {
      const tracks = [...predefinedTracks];
      tracks[0].url = await generateGentleAudio('white');
      tracks[1].url = await generateGentleAudio('brown');
      tracks[2].url = await generateGentleAudio('rain');
      tracks[3].url = await generateGentleAudio('ocean');
      
      // Generate heartbeat and humming using simple sine waves
      tracks[4].url = await generateHeartbeat();
      tracks[5].url = await generateHumming();
    };
    
    generateAudioUrls();
  }, []);

  const generateHeartbeat = () => {
    return new Promise<string>((resolve) => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const duration = 10;
      const sampleRate = audioContext.sampleRate;
      const frameCount = sampleRate * duration;
      const arrayBuffer = audioContext.createBuffer(1, frameCount, sampleRate);
      const channelData = arrayBuffer.getChannelData(0);

      for (let i = 0; i < frameCount; i++) {
        // Gentle heartbeat pattern: lub-dub, lub-dub
        const time = i / sampleRate;
        const beat = Math.floor(time * 1.2) % 2; // 1.2 beats per second
        const beatTime = (time * 1.2) % 1;
        
        let sample = 0;
        if (beatTime < 0.1) {
          sample = Math.sin(beatTime * Math.PI * 20) * 0.02; // lub
        } else if (beatTime < 0.2 && beatTime > 0.15) {
          sample = Math.sin((beatTime - 0.15) * Math.PI * 40) * 0.015; // dub
        }
        
        channelData[i] = sample;
      }

      const wavArrayBuffer = audioBufferToWav(arrayBuffer);
      const blob = new Blob([wavArrayBuffer], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      resolve(url);
    });
  };

  const generateHumming = () => {
    return new Promise<string>((resolve) => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const duration = 10;
      const sampleRate = audioContext.sampleRate;
      const frameCount = sampleRate * duration;
      const arrayBuffer = audioContext.createBuffer(1, frameCount, sampleRate);
      const channelData = arrayBuffer.getChannelData(0);

      for (let i = 0; i < frameCount; i++) {
        // Gentle humming melody
        const time = i / sampleRate;
        const frequency = 220 + Math.sin(time * 0.5) * 30; // Gentle variation around A3
        const sample = Math.sin(time * frequency * 2 * Math.PI) * 0.03;
        channelData[i] = sample;
      }

      const wavArrayBuffer = audioBufferToWav(arrayBuffer);
      const blob = new Blob([wavArrayBuffer], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      resolve(url);
    });
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
    const handleEnded = () => {
      if (!isLooping) {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('canplaythrough', updateDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('canplaythrough', updateDuration);
    };
  }, [isLooping]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0];
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = isLooping;
    }
  }, [isLooping]);

  // Timer countdown effect
  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 1) {
            handleStopAudio();
            toast.success('Sleep timer finished');
            return null;
          }
          return prev - 1;
        });
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
  }, [timeRemaining]);

  // Generate a simple tone for demo purposes
  const generateTone = (frequency: number = 200, duration: number = 1) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
    
    return audioContext;
  };

  const handlePlayTrack = async (track: AudioTrack) => {
    if (currentTrack?.id === track.id && isPlaying) {
      handlePauseAudio();
      return;
    }

    setCurrentTrack(track);
    setCurrentTime(0);
    
    try {
      if (audioRef.current) {
        // For demo purposes, create a simple white noise using Web Audio API
        if (track.category === 'White Noise') {
          // Generate white noise
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const bufferSize = audioContext.sampleRate * 2; // 2 seconds of audio
          const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
          const output = buffer.getChannelData(0);
          
          for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1; // White noise
          }
          
          const source = audioContext.createBufferSource();
          source.buffer = buffer;
          source.loop = true;
          source.connect(audioContext.destination);
          source.start();
          
          setIsPlaying(true);
          setDuration(3600); // 1 hour
          toast.success(`Playing ${track.title}`);
          return;
        }
        
        // For other tracks, use a simple tone
        generateTone(track.category === 'Nature Sounds' ? 150 : 300, 60);
        setIsPlaying(true);
        setDuration(1800); // 30 minutes
        toast.success(`Playing ${track.title}`);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      toast.error('Failed to play audio track');
    }
  };

  const handlePauseAudio = () => {
    setIsPlaying(false);
    toast.info('Audio paused');
  };

  const handleStopAudio = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setTimeRemaining(null);
    setSelectedTimer('');
    toast.info('Audio stopped');
  };

  const handleSetTimer = (minutes: string) => {
    if (!minutes || minutes === 'none') {
      setTimeRemaining(null);
      setSelectedTimer('');
      return;
    }
    
    const seconds = parseInt(minutes) * 60;
    setTimeRemaining(seconds);
    setSelectedTimer(minutes);
    toast.success(`Timer set for ${minutes} minutes`);
  };

  const searchMusic = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // Mock search results - in a real app, you'd call a music API
      const mockResults: SearchResult[] = [
        {
          id: `search-${Date.now()}-1`,
          title: `${searchQuery} Lullaby`,
          artist: 'Sleep Music Collection',
          duration: 180,
          preview_url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjuZ2e7Fe+fE'
        },
        {
          id: `search-${Date.now()}-2`,
          title: `Peaceful ${searchQuery}`,
          artist: 'Nature Sounds Studio',
          duration: 240,
          preview_url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjuZ2e7Fe+fE'
        }
      ];
      
      setSearchResults(mockResults);
      toast.success(`Found ${mockResults.length} results for "${searchQuery}"`);
    } catch (error) {
      toast.error('Failed to search for music');
    } finally {
      setIsSearching(false);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatTimerDisplay = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <audio ref={audioRef} />
      
      {/* Search Bar */}
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Music
          </CardTitle>
          <CardDescription>Find lullabies, nature sounds, and relaxing music</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Search for baby sleep music..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchMusic()}
            />
            <Button onClick={searchMusic} disabled={isSearching}>
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audio Player Controls */}
      {currentTrack && (
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{currentTrack.title}</h3>
                  <p className="text-sm text-muted-foreground">{currentTrack.description}</p>
                </div>
                <Badge variant="secondary">{currentTrack.category}</Badge>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => isPlaying ? handlePauseAudio() : handlePlayTrack(currentTrack)}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsLooping(!isLooping)}
                  className={isLooping ? 'bg-primary text-primary-foreground' : ''}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm">{formatTime(currentTime)}</span>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm">{formatTime(duration)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  <Slider
                    value={volume}
                    onValueChange={setVolume}
                    max={1}
                    step={0.1}
                    className="w-20"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4" />
                  <Select value={selectedTimer} onValueChange={handleSetTimer}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Set timer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No timer</SelectItem>
                      {timerOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {timeRemaining !== null && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Time remaining:</span>
                    <Badge variant="outline">{formatTimerDisplay(timeRemaining)}</Badge>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Filter */}
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex gap-2 flex-wrap">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category === 'all' ? 'All Categories' : category}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Search Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map(result => (
              <Card key={result.id} className="bg-white/90 backdrop-blur-sm hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-sm">{result.title}</CardTitle>
                      <CardDescription className="text-xs">{result.artist}</CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {formatTime(result.duration)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => handlePlayTrack({
                      id: result.id,
                      title: result.title,
                      category: 'Search Results',
                      duration: formatTime(result.duration),
                      description: `By ${result.artist}`,
                      url: result.preview_url
                    })}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Play
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Audio Tracks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTracks.map(track => (
          <Card key={track.id} className="bg-white/90 backdrop-blur-sm hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-sm">{track.title}</CardTitle>
                  <CardDescription className="text-xs">{track.description}</CardDescription>
                </div>
                <Badge variant="outline" className="text-xs">
                  {track.duration}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  {track.category}
                </Badge>
                <Button
                  size="sm"
                  variant={currentTrack?.id === track.id && isPlaying ? "secondary" : "default"}
                  onClick={() => handlePlayTrack(track)}
                >
                  {currentTrack?.id === track.id && isPlaying ? (
                    <Pause className="h-3 w-3" />
                  ) : (
                    <Play className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AudioLibrary;