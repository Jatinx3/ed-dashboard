import React from 'react';

// Converts JSON array of objects to a CSV string and triggers a download
const CsvExporter = ({ data, filename, userType }) => {

    const convertToCSV = (arr) => {
        if (!arr || arr.length === 0) return '';

        // 1. Get Headers (all keys from the first object)
        const headers = Object.keys(arr[0]).filter(key => key !== 'tatStart' && key !== 'tatEnd');
        const headerRow = headers.join(',');

        // 2. Map data to rows
        const dataRows = arr.map(obj => {
            return headers.map(header => {
                let value = obj[header] === null ? '' : obj[header];
                
                // Special formatting for CSV
                if (typeof value === 'string' && value.includes(',')) {
                    // Escape internal quotes and wrap the whole value in quotes
                    value = `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(',');
        });

        return [headerRow, ...dataRows].join('\n');
    };

    const handleDownload = () => {
        if (!data || data.length === 0) {
            alert("No data to export.");
            return;
        }

        const csvString = convertToCSV(data);
        
        // Create a temporary link element to trigger the download
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const buttonClass = userType === 'LAB' 
        ? "bg-green-600 text-white hover:bg-green-700 transition duration-150" 
        : "bg-blue-600 text-white hover:bg-blue-700 transition duration-150";

    return (
        <button 
            onClick={handleDownload} 
            className={`${buttonClass} px-3 py-1 rounded-md text-sm font-semibold`}
        >
            <span role="img" aria-label="download">⬇️</span> Download CSV ({data.length})
        </button>
    );
};

export default CsvExporter;
