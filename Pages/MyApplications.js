import React, { useState, useEffect } from "react";
import { Application } from "@/entities/Application";
import { User } from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const statusColors = {
  ausstehend: "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-0",
  angenommen: "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-0",
  abgelehnt: "bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-0",
  zurückgezogen: "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-0"
};

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      const apps = await Application.filter({ created_by: user.email }, "-created_date");
      setApplications(apps);
    } catch (error) {
      await User.loginWithRedirect(window.location.href);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-green-50">
        <motion.div
          className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-12 bg-gradient-to-br from-emerald-50 via-white to-green-50">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center gap-4"
        >
          <motion.div 
            className="text-7xl"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            📝
          </motion.div>
          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-2">Meine Bewerbungen</h1>
            <p className="text-xl text-gray-600">Übersicht über alle deine Bewerbungen</p>
          </div>
        </motion.div>

        {applications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-0 shadow-2xl rounded-3xl bg-white">
              <CardContent className="p-16 text-center">
                <motion.div 
                  className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                >
                  <FileText className="w-12 h-12 text-purple-600" />
                </motion.div>
                <h3 className="text-3xl font-bold text-gray-900 mb-3">
                  Noch keine Bewerbungen
                </h3>
                <p className="text-xl text-gray-600 mb-8">
                  Durchsuche verfügbare Jobs und bewirb dich auf interessante Positionen
                </p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <a 
                    href={createPageUrl("Home")}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    <span className="text-2xl">🔍</span>
                    Jobs durchsuchen
                  </a>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <motion.div 
              className="flex gap-4 mb-8 flex-wrap"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Badge className="px-6 py-3 text-base font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full shadow-lg">
                📊 Gesamt: {applications.length}
              </Badge>
              <Badge className="px-6 py-3 text-base font-bold bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 rounded-full shadow-md">
                ⏳ Ausstehend: {applications.filter(a => a.status === "ausstehend").length}
              </Badge>
              <Badge className="px-6 py-3 text-base font-bold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-full shadow-md">
                ✅ Angenommen: {applications.filter(a => a.status === "angenommen").length}
              </Badge>
            </motion.div>

            {applications.map((application, index) => (
              <motion.div
                key={application.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4, scale: 1.01 }}
              >
                <Link to={`${createPageUrl("JobDetails")}?id=${application.job_id}`}>
                  <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer rounded-3xl bg-white overflow-hidden group">
                    <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600" />
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-2xl mb-2 group-hover:text-emerald-600 transition-colors">{application.job_title}</CardTitle>
                          <div className="text-sm text-gray-500 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Beworben am {format(new Date(application.created_date), "d. MMMM yyyy", { locale: de })}
                          </div>
                        </div>
                        <motion.div whileHover={{ scale: 1.1 }}>
                          <Badge className={`${statusColors[application.status]} px-4 py-2 rounded-full text-sm font-bold shadow-md`}>
                            {application.status === "ausstehend" && "⏳ "}
                            {application.status === "angenommen" && "✅ "}
                            {application.status === "abgelehnt" && "❌ "}
                            {application.status}
                          </Badge>
                        </motion.div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3 text-gray-700 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-2xl">
                        <span className="text-2xl">📅</span>
                        <div>
                          <div className="text-sm text-gray-500">Job-Datum</div>
                          <div className="font-semibold">
                            {format(new Date(application.job_date), "d. MMMM yyyy", { locale: de })}
                          </div>
                        </div>
                      </div>

                      {application.experience && (
                        <div className="pt-4 border-t-2 border-emerald-50">
                          <div className="text-sm text-gray-500 mb-2 font-semibold">📝 Deine Erfahrung</div>
                          <p className="text-gray-700 leading-relaxed">{application.experience}</p>
                        </div>
                      )}

                      {application.message && (
                        <div className="pt-4 border-t-2 border-emerald-50">
                          <div className="text-sm text-gray-500 mb-2 font-semibold">💬 Deine Nachricht</div>
                          <p className="text-gray-700 leading-relaxed">{application.message}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}