import React, { useState, useEffect } from 'react';
import { FileDown, Copy, CheckCircle2, ClipboardList, ShieldAlert, History, Trash2, ChevronRight, Plus, Edit3, Save } from 'lucide-react';
import { ImageUploader } from './components/ImageUploader';
import { ReportForm } from './components/ReportForm';
import { Button } from './components/Button';
import { analyzeIncidentReport } from './services/gemini';
import { downloadCSV, copyToClipboard } from './services/csv';
import { getStoredReports, saveReport, deleteReport } from './services/storage';
import { AppStep, IncidentReport, ProcessingState } from './types';

const App = () => {
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD);
  const [reportData, setReportData] = useState<IncidentReport | null>(null);
  const [processing, setProcessing] = useState<ProcessingState>({ status: 'idle' });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // History State
  const [view, setView] = useState<'scan' | 'history'>('scan');
  const [history, setHistory] = useState<IncidentReport[]>([]);

  useEffect(() => {
    // Load history on mount
    setHistory(getStoredReports());
  }, []);

  const handleImagesSelected = (files: File[]) => {
    setSelectedFiles(files);
  };

  const handleAnalyze = async () => {
    if (selectedFiles.length === 0) return;

    setStep(AppStep.PROCESSING);
    setProcessing({ status: 'analyzing' });

    try {
      const data = await analyzeIncidentReport(selectedFiles);
      
      // Add ID and Timestamp for storage
      const newReport: IncidentReport = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      };

      setReportData(newReport);
      
      // Automatically save to local storage
      const updatedHistory = saveReport(newReport);
      setHistory(updatedHistory);
      setLastSaved(new Date());

      setStep(AppStep.REVIEW);
      setProcessing({ status: 'idle' });
    } catch (error) {
      console.error(error);
      setProcessing({ status: 'error', errorMessage: '分析失敗，請重試或確保圖片清晰。' });
      setStep(AppStep.UPLOAD);
    }
  };

  const handleUpdateReport = (updatedData: IncidentReport) => {
    setReportData(updatedData);
    // Auto-save updates if it's already in the system
    if (updatedData.id) {
      const updatedHistory = saveReport(updatedData);
      setHistory(updatedHistory);
      setLastSaved(new Date());
    }
  };

  const handleDownload = () => {
    if (reportData) {
      downloadCSV(reportData);
    }
  };

  const handleCopy = async () => {
    if (reportData) {
      const success = await copyToClipboard(reportData);
      if (success) {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }
    }
  };

  const handleReset = () => {
    setStep(AppStep.UPLOAD);
    setReportData(null);
    setSelectedFiles([]);
    setProcessing({ status: 'idle' });
    setLastSaved(null);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('確定要刪除這份報告嗎？')) {
      const updated = deleteReport(id);
      setHistory(updated);
      if (reportData && reportData.id === id) {
        handleReset();
      }
    }
  };

  const openFromHistory = (report: IncidentReport) => {
    setReportData(report);
    setStep(AppStep.REVIEW);
    setView('scan');
    // Clear selected files when viewing history as we don't store images locally to save space
    setSelectedFiles([]); 
    setLastSaved(null); // Reset save timer indicator
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20 font-[sans-serif]">
      {/* Header */}
      <header className="bg-teal-700 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => {setView('scan'); handleReset();}}>
            <ShieldAlert className="w-8 h-8" />
            <div>
              <h1 className="text-xl font-bold tracking-tight">SafetyLens</h1>
              <p className="text-xs text-teal-100 opacity-90">安老院意外報告分析 (AI)</p>
            </div>
          </div>
          
          <div className="flex bg-teal-800 rounded-lg p-1">
            <button 
              onClick={() => setView('scan')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'scan' ? 'bg-white text-teal-800 shadow-sm' : 'text-teal-100 hover:text-white'}`}
            >
              掃描
            </button>
            <button 
              onClick={() => setView('history')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'history' ? 'bg-white text-teal-800 shadow-sm' : 'text-teal-100 hover:text-white'}`}
            >
              紀錄
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        
        {/* VIEW: HISTORY */}
        {view === 'history' && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <History className="w-5 h-5 mr-2 text-teal-600"/> 
              歷史紀錄 ({history.length})
            </h2>
            
            {history.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ClipboardList className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-gray-900 font-medium">暫無紀錄</h3>
                <p className="text-gray-500 text-sm mt-1">請拍攝意外報告以進行分析及儲存。</p>
                <Button variant="outline" className="mt-4" onClick={() => setView('scan')}>
                  開始掃描
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((report) => (
                  <div 
                    key={report.id}
                    onClick={() => openFromHistory(report)}
                    className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:border-teal-300 hover:shadow-md transition-all cursor-pointer group relative"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-gray-800 flex items-center">
                          {report.residentName || '未知姓名'}
                          <Edit3 className="w-3 h-3 ml-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 flex items-center">
                          <span className="bg-gray-100 px-2 py-0.5 rounded text-xs mr-2 text-gray-600">{report.incidentDate || '--'}</span>
                          {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-teal-500" />
                    </div>
                    <div className="mt-3 text-sm text-gray-600 line-clamp-2">
                       <span className="font-semibold text-teal-700">原因:</span> {report.rootCauseAnalysis}
                    </div>
                    
                    <button 
                      onClick={(e) => handleDelete(e, report.id)}
                      className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors z-10"
                      title="刪除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW: SCAN / EDIT */}
        {view === 'scan' && (
          <>
            {/* Step: Upload */}
            {step === AppStep.UPLOAD && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                   <h2 className="text-lg font-semibold text-gray-800 mb-2">新增意外紀錄</h2>
                   <p className="text-gray-500 mb-6">請拍攝意外報告（支援兩張圖片）。AI 將自動識別文字並進行分析。</p>
                   <ImageUploader onImagesSelected={handleImagesSelected} />
                 </div>
                 
                 {selectedFiles.length > 0 && (
                   <div className="fixed bottom-6 left-0 right-0 px-4 max-w-3xl mx-auto z-40">
                     <Button 
                       onClick={handleAnalyze} 
                       className="w-full shadow-xl"
                       icon={<ClipboardList className="w-5 h-5"/>}
                     >
                       開始分析 ({selectedFiles.length})
                     </Button>
                   </div>
                 )}
              </div>
            )}

            {/* Step: Processing */}
            {step === AppStep.PROCESSING && (
              <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ShieldAlert className="w-6 h-6 text-teal-600" />
                  </div>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-800">正在分析報告...</h3>
                <p className="text-gray-500 mt-2 text-center max-w-xs">正在識別手寫文字並進行根本原因分析 (Root Cause Analysis)。</p>
              </div>
            )}

            {/* Step: Review */}
            {step === AppStep.REVIEW && reportData && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
                <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100 sticky top-20 z-30">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800 flex items-center">
                      <Edit3 className="w-5 h-5 mr-2 text-teal-600" />
                      核對及修改資料
                    </h2>
                    <p className={`text-xs font-medium flex items-center mt-1 transition-colors ${lastSaved ? 'text-green-600' : 'text-gray-400'}`}>
                      {lastSaved ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 mr-1"/> 
                          已儲存變更 ({lastSaved.toLocaleTimeString()})
                        </>
                      ) : (
                        <>
                          <Save className="w-3 h-3 mr-1"/>
                          編輯內容會自動儲存
                        </>
                      )}
                    </p>
                  </div>
                  <button onClick={handleReset} className="text-teal-600 text-sm font-medium hover:underline flex items-center px-3 py-2 bg-teal-50 rounded-lg">
                    <Plus className="w-4 h-4 mr-1"/> 新增
                  </button>
                </div>

                <ReportForm 
                  data={reportData} 
                  images={selectedFiles}
                  onChange={handleUpdateReport} 
                />

                <div className="grid grid-cols-2 gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={handleCopy}
                    icon={copySuccess ? <CheckCircle2 className="w-4 h-4 text-green-600"/> : <Copy className="w-4 h-4"/>}
                  >
                    {copySuccess ? '已複製' : '複製資料'}
                  </Button>
                  <Button 
                    onClick={handleDownload}
                    icon={<FileDown className="w-4 h-4"/>}
                  >
                    下載 CSV
                  </Button>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-700 border border-blue-100 mt-4">
                  <p className="font-semibold mb-1">提示：</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-600">
                    <li>您可以直接點擊上方表格修改任何錯誤資料。</li>
                    <li>所有修改會<b>自動儲存</b>至手機紀錄。</li>
                  </ul>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;