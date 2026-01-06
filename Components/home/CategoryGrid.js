import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { 
  Sparkles, Wrench, Flower2, Truck, 
  Monitor, MessageSquare, Home as HomeIcon, Award 
} from "lucide-react";

const categories = [
  { name: "Reinigung", icon: Sparkles, color: "from-blue-500 to-cyan-500", count: 45 },
  { name: "Reparatur", icon: Wrench, color: "from-orange-500 to-amber-500", count: 38 },
  { name: "Wellness", icon: Award, color: "from-pink-500 to-rose-500", count: 29 },
  { name: "Handwerk", icon: HomeIcon, color: "from-purple-500 to-indigo-500", count: 52 },
  { name: "Garten", icon: Flower2, color: "from-green-500 to-emerald-500", count: 34 },
  { name: "Transport", icon: Truck, color: "from-red-500 to-orange-500", count: 23 },
  { name: "IT-Service", icon: Monitor, color: "from-indigo-500 to-blue-500", count: 41 },
  { name: "Beratung", icon: MessageSquare, color: "from-teal-500 to-cyan-500", count: 27 },
];

export default function CategoryGrid() {
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Beliebte Kategorien</h2>
      <p className="text-gray-600 mb-8">Entdecken Sie Services in verschiedenen Bereichen</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category, index) => (
          <motion.div
            key={category.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link to={`${createPageUrl("Search")}?category=${category.name}`}>
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-none group cursor-pointer">
                <CardContent className="p-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <category.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1 group-hover:text-teal-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500">{category.count} Services</p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}