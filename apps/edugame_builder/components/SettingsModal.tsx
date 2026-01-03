
import React, { useState, useEffect } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSave: (key: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, apiKey, onSave }) => {
  const [inputKey, setInputKey] = useState(apiKey);

  useEffect(() => {
    if (isOpen) {
      setInputKey(apiKey);
    }
  }, [isOpen, apiKey]);

  const handleSave = () => {
    onSave(inputKey);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-slate-900">설정</h3>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Gemini API 키
            </label>
            <input 
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full p-3 rounded-lg border-2 border-slate-300 focus:border-orange-500 focus:outline-none text-base"
            />
            <p className="text-xs text-slate-500 mt-2">
              API 키는 브라우저에만 저장되며 서버로 전송되지 않습니다.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              <a 
                href="https://aistudio.google.com/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-orange-600 hover:underline"
              >
                Google AI Studio에서 API 키 발급받기
              </a>
            </p>
          </div>
          <button 
            onClick={handleSave}
            className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-colors"
          >
            저장 완료
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;

