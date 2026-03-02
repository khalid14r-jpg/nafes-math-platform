import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Bot, User, Loader2, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Modality } from "@google/genai";
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SYSTEM_INSTRUCTION = "أنت مساعد تعليمي ذكي متخصص في رياضيات الصف السادس الابتدائي لمنهج المملكة العربية السعودية. مهمتك هي مساعدة الطلاب في فهم المسائل الرياضية وتوجيههم نحو الحل الصحيح بخطوات منطقية دون إعطائهم الإجابة النهائية مباشرة. شجع الطالب على التفكير واستخدم لغة عربية فصيحة وبسيطة تناسب عمر ١٢ سنة.";

export default function ChatBot({ currentQuestion, isOpen, setIsOpen }: { currentQuestion?: string, isOpen: boolean, setIsOpen: (open: boolean) => void }) {
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([
    { role: 'bot', text: 'أهلاً بك يا بطل! أنا مساعدك الذكي في الرياضيات. كيف يمكنني مساعدتك اليوم؟' }
  ]);

  // Effect to handle new question context
  useEffect(() => {
    if (currentQuestion && isOpen) {
      setMessages(prev => [
        ...prev, 
        { role: 'bot', text: `أرى أنك تحاول حل هذه المسألة: "${currentQuestion}". هل تريد تلميحاً أو شرحاً لطريقة الحل؟ (تذكر أنني لن أعطيك الإجابة النهائية مباشرة!)` }
      ]);
    }
  }, [currentQuestion, isOpen]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<number | null>(null);
  const [loadingAudio, setLoadingAudio] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const contextPrompt = currentQuestion ? `السؤال الحالي الذي يحاول الطالب حله هو: ${currentQuestion}\n\n` : '';
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [
          { role: 'user', parts: [{ text: `${SYSTEM_INSTRUCTION}\n\n${contextPrompt}سؤال الطالب: ${userMessage}` }] }
        ],
      });

      const botResponse = response.text || "عذراً، واجهت مشكلة في فهم السؤال. هل يمكنك المحاولة مرة أخرى؟";
      setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
    } catch (error) {
      console.error("Gemini Error:", error);
      setMessages(prev => [...prev, { role: 'bot', text: "عذراً، حدث خطأ ما. يرجى المحاولة لاحقاً." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = async (text: string, index: number) => {
    if (isSpeaking === index) {
      audioRef.current?.pause();
      setIsSpeaking(null);
      return;
    }

    if (!text.trim()) return;

    setLoadingAudio(index);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text }] }], // Minimal prompt for speed
        config: {
          responseModalities: ['AUDIO' as any],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Zephyr' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      setLoadingAudio(null);
      setIsSpeaking(index);
      
      if (base64Audio) {
        // Gemini TTS returns raw PCM (L16) at 24kHz. We need to add a WAV header to play it in <audio>.
        const binaryString = window.atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const wavHeader = new ArrayBuffer(44);
        const view = new DataView(wavHeader);

        // RIFF chunk descriptor
        view.setUint32(0, 0x52494646, false); // "RIFF"
        view.setUint32(4, 36 + len, true);    // chunk size
        view.setUint32(8, 0x57415645, false); // "WAVE"

        // fmt sub-chunk
        view.setUint32(12, 0x666d7420, false); // "fmt "
        view.setUint32(16, 16, true);          // subchunk1 size
        view.setUint16(20, 1, true);           // audio format (PCM)
        view.setUint16(22, 1, true);           // num channels (mono)
        view.setUint32(24, 24000, true);       // sample rate
        view.setUint32(28, 48000, true);       // byte rate (SampleRate * NumChannels * BitsPerSample/8)
        view.setUint16(32, 2, true);           // block align (NumChannels * BitsPerSample/8)
        view.setUint16(34, 16, true);          // bits per sample

        // data sub-chunk
        view.setUint32(36, 0x64617461, false); // "data"
        view.setUint32(40, len, true);         // subchunk2 size

        const blob = new Blob([wavHeader, bytes], { type: 'audio/wav' });
        const audioSrc = URL.createObjectURL(blob);

        if (audioRef.current) {
          audioRef.current.src = audioSrc;
          audioRef.current.play();
          audioRef.current.onended = () => {
            setIsSpeaking(null);
            URL.revokeObjectURL(audioSrc);
          };
        } else {
          const audio = new Audio(audioSrc);
          audioRef.current = audio;
          audio.play();
          audio.onended = () => {
            setIsSpeaking(null);
            URL.revokeObjectURL(audioSrc);
          };
        }
      } else {
        setIsSpeaking(null);
      }
    } catch (error) {
      console.error("TTS Error:", error);
      setIsSpeaking(null);
      setLoadingAudio(null);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-[350px] md:w-[400px] h-[500px] flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="bg-primary p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Bot size={24} />
                </div>
                <div>
                  <h4 className="font-bold">مساعد نافس الذكي</h4>
                  <p className="text-[10px] text-blue-100">مدعوم بالذكاء الاصطناعي</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`flex gap-2 max-w-[80%] ${msg.role === 'user' ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-primary text-white'}`}>
                      {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm leading-relaxed relative group ${msg.role === 'user' ? 'bg-white border border-slate-200 text-slate-800 rounded-tr-none' : 'bg-primary text-white rounded-tl-none'}`}>
                      {msg.text}
                      {msg.role === 'bot' && (
                        <button 
                          onClick={() => handleSpeak(msg.text, idx)}
                          disabled={loadingAudio !== null && loadingAudio !== idx}
                          className={cn(
                            "absolute -bottom-6 left-0 transition-colors p-1",
                            loadingAudio === idx ? "text-primary" : "text-slate-400 hover:text-primary"
                          )}
                          title="استمع للنص"
                        >
                          {loadingAudio === idx ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : isSpeaking === idx ? (
                            <VolumeX size={14} />
                          ) : (
                            <Volume2 size={14} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-end">
                  <div className="flex gap-2 flex-row-reverse">
                    <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center shrink-0">
                      <Bot size={16} />
                    </div>
                    <div className="bg-primary text-white p-3 rounded-2xl rounded-tl-none">
                      <Loader2 size={20} className="animate-spin" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="اسألني أي شيء في الرياضيات..."
                className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
              />
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="bg-primary text-white p-2 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Send size={20} className="rotate-180" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-primary text-white rounded-2xl shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
      >
        <MessageCircle size={28} />
      </button>
    </div>
  );
}
