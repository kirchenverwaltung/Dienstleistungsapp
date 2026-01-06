import React, { useState, useEffect } from "react";
import { Feedback } from "../Entities/Feedback";
import { User } from "../Entities/User";
import { Card, CardContent } from "../Components/ui/card";
import { Badge } from "../Components/ui/badge";
import { Button } from "../Components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Components/ui/select";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { MessageSquare, Mail, Clock } from "lucide-react";
import { useTheme } from "../Components/theme/ThemeProvider";

export default function AdminFeedbackPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("alle");

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const loadFeedbacks = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      if (user.role !== "admin") {
        navigate(createPageUrl("Home"));
        return;
      }

      const allFeedbacks = await Feedback.list("-created_date");
      setFeedbacks(allFeedbacks);
    } catch (error) {
      navigate(createPageUrl("Home"));
    }
    setIsLoading(false);
  };

  const updateStatus = async (id, newStatus) => {
    await Feedback.update(id, { status: newStatus });
    await loadFeedbacks();
  };

  const filteredFeedbacks = filterStatus === "alle" 
    ? feedbacks 
    : feedbacks.filter(f => f.status === filterStatus);

  const statusColors = {
    neu: "bg-blue-100 text-blue-700 border-blue-200",
    gelesen: "bg-amber-100 text-amber-700 border-amber-200",
    bearbeitet: "bg-green-100 text-green-700 border-green-200"
  };

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

  return (
    <div className={`min-h-screen pb-24 md:pb-8 ${isDark ? 'bg-[#0f0f0f]' : 'bg-[#f8faf8]'}`}>
      <div className="max-w-5xl mx-auto px-4 py-6 md:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className={`text-2xl md:text-3xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            💬 Feedback-Verwaltung
          </h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Nutzer-Feedback und Vorschläge
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <Card className={`border rounded-xl ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-white'}`}>
            <CardContent className="p-4 text-center">
              <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{feedbacks.length}</div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Gesamt</div>
            </CardContent>
          </Card>
          <Card className={`border rounded-xl ${isDark ? 'border-gray-800 bg-gray-900' : 'border-blue-100 bg-blue-50'}`}>
            <CardContent className="p-4 text-center">
              <div className={`text-xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>{feedbacks.filter(f => f.status === "neu").length}</div>
              <div className={`text-xs ${isDark ? 'text-blue-500' : 'text-blue-600'}`}>Neu</div>
            </CardContent>
          </Card>
          <Card className={`border rounded-xl ${isDark ? 'border-gray-800 bg-gray-900' : 'border-amber-100 bg-amber-50'}`}>
            <CardContent className="p-4 text-center">
              <div className={`text-xl font-bold ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>{feedbacks.filter(f => f.status === "gelesen").length}</div>
              <div className={`text-xs ${isDark ? 'text-amber-500' : 'text-amber-600'}`}>Gelesen</div>
            </CardContent>
          </Card>
          <Card className={`border rounded-xl ${isDark ? 'border-gray-800 bg-gray-900' : 'border-green-100 bg-green-50'}`}>
            <CardContent className="p-4 text-center">
              <div className={`text-xl font-bold ${isDark ? 'text-green-400' : 'text-green-700'}`}>{feedbacks.filter(f => f.status === "bearbeitet").length}</div>
              <div className={`text-xs ${isDark ? 'text-green-500' : 'text-green-600'}`}>Bearbeitet</div>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <div className="mb-4">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className={`h-12 rounded-xl border w-full md:w-48 ${isDark ? 'border-gray-700 bg-gray-900 text-white' : 'border-gray-200 bg-white text-gray-900'}`}>
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent className={isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}>
              <SelectItem value="alle" className={isDark ? 'text-white' : 'text-gray-900'}>Alle</SelectItem>
              <SelectItem value="neu" className={isDark ? 'text-white' : 'text-gray-900'}>Neu</SelectItem>
              <SelectItem value="gelesen" className={isDark ? 'text-white' : 'text-gray-900'}>Gelesen</SelectItem>
              <SelectItem value="bearbeitet" className={isDark ? 'text-white' : 'text-gray-900'}>Bearbeitet</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Feedback List */}
        {filteredFeedbacks.length === 0 ? (
          <Card className={`border rounded-2xl ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-white'}`}>
            <CardContent className="p-8 text-center">
              <span className="text-5xl mb-4 block">📭</span>
              <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Kein Feedback</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Hier erscheint Nutzer-Feedback</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredFeedbacks.map((feedback, index) => (
              <motion.div
                key={feedback.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card className={`border hover:shadow-md rounded-2xl transition-shadow ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-white'}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-green-100'}`}>
                          <MessageSquare className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{feedback.user_name}</h3>
                          <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            <Mail className="w-3 h-3" />
                            {feedback.user_email}
                          </div>
                        </div>
                      </div>
                      <Badge className={`${statusColors[feedback.status]} border rounded-full text-xs`}>
                        {feedback.status}
                      </Badge>
                    </div>

                    <p className={`mb-3 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {feedback.message}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        <Clock className="w-3 h-3" />
                        {format(new Date(feedback.created_date), "d. MMM yyyy, HH:mm", { locale: de })}
                      </div>

                      <Select value={feedback.status} onValueChange={(val) => updateStatus(feedback.id, val)}>
                        <SelectTrigger className={`h-9 w-32 rounded-lg text-xs ${isDark ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-200 bg-gray-50 text-gray-900'}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className={isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}>
                          <SelectItem value="neu" className={`text-xs ${isDark ? 'text-white' : 'text-gray-900'}`}>Neu</SelectItem>
                          <SelectItem value="gelesen" className={`text-xs ${isDark ? 'text-white' : 'text-gray-900'}`}>Gelesen</SelectItem>
                          <SelectItem value="bearbeitet" className={`text-xs ${isDark ? 'text-white' : 'text-gray-900'}`}>Bearbeitet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}