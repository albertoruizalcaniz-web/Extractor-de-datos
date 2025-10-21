import React from 'react';
import { EmployeeData } from '../types';
import { DownloadIcon } from './Icons';

declare const jspdf: any;

interface DataTableProps {
  data: EmployeeData[];
  fileNames: string[];
}

const DataTable: React.FC<DataTableProps> = ({ data, fileNames }) => {

    const handleDownloadPdf = () => {
        const { jsPDF } = jspdf;
        const doc = new jsPDF();
        
        doc.autoTable({
            head: [['Nombre de Empleado', 'Jornada Semanal']],
            body: data.map(item => [item.employeeName, item.weeklyHours]),
            startY: 25,
            headStyles: { fillColor: [22, 78, 99] }, // A dark cyan color
            didDrawPage: (data: any) => {
              // Header
              doc.setFontSize(18);
              doc.setTextColor(40);
              doc.text("Datos Extraídos de PDF", data.settings.margin.left, 15);
              // Footer
              doc.setFontSize(8);
              doc.setTextColor(100);
              const pageStr = `Página ${doc.internal.getNumberOfPages()}`;
              doc.text(pageStr, data.settings.margin.left, doc.internal.pageSize.height - 10);
            },
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
      <div className="overflow-auto max-h-96 rounded-b-lg">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800/60 sticky top-0 backdrop-blur-sm">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Nombre de Empleado
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Jornada Semanal
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800/40 divide-y divide-gray-700/50">
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-gray-700/50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                  {item.employeeName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {item.weeklyHours}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;