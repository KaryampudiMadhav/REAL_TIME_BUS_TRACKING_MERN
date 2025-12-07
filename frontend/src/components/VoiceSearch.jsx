import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';

const VoiceSearch = ({ onResult, placeholder = "Click to speak..." }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const speechRecognition = new window.webkitSpeechRecognition();
      speechRecognition.continuous = false;
      speechRecognition.interimResults = false;
      speechRecognition.lang = 'en-US';

      speechRecognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
        setIsListening(false);
      };

      speechRecognition.onerror = () => {
        setIsListening(false);
      };

      speechRecognition.onend = () => {
        setIsListening(false);
      };

      setRecognition(speechRecognition);
    }
  }, [onResult]);

  const toggleListening = () => {
    if (!recognition) {
      alert('Voice recognition not supported in this browser');
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`p-2 rounded-full transition-all duration-200 ${
        isListening
          ? 'bg-red-100 text-red-600 animate-pulse'
          : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600'
      }`}
      title={isListening ? "Stop listening" : placeholder}
    >
      {isListening ? (
        <MicOff className="h-5 w-5" />
      ) : (
        <Mic className="h-5 w-5" />
      )}
    </button>
  );
};

export default VoiceSearch;
