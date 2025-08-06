import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, Search, Clock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Sonora API integration
const SONORA_API_KEY = '205f31bdaa6123b902d98bcf89901307';

// Gentle baby-safe sounds with Sonora API integration
const BABY_SAFE_SOUNDS = [
  {
    id: '1',
    title: 'Gentle White Noise',
    description: 'Soft, calming white noise for peaceful sleep',
    duration: 300,
    category: 'White Noise',
    soundType: 'gentle_white_noise',
    isLocal: true
  },
  {
    id: '2', 
    title: 'Heartbeat Sounds',
    description: 'Comforting heartbeat rhythm like in the womb',
    duration: 600,
    category: 'Heartbeat',
    soundType: 'heartbeat',
    isLocal: true
  },
  {
    id: '3',
    title: 'Soft Humming',
    description: 'Peaceful humming melody for relaxation',
    duration: 240,
    category: 'Lullaby',
    soundType: 'soft_humming',
    isLocal: true
  },
  {
    id: '4',
    title: 'Rain Sounds',
    description: 'Gentle rain for a cozy sleep atmosphere',
    duration: 450,
    category: 'Nature',
    soundType: 'gentle_rain',
    isLocal: true
  },
  {
    id: '5',
    title: 'Ocean Waves',
    description: 'Soft ocean waves for deep relaxation',
    duration: 360,
    category: 'Nature',
    soundType: 'soft_waves',
    isLocal: true
  }
];

const AudioLibrary = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState([50]);
  const [timer, setTimer] = useState(0);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // Search Sonora API for baby-safe music
  const searchSonoraAPI = async (query: string) => {
    setIsSearching(true);
    try {
      // Mock Sonora API response for baby-safe content
      const mockResults = [
        {
          id: 'sonora_1',
          title: 'Baby Sleep Lullaby',
          description: 'Gentle piano lullaby for peaceful sleep',
          duration: 180,
          category: 'Lullaby',
          url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
          isLocal: false
        },
        {
          id: 'sonora_2',
          title: 'Nature Sounds for Babies',
          description: 'Soft forest sounds and gentle breeze',
          duration: 420,
          category: 'Nature',
          url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
          isLocal: false
        }
      ].filter(track => 
        track.title.toLowerCase().includes(query.toLowerCase()) ||
        track.category.toLowerCase().includes(query.toLowerCase())
      );
      
      setSearchResults(mockResults);
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Could not search for tracks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const generateGentleSound = () => {
    // Create a very gentle and pleasant audio buffer
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const sampleRate = audioContext.sampleRate;
    const length = sampleRate * 10; // 10 seconds
    const buffer = audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    // Generate very soft, pleasant white noise
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() - 0.5) * 0.03; // Very low volume, gentle
    }

    return { audioContext, buffer };
  };

  const playTrack = async (track: any) => {
    try {
      setIsLoading(true);
      
      // Stop current track if playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      setCurrentTrack(track);
      setCurrentTime(0);
      setDuration(track.duration);

      if (track.isLocal) {
        // For local gentle sounds, create a very soft audio experience
        const { audioContext, buffer } = generateGentleSound();
        
        if (!audioRef.current) {
          audioRef.current = new Audio();
        }
        
        // Create a data URL for the gentle sound
        const audioData = new Float32Array(buffer.getChannelData(0));
        const blob = new Blob([audioData], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        
        audioRef.current.src = url;
        audioRef.current.volume = volume[0] / 100;
        
        audioRef.current.onloadeddata = () => {
          setIsLoading(false);
          setIsPlaying(true);
          audioRef.current?.play();
        };
        
        audioRef.current.onerror = () => {
          setIsLoading(false);
          toast({
            title: "Playback Error",
            description: "Could not play the selected track.",
            variant: "destructive",
          });
        };
      } else {
        // For Sonora API tracks
        if (!audioRef.current) {
          audioRef.current = new Audio();
        }
        
        audioRef.current.src = track.url;
        audioRef.current.volume = volume[0] / 100;
        
        audioRef.current.onloadeddata = () => {
          setIsLoading(false);
          setIsPlaying(true);
          audioRef.current?.play();
        };
        
        audioRef.current.onerror = () => {
          setIsLoading(false);
          toast({
            title: "Playback Error",
            description: "Could not load the track from server.",
            variant: "destructive",
          });
        };
      }
      
      toast({
        title: "Now Playing",
        description: `${track.title} - ${track.category}`,
      });
      
    } catch (error) {
      setIsLoading(false);
      console.error('Playback error:', error);
      toast({
        title: "Playback Error",
        description: "Could not play the selected track.",
        variant: "destructive",
      });
      setIsPlaying(false);
    }
  };

  const pauseTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  };

  // Update volume when slider changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0] / 100;
    }
  }, [volume]);

  // Handle search input changes
  useEffect(() => {
    if (searchTerm.trim()) {
      const timeoutId = setTimeout(() => {
        searchSonoraAPI(searchTerm);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const filteredSounds = BABY_SAFE_SOUNDS.filter(sound =>
    sound.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sound.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const allTracks = [...filteredSounds, ...searchResults];

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Baby Sleep Music
          </CardTitle>
          <CardDescription>Find gentle lullabies and calming sounds for your baby</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Search for lullabies, white noise, heartbeat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Audio Player Controls */}
      {currentTrack && (
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-semibold">{currentTrack.title}</h3>
                <p className="text-sm text-muted-foreground">{currentTrack.category}</p>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-sm">{Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')}</span>
                <div className="flex-1 bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>
                <span className="text-sm">{Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}</span>
              </div>

              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => isPlaying ? pauseTrack() : playTrack(currentTrack)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                <Slider
                  value={volume}
                  onValueChange={setVolume}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm w-12">{volume[0]}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audio Library */}
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Baby Sleep Audio Library</CardTitle>
          <CardDescription>Gentle, baby-safe sounds for peaceful sleep</CardDescription>
        </CardHeader>
        <CardContent>
          {isSearching && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Searching for baby-safe music...</span>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allTracks.map((sound) => (
              <Card key={sound.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm">{sound.title}</h4>
                      <p className="text-xs text-muted-foreground">{sound.description}</p>
                      <p className="text-xs text-primary font-medium">{sound.category}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {Math.floor(sound.duration / 60)}:{(sound.duration % 60).toString().padStart(2, '0')}
                      </span>
                    </div>

                    <Button 
                      onClick={() => isPlaying && currentTrack?.id === sound.id ? pauseTrack() : playTrack(sound)}
                      size="sm"
                      className="w-full flex items-center gap-2"
                      disabled={isLoading}
                    >
                      {isLoading && currentTrack?.id === sound.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isPlaying && currentTrack?.id === sound.id ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                      {isLoading && currentTrack?.id === sound.id 
                        ? 'Loading...'
                        : isPlaying && currentTrack?.id === sound.id 
                        ? 'Pause' 
                        : 'Play'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AudioLibrary;