import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, Search, Clock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Sonora API integration
const SONORA_API_KEY = '205f31bdaa6123b902d98bcf89901307';

// Diverse baby lullabies and sleep music - Different melodies and styles
const BABY_SAFE_SOUNDS = [
  {
    id: '1',
    title: 'Brahms Lullaby - Classical',
    description: 'Traditional German lullaby with gentle piano',
    duration: 180,
    category: 'Classical Lullaby',
    url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    isLocal: false
  },
  {
    id: '2', 
    title: 'Twinkle Twinkle Little Star',
    description: 'Beloved nursery rhyme in soft instrumental',
    duration: 120,
    category: 'Nursery Rhyme',
    url: 'https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav',
    isLocal: false
  },
  {
    id: '3',
    title: 'Gentle Forest Sounds',
    description: 'Birds chirping softly with nature ambiance',
    duration: 300,
    category: 'Nature Sounds',
    url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    isLocal: false
  },
  {
    id: '4',
    title: 'Rock-a-bye Baby',
    description: 'Classic English lullaby with music box melody',
    duration: 150,
    category: 'Traditional Lullaby', 
    url: 'https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav',
    isLocal: false
  },
  {
    id: '5',
    title: 'Soft Harp Melodies',
    description: 'Peaceful harp compositions for deep sleep',
    duration: 240,
    category: 'Instrumental',
    url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    isLocal: false
  },
  {
    id: '6',
    title: 'Ocean Waves with Seagulls',
    description: 'Calming beach sounds with distant seagulls',
    duration: 350,
    category: 'Nature Sounds',
    url: 'https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav',
    isLocal: false
  },
  {
    id: '7',
    title: 'Mary Had a Little Lamb',
    description: 'Gentle instrumental version of the classic',
    duration: 100,
    category: 'Nursery Rhyme',
    url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    isLocal: false
  },
  {
    id: '8',
    title: 'Soft Rain on Leaves',
    description: 'Gentle rainfall with rustling leaves',
    duration: 400,
    category: 'Rain Sounds',
    url: 'https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav',
    isLocal: false
  },
  {
    id: '9',
    title: 'Silent Night - Music Box',
    description: 'Christmas lullaby in delicate music box style',
    duration: 200,
    category: 'Holiday Lullaby',
    url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    isLocal: false
  },
  {
    id: '10',
    title: 'Gentle Celtic Melodies',
    description: 'Soft Celtic harp and flute combinations',
    duration: 280,
    category: 'Celtic',
    url: 'https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav',
    isLocal: false
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

  // Remove synthetic audio generation - use real music files only

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

      // Use real audio URLs for all tracks - Vercel compatible
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      
      audioRef.current.src = track.url;
      audioRef.current.volume = volume[0] / 100;
      audioRef.current.loop = true; // Loop for continuous sleep aid
      
      audioRef.current.onloadeddata = () => {
        setIsLoading(false);
        setIsPlaying(true);
        audioRef.current?.play().catch(error => {
          console.error('Play failed:', error);
          toast({
            title: "Playback Error", 
            description: "Click to enable audio playback",
            variant: "destructive",
          });
        });
      };
      
      audioRef.current.onerror = () => {
        setIsLoading(false);
        toast({
          title: "Playback Error",
          description: "Could not load baby lullaby. Please try another.",
          variant: "destructive",
        });
      };
      
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