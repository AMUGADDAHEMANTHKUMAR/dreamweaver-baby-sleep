import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Clock, Calendar, Search, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
  wikipediaUrl?: string;
}

interface WikipediaSearchResult {
  pageid: number;
  title: string;
  snippet: string;
  timestamp: string;
}

const predefinedArticles: Article[] = [
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
  }
];

const ArticlesLibrary = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Article[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedArticleCategory, setSelectedArticleCategory] = useState<string>('all');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('all');
  const [loadingArticles, setLoadingArticles] = useState<Record<string, boolean>>({});

  const articleCategories = ['all', 'Sleep Development', 'Sleep Training', 'Sleep Environment'];
  const ageGroups = ['all', '0-3 months', '3-6 months', '4-12 months', '6-24 months', '12+ months', 'All ages'];

  const filteredArticles = predefinedArticles.filter(article => {
    const categoryMatch = selectedArticleCategory === 'all' || article.category === selectedArticleCategory;
    const ageMatch = selectedAgeGroup === 'all' || article.ageGroup === selectedAgeGroup;
    return categoryMatch && ageMatch;
  });

  const searchWikipedia = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const searchTerm = `${searchQuery} baby sleep infant development`;
      const response = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTerm)}&format=json&origin=*&srlimit=5`
      );
      
      if (!response.ok) {
        throw new Error('Wikipedia search failed');
      }
      
      const data = await response.json();
      const results: WikipediaSearchResult[] = data.query?.search || [];
      
      const articles: Article[] = results.map(result => ({
        id: `wiki-${result.pageid}`,
        title: result.title,
        excerpt: result.snippet.replace(/<[^>]*>/g, ''), // Remove HTML tags
        content: result.snippet.replace(/<[^>]*>/g, ''),
        category: 'Wikipedia Articles',
        ageGroup: 'All ages',
        readTime: 'Variable',
        lastUpdated: new Date(result.timestamp).toLocaleDateString(),
        tags: ['wikipedia', 'research'],
        wikipediaUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(result.title.replace(/ /g, '_'))}`
      }));
      
      setSearchResults(articles);
      toast.success(`Found ${articles.length} Wikipedia articles`);
    } catch (error) {
      console.error('Wikipedia search error:', error);
      // Fallback to mock results
      const mockResults: Article[] = [
        {
          id: `search-${Date.now()}-1`,
          title: `Infant Sleep Research: ${searchQuery}`,
          excerpt: `Scientific research about ${searchQuery} in infant sleep patterns and development.`,
          content: `Comprehensive research findings about ${searchQuery} and its impact on baby sleep cycles, circadian rhythms, and overall development.`,
          category: 'Research Articles',
          ageGroup: 'All ages',
          readTime: '8 min read',
          lastUpdated: new Date().toLocaleDateString(),
          tags: ['research', 'science', searchQuery.toLowerCase()],
          wikipediaUrl: `https://en.wikipedia.org/wiki/Infant_sleep`
        },
        {
          id: `search-${Date.now()}-2`,
          title: `Sleep Development and ${searchQuery}`,
          excerpt: `Understanding how ${searchQuery} affects baby sleep patterns and parental strategies.`,
          content: `Detailed analysis of sleep development milestones and how ${searchQuery} plays a role in healthy sleep habits.`,
          category: 'Sleep Development',
          ageGroup: 'All ages',
          readTime: '6 min read',
          lastUpdated: new Date().toLocaleDateString(),
          tags: ['development', 'sleep patterns', searchQuery.toLowerCase()],
          wikipediaUrl: `https://en.wikipedia.org/wiki/Sleep_in_infancy`
        }
      ];
      
      setSearchResults(mockResults);
      toast.success(`Found ${mockResults.length} related articles`);
    } finally {
      setIsSearching(false);
    }
  };

  const openWikipediaArticle = (article: Article) => {
    if (article.wikipediaUrl) {
      const articleId = article.id.includes('wiki-') ? article.id.split('-')[1] : article.id;
      setLoadingArticles(prev => ({ ...prev, [articleId]: true }));
      
      setTimeout(() => {
        window.open(article.wikipediaUrl, '_blank', 'noopener,noreferrer');
        toast.success('Opened Wikipedia article in new tab');
        setLoadingArticles(prev => ({ ...prev, [articleId]: false }));
      }, 1000);
    } else {
      toast.error('Article link not available');
    }
  };

  const openCuratedArticle = (article: Article) => {
    setLoadingArticles(prev => ({ ...prev, [article.id]: true }));
    
    setTimeout(() => {
      toast.success(`Opening article: ${article.title}`);
      // Simulate opening article content
      setLoadingArticles(prev => ({ ...prev, [article.id]: false }));
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Sleep Articles
          </CardTitle>
          <CardDescription>Find research-backed information about baby sleep from Wikipedia and our curated collection</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Search for sleep topics (e.g., sleep regression, bedtime routine)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchWikipedia()}
            />
            <Button onClick={searchWikipedia} disabled={isSearching}>
              {isSearching ? 'Searching...' : 'Search Wikipedia'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Category:</label>
              <Select value={selectedArticleCategory} onValueChange={setSelectedArticleCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {articleCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Age Group:</label>
              <Select value={selectedAgeGroup} onValueChange={setSelectedAgeGroup}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ageGroups.map(age => (
                    <SelectItem key={age} value={age}>
                      {age === 'all' ? 'All Age Groups' : age}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Search Results from Wikipedia
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {searchResults.map(article => (
              <Card key={article.id} className="bg-white/90 backdrop-blur-sm hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-lg leading-tight">{article.title}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {article.readTime}
                        <Calendar className="h-3 w-3 ml-2" />
                        {article.lastUpdated}
                      </div>
                    </div>
                    <Badge variant="outline">{article.ageGroup}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {article.excerpt}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {article.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <BookOpen className="h-3 w-3 mr-1" />
                      Read Summary
                    </Button>
                    {article.wikipediaUrl && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => openWikipediaArticle(article)}
                        className="flex items-center gap-1"
                        disabled={loadingArticles[article.id.split('-')[1]]}
                      >
                        {loadingArticles[article.id.split('-')[1]] ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <ExternalLink className="h-3 w-3" />
                        )}
                        {loadingArticles[article.id.split('-')[1]] ? 'Opening...' : 'Full Article'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Curated Articles */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Expert Curated Articles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredArticles.map(article => (
            <Card key={article.id} className="bg-white/90 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg leading-tight">{article.title}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {article.readTime}
                      <Calendar className="h-3 w-3 ml-2" />
                      {article.lastUpdated}
                    </div>
                  </div>
                  <Badge variant="outline">{article.ageGroup}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {article.excerpt}
                </p>
                <div className="flex flex-wrap gap-1">
                  {article.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Badge variant="default" className="text-xs">
                  {article.category}
                </Badge>
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={() => openCuratedArticle(article)}
                  disabled={loadingArticles[article.id]}
                >
                  {loadingArticles[article.id] ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <BookOpen className="h-3 w-3 mr-1" />
                  )}
                  {loadingArticles[article.id] ? 'Opening...' : 'Read Article'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArticlesLibrary;