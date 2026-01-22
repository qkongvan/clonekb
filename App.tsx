
import React, { useState, useEffect } from 'react';
import { AppStatus } from './types';
import { generateScriptFromVideo } from './services/geminiService';
import VideoUploader from './components/VideoUploader';
import ResultDisplay from './components/ResultDisplay';

const MAX_FILE_SIZE_MB = 15;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const App: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeys, setApiKeys] = useState<string>('');

  useEffect(() => {
    const savedKeys = localStorage.getItem('user_api_keys') || '';
    setApiKeys(savedKeys);
  }, []);

  const handleFileSelect = (file: File) => {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`Tệp quá lớn (${(file.size / (1024 * 1024)).toFixed(1)}MB). Vui lòng chọn video dưới ${MAX_FILE_SIZE_MB}MB để tránh lỗi bộ nhớ.`);
      setVideoFile(null);
      setResult('');
      return;
    }
    setVideoFile(file);
    setError(null);
    setResult('');
    setStatus(AppStatus.IDLE);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const formatTextToLines = (text: string): string => {
    // Tự động thêm ngắt dòng sau các dấu kết thúc câu nếu theo sau là khoảng trắng và một chữ cái viết hoa
    return text.replace(/([.!?])\s+(?=[A-ZÀ-ỹ])/g, "$1\n\n");
  };

  const handleSaveKeys = () => {
    localStorage.setItem('user_api_keys', apiKeys);
    setShowKeyModal(false);
  };

  const handleStartProcessing = async () => {
    if (!videoFile) return;

    try {
      setStatus(AppStatus.PROCESSING);
      setError(null);
      
      const base64 = await fileToBase64(videoFile);
      const rawScript = await generateScriptFromVideo(base64, videoFile.type);
      
      const formattedScript = formatTextToLines(rawScript);
      
      setResult(formattedScript);
      setStatus(AppStatus.COMPLETED);
    } catch (err: any) {
      console.error(err);
      let msg = err.message || 'Đã xảy ra lỗi không xác định.';
      if (msg.includes('Out of Memory') || msg.includes('large')) {
        msg = 'Dung lượng video quá lớn để trình duyệt xử lý. Vui lòng thử lại với video ngắn hơn hoặc độ phân giải thấp hơn.';
      }
      setError(msg);
      setStatus(AppStatus.ERROR);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-20 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-100">
              <i className="fa-solid fa-scissors"></i>
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              CLONE KỊCH BẢN VIDEO NGẮN
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block text-sm text-slate-500 font-medium">
              Mini App by qkongvan
            </div>
            <button 
              onClick={() => setShowKeyModal(true)}
              className="w-10 h-10 rounded-full bg-slate-50 hover:bg-indigo-100 text-slate-600 hover:text-indigo-600 flex items-center justify-center transition-all shadow-sm border border-slate-200"
              title="Quản lý API Keys"
            >
              <i className="fa-solid fa-key text-sm"></i>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 mt-12">
        <div className="text-center mb-10 space-y-4">
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Trích Xuất Kịch Bản Video Thông Minh
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Trích xuất lời thoại theo từng dòng rõ ràng. 
            <span className="block text-sm font-medium text-amber-600 mt-2">
              <i className="fa-solid fa-circle-info mr-1"></i>
              Lưu ý: Sử dụng video dưới {MAX_FILE_SIZE_MB}MB để có kết quả tốt nhất.
            </span>
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-indigo-100/40 border border-slate-100">
          <VideoUploader 
            onFileSelect={handleFileSelect} 
            selectedFile={videoFile} 
            disabled={status === AppStatus.PROCESSING}
          />

          <div className="mt-8 flex flex-col items-center">
            <button
              onClick={handleStartProcessing}
              disabled={!videoFile || status === AppStatus.PROCESSING}
              className={`
                px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center space-x-3 shadow-lg
                ${!videoFile || status === AppStatus.PROCESSING
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200 active:scale-95'
                }
              `}
            >
              {status === AppStatus.PROCESSING ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>AI đang phân tích video...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-play"></i>
                  <span>Bắt đầu phân tích</span>
                </>
              )}
            </button>
            
            {videoFile && status === AppStatus.IDLE && (
              <p className="mt-4 text-xs text-slate-400">
                Kích thước: {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            )}
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-start space-x-3 animate-in fade-in duration-300">
              <i className="fa-solid fa-circle-exclamation mt-0.5"></i>
              <span>{error}</span>
            </div>
          )}
        </div>

        {status === AppStatus.PROCESSING && (
          <div className="mt-12 space-y-4 max-w-md mx-auto text-center">
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-indigo-600 h-1.5 rounded-full animate-loading-bar" style={{ width: '100%' }}></div>
            </div>
            <p className="text-sm text-slate-500 italic">
              Đang xử lý dữ liệu... Việc này có thể mất 30-60 giây tùy độ dài video.
            </p>
          </div>
        )}

        {result && <ResultDisplay content={result} />}
      </main>

      {/* API Key Modal Popup */}
      {showKeyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center">
                <i className="fa-solid fa-key text-indigo-500 mr-2"></i>
                Cấu hình API Keys
              </h3>
              <button 
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-2"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Nhập API Keys của bạn (mỗi dòng một key)
                </label>
                <textarea
                  value={apiKeys}
                  onChange={(e) => setApiKeys(e.target.value)}
                  placeholder="Paste các API Keys vào đây..."
                  className="w-full h-40 p-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono resize-none shadow-inner"
                />
                <p className="text-[10px] text-slate-400 italic">
                  * Hệ thống sẽ tự động xoay vòng giữa các Key để tránh bị giới hạn băng thông. Nếu để trống, sẽ dùng Key mặc định của hệ thống.
                </p>
              </div>
              <button
                onClick={handleSaveKeys}
                className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-[0.98]"
              >
                Lưu và Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-loading-bar {
          animation: loading-bar 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default App;
