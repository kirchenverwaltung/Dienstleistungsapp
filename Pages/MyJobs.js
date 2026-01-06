import React, { useState, useEffect } from "react";
import { Job } from "../Entities/Job";
import { User } from "../Entities/User";
import { Card, CardContent } from "../Components/ui/card";
import { Badge } from "../Components/ui/badge";
import { Briefcase } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import JobCard from "../Components/jobs/JobCard";
import { motion } from "framer-motion";
import { Button } from "../Components/ui/button";

export default function MyJobsPage() {
  const navigate = useNavigate();
  const [myJobs, setMyJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadJobs = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      
      if (user.user_type !== "arbeitgeber") {
        navigate(createPageUrl("Home"));
        return;
      }

      const jobs = await Job.filter({ created_by: user.email }, "-created_date");
      setMyJobs(jobs);
    } catch (error) {
      await User.loginWithRedirect(window.location.href);
    }
    setIsLoading(false);
  }, [navigate]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

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
      <div className="max-w-6xl mx-auto px-4 py-6 md:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">💼 Meine Jobs</h1>
              <p className="text-gray-400 text-sm">Verwalte deine Stellenanzeigen</p>
            </div>
            <Link to={createPageUrl("CreateJob")}>
              <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-xl h-10 px-4 text-sm font-bold">
                ➕ Neuer Job
              </Button>
            </Link>
          </div>
        </motion.div>

        {myJobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-0 bg-[#2a2b2e] rounded-2xl">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-10 h-10 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Noch keine Jobs erstellt
                </h3>
                <p className="text-gray-400 mb-6">
                  Erstellen Sie Ihre erste Stellenanzeige
                </p>
                <Link to={createPageUrl("CreateJob")}>
                  <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-xl h-12 px-6 font-bold">
                    ➕ Job erstellen
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Stats */}
            <motion.div 
              className="grid grid-cols-3 gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="bg-[#2a2b2e] rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">{myJobs.length}</div>
                <div className="text-gray-500 text-xs">Gesamt</div>
              </div>
              <div className="bg-emerald-500/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-emerald-400">
                  {myJobs.filter(j => j.status === "offen").length}
                </div>
                <div className="text-gray-500 text-xs">Offen</div>
              </div>
              <div className="bg-purple-500/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {myJobs.filter(j => j.status === "besetzt").length}
                </div>
                <div className="text-gray-500 text-xs">Besetzt</div>
              </div>
            </motion.div>

            {/* Job List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <JobCard 
                    job={job}
                    showManage={true}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}