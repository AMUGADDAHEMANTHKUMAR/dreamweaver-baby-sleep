import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Clock, Moon, Sun } from 'lucide-react';

const formSchema = z.object({
  babyAgeMonths: z.string().min(1, "Please select baby's age"),
  currentBedtime: z.string().min(1, "Please enter current bedtime"),
  currentWakeTime: z.string().min(1, "Please enter current wake time"),
  napHabits: z.string().min(1, "Please describe current nap habits"),
  sleepChallenges: z.string().optional(),
});

// Age-appropriate wake windows and sleep recommendations
const sleepRecommendations = {
  '0-2': {
    totalSleep: '14-17 hours',
    napCount: '6-8 short naps',
    wakeWindows: '45-60 minutes',
    schedule: [
      { time: '7:00 AM', activity: 'Wake up & feed' },
      { time: '8:00 AM', activity: 'Nap 1 (30-45 min)' },
      { time: '9:30 AM', activity: 'Feed & play' },
      { time: '10:30 AM', activity: 'Nap 2 (45-60 min)' },
      { time: '12:00 PM', activity: 'Feed & play' },
      { time: '1:00 PM', activity: 'Nap 3 (60-90 min)' },
      { time: '3:00 PM', activity: 'Feed & play' },
      { time: '4:00 PM', activity: 'Nap 4 (30-45 min)' },
      { time: '5:30 PM', activity: 'Feed & bath routine' },
      { time: '7:00 PM', activity: 'Final feed & bedtime' },
    ]
  },
  '3-4': {
    totalSleep: '12-15 hours',
    napCount: '4-5 naps',
    wakeWindows: '1-1.5 hours',
    schedule: [
      { time: '7:00 AM', activity: 'Wake up & feed' },
      { time: '8:15 AM', activity: 'Nap 1 (45-60 min)' },
      { time: '10:00 AM', activity: 'Feed & play' },
      { time: '11:30 AM', activity: 'Nap 2 (60-90 min)' },
      { time: '1:30 PM', activity: 'Feed & play' },
      { time: '3:00 PM', activity: 'Nap 3 (45-60 min)' },
      { time: '4:30 PM', activity: 'Feed & play' },
      { time: '6:00 PM', activity: 'Short catnap (20-30 min)' },
      { time: '7:00 PM', activity: 'Bath & bedtime routine' },
      { time: '7:30 PM', activity: 'Final feed & sleep' },
    ]
  },
  '5-6': {
    totalSleep: '12-14 hours',
    napCount: '3-4 naps',
    wakeWindows: '1.5-2.5 hours',
    schedule: [
      { time: '7:00 AM', activity: 'Wake up & feed' },
      { time: '9:00 AM', activity: 'Nap 1 (60-90 min)' },
      { time: '11:00 AM', activity: 'Feed & play' },
      { time: '1:00 PM', activity: 'Nap 2 (60-90 min)' },
      { time: '3:00 PM', activity: 'Feed & play' },
      { time: '5:00 PM', activity: 'Nap 3 (30-45 min)' },
      { time: '6:30 PM', activity: 'Bath & dinner' },
      { time: '7:30 PM', activity: 'Bedtime routine & sleep' },
    ]
  },
  '7-12': {
    totalSleep: '12-14 hours',
    napCount: '2 naps',
    wakeWindows: '2.5-3.5 hours',
    schedule: [
      { time: '7:00 AM', activity: 'Wake up & breakfast' },
      { time: '10:00 AM', activity: 'Morning nap (60-90 min)' },
      { time: '12:00 PM', activity: 'Lunch & play' },
      { time: '2:30 PM', activity: 'Afternoon nap (60-90 min)' },
      { time: '4:30 PM', activity: 'Snack & play' },
      { time: '6:30 PM', activity: 'Dinner & bath' },
      { time: '7:30 PM', activity: 'Bedtime routine & sleep' },
    ]
  },
  '13-18': {
    totalSleep: '11-14 hours',
    napCount: '1 nap',
    wakeWindows: '4-6 hours',
    schedule: [
      { time: '7:00 AM', activity: 'Wake up & breakfast' },
      { time: '12:00 PM', activity: 'Lunch' },
      { time: '1:00 PM', activity: 'Afternoon nap (90-120 min)' },
      { time: '3:30 PM', activity: 'Snack & play' },
      { time: '6:00 PM', activity: 'Dinner' },
      { time: '7:00 PM', activity: 'Bath & bedtime routine' },
      { time: '7:30 PM', activity: 'Bedtime' },
    ]
  }
};

const BedtimeRoutine = () => {
  const navigate = useNavigate();
  const [showSchedule, setShowSchedule] = useState(false);
  const [recommendedSchedule, setRecommendedSchedule] = useState<any>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      babyAgeMonths: '',
      currentBedtime: '',
      currentWakeTime: '',
      napHabits: '',
      sleepChallenges: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const ageRange = getAgeRange(values.babyAgeMonths);
    const schedule = sleepRecommendations[ageRange];
    setRecommendedSchedule({ ...schedule, ageRange, formData: values });
    setShowSchedule(true);
  };

  const getAgeRange = (ageString: string): keyof typeof sleepRecommendations => {
    const age = parseInt(ageString);
    if (age <= 2) return '0-2';
    if (age <= 4) return '3-4';
    if (age <= 6) return '5-6';
    if (age <= 12) return '7-12';
    return '13-18';
  };

  if (showSchedule && recommendedSchedule) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-soft-blue to-gentle-lavender">
        <header className="bg-white/80 backdrop-blur-md border-b border-border/50">
          <div className="container mx-auto px-4 h-16 flex items-center">
            <Button variant="ghost" onClick={() => setShowSchedule(false)} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Setup
            </Button>
            <h1 className="text-xl font-semibold">Your Personalized Sleep Schedule</h1>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Wake Windows
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{recommendedSchedule.wakeWindows}</div>
                  <p className="text-xs text-muted-foreground">Optimal awake time between sleeps</p>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    Daily Sleep
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{recommendedSchedule.totalSleep}</div>
                  <p className="text-xs text-muted-foreground">Total sleep in 24 hours</p>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    Naps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{recommendedSchedule.napCount}</div>
                  <p className="text-xs text-muted-foreground">Age-appropriate nap frequency</p>
                </CardContent>
              </Card>
            </div>

            {/* Daily Schedule */}
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Recommended Daily Schedule</CardTitle>
                <CardDescription>
                  Based on your baby's age ({recommendedSchedule.ageRange} months) and biologically appropriate wake windows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recommendedSchedule.schedule.map((item: any, index: number) => (
                    <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                      <Badge variant="outline" className="min-w-[80px] text-center">
                        {item.time}
                      </Badge>
                      <span className="text-sm">{item.activity}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Getting Started Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <p><strong>Gradual Implementation:</strong> Adjust your current routine slowly, moving bedtime by 15 minutes every few days.</p>
                  <p><strong>Watch Wake Windows:</strong> Put baby down for sleep before they become overtired to ensure easier settling.</p>
                  <p><strong>Consistency:</strong> Try to maintain the same routine every day, even on weekends.</p>
                  <p><strong>Environment:</strong> Keep the sleep environment dark, cool, and quiet for optimal rest.</p>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button onClick={() => navigate('/dashboard')} className="flex-1">
                Save to Dashboard
              </Button>
              <Button variant="outline" onClick={() => navigate('/activity-tracker')} className="flex-1">
                Start Tracking
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-soft-blue to-gentle-lavender">
      <header className="bg-white/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-xl font-semibold">Setup Bedtime Routine</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Create Your Personalized Sleep Schedule</CardTitle>
              <CardDescription>
                Tell us about your baby's current sleep habits and we'll create a biologically appropriate schedule
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="babyAgeMonths"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Baby's Age</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select age in months" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0">0-1 months</SelectItem>
                            <SelectItem value="2">2 months</SelectItem>
                            <SelectItem value="3">3 months</SelectItem>
                            <SelectItem value="4">4 months</SelectItem>
                            <SelectItem value="5">5 months</SelectItem>
                            <SelectItem value="6">6 months</SelectItem>
                            <SelectItem value="7">7 months</SelectItem>
                            <SelectItem value="8">8 months</SelectItem>
                            <SelectItem value="9">9 months</SelectItem>
                            <SelectItem value="10">10 months</SelectItem>
                            <SelectItem value="11">11 months</SelectItem>
                            <SelectItem value="12">12 months</SelectItem>
                            <SelectItem value="15">13-15 months</SelectItem>
                            <SelectItem value="18">16-18 months</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Age helps us determine appropriate wake windows and nap schedules
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="currentBedtime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Bedtime</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormDescription>When does baby usually go to sleep?</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="currentWakeTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Wake Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormDescription>When does baby usually wake up?</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="napHabits"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Nap Habits</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your baby's current napping pattern (how many naps, duration, times, etc.)"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Help us understand your baby's current daytime sleep patterns
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sleepChallenges"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sleep Challenges (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any specific sleep challenges or goals? (e.g., frequent night wakings, short naps, difficulty falling asleep)"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          This helps us provide more targeted recommendations
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full">
                    Generate My Baby's Sleep Schedule
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default BedtimeRoutine;