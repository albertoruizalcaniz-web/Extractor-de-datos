import React, { useState, useCallback } from 'react';
import { extractDataFromPdfText } from './services/geminiService';
import { EmployeeData } from './types';
import FileUpload from './components/FileUpload';
import DataTable from './components/DataTable';
import Loader from './components/Loader';
import { LogoIcon } from './components/Icons';

// pdfjs is loaded from CDN in index.html, we need to assert its type
declare const pdfjsLib: any;

const App: React.FC = () => {
  const [extractedData, setExtractedData] = useState<EmployeeData[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileNames, setFileNames] = useState<string[]>([]);

  const handleFileProcess = useCallback(async (files: File[]) => {
    if (!files || files.length === 0) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setExtractedData(null);
    setFileNames(files.map(f => f.name));

    try {
      // Set worker source for pdf.js, using a stable CDN version
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;

      const processFile = async (file: File): Promise<EmployeeData[]> => {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n\n';
        }
        
        if (!fullText.trim()) {
          console.warn(`No text could be extracted from ${file.name}. It might be an image-based PDF.`);
          return []; // Return empty array for this file
        }

        return await extractDataFromPdfText(fullText);
      };

      const allPromises = files.map(file => processFile(file));
      const results = await Promise.all(allPromises);
      const combinedData = results.flat(); // Flatten array of arrays into a single array
      
      setExtractedData(combinedData);

    } catch (err: any) {
      console.error("Error processing files:", err);
      setError(err.message || 'Ocurrió un error desconocido durante el procesamiento.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
            <div className="flex justify-center items-center gap-4 mb-4">
                <LogoIcon className="w-12 h-12 text-cyan-400" />
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                PDF Data Extractor
                </h1>
            </div>
          <p className="mt-2 text-lg text-gray-400">
            Sube uno o más archivos PDF para extraer automáticamente nombres de empleados y sus jornadas semanales.
          </p>
        </header>

        <main className="bg-gray-800/50 rounded-xl shadow-2xl p-6 border border-gray-700 backdrop-blur-sm">
          <FileUpload onFileSelect={handleFileProcess} disabled={isLoading} />

          <div className="mt-6 min-h-[20rem] flex items-center justify-center">
            {isLoading ? (
              <Loader />
            ) : error ? (
              <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2">Error</h3>
                <p>{error}</p>
              </div>
            ) : extractedData ? (
              <DataTable data={extractedData} fileNames={fileNames} />
            ) : (
              <div className="text-center text-gray-500">
                <p>Los datos extraídos aparecerán aquí.</p>
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