import React, { useState, useEffect } from 'react';
import { IncidentReport } from '../types';
import { MapPin, Calendar, User, FileText, AlertTriangle, Lightbulb, Clock, Activity, Ambulance, X, ZoomIn } from 'lucide-react';

interface ReportFormProps {
  data: IncidentReport;
  images?: File[]; // Optional images for preview
  onChange: (data: IncidentReport) => void;
}

export const ReportForm: React.FC<ReportFormProps> = ({ data, images = [], onChange }) => {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  useEffect(() => {
    if (images.length > 0) {
      const urls = images.map(file => URL.createObjectURL(file));
      setImageUrls(urls);
      // Cleanup URLs on unmount
      return () => urls.forEach(url => URL.revokeObjectURL(url));
    } else {
      setImageUrls([]);
    }
  }, [images]);

  const handleChange = (field: keyof IncidentReport, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative">
      
      {/* Image Preview Section */}
      {imageUrls.length > 0 && (
        <div className="mb-6">
          <label className="text-xs font-semibold uppercase text-gray-500 mb-2 block">
            原始報告 (點擊放大)
          </label>
          <div className="flex space-x-3 overflow-x-auto pb-2">
            {imageUrls.map((url, idx) => (
              <div 
                key={idx} 
                className="relative group cursor-zoom-in flex-shrink-0 w-24 h-32 border border-gray-200 rounded-lg overflow-hidden bg-gray-100"
                onClick={() => setZoomedImage(url)}
              >
                <img src={url} alt={`Page ${idx + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                   <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 drop-shadow-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Zoom Modal */}
      {zoomedImage && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4" onClick={() => setZoomedImage(null)}>
          <button className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-full">
            <X className="w-8 h-8" />
          </button>
          <img 
            src={zoomedImage} 
            alt="Zoomed Report" 
            className="max-w-full max-h-full object-contain rounded shadow-2xl"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
          />
        </div>
      )}

      {/* Form Fields */}
      <div className="space-y-1">
        <label className="text-xs font-semibold uppercase text-gray-500 flex items-center">
          <User className="w-3 h-3 mr-1" /> 住客姓名 (Name)
        </label>
        <input
          type="text"
          value={data.residentName}
          onChange={(e) => handleChange('residentName', e.target.value)}
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Date */}
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase text-gray-500 flex items-center">
            <Calendar className="w-3 h-3 mr-1" /> 發生日期 (Date)
          </label>
          <input
            type="date"
            value={data.incidentDate}
            onChange={(e) => handleChange('incidentDate', e.target.value)}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
          />
        </div>

        {/* Time */}
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase text-gray-500 flex items-center">
            <Clock className="w-3 h-3 mr-1" /> 發生時間 (Time)
          </label>
          <input
            type="time"
            value={data.incidentTime}
            onChange={(e) => handleChange('incidentTime', e.target.value)}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Location */}
      <div className="space-y-1">
        <label className="text-xs font-semibold uppercase text-gray-500 flex items-center">
          <MapPin className="w-3 h-3 mr-1" /> 發生地點 (Location)
        </label>
        <input
          type="text"
          value={data.location}
          onChange={(e) => handleChange('location', e.target.value)}
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
        />
      </div>

      <div className="h-px bg-gray-100 my-2" />

      {/* Injury Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase text-gray-500 flex items-center">
            <Activity className="w-3 h-3 mr-1" /> 有否受傷?
          </label>
          <select
            value={data.hasInjury || '沒有'}
            onChange={(e) => handleChange('hasInjury', e.target.value)}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all appearance-none"
          >
            <option value="有">有</option>
            <option value="沒有">沒有</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase text-gray-500 flex items-center">
             傷勢詳情
          </label>
          <input
            type="text"
            value={data.injuryDetails || ''}
            onChange={(e) => handleChange('injuryDetails', e.target.value)}
            disabled={data.hasInjury === '沒有'}
            className={`w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all ${
              data.hasInjury === '沒有' ? 'bg-gray-100 text-gray-400' : 'bg-gray-50'
            }`}
            placeholder={data.hasInjury === '沒有' ? '不適用' : '例如：左手擦傷'}
          />
        </div>
      </div>

      {/* Hospitalization Section */}
      <div className="space-y-1">
        <label className="text-xs font-semibold uppercase text-gray-500 flex items-center">
          <Ambulance className="w-3 h-3 mr-1" /> 有否送院?
        </label>
        <select
          value={data.hospitalizationStatus || '沒有'}
          onChange={(e) => handleChange('hospitalizationStatus', e.target.value)}
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all appearance-none"
        >
          <option value="有">有</option>
          <option value="沒有">沒有</option>
        </select>
      </div>

      <div className="h-px bg-gray-100 my-2" />

      {/* Description */}
      <div className="space-y-1">
        <label className="text-xs font-semibold uppercase text-gray-500 flex items-center">
          <FileText className="w-3 h-3 mr-1" /> 事發經過 (Description)
        </label>
        <textarea
          value={data.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={3}
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all resize-none"
        />
      </div>

      {/* AI Analysis Section */}
      <div className="bg-teal-50 p-4 rounded-lg space-y-4 border border-teal-100 mt-4">
        <h3 className="text-teal-800 font-semibold flex items-center text-sm">
           AI 智能分析 (AI Analysis)
        </h3>
        
        {/* Root Cause */}
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase text-teal-700 flex items-center">
            <AlertTriangle className="w-3 h-3 mr-1" /> 原因分析 (Root Cause)
          </label>
          <textarea
            value={data.rootCauseAnalysis}
            onChange={(e) => handleChange('rootCauseAnalysis', e.target.value)}
            rows={2}
            className="w-full p-3 bg-white border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all resize-none text-gray-800"
          />
        </div>

         {/* Suggested Action */}
         <div className="space-y-1">
          <label className="text-xs font-semibold uppercase text-teal-700 flex items-center">
            <Lightbulb className="w-3 h-3 mr-1" /> 建議跟進 (Suggested Action)
          </label>
          <textarea
            value={data.suggestedAction}
            onChange={(e) => handleChange('suggestedAction', e.target.value)}
            rows={2}
            className="w-full p-3 bg-white border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all resize-none text-gray-800"
          />
        </div>
      </div>
    </div>
  );
};