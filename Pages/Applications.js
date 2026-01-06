import React, { useState, useEffect } from "react";
import { Application } from "../Entities/Application";
import { User } from "../Entities/User";
import { Card, CardContent } from "../Components/ui/card";
import { Badge } from "../Components/ui/badge";
import { Button } from "../Components/ui/button";
import { FileText, Check, X, Mail, Phone } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";

const statusColors = {
  ausstehend: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  angenommen: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  abgelehnt: "bg-red-500/20 text-red-400 border-red-500/30"
};

export default function ApplicationsPage() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadApplications = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      
      if (user.user_type !== "arbeitgeber") {
        navigate(createPageUrl("Home"));
        return;
      }

      const apps = await Application.filter({ employer_email: user.email }, "-created_date");
      setApplications(apps);
    } catch (error) {
      await User.loginWithRedirect(window.location.href);
    }
    setIsLoading(false);
  }, [navigate]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const handleStatusChange = async (applicationId, newStatus) => {
    await Application.update(applicationId, { status: newStatus });
    await loadApplications();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#202123]">
        <motion.div
          className="w-12 h-12 border-3 border-[#343538] border-t-emerald-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#202123] pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 py-6 md:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">📋 Bewerbungen</h1>
          <p className="text-gray-400 text-sm">Eingehende Bewerbungen verwalten</p>
        </motion.div>

        {applications.length === 0 ? (
          <Card className="border-0 bg-[#2a2b2e] rounded-2xl">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Keine Bewerbungen</h3>
              <p className="text-gray-400">Hier erscheinen Bewerbungen auf Ihre Jobs</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-[#2a2b2e] rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">{applications.length}</div>
                <div className="text-gray-500 text-xs">Gesamt</div>
              </div>
              <div className="bg-amber-500/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-amber-400">
                  {applications.filter(a => a.status === "ausstehend").length}
                </div>
                <div className="text-gray-500 text-xs">Offen</div>
              </div>
              <div className="bg-emerald-500/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-emerald-400">
                  {applications.filter(a => a.status === "angenommen").length}
                </div>
                <div className="text-gray-500 text-xs">Angenommen</div>
              </div>
            </div>

            {/* Applications List */}
            {applications.map((application, index) => (
              <motion.div
                key={application.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-0 bg-[#2a2b2e] rounded-2xl overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-white truncate">{application.job_title}</h3>
                          <Badge className={`${statusColors[application.status]} border rounded-lg text-xs`}>
                            {application.status}
                          </Badge>
                        </div>
                        <p className="text-emerald-400 text-sm">
                          📅 {format(new Date(application.job_date), "d. MMM yyyy", { locale: de })}
                        </p>
                      </div>
                    </div>

                    {/* Applicant Info */}
                    <div className="bg-[#343538] rounded-xl p-4 mb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {application.applicant_name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-white">{application.applicant_name}</div>
                          <div className="text-gray-400 text-sm flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {application.applicant_email}
                          </div>
                        </div>
                      </div>

                      {application.applicant_phone && (
                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                          <Phone className="w-4 h-4" />
                          {application.applicant_phone}
                        </div>
                      )}

                      {application.experience && (
                        <div className="mt-3 pt-3 border-t border-[#4a4b4e]">
                          <div className="text-gray-500 text-xs mb-1">Erfahrung</div>
                          <p className="text-gray-300 text-sm">{application.experience}</p>
                        </div>
                      )}

                      {application.message && (
                        <div className="mt-3 pt-3 border-t border-[#4a4b4e]">
                          <div className="text-gray-500 text-xs mb-1">Nachricht</div>
                          <p className="text-gray-300 text-sm">{application.message}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {application.status === "ausstehend" && (
                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleStatusChange(application.id, "angenommen")}
                          className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-xl h-12"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Annehmen
                        </Button>
                        <Button
                          onClick={() => handleStatusChange(application.id, "abgelehnt")}
                          className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl h-12"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Ablehnen
                        </Button>
                      </div>
                    )}
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