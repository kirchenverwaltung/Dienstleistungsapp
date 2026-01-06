import React, { useState, useEffect } from "react";
import { User } from "../Entities/User";
import { Review } from "../Entities/Review";
import { Application } from "../Entities/Application";
import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card";
import { Input } from "../Components/ui/input";
import { Textarea } from "../Components/ui/textarea";
import { Label } from "../Components/ui/label";
import { Button } from "../Components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Components/ui/select";
import { Badge } from "../Components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../Components/ui/tabs";
import { Phone, Building2, FileText, Star, Briefcase, Award, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "../api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import ThemeSwitch from "../Components/theme/ThemeSwitch";
import { useTheme } from "../Components/theme/ThemeProvider";

const skillOptions = [
  "Barkeeper", "Kellner/in", "Service", "Küchenhilfe", "Event-Helfer",
  "Büroarbeit", "IT-Support", "Grafikdesign", "Social Media",
  "Handwerk", "Malerei", "Elektriker", "Tischlerei",
  "Transport", "Umzugshilfe", "Nachhilfe", "Promotion"
];

const statusColors = {
  ausstehend: "bg-amber-100 text-amber-700 border-amber-200",
  angenommen: "bg-green-100 text-green-700 border-green-200",
  abgelehnt: "bg-red-100 text-red-600 border-red-200",
};

export default function ProfilePage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [userData, setUserData] = useState({
    user_type: "",
    phone: "",
    company: "",
    bio: "",
    availability: "",
    skills: [],
    experience: "",
    hourly_rate_expectation: ""
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      setUserData({
        user_type: currentUser.user_type || "",
        phone: currentUser.phone || "",
        company: currentUser.company || "",
        bio: currentUser.bio || "",
        availability: currentUser.availability || "",
        skills: currentUser.skills || [],
        experience: currentUser.experience || "",
        hourly_rate_expectation: currentUser.hourly_rate_expectation || ""
      });

      if (currentUser.user_type === "jobsuchender") {
        const userReviews = await Review.filter({ worker_email: currentUser.email }, "-created_date");
        setReviews(userReviews);
        
        const userApplications = await Application.filter({ created_by: currentUser.email }, "-created_date");
        setApplications(userApplications);
      }
    } catch (error) {
      await User.loginWithRedirect(window.location.href);
    }
    setIsLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await User.updateMyUserData(userData);
      await loadUser();
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
    }
    setIsSaving(false);
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await User.updateMyUserData({ profile_picture: file_url });
      await loadUser();
    } catch (error) {
      console.error("Fehler beim Upload:", error);
    }
    setIsUploading(false);
  };

  const toggleSkill = (skill) => {
    setUserData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleLogout = () => {
    base44.auth.logout();
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
      <div className="max-w-3xl mx-auto px-4 py-6 md:px-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className={`border rounded-2xl overflow-hidden shadow-sm ${isDark ? 'border-gray-800 bg-[#1a1a1a]' : 'border-gray-100 bg-white'}`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  {user.profile_picture ? (
                    <img 
                      src={user.profile_picture} 
                      alt="Profile" 
                      className="w-20 h-20 rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl flex items-center justify-center shadow-sm">
                      <span className="text-4xl">👤</span>
                    </div>
                  )}
                  <label className={`absolute -bottom-1 -right-1 rounded-xl p-2 cursor-pointer shadow-sm ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}>
                    <span className="text-sm">📸</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleProfilePictureUpload}
                      disabled={isUploading}
                    />
                  </label>
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className={`text-xl font-bold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.full_name}</h1>
                  <p className={`text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</p>
                  {user.user_type === "jobsuchender" && user.rating > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-lg">⭐</span>
                      <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.rating?.toFixed(1)}</span>
                      <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>({user.total_reviews || 0})</span>
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className={`rounded-xl ${isDark ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs for Workers */}
        {userData.user_type === "jobsuchender" && (
          <div className="mb-6">
            <div className={`flex gap-2 p-1 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <Button
                onClick={() => setActiveTab("profile")}
                className={`flex-1 rounded-lg h-10 text-sm font-medium ${
                  activeTab === "profile" 
                    ? "bg-green-500 text-white shadow-sm" 
                    : isDark ? "bg-transparent text-gray-400 hover:text-white" : "bg-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                👤 Profil
              </Button>
              <Button
                onClick={() => setActiveTab("applications")}
                className={`flex-1 rounded-lg h-10 text-sm font-medium relative ${
                  activeTab === "applications" 
                    ? "bg-green-500 text-white shadow-sm" 
                    : isDark ? "bg-transparent text-gray-400 hover:text-white" : "bg-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                📝 Bewerbungen
                {applications.filter(a => a.status === "ausstehend").length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white text-xs rounded-full flex items-center justify-center">
                    {applications.filter(a => a.status === "ausstehend").length}
                  </span>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === "applications" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {applications.length === 0 ? (
              <Card className={`border rounded-2xl ${isDark ? 'border-gray-800 bg-[#1a1a1a]' : 'border-gray-100 bg-white'}`}>
                <CardContent className="p-8 text-center">
                  <span className="text-5xl mb-4 block">📝</span>
                  <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Keine Bewerbungen</h3>
                  <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Du hast dich noch nicht beworben</p>
                  <Link to={createPageUrl("Home")}>
                    <Button className="bg-green-500 hover:bg-green-600 text-white rounded-xl">
                      Jobs finden
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className={`border rounded-xl p-4 text-center ${isDark ? 'bg-[#1a1a1a] border-gray-800' : 'bg-white border-gray-100'}`}>
                    <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{applications.length}</div>
                    <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Gesamt</div>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-amber-600">
                      {applications.filter(a => a.status === "ausstehend").length}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Ausstehend</div>
                  </div>
                  <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {applications.filter(a => a.status === "angenommen").length}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Angenommen</div>
                  </div>
                </div>

                {/* Application List */}
                {applications.map((app, index) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link to={`${createPageUrl("JobDetails")}?id=${app.job_id}`}>
                      <Card className={`border hover:shadow-md rounded-2xl cursor-pointer transition-shadow ${isDark ? 'border-gray-800 bg-[#1a1a1a]' : 'border-gray-100 bg-white'}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className={`font-bold truncate flex-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{app.job_title}</h3>
                            <Badge className={`${statusColors[app.status]} border rounded-full text-xs ml-2`}>
                              {app.status === "ausstehend" && "⏳ "}
                              {app.status === "angenommen" && "✅ "}
                              {app.status === "abgelehnt" && "❌ "}
                              {app.status}
                            </Badge>
                          </div>
                          <div className={`flex items-center gap-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            <span>📅 {format(new Date(app.job_date), "d. MMM", { locale: de })}</span>
                            <span>📤 {format(new Date(app.created_date), "d. MMM", { locale: de })}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </>
            )}
          </motion.div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Card className={`border rounded-2xl shadow-sm ${isDark ? 'border-gray-800 bg-[#1a1a1a]' : 'border-gray-100 bg-white'}`}>
              <CardContent className="p-6">
                <form onSubmit={handleSave} className="space-y-6">
                  {/* User Type */}
                  <div className="space-y-2">
                    <Label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Ich bin...</Label>
                    <Select
                      value={userData.user_type}
                      onValueChange={(value) => setUserData({...userData, user_type: value})}
                    >
                      <SelectTrigger className={`h-12 rounded-xl border ${isDark ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-200 bg-gray-50 text-gray-900'}`}>
                        <SelectValue placeholder="Bitte wählen" />
                      </SelectTrigger>
                      <SelectContent className={isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}>
                        <SelectItem value="arbeitgeber" className={isDark ? 'text-white' : 'text-gray-900'}>Arbeitgeber</SelectItem>
                        <SelectItem value="jobsuchender" className={isDark ? 'text-white' : 'text-gray-900'}>Jobsuchender</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label className={`text-sm font-medium flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      <Phone className="w-4 h-4" />
                      Telefon
                    </Label>
                    <Input
                      type="tel"
                      value={userData.phone}
                      onChange={(e) => setUserData({...userData, phone: e.target.value})}
                      placeholder="+49 123 456789"
                      className={`h-12 rounded-xl border ${isDark ? 'border-gray-700 bg-gray-800 text-white placeholder:text-gray-500' : 'border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400'}`}
                    />
                  </div>

                  {/* Company (Employer) */}
                  {userData.user_type === "arbeitgeber" && (
                    <div className="space-y-2">
                      <Label className={`text-sm font-medium flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        <Building2 className="w-4 h-4" />
                        Firmenname
                      </Label>
                      <Input
                        value={userData.company}
                        onChange={(e) => setUserData({...userData, company: e.target.value})}
                        placeholder="z.B. Musterfirma GmbH"
                        className={`h-12 rounded-xl border ${isDark ? 'border-gray-700 bg-gray-800 text-white placeholder:text-gray-500' : 'border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400'}`}
                      />
                    </div>
                  )}

                  {/* Worker-specific fields */}
                  {userData.user_type === "jobsuchender" && (
                    <>
                      {/* Hourly Rate */}
                      <div className="space-y-2">
                        <Label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>💰 Erwarteter Stundenlohn (€)</Label>
                        <Input
                          type="number"
                          step="0.5"
                          value={userData.hourly_rate_expectation}
                          onChange={(e) => setUserData({...userData, hourly_rate_expectation: e.target.value})}
                          placeholder="z.B. 15"
                          className={`h-12 rounded-xl border ${isDark ? 'border-gray-700 bg-gray-800 text-white placeholder:text-gray-500' : 'border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400'}`}
                        />
                      </div>

                      {/* Skills */}
                      <div className="space-y-2">
                        <Label className={`text-sm font-medium flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          <Award className="w-4 h-4" />
                          Fähigkeiten
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {skillOptions.map(skill => (
                            <Badge
                              key={skill}
                              onClick={() => toggleSkill(skill)}
                              className={`cursor-pointer px-3 py-2 rounded-full text-xs border ${
                                userData.skills.includes(skill)
                                  ? 'bg-green-500 text-white border-green-500'
                                  : isDark ? 'bg-gray-800 text-gray-300 border-gray-700 hover:border-green-400' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-green-300'
                              }`}
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Experience */}
                      <div className="space-y-2">
                        <Label className={`text-sm font-medium flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          <Briefcase className="w-4 h-4" />
                          Erfahrung
                        </Label>
                        <Textarea
                          value={userData.experience}
                          onChange={(e) => setUserData({...userData, experience: e.target.value})}
                          placeholder="Beschreibe deine Erfahrung..."
                          className={`rounded-xl border min-h-[80px] ${isDark ? 'border-gray-700 bg-gray-800 text-white placeholder:text-gray-500' : 'border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400'}`}
                        />
                      </div>

                      {/* Availability */}
                      <div className="space-y-2">
                        <Label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>📅 Verfügbarkeit</Label>
                        <Input
                          value={userData.availability}
                          onChange={(e) => setUserData({...userData, availability: e.target.value})}
                          placeholder="z.B. Abends & Wochenenden"
                          className={`h-12 rounded-xl border ${isDark ? 'border-gray-700 bg-gray-800 text-white placeholder:text-gray-500' : 'border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400'}`}
                        />
                      </div>
                    </>
                  )}

                  {/* Bio */}
                  <div className="space-y-2">
                    <Label className={`text-sm font-medium flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      <FileText className="w-4 h-4" />
                      {userData.user_type === "arbeitgeber" ? "Über das Unternehmen" : "Über mich"}
                    </Label>
                    <Textarea
                      value={userData.bio}
                      onChange={(e) => setUserData({...userData, bio: e.target.value})}
                      placeholder={userData.user_type === "arbeitgeber" 
                        ? "Beschreiben Sie Ihr Unternehmen..." 
                        : "Erzähle etwas über dich..."
                      }
                      className={`rounded-xl border min-h-[100px] ${isDark ? 'border-gray-700 bg-gray-800 text-white placeholder:text-gray-500' : 'border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400'}`}
                    />
                  </div>

                  {/* Save Button */}
                  <Button
                    type="submit"
                    disabled={isSaving || !userData.user_type}
                    className="w-full h-14 bg-green-500 hover:bg-green-600 rounded-xl font-bold text-lg text-white"
                  >
                    {isSaving ? "Wird gespeichert..." : "💾 Speichern"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Theme Settings */}
            <div className="mt-6">
              <ThemeSwitch />
            </div>

            {/* Reviews */}
            {userData.user_type === "jobsuchender" && reviews.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  ⭐ Bewertungen ({reviews.length})
                </h2>
                <div className="space-y-3">
                  {reviews.map((review) => (
                    <Card key={review.id} className={`border rounded-2xl ${isDark ? 'border-gray-800 bg-[#1a1a1a]' : 'border-gray-100 bg-white'}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{review.employer_name}</div>
                            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{review.job_title}</div>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? 'text-amber-400 fill-amber-400'
                                    : isDark ? 'text-gray-700' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{review.comment}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}