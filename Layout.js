import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "./utils";
import { Home, User, Briefcase, MessageSquare, Wallet, Shield } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "./Components/ui/sidebar";
import { User as UserEntity } from "./Entities/User";
import { motion } from "framer-motion";
import MessageNotification from "./Components/notifications/MessageNotification";
import { ThemeProvider, useTheme } from "./Components/theme/ThemeProvider";
import AIAssistant from "./Components/ai/AIAssistant";

function LayoutContent({ children, currentPageName }) {
  const location = useLocation();
  const [userType, setUserType] = React.useState(null);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const { theme, accentColor } = useTheme();

  const loadUserType = React.useCallback(async () => {
    try {
      const user = await UserEntity.me();
      setUserType(user.user_type);
      setIsAdmin(user.role === "admin");
    } catch (error) {
      setUserType(null);
      setIsAdmin(false);
    }
  }, []);

  React.useEffect(() => {
    loadUserType();
  }, [loadUserType]);

  // Desktop sidebar items
  const employerItems = [
    { title: "Home", url: createPageUrl("Home"), emoji: "🏠" },
    { title: "Job erstellen", url: createPageUrl("CreateJob"), emoji: "➕" },
    { title: "Meine Jobs", url: createPageUrl("MyJobs"), emoji: "💼" },
    { title: "Bewerbungen", url: createPageUrl("Applications"), emoji: "📋" },
    { title: "Ausgaben", url: createPageUrl("Finances"), emoji: "💰" },
    { title: "Nachrichten", url: createPageUrl("Messages"), emoji: "💬" },
    { title: "Profil", url: createPageUrl("Profile"), emoji: "👤" },
  ];

  const workerItems = [
    { title: "Home", url: createPageUrl("Home"), emoji: "🏠" },
    { title: "Einnahmen", url: createPageUrl("Finances"), emoji: "💵" },
    { title: "Nachrichten", url: createPageUrl("Messages"), emoji: "💬" },
    { title: "Profil", url: createPageUrl("Profile"), emoji: "👤" },
  ];

  // Mobile bottom nav - 3 items only (Profile moved to top right)
  const mobileNavItems = userType === "arbeitgeber" 
    ? [
        { title: "Nachrichten", url: createPageUrl("Messages"), emoji: "💬" },
        { title: "Home", url: createPageUrl("Home"), emoji: "🏠" },
        { title: "Ausgaben", url: createPageUrl("Finances"), emoji: "💰" },
      ]
    : [
        { title: "Nachrichten", url: createPageUrl("Messages"), emoji: "💬" },
        { title: "Home", url: createPageUrl("Home"), emoji: "🏠" },
        { title: "Einnahmen", url: createPageUrl("Finances"), emoji: "💵" },
      ];

  const adminItems = [
    { title: "Gewerbe-Verwaltung", url: createPageUrl("AdminBusinessRegistrations"), emoji: "🛡️" },
    { title: "Feedback", url: createPageUrl("AdminFeedback"), emoji: "💬" },
  ];

  const navigationItems = userType === "arbeitgeber" ? employerItems : workerItems;

  const isDark = theme === "dark";

  return (
    <SidebarProvider>
      <MessageNotification />
      <AIAssistant />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        :root {
          --bg-primary: ${isDark ? '#1a1a1a' : '#f8faf8'};
          --bg-secondary: ${isDark ? '#1a1a1a' : '#ffffff'};
          --bg-tertiary: ${isDark ? '#2a2a2a' : '#f0f4f0'};
          --accent-color: ${accentColor};
          --text-primary: ${isDark ? '#ffffff' : '#1a1a1a'};
          --text-secondary: ${isDark ? '#a1a1aa' : '#6b7280'};
          --text-muted: ${isDark ? '#71717a' : '#9ca3af'};
        }

      * {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        box-sizing: border-box;
      }

      html, body {
        background: ${isDark ? '#1a1a1a' : '#f8faf8'};
        color: var(--text-primary);
        overflow-x: hidden;
        max-width: 100vw;
      }

      /* Smooth transitions */
      * {
        transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
      }

      /* Custom scrollbar */
      ::-webkit-scrollbar {
        width: 6px;
      }

      ::-webkit-scrollbar-track {
        background: ${isDark ? '#1a1a1a' : '#f0f4f0'};
      }

      ::-webkit-scrollbar-thumb {
        background: ${isDark ? '#404040' : '#d1d5db'};
        border-radius: 10px;
      }

      ::-webkit-scrollbar-thumb:hover {
        background: ${accentColor};
      }

      /* Hide sidebar on mobile */
      @media (max-width: 768px) {
        [data-sidebar] {
          display: none !important;
        }
      }
    `}</style>
      <div className={`min-h-screen flex w-full relative overflow-x-hidden max-w-[100vw] ${isDark ? 'bg-[#1a1a1a]' : 'bg-[#f8faf8]'}`}>
        {/* Desktop Sidebar */}
        <Sidebar className={`border-r hidden md:flex ${isDark ? 'border-gray-800 bg-[#1a1a1a]' : 'border-gray-200 bg-white'}`}>
          <SidebarHeader className={`border-b p-6 ${isDark ? 'border-gray-800 bg-[#1a1a1a]' : 'border-gray-100 bg-white'}`}>
            <Link to={createPageUrl("Home")}>
              <motion.div 
                className="flex items-center gap-3"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div 
                  className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20"
                  whileHover={{ rotate: 5, scale: 1.1 }}
                >
                  <span className="text-2xl">💼</span>
                </motion.div>
                <div>
                  <h2 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>JobMatch</h2>
                  <p className="text-xs text-green-500 font-medium">
                    {userType === "arbeitgeber" ? "Arbeitgeber" : "Jobsuche"}
                  </p>
                </div>
              </motion.div>
            </Link>
          </SidebarHeader>
          
          <SidebarContent className={`p-4 ${isDark ? 'bg-[#1a1a1a]' : 'bg-white'}`}>
            <SidebarGroup>
              <SidebarMenu className="space-y-1">
                {navigationItems.map((item, index) => (
                  <SidebarMenuItem key={item.title}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <SidebarMenuButton 
                        asChild 
                        className={`h-12 rounded-xl transition-all duration-200 ${
                          location.pathname === item.url 
                            ? `bg-[${accentColor}]/10 border border-[${accentColor}]/30`
                            : isDark 
                              ? 'text-gray-400 hover:bg-gray-800 hover:text-white' 
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                        style={location.pathname === item.url ? { color: accentColor } : {}}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4">
                          <span className="text-xl">{item.emoji}</span>
                          <span className="font-medium text-sm">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </motion.div>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>

            {isAdmin && (
              <SidebarGroup className={`mt-6 pt-6 border-t ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                <div className="text-xs font-bold text-amber-500 uppercase tracking-wider px-4 py-2 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                  Admin
                </div>
                <SidebarMenu className="space-y-1">
                  {adminItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`h-12 rounded-xl ${
                          location.pathname === item.url 
                            ? isDark 
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                              : 'bg-amber-50 text-amber-600 border border-amber-200'
                            : isDark 
                              ? 'text-gray-400 hover:bg-gray-800 hover:text-white' 
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4">
                          <span className="text-xl">{item.emoji}</span>
                          <span className="font-medium text-sm">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroup>
            )}
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col min-h-screen pb-20 md:pb-0">
          {/* Mobile Top Header with Profile */}
          <div className={`md:hidden sticky top-0 z-20 backdrop-blur-lg border-b px-4 py-3 ${
            isDark 
              ? 'bg-[#1a1a1a]/95 border-gray-800' 
              : 'bg-white/95 border-gray-100'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center shadow-sm">
                  <span className="text-base">💼</span>
                </div>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>JobMatch</span>
              </div>
              <Link to={createPageUrl("Profile")}>
                <motion.div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
                  whileTap={{ scale: 0.9 }}
                >
                  <span className="text-xl">👤</span>
                </motion.div>
              </Link>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className={`fixed bottom-0 left-0 right-0 backdrop-blur-lg border-t md:hidden z-50 safe-area-pb ${
          isDark 
            ? 'bg-[#1a1a1a]/95 border-gray-800' 
            : 'bg-white/95 border-gray-100'
        }`}>
          <div className="flex items-center justify-around py-2 px-4 pb-2">
            {mobileNavItems.map((item, index) => {
              const isActive = location.pathname === item.url;
              const isCenter = index === 1;
              const isCenterActive = isCenter && isActive;
              return (
                <Link 
                  key={item.title} 
                  to={item.url}
                  className="flex-1 flex justify-center"
                >
                  <motion.div
                    className={`flex flex-col items-center py-2 px-4 rounded-2xl ${
                      isCenter 
                        ? isCenterActive
                          ? 'bg-gradient-to-br from-green-400 to-green-500 -mt-5 shadow-lg shadow-green-500/30'
                          : isDark ? 'bg-gray-800 -mt-5 shadow-lg' : 'bg-gray-100 -mt-5 shadow-md'
                        : isActive 
                          ? isDark ? 'bg-green-500/20' : 'bg-green-50' 
                          : ''
                    }`}
                    whileTap={{ scale: 0.9 }}
                  >
                    <span className={`${isCenter ? 'text-2xl' : 'text-xl'}`}>
                      {item.emoji}
                    </span>
                    {!isCenter && (
                      <span className={`text-[10px] font-medium mt-1 ${
                        isActive 
                          ? isDark ? 'text-green-400' : 'text-green-600' 
                          : isDark ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        {item.title}
                      </span>
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </SidebarProvider>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <ThemeProvider>
      <LayoutContent currentPageName={currentPageName}>{children}</LayoutContent>
    </ThemeProvider>
  );
}