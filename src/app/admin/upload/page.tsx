// app/admin/upload/page.tsx
'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

type ImportType = 'projects' | 'tasks';
type ImportMode = 'create' | 'update' | 'upsert';

export default function AdminUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [importType, setImportType] = useState<ImportType>('projects');
  const [importMode, setImportMode] = useState<ImportMode>('upsert');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setMessage(null);
      setPreview([]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        const previewRows = data.preview || [];
        setPreview(previewRows);
        setColumns(data.columns || []);
        const rowCount = data.totalRows ?? previewRows.length ?? 0;
        const successText = rowCount > 0
          ? `✅ Parsed ${rowCount} rows. Ready to import!`
          : (data.message || '✅ File uploaded successfully');
        setMessage({ type: 'success', text: successText });
      } else {
        setMessage({ type: 'error', text: `❌ Error: ${data.error}` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '❌ Upload failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    try {
      // Read file again to get all data
      const bytes = await file.arrayBuffer();
      const workbook = XLSX.read(bytes, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(worksheet);

      const res = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, type: importType, mode: importMode }),
      });

      const result = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: `✅ Successfully imported ${result.imported} ${importType}!` });
        setPreview([]);
        setFile(null);
        setColumns([]);
      } else {
        setMessage({ type: 'error', text: `❌ Error: ${result.error}` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '❌ Import failed' });
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = importType === 'projects'
      ? [
          { name: 'Project A', team: 'Engineering', status: 'In Progress', deadline: '2026-12-31', progress: 50, budget: 100000, revenue: 150000 },
          { name: 'Project B', team: 'Design', status: 'Planning', deadline: '2026-06-30', progress: 10, budget: 50000, revenue: 80000 },
        ]
      : [
          { title: 'Task 1', projectId: 'p1', assignee: 'Wichai', status: 'In Progress', priority: 'High' },
          { title: 'Task 2', projectId: 'p2', assignee: 'Somsri', status: 'Todo', priority: 'Medium' },
        ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, `${importType}-template.xlsx`);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Admin - Excel Import</h1>
          <p className="text-slate-500">Upload and import data from Excel files</p>
        </div>

        {/* Import Type Selection */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">1. Select Import Type</h2>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setImportType('projects')}
              className={cn(
                'px-6 py-3 rounded-xl font-medium transition-all',
                importType === 'projects'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              📊 Projects
            </button>
            <button
              type="button"
              onClick={() => setImportType('tasks')}
              className={cn(
                'px-6 py-3 rounded-xl font-medium transition-all',
                importType === 'tasks'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              ✅ Tasks
            </button>
            <button
              type="button"
              onClick={downloadTemplate}
              className="ml-auto px-6 py-3 rounded-xl font-medium bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Template
            </button>
          </div>
        </div>

        {/* File Upload */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">2. Upload Excel File</h2>
          
          <div className="flex items-center gap-4 mb-4">
            <label className="flex-1">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-indigo-400 transition-colors cursor-pointer bg-slate-50">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <FileSpreadsheet className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                <p className="text-sm text-slate-600 mb-1">
                  {file ? file.name : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-slate-400">Excel files (.xlsx, .xls)</p>
              </div>
            </label>
          </div>

          {file && !preview.length && (
            <button
              type="button"
              onClick={handleUpload}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload & Preview
                </>
              )}
            </button>
          )}
        </div>

        {/* Preview */}
        {preview.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-slate-700 mb-4">3. Preview Data</h2>
            
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full border rounded-lg">
                <thead>
                  <tr className="bg-slate-50">
                    {columns.map((col) => (
                      <th
                        key={col}
                        className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i} className="border-t hover:bg-slate-50">
                      {columns.map((col) => (
                        <td key={col} className="px-4 py-3 text-sm text-slate-600">
                          {row[col]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-slate-400 mt-2">
                Showing {preview.length} of {columns.length} columns
              </p>
            </div>

            {/* Import Mode */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Import Mode</h3>
              <div className="flex gap-3">
                {[
                  { value: 'upsert', label: 'Upsert', desc: 'Create new + Update existing' },
                  { value: 'create', label: 'Create Only', desc: 'Skip if exists' },
                  { value: 'update', label: 'Update Only', desc: 'Skip if not exists' },
                ].map((mode) => (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => setImportMode(mode.value as ImportMode)}
                    className={cn(
                      'flex-1 p-3 rounded-xl border-2 transition-all text-left',
                      importMode === mode.value
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <div className="font-medium text-slate-700">{mode.label}</div>
                    <div className="text-xs text-slate-500">{mode.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Import Button */}
            <button
              type="button"
              onClick={handleImport}
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Import {preview.length} Rows
                </>
              )}
            </button>
          </div>
        )}

        {/* Message */}
        {message && (
          <div
            className={cn(
              'p-4 rounded-xl flex items-center gap-3',
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            )}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        {/* Back Link */}
        <div className="mt-8">
          <a
            href="/"
            className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-2"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
