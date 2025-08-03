import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Moon, 
  Clock, 
  TrendingUp, 
  Calendar, 
  Baby, 
  Activity,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface SleepData {
  date: string;
  totalSleep: number;
  nightWakings: number;
  bedtime: string;
  wakeTime: string;
}

interface FeedingData {
  date: string;
  frequency: number;
  avgDuration: number;
  totalAmount: number;
}

interface ActivityData {
  id: string;
  activity_type: string;
  start_time: string;
  end_time: string | null;
  duration: number | null;
  sleep_type: string | null;
  feeding_type: string | null;
  feeding_amount: number | null;
  created_at: string;
}

interface ExpertTipsProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExpertTips = ({ isOpen, onClose }: ExpertTipsProps) => {
  const { user } = useAuth();
  const [sleepData, setSleepData] = useState<SleepData[]>([]);
  const [feedingData, setFeedingData] = useState<FeedingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(0);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];

  useEffect(() => {
    if (isOpen && user) {
      fetchAnalyticsData();
    }
  }, [isOpen, user]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch activity logs from the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: activities, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user?.id)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      processSleepData(activities || []);
      processFeedingData(activities || []);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const processSleepData = (activities: ActivityData[]) => {
    const sleepActivities = activities.filter(a => a.activity_type === 'sleep');
    const dailyData: { [key: string]: SleepData } = {};

    sleepActivities.forEach(activity => {
      const date = new Date(activity.created_at).toISOString().split('T')[0];
      
      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          totalSleep: 0,
          nightWakings: 0,
          bedtime: '',
          wakeTime: ''
        };
      }

      if (activity.duration) {
        dailyData[date].totalSleep += activity.duration;
      }

      // Count night wakings (sleep sessions between 10 PM and 6 AM)
      const hour = new Date(activity.start_time || activity.created_at).getHours();
      if ((hour >= 22 || hour <= 6) && activity.sleep_type !== 'nap') {
        dailyData[date].nightWakings += 1;
      }
    });

    setSleepData(Object.values(dailyData).slice(-14)); // Last 14 days
  };

  const processFeedingData = (activities: ActivityData[]) => {
    const feedingActivities = activities.filter(a => a.activity_type === 'feeding');
    const dailyData: { [key: string]: FeedingData } = {};

    feedingActivities.forEach(activity => {
      const date = new Date(activity.created_at).toISOString().split('T')[0];
      
      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          frequency: 0,
          avgDuration: 0,
          totalAmount: 0
        };
      }

      dailyData[date].frequency += 1;
      if (activity.duration) {
        dailyData[date].avgDuration = (dailyData[date].avgDuration + activity.duration) / dailyData[date].frequency;
      }
      if (activity.feeding_amount) {
        dailyData[date].totalAmount += activity.feeding_amount;
      }
    });

    setFeedingData(Object.values(dailyData).slice(-14)); // Last 14 days
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getAverageSleep = () => {
    if (sleepData.length === 0) return 0;
    return sleepData.reduce((sum, day) => sum + day.totalSleep, 0) / sleepData.length;
  };

  const getAverageWakings = () => {
    if (sleepData.length === 0) return 0;
    return sleepData.reduce((sum, day) => sum + day.nightWakings, 0) / sleepData.length;
  };

  const getSleepTrend = () => {
    if (sleepData.length < 7) return 'neutral';
    const firstWeek = sleepData.slice(0, 7).reduce((sum, day) => sum + day.totalSleep, 0) / 7;
    const lastWeek = sleepData.slice(-7).reduce((sum, day) => sum + day.totalSleep, 0) / 7;
    
    if (lastWeek > firstWeek + 30) return 'improving';
    if (lastWeek < firstWeek - 30) return 'declining';
    return 'stable';
  };

  const getExpertTips = () => {
    const avgSleep = getAverageSleep();
    const avgWakings = getAverageWakings();
    const trend = getSleepTrend();
    
    const tips = [];
    
    if (avgSleep < 480) { // Less than 8 hours
      tips.push({
        title: "Increase Total Sleep Time",
        description: "Your baby is getting less sleep than recommended. Consider earlier bedtimes or longer naps.",
        priority: "high"
      });
    }
    
    if (avgWakings > 3) {
      tips.push({
        title: "Reduce Night Wakings",
        description: "Multiple night wakings detected. Try implementing gentle sleep training techniques.",
        priority: "medium"
      });
    }
    
    if (trend === 'improving') {
      tips.push({
        title: "Great Progress!",
        description: "Sleep patterns are improving. Keep up the current routine.",
        priority: "low"
      });
    }
    
    return tips;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <div>
            <CardTitle className="text-2xl">Expert Tips & Analytics</CardTitle>
            <CardDescription>Personalized insights based on your baby's sleep and feeding patterns</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="sleep">Sleep Patterns</TabsTrigger>
                <TabsTrigger value="feeding">Feeding Trends</TabsTrigger>
                <TabsTrigger value="tips">Expert Tips</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Key Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Avg Sleep/Day</p>
                          <p className="text-2xl font-bold">{formatTime(Math.round(getAverageSleep()))}</p>
                        </div>
                        <Moon className="h-8 w-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Night Wakings</p>
                          <p className="text-2xl font-bold">{Math.round(getAverageWakings() * 10) / 10}</p>
                        </div>
                        <Activity className="h-8 w-8 text-orange-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Sleep Trend</p>
                          <Badge variant={getSleepTrend() === 'improving' ? 'default' : getSleepTrend() === 'declining' ? 'destructive' : 'secondary'}>
                            {getSleepTrend()}
                          </Badge>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Data Points</p>
                          <p className="text-2xl font-bold">{sleepData.length + feedingData.length}</p>
                        </div>
                        <Calendar className="h-8 w-8 text-purple-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sleep Overview Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Sleep Duration Trend (Last 14 Days)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={sleepData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={formatDate} />
                        <YAxis tickFormatter={(value) => formatTime(value)} />
                        <Tooltip 
                          labelFormatter={(value) => `Date: ${formatDate(value)}`}
                          formatter={(value: number) => [formatTime(value), 'Sleep Duration']}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="totalSleep" 
                          stroke="#8884d8" 
                          fill="#8884d8" 
                          fillOpacity={0.6}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sleep" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Sleep Duration Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Daily Sleep Duration</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={sleepData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" tickFormatter={formatDate} />
                          <YAxis tickFormatter={(value) => formatTime(value)} />
                          <Tooltip 
                            labelFormatter={(value) => `Date: ${formatDate(value)}`}
                            formatter={(value: number) => [formatTime(value), 'Sleep Duration']}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="totalSleep" 
                            stroke="#8884d8" 
                            strokeWidth={2}
                            dot={{ fill: '#8884d8' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Night Wakings Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Night Wakings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={sleepData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" tickFormatter={formatDate} />
                          <YAxis />
                          <Tooltip 
                            labelFormatter={(value) => `Date: ${formatDate(value)}`}
                            formatter={(value: number) => [value, 'Night Wakings']}
                          />
                          <Bar dataKey="nightWakings" fill="#ff7300" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="feeding" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Feeding Frequency */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Daily Feeding Frequency</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={feedingData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" tickFormatter={formatDate} />
                          <YAxis />
                          <Tooltip 
                            labelFormatter={(value) => `Date: ${formatDate(value)}`}
                            formatter={(value: number) => [value, 'Feedings']}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="frequency" 
                            stroke="#82ca9d" 
                            strokeWidth={2}
                            dot={{ fill: '#82ca9d' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Average Duration */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Average Feeding Duration</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={feedingData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" tickFormatter={formatDate} />
                          <YAxis tickFormatter={(value) => `${value}m`} />
                          <Tooltip 
                            labelFormatter={(value) => `Date: ${formatDate(value)}`}
                            formatter={(value: number) => [`${Math.round(value)}m`, 'Avg Duration']}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="avgDuration" 
                            stroke="#ffc658" 
                            fill="#ffc658" 
                            fillOpacity={0.6}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="tips" className="space-y-6">
                <div className="space-y-4">
                  {getExpertTips().map((tip, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <Badge 
                            variant={
                              tip.priority === 'high' ? 'destructive' : 
                              tip.priority === 'medium' ? 'default' : 
                              'secondary'
                            }
                          >
                            {tip.priority} priority
                          </Badge>
                          <div className="flex-1">
                            <h3 className="font-semibold mb-2">{tip.title}</h3>
                            <p className="text-muted-foreground">{tip.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {getExpertTips().length === 0 && (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Baby className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="font-semibold mb-2">Great Job!</h3>
                          <p className="text-muted-foreground">
                            Your baby's sleep patterns look healthy. Keep up the good work with consistent routines!
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpertTips;