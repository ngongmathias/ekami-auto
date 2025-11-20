import { Bot } from 'lucide-react';
import { useState } from 'react';
import AIChat from '../ai/AIChat';

export default function AIChatButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="floating-chat-btn bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full w-14 h-14 flex items-center justify-center transition-all shadow-lg hover:shadow-xl hover:scale-110"
        aria-label="Open AI Assistant"
      >
        <Bot className="w-7 h-7 text-white" />
      </button>

      {isOpen && <AIChat onClose={() => setIsOpen(false)} />}
    </>
  );
}
