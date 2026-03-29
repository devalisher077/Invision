import React, { useState } from "react";
import { Upload, FileText, X } from "lucide-react";

interface FileUploadDropzoneProps {
  label: string;
  accept?: string;
  required?: boolean;
  description?: string;
  onFilesChange?: (files: File[]) => void;
}

const FileUploadDropzone: React.FC<FileUploadDropzoneProps> = ({
  label,
  accept = ".jpg,.png,.pdf",
  required = false,
  description = "JPG, PNG или PDF, макс. 10МБ",
  onFilesChange,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const newFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => {
      const updated = [...prev, ...newFiles];
      onFilesChange?.(updated);
      return updated;
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => {
        const updated = [...prev, ...Array.from(e.target.files!)];
        onFilesChange?.(updated);
        return updated;
      });
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      onFilesChange?.(updated);
      return updated;
    });
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 cursor-pointer ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/40 hover:bg-muted/50"
        }`}
      >
        <input
          type="file"
          accept={accept}
          multiple
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
        <p className="text-sm font-medium text-foreground">
          Перетащите файлы сюда или{" "}
          <span className="text-primary font-semibold">выберите</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2 mt-3">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-2.5 animate-fade-in"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{file.name}</span>
                <span className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(0)} КБ
                </span>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploadDropzone;
