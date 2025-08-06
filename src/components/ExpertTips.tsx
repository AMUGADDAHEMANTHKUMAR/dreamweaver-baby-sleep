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

      // More accurate sleep duration calculation
      if (activity.duration && activity.duration > 0) {
        dailyData[date].totalSleep += activity.duration;
      } else if (activity.start_time && activity.end_time) {
        // Calculate duration from start and end times
        const startTime = new Date(activity.start_time);
        const endTime = new Date(activity.end_time);
        const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
        if (durationMinutes > 0 && durationMinutes < 1440) { // Valid duration (less than 24 hours)
          dailyData[date].totalSleep += durationMinutes;
        }
      }

      // More accurate night waking calculation
      const startTime = new Date(activity.start_time || activity.created_at);
      const hour = startTime.getHours();
      
      // Count as night waking if:
      // 1. It's nighttime sleep (not nap)
      // 2. It's between 8 PM and 7 AM
      // 3. Duration is less than 4 hours (likely a waking, not full night sleep)
      if (activity.sleep_type === 'nighttime' && 
          (hour >= 20 || hour <= 7) && 
          (!activity.duration || activity.duration < 240)) {
        dailyData[date].nightWakings += 1;
      }

      // Track bedtime and wake time more accurately
      if (activity.sleep_type === 'nighttime') {
        const startHour = new Date(activity.start_time || activity.created_at).getHours();
        const endHour = activity.end_time ? new Date(activity.end_time).getHours() : null;
        
        // Bedtime: evening sleep start (between 6 PM and 11 PM)
        if (startHour >= 18 && startHour <= 23 && (!dailyData[date].bedtime || startHour < parseInt(dailyData[date].bedtime))) {
          dailyData[date].bedtime = startTime.toTimeString().slice(0, 5);
        }
        
        // Wake time: morning sleep end (between 5 AM and 10 AM)
        if (endHour && endHour >= 5 && endHour <= 10 && (!dailyData[date].wakeTime || endHour > parseInt(dailyData[date].wakeTime))) {
          dailyData[date].wakeTime = new Date(activity.end_time!).toTimeString().slice(0, 5);
        }
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
      
      // More accurate duration calculation
      if (activity.duration && activity.duration > 0) {
        // Running average calculation
        const currentAvg = dailyData[date].avgDuration;
        const currentCount = dailyData[date].frequency;
        dailyData[date].avgDuration = ((currentAvg * (currentCount - 1)) + activity.duration) / currentCount;
      } else if (activity.start_time && activity.end_time) {
        // Calculate duration from timestamps
        const startTime = new Date(activity.start_time);
        const endTime = new Date(activity.end_time);
        const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
        if (durationMinutes > 0 && durationMinutes < 120) { // Valid feeding duration (less than 2 hours)
          const currentAvg = dailyData[date].avgDuration;
          const currentCount = dailyData[date].frequency;
          dailyData[date].avgDuration = ((currentAvg * (currentCount - 1)) + durationMinutes) / currentCount;
        }
      }
      
      // Accurate amount tracking
      if (activity.feeding_amount && activity.feeding_amount > 0) {
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
    const avgFeedings = feedingData.length > 0 ? feedingData.reduce((sum, day) => sum + day.frequency, 0) / feedingData.length : 0;
    
    const tips = [];
    
    // Age-appropriate sleep recommendations
    if (avgSleep < 600 && avgSleep > 0) { // Less than 10 hours (adjust based on age)
      tips.push({
        title: "Optimize Sleep Duration",
        description: `Current average: ${formatTime(Math.round(avgSleep))}. Most babies need 11-14 hours of sleep per day. Consider adjusting nap schedules or bedtime routine.`,
        priority: "high"
      });
    }
    
    if (avgWakings > 2.5) {
      tips.push({
        title: "Reduce Night Wakings",
        description: `Average ${Math.round(avgWakings * 10) / 10} wakings per night. This may indicate hunger, discomfort, or sleep associations. Consider gentle sleep training or environmental adjustments.`,
        priority: "medium"
      });
    }
    
    if (avgFeedings > 12) {
      tips.push({
        title: "Monitor Feeding Frequency", 
        description: `High feeding frequency (${Math.round(avgFeedings)} per day) may indicate growth spurts or insufficient intake per feeding. Consult your pediatrician if concerned.`,
        priority: "medium"
      });
    } else if (avgFeedings < 6 && avgFeedings > 0) {
      tips.push({
        title: "Feeding Frequency Check",
        description: `Lower feeding frequency (${Math.round(avgFeedings)} per day). Ensure baby is getting adequate nutrition. Monitor weight gain and consult pediatrician.`,
        priority: "medium"
      });
    }
    
    if (trend === 'improving') {
      tips.push({
        title: "Excellent Progress!",
        description: "Sleep patterns are improving consistently. Your current routine is working well - maintain consistency for continued success.",
        priority: "low"
      });
    } else if (trend === 'declining') {
      tips.push({
        title: "Sleep Pattern Concerns",
        description: "Sleep duration has been decreasing. Consider reviewing recent changes in routine, environment, or developmental milestones that might be affecting sleep.",
        priority: "high"
      });
    }
    
    // Add age-specific tips based on data patterns
    if (sleepData.length > 7) {
      const recentWakings = sleepData.slice(-7).reduce((sum, day) => sum + day.nightWakings, 0) / 7;
      const earlierWakings = sleepData.slice(0, 7).reduce((sum, day) => sum + day.nightWakings, 0) / 7;
      
      if (recentWakings > earlierWakings + 1) {
        tips.push({
          title: "Sleep Regression Alert",
          description: "Recent increase in night wakings may indicate a sleep regression, growth spurt, or developmental leap. These are temporary phases.",
          priority: "medium"
        });
      }
    }
    
    if (tips.length === 0) {
      tips.push({
        title: "Healthy Sleep Patterns",
        description: "Your baby's sleep and feeding patterns look healthy! Continue with your current routine and monitor for any changes.",
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