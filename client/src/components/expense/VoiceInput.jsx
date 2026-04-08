import { useState } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VoiceInput({ onParsed }) {
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast.error("Voice recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN'; // Optimized for Indian English accent
    
    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      toast.success(`Heard: "${transcript}"`);
      
      // We'll send this to our parser
      handleParsing(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast.error("Speech recognition error.");
    };

    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  const handleParsing = (text) => {
    // Simple frontend parsing for immediate feedback
    // In Phase 9 we will move this to a real AI model
    const amount = text.match(/\d+/)?.[0] || 0;
    onParsed({ 
      title: text, 
      amount: amount, 
      category: 'Other',
      date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <button
      onClick={startListening}
      className={`p-3 rounded-full transition-all ${
        isListening ? 'bg-red-500 animate-pulse' : 'bg-indigo-600 hover:bg-indigo-500'
      }`}
    >
      {isListening ? <MicOff size={20} className="text-white" /> : <Mic size={20} className="text-white" />}
    </button>
  );
}