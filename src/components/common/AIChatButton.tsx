import { Bot } from 'lucide-react';
import { useState } from 'react';
import AIChat from '../ai/AIChat';

export default function AIChatButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="floating-chat-btn bg-ekami-blue-600 hover:bg-ekami-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center transition-all"
        aria-label="Open AI Assistant"
      >
        <Bot className="w-7 h-7" />
      </button>

      {isOpen && <AIChat onClose={() => setIsOpen(false)} />}
    </>
  );
}
