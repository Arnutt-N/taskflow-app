'use client';

import { useState } from 'react';
import { Download, Upload, FileSpreadsheet, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

interface ImportExportToolbarProps {
  type: 'tasks' | 'projects';
  onImportSuccess?: () => void;
  className?: string;
}

export function ImportExportToolbar({ type, onImportSuccess, className = '' }: ImportExportToolbarProps) {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showImport, setShowImport] = useState(false);

  // ── Export ──────────────────────────────────────────────────────────────────
  async function handleExport() {
    setExporting(true);
    const toastId = toast.loading(`Preparing ${type} export...`);
    try {
      const res = await fetch(`/api/export/${type}`);
      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} exported successfully!`, { id: toastId });
    } catch {
      toast.error('Export failed. Please try again.', { id: toastId });
    } finally {
      setExporting(false);
    }
  }

  // ── Import ──────────────────────────────────────────────────────────────────
  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const toastId = toast.loading(`Importing ${file.name}...`);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const res = await fetch('/api/import', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Import failed');

      toast.success(`Imported ${data.count ?? 'all'} records successfully!`, { id: toastId });
      setShowImport(false);
      onImportSuccess?.();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Import failed', { id: toastId });
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Export button */}
      <button
        onClick={handleExport}
        disabled={exporting}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors disabled:opacity-50"
        title={`Export ${type} to Excel`}
      >
        {exporting ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Download className="w-3.5 h-3.5" />
        )}
        Export
      </button>

      {/* Import button */}
      <div className="relative">
        <button
          onClick={() => setShowImport(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
          title={`Import ${type} from Excel`}
        >
          <Upload className="w-3.5 h-3.5" />
          Import
        </button>

        {/* Import Popover */}
        {showImport && (
          <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl border border-slate-200 shadow-xl z-30 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-semibold text-slate-800">Import from Excel</span>
              </div>
              <button onClick={() => setShowImport(false)} className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Upload an <code>.xlsx</code> file. Existing records won&apos;t be overwritten.
              Make sure column headers match the export format.
            </p>
            <label className="w-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl py-4 px-3 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors">
              <Upload className="w-6 h-6 text-slate-300 mb-2" />
              <span className="text-xs font-medium text-slate-500">Click to choose file</span>
              <span className="text-[11px] text-slate-400 mt-0.5">Supports .xlsx only</span>
              <input
                type="file"
                accept=".xlsx"
                className="hidden"
                onChange={handleImport}
                disabled={importing}
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
