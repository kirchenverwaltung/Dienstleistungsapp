import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../../Entities/User";
import { motion } from "framer-motion";

const ThemeContext = createContext({
  theme: "light",
  setTheme: () => {},
  autoNightMode: true,
  setAutoNightMode: () => {},
  accentColor: "#91D18B",
  userType: null,
});

export const useTheme = () => useContext(ThemeContext);

// Calculate sunset based on location (simplified)
const getSunsetTime = () => {
  const now = new Date();
  const month = now.getMonth();
  // Approximate sunset times for central Europe
  const sunsetHours = [17, 18, 19, 20, 21, 21, 21, 20, 19, 18, 17, 16];
  return sunsetHours[month];
};

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState("light");
  const [autoNightMode, setAutoNightModeState] = useState(true);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [userType, setUserType] = useState(null);
  const [accentColor, setAccentColor] = useState("#91D18B");

  // Load user type and set accent color
  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await User.me();
        setUserType(user.user_type);
        setAccentColor(user.user_type === "arbeitgeber" ? "#3A4660" : "#91D18B");
      } catch (error) {
        // Not logged in
      }
    };
    loadUser();
  }, []);

  // Load saved preferences
  useEffect(() => {
    const savedTheme = localStorage.getItem("jobmatch-theme");
    const savedAutoNight = localStorage.getItem("jobmatch-auto-night");
    const hasChosen = localStorage.getItem("jobmatch-theme-chosen");
    
    if (savedTheme) {
      setThemeState(savedTheme);
    }
    if (savedAutoNight !== null) {
      setAutoNightModeState(savedAutoNight === "true");
    }
    
    // Show picker if first time
    if (!hasChosen) {
      setTimeout(() => setShowThemePicker(true), 500);
    }
  }, []);

  // Auto night mode based on sunset
  useEffect(() => {
    if (!autoNightMode) return;
    
    const checkTime = () => {
      const hour = new Date().getHours();
      const sunsetHour = getSunsetTime();
      const sunriseHour = 7;
      const isNight = hour >= sunsetHour || hour < sunriseHour;
      
      if (isNight && theme === "light") {
        setThemeState("dark");
      } else if (!isNight && theme === "dark") {
        const savedTheme = localStorage.getItem("jobmatch-theme");
        if (savedTheme === "light") {
          setThemeState("light");
        }
      }
    };
    
    checkTime();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, [autoNightMode, theme]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem("jobmatch-theme", newTheme);
    localStorage.setItem("jobmatch-theme-chosen", "true");
  };

  const setAutoNightMode = (enabled) => {
    setAutoNightModeState(enabled);
    localStorage.setItem("jobmatch-auto-night", enabled.toString());
  };

  const dismissPicker = () => {
    setShowThemePicker(false);
    localStorage.setItem("jobmatch-theme-chosen", "true");
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, autoNightMode, setAutoNightMode, accentColor, userType }}>
      {showThemePicker && (
        <ThemePickerPopup 
          onSelect={(t) => { setTheme(t); dismissPicker(); }}
          onDismiss={dismissPicker}
        />
      )}
      {children}
    </ThemeContext.Provider>
  );
}

function ThemePickerPopup({ onSelect, onDismiss }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-800"
      >
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="text-6xl mb-4"
          >
            💼
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Willkommen bei JobMatch!
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Wähle deinen bevorzugten Darstellungsmodus
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect("light")}
            className="p-6 rounded-2xl border-2 border-gray-200 hover:border-[#91D18B] bg-gradient-to-br from-gray-50 to-white transition-all group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#91D18B]/0 to-[#91D18B]/0 group-hover:from-[#91D18B]/10 group-hover:to-[#91D18B]/5 transition-all duration-300" />
            <div className="relative">
              <div className="text-4xl mb-3">☀️</div>
              <div className="font-bold text-gray-900 mb-1">Hell</div>
              <div className="text-xs text-gray-500">Tagsüber</div>
            </div>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect("dark")}
            className="p-6 rounded-2xl border-2 border-gray-700 hover:border-[#91D18B] bg-gradient-to-br from-gray-800 to-gray-900 transition-all group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#91D18B]/0 to-[#91D18B]/0 group-hover:from-[#91D18B]/10 group-hover:to-[#91D18B]/5 transition-all duration-300" />
            <div className="relative">
              <div className="text-4xl mb-3">🌙</div>
              <div className="font-bold text-white mb-1">Dunkel</div>
              <div className="text-xs text-gray-400">Abends</div>
            </div>
          </motion.button>
        </div>
        
        <div className="bg-[#91D18B]/10 dark:bg-[#91D18B]/5 rounded-xl p-4 border border-[#91D18B]/20">
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center leading-relaxed">
            ✨ Der Modus wechselt automatisch bei Sonnenuntergang. Du kannst das jederzeit in den Einstellungen anpassen.
          </p>
        </div>
      </motion.div>
    </div>
  );
}