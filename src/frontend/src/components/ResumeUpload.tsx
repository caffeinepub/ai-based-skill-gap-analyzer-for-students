import { useState, useRef } from 'react';
import { useUploadResume } from '../hooks/useQueries';
import { ExternalBlob } from '../backend';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { parseResumePDF } from '../services/nlpService';
import { extractSkills } from '../services/skillExtraction';

interface ResumeUploadProps {
  onUploadSuccess: (skills: string[]) => void;
}

export default function ResumeUpload({ onUploadSuccess }: ResumeUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const uploadResume = useUploadResume();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (selectedFile.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setIsComplete(false);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsProcessing(true);
    setUploadProgress(0);

    try {
      // Read file as bytes
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      // Create ExternalBlob with progress tracking
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      // Upload to backend
      const fileId = `resume_${Date.now()}_${file.name}`;
      await uploadResume.mutateAsync({ fileId, blob });

      // Parse PDF and extract skills
      toast.info('Analyzing resume...');
      const extractedText = await parseResumePDF(bytes);
      const skills = extractSkills(extractedText);

      setIsComplete(true);
      toast.success(`Resume uploaded! Found ${skills.length} skills.`);
      onUploadSuccess(skills);
    } catch (error) {
      toast.error('Failed to upload resume. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {!file ? (
          <div>
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              Click to upload or drag and drop your resume
            </p>
            <Button onClick={() => fileInputRef.current?.click()}>
              Select PDF File
            </Button>
          </div>
        ) : (
          <div>
            {isComplete ? (
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            ) : (
              <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
            )}
            <p className="font-medium mb-2">{file.name}</p>
            <p className="text-sm text-muted-foreground mb-4">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
            
            {isProcessing && (
              <div className="mb-4">
                <Progress value={uploadProgress} className="mb-2" />
                <p className="text-sm text-muted-foreground">
                  {uploadProgress < 100 ? 'Uploading...' : 'Processing...'}
                </p>
              </div>
            )}
            
            {!isComplete && (
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={handleUpload}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Upload & Analyze'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFile(null);
                    setUploadProgress(0);
                  }}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
              </div>
            )}
            
            {isComplete && (
              <Button
                variant="outline"
                onClick={() => {
                  setFile(null);
                  setIsComplete(false);
                  setUploadProgress(0);
                }}
              >
                Upload Different Resume
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
