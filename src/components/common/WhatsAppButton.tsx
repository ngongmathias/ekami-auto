import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle, X, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WhatsAppButtonProps {
  carName?: string;
  context?: 'car-detail' | 'booking' | 'contact' | 'general';
}

export default function WhatsAppButton({ carName, context }: WhatsAppButtonProps) {
  const location = useLocation();
  const [isMinimized, setIsMinimized] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '237652765281';

  // Auto-show tooltip on first load
  useEffect(() => {
    const hasSeenTooltip = localStorage.getItem('whatsapp-tooltip-seen');
    if (!hasSeenTooltip) {
      setTimeout(() => {
        setShowTooltip(true);
        localStorage.setItem('whatsapp-tooltip-seen', 'true');
      }, 3000);
      
      setTimeout(() => {
        setShowTooltip(false);
      }, 8000);
    }
  }, []);

  // Generate context-aware message
  const getMessage = () => {
    const pathname = location.pathname;
    
    // If carName is provided (from car detail or booking page)
    if (carName) {
      if (pathname.includes('/book/')) {
        return `Hello! I need help with booking the ${carName}. Can you assist me?`;
      }
      if (pathname.includes('/cars/')) {
        return `Hello! I'm interested in the ${carName}. Can you provide more information?`;
      }
    }

    // Context-based messages
    if (context === 'car-detail' || pathname.includes('/cars/')) {
      return "Hello! I'm interested in one of your luxury vehicles. Can you help me?";
    }
    if (context === 'booking' || pathname.includes('/book/')) {
      return "Hello! I need assistance with a booking. Can you help?";
    }
    if (context === 'contact' || pathname.includes('/contact')) {
      return "Hello! I have a question about your services.";
    }
    if (pathname.includes('/rent')) {
      return "Hello! I'm looking to rent a luxury car. What options do you have?";
    }
    if (pathname.includes('/buy')) {
      return "Hello! I'm interested in purchasing a vehicle. Can we discuss options?";
    }
    if (pathname.includes('/repairs')) {
      return "Hello! I need car repair services. Can you help?";
    }
    if (pathname.includes('/sell')) {
      return "Hello! I'd like to sell my car. What's the process?";
    }

    // Default message
    return "Hello! I need assistance with Ekami Auto services. Can you help me?";
  };

  const handleClick = () => {
    const message = encodeURIComponent(getMessage());
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  const toggleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMinimized(!isMinimized);
  };

  if (isMinimized) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        onClick={toggleMinimize}
        className="fixed bottom-6 left-6 z-50 bg-[#25D366] text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        aria-label="Open WhatsApp Chat"
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, x: -10 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 10, x: -10 }}
            className="absolute bottom-full left-0 mb-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-3 rounded-lg shadow-xl max-w-xs"
          >
            <div className="flex items-start gap-2">
              <MessageCircle className="w-5 h-5 text-[#25D366] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Need help?</p>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                  Chat with us on WhatsApp for instant assistance!
                </p>
              </div>
              <button
                onClick={() => setShowTooltip(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Tooltip arrow */}
            <div className="absolute bottom-0 right-6 transform translate-y-1/2 rotate-45 w-3 h-3 bg-white dark:bg-gray-800"></div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="relative"
      >
        {/* Pulse animation ring */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 bg-[#25D366] rounded-full"
        />

        {/* Main button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleClick}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="relative bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 group"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle className="w-7 h-7" />
          
          {/* Minimize button */}
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            whileHover={{ opacity: 1, scale: 1 }}
            onClick={toggleMinimize}
            className="absolute -top-2 -right-2 bg-gray-800 dark:bg-gray-700 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            aria-label="Minimize WhatsApp button"
          >
            <Minimize2 className="w-3 h-3" />
          </motion.button>
        </motion.button>

        {/* Notification badge (optional - can be enabled later) */}
        {/* <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          1
        </div> */}
      </motion.div>
    </div>
  );
}
