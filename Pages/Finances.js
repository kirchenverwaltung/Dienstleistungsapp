import React, { useState, useEffect } from "react";
import { Transaction } from "@/entities/Transaction";
import { User } from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { motion } from "framer-motion";
import { useTheme } from "@/components/theme/ThemeProvider";

export default function FinancesPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [userType, setUserType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("alle");
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setUserType(user.user_type);

      let allTransactions;
      if (user.user_type === "arbeitgeber") {
        allTransactions = await Transaction.filter({ employer_email: user.email }, "-created_date");
      } else {
        allTransactions = await Transaction.filter({ worker_email: user.email }, "-created_date");
      }
      setTransactions(allTransactions);
      setFilteredTransactions(allTransactions);

      const total = allTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
      const pending = allTransactions.filter(t => t.status === "ausstehend").reduce((sum, t) => sum + (t.amount || 0), 0);
      const completed = allTransactions.filter(t => t.status === "abgeschlossen").length;
      setStats({ total, pending, completed });
    } catch (error) {
      await User.loginWithRedirect(window.location.href);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (filterStatus === "alle") {
      setFilteredTransactions(transactions);
    } else {
      setFilteredTransactions(transactions.filter(t => t.status === filterStatus));
    }
  }, [filterStatus, transactions]);

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
      <div className="max-w-4xl mx-auto px-4 py-6 md:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className={`text-2xl md:text-3xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {userType === "arbeitgeber" ? "💰 Ausgaben" : "💵 Einnahmen"}
          </h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Übersicht deiner Finanzen</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className={`border rounded-2xl ${isDark ? 'border-gray-800 bg-[#1a1a1a]' : 'border-green-100 bg-green-50'}`}>
              <CardContent className="p-4">
                <div className="text-green-600 text-xs font-medium mb-1">Gesamt</div>
                <div className={`text-xl md:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  €{stats.total.toFixed(0)}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className={`border rounded-2xl ${isDark ? 'border-gray-800 bg-[#1a1a1a]' : 'border-amber-100 bg-amber-50'}`}>
              <CardContent className="p-4">
                <div className="text-amber-600 text-xs font-medium mb-1">Offen</div>
                <div className={`text-xl md:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  €{stats.pending.toFixed(0)}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className={`border rounded-2xl ${isDark ? 'border-gray-800 bg-[#1a1a1a]' : 'border-purple-100 bg-purple-50'}`}>
              <CardContent className="p-4">
                <div className="text-purple-600 text-xs font-medium mb-1">Jobs</div>
                <div className={`text-xl md:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.completed}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Filter */}
        <div className="mb-4">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className={`h-12 rounded-xl border w-full md:w-48 ${isDark ? 'border-gray-700 bg-gray-900 text-white' : 'border-gray-200 bg-white text-gray-900'}`}>
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent className={isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}>
              <SelectItem value="alle" className={isDark ? 'text-white' : 'text-gray-900'}>Alle</SelectItem>
              <SelectItem value="ausstehend" className={isDark ? 'text-white' : 'text-gray-900'}>Ausstehend</SelectItem>
              <SelectItem value="abgeschlossen" className={isDark ? 'text-white' : 'text-gray-900'}>Abgeschlossen</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <Card className={`border rounded-2xl ${isDark ? 'border-gray-800 bg-[#1a1a1a]' : 'border-gray-100 bg-white'}`}>
            <CardContent className="p-8 text-center">
              <span className="text-5xl mb-4 block">💸</span>
              <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Keine Transaktionen</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Hier erscheinen deine Finanzen</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card className={`border hover:shadow-md rounded-2xl transition-shadow ${isDark ? 'border-gray-800 bg-[#1a1a1a]' : 'border-gray-100 bg-white'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          transaction.type === "einnahme" 
                            ? "bg-green-100" 
                            : "bg-red-100"
                        }`}>
                          {transaction.type === "einnahme" 
                            ? <TrendingUp className="w-5 h-5 text-green-600" />
                            : <TrendingDown className="w-5 h-5 text-red-500" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{transaction.job_title}</div>
                          <div className={`text-xs flex items-center gap-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            <Calendar className="w-3 h-3" />
                            {format(new Date(transaction.date || transaction.created_date), "d. MMM yyyy", { locale: de })}
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-3">
                        <div className={`font-bold text-lg ${
                          transaction.type === "einnahme" ? "text-green-600" : "text-red-500"
                        }`}>
                          {transaction.type === "einnahme" ? "+" : "-"}€{transaction.amount?.toFixed(2)}
                        </div>
                        <Badge className={`text-xs ${
                          transaction.status === "abgeschlossen"
                            ? "bg-green-100 text-green-600"
                            : "bg-amber-100 text-amber-600"
                        } border-0 rounded-full`}>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
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