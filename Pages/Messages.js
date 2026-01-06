import React, { useState, useEffect, useRef } from "react";
import { Message } from "@/entities/Message";
import { User } from "@/entities/User";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/theme/ThemeProvider";

export default function MessagesPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadMessages = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);

      const sentMessages = await Message.filter({ sender_email: user.email }, "-created_date");
      const receivedMessages = await Message.filter({ receiver_email: user.email }, "-created_date");
      
      const allMessages = [...sentMessages, ...receivedMessages].sort(
        (a, b) => new Date(b.created_date) - new Date(a.created_date)
      );

      const convMap = new Map();
      allMessages.forEach(msg => {
        const otherEmail = msg.sender_email === user.email ? msg.receiver_email : msg.sender_email;
        const otherName = msg.sender_email === user.email ? msg.receiver_name : msg.sender_name;
        
        if (!convMap.has(otherEmail)) {
          convMap.set(otherEmail, {
            email: otherEmail,
            name: otherName,
            lastMessage: msg,
            unreadCount: msg.sender_email !== user.email && !msg.read ? 1 : 0
          });
        } else if (msg.sender_email !== user.email && !msg.read) {
          convMap.get(otherEmail).unreadCount++;
        }
      });

      setConversations(Array.from(convMap.values()));
      setMessages(allMessages);
    } catch (error) {
      await User.loginWithRedirect(window.location.href);
    }
    setIsLoading(false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await Message.create({
        sender_email: currentUser.email,
        sender_name: currentUser.full_name,
        receiver_email: selectedConversation.email,
        receiver_name: selectedConversation.name,
        message: newMessage.trim(),
        read: false
      });
      setNewMessage("");
      await loadMessages();
    } catch (error) {
      console.error("Fehler beim Senden:", error);
    }
  };

  const markAsRead = async (conversationEmail) => {
    const unreadMessages = messages.filter(
      msg => msg.sender_email === conversationEmail && !msg.read
    );
    
    for (const msg of unreadMessages) {
      await Message.update(msg.id, { read: true });
    }
  };

  const handleSelectConversation = async (conv) => {
    setSelectedConversation(conv);
    await markAsRead(conv.email);
    await loadMessages();
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedConversation]);

  const getConversationMessages = () => {
    if (!selectedConversation) return [];
    return messages.filter(
      msg => msg.sender_email === selectedConversation.email || msg.receiver_email === selectedConversation.email
    ).reverse();
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#0f0f0f]' : 'bg-[#f8faf8]'}`}>
        <motion.div
          className={`w-12 h-12 border-3 rounded-full ${isDark ? 'border-gray-800 border-t-green-500' : 'border-gray-200 border-t-green-500'}`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  // Mobile: Show either conversation list or chat
  const showChat = selectedConversation !== null;

  return (
    <div className={`h-screen flex flex-col pb-20 md:pb-0 ${isDark ? 'bg-[#0f0f0f]' : 'bg-[#f8faf8]'}`}>
      {/* Header */}
      <div className={`p-4 border-b ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-white'}`}>
        <div className="flex items-center gap-3">
          {showChat && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedConversation(null)}
              className={`md:hidden rounded-xl ${isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {showChat ? selectedConversation.name : "💬 Nachrichten"}
          </h1>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Conversations List */}
        <AnimatePresence>
          {(!showChat || window.innerWidth >= 768) && (
            <motion.div 
              className={`${showChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 border-r ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-white'}`}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
            >
              <div className="p-3">
                <Input
                  placeholder="Suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`h-11 rounded-xl border ${isDark ? 'border-gray-700 bg-gray-800 text-white placeholder:text-gray-500' : 'border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400'}`}
                />
              </div>

              <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <span className="text-4xl mb-3 block">💬</span>
                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Keine Nachrichten</p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => (
                    <motion.div
                      key={conv.email}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelectConversation(conv)}
                      className={`p-4 cursor-pointer border-b ${
                        selectedConversation?.email === conv.email
                          ? isDark ? 'bg-green-500/20' : 'bg-green-50'
                          : isDark ? 'border-gray-800 hover:bg-gray-800' : 'border-gray-50 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                          <span className="text-white font-bold text-lg">
                            {conv.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className={`font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{conv.name}</span>
                            {conv.unreadCount > 0 && (
                              <span className="w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                                {conv.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className={`text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {conv.lastMessage.message}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Area */}
        <AnimatePresence>
          {(showChat || window.innerWidth >= 768) && (
            <motion.div 
              className={`${!showChat ? 'hidden md:flex' : 'flex'} flex-col flex-1 ${isDark ? 'bg-[#0f0f0f]' : 'bg-[#f8faf8]'}`}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
            >
              {selectedConversation ? (
                <>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {getConversationMessages().map((msg, index) => {
                      const isOwn = msg.sender_email === currentUser.email;
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.02 }}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                            isOwn
                              ? 'bg-gradient-to-r from-green-400 to-green-500 text-white'
                              : isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
                          }`}>
                            <p className="text-sm">{msg.message}</p>
                            <p className={`text-xs mt-1 ${isOwn ? 'text-white/70' : isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                              {format(new Date(msg.created_date), "HH:mm", { locale: de })}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className={`p-4 border-t ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-white'}`}>
                    <div className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Nachricht..."
                        className={`flex-1 h-12 rounded-2xl border ${isDark ? 'border-gray-700 bg-gray-800 text-white placeholder:text-gray-500' : 'border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400'}`}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="h-12 w-12 rounded-2xl bg-green-500 hover:bg-green-600 text-white"
                      >
                        <Send className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-6xl mb-4 block">💬</span>
                    <p className={isDark ? 'text-gray-500' : 'text-gray-400'}>Wähle eine Konversation</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}