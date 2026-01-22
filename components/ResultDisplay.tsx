
import React, { useState } from 'react';

interface ResultDisplayProps {
  content: string;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ content }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl shadow-xl shadow-indigo-100/50 border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center">
            <i className="fa-solid fa-scroll text-indigo-500 mr-2"></i>
            Kịch bản & Lời thoại trích xuất
          </h3>
          <button
            onClick={handleCopy}
            className="flex items-center space-x-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            {copied ? (
              <>
                <i className="fa-solid fa-check text-green-500"></i>
                <span>Đã sao chép</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-copy text-slate-400"></i>
                <span>Sao chép kịch bản</span>
              </>
            )}
          </button>
        </div>
        <div className="p-6">
          <div className="prose prose-slate max-w-none whitespace-pre-wrap text-slate-700 leading-relaxed font-normal">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;
