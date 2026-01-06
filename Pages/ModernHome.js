import React, { useState, useEffect, useRef } from "react";
import { Job } from "@/entities/Job";
import { User } from "@/entities/User";
import { Application } from "@/entities/Application";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import ModernJobCard from "@/components/home/ModernJobCard";
import CategoryCarousel from "@/components/home/CategoryCarousel";
import { Search, MapIcon, Filter, Heart } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ModernHomePage() {
  const navigate = useNavigate();
  const { theme, accentColor } = useTheme();
  const isDark = theme === "dark";
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [hotJobs, setHotJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Alle");
  const [showFavorites, setShowFavorites] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // list or map
  
  const scrollRef = useRef(null);
  const [snapIndex, setSnapIndex] = useState(0);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      setUserType(currentUser.user_type);
      setSavedJobs(currentUser.saved_jobs || []);

      if (!currentUser.user_type) {
        navigate(createPageUrl("Profile"));
        return;
      }

      if (currentUser.user_type === "arbeitgeber") {
        setIsLoading(false);
        return;
      }

      const allJobs = await Job.filter({ status: "offen" }, "-created_date");
      setJobs(allJobs);

      const calculateHotScore = (job) => {
        const startTime = parseFloat(job.start_time?.replace(":", ".") || "0");
        const endTime = parseFloat(job.end_time?.replace(":", ".") || "0");
        const duration = endTime - startTime;
        if (job.payment_type === "fixed") {
          return duration > 0 ? job.fixed_amount / duration : 0;
        }
        return duration > 0 ? job.hourly_rate : 0;
      };

      const sortedByHotness = [...allJobs]
        .map(job => ({ ...job, hotScore: calculateHotScore(job) }))
        .sort((a, b) => b.hotScore - a.hotScore)
        .slice(0, 4);
      
      setHotJobs(sortedByHotness);

    } catch (error) {
      await User.loginWithRedirect(window.location.href);
    }
    setIsLoading(false);
  }, [navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "Alle") {
      filtered = filtered.filter(job => job.category === selectedCategory);
    }

    if (showFavorites) {
      filtered = filtered.filter(job => savedJobs.includes(job.id));
    }

    const available = filtered.filter(job => {
      const availablePositions = (job.total_positions || 1) - (job.filled_positions || 0);
      return availablePositions > 0;
    });

    setFilteredJobs(available);
  }, [jobs, searchTerm, selectedCategory, showFavorites, savedJobs]);

  // Snap scrolling effect
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let scrollTimeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollTop = container.scrollTop;
        const cardHeight = 400; // approximate card height
        const index = Math.round(scrollTop / cardHeight);
        setSnapIndex(index);
        container.scrollTo({
          top: index * cardHeight,
          behavior: 'smooth'
        });
      }, 100);
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#1a1a1a]' : 'bg-gray-50'}`}>
        <motion.div
          className={`w-12 h-12 border-3 rounded-full ${isDark ? 'border-gray-800 border-t-[#91D18B]' : 'border-gray-200 border-t-[#91D18B]'}`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  // Employer view
  if (userType === "arbeitgeber") {
    return (
      <div className={`min-h-screen p-6 ${isDark ? 'bg-[#1a1a1a]' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Willkommen, {user?.full_name?.split(' ')[0]} 👋
            </h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Was möchten Sie heute tun?</p>
          </motion.div>

          <div className="grid gap-4">
            {[
              { title: "Job erstellen", desc: "Neue Stelle ausschreiben", emoji: "➕", link: "CreateJob", color: accentColor },
              { title: "Meine Jobs", desc: "Anzeigen verwalten", emoji: "💼", link: "MyJobs", color: accentColor },
              { title: "Bewerbungen", desc: "Kandidaten prüfen", emoji: "📋", link: "Applications", color: accentColor },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => navigate(createPageUrl(item.link))}
                  className="w-full h-24 rounded-2xl p-6 flex items-center gap-4 justify-start text-left border-0 shadow-lg"
                  style={{ 
                    background: isDark 
                      ? `linear-gradient(135deg, ${item.color}20, ${item.color}10)`
                      : `linear-gradient(135deg, ${item.color}15, ${item.color}05)`
                  }}
                >
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-sm"
                    style={{ backgroundColor: `${item.color}30` }}
                  >
                    {item.emoji}
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.title}</h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{item.desc}</p>
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Worker view
  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#1a1a1a]' : 'bg-gray-50'}`}>
      {/* Welcome Header */}
      <div className={`sticky top-0 z-20 ${isDark ? 'bg-[#1a1a1a]' : 'bg-white'} border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="p-6 pb-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-6"
          >
            {user?.profile_picture ? (
              <img src={user.profile_picture} alt="Avatar" className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#91D18B] to-[#7BC67B] flex items-center justify-center text-white text-lg font-bold">
                {user?.full_name?.charAt(0) || 'J'}
              </div>
            )}
            <div className="flex-1">
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Hallo, {user?.full_name?.split(' ')[0]}! 👋
              </h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {filteredJobs.length} Jobs verfügbar
              </p>
            </div>
          </motion.div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <Input
              placeholder="Jobs suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-12 pr-4 h-14 rounded-2xl border-2 text-base ${isDark ? 'border-gray-800 bg-gray-900 text-white placeholder:text-gray-500 focus:border-[#91D18B]' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-[#91D18B]'}`}
            />
          </div>

          {/* Category Carousel */}
          <CategoryCarousel 
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-24 md:bottom-8 right-6 z-30 flex flex-col gap-3">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowFavorites(!showFavorites)}
          className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center border-2 ${
            showFavorites 
              ? 'bg-red-500 border-red-500' 
              : isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <Heart className={`w-6 h-6 ${showFavorites ? 'fill-white text-white' : isDark ? 'text-gray-400' : 'text-gray-600'}`} />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
          className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center border-2 ${isDark ? 'bg-[#91D18B] border-[#91D18B]' : 'bg-[#91D18B] border-[#91D18B]'}`}
        >
          <MapIcon className="w-6 h-6 text-white" />
        </motion.button>
      </div>

      {/* Job List with Snap Scrolling */}
      <div 
        ref={scrollRef}
        className="pb-32 px-6 pt-6 space-y-4 overflow-y-auto snap-y snap-mandatory"
        style={{ height: 'calc(100vh - 300px)' }}
      >
        {filteredJobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`text-center py-20 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Keine Jobs gefunden
            </h3>
            <p>Versuche andere Filter</p>
          </motion.div>
        ) : (
          filteredJobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="snap-start"
            >
              <ModernJobCard 
                job={job}
                isSaved={savedJobs.includes(job.id)}
                onSaveToggle={loadData}
                isHot={hotJobs.some(hj => hj.id === job.id)}
              />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}