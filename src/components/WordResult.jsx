import React from 'react';

export default function WordResult({ summary, rows, onReset }) {
  const handleDownload = () => {
    let content = "SUMMARY:\n" + (summary || "") + "\n\n";
    
    if (rows && rows.length > 0) {
      content += "DATA ROWS:\n";
      const headers = Object.keys(rows[0]);
      content += headers.join(' | ') + '\n';
      content += headers.map(() => '---').join(' | ') + '\n';
      
      rows.forEach(row => {
        content += headers.map(h => row[h]).join(' | ') + '\n';
      });
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "extracted_summary.txt");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = () => {
    let content = "SUMMARY:\n" + (summary || "") + "\n\n";
    if (rows && rows.length > 0) {
      content += "DATA ROWS:\n";
      const headers = Object.keys(rows[0]);
      content += headers.join(' | ') + '\n';
      content += headers.map(() => '---').join(' | ') + '\n';
      
      rows.forEach(row => {
        content += headers.map(h => row[h]).join(' | ') + '\n';
      });
    }
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 mt-8 z-10 relative">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-zinc-100">Document Summary</h2>
        <div className="flex gap-3">
          <button onClick={handleCopy} className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors cursor-pointer z-20">
            Copy
          </button>
          <button onClick={handleDownload} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors cursor-pointer z-20">
            Download .txt
          </button>
          <button onClick={onReset} className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors cursor-pointer z-20">
            Start Over
          </button>
        </div>
      </div>
      
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-zinc-300 leading-relaxed space-y-4">
        {summary ? (
          <p>{summary}</p>
        ) : (
          <p className="text-zinc-500">No summary generated.</p>
        )}
      </div>

      {rows && rows.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-zinc-200 mb-3">Extracted Data</h3>
          <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/50 p-1">
            <table className="w-full text-left text-sm text-zinc-300 whitespace-nowrap">
              <thead className="bg-zinc-800 text-zinc-100">
                <tr>
                  {Object.keys(rows[0]).map(key => (
                    <th key={key} className="px-4 py-3 font-semibold">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-zinc-800/50">
                    {Object.keys(rows[0]).map(key => (
                      <td key={key} className="px-4 py-3">{row[key]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
