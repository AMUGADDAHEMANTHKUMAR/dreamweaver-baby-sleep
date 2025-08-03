import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Play, Pause, RotateCcw, Timer, Volume2, BookOpen, Clock, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface AudioTrack {
  id: string;
  title: string;
  category: string;
  duration: string;
  description: string;
  url: string;
}

interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  ageGroup: string;
  readTime: string;
  lastUpdated: string;
  tags: string[];
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

const articles: Article[] = [
  {
    id: 'newborn-sleep-patterns',
    title: 'Understanding Newborn Sleep Patterns',
    excerpt: 'Learn about normal sleep cycles and what to expect in the first few months.',
    content: 'Newborns typically sleep 14-17 hours per day, but in short 2-4 hour stretches. Their sleep cycles are different from adults, with more REM sleep for brain development.',
    category: 'Sleep Development',
    ageGroup: '0-3 months',
    readTime: '5 min read',
    lastUpdated: '2024-01-15',
    tags: ['newborn', 'sleep cycles', 'development']
  },
  {
    id: 'sleep-regression-4months',
    title: 'The 4-Month Sleep Regression',
    excerpt: 'Why your baby\'s sleep suddenly changes and how to navigate this challenging phase.',
    content: 'Around 4 months, babies\' sleep patterns mature, leading to more frequent night wakings. This is actually a positive developmental milestone.',
    category: 'Sleep Development',
    ageGroup: '3-6 months',
    readTime: '7 min read',
    lastUpdated: '2024-01-20',
    tags: ['sleep regression', 'development', '4 months']
  },
  {
    id: 'gentle-sleep-training',
    title: 'Gentle Sleep Training Methods',
    excerpt: 'Evidence-based approaches to help your baby learn independent sleep skills.',
    content: 'Step-by-step guide to gentle sleep training methods including the pick-up-put-down method, gradual retreat, and check-and-console approaches.',
    category: 'Sleep Training',
    ageGroup: '4-12 months',
    readTime: '10 min read',
    lastUpdated: '2024-01-10',
    tags: ['sleep training', 'gentle methods', 'independent sleep']
  },
  {
    id: 'optimal-sleep-environment',
    title: 'Creating the Perfect Sleep Environment',
    excerpt: 'Science-backed tips for designing a nursery that promotes better sleep.',
    content: 'Learn about optimal room temperature (68-70°F), lighting conditions, noise levels, and safe sleep practices for better rest.',
    category: 'Sleep Environment',
    ageGroup: 'All ages',
    readTime: '6 min read',
    lastUpdated: '2024-01-25',
    tags: ['nursery', 'environment', 'safe sleep']
  },
  {
    id: 'toddler-bedtime-routine',
    title: 'Establishing Toddler Bedtime Routines',
    excerpt: 'How to transition from baby to toddler sleep schedules and routines.',
    content: 'Toddlers thrive on consistency. Learn how to create predictable bedtime routines that signal sleep time and reduce bedtime battles.',
    category: 'Sleep Training',
    ageGroup: '12+ months',
    readTime: '8 min read',
    lastUpdated: '2024-01-18',
    tags: ['toddler', 'bedtime routine', 'consistency']
  },
  {
    id: 'nap-transitions',
    title: 'Navigating Nap Transitions',
    excerpt: 'When and how to drop naps as your baby grows.',
    content: 'Understanding when babies typically transition from 3 to 2 naps, then from 2 to 1 nap, and eventually to no naps.',
    category: 'Sleep Development',
    ageGroup: '6-24 months',
    readTime: '7 min read',
    lastUpdated: '2024-01-12',
    tags: ['naps', 'transitions', 'schedule']
  },
  {
    id: 'sleep-safety-guidelines',
    title: 'Safe Sleep Guidelines',
    excerpt: 'Essential safety practices to reduce SIDS risk and ensure safe sleep.',
    content: 'Follow AAP guidelines: back sleeping, firm mattress, no loose bedding, room sharing without bed sharing, and smoke-free environment.',
    category: 'Sleep Environment',
    ageGroup: '0-12 months',
    readTime: '5 min read',
    lastUpdated: '2024-01-30',
    tags: ['safety', 'SIDS prevention', 'AAP guidelines']
  },
  {
    id: 'daylight-saving-adjustment',
    title: 'Adjusting to Daylight Saving Time',
    excerpt: 'Help your baby adapt to time changes with minimal disruption.',
    content: 'Gradual schedule adjustments and light exposure strategies to help your family transition smoothly through time changes.',
    category: 'Sleep Environment',
    ageGroup: 'All ages',
    readTime: '4 min read',
    lastUpdated: '2024-01-08',
    tags: ['daylight saving', 'schedule adjustment', 'light exposure']
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
  const [selectedArticleCategory, setSelectedArticleCategory] = useState<string>('all');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('all');

  const categories = ['all', 'White Noise', 'Lullabies', 'Nature Sounds', 'Ambient'];
  const timerOptions = [
    { label: '15 minutes', value: '15' },
    { label: '30 minutes', value: '30' },
    { label: '45 minutes', value: '45' },
    { label: '60 minutes', value: '60' },
    { label: '90 minutes', value: '90' },
    { label: '2 hours', value: '120' },
  ];

  const articleCategories = ['all', 'Sleep Development', 'Sleep Training', 'Sleep Environment'];
  const ageGroups = ['all', '0-3 months', '3-6 months', '4-12 months', '6-24 months', '12+ months', 'All ages'];

  const filteredTracks = selectedCategory === 'all' 
    ? audioTracks 
    : audioTracks.filter(track => track.category === selectedCategory);

  const filteredArticles = articles.filter(article => {
    const categoryMatch = selectedArticleCategory === 'all' || article.category === selectedArticleCategory;
    const ageMatch = selectedAgeGroup === 'all' || article.ageGroup === selectedAgeGroup;
    return categoryMatch && ageMatch;
  });

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

          {/* Sleep Guides & Articles Section */}
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Sleep Guides & Articles
              </CardTitle>
              <CardDescription>
                Science-backed information and step-by-step guides to help your baby sleep better
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Article Filters */}
              <div className="space-y-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <div className="flex gap-2 flex-wrap">
                      {articleCategories.map(category => (
                        <Button
                          key={category}
                          variant={selectedArticleCategory === category ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedArticleCategory(category)}
                        >
                          {category === 'all' ? 'All Topics' : category}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">Age Group</label>
                    <div className="flex gap-2 flex-wrap">
                      {ageGroups.map(ageGroup => (
                        <Button
                          key={ageGroup}
                          variant={selectedAgeGroup === ageGroup ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedAgeGroup(ageGroup)}
                        >
                          {ageGroup === 'all' ? 'All Ages' : ageGroup}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Articles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredArticles.map(article => (
                  <Card key={article.id} className="bg-white border hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="secondary" className="text-xs">{article.category}</Badge>
                        <Badge variant="outline" className="text-xs">{article.ageGroup}</Badge>
                      </div>
                      <CardTitle className="text-base leading-tight">{article.title}</CardTitle>
                      <CardDescription className="text-sm line-clamp-2">{article.excerpt}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {article.readTime}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Updated {new Date(article.lastUpdated).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex gap-1 flex-wrap mb-3">
                        {article.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs px-2 py-1">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        Read Article
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredArticles.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No articles found for the selected filters.</p>
                  <p className="text-sm">Try adjusting your category or age group selection.</p>
                </div>
              )}
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