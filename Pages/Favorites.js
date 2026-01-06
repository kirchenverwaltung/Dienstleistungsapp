import React, { useState, useEffect } from "react";
import { Service } from "../Entities/Service";
import { User } from "../Entities/User";
import { Heart } from "lucide-react";
import ServiceCard from "../Components/shared/ServiceCard";
import { Card, CardContent } from "../Components/ui/card";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      const favoriteServiceIds = user.favorite_services || [];
      setFavoriteIds(favoriteServiceIds);

      if (favoriteServiceIds.length > 0) {
        const allServices = await Service.list();
        const favoriteServices = allServices.filter(s => favoriteServiceIds.includes(s.id));
        setFavorites(favoriteServices);
      } else {
        setFavorites([]);
      }
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
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Meine Favoriten</h1>
          <p className="text-gray-600">Ihre gespeicherten Lieblings-Services</p>
        </div>

        {favorites.length === 0 ? (
          <Card className="border-none shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Noch keine Favoriten
              </h3>
              <p className="text-gray-600">
                Speichern Sie Services, die Ihnen gefallen, als Favoriten
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {favorites.map((service) => (
              <ServiceCard 
                key={service.id} 
                service={service}
                isFavorite={true}
                onFavoriteToggle={loadFavorites}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}