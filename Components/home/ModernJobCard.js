import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { MapPin, Clock, Calendar, TrendingUp, Heart } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { useTheme } from "../theme/ThemeProvider";
import { User } from "../../Entities/User";

export default function ModernJobCard({ job, isSaved, onSaveToggle, isHot }) {
  const { theme, accentColor } = useTheme();
  const isDark = theme === "dark";
  const [isSaving, setIsSaving] = React.useState(false);

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
    return job.hourly_rate * calculateDuration();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaving(true);
    
    try {
      const user = await User.me();
      const saved = user.saved_jobs || [];
      const newSaved = isSaved
        ? saved.filter(id => id !== job.id)
        : [...saved, job.id];
      
      await User.updateMyUserData({ saved_jobs: newSaved });
      onSaveToggle();
    } catch (error) {
      console.error("Error:", error);
    }
    setIsSaving(false);
  };

  const availablePositions = (job.total_positions || 1) - (job.filled_positions || 0);

  return (
    <Link to={`${createPageUrl("JobDetails")}?id=${job.id}`} className="block">
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <Card className={`border overflow-hidden relative ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-white shadow-sm'}`}>
          {isHot && (
            <div className="absolute top-3 left-3 z-10">
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 px-3 py-1 text-xs font-bold shadow-lg">
                🔥 Hot
              </Badge>
            </div>
          )}
          
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className={`absolute top-3 right-3 z-10 w-10 h-10 rounded-full p-0 ${isDark ? 'bg-gray-800/90 hover:bg-gray-700' : 'bg-white/90 hover:bg-white'} shadow-lg backdrop-blur-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
          >
            <Heart className={`w-5 h-5 ${isSaved ? 'fill-red-500 text-red-500' : isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          </Button>

          <CardContent className="p-0">
            {/* Header with earnings */}
            <div className={`p-5 ${isDark ? 'bg-gray-800' : 'bg-gradient-to-br from-gray-50 to-white'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className={`text-lg font-bold mb-1 line-clamp-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {job.title}
                  </h3>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {job.company_name}
                  </p>
                </div>
              </div>

              {/* Earnings highlight */}
              <div className="flex items-center gap-2 mb-3">
                <div className={`flex-1 rounded-xl p-3 ${isDark ? 'bg-gray-900' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="text-xs text-[#91D18B] font-medium mb-1">Verdienst</div>
                  <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {getTotalEarnings().toFixed(0)}€
                  </div>
                  <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    {job.payment_type === "fixed" ? "Pauschal" : `${job.hourly_rate}€/h`}
                  </div>
                </div>
                {isHot && (
                  <div className="flex flex-col items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-orange-500 mb-1" />
                    <span className="text-xs font-bold text-orange-500">Top</span>
                  </div>
                )}
              </div>

              {/* Badges */}
              <div className="flex gap-2 flex-wrap">
                <Badge className={`border-0 text-xs px-2 py-1 ${isDark ? 'bg-[#91D18B]/20 text-[#91D18B]' : 'bg-[#91D18B]/10 text-[#91D18B]'}`}>
                  {job.category}
                </Badge>
                {job.is_urgent && (
                  <Badge className="bg-orange-500/20 text-orange-600 border-0 text-xs px-2 py-1">
                    ⚡ Dringend
                  </Badge>
                )}
                {availablePositions > 1 && (
                  <Badge className={`border-0 text-xs px-2 py-1 ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                    {availablePositions} Plätze
                  </Badge>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {format(new Date(job.date), "EEE, d. MMM", { locale: de })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {job.start_time} - {job.end_time} ({calculateDuration()}h)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} line-clamp-1`}>
                  {job.location}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}