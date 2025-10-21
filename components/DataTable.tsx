import React from 'react';
import { EmployeeData } from '../types';
import { DownloadIcon } from './Icons';

// jsPDF and autoTable are loaded from CDN, we need to assert their types
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
            headStyles: { fillColor: [38, 166, 154] }, // A teal color
            didDrawPage: (data: any) => {
              // Header
              doc.setFontSize(18);
              doc.setTextColor(40);
              doc.text("Datos Extraídos de PDF", data.settings.margin.left, 15);
            },
        });

        doc.save('datos_extraidos.pdf');
    }

    if (data.length === 0) {
        return (
            <div className="text-center text-gray-400 bg-gray-800 p-6 rounded-lg w-full">
                <h3 className="font-bold text-lg mb-2 text-white">Análisis Completo</h3>
                <p className="text-sm">No se encontraron datos de empleados en los archivos: <span className="font-semibold">{fileNames.join(', ')}</span>.</p>
            </div>
        )
    }

  return (
    <div className="w-full bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <div>
                <h3 className="text-lg font-semibold text-white">Resultados de la extracción</h3>
                <p className="text-sm text-gray-400">Archivos: <span className="font-medium text-gray-300">{fileNames.join(', ')}</span></p>
            </div>
            <button
                onClick={handleDownloadPdf}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 transition-colors"
            >
                <DownloadIcon className="w-5 h-5" />
                Descargar PDF
            </button>
        </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700/50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
              >
                Nombre de Empleado
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
              >
                Jornada Semanal
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-gray-700/50 transition-colors">
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