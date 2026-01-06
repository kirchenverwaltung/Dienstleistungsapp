import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { User } from "@/entities/User";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useTheme } from "@/components/theme/ThemeProvider";

export default function JobCard({ job, onSaveToggle, isSaved, showManage = false, isHot = false }) {
  const [isTogglingSave, setIsTogglingSave] = React.useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const handleSaveClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isTogglingSave) return;
    
    setIsTogglingSave(true);
    try {
      const user = await User.me();
      const saved = user.saved_jobs || [];
      
      const newSaved = isSaved
        ? saved.filter(id => id !== job.id)
        : [...saved, job.id];
      
      await User.updateMyUserData({ saved_jobs: newSaved });
      if (onSaveToggle) onSaveToggle();
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
    }
    setIsTogglingSave(false);
  };

  const calculateDuration = () => {
    if (!job.start_time || !job.end_time) return 0;
    const start = parseFloat(job.start_time.replace(":", "."));
    const end = parseFloat(job.end_time.replace(":", "."));
    return Math.max(0, end - start);
  };

  const getTotalEarnings = () => {
    if (job.payment_type === "fixed") {
      return job.fixed_amount;
    }
    const duration = calculateDuration();
    return job.hourly_rate * duration;
  };

  const availablePositions = (job.total_positions || 1) - (job.filled_positions || 0);
  const isFullyBooked = availablePositions <= 0;

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`${createPageUrl("JobDetails")}?id=${job.id}`} className="block w-full">
        <Card className={`border hover:shadow-md rounded-2xl overflow-hidden transition-all duration-300 h-full w-full ${isHot ? 'ring-2 ring-orange-400/50' : ''} ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-white'}`}>
          <CardContent className="p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {job.is_urgent && (
                    <Badge className="bg-orange-100 text-orange-600 border-0 rounded-full px-2 py-0.5 text-xs">
                      ⚡ Dringend
                    </Badge>
                  )}
                  <Badge className="bg-green-100 text-green-600 border-0 rounded-full px-2 py-0.5 text-xs">
                    {job.category}
                  </Badge>
                  </div>
                  <h3 className={`font-bold text-base leading-tight mb-1 truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {job.title}
                  </h3>
                  <p className="text-green-600 text-sm truncate font-medium">
                  {job.company_name}
                  </p>
              </div>
              {!showManage && (
                <Button
                  size="icon"
                  variant="ghost"
                  className={`rounded-xl w-10 h-10 flex-shrink-0 ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                  onClick={handleSaveClick}
                >
                  <motion.span
                    className="text-xl"
                    animate={isSaved ? { scale: [1, 1.3, 1] } : {}}
                  >
                    {isSaved ? "❤️" : "🤍"}
                  </motion.span>
                </Button>
              )}
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className={`rounded-xl p-2.5 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-base">📅</span>
                  <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {format(new Date(job.date), "d. MMM", { locale: de })}
                  </span>
                </div>
              </div>
              <div className={`rounded-xl p-2.5 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-base">⏰</span>
                  <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {job.start_time} - {job.end_time}
                  </span>
                </div>
              </div>
              <div className={`rounded-xl p-2.5 col-span-2 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-base">📍</span>
                  <span className={`text-xs truncate ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {job.location}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className={`flex items-center justify-between pt-3 border-t ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center shadow-sm ${isHot ? 'animate-pulse' : ''}`}>
                  <span className="text-lg">💰</span>
                </div>
                <div>
                  <motion.div 
                    className="text-xl font-bold text-green-600"
                    animate={isHot ? { scale: [1, 1.05, 1] } : {}}
                    transition={isHot ? { duration: 1.5, repeat: Infinity } : {}}
                  >
                    {job.payment_type === "fixed" 
                      ? `${job.fixed_amount?.toFixed(0)}€`
                      : `${job.hourly_rate?.toFixed(0)}€/h`
                    }
                  </motion.div>
                  <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {job.payment_type === "fixed" ? "Festbetrag" : `≈${getTotalEarnings().toFixed(0)}€`}
                  </div>
                </div>
              </div>

              {isHot && (
                <motion.div 
                  className="flex items-center gap-1 bg-orange-100 rounded-full px-2.5 py-1"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="text-sm">🔥</span>
                  <span className="text-orange-600 text-xs font-medium">Hot</span>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}