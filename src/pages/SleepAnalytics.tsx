import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Play, Pause, RotateCcw, Timer, Volume2 } from 'lucide-react';
import { toast } from 'sonner';

interface AudioTrack {
  id: string;
  title: string;
  category: string;
  duration: string;
  description: string;
  url: string;
}

const audioTracks: AudioTrack[] = [
  {
    id: 'white-noise-1',
    title: 'Classic White Noise',
    category: 'White Noise',
    duration: '60:00',
    description: 'Consistent static sound to mask background noise',
    url: '/audio/white-noise-classic.mp3'
  },
  {
    id: 'brown-noise-1',
    title: 'Brown Noise',
    category: 'White Noise',
    duration: '60:00',
    description: 'Deeper, warmer noise for better sleep',
    url: '/audio/brown-noise.mp3'
  },
  {
    id: 'lullaby-1',
    title: 'Brahms Lullaby',
    category: 'Lullabies',
    duration: '3:24',
    description: 'Classic gentle lullaby for peaceful sleep',
    url: '/audio/brahms-lullaby.mp3'
  },
  {
    id: 'lullaby-2',
    title: 'Twinkle Little Star',
    category: 'Lullabies',
    duration: '2:45',
    description: 'Soft instrumental version of the beloved nursery rhyme',
    url: '/audio/twinkle-star.mp3'
  },
  {
    id: 'nature-1',
    title: 'Ocean Waves',
    category: 'Nature Sounds',
    duration: '45:00',
    description: 'Gentle waves lapping on a peaceful shore',
    url: '/audio/ocean-waves.mp3'
  },
  {
    id: 'nature-2',
    title: 'Rain on Leaves',
    category: 'Nature Sounds',
    duration: '30:00',
    description: 'Soft rainfall through forest canopy',
    url: '/audio/rain-leaves.mp3'
  },
  {
    id: 'nature-3',
    title: 'Forest Birds',
    category: 'Nature Sounds',
    duration: '35:00',
    description: 'Peaceful chirping in a quiet forest',
    url: '/audio/forest-birds.mp3'
  },
  {
    id: 'ambient-1',
    title: 'Celestial Dreams',
    category: 'Ambient',
    duration: '40:00',
    description: 'Ethereal tones for deep relaxation',
    url: '/audio/celestial-dreams.mp3'
  }
];

const SleepAnalytics = () => {
  const navigate = useNavigate();
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

  const categories = ['all', 'White Noise', 'Lullabies', 'Nature Sounds', 'Ambient'];
  const timerOptions = [
    { label: '15 minutes', value: '15' },
    { label: '30 minutes', value: '30' },
    { label: '45 minutes', value: '45' },
    { label: '60 minutes', value: '60' },
    { label: '90 minutes', value: '90' },
    { label: '2 hours', value: '120' },
  ];

  const filteredTracks = selectedCategory === 'all' 
    ? audioTracks 
    : audioTracks.filter(track => track.category === selectedCategory);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (!isLooping) {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
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

  const handlePlayTrack = (track: AudioTrack) => {
    if (currentTrack?.id === track.id && isPlaying) {
      handlePauseAudio();
      return;
    }

    setCurrentTrack(track);
    setCurrentTime(0);
    
    if (audioRef.current) {
      audioRef.current.src = track.url;
      audioRef.current.load();
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(error => {
          console.error('Error playing audio:', error);
          toast.error('Failed to play audio track');
        });
    }
  };

  const handlePauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleStopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
      setTimeRemaining(null);
      setSelectedTimer('');
    }
  };

  const handleSetTimer = (minutes: string) => {
    if (!minutes) {
      setTimeRemaining(null);
      setSelectedTimer('');
      return;
    }
    
    const seconds = parseInt(minutes) * 60;
    setTimeRemaining(seconds);
    setSelectedTimer(minutes);
    toast.success(`Timer set for ${minutes} minutes`);
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
    <div className="min-h-screen bg-gradient-to-br from-soft-blue to-gentle-lavender">
      <header className="bg-white/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-xl font-semibold">Sleep Analytics - Audio Library</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
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
                      onClick={() => isPlaying ? handlePauseAudio() : audioRef.current?.play()}
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
                          <SelectItem value="">No timer</SelectItem>
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

          {/* Audio Tracks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTracks.map(track => (
              <Card key={track.id} className="bg-white/90 backdrop-blur-sm hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{track.title}</CardTitle>
                      <CardDescription className="mt-1">{track.description}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="ml-2">{track.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{track.duration}</span>
                    <Button
                      variant={currentTrack?.id === track.id && isPlaying ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => handlePlayTrack(track)}
                    >
                      {currentTrack?.id === track.id && isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Instructions */}
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>How to Use</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>Play Audio:</strong> Click the play button on any track to start playback</p>
              <p><strong>Loop:</strong> Use the loop button to repeat the current track continuously</p>
              <p><strong>Timer:</strong> Set a sleep timer to automatically stop playback after a set duration</p>
              <p><strong>Volume:</strong> Adjust the volume using the slider in the player controls</p>
              <p><strong>Categories:</strong> Filter tracks by category to find the perfect sound for your baby</p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Hidden Audio Element */}
      <audio ref={audioRef} preload="metadata" />
    </div>
  );
};

export default SleepAnalytics;