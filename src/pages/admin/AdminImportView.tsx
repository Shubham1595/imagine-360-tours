import React, { useState, useEffect, useRef } from 'react';
import { importApi } from '../../lib/api';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  RefreshCw,
  FileText,
  AlertCircle,
  Eye,
  Clock,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { Modal } from '../../components/Modal';

export const AdminImportView: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stepper state: 'upload' -> 'mapping' -> 'validation' -> 'success'
  const [step, setStep] = useState<'upload' | 'mapping' | 'validation' | 'success'>('upload');

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any | null>(null);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [validationStats, setValidationStats] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [batches, setBatches] = useState<any[]>([]);
  const [activeBatchErrors, setActiveBatchErrors] = useState<any | null>(null);

  const standardFields = [
    { key: 'name', label: 'Customer Name *', required: true },
    { key: 'phone', label: 'Phone Number *', required: true },
    { key: 'email', label: 'Email Address', required: false },
    { key: 'company', label: 'Company / Organization', required: false },
    { key: 'website', label: 'Website / URL', required: false },
    { key: 'address', label: 'Customer Address', required: false },
    { key: 'city', label: 'City', required: false },
    { key: 'state', label: 'State', required: false },
    { key: 'pincode', label: 'Pincode / Postal Code', required: false },
    { key: 'map_url', label: 'Location Link / Map URL', required: false },
    { key: 'latitude', label: 'Latitude', required: false },
    { key: 'longitude', label: 'Longitude', required: false },
    { key: 'coordinates', label: 'Coordinates (Lat, Lng)', required: false },
    { key: 'service', label: 'Interested Service', required: false },
    { key: 'source', label: 'Lead Source', required: false },
    { key: 'classification', label: 'Lead Classification (COLD / WARM / HOT)', required: false },
    { key: 'stage', label: 'Current Sales Stage (01 to 08)', required: false },
    { key: 'priority', label: 'Priority (LOW / MEDIUM / HIGH / URGENT)', required: false },
    { key: 'estimated_deal_value', label: 'Estimated Deal Value (₹)', required: false },
    { key: 'closing_probability', label: 'Closing Probability (%)', required: false },
    { key: 'expected_closing_date', label: 'Expected Closing Date (YYYY-MM-DD)', required: false },
    { key: 'next_follow_up_date', label: 'Next Follow-up Date (YYYY-MM-DD)', required: false },
    { key: 'final_result', label: 'Final Result (WON / LOST)', required: false },
  ];

  const fetchBatches = async () => {
    try {
      const res = await importApi.getBatches();
      if (res.success && res.data) {
        setBatches(res.data);
      }
    } catch {}
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    setIsProcessing(true);
    try {
      const res = await importApi.uploadFile(file);
      if (res.success && res.data) {
        setParsedData(res.data);
        setColumnMapping(res.data.suggestedMapping || {});
        setStep('mapping');
      }
    } catch (err: any) {
      alert(err.message || 'Error uploading file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleRunValidation = async () => {
    if (!parsedData?.rawRows) return;
    setIsProcessing(true);
    try {
      const res = await importApi.validateRows(parsedData.rawRows, columnMapping);
      if (res.success && res.data) {
        setValidationStats(res.data);
        setStep('validation');
      }
    } catch (err: any) {
      alert(err.message || 'Error validating rows.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!validationStats) return;
    setIsProcessing(true);
    try {
      const res = await importApi.confirmImport({
        filename: parsedData.filename,
        validRecords: validationStats.validSample || [],
        duplicates: validationStats.duplicateSample || [],
        invalidRecords: validationStats.invalidSample || [],
      });
      if (res.success) {
        setStep('success');
        fetchBatches();
      }
    } catch (err: any) {
      alert(err.message || 'Error confirming import.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewBatchErrors = async (batchId: string) => {
    try {
      const res = await importApi.getBatchErrors(batchId);
      if (res.success && res.data) {
        setActiveBatchErrors(res.data);
      }
    } catch (err: any) {
      alert(err.message || 'Error loading batch error details.');
    }
  };

  return (
    <div className="space-y-8">
      {/* View Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white tracking-tight uppercase">
          CSV / Excel Lead Import Pipeline
        </h2>
        <p className="text-xs font-mono text-[#9BA3AE] mt-0.5">
          Bulk import leads from external directories, trade shows, and campaigns with automated duplicate resolution.
        </p>
      </div>

      {/* Interactive Pipeline Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#101419] border border-white/10 shadow-2xl space-y-6">
        {/* Pipeline Stepper Navigation */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 font-mono text-xs overflow-x-auto">
          <div className={`flex items-center gap-2 ${step === 'upload' ? 'text-[#00F2FE] font-bold' : 'text-[#9BA3AE]'}`}>
            <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px]">1</span>
            <span>Upload File</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#9BA3AE]" />

          <div className={`flex items-center gap-2 ${step === 'mapping' ? 'text-[#00F2FE] font-bold' : 'text-[#9BA3AE]'}`}>
            <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px]">2</span>
            <span>Column Mapping</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#9BA3AE]" />

          <div className={`flex items-center gap-2 ${step === 'validation' ? 'text-[#00F2FE] font-bold' : 'text-[#9BA3AE]'}`}>
            <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px]">3</span>
            <span>Validation & Duplicates</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#9BA3AE]" />

          <div className={`flex items-center gap-2 ${step === 'success' ? 'text-emerald-400 font-bold' : 'text-[#9BA3AE]'}`}>
            <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px]">4</span>
            <span>Import Results</span>
          </div>
        </div>

        {/* STEP 1: Upload Dropzone */}
        {step === 'upload' && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-white/15 hover:border-[#00F2FE]/50 rounded-2xl p-12 text-center transition-all bg-[#07090C]/50 cursor-pointer space-y-4 group"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />

            <div className="w-16 h-16 rounded-2xl bg-[#101419] border border-white/10 group-hover:border-[#00F2FE] flex items-center justify-center mx-auto text-[#00F2FE] transition-colors">
              <Upload className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-heading font-bold text-white group-hover:text-[#00F2FE] transition-colors">
                Drag & Drop Leads Spreadsheet (.csv, .xlsx, .xls)
              </h3>
              <p className="text-xs text-[#9BA3AE] mt-1 font-mono">
                Supports unlimited rows, automatic column detection, and format cleaning.
              </p>
            </div>

            <button
              type="button"
              className="px-5 py-2.5 rounded-xl font-tech text-xs font-semibold bg-[#151D28] text-white border border-white/10 group-hover:border-[#00F2FE]/40"
            >
              Browse Files on Computer
            </button>
          </div>
        )}

        {/* STEP 2: Column Mapping */}
        {step === 'mapping' && parsedData && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-heading font-bold text-white">
                  Map File Columns to CRM Fields
                </h3>
                <p className="text-xs font-mono text-[#9BA3AE]">
                  File: <strong className="text-white">{parsedData.filename}</strong> ({parsedData.totalRows} rows detected)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
              {parsedData.detectedColumns.map((col: string) => (
                <div key={col} className="p-3.5 rounded-xl bg-[#07090C] border border-white/10 flex items-center justify-between gap-3">
                  <div className="truncate">
                    <span className="text-[10px] text-[#9BA3AE] block uppercase">Spreadsheet Column</span>
                    <span className="text-white font-semibold truncate">{col}</span>
                  </div>

                  <ArrowRight className="w-4 h-4 text-[#00F2FE] shrink-0" />

                  <div className="w-48 shrink-0">
                    <select
                      value={columnMapping[col] || ''}
                      onChange={(e) => setColumnMapping({ ...columnMapping, [col]: e.target.value })}
                      className="w-full bg-[#101419] border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#00F2FE]"
                    >
                      <option value="">-- Ignore Field --</option>
                      {standardFields.map((f) => (
                        <option key={f.key} value={f.key}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setStep('upload')}
                className="px-4 py-2 rounded-xl text-xs font-mono text-[#9BA3AE] bg-[#07090C]"
              >
                Upload Different File
              </button>
              <button
                type="button"
                onClick={handleRunValidation}
                disabled={isProcessing}
                className="px-6 py-2.5 rounded-xl text-xs font-tech font-bold bg-[#00F2FE] text-[#07090C] flex items-center gap-2 cursor-pointer"
              >
                {isProcessing ? 'Validating Dataset...' : 'Validate & Check Duplicates'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Validation & Preview */}
        {step === 'validation' && validationStats && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-heading font-bold text-white">
                Validation & Duplicate Scan Results
              </h3>
              <p className="text-xs font-mono text-[#9BA3AE] mt-0.5">
                Every record is cross-checked against existing phone numbers and emails in the database.
              </p>
            </div>

            {/* 4 Stat Breakdown Blocks */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
              <div className="p-4 rounded-xl bg-[#07090C] border border-white/10 text-center">
                <span className="text-[#9BA3AE] block mb-1">TOTAL ROWS</span>
                <span className="text-2xl font-heading font-bold text-white">{validationStats.total}</span>
              </div>
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-center">
                <span className="text-emerald-300 block mb-1">VALID TO INSERT</span>
                <span className="text-2xl font-heading font-bold text-emerald-300">{validationStats.validCount}</span>
              </div>
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-center">
                <span className="text-amber-300 block mb-1">DUPLICATES IDENTIFIED</span>
                <span className="text-2xl font-heading font-bold text-amber-300">{validationStats.duplicateCount}</span>
              </div>
              <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 text-center">
                <span className="text-red-300 block mb-1">INVALID ROWS</span>
                <span className="text-2xl font-heading font-bold text-red-300">{validationStats.invalidCount}</span>
              </div>
            </div>

            {/* Sample Valid Preview */}
            <div className="space-y-2 font-mono text-xs">
              <span className="text-[#CBD5E1] uppercase font-semibold text-[11px] block">
                Preview Sample (First 5 records ready for insertion):
              </span>
              <div className="rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#07090C] text-[#9BA3AE]">
                    <tr>
                      <th className="p-2.5">Name</th>
                      <th className="p-2.5">Phone</th>
                      <th className="p-2.5">Email</th>
                      <th className="p-2.5">Company</th>
                      <th className="p-2.5">Website</th>
                      <th className="p-2.5">Service</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 bg-[#101419]">
                    {validationStats.validSample.slice(0, 5).map((row: any, i: number) => (
                      <tr key={i} className="text-white">
                        <td className="p-2.5">{row.data?.name}</td>
                        <td className="p-2.5 text-[#00F2FE]">{row.data?.phone}</td>
                        <td className="p-2.5 text-[#9BA3AE]">{row.data?.email || '—'}</td>
                        <td className="p-2.5">{row.data?.company || '—'}</td>
                        <td className="p-2.5 text-[#00F2FE] truncate max-w-[120px]">{row.data?.website || '—'}</td>
                        <td className="p-2.5">{row.data?.service || 'Spatial Tech'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setStep('mapping')}
                className="px-4 py-2 rounded-xl text-xs font-mono text-[#9BA3AE] bg-[#07090C]"
              >
                Back to Mapping
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={isProcessing || validationStats.validCount === 0}
                className="px-6 py-2.5 rounded-xl text-xs font-tech font-bold bg-gradient-to-r from-[#00F2FE] to-[#4FACFE] text-[#07090C] disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? 'Executing Import Batch...' : `Import ${validationStats.validCount} Valid Records`}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Success confirmation */}
        {step === 'success' && (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-heading font-bold text-white">Import Batch Successfully Processed</h3>
            <p className="text-xs text-[#9BA3AE] max-w-md mx-auto font-mono">
              The records have been inserted into the MySQL database with initialized WARM leads and scheduled follow-ups.
            </p>
            <div className="pt-4">
              <button
                onClick={() => setStep('upload')}
                className="px-6 py-2.5 rounded-xl text-xs font-mono bg-[#07090C] border border-white/10 text-white hover:border-[#00F2FE]/40"
              >
                Import Another File
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Historical Import Batches */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#101419] border border-white/10 space-y-4 shadow-xl">
        <h3 className="text-lg font-heading font-bold text-white">Import Batch History</h3>
        <p className="text-xs font-mono text-[#9BA3AE]">
          Audit record of every uploaded CSV/Excel spreadsheet and non-destructive error logs.
        </p>

        <div className="rounded-xl border border-white/10 overflow-hidden font-mono text-xs">
          <table className="w-full text-left">
            <thead className="bg-[#07090C] text-[#9BA3AE] text-[10px] uppercase">
              <tr>
                <th className="p-3">Filename</th>
                <th className="p-3">Uploaded Date</th>
                <th className="p-3">Total Rows</th>
                <th className="p-3">Imported</th>
                <th className="p-3">Duplicates</th>
                <th className="p-3">Failed</th>
                <th className="p-3 text-right">Error Log</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-[#101419]">
              {batches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-[#9BA3AE]">
                    No import batches on record yet.
                  </td>
                </tr>
              ) : (
                batches.map((b) => (
                  <tr key={b.id} className="hover:bg-white/5">
                    <td className="p-3 font-semibold text-white">{b.filename}</td>
                    <td className="p-3 text-[#9BA3AE]">{new Date(b.created_at).toLocaleString()}</td>
                    <td className="p-3">{b.total_records}</td>
                    <td className="p-3 text-emerald-400 font-bold">{b.successful_records}</td>
                    <td className="p-3 text-amber-300">{b.duplicate_records}</td>
                    <td className="p-3 text-red-400">{b.failed_records}</td>
                    <td className="p-3 text-right">
                      {b.failed_records > 0 || b.duplicate_records > 0 ? (
                        <button
                          onClick={() => handleViewBatchErrors(b.id)}
                          className="px-2.5 py-1 rounded bg-[#07090C] border border-white/10 text-[10px] text-[#00F2FE] hover:underline"
                        >
                          View Details
                        </button>
                      ) : (
                        <span className="text-[10px] text-[#64748B]">Clean</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Batch Errors Modal */}
      {activeBatchErrors && (
        <Modal
          isOpen={!!activeBatchErrors}
          onClose={() => setActiveBatchErrors(null)}
          title={`Batch Details: ${activeBatchErrors.batch.filename}`}
          subtitle={`IMPORT LOG // ${activeBatchErrors.errors.length} EXCEPTIONS IDENTIFIED`}
          maxWidth="2xl"
        >
          <div className="space-y-4 font-mono text-xs">
            <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
              {activeBatchErrors.errors.map((err: any) => (
                <div key={err.id} className="p-3 rounded-lg bg-[#07090C] border border-white/5 space-y-1">
                  <div className="flex items-center justify-between text-[#9BA3AE]">
                    <span>Row #{err.row_number}</span>
                    <span className="text-red-400 font-semibold">{err.error_message}</span>
                  </div>
                  {err.raw_data && (
                    <div className="text-[11px] text-[#64748B] truncate">{err.raw_data}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
