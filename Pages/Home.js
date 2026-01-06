import React, { useState, useEffect } from "react";
import { Job } from "../Entities/Job";
import { User } from "../Entities/User";
import { Application } from "../Entities/Application";
import { Card, CardContent } from "../Components/ui/card";
import { Button } from "../Components/ui/button";
import { Input } from "../Components/ui/input";
import { Badge } from "../Components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Components/ui/select";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { motion } from "framer-motion";
import JobCard from "../Components/jobs/JobCard";
import JobMap from "../Components/map/JobMap";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useTheme } from "../Components/theme/ThemeProvider";

const categories = ["Alle", "Gastronomie", "Event", "Büro", "Handwerk", "IT", "Verkauf", "Promotion", "Umzugshilfe", "Nachhilfe", "Sonstiges"];

const germanCities = [
  "Berlin", "Hamburg", "München", "Köln", "Frankfurt", "Stuttgart", "Düsseldorf",
  "Dortmund", "Essen", "Leipzig", "Bremen", "Dresden", "Hannover", "Nürnberg"
];

export default function HomePage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [hotJobs, setHotJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [pendingApplications, setPendingApplications] = useState([]);
  const [userType, setUserType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Alle");
  const [minAmount, setMinAmount] = useState("");
  const [amountType, setAmountType] = useState("total");
  const [showFilters, setShowFilters] = useState(false);
  
  // Map & Panel state
  const [showListView, setShowListView] = useState(false);
  const [userPosition, setUserPosition] = useState(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const jobListRef = React.useRef(null);

  // Restore scroll position when returning to list
  useEffect(() => {
    if (showListView && jobListRef.current && scrollPosition > 0) {
      jobListRef.current.scrollTop = scrollPosition;
    }
  }, [showListView]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPosition([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.log("Location error:", error);
          setUserPosition([52.52, 13.405]);
        }
      );
    }
  }, []);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setUserType(user.user_type);
      setSavedJobs(user.saved_jobs || []);
      setSelectedCity(user.preferred_city || "");

      if (!user.user_type) {
        navigate(createPageUrl("Profile"));
        return;
      }

      if (user.user_type === "arbeitgeber") {
        setIsLoading(false);
        return;
      }

      const apps = await Application.filter({ created_by: user.email, status: "ausstehend" }, "-created_date");
      setPendingApplications(apps);

      const allJobs = await Job.filter({ status: "offen" }, "-created_date");
      setJobs(allJobs);

      const calculateHotScore = (job) => {
        const startTime = parseFloat(job.start_time?.replace(":", ".") || "0");
        const endTime = parseFloat(job.end_time?.replace(":", ".") || "0");
        const duration = endTime - startTime;
        if (job.payment_type === "fixed") {
          return duration > 0 ? job.fixed_amount / duration : 0;
        }
        return duration > 0 ? job.hourly_rate / duration : 0;
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

    if (selectedCity) {
      filtered = filtered.filter(job =>
        job.city?.toLowerCase().includes(selectedCity.toLowerCase()) ||
        job.location?.toLowerCase().includes(selectedCity.toLowerCase())
      );
    }

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

    if (minAmount) {
      const minAmountNum = parseFloat(minAmount);
      filtered = filtered.filter(job => {
        const startTime = parseFloat(job.start_time?.replace(":", ".") || "0");
        const endTime = parseFloat(job.end_time?.replace(":", ".") || "0");
        const duration = endTime - startTime;

        if (amountType === "hourly") {
          if (job.payment_type === "fixed") {
            return duration > 0 ? job.fixed_amount / duration >= minAmountNum : false;
          }
          return job.hourly_rate >= minAmountNum;
        } else {
          if (job.payment_type === "fixed") {
            return job.fixed_amount >= minAmountNum;
          }
          return job.hourly_rate * duration >= minAmountNum;
        }
      });
    }

    const available = filtered.filter(job => {
      const availablePositions = (job.total_positions || 1) - (job.filled_positions || 0);
      return availablePositions > 0;
    });

    setFilteredJobs(available);
  }, [jobs, selectedCity, searchTerm, selectedCategory, minAmount, amountType]);

  const handleCityChange = async (city) => {
    setSelectedCity(city);
    try {
      await User.updateMyUserData({ preferred_city: city });
    } catch (error) {
      console.error("Fehler:", error);
    }
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

  // Employer view
  if (userType === "arbeitgeber") {
    return (
      <div className={`min-h-screen p-4 md:p-8 ${isDark ? 'bg-[#0f0f0f]' : 'bg-[#f8faf8]'}`}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Willkommen 👋</h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Was möchten Sie tun?</p>
          </motion.div>

          <div className="flex flex-col gap-3">
            {[
              { title: "Job erstellen", desc: "Neue Anzeige", emoji: "➕", link: "CreateJob", color: "from-green-400 to-green-500" },
              { title: "Meine Jobs", desc: "Verwalten", emoji: "💼", link: "MyJobs", color: "from-blue-400 to-blue-500" },
              { title: "Bewerbungen", desc: "Prüfen", emoji: "📋", link: "Applications", color: "from-purple-400 to-purple-500" },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={createPageUrl(item.link)}>
                  <Card className={`border hover:shadow-md rounded-2xl transition-shadow ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-white'}`}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center shadow-sm`}>
                        <span className="text-xl">{item.emoji}</span>
                      </div>
                      <div>
                        <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.title}</h3>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{item.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Worker view with Map
  return (
    <div className={`h-[calc(100vh-140px)] md:h-[calc(100vh-60px)] flex flex-col overflow-hidden relative ${isDark ? 'bg-[#1a1a1a]' : 'bg-gray-100'}`}>
      {/* Map - Always rendered but hidden when list is shown */}
      <div 
        className="absolute inset-0"
        style={{ 
          display: showListView ? 'none' : 'block',
          bottom: 130 
        }}
      >
        <JobMap 
          jobs={filteredJobs} 
          hotJobs={hotJobs}
          userPosition={userPosition}
        />
      </div>
      
      {/* Pull-up handle to show list - Only when map is visible */}
      {!showListView && (
        <div
          className={`absolute bottom-0 left-0 right-0 rounded-t-3xl cursor-pointer z-10 ${isDark ? 'bg-gray-900 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]' : 'bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.08)]'}`}
          style={{ height: 130 }}
          onClick={() => setShowListView(true)}
        >
          <div className="flex flex-col items-center py-3 px-4">
            <div className={`w-10 h-1 rounded-full mb-2 ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
            <div className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <ChevronUp className="w-4 h-4" />
              <span className="text-sm font-medium">{filteredJobs.length} Jobs gefunden</span>
            </div>
          </div>
          
          {/* Search Preview */}
          <div className="px-4 pb-4">
            <div className="relative w-full">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg">🔍</span>
              <Input
                placeholder="Job suchen..."
                value={searchTerm}
                readOnly
                className={`w-full pl-10 h-12 rounded-xl border text-sm cursor-pointer ${isDark ? 'border-gray-700 bg-gray-800 text-white placeholder:text-gray-500' : 'border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400'}`}
              />
            </div>
          </div>
        </div>
      )}

      {/* List View Panel */}
      {showListView && (
        <div className={`absolute inset-0 z-20 flex flex-col ${isDark ? 'bg-[#0f0f0f]' : 'bg-[#f8faf8]'}`}>
          {/* Handle to close */}
          <div 
            className={`flex flex-col items-center py-3 cursor-pointer border-b ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}
            onClick={() => setShowListView(false)}
          >
            <div className={`w-10 h-1 rounded-full mb-2 ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
            <div className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <ChevronDown className="w-4 h-4" />
              <span className="text-sm font-medium">Karte anzeigen</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className={`px-4 py-3 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="relative w-full">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg">🔍</span>
              <Input
                placeholder="Job suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-12 h-12 rounded-xl border text-sm focus:ring-2 focus:ring-green-500/30 ${isDark ? 'border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 focus:border-green-400' : 'border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:border-green-400'}`}
              />
              <Button
                onClick={(e) => { e.stopPropagation(); setShowFilters(!showFilters); }}
                className={`absolute right-1.5 top-1/2 transform -translate-y-1/2 rounded-lg h-8 w-8 p-0 ${
                  showFilters ? 'bg-green-500 text-white' : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-500'
                }`}
              >
                <span className="text-sm">⚙️</span>
              </Button>
            </div>
          </div>

          {/* Categories */}
          <div className={`px-4 pb-3 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {categories.map(category => (
                <Badge
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`cursor-pointer px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 border ${
                    selectedCategory === category 
                      ? 'bg-green-500 text-white border-green-500' 
                      : isDark 
                        ? 'bg-gray-800 text-gray-300 border-gray-700 hover:border-green-400'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'
                  }`}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className={`px-4 pb-3 border-b ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
              <Card className={`border rounded-xl ${isDark ? 'border-gray-800 bg-gray-800' : 'border-gray-100 bg-gray-50'}`}>
                <CardContent className="p-3 space-y-3">
                  <div>
                    <label className={`text-xs font-medium mb-1 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>📍 Stadt</label>
                    <Select value={selectedCity} onValueChange={handleCityChange}>
                      <SelectTrigger className={`h-10 rounded-lg border text-sm ${isDark ? 'border-gray-700 bg-gray-900 text-white' : 'border-gray-200 bg-white text-gray-900'}`}>
                        <SelectValue placeholder="Alle Städte" />
                      </SelectTrigger>
                      <SelectContent className={isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}>
                        {germanCities.map(city => (
                          <SelectItem key={city} value={city} className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className={`text-xs font-medium mb-1 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>💰 Mindestbetrag</label>
                    <div className="flex gap-2">
                      <Select value={amountType} onValueChange={setAmountType}>
                        <SelectTrigger className={`w-24 h-10 rounded-lg border text-sm ${isDark ? 'border-gray-700 bg-gray-900 text-white' : 'border-gray-200 bg-white text-gray-900'}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className={isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}>
                          <SelectItem value="total" className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Gesamt</SelectItem>
                          <SelectItem value="hourly" className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Pro Std.</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        placeholder="€"
                        value={minAmount}
                        onChange={(e) => setMinAmount(e.target.value)}
                        className={`flex-1 h-10 rounded-lg border text-sm ${isDark ? 'border-gray-700 bg-gray-900 text-white placeholder:text-gray-500' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'}`}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Pending Applications */}
          {pendingApplications.length > 0 && (
            <div className="px-4 py-2">
              <Card className="border border-amber-200 bg-amber-50 rounded-xl">
                <CardContent className="p-3 flex items-center gap-3">
                  <span className="text-xl">⏳</span>
                  <div className="flex-1">
                    <p className="text-amber-700 font-semibold text-sm">
                      {pendingApplications.length} ausstehend
                    </p>
                  </div>
                  <Link to={createPageUrl("Profile")}>
                    <Button size="sm" className="bg-amber-100 hover:bg-amber-200 text-amber-700 border border-amber-300 rounded-lg text-xs h-8">
                      Anzeigen
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Jobs List */}
          <div 
            ref={jobListRef}
            className="flex-1 overflow-y-auto px-4 pb-24"
            onScroll={(e) => setScrollPosition(e.target.scrollTop)}
          >
            <div className="flex items-center justify-between mb-3 pt-2">
              <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Alle Jobs</h2>
              <Badge className="bg-green-100 text-green-700 border-0 rounded-full px-2.5 py-0.5 text-xs font-medium">
                {filteredJobs.length}
              </Badge>
            </div>

            {filteredJobs.length === 0 ? (
              <Card className={`border rounded-2xl ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-white'}`}>
                <CardContent className="p-8 text-center">
                  <span className="text-4xl mb-3 block">🤷</span>
                  <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Keine Jobs gefunden</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Versuche andere Filter</p>
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredJobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="w-full"
                  >
                    <JobCard 
                      job={job}
                      isSaved={savedJobs.includes(job.id)}
                      onSaveToggle={loadData}
                      isHot={hotJobs.some(hj => hj.id === job.id)}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}