import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Moon, Milk, Baby, StickyNote, Clock, Plus } from 'lucide-react';

const ActivityTracker = () => {
  const [activeTab, setActiveTab] = useState('sleep');

  const SleepTracker = () => {
    const [sleepType, setSleepType] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="sleep-type">Sleep Type</Label>
            <Select value={sleepType} onValueChange={setSleepType}>
              <SelectTrigger>
                <SelectValue placeholder="Select sleep type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nap">Nap</SelectItem>
                <SelectItem value="nighttime">Nighttime Sleep</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-time">Start Time</Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end-time">End Time</Label>
              <Input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
          {startTime && endTime && (
            <div className="text-sm text-muted-foreground">
              Duration: {calculateDuration(startTime, endTime)}
            </div>
          )}
        </div>
        <Button className="w-full">
          <Moon className="mr-2 h-4 w-4" />
          Log Sleep
        </Button>
      </div>
    );
  };

  const FeedingTracker = () => {
    const [feedingType, setFeedingType] = useState('');
    const [amount, setAmount] = useState('');
    const [time, setTime] = useState('');

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="feeding-type">Feeding Type</Label>
            <Select value={feedingType} onValueChange={setFeedingType}>
              <SelectTrigger>
                <SelectValue placeholder="Select feeding type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nursing">Nursing</SelectItem>
                <SelectItem value="formula">Formula</SelectItem>
                <SelectItem value="bottle">Bottle (Breast Milk)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Amount {feedingType === 'nursing' ? '(minutes)' : '(oz/ml)'}</Label>
              <Input
                id="amount"
                type="number"
                placeholder={feedingType === 'nursing' ? 'Minutes' : 'Amount'}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="feeding-time">Time</Label>
              <Input
                id="feeding-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>
        </div>
        <Button className="w-full">
          <Milk className="mr-2 h-4 w-4" />
          Log Feeding
        </Button>
      </div>
    );
  };

  const DiaperTracker = () => {
    const [diaperType, setDiaperType] = useState('');
    const [time, setTime] = useState('');

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="diaper-type">Diaper Type</Label>
            <Select value={diaperType} onValueChange={setDiaperType}>
              <SelectTrigger>
                <SelectValue placeholder="Select diaper type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wet">Wet</SelectItem>
                <SelectItem value="dirty">Dirty</SelectItem>
                <SelectItem value="both">Both (Wet & Dirty)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="diaper-time">Time</Label>
            <Input
              id="diaper-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>
        <Button className="w-full">
          <Baby className="mr-2 h-4 w-4" />
          Log Diaper Change
        </Button>
      </div>
    );
  };

  const NotesTracker = () => {
    const [activityType, setActivityType] = useState('');
    const [time, setTime] = useState('');
    const [notes, setNotes] = useState('');

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="activity-type">Activity Type</Label>
            <Select value={activityType} onValueChange={setActivityType}>
              <SelectTrigger>
                <SelectValue placeholder="Select activity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tummy-time">Tummy Time</SelectItem>
                <SelectItem value="bath">Bath Time</SelectItem>
                <SelectItem value="play">Play Time</SelectItem>
                <SelectItem value="walk">Walk/Stroller</SelectItem>
                <SelectItem value="medicine">Medicine</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="activity-time">Time</Label>
            <Input
              id="activity-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <Button className="w-full">
          <StickyNote className="mr-2 h-4 w-4" />
          Log Activity
        </Button>
      </div>
    );
  };

  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return '';
    
    const startMinutes = timeToMinutes(start);
    const endMinutes = timeToMinutes(end);
    let duration = endMinutes - startMinutes;
    
    if (duration < 0) duration += 24 * 60; // Handle overnight sleep
    
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    
    return `${hours}h ${minutes}m`;
  };

  const timeToMinutes = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Track Baby Activities
        </CardTitle>
        <CardDescription>Log sleep, feeding, diaper changes, and daily activities</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sleep" className="text-xs">
              <Moon className="h-4 w-4 mr-1" />
              Sleep
            </TabsTrigger>
            <TabsTrigger value="feeding" className="text-xs">
              <Milk className="h-4 w-4 mr-1" />
              Feeding
            </TabsTrigger>
            <TabsTrigger value="diaper" className="text-xs">
              <Baby className="h-4 w-4 mr-1" />
              Diaper
            </TabsTrigger>
            <TabsTrigger value="notes" className="text-xs">
              <StickyNote className="h-4 w-4 mr-1" />
              Activities
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="sleep" className="mt-6">
            <SleepTracker />
          </TabsContent>
          
          <TabsContent value="feeding" className="mt-6">
            <FeedingTracker />
          </TabsContent>
          
          <TabsContent value="diaper" className="mt-6">
            <DiaperTracker />
          </TabsContent>
          
          <TabsContent value="notes" className="mt-6">
            <NotesTracker />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ActivityTracker;