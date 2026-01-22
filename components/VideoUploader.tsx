
import React, { useRef, useEffect } from 'react';

interface VideoUploaderProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  disabled: boolean;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({ onFileSelect, selectedFile, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      videoUrlRef.current = url;
      return () => {
        if (videoUrlRef.current) {
          URL.revokeObjectURL(videoUrlRef.current);
          videoUrlRef.current = null;
        }
      };
    }
  }, [selectedFile]);

  const handleContainerClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    // Reset input to allow selecting same file again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleChange}
        accept="video/mp4,video/quicktime,video/x-msvideo"
        className="hidden"
      />
      <div
        onClick={handleContainerClick}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300
          ${selectedFile 
            ? 'border-indigo-500 bg-indigo-50/30' 
            : 'border-slate-300 hover:border-indigo-400 bg-white hover:bg-slate-50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed shadow-inner' : 'hover:shadow-md'}
        `}
      >
        {!selectedFile ? (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto transition-transform hover:scale-110">
              <i className="fa-solid fa-cloud-arrow-up text-2xl"></i>
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-700">Tải video lên (Tối đa 15MB)</p>
              <p className="text-sm text-slate-500 mt-1">Định dạng khuyên dùng: MP4, MOV</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center space-x-3 text-indigo-600">
                <i className="fa-solid fa-file-video text-xl"></i>
                <span className="font-medium truncate max-w-[200px]">{selectedFile.name}</span>
              </div>
              {!disabled && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-slate-600 hover:bg-indigo-600 hover:text-white transition-all"
                >
                  Thay đổi video
                </button>
              )}
            </div>
            <div className="relative group">
              <video 
                src={videoUrlRef.current || ''} 
                className="w-full max-h-64 rounded-xl shadow-lg border border-indigo-100 mx-auto bg-black overflow-hidden"
                controls
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoUploader;
