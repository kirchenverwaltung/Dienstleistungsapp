import React, { useState, useEffect } from "react";
import { Job } from "../Entities/Job";
import { User } from "../Entities/User";
import { Card, CardContent } from "../Components/ui/card";
import { Input } from "../Components/ui/input";
import { Textarea } from "../Components/ui/textarea";
import { Label } from "../Components/ui/label";
import { Button } from "../Components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Components/ui/select";
import { Switch } from "../Components/ui/switch";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { motion } from "framer-motion";

const categories = ["Gastronomie", "Event", "Büro", "Handwerk", "IT", "Verkauf", "Promotion", "Umzugshilfe", "Nachhilfe", "Sonstiges"];

export default function CreateJobPage() {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [jobData, setJobData] = useState({
    title: "",
    description: "",
    category: "",
    company_name: "",
    location: "",
    city: "",
    date: "",
    start_time: "",
    end_time: "",
    payment_type: "fixed",
    hourly_rate: "",
    fixed_amount: "",
    total_positions: 1,
    requirements: "",
    contact_email: "",
    contact_phone: "",
    is_urgent: false
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await User.me();
      if (user.user_type !== "arbeitgeber") {
        navigate(createPageUrl("Home"));
        return;
      }
      setJobData(prev => ({
        ...prev,
        company_name: user.company || "",
        contact_email: user.email,
        contact_phone: user.phone || ""
      }));
    } catch (error) {
      await User.loginWithRedirect(window.location.href);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const jobPayload = {
        ...jobData,
        total_positions: parseInt(jobData.total_positions),
        filled_positions: 0,
        status: "offen"
      };

      if (jobData.payment_type === "hourly") {
        jobPayload.hourly_rate = parseFloat(jobData.hourly_rate);
        delete jobPayload.fixed_amount;
      } else {
        jobPayload.fixed_amount = parseFloat(jobData.fixed_amount);
        delete jobPayload.hourly_rate;
      }

      await Job.create(jobPayload);
      navigate(createPageUrl("MyJobs"));
    } catch (error) {
      console.error("Fehler beim Erstellen:", error);
    }
    setIsCreating(false);
  };

  return (
    <div className="min-h-screen bg-[#202123] pb-24 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 py-6 md:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">➕ Job erstellen</h1>
          <p className="text-gray-400 text-sm">Erstelle eine neue Stellenanzeige</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 bg-[#2a2b2e] rounded-2xl">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Title */}
                <div className="space-y-2">
                  <Label className="text-gray-400 text-sm">Jobtitel *</Label>
                  <Input
                    required
                    value={jobData.title}
                    onChange={(e) => setJobData({...jobData, title: e.target.value})}
                    placeholder="z.B. Servicekraft für Event"
                    className="h-12 rounded-xl border-0 bg-[#343538] text-white placeholder:text-gray-500"
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label className="text-gray-400 text-sm">Kategorie *</Label>
                  <Select
                    value={jobData.category}
                    onValueChange={(value) => setJobData({...jobData, category: value})}
                  >
                    <SelectTrigger className="h-12 rounded-xl border-0 bg-[#343538] text-white">
                      <SelectValue placeholder="Wählen..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#343538] border-[#4a4b4e]">
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat} className="text-white">{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label className="text-gray-400 text-sm">Beschreibung</Label>
                  <Textarea
                    value={jobData.description}
                    onChange={(e) => setJobData({...jobData, description: e.target.value})}
                    placeholder="Was sind die Aufgaben?"
                    className="rounded-xl border-0 bg-[#343538] text-white placeholder:text-gray-500 min-h-[100px]"
                  />
                </div>

                {/* Company & Location */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-gray-400 text-sm">Firma</Label>
                    <Input
                      value={jobData.company_name}
                      onChange={(e) => setJobData({...jobData, company_name: e.target.value})}
                      className="h-12 rounded-xl border-0 bg-[#343538] text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-400 text-sm">Stadt</Label>
                    <Input
                      value={jobData.city}
                      onChange={(e) => setJobData({...jobData, city: e.target.value})}
                      placeholder="z.B. Berlin"
                      className="h-12 rounded-xl border-0 bg-[#343538] text-white placeholder:text-gray-500"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label className="text-gray-400 text-sm">Adresse *</Label>
                  <Input
                    required
                    value={jobData.location}
                    onChange={(e) => setJobData({...jobData, location: e.target.value})}
                    placeholder="Straße, PLZ Ort"
                    className="h-12 rounded-xl border-0 bg-[#343538] text-white placeholder:text-gray-500"
                  />
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label className="text-gray-400 text-sm">Datum *</Label>
                    <Input
                      type="date"
                      required
                      value={jobData.date}
                      onChange={(e) => setJobData({...jobData, date: e.target.value})}
                      className="h-12 rounded-xl border-0 bg-[#343538] text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-400 text-sm">Von *</Label>
                    <Input
                      type="time"
                      required
                      value={jobData.start_time}
                      onChange={(e) => setJobData({...jobData, start_time: e.target.value})}
                      className="h-12 rounded-xl border-0 bg-[#343538] text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-400 text-sm">Bis *</Label>
                    <Input
                      type="time"
                      required
                      value={jobData.end_time}
                      onChange={(e) => setJobData({...jobData, end_time: e.target.value})}
                      className="h-12 rounded-xl border-0 bg-[#343538] text-white"
                    />
                  </div>
                </div>

                {/* Payment Type */}
                <div className="space-y-2">
                  <Label className="text-gray-400 text-sm">Bezahlung *</Label>
                  <Select
                    value={jobData.payment_type}
                    onValueChange={(value) => setJobData({...jobData, payment_type: value})}
                  >
                    <SelectTrigger className="h-12 rounded-xl border-0 bg-[#343538] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#343538] border-[#4a4b4e]">
                      <SelectItem value="fixed" className="text-white">Festbetrag (empfohlen)</SelectItem>
                      <SelectItem value="hourly" className="text-white">Stundenlohn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <Label className="text-gray-400 text-sm">
                    {jobData.payment_type === "fixed" ? "Festbetrag (€) *" : "Stundenlohn (€) *"}
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={jobData.payment_type === "fixed" ? jobData.fixed_amount : jobData.hourly_rate}
                    onChange={(e) => setJobData({
                      ...jobData, 
                      [jobData.payment_type === "fixed" ? "fixed_amount" : "hourly_rate"]: e.target.value
                    })}
                    placeholder={jobData.payment_type === "fixed" ? "z.B. 150" : "z.B. 15"}
                    className="h-12 rounded-xl border-0 bg-[#343538] text-white placeholder:text-gray-500"
                  />
                </div>

                {/* Positions */}
                <div className="space-y-2">
                  <Label className="text-gray-400 text-sm">Anzahl Personen</Label>
                  <Input
                    type="number"
                    min="1"
                    value={jobData.total_positions}
                    onChange={(e) => setJobData({...jobData, total_positions: e.target.value})}
                    className="h-12 rounded-xl border-0 bg-[#343538] text-white"
                  />
                </div>

                {/* Urgent Toggle */}
                <div className="flex items-center justify-between bg-[#343538] rounded-xl p-4">
                  <div>
                    <Label className="text-white font-medium">⚡ Dringend</Label>
                    <p className="text-gray-500 text-xs">Wird hervorgehoben</p>
                  </div>
                  <Switch
                    checked={jobData.is_urgent}
                    onCheckedChange={(checked) => setJobData({...jobData, is_urgent: checked})}
                  />
                </div>

                {/* Contact */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-gray-400 text-sm">E-Mail</Label>
                    <Input
                      type="email"
                      value={jobData.contact_email}
                      onChange={(e) => setJobData({...jobData, contact_email: e.target.value})}
                      className="h-12 rounded-xl border-0 bg-[#343538] text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-400 text-sm">Telefon</Label>
                    <Input
                      type="tel"
                      value={jobData.contact_phone}
                      onChange={(e) => setJobData({...jobData, contact_phone: e.target.value})}
                      className="h-12 rounded-xl border-0 bg-[#343538] text-white"
                    />
                  </div>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={isCreating || !jobData.category || !jobData.title}
                  className="w-full h-14 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-xl font-bold text-lg mt-4"
                >
                  {isCreating ? "Wird erstellt..." : "✨ Job veröffentlichen"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}