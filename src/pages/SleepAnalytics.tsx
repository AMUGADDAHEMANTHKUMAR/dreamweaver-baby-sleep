import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Volume2, BookOpen } from 'lucide-react';
import AudioLibrary from '@/components/AudioLibrary';
import ArticlesLibrary from '@/components/ArticlesLibrary';

const SleepAnalytics = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-soft-blue to-gentle-lavender">
      <header className="bg-white/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-xl font-semibold">Sleep Analytics</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="audio" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="audio" className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Audio Library
              </TabsTrigger>
              <TabsTrigger value="articles" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Sleep Articles
              </TabsTrigger>
            </TabsList>

            <TabsContent value="audio">
              <AudioLibrary />
            </TabsContent>

            <TabsContent value="articles">
              <ArticlesLibrary />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default SleepAnalytics;