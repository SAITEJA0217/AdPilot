'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UploadCloud, Loader2, FileText, AlertCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [email, setEmail] = useState('');
  const [industry, setIndustry] = useState('');
  const [deviceId, setDeviceId] = useState('');


  // Generate or retrieve anonymous device ID for trial tracking
  useEffect(() => {
    import('uuid').then(({ v4: uuidv4 }) => {
      if (typeof window !== 'undefined') {
        let id = localStorage.getItem('adaudit_device_id');
        if (!id) {
          id = uuidv4();
          localStorage.setItem('adaudit_device_id', id);
        }
        setDeviceId(id);
      }
    });
  }, []);

  const [isUploading, setIsUploading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [errorText, setErrorText] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setErrorText('');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a CSV file.');
      return;
    }

    setIsUploading(true);
    setErrorText('');

    try {
      // 1. Upload & Parse
      setStatusText('Uploading and parsing CSV...');
      const formData = new FormData();
      formData.append('file', file);
      if (email) formData.append('email', email);
      if (deviceId) formData.append('deviceId', deviceId);

      const uploadRes = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.success) {
        throw new Error(uploadData.error || 'Upload and parsing failed. Please check your CSV format.');
      }

      // 2. Generate Audit & AI Recommendations
      setStatusText('Analyzing data & generating AI recommendations (this may take a few seconds)...');
      const auditRes = await fetch('/api/audits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadId: uploadData.uploadId, industry }),
      });

      const auditData = await auditRes.json();
      if (!auditRes.ok || !auditData.success) {
        throw new Error(auditData.error || 'Audit generation failed.');
      }

      toast.success('Audit generated successfully!');
      router.push(`/dashboard/${auditData.auditId}`);
    } catch (error: any) {
      setErrorText(error.message || 'An unexpected error occurred.');
      toast.error('Audit process failed.');
      setIsUploading(false);
      setStatusText('');
    }
  };

  return (
    <div className="min-h-[100dvh] w-full relative overflow-hidden bg-[#fafafa] dark:bg-[#0a0a0a] flex flex-col items-center justify-center p-4 sm:p-8 z-0">
      {/* Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-blue-600/10 dark:bg-blue-600/20 blur-[120px] rounded-full pointer-events-none -z-10 animate-pulse"></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/5 dark:bg-purple-600/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-600/5 dark:bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      <div className="w-full max-w-4xl mb-2 relative z-10">
        <Button onClick={() => router.back()} variant="ghost" className="-ml-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-full font-medium h-8 px-3 text-xs">
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back
        </Button>
      </div>

      <Card className="w-full max-w-4xl shadow-[0_0_50px_rgba(37,99,235,0.1)] dark:shadow-[0_0_50px_rgba(37,99,235,0.05)] border border-white/80 dark:border-white/10 bg-white/70 dark:bg-black/60 backdrop-blur-3xl relative z-10 rounded-[2rem] overflow-hidden flex flex-col md:flex-row">
        {/* Subtle glowing top border line */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent z-20"></div>
        
        {/* Left Side: Info & Dropzone */}
        <div className="flex-1 p-8 md:p-12 md:border-r border-neutral-200/50 dark:border-white/10 relative flex flex-col justify-center">
          <div className="mb-8 text-left">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-[18px] flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30 transform hover:scale-105 hover:rotate-3 transition-all duration-300">
              <UploadCloud className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-3xl font-black tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-b from-neutral-900 to-neutral-600 dark:from-white dark:to-neutral-400">
              Audit Your Meta Ads
            </h2>
            <p className="text-sm text-muted-foreground font-medium">
              Upload your CSV export. No account or Meta login required.
            </p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="file" className="text-sm font-bold text-foreground">Upload Meta Ads Report <span className="text-blue-600">*</span></Label>
            
            <div className="relative border-2 border-dashed border-blue-500/30 dark:border-blue-500/20 hover:border-blue-500/60 rounded-[1.25rem] bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/10 dark:to-transparent hover:from-blue-100/50 transition-all duration-300 group flex flex-col items-center justify-center py-10 px-4 text-center overflow-hidden">
              <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="w-12 h-12 bg-white dark:bg-black rounded-full shadow-[0_5px_15px_rgba(37,99,235,0.15)] dark:shadow-[0_5px_15px_rgba(0,0,0,0.5)] border border-neutral-100 dark:border-neutral-800 flex items-center justify-center mb-4 group-hover:-translate-y-1 transition-transform duration-300 relative z-10">
                <UploadCloud className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-[15px] font-bold text-foreground mb-1 relative z-10">
                {file ? file.name : "Click to upload CSV"}
              </p>
              <p className="text-xs text-muted-foreground font-medium relative z-10">
                {file ? "File selected • Ready to analyze" : "or drag and drop your report"}
              </p>
              
              <Input 
                id="file" 
                type="file" 
                accept=".csv" 
                onChange={handleFileChange} 
                required 
                disabled={isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            <p className="text-[11px] text-muted-foreground font-medium">
              Required: <span className="text-foreground">Campaign Name, Amount Spent</span>
            </p>
          </div>
        </div>

        {/* Right Side: Options & Submit */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center bg-white/40 dark:bg-black/40 relative">
          {errorText && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-md flex items-start gap-3 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="text-sm font-medium">{errorText}</div>
            </div>
          )}

          <form onSubmit={handleUpload} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold text-foreground tracking-wide uppercase">Email <span className="text-muted-foreground font-medium lowercase tracking-normal">(Optional)</span></Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="Where should we send the report?" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isUploading}
                className="h-12 rounded-[14px] border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-black/40 focus-visible:ring-blue-500 focus-visible:border-blue-500 text-sm shadow-sm transition-all placeholder:text-muted-foreground/60"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry" className="text-xs font-bold text-foreground tracking-wide uppercase">Industry <span className="text-muted-foreground font-medium lowercase tracking-normal">(Optional)</span></Label>
              <Select value={industry} onValueChange={(val) => setIndustry(val || '')} disabled={isUploading}>
                <SelectTrigger className="h-12 rounded-[14px] border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-black/40 focus-visible:ring-blue-500 focus-visible:border-blue-500 text-sm shadow-sm transition-all data-[placeholder]:text-muted-foreground/60">
                  <SelectValue placeholder="Select context for better AI analysis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="coach">Coach / Consultant</SelectItem>
                  <SelectItem value="real_estate">Real Estate</SelectItem>
                  <SelectItem value="ecom">E-commerce</SelectItem>
                  <SelectItem value="local_biz">Local Business</SelectItem>
                  <SelectItem value="agency">Agency</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full h-14 text-base font-bold shadow-[0_8px_30px_rgb(37,99,235,0.25)] hover:shadow-[0_8px_40px_rgb(37,99,235,0.4)] hover:-translate-y-1 transition-all duration-300 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-[length:200%_auto] hover:bg-[position:100%_0] text-white rounded-[14px] relative overflow-hidden group" disabled={isUploading || !file}>
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-overlay"></div>
                {isUploading ? (
                  <span className="relative z-10 flex items-center justify-center">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating Audit...
                  </span>
                ) : (
                  <span className="relative z-10 flex items-center justify-center">
                    <UploadCloud className="mr-2 h-5 w-5" />
                    Generate Free Audit
                  </span>
                )}
              </Button>
            </div>
            
            {isUploading && statusText && (
              <p className="text-sm text-center w-full text-blue-600 dark:text-blue-400 font-bold animate-pulse mt-4">
                {statusText}
              </p>
            )}
          </form>
        </div>
      </Card>
    </div>
  );
}
