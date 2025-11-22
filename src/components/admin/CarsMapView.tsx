import { useState, useEffect, useRef } from 'react';
import { GoogleMap } from '@react-google-maps/api';
import { MapPin, Car as CarIcon, Edit } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  car_number?: string;
  location?: string;
  images?: string[];
  price_rent_daily?: number;
  price_sale?: number;
}

interface CarWithCoords extends Car {
  lat: number;
  lng: number;
}

const DOUALA_CENTER = { lat: 4.0511, lng: 9.7679 };

export default function CarsMapView({ onEditLocation }: { onEditLocation: (car: Car) => void }) {
  const [cars, setCars] = useState<CarWithCoords[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState<CarWithCoords | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  useEffect(() => {
    fetchCarsWithLocations();
  }, []);

  const fetchCarsWithLocations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cars')
        .select('id, make, model, year, car_number, location, images, price_rent_daily, price_sale')
        .not('location', 'is', null);

      if (error) throw error;

      // For now, we'll use geocoding to get coordinates
      // In production, you'd store lat/lng in the database
      const carsWithCoords: CarWithCoords[] = [];
      
      for (const car of data || []) {
        if (car.location) {
          // Try to geocode the location
          try {
            const geocoder = new google.maps.Geocoder();
            const result = await geocoder.geocode({ address: car.location });
            
            if (result.results[0]) {
              const location = result.results[0].geometry.location;
              carsWithCoords.push({
                ...car,
                lat: location.lat(),
                lng: location.lng(),
              });
            }
          } catch (err) {
            console.error('Geocoding error for', car.location, err);
          }
        }
      }

      console.log(`Geocoded ${carsWithCoords.length} cars with coordinates`);
      setCars(carsWithCoords);
    } catch (error) {
      console.error('Error fetching cars:', error);
    } finally {
      setLoading(false);
    }
  };

  const onLoad = (map: google.maps.Map) => {
    setMap(map);
  };

  // Create markers when cars or map changes
  useEffect(() => {
    if (!map || cars.length === 0) return;
    
    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    
    // Create info window
    if (!infoWindowRef.current) {
      infoWindowRef.current = new google.maps.InfoWindow();
    }
    
    // Create markers for each car
    const bounds = new google.maps.LatLngBounds();
    
    cars.forEach(car => {
      const carNumber = car.car_number || `#${car.id.slice(0, 4)}`;
      
      // Create custom car icon with number label
      const carIcon = {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="60" height="70" viewBox="0 0 60 70">
            <!-- Car number label above -->
            <rect x="10" y="0" width="40" height="18" rx="9" fill="#D4AF37" stroke="#ffffff" stroke-width="2"/>
            <text x="30" y="13" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#ffffff">
              ${carNumber}
            </text>
            
            <!-- Car icon -->
            <g transform="translate(10, 25)">
              <!-- Car body -->
              <path d="M38 18h-3.17l-3.41-3.41A2 2 0 0 0 30 14H10a2 2 0 0 0-1.42.59L5.17 18H2a4 4 0 0 0-4 4v12a4 4 0 0 0 4 4h36a4 4 0 0 0 4-4V22a4 4 0 0 0-4-4zM10 32a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm20 0a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm6-8H4v-2h32v2z" 
                    fill="#D4AF37" stroke="#ffffff" stroke-width="1.5"/>
              <!-- Wheels -->
              <circle cx="10" cy="32" r="2.5" fill="#2C2C2C" stroke="#ffffff" stroke-width="1"/>
              <circle cx="30" cy="32" r="2.5" fill="#2C2C2C" stroke="#ffffff" stroke-width="1"/>
              <!-- Windows -->
              <path d="M8 18l2-3h8l2 3z" fill="#87CEEB" opacity="0.7"/>
              <path d="M22 18l2-3h6l2 3z" fill="#87CEEB" opacity="0.7"/>
            </g>
          </svg>
        `),
        scaledSize: new google.maps.Size(60, 70),
        anchor: new google.maps.Point(30, 60),
      };
      
      const marker = new google.maps.Marker({
        position: { lat: car.lat, lng: car.lng },
        map: map,
        title: `${carNumber} - ${car.make} ${car.model}`,
        animation: google.maps.Animation.DROP,
        icon: carIcon,
      });
      
      // Add click listener
      marker.addListener('click', () => {
        const contentString = `
          <div style="padding: 8px; max-width: 250px;">
            <div style="display: flex; gap: 12px; align-items: start;">
              ${car.images?.[0] ? `<img src="${car.images[0]}" style="width: 80px; height: 60px; object-fit: cover; border-radius: 4px;" />` : ''}
              <div style="flex: 1;">
                <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold;">${car.make} ${car.model}</h3>
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">${car.year}</p>
                ${car.price_rent_daily ? `<p style="margin: 0 0 4px 0; font-size: 12px; color: #D4AF37; font-weight: bold;">${car.price_rent_daily} XAF/day</p>` : ''}
                ${car.price_sale ? `<p style="margin: 0 0 4px 0; font-size: 12px; color: #D4AF37; font-weight: bold;">${car.price_sale} XAF</p>` : ''}
                <p style="margin: 4px 0 0 0; font-size: 11px; color: #888;">📍 ${car.location}</p>
              </div>
            </div>
            <button 
              onclick="window.editCarLocation('${car.id}')"
              style="margin-top: 8px; width: 100%; padding: 6px; background: #D4AF37; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 500;"
            >
              Edit Location
            </button>
          </div>
        `;
        
        infoWindowRef.current?.setContent(contentString);
        infoWindowRef.current?.open(map, marker);
        setSelectedCar(car);
      });
      
      markersRef.current.push(marker);
      bounds.extend({ lat: car.lat, lng: car.lng });
    });
    
    // Fit map to show all markers
    map.fitBounds(bounds);
    
    console.log(`Created ${markersRef.current.length} markers on map`);
  }, [cars, map]);
  
  // Global function for edit button in info window
  useEffect(() => {
    (window as any).editCarLocation = (carId: string) => {
      const car = cars.find(c => c.id === carId);
      if (car) {
        onEditLocation(car);
        infoWindowRef.current?.close();
      }
    };
    
    return () => {
      delete (window as any).editCarLocation;
    };
  }, [cars, onEditLocation]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ekami-gold-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div>
          <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
            📍 {cars.length > 0 ? `Showing ${cars.length} cars with locations on the map` : 'No cars with locations yet'}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
            {cars.length > 0 ? 'Click any marker to see car details' : 'Set car locations in Grid view first, then they will appear here'}
          </p>
        </div>
        <button
          onClick={fetchCarsWithLocations}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Refresh Map
        </button>
      </div>

      {/* Map */}
      <div className="rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-lg">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '600px' }}
          center={DOUALA_CENTER}
          zoom={12}
          onLoad={onLoad}
          options={{
            streetViewControl: false,
            mapTypeControl: true,
            fullscreenControl: true,
            zoomControl: true,
          }}
        >
          {/* Markers are created natively in useEffect */}
        </GoogleMap>
      </div>

      {/* Legend */}
      <div className="bg-white dark:bg-ekami-charcoal-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Map Legend</h4>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-ekami-gold-600 border-2 border-white"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Car Location</span>
          </div>
          <div className="flex items-center gap-2">
            <CarIcon className="w-5 h-5 text-ekami-gold-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">{cars.length} Cars Total</span>
          </div>
        </div>
      </div>
    </div>
  );
}
