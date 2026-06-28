'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Play, TrendingUp, AlertTriangle, Lightbulb, Briefcase } from 'lucide-react';

const demos = [
  {
    id: 'good',
    title: 'Healthy Account',
    description: 'High ROAS, scalable campaigns.',
    file: '/demos/good_meta_ads.csv',
    icon: <TrendingUp className="h-5 w-5 text-emerald-500" />
  },
  {
    id: 'average',
    title: 'Average Account',
    description: 'Mixed performance, some wasted spend.',
    file: '/demos/average_meta_ads.csv',
    icon: <Lightbulb className="h-5 w-5 text-blue-500" />
  },
  {
    id: 'bad',
    title: 'Critical Account',
    description: 'High wasted spend, zero conversions.',
    file: '/demos/bad_meta_ads.csv',
    icon: <AlertTriangle className="h-5 w-5 text-red-500" />
  },
  {
    id: 'investor',
    title: 'Investor Demo',
    description: 'Massive spend account for pitch.',
    file: '/demos/investor_demo_meta_ads.csv',
    icon: <Briefcase className="h-5 w-5 text-indigo-500" />
  }
];

export default function DemoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const loadDemo = async (demo: typeof demos[0]) => {
    setLoading(demo.id);
    try {
      // 1. Fetch the local CSV file
      const response = await fetch(demo.file);
      const csvText = await response.text();
      
      // 2. Create a Blob and FormData
      const blob = new Blob([csvText], { type: 'text/csv' });
      const formData = new FormData();
      formData.append('file', blob, demo.file.split('/').pop());

      // 3. Upload to our API
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const uploadData = await uploadRes.json();

      if (!uploadData.success) throw new Error(uploadData.error);

      // 4. Run the Audit
      const auditRes = await fetch('/api/audits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadId: uploadData.uploadId, industry: 'E-commerce' })
      });
      const auditData = await auditRes.json();

      if (!auditData.success) throw new Error(auditData.error);

      // 5. Navigate to Dashboard
      router.push(`/dashboard/${auditData.auditId}`);
    } catch (error) {
      console.error('Demo load failed:', error);
      alert('Failed to load demo. See console for details.');
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-white to-indigo-50 dark:from-blue-950 dark:via-background dark:to-indigo-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
            AdAudit AI Demo Mode
          </h1>
          <p className="text-lg text-muted-foreground">
            Select a scenario to instantly generate a consultant-grade audit report.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {demos.map((demo) => (
            <Card key={demo.id} className="hover:shadow-lg transition-shadow border border-white/20 bg-white/50 dark:bg-black/20 backdrop-blur-md">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-background rounded-md shadow-sm">
                    {demo.icon}
                  </div>
                  <div>
                    <CardTitle>{demo.title}</CardTitle>
                    <CardDescription>{demo.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  onClick={() => loadDemo(demo)}
                  disabled={loading !== null}
                >
                  {loading === demo.id ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Generating Audit...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Play className="h-4 w-4" /> Load Demo Report
                    </span>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
