import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Search, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-500 to-cyan-500 rounded-3xl p-8 md:p-12 shadow-2xl"
    >
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTZ2LTZoNnptMC02aC02di02aDZ6bS02IDBoLTZ2LTZoNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20" />
      
      <div className="relative z-10 max-w-3xl">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span className="text-white text-sm font-medium">Über 500 geprüfte Dienstleister</span>
        </motion.div>

        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
          Finden Sie den perfekten Service
        </h1>
        <p className="text-xl text-teal-50 mb-8 leading-relaxed">
          Von Reinigung bis Reparatur – buchen Sie lokale Dienstleister 
          in wenigen Klicks. Vertrauenswürdig, schnell und zuverlässig.
        </p>

        <Link to={createPageUrl("Search")}>
          <Button size="lg" className="bg-white text-teal-600 hover:bg-teal-50 shadow-xl hover:shadow-2xl transition-all duration-300 text-lg px-8 py-6 rounded-2xl">
            <Search className="w-5 h-5 mr-2" />
            Jetzt Services entdecken
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}