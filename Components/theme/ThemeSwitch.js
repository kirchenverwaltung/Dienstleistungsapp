import React from "react";
import { useTheme } from "./ThemeProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Sun, Moon } from "lucide-react";

export default function ThemeSwitch() {
  const { theme, setTheme, autoNightMode, setAutoNightMode } = useTheme();

  return (
    <Card className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-2xl shadow-sm">
      <CardContent className="p-5 space-y-4">
        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
          🎨 Erscheinungsbild
        </h3>
        
        {/* Theme Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {theme === "light" ? (
              <Sun className="w-5 h-5 text-amber-500" />
            ) : (
              <Moon className="w-5 h-5 text-blue-400" />
            )}
            <div>
              <Label className="text-gray-700 dark:text-gray-200 font-medium">
                {theme === "light" ? "Heller Modus" : "Dunkler Modus"}
              </Label>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {theme === "light" ? "Aktiviert" : "Aktiviert"}
              </p>
            </div>
          </div>
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            <button
              onClick={() => setTheme("light")}
              className={`p-2 rounded-lg transition-all ${
                theme === "light" 
                  ? "bg-white dark:bg-gray-700 shadow-sm" 
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Sun className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`p-2 rounded-lg transition-all ${
                theme === "dark" 
                  ? "bg-white dark:bg-gray-700 shadow-sm" 
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Moon className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Auto Night Mode */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
          <div>
            <Label className="text-gray-700 dark:text-gray-200 font-medium">
              Automatischer Nachtmodus
            </Label>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Wechselt nach 20 Uhr zu Dunkel
            </p>
          </div>
          <Switch
            checked={autoNightMode}
            onCheckedChange={setAutoNightMode}
            className="data-[state=checked]:bg-green-500"
          />
        </div>
      </CardContent>
    </Card>
  );
}