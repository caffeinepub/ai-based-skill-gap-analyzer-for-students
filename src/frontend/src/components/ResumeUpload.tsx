import React, { useState, useRef } from 'react';
import { useUploadResume } from '../hooks/useQueries';
import { ExternalBlob } from '../backend';
import { parseResumePDF } from '../services/nlpService';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface ResumeUploadProps {
  onUploadSuccess: () => void;
}

export default function ResumeUpload({ onUploadSuccess }: ResumeUploadProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadResume = useUploadResume();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setError(null);
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setUploadProgress(0);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Parse PDF
      await parseResumePDF(uint8Array);

      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      await uploadResume.mutateAsync({
        fileId: selectedFile.name,
        blob,
      });

      setUploadProgress(100);
      setTimeout(() => {
        onUploadSuccess();
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Failed to upload resume');
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please upload a PDF file');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setError(null);
      setSelectedFile(file);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
          isProcessing
            ? 'opacity-50 cursor-not-allowed border-border'
            : 'border-border hover:border-primary/50 hover:bg-muted/50'
        }`}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isProcessing}
        />
        <div className="flex flex-col items-center space-y-4">
          {uploadProgress === 100 ? (
            <CheckCircle2 className="w-16 h-16 text-success" />
          ) : selectedFile ? (
            <FileText className="w-16 h-16 text-primary" />
          ) : (
            <Upload className="w-16 h-16 text-muted-foreground" />
          )}
          <div>
            {selectedFile ? (
              <>
                <p className="text-lg font-semibold text-foreground mb-2">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </>
            ) : (
              <>
                <p className="text-lg font-semibold text-foreground mb-2">Upload your resume</p>
                <p className="text-sm text-muted-foreground">
                  Drag and drop your PDF file here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-2">Maximum file size: 10MB</p>
              </>
            )}
          </div>
        </div>
      </div>

      {selectedFile && uploadProgress < 100 && !isProcessing && (
        <div className="flex justify-center space-x-3">
          <Button onClick={handleUpload} disabled={isProcessing}>
            Upload & Analyze
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedFile(null);
              setError(null);
            }}
          >
            Cancel
          </Button>
        </div>
      )}

      {isProcessing && uploadProgress < 100 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Uploading...</span>
            <span className="font-medium text-foreground">{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {uploadProgress === 100 && (
        <div className="flex items-center space-x-2 text-success p-3 bg-success/10 rounded-lg border border-success/20">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium">Resume uploaded successfully!</span>
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 text-destructive p-3 bg-destructive/10 rounded-lg border border-destructive/20">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">{error}</span>
        </div>
      )}
    </div>
  );
}
