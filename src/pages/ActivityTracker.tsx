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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Moon, Baby, Droplets, Plus, Edit2, Trash2, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface ActivityLog {
  id: string;
  activity_type: string;
  sleep_type?: string;
  start_time?: string;
  end_time?: string;
  duration_minutes?: number;
  feeding_type?: string;
  amount_ml?: number;
  diaper_type?: string;
  custom_activity_name?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
  user_id: string;
}

const ActivityTracker = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('log');
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<ActivityLog | null>(null);
  const [logToDelete, setLogToDelete] = useState<string | null>(null);

  // Form states
  const [sleepType, setSleepType] = useState<'nap' | 'nighttime'>('nap');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [feedingType, setFeedingType] = useState<'nursing' | 'formula'>('nursing');
  const [amount, setAmount] = useState('');
  const [diaperType, setDiaperType] = useState<'wet' | 'dirty' | 'both'>('wet');
  const [customActivity, setCustomActivity] = useState('');
  const [notes, setNotes] = useState('');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const fetchLogs = async () => {
    setLoadingLogs(true);
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
        variant: "destructive",
      });
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));
  };

  const resetForm = () => {
    setStartTime('');
    setEndTime('');
    setAmount('');
    setCustomActivity('');
    setNotes('');
    setEditingLog(null);
  };

  const handleSubmit = async (activityType: 'sleep' | 'feeding' | 'diaper' | 'custom') => {
    try {
      let logData: any = {
        user_id: user.id,
        activity_type: activityType,
        notes: notes || null,
      };

      if (activityType === 'sleep') {
        if (!startTime) {
          toast({
            title: "Error",
            description: "Start time is required for sleep tracking",
            variant: "destructive",
          });
          return;
        }

        logData.sleep_type = sleepType;
        logData.start_time = startTime;
        if (endTime) {
          logData.end_time = endTime;
          logData.duration_minutes = calculateDuration(startTime, endTime);
        }
      } else if (activityType === 'feeding') {
        logData.feeding_type = feedingType;
        if (amount) logData.amount_ml = parseInt(amount);
      } else if (activityType === 'diaper') {
        logData.diaper_type = diaperType;
      } else if (activityType === 'custom') {
        if (!customActivity) {
          toast({
            title: "Error",
            description: "Activity name is required",
            variant: "destructive",
          });
          return;
        }
        logData.custom_activity_name = customActivity;
      }

      let error;
      if (editingLog) {
        const { error: updateError } = await supabase
          .from('activity_logs')
          .update(logData)
          .eq('id', editingLog.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('activity_logs')
          .insert([logData]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: `Activity ${editingLog ? 'updated' : 'logged'} successfully`,
      });

      resetForm();
      fetchLogs();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingLog ? 'update' : 'log'} activity`,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (log: ActivityLog) => {
    setEditingLog(log);
    if (log.activity_type === 'sleep') {
      setSleepType((log.sleep_type as 'nap' | 'nighttime') || 'nap');
      setStartTime(log.start_time || '');
      setEndTime(log.end_time || '');
    } else if (log.activity_type === 'feeding') {
      setFeedingType((log.feeding_type as 'nursing' | 'formula') || 'nursing');
      setAmount(log.amount_ml?.toString() || '');
    } else if (log.activity_type === 'diaper') {
      setDiaperType((log.diaper_type as 'wet' | 'dirty' | 'both') || 'wet');
    } else if (log.activity_type === 'custom') {
      setCustomActivity(log.custom_activity_name || '');
    }
    setNotes(log.notes || '');
    setActiveTab('log');
  };

  const handleDelete = async () => {
    if (!logToDelete) return;

    try {
      const { error } = await supabase
        .from('activity_logs')
        .delete()
        .eq('id', logToDelete);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Activity log deleted successfully",
      });

      fetchLogs();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete activity log",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setLogToDelete(null);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'sleep': return <Moon className="h-4 w-4" />;
      case 'feeding': return <Baby className="h-4 w-4" />;
      case 'diaper': return <Droplets className="h-4 w-4" />;
      default: return <Plus className="h-4 w-4" />;
    }
  };

  const formatLogTitle = (log: ActivityLog) => {
    switch (log.activity_type) {
      case 'sleep':
        return `${log.sleep_type === 'nap' ? 'Nap' : 'Night Sleep'}`;
      case 'feeding':
        return `${log.feeding_type === 'nursing' ? 'Nursing' : 'Formula'} Feeding`;
      case 'diaper':
        return `Diaper Change (${log.diaper_type})`;
      case 'custom':
        return log.custom_activity_name || 'Custom Activity';
      default:
        return 'Activity';
    }
  };

  const formatLogDetails = (log: ActivityLog) => {
    const details = [];
    if (log.start_time) {
      details.push(`Start: ${format(new Date(log.start_time), 'HH:mm')}`);
    }
    if (log.end_time) {
      details.push(`End: ${format(new Date(log.end_time), 'HH:mm')}`);
    }
    if (log.duration_minutes) {
      details.push(`Duration: ${Math.floor(log.duration_minutes / 60)}h ${log.duration_minutes % 60}m`);
    }
    if (log.amount_ml) {
      details.push(`Amount: ${log.amount_ml}ml`);
    }
    return details.join(' • ');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-xl font-semibold">Activity Tracker</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="log">Log Activity</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="log" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sleep Tracking */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Moon className="h-5 w-5" />
                    Sleep Tracking
                  </CardTitle>
                  <CardDescription>Log naps and nighttime sleep</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="sleep-type">Sleep Type</Label>
                    <Select value={sleepType} onValueChange={(value: 'nap' | 'nighttime') => setSleepType(value)}>
                      <SelectTrigger>
                        <SelectValue />
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
                        type="datetime-local"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="end-time">End Time</Label>
                      <Input
                        id="end-time"
                        type="datetime-local"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="sleep-notes">Notes</Label>
                    <Textarea
                      id="sleep-notes"
                      placeholder="Any observations..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                  <Button onClick={() => handleSubmit('sleep')} className="w-full">
                    {editingLog?.activity_type === 'sleep' ? 'Update' : 'Log'} Sleep
                  </Button>
                </CardContent>
              </Card>

              {/* Feeding Tracking */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Baby className="h-5 w-5" />
                    Feeding Tracking
                  </CardTitle>
                  <CardDescription>Log nursing and formula feeds</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="feeding-type">Feeding Type</Label>
                    <Select value={feedingType} onValueChange={(value: 'nursing' | 'formula') => setFeedingType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nursing">Nursing</SelectItem>
                        <SelectItem value="formula">Formula</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="amount">Amount (ml)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Amount in ml (optional)"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="feeding-notes">Notes</Label>
                    <Textarea
                      id="feeding-notes"
                      placeholder="Any observations..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                  <Button onClick={() => handleSubmit('feeding')} className="w-full">
                    {editingLog?.activity_type === 'feeding' ? 'Update' : 'Log'} Feeding
                  </Button>
                </CardContent>
              </Card>

              {/* Diaper Tracking */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Droplets className="h-5 w-5" />
                    Diaper Changes
                  </CardTitle>
                  <CardDescription>Track wet and dirty diapers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="diaper-type">Diaper Type</Label>
                    <Select value={diaperType} onValueChange={(value: 'wet' | 'dirty' | 'both') => setDiaperType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wet">Wet</SelectItem>
                        <SelectItem value="dirty">Dirty</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="diaper-notes">Notes</Label>
                    <Textarea
                      id="diaper-notes"
                      placeholder="Any observations..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                  <Button onClick={() => handleSubmit('diaper')} className="w-full">
                    {editingLog?.activity_type === 'diaper' ? 'Update' : 'Log'} Diaper Change
                  </Button>
                </CardContent>
              </Card>

              {/* Custom Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Custom Activity
                  </CardTitle>
                  <CardDescription>Log tummy time, bath, or other activities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="custom-activity">Activity Name</Label>
                    <Input
                      id="custom-activity"
                      placeholder="e.g., Tummy Time, Bath, Play"
                      value={customActivity}
                      onChange={(e) => setCustomActivity(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="custom-notes">Notes</Label>
                    <Textarea
                      id="custom-notes"
                      placeholder="Any details about the activity..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                  <Button onClick={() => handleSubmit('custom')} className="w-full">
                    {editingLog?.activity_type === 'custom' ? 'Update' : 'Log'} Activity
                  </Button>
                </CardContent>
              </Card>
            </div>

            {editingLog && (
              <div className="flex justify-center">
                <Button variant="outline" onClick={resetForm}>
                  Cancel Edit
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Activity History</CardTitle>
                <CardDescription>View and manage your logged activities</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingLogs ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : logs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No activities logged yet. Start tracking in the Log Activity tab!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {logs.map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                            {getActivityIcon(log.activity_type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{formatLogTitle(log)}</h4>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(log.created_at), 'MMM d, yyyy')}
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(new Date(log.created_at), 'HH:mm')}
                              </span>
                            </div>
                            {formatLogDetails(log) && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {formatLogDetails(log)}
                              </p>
                            )}
                            {log.notes && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Note: {log.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(log)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setLogToDelete(log.id);
                              setDeleteDialogOpen(true);
                            }}
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
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Activity Log</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this activity log? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ActivityTracker;