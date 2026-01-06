import React, { useRef } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../theme/ThemeProvider";

const categories = [
  { name: "Alle", emoji: "🌟", color: "#91D18B" },
  { name: "Gastronomie", emoji: "🍽️", color: "#F59E0B" },
  { name: "Event", emoji: "🎉", color: "#EC4899" },
  { name: "Büro", emoji: "💼", color: "#3B82F6" },
  { name: "Handwerk", emoji: "🔨", color: "#EF4444" },
  { name: "IT", emoji: "💻", color: "#8B5CF6" },
  { name: "Verkauf", emoji: "🛍️", color: "#10B981" },
  { name: "Promotion", emoji: "📢", color: "#F97316" },
  { name: "Umzugshilfe", emoji: "📦", color: "#6366F1" },
  { name: "Nachhilfe", emoji: "📚", color: "#14B8A6" },
  { name: "Sonstiges", emoji: "✨", color: "#A855F7" },
];

export default function CategoryCarousel({ selectedCategory, onSelectCategory }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const scrollRef = useRef(null);

  return (
    <div className="relative">
      <div 
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((category, index) => {
          const isSelected = selectedCategory === category.name;
          return (
            <motion.button
              key={category.name}
              onClick={() => onSelectCategory(category.name)}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex-shrink-0 snap-start px-5 py-3 rounded-full flex items-center gap-2 transition-all duration-200 border-2 ${
                isSelected
                  ? 'border-[#91D18B] shadow-lg shadow-[#91D18B]/20'
                  : isDark 
                    ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                    : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
              style={{
                background: isSelected 
                  ? `linear-gradient(135deg, ${category.color}15, ${category.color}05)`
                  : undefined
              }}
            >
              <span className="text-xl">{category.emoji}</span>
              <span className={`text-sm font-medium whitespace-nowrap ${
                isSelected 
                  ? isDark ? 'text-white' : 'text-gray-900'
                  : isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {category.name}
              </span>
            </motion.button>
          );
        })}
      </div>
      
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}