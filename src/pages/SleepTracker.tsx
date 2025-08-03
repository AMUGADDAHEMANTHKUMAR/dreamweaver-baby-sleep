import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Moon, Utensils, Baby, Plus, Edit, Trash2, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ActivityLog {
  id: string;
  activity_type: string;
  start_time: string;
  end_time?: string;
  duration?: number;
  sleep_type?: string;
  sleep_location?: string;
  feeding_type?: string;
  feeding_amount?: number;
  diaper_type?: string;
  notes?: string;
  created_at: string;
}

const SleepTracker = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingLog, setEditingLog] = useState<ActivityLog | null>(null);
  const [activeTab, setActiveTab] = useState('sleep');

  // Form states
  const [sleepForm, setSleepForm] = useState({
    start_time: '',
    end_time: '',
    sleep_type: 'nap',
    sleep_location: 'bed',
    notes: ''
  });

  const [feedingForm, setFeedingForm] = useState({
    time: '',
    type: '',
    amount: '',
    notes: ''
  });

  const [diaperForm, setDiaperForm] = useState({
    time: '',
    type: '',
    notes: ''
  });

  const [customForm, setCustomForm] = useState({
    activity: '',
    time: '',
    duration: '',
    notes: ''
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-soft-blue to-gentle-lavender flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch activity logs",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDuration = (start: string, end: string) => {
    const startTime = new Date(start);
    const endTime = new Date(end);
    return Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)); // minutes
  };

  const handleSleepSubmit = async () => {
    if (!sleepForm.start_time || !sleepForm.end_time) {
      toast({
        title: "Error",
        description: "Please fill in both start and end times",
        variant: "destructive"
      });
      return;
    }

    const duration = calculateDuration(sleepForm.start_time, sleepForm.end_time);

    try {
      const { error } = await supabase.from('activity_logs').insert({
        user_id: user.id,
        activity_type: 'sleep',
        start_time: sleepForm.start_time,
        end_time: sleepForm.end_time,
        duration,
        sleep_type: sleepForm.sleep_type,
        sleep_location: sleepForm.sleep_location,
        notes: sleepForm.notes
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Sleep log added successfully"
      });

      setSleepForm({ start_time: '', end_time: '', sleep_type: 'nap', sleep_location: 'bed', notes: '' });
      fetchLogs();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add sleep log",
        variant: "destructive"
      });
    }
  };

  const handleFeedingSubmit = async () => {
    if (!feedingForm.time || !feedingForm.type) {
      toast({
        title: "Error",
        description: "Please fill in time and feeding type",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase.from('activity_logs').insert({
        user_id: user.id,
        activity_type: 'feeding',
        start_time: feedingForm.time,
        feeding_type: feedingForm.type,
        feeding_amount: feedingForm.amount ? parseInt(feedingForm.amount) : null,
        notes: feedingForm.notes
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Feeding log added successfully"
      });

      setFeedingForm({ time: '', type: '', amount: '', notes: '' });
      fetchLogs();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add feeding log",
        variant: "destructive"
      });
    }
  };

  const handleDiaperSubmit = async () => {
    if (!diaperForm.time || !diaperForm.type) {
      toast({
        title: "Error",
        description: "Please fill in time and diaper type",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase.from('activity_logs').insert({
        user_id: user.id,
        activity_type: 'diaper',
        start_time: diaperForm.time,
        diaper_type: diaperForm.type,
        notes: diaperForm.notes
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Diaper log added successfully"
      });

      setDiaperForm({ time: '', type: '', notes: '' });
      fetchLogs();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add diaper log",
        variant: "destructive"
      });
    }
  };

  const handleCustomSubmit = async () => {
    if (!customForm.activity || !customForm.time) {
      toast({
        title: "Error",
        description: "Please fill in activity and time",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase.from('activity_logs').insert({
        user_id: user.id,
        activity_type: 'custom',
        start_time: customForm.time,
        duration: customForm.duration ? parseInt(customForm.duration) : null,
        notes: `${customForm.activity}${customForm.notes ? ': ' + customForm.notes : ''}`
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Activity log added successfully"
      });

      setCustomForm({ activity: '', time: '', duration: '', notes: '' });
      fetchLogs();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add activity log",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (log: ActivityLog) => {
    setEditingLog(log);
    // Pre-populate edit form based on activity type
    if (log.activity_type === 'sleep') {
      setSleepForm({
        start_time: log.start_time ? new Date(log.start_time).toISOString().slice(0, 16) : '',
        end_time: log.end_time ? new Date(log.end_time).toISOString().slice(0, 16) : '',
        sleep_type: log.sleep_type || 'nap',
        sleep_location: log.sleep_location || 'bed',
        notes: log.notes || ''
      });
    }
    // Add similar logic for other activity types...
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('activity_logs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Log deleted successfully"
      });

      setDeleteId(null);
      fetchLogs();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete log",
        variant: "destructive"
      });
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString();
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'sleep': return <Moon className="h-5 w-5" />;
      case 'feeding': return <Utensils className="h-5 w-5" />;
      case 'diaper': return <Baby className="h-5 w-5" />;
      case 'custom': return <Plus className="h-5 w-5" />;
      default: return <Plus className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-soft-blue to-gentle-lavender">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-soft-blue to-gentle-lavender rounded-xl">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">Baby Activity Tracker</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="track" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="track">Log New Activity</TabsTrigger>
            <TabsTrigger value="history">Activity History</TabsTrigger>
          </TabsList>

          <TabsContent value="track" className="space-y-6">
            {/* Activity Type Selection */}
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Record New Activity</CardTitle>
                <CardDescription>Choose the type of activity to log</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <Button
                    variant={activeTab === 'sleep' ? 'default' : 'outline'}
                    className="h-20 flex-col"
                    onClick={() => setActiveTab('sleep')}
                  >
                    <Moon className="h-6 w-6 mb-2" />
                    Sleep
                  </Button>
                  <Button
                    variant={activeTab === 'feeding' ? 'default' : 'outline'}
                    className="h-20 flex-col"
                    onClick={() => setActiveTab('feeding')}
                  >
                    <Utensils className="h-6 w-6 mb-2" />
                    Feeding
                  </Button>
                  <Button
                    variant={activeTab === 'diaper' ? 'default' : 'outline'}
                    className="h-20 flex-col"
                    onClick={() => setActiveTab('diaper')}
                  >
                    <Baby className="h-6 w-6 mb-2" />
                    Diaper
                  </Button>
                  <Button
                    variant={activeTab === 'custom' ? 'default' : 'outline'}
                    className="h-20 flex-col"
                    onClick={() => setActiveTab('custom')}
                  >
                    <Plus className="h-6 w-6 mb-2" />
                    Custom
                  </Button>
                </div>

                {/* Sleep Form */}
                {activeTab === 'sleep' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sleep-start">Start Time</Label>
                        <Input
                          id="sleep-start"
                          type="datetime-local"
                          value={sleepForm.start_time}
                          onChange={(e) => setSleepForm(prev => ({ ...prev, start_time: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sleep-end">End Time</Label>
                        <Input
                          id="sleep-end"
                          type="datetime-local"
                          value={sleepForm.end_time}
                          onChange={(e) => setSleepForm(prev => ({ ...prev, end_time: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Sleep Type</Label>
                      <RadioGroup
                        value={sleepForm.sleep_type}
                        onValueChange={(value) => setSleepForm(prev => ({ ...prev, sleep_type: value }))}
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="nap" id="nap" />
                          <Label htmlFor="nap">Nap</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="nighttime" id="nighttime" />
                          <Label htmlFor="nighttime">Nighttime Sleep</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sleep-location">Sleep Location</Label>
                      <Input
                        id="sleep-location"
                        placeholder="Bed, Crib, Stroller, etc."
                        value={sleepForm.sleep_location}
                        onChange={(e) => setSleepForm(prev => ({ ...prev, sleep_location: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sleep-notes">Notes</Label>
                      <Textarea
                        id="sleep-notes"
                        placeholder="Add any additional notes here..."
                        value={sleepForm.notes}
                        onChange={(e) => setSleepForm(prev => ({ ...prev, notes: e.target.value }))}
                      />
                    </div>

                    <Button onClick={handleSleepSubmit} className="w-full bg-gradient-to-r from-soft-blue to-gentle-lavender">
                      Log Sleep
                    </Button>
                  </div>
                )}

                {/* Feeding Form */}
                {activeTab === 'feeding' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="feeding-time">Time</Label>
                      <Input
                        id="feeding-time"
                        type="datetime-local"
                        value={feedingForm.time}
                        onChange={(e) => setFeedingForm(prev => ({ ...prev, time: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="feeding-type">Type</Label>
                      <Select value={feedingForm.type} onValueChange={(value) => setFeedingForm(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select feeding type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nursing">Nursing</SelectItem>
                          <SelectItem value="formula">Formula</SelectItem>
                          <SelectItem value="solid">Solid Food</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="feeding-amount">Amount (ml/oz)</Label>
                      <Input
                        id="feeding-amount"
                        type="number"
                        placeholder="Optional"
                        value={feedingForm.amount}
                        onChange={(e) => setFeedingForm(prev => ({ ...prev, amount: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="feeding-notes">Notes</Label>
                      <Textarea
                        id="feeding-notes"
                        placeholder="Any additional notes"
                        value={feedingForm.notes}
                        onChange={(e) => setFeedingForm(prev => ({ ...prev, notes: e.target.value }))}
                      />
                    </div>
                    <Button onClick={handleFeedingSubmit} className="w-full bg-gradient-to-r from-soft-blue to-gentle-lavender">
                      Log Feeding
                    </Button>
                  </div>
                )}

                {/* Diaper Form */}
                {activeTab === 'diaper' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="diaper-time">Time</Label>
                      <Input
                        id="diaper-time"
                        type="datetime-local"
                        value={diaperForm.time}
                        onChange={(e) => setDiaperForm(prev => ({ ...prev, time: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="diaper-type">Type</Label>
                      <Select value={diaperForm.type} onValueChange={(value) => setDiaperForm(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select diaper type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="wet">Wet</SelectItem>
                          <SelectItem value="dirty">Dirty</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="diaper-notes">Notes</Label>
                      <Textarea
                        id="diaper-notes"
                        placeholder="Any additional notes"
                        value={diaperForm.notes}
                        onChange={(e) => setDiaperForm(prev => ({ ...prev, notes: e.target.value }))}
                      />
                    </div>
                    <Button onClick={handleDiaperSubmit} className="w-full bg-gradient-to-r from-soft-blue to-gentle-lavender">
                      Log Diaper Change
                    </Button>
                  </div>
                )}

                {/* Custom Activity Form */}
                {activeTab === 'custom' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="custom-activity">Activity</Label>
                      <Input
                        id="custom-activity"
                        placeholder="e.g., Tummy Time, Bath, Play"
                        value={customForm.activity}
                        onChange={(e) => setCustomForm(prev => ({ ...prev, activity: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="custom-time">Time</Label>
                      <Input
                        id="custom-time"
                        type="datetime-local"
                        value={customForm.time}
                        onChange={(e) => setCustomForm(prev => ({ ...prev, time: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="custom-duration">Duration (minutes)</Label>
                      <Input
                        id="custom-duration"
                        type="number"
                        placeholder="Optional"
                        value={customForm.duration}
                        onChange={(e) => setCustomForm(prev => ({ ...prev, duration: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="custom-notes">Notes</Label>
                      <Textarea
                        id="custom-notes"
                        placeholder="Any additional notes"
                        value={customForm.notes}
                        onChange={(e) => setCustomForm(prev => ({ ...prev, notes: e.target.value }))}
                      />
                    </div>
                    <Button onClick={handleCustomSubmit} className="w-full bg-gradient-to-r from-soft-blue to-gentle-lavender">
                      Log Activity
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Activity History</CardTitle>
                <CardDescription>View, edit, and delete logged activities</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : logs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No activities logged yet. Start tracking to see your history!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {logs.map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-soft-blue to-gentle-lavender rounded-full text-white">
                            {getActivityIcon(log.activity_type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium capitalize">{log.activity_type}</span>
                              {log.sleep_type && <span className="text-sm text-muted-foreground">({log.sleep_type})</span>}
                              {log.feeding_type && <span className="text-sm text-muted-foreground">({log.feeding_type})</span>}
                              {log.diaper_type && <span className="text-sm text-muted-foreground">({log.diaper_type})</span>}
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <p>Time: {formatTime(log.start_time)}</p>
                              {log.end_time && <p>End: {formatTime(log.end_time)}</p>}
                              {log.duration && <p>Duration: {formatDuration(log.duration)}</p>}
                              {log.feeding_amount && <p>Amount: {log.feeding_amount} ml</p>}
                              {log.sleep_location && <p>Location: {log.sleep_location}</p>}
                              {log.notes && <p>Notes: {log.notes}</p>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(log)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setDeleteId(log.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this activity log.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingLog} onOpenChange={() => setEditingLog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Activity</DialogTitle>
            <DialogDescription>
              Make changes to your activity log
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p>Edit functionality will be implemented here</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingLog(null)}>
              Cancel
            </Button>
            <Button onClick={() => setEditingLog(null)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SleepTracker;