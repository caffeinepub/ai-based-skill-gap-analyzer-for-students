import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Upload, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import AdminGuard from '../components/AdminGuard';
import { useResumeAnalysis } from '../hooks/useResumeAnalysis';

export default function ResumeUploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const resumeAnalysis = useResumeAnalysis();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(selectedFile.type)) {
      toast.error('Please upload a PDF or image file (JPG, PNG)');
      return;
    }

    if (selectedFile.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      const result = await resumeAnalysis.mutateAsync({ 
        file,
        onProgress: (percentage) => setUploadProgress(percentage)
      });
      toast.success('Resume analyzed successfully!');
      
      // Navigate to comprehensive result page
      navigate({
        to: '/result/$documentId',
        params: { documentId: result.fileId }
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to analyze resume');
      console.error('Upload error:', error);
    }
  };

  return (
    <AdminGuard>
      <div className="container py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Resume Upload</h1>
          <p className="text-muted-foreground text-lg">
            Upload a resume for AI-powered analysis and skill extraction
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload Resume File</CardTitle>
            <CardDescription>
              Supported formats: PDF, JPG, PNG (Max 10MB)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Drag and Drop Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-primary/10 p-4">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-medium mb-1">
                    Drag and drop your resume here
                  </p>
                  <p className="text-sm text-muted-foreground">or</p>
                </div>
                <label htmlFor="file-upload">
                  <Button variant="outline" asChild>
                    <span>Browse Files</span>
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                  />
                </label>
              </div>
            </div>

            {/* Selected File */}
            {file && (
              <div className="flex items-center gap-3 p-4 bg-secondary/20 rounded-lg">
                <FileText className="h-8 w-8 text-primary" />
                <div className="flex-1">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                {resumeAnalysis.isSuccess && (
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                )}
              </div>
            )}

            {/* Upload Progress */}
            {resumeAnalysis.isPending && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Analyzing resume...</span>
                  <span className="font-medium">{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {/* Upload Button */}
            <div className="flex gap-3">
              <Button
                onClick={handleUpload}
                disabled={!file || resumeAnalysis.isPending}
                className="flex-1"
              >
                {resumeAnalysis.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Analyze Resume
                  </>
                )}
              </Button>
              {file && !resumeAnalysis.isPending && (
                <Button
                  variant="outline"
                  onClick={() => setFile(null)}
                >
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminGuard>
  );
}
