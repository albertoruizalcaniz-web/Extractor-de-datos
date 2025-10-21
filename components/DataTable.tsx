import React from 'react';
import { EmployeeData } from '../types.ts';
import { DownloadIcon } from './Icons.tsx';

declare const jspdf: any;

interface DataTableProps {
  data: EmployeeData[];
  fileNames: string[];
}

const DataTable: React.FC<DataTableProps> = ({ data, fileNames }) => {

    const getConditionalText = (weeklyHours: string): string => {
        const hoursMatch = weeklyHours.match(/\d+/);
        if (hoursMatch) {
            const hours = parseInt(hoursMatch[0], 10);
            if (hours >= 35 || hours <= 16) {
                return "NO APLICA";
            }
        }
        return "";
    };

    const handleDownloadPdf = () => {
        const { jsPDF } = jspdf;
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.setTextColor(40);
        doc.text("Datos Extraídos de PDF", 14, 22);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Archivos: ${fileNames.join(', ')}`, 14, 30);

        doc.setFontSize(11);
        doc.setTextColor(0);
        let y = 45;
        data.forEach(item => {
            if (y > 280) { // Add a new page if content overflows
                doc.addPage();
                y = 20;
            }
            const conditionalText = getConditionalText(item.weeklyHours);
            const line = `${item.employeeName} - ${item.weeklyHours}${conditionalText ? ` - ${conditionalText}` : ''}`;
            doc.text(line, 14, y);
            y += 7;
        });

        doc.save('datos_extraidos.pdf');
    }

    if (data.length === 0) {
        return (
            <div className="text-center text-gray-400 p-6 w-full animate-fade-in">
                <h3 className="font-bold text-lg mb-2 text-white">Análisis Completo</h3>
                <p className="text-sm">No se encontraron datos de empleados en el/los archivo(s) proporcionado(s).</p>
                <p className="text-xs text-gray-500 mt-2 truncate">Archivos: {fileNames.join(', ')}</p>
            </div>
        )
    }

  return (
    <div className="w-full animate-fade-in">
        <div className="p-4 flex justify-between items-center">
            <div>
                <h3 className="text-lg font-semibold text-white">Resultados de la Extracción</h3>
                <p className="text-sm text-gray-400 truncate max-w-xs sm:max-w-md">
                    <span className="font-medium text-gray-300">{fileNames.join(', ')}</span>
                </p>
            </div>
            <button
                onClick={handleDownloadPdf}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 transition-all transform hover:scale-105"
            >
                <DownloadIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Descargar PDF</span>
            </button>
        </div>
      <div className="overflow-auto max-h-96 px-4 pb-4 space-y-2">
        {data.map((item, index) => {
            const conditionalText = getConditionalText(item.weeklyHours);
            return (
                <div key={index} className="bg-gray-800/60 p-4 rounded-lg flex justify-between items-center hover:bg-gray-700/50 transition-colors duration-150">
                    <p className="text-sm text-gray-300">
                        <span className="font-medium text-white">{item.employeeName}</span> - {item.weeklyHours}
                    </p>
                    {conditionalText && (
                        <span className="text-xs font-bold text-yellow-300 bg-yellow-900/50 px-2 py-1 rounded-md">
                            {conditionalText}
                        </span>
                    )}
                </div>
            );
        })}
      </div>
    </div>
  );
};

export default DataTable;