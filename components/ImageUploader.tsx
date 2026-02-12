import React, { useRef, useState } from 'react';
import { Camera, Upload, X, FileImage } from 'lucide-react';
import { Button } from './Button';

interface ImageUploaderProps {
  onImagesSelected: (files: File[]) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImagesSelected }) => {
  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<(File | null)[]>([null, null]);
  const [previews, setPreviews] = useState<(string | null)[]>([null, null]);

  const handleFileChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPreviews = [...previews];
        newPreviews[index] = reader.result as string;
        setPreviews(newPreviews);
        
        const newImages = [...images];
        newImages[index] = file;
        setImages(newImages);
        
        // Pass only valid files to parent
        onImagesSelected(newImages.filter((img): img is File => img !== null));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newPreviews = [...previews];
    newPreviews[index] = null;
    setPreviews(newPreviews);
    
    const newImages = [...images];
    newImages[index] = null;
    setImages(newImages);
    
    // Clear input value so same file can be selected again if needed
    if (index === 0 && fileInputRef1.current) fileInputRef1.current.value = '';
    if (index === 1 && fileInputRef2.current) fileInputRef2.current.value = '';

    onImagesSelected(newImages.filter((img): img is File => img !== null));
  };

  const renderUploadBox = (index: number, label: string, ref: React.RefObject<HTMLInputElement>) => {
    const preview = previews[index];

    return (
      <div className="flex-1">
        <input
          type="file"
          ref={ref}
          onChange={(e) => handleFileChange(index, e)}
          accept="image/*"
          capture="environment"
          className="hidden"
        />
        
        {!preview ? (
          <div 
            className="border-2 border-dashed border-gray-300 rounded-xl h-48 flex flex-col items-center justify-center space-y-2 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
            onClick={() => ref.current?.click()}
          >
            <div className="bg-teal-100 p-3 rounded-full">
              <Camera className="w-6 h-6 text-teal-600" />
            </div>
            <div className="text-center px-2">
              <h3 className="text-sm font-semibold text-gray-900">{label}</h3>
              <p className="text-xs text-gray-500">拍攝或上傳</p>
            </div>
          </div>
        ) : (
          <div className="relative rounded-xl overflow-hidden shadow-md border border-gray-200 h-48 bg-black group">
            <img src={preview} alt={`Page ${index + 1}`} className="w-full h-full object-contain" />
            <button 
              onClick={(e) => removeImage(index, e)}
              className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full text-gray-700 hover:text-red-600 shadow-sm backdrop-blur-sm"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 text-center">
              {label}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex space-x-3">
        {renderUploadBox(0, "第一頁 (Page 1)", fileInputRef1)}
        {renderUploadBox(1, "第二頁 (Page 2)", fileInputRef2)}
      </div>
      
      <p className="text-xs text-center text-gray-400">
        <FileImage className="w-3 h-3 inline mr-1"/>
        請確保相片清晰，文字可見。如報告只有一頁，只需拍攝第一頁。
      </p>
    </div>
  );
};