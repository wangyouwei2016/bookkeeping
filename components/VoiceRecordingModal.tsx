import React, { useEffect, useState } from 'react';
import { Mic, Loader2 } from 'lucide-react';

interface VoiceRecordingModalProps {
  isRecording: boolean;
  isAnalyzing: boolean;
  onCancel: () => void;
}

const VoiceRecordingModal: React.FC<VoiceRecordingModalProps> = ({ 
  isRecording, 
  isAnalyzing, 
  onCancel 
}) => {
  const [duration, setDuration] = useState(0);

  // Timer for recording duration
  useEffect(() => {
    if (!isRecording) {
      setDuration(0);
      return;
    }

    const interval = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecording]);

  // Format duration as MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isRecording && !isAnalyzing) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div 
        className="relative flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {isRecording ? (
          <>
            {/* Animated Wave Rings */}
            <div className="relative flex items-center justify-center">
              {/* Outermost ring - slowest */}
              <div className="absolute w-[500px] h-[500px] rounded-full border-8 border-red-500/30 animate-ping" 
                   style={{ animationDuration: '2s' }}></div>
              
              {/* Middle ring */}
              <div className="absolute w-[400px] h-[400px] rounded-full border-8 border-red-500/40 animate-ping" 
                   style={{ animationDuration: '1.5s', animationDelay: '0.3s' }}></div>
              
              {/* Inner ring - fastest */}
              <div className="absolute w-[300px] h-[300px] rounded-full border-8 border-red-500/50 animate-ping" 
                   style={{ animationDuration: '1s', animationDelay: '0.6s' }}></div>

              {/* Center Mic Icon with Pulse */}
              <div className="relative z-10 w-56 h-56 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-2xl shadow-red-500/50 animate-pulse">
                <Mic size={120} className="text-white" strokeWidth={3} />
              </div>
            </div>

            {/* Recording Status Text */}
            <div className="mt-20 text-center space-y-6">
              <div className="text-white text-5xl font-extrabold tracking-tight animate-pulse">
                正在录音中...
              </div>
              <div className="text-red-300 text-4xl font-bold">
                {formatDuration(duration)}
              </div>
              <div className="text-white/80 text-3xl font-medium mt-8">
                点击空白处停止录音
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Analyzing State */}
            <div className="relative flex items-center justify-center">
              <div className="w-56 h-56 bg-gradient-to-br from-brand-500 to-brand-600 rounded-full flex items-center justify-center shadow-2xl shadow-brand-500/50">
                <Loader2 size={120} className="text-white animate-spin" strokeWidth={3} />
              </div>
            </div>

            <div className="mt-20 text-center space-y-6">
              <div className="text-white text-5xl font-extrabold tracking-tight">
                AI 识别中...
              </div>
              <div className="text-white/80 text-3xl font-medium">
                请稍候，正在理解您说的话
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VoiceRecordingModal;
