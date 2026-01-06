import React, { useState, useEffect } from "react";
import { Booking } from "@/entities/Booking";
import { User } from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Phone, Mail } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { motion } from "framer-motion";

const statusColors = {
  ausstehend: "bg-yellow-100 text-yellow-800 border-yellow-200",
  bestätigt: "bg-blue-100 text-blue-800 border-blue-200",
  in_bearbeitung: "bg-purple-100 text-purple-800 border-purple-200",
  abgeschlossen: "bg-green-100 text-green-800 border-green-200",
  storniert: "bg-red-100 text-red-800 border-red-200"
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      const allBookings = await Booking.filter({ created_by: user.email }, "-created_date");
      setBookings(allBookings);
    } catch (error) {
      await User.loginWithRedirect(window.location.href);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-slate-50 via-teal-50/30 to-slate-50">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Meine Buchungen</h1>
          <p className="text-gray-600">Verwalten Sie Ihre Service-Buchungen</p>
        </div>

        {bookings.length === 0 ? (
          <Card className="border-none shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-10 h-10 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Noch keine Buchungen
              </h3>
              <p className="text-gray-600">
                Entdecken Sie unsere Services und buchen Sie Ihren ersten Termin
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl mb-2">{booking.service_name}</CardTitle>
                        <div className="text-sm text-gray-500">
                          Gebucht am {format(new Date(booking.created_date), "d. MMMM yyyy", { locale: de })}
                        </div>
                      </div>
                      <Badge className={`${statusColors[booking.status]} border`}>
                        {booking.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 text-gray-700">
                        <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Datum</div>
                          <div className="font-semibold">
                            {format(new Date(booking.booking_date), "d. MMMM yyyy", { locale: de })}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-gray-700">
                        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                          <Clock className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Uhrzeit</div>
                          <div className="font-semibold">{booking.booking_time} Uhr</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-gray-700">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Adresse</div>
                          <div className="font-semibold">{booking.address}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-gray-700">
                        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                          <Phone className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Telefon</div>
                          <div className="font-semibold">{booking.customer_phone || "Nicht angegeben"}</div>
                        </div>
                      </div>
                    </div>

                    {booking.notes && (
                      <div className="pt-4 border-t">
                        <div className="text-sm text-gray-500 mb-1">Anmerkungen</div>
                        <p className="text-gray-700">{booking.notes}</p>
                      </div>
                    )}

                    <div className="pt-4 border-t flex items-center justify-between">
                      <div className="text-sm text-gray-500">Gesamtpreis</div>
                      <div className="text-2xl font-bold text-teal-600">
                        €{booking.total_price?.toFixed(2)}
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