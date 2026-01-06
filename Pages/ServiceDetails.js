import React, { useState, useEffect } from "react";
import { Service } from "../Entities/Service";
import { Booking } from "../Entities/Booking";
import { User } from "../Entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card";
import { Button } from "../Components/ui/button";
import { Input } from "../Components/ui/input";
import { Textarea } from "../Components/ui/textarea";
import { Label } from "../Components/ui/label";
import { Badge } from "../Components/ui/badge";
import { ArrowLeft, Star, Clock, MapPin, Heart, Calendar, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { motion } from "framer-motion";

export default function ServiceDetailsPage() {
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingData, setBookingData] = useState({
    booking_date: "",
    booking_time: "",
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    address: "",
    notes: ""
  });

  useEffect(() => {
    loadService();
  }, []);

  const loadService = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const serviceId = urlParams.get('id');
    
    if (serviceId) {
      const fetchedService = await Service.filter({ id: serviceId });
      if (fetchedService.length > 0) {
        setService(fetchedService[0]);
      }

      try {
        const user = await User.me();
        setIsFavorite((user.favorite_services || []).includes(serviceId));
        setBookingData(prev => ({
          ...prev,
          customer_name: user.full_name || "",
          customer_email: user.email || "",
          customer_phone: user.phone || "",
          address: user.address || ""
        }));
      } catch (error) {
        // Benutzer nicht angemeldet
      }
    }
  };

  const toggleFavorite = async () => {
    try {
      const user = await User.me();
      const favorites = user.favorite_services || [];
      
      const newFavorites = isFavorite
        ? favorites.filter(id => id !== service.id)
        : [...favorites, service.id];
      
      await User.updateMyUserData({ favorite_services: newFavorites });
      setIsFavorite(!isFavorite);
    } catch (error) {
      await User.loginWithRedirect(window.location.href);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setIsBooking(true);

    try {
      await User.me();
      
      await Booking.create({
        service_id: service.id,
        service_name: service.name,
        ...bookingData,
        total_price: service.price,
        status: "ausstehend"
      });

      navigate(createPageUrl("Bookings"));
    } catch (error) {
      await User.loginWithRedirect(window.location.href);
    }
    setIsBooking(false);
  };

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 hover:bg-teal-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zurück
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="overflow-hidden border-none shadow-xl">
                <div className="relative h-96 bg-gradient-to-br from-gray-100 to-gray-200">
                  {service.image_url ? (
                    <img 
                      src={service.image_url} 
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-8xl text-gray-300">{service.name[0]}</span>
                    </div>
                  )}
                  {service.is_featured && (
                    <Badge className="absolute top-4 left-4 bg-amber-500 text-white border-none shadow-lg">
                      Empfohlen
                    </Badge>
                  )}
                  <Button
                    size="icon"
                    variant="secondary"
                    className={`absolute top-4 right-4 rounded-full backdrop-blur-sm ${
                      isFavorite ? 'bg-red-500 hover:bg-red-600' : 'bg-white/90 hover:bg-white'
                    }`}
                    onClick={toggleFavorite}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'text-white fill-white' : 'text-gray-600'}`} />
                  </Button>
                </div>

                <CardContent className="p-8">
                  <div className="mb-6">
                    <Badge className="mb-4 bg-teal-100 text-teal-700 border-teal-200">
                      {service.category}
                    </Badge>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{service.name}</h1>
                    <div className="flex items-center gap-6 text-gray-600">
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                        <span className="font-semibold text-gray-900">
                          {service.rating ? service.rating.toFixed(1) : "Neu"}
                        </span>
                      </div>
                      {service.duration && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5" />
                          <span>{service.duration} Minuten</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="prose prose-gray max-w-none mb-8">
                    <p className="text-lg text-gray-700 leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-teal-50 rounded-xl border border-teal-100">
                    <MapPin className="w-5 h-5 text-teal-600" />
                    <div>
                      <div className="font-semibold text-gray-900">{service.provider}</div>
                      <div className="text-sm text-gray-600">Geprüfter Anbieter</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-8"
            >
              <Card className="border-none shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-teal-600">
                      €{service.price?.toFixed(2)}
                    </span>
                    <span className="text-gray-500">pro Service</span>
                  </div>
                </CardHeader>
                <CardContent>
                  {!showBookingForm ? (
                    <div className="space-y-4">
                      <Button 
                        className="w-full h-14 text-lg bg-teal-600 hover:bg-teal-700 rounded-xl shadow-lg shadow-teal-500/30"
                        onClick={() => setShowBookingForm(true)}
                      >
                        <Calendar className="w-5 h-5 mr-2" />
                        Jetzt buchen
                      </Button>

                      <div className="space-y-3 pt-4 border-t">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <CheckCircle className="w-5 h-5 text-teal-600" />
                          <span>Schnelle Bestätigung</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <CheckCircle className="w-5 h-5 text-teal-600" />
                          <span>Geprüfte Dienstleister</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <CheckCircle className="w-5 h-5 text-teal-600" />
                          <span>Sichere Bezahlung</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleBooking} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">Wunschdatum</Label>
                        <Input
                          id="date"
                          type="date"
                          required
                          value={bookingData.booking_date}
                          onChange={(e) => setBookingData({...bookingData, booking_date: e.target.value})}
                          className="rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="time">Uhrzeit</Label>
                        <Input
                          id="time"
                          type="time"
                          required
                          value={bookingData.booking_time}
                          onChange={(e) => setBookingData({...bookingData, booking_time: e.target.value})}
                          className="rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          required
                          value={bookingData.customer_name}
                          onChange={(e) => setBookingData({...bookingData, customer_name: e.target.value})}
                          className="rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">E-Mail</Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={bookingData.customer_email}
                          onChange={(e) => setBookingData({...bookingData, customer_email: e.target.value})}
                          className="rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefon</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={bookingData.customer_phone}
                          onChange={(e) => setBookingData({...bookingData, customer_phone: e.target.value})}
                          className="rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Adresse</Label>
                        <Input
                          id="address"
                          required
                          value={bookingData.address}
                          onChange={(e) => setBookingData({...bookingData, address: e.target.value})}
                          className="rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">Anmerkungen (optional)</Label>
                        <Textarea
                          id="notes"
                          value={bookingData.notes}
                          onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                          className="rounded-xl"
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowBookingForm(false)}
                          className="flex-1 rounded-xl"
                        >
                          Abbrechen
                        </Button>
                        <Button
                          type="submit"
                          disabled={isBooking}
                          className="flex-1 bg-teal-600 hover:bg-teal-700 rounded-xl"
                        >
                          {isBooking ? "Wird gebucht..." : "Buchung abschließen"}
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}