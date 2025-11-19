import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '237XXXXXXXXX';
  const message = encodeURIComponent('Hello! I have a question about Ekami Auto.');

  const handleClick = () => {
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="whatsapp-btn"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
    </button>
  );
}
