import React, { useEffect, useState } from "react";
import { Message } from "@/entities/Message";
import { User } from "@/entities/User";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function MessageNotification() {
  const [notification, setNotification] = useState(null);
  const [lastChecked, setLastChecked] = useState(Date.now());

  useEffect(() => {
    let interval;
    
    const checkMessages = async () => {
      try {
        const user = await User.me();
        const messages = await Message.filter({ 
          receiver_email: user.email, 
          read: false 
        }, "-created_date", 1);
        
        if (messages.length > 0) {
          const msg = messages[0];
          const msgTime = new Date(msg.created_date).getTime();
          
          if (msgTime > lastChecked) {
            setNotification(msg);
            setLastChecked(Date.now());
            
            // Auto-dismiss after 5 seconds
            setTimeout(() => {
              setNotification(null);
            }, 5000);
          }
        }
      } catch (error) {
        // User not logged in
      }
    };

    checkMessages();
    interval = setInterval(checkMessages, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [lastChecked]);

  const dismiss = () => {
    setNotification(null);
  };

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -100, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -100, x: "-50%" }}
          className="fixed top-4 left-1/2 z-[100] w-[90%] max-w-sm"
        >
          <Link to={createPageUrl("Messages")} onClick={dismiss}>
            <div className="bg-white border border-green-200 rounded-2xl p-4 shadow-xl">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-lg">💬</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 font-semibold text-sm truncate">
                    {notification.sender_name}
                  </p>
                  <p className="text-gray-500 text-xs line-clamp-2">
                    {notification.message}
                  </p>
                </div>
                <button 
                  onClick={(e) => { e.preventDefault(); dismiss(); }}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}