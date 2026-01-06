import React from "react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Star, Clock, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { motion } from "framer-motion";
import { User } from "../../Entities/User";

export default function ServiceCard({ service, onFavoriteToggle, isFavorite }) {
  const [isTogglingFavorite, setIsTogglingFavorite] = React.useState(false);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isTogglingFavorite) return;
    
    setIsTogglingFavorite(true);
    try {
      const user = await User.me();
      const favorites = user.favorite_services || [];
      
      const newFavorites = isFavorite
        ? favorites.filter(id => id !== service.id)
        : [...favorites, service.id];
      
      await User.updateMyUserData({ favorite_services: newFavorites });
      if (onFavoriteToggle) onFavoriteToggle();
    } catch (error) {
      console.error("Fehler beim Favoriten-Update:", error);
    }
    setIsTogglingFavorite(false);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`${createPageUrl("ServiceDetails")}?id=${service.id}`}>
        <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-none bg-white group h-full">
          <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
            {service.image_url ? (
              <img 
                src={service.image_url} 
                alt={service.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-4xl text-gray-300">{service.name[0]}</span>
              </div>
            )}
            <div className="absolute top-3 right-3">
              <Button
                size="icon"
                variant="secondary"
                className={`rounded-full backdrop-blur-sm transition-all duration-200 ${
                  isFavorite ? 'bg-red-500 hover:bg-red-600' : 'bg-white/90 hover:bg-white'
                }`}
                onClick={handleFavoriteClick}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'text-white fill-white' : 'text-gray-600'}`} />
              </Button>
            </div>
            {service.is_featured && (
              <div className="absolute top-3 left-3">
                <Badge className="bg-amber-500 text-white border-none shadow-lg">
                  Empfohlen
                </Badge>
              </div>
            )}
          </div>

          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-bold text-lg text-gray-900 group-hover:text-teal-600 transition-colors leading-tight">
                {service.name}
              </h3>
            </div>

            <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
              {service.description}
            </p>

            <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="font-medium text-gray-900">
                  {service.rating ? service.rating.toFixed(1) : "Neu"}
                </span>
              </div>
              {service.duration && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{service.duration} Min.</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <div className="text-2xl font-bold text-teal-600">
                  €{service.price?.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500">{service.provider}</div>
              </div>
              <Button className="bg-teal-600 hover:bg-teal-700 rounded-xl shadow-lg shadow-teal-500/30">
                Buchen
              </Button>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}