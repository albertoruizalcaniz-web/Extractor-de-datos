import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon } from './Icons.tsx';

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
      // Reset the input value to allow re-uploading the same file
      event.target.value = '';
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
    ? 'border-cyan-400 bg-cyan-900/40 scale-105 shadow-lg'
    : 'border-gray-600/80 hover:border-cyan-500 hover:bg-gray-700/30';

  return (
    <div className="w-full">
      <label
        htmlFor="file-upload"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`relative flex flex-col items-center justify-center w-full h-48 px-4 transition-all duration-300 ease-in-out border-2 ${dragDropClasses} border-dashed rounded-xl cursor-pointer focus:outline-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="absolute inset-0 bg-black/20 rounded-xl"></div>
        <div className="relative z-10 flex flex-col items-center text-center">
            <UploadIcon className="w-12 h-12 text-gray-400 mb-3" />
            <p className="font-medium text-gray-300">
                Arrastra y suelta archivos PDF, o{' '}
                <span className="text-cyan-400 font-semibold">haz clic para seleccionar</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">Soporta carga múltiple de archivos</p>
        </div>
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