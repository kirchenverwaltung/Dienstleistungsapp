import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import { useTheme } from "@/components/theme/ThemeProvider";
import { Feedback } from "@/entities/Feedback";
import { User } from "@/entities/User";

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hallo! 👋 Ich bin dein JobMatch AI-Assistent. Wie kann ich dir helfen?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Show tooltip periodically
  useEffect(() => {
    const lastShown = localStorage.getItem("feedback-tooltip-last-shown");
    const now = Date.now();
    const dayInMs = 86400000;
    
    if (!lastShown || now - parseInt(lastShown) > dayInMs * 3) {
      setTimeout(() => {
        setShowTooltip(true);
        localStorage.setItem("feedback-tooltip-last-shown", now.toString());
        setTimeout(() => setShowTooltip(false), 8000);
      }, 2000);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Du bist ein hilfreicher Assistent für JobMatch, eine Job-Plattform für Studierende und Arbeitgeber in Deutschland. Beantworte folgende Frage kurz und präzise:\n\n${userMessage}`,
        add_context_from_internet: false
      });

      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Entschuldigung, es gab einen Fehler. Bitte versuche es erneut." 
      }]);
    }
    setIsLoading(false);
  };

  const sendFeedback = async () => {
    if (!feedbackMessage.trim() || isSendingFeedback) return;
    
    setIsSendingFeedback(true);
    try {
      const user = await User.me();
      await Feedback.create({
        user_name: user.full_name,
        user_email: user.email,
        message: feedbackMessage,
        status: "neu"
      });
      setFeedbackMessage("");
      setShowFeedbackForm(false);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Vielen Dank für dein Feedback! 🙏 Wir werden es prüfen und berücksichtigen." 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Fehler beim Senden des Feedbacks. Bitte versuche es erneut." 
      }]);
    }
    setIsSendingFeedback(false);
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <>
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(true)}
              className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-50 w-14 h-14 bg-gradient-to-br from-green-400 to-green-500 rounded-full shadow-xl flex items-center justify-center text-white"
            >
              <Sparkles className="w-6 h-6" />
            </motion.button>
            
            {/* Tooltip */}
            {showTooltip && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="fixed bottom-40 md:bottom-24 right-4 md:right-8 z-50 max-w-xs"
              >
                <div className={`p-3 rounded-2xl shadow-lg ${isDark ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      Du kannst hier auch <span className="font-bold text-green-500">Feedback</span> zur App schreiben! 💡
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className={`fixed bottom-24 md:bottom-8 right-4 md:right-8 z-50 w-[90vw] md:w-96 h-[70vh] md:h-[600px] rounded-3xl shadow-2xl flex flex-col ${
              isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
            }`}
          >
            {/* Header */}
            <div className={`p-4 border-b flex items-center justify-between ${
              isDark ? 'border-gray-800' : 'border-gray-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>AI Assistent</h3>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Fragen & Feedback</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowFeedbackForm(!showFeedbackForm)}
                  className={`rounded-xl ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                  title="Feedback schreiben"
                >
                  <MessageSquare className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className={`rounded-xl ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Feedback Form */}
            {showFeedbackForm && (
              <div className={`p-4 border-b ${isDark ? 'border-gray-800 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                <h4 className={`font-bold mb-2 text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  💡 Dein Feedback
                </h4>
                <Textarea
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  placeholder="Teile deine Ideen, Wünsche oder Probleme mit uns..."
                  className={`mb-2 min-h-[80px] rounded-xl ${
                    isDark 
                      ? 'bg-gray-900 border-gray-700 text-white placeholder:text-gray-500' 
                      : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
                  }`}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowFeedbackForm(false)}
                    variant="outline"
                    className={`flex-1 rounded-xl ${isDark ? 'border-gray-700 text-gray-300 hover:bg-gray-700' : ''}`}
                  >
                    Abbrechen
                  </Button>
                  <Button
                    onClick={sendFeedback}
                    disabled={!feedbackMessage.trim() || isSendingFeedback}
                    className="flex-1 rounded-xl bg-gradient-to-br from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white"
                  >
                    {isSendingFeedback ? "Wird gesendet..." : "Senden"}
                  </Button>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-green-400 to-green-500 text-white"
                        : isDark
                          ? "bg-gray-800 text-gray-100"
                          : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className={`rounded-2xl px-4 py-3 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <div className="flex gap-1">
                      <motion.div
                        className={`w-2 h-2 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-400'}`}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      />
                      <motion.div
                        className={`w-2 h-2 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-400'}`}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div
                        className={`w-2 h-2 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-400'}`}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className={`p-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Stelle eine Frage..."
                  className={`flex-1 h-12 rounded-xl ${
                    isDark 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500' 
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'
                  }`}
                  disabled={isLoading}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}