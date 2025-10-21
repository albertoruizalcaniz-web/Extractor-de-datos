import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon } from './Icons';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  disabled: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onFileSelect(Array.from(event.target.files));
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (!disabled && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(Array.from(e.dataTransfer.files));
    }
  }, [onFileSelect, disabled]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };


  const dragDropClasses = isDragging
    ? 'border-cyan-400 bg-cyan-900/50 scale-105'
    : 'border-gray-600 hover:border-cyan-500 hover:bg-gray-700/50';

  return (
    <div className="w-full">
      <label
        htmlFor="file-upload"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`flex justify-center w-full h-32 px-4 transition-all duration-300 ease-in-out border-2 ${dragDropClasses} border-dashed rounded-md appearance-none cursor-pointer focus:outline-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={handleClick}
      >
        <span className="flex items-center space-x-4">
          <UploadIcon className="w-10 h-10 text-gray-500 group-hover:text-cyan-400 transition-colors" />
          <span className="font-medium text-gray-400">
            Arrastra y suelta archivos PDF, o{' '}
            <span className="text-cyan-400 underline">haz clic para seleccionar</span>
          </span>
        </span>
        <input
          id="file-upload"
          name="file-upload"
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
          ref={fileInputRef}
          disabled={disabled}
          multiple
        />
      </label>
    </div>
  );
};

export default FileUpload;