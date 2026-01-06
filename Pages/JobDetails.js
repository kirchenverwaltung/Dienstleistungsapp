import React, { useState, useEffect } from "react";
import { Job } from "@/entities/Job";
import { Application } from "@/entities/Application";
import { User } from "@/entities/User";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Clock, Calendar, Users, Mail, Phone, Building2, CalendarPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useTheme } from "@/components/theme/ThemeProvider";

export default function JobDetailsPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [job, setJob] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [applicationData, setApplicationData] = useState({
    applicant_name: "",
    applicant_email: "",
    applicant_phone: "",
    experience: "",
    message: ""
  });

  useEffect(() => {
    loadJob();
  }, []);

  const loadJob = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get('id');
    
    if (jobId) {
      const jobs = await Job.filter({ id: jobId });
      if (jobs.length > 0) {
        setJob(jobs[0]);
      }

      try {
        const user = await User.me();
        setIsSaved((user.saved_jobs || []).includes(jobId));
        setApplicationData(prev => ({
          ...prev,
          applicant_name: user.full_name || "",
          applicant_email: user.email || "",
          applicant_phone: user.phone || ""
        }));

        const existingApp = await Application.filter({ 
          job_id: jobId, 
          created_by: user.email 
        });
        setHasApplied(existingApp.length > 0);
      } catch (error) {
        // Not logged in
      }
    }
  };

  const handleSaveToggle = async () => {
    try {
      const user = await User.me();
      const saved = user.saved_jobs || [];
      
      const newSaved = isSaved
        ? saved.filter(id => id !== job.id)
        : [...saved, job.id];
      
      await User.updateMyUserData({ saved_jobs: newSaved });
      setIsSaved(!isSaved);
    } catch (error) {
      await User.loginWithRedirect(window.location.href);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setIsApplying(true);

    try {
      await Application.create({
        job_id: job.id,
        job_title: job.title,
        job_date: job.date,
        employer_email: job.created_by,
        ...applicationData,
        status: "ausstehend"
      });

      setHasApplied(true);
      setShowApplicationForm(false);
    } catch (error) {
      console.error("Fehler bei Bewerbung:", error);
    }
    setIsApplying(false);
  };

  const calculateDuration = () => {
    if (!job?.start_time || !job?.end_time) return 0;
    const start = parseFloat(job.start_time.replace(":", "."));
    const end = parseFloat(job.end_time.replace(":", "."));
    return Math.max(0, end - start);
  };

  const getTotalEarnings = () => {
    if (job?.payment_type === "fixed") {
      return job.fixed_amount;
    }
    return job?.hourly_rate * calculateDuration();
  };

  const addToCalendar = () => {
    if (!job) return;
    
    const startDate = new Date(job.date);
    const [startHour, startMin] = (job.start_time || "09:00").split(":").map(Number);
    const [endHour, endMin] = (job.end_time || "17:00").split(":").map(Number);
    
    startDate.setHours(startHour, startMin, 0);
    const endDate = new Date(job.date);
    endDate.setHours(endHour, endMin, 0);
    
    const formatDate = (d) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    
    const title = encodeURIComponent(`Job: ${job.title} bei ${job.company_name}`);
    const location = encodeURIComponent(job.location || "");
    const details = encodeURIComponent(`Verdienst: ${job.payment_type === "fixed" ? job.fixed_amount + "€" : job.hourly_rate + "€/h"}\n\n${job.description || ""}`);
    
    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatDate(startDate)}/${formatDate(endDate)}&location=${location}&details=${details}`;
    
    window.open(googleUrl, "_blank");
  };

  if (!job) {
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

  const availablePositions = (job.total_positions || 1) - (job.filled_positions || 0);
  const isFullyBooked = availablePositions <= 0;

  return (
    <div className={`min-h-screen pb-24 md:pb-8 ${isDark ? 'bg-[#0f0f0f]' : 'bg-[#f8faf8]'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 border-b p-4 ${isDark ? 'bg-[#1a1a1a] border-gray-800' : 'bg-white border-gray-200'}`}>
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className={`rounded-xl ${isDark ? 'text-white hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className={`text-lg font-bold truncate flex-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{job.title}</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSaveToggle}
            className={`rounded-xl ${isDark ? 'text-white hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <span className="text-xl">{isSaved ? "❤️" : "🤍"}</span>
          </Button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Main Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className={`border rounded-2xl mb-4 ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-white'}`}>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {job.is_urgent && (
                  <Badge className="bg-orange-500/20 text-orange-400 border-0 rounded-lg px-2 py-1 text-xs">
                    ⚡ Dringend
                  </Badge>
                )}
                <Badge className="bg-emerald-500/20 text-emerald-400 border-0 rounded-lg px-2 py-1 text-xs">
                  {job.category}
                </Badge>
                {isFullyBooked && (
                  <Badge className="bg-gray-500/20 text-gray-400 border-0 rounded-lg px-2 py-1 text-xs">
                    Besetzt
                  </Badge>
                )}
              </div>

              <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{job.title}</h2>
              <p className="text-green-500 font-medium mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                {job.company_name}
              </p>

              {/* Payment Highlight */}
              <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-2xl p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-green-500 text-sm mb-1">Verdienst</div>
                    <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {job.payment_type === "fixed" 
                        ? `${job.fixed_amount?.toFixed(2)}€`
                        : `${job.hourly_rate?.toFixed(2)}€/h`
                      }
                    </div>
                    {job.payment_type === "hourly" && (
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        ≈ {getTotalEarnings().toFixed(0)}€ gesamt
                      </div>
                    )}
                  </div>
                  <div className="text-5xl">💰</div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="space-y-3">
                <div className={`flex items-center gap-3 rounded-xl p-3 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <Calendar className="w-5 h-5 text-green-500" />
                  <div>
                    <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Datum</div>
                    <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {format(new Date(job.date), "EEEE, d. MMMM yyyy", { locale: de })}
                    </div>
                  </div>
                </div>

                <div className={`flex items-center gap-3 rounded-xl p-3 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <Clock className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Zeit</div>
                    <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {job.start_time} - {job.end_time} Uhr ({calculateDuration()}h)
                    </div>
                  </div>
                </div>

                <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(job.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className={`flex items-center gap-3 rounded-xl p-3 transition-colors ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'}`}>
                  <MapPin className="w-5 h-5 text-purple-400" />
                  <div className="flex-1">
                    <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Ort (Tippen für Route)</div>
                    <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{job.location}</div>
                  </div>
                  <span className="text-lg">🗺️</span>
                </div>
              </a>

                {job.total_positions > 1 && (
                  <div className={`flex items-center gap-3 rounded-xl p-3 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <Users className="w-5 h-5 text-amber-400" />
                    <div>
                      <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Plätze</div>
                      <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {availablePositions} von {job.total_positions} verfügbar
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {job.description && (
            <Card className={`border rounded-2xl mb-4 ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-white'}`}>
              <CardContent className="p-5">
                <h3 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>📝 Beschreibung</h3>
                <p className={`leading-relaxed whitespace-pre-wrap ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{job.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Requirements */}
          {job.requirements && (
            <Card className={`border rounded-2xl mb-4 ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-white'}`}>
              <CardContent className="p-5">
                <h3 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>✅ Anforderungen</h3>
                <p className={`leading-relaxed whitespace-pre-wrap ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{job.requirements}</p>
              </CardContent>
            </Card>
          )}

          {/* Contact */}
          <Card className={`border rounded-2xl mb-6 ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-white'}`}>
            <CardContent className="p-5">
              <h3 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>📞 Kontakt</h3>
              <div className="space-y-2">
                {job.contact_email && (
                  <div className={`flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <Mail className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    {job.contact_email}
                  </div>
                )}
                {job.contact_phone && (
                  <div className={`flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <Phone className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    {job.contact_phone}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Application Form */}
          {!hasApplied && !isFullyBooked && !showApplicationForm && (
            <Button
              onClick={() => setShowApplicationForm(true)}
              className="w-full h-14 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-2xl font-bold text-lg"
            >
              ✨ Jetzt bewerben
            </Button>
          )}

          {hasApplied && (
            <div className="space-y-3">
              <Card className="border bg-green-500/20 border-green-500/30 rounded-2xl">
                <CardContent className="p-5 text-center">
                  <span className="text-3xl mb-2 block">✅</span>
                  <p className="text-green-500 font-bold">Du hast dich bereits beworben</p>
                </CardContent>
              </Card>
              
              <Button
                onClick={addToCalendar}
                className={`w-full h-12 rounded-xl font-medium flex items-center justify-center gap-2 ${isDark ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
              >
                <CalendarPlus className="w-5 h-5" />
                Zum Kalender hinzufügen
              </Button>
            </div>
          )}

          {showApplicationForm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={`border rounded-2xl ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-white'}`}>
                <CardContent className="p-5">
                  <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>📝 Bewerbung</h3>
                  <form onSubmit={handleApply} className="space-y-4">
                    <div className="space-y-2">
                      <Label className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Name *</Label>
                      <Input
                        required
                        value={applicationData.applicant_name}
                        onChange={(e) => setApplicationData({...applicationData, applicant_name: e.target.value})}
                        className={`h-12 rounded-xl border ${isDark ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-200 bg-gray-50 text-gray-900'}`}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>E-Mail *</Label>
                      <Input
                        type="email"
                        required
                        value={applicationData.applicant_email}
                        onChange={(e) => setApplicationData({...applicationData, applicant_email: e.target.value})}
                        className={`h-12 rounded-xl border ${isDark ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-200 bg-gray-50 text-gray-900'}`}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Telefon</Label>
                      <Input
                        type="tel"
                        value={applicationData.applicant_phone}
                        onChange={(e) => setApplicationData({...applicationData, applicant_phone: e.target.value})}
                        className={`h-12 rounded-xl border ${isDark ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-200 bg-gray-50 text-gray-900'}`}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Relevante Erfahrung</Label>
                      <Textarea
                        value={applicationData.experience}
                        onChange={(e) => setApplicationData({...applicationData, experience: e.target.value})}
                        placeholder="Beschreibe deine Erfahrung..."
                        className={`rounded-xl border min-h-[80px] ${isDark ? 'border-gray-700 bg-gray-800 text-white placeholder:text-gray-500' : 'border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400'}`}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Nachricht (optional)</Label>
                      <Textarea
                        value={applicationData.message}
                        onChange={(e) => setApplicationData({...applicationData, message: e.target.value})}
                        placeholder="Warum bist du interessiert?"
                        className={`rounded-xl border min-h-[80px] ${isDark ? 'border-gray-700 bg-gray-800 text-white placeholder:text-gray-500' : 'border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400'}`}
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowApplicationForm(false)}
                        className={`flex-1 h-12 rounded-xl ${isDark ? 'border-gray-700 bg-transparent text-white hover:bg-gray-800' : 'border-gray-200 bg-transparent text-gray-700 hover:bg-gray-50'}`}
                      >
                        Abbrechen
                      </Button>
                      <Button
                        type="submit"
                        disabled={isApplying}
                        className="flex-1 h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl font-bold text-white"
                      >
                        {isApplying ? "Wird gesendet..." : "Absenden"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}