import React, { useState, useCallback, useMemo } from 'react';
import { extractDataFromPdfText } from './services/geminiService';
import { EmployeeData } from './types';
import FileUpload from './components/FileUpload';
import DataTable from './components/DataTable';
import Loader from './components/Loader';
import { LogoIcon, FileIcon, TrashIcon } from './components/Icons';

declare const pdfjsLib: any;

type ProcessingStatus = 'idle' | 'reading' | 'analyzing' | 'done' | 'error';

const App: React.FC = () => {
  const [extractedData, setExtractedData] = useState<EmployeeData[] | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const fileNames = useMemo(() => selectedFiles.map(f => f.name), [selectedFiles]);

  const handleFileSelect = useCallback((files: File[]) => {
    setSelectedFiles(prev => [...prev, ...files]);
    setStatus('idle');
    setExtractedData(null);
  }, []);
  
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }

  const handleFileProcess = useCallback(async () => {
    if (selectedFiles.length === 0) return;
    
    setStatus('reading');
    setError(null);
    setExtractedData(null);

    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;

      const processFile = async (file: File): Promise<{text: string, name: string}> => {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n\n';
        }
        return { text: fullText, name: file.name };
      };

      const allTextPromises = selectedFiles.map(file => processFile(file));
      const textResults = await Promise.all(allTextPromises);

      setStatus('analyzing');

      const combinedText = textResults.map(r => `--- Contenido del archivo: ${r.name} ---\n${r.text}`).join('\n\n');
      
      const combinedData = await extractDataFromPdfText(combinedText);
      
      setExtractedData(combinedData);
      setStatus('done');

    } catch (err: any) {
      console.error("Error processing files:", err);
      setError(err.message || 'Ocurrió un error desconocido durante el procesamiento.');
      setStatus('error');
    }
  }, [selectedFiles]);

  const isProcessing = status === 'reading' || status === 'analyzing';

  return (
    <div className="min-h-screen text-gray-200 flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-5xl mx-auto">
        <header className="text-center mb-8 animate-fade-in-down">
            <div className="flex justify-center items-center gap-4 mb-4">
                <LogoIcon className="w-12 h-12 text-cyan-400" />
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                PDF Data Extractor Pro
                </h1>
            </div>
          <p className="mt-2 text-lg text-gray-400">
            Extrae datos de empleados de múltiples archivos PDF al instante con el poder de la IA.
          </p>
        </header>

        <main className="bg-gray-800/30 rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-700/50 backdrop-blur-xl">
          <FileUpload onFileSelect={handleFileSelect} disabled={isProcessing} />

          {selectedFiles.length > 0 && (
            <div className="mt-6 animate-fade-in">
              <h3 className="text-lg font-semibold text-gray-300 mb-3">Archivos Seleccionados</h3>
              <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {selectedFiles.map((file, index) => (
                    <li key={index} className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg">
                        <div className="flex items-center gap-3">
                            <FileIcon className="w-6 h-6 text-cyan-400 flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-200 truncate">{file.name}</span>
                        </div>
                        <button onClick={() => removeFile(index)} disabled={isProcessing} className="p-1 text-gray-400 hover:text-red-400 disabled:opacity-50 transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-red-500">
                            <TrashIcon className="w-5 h-5"/>
                        </button>
                    </li>
                ))}
              </ul>
              <div className="mt-4 text-center">
                <button 
                  onClick={handleFileProcess} 
                  disabled={isProcessing}
                  className="w-full sm:w-auto px-8 py-3 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  {isProcessing ? 'Procesando...' : `Analizar ${selectedFiles.length} Archivo(s)`}
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 min-h-[24rem] flex items-center justify-center p-4 bg-gray-900/40 rounded-xl border border-gray-700/50">
            {status === 'reading' ? (
              <Loader status="Leyendo archivos PDF..." />
            ) : status === 'analyzing' ? (
              <Loader status="Analizando con IA..." />
            ) : status === 'error' ? (
              <div className="text-center text-red-400 bg-red-900/30 p-6 rounded-lg animate-fade-in">
                <h3 className="font-bold text-xl mb-2">Error</h3>
                <p>{error}</p>
              </div>
            ) : extractedData ? (
              <DataTable data={extractedData} fileNames={fileNames} />
            ) : (
              <div className="text-center text-gray-500">
                <p>Sube tus archivos y los datos extraídos aparecerán aquí.</p>
              </div>
            )}
          </div>
        </main>
        <footer className="text-center mt-8 text-gray-500 text-sm">
            <p>Powered by Gemini API</p>
        </footer>
      </div>
    </div>
  );
};

export default App;