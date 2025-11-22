import { GoogleMap } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface MapDisplayProps {
  lat: number;
  lng: number;
  address?: string;
  height?: string;
  zoom?: number;
}

export default function MapDisplay({ 
  lat, 
  lng, 
  address,
  height = '400px',
  zoom = 15
}: MapDisplayProps) {
  const mapContainerStyle = {
    width: '100%',
    height: height,
  };

  const center = { lat, lng };
  const markerRef = useRef<google.maps.Marker | null>(null);
  
  console.log('MapDisplay rendering with:', { lat, lng, address });

  const onMapLoad = (map: google.maps.Map) => {
    console.log('Map loaded, centering on:', center);
    // Force center on the marker
    map.setCenter(center);
    map.setZoom(zoom);
    
    // Create native marker
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }
    
    // Create custom pin icon
    const pinIcon = {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="50" viewBox="0 0 40 50">
          <!-- Pin shape -->
          <path d="M20 0C11.716 0 5 6.716 5 15c0 8.284 15 35 15 35s15-26.716 15-35C35 6.716 28.284 0 20 0z" 
                fill="#D4AF37" stroke="#ffffff" stroke-width="2"/>
          <!-- Location dot inside -->
          <circle cx="20" cy="15" r="6" fill="#ffffff"/>
          <circle cx="20" cy="15" r="3" fill="#D4AF37"/>
        </svg>
      `),
      scaledSize: new google.maps.Size(40, 50),
      anchor: new google.maps.Point(20, 50),
    };
    
    markerRef.current = new google.maps.Marker({
      position: center,
      map: map,
      title: address || 'Ekami Auto Location',
      animation: google.maps.Animation.DROP,
      icon: pinIcon,
    });
    
    console.log('Native marker created:', markerRef.current);
  };
  
  useEffect(() => {
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, []);

  return (
    <div className="space-y-3">
      <div className="rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-md">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={zoom}
          onLoad={onMapLoad}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
            zoomControl: true,
          }}
        />
        {/* Marker is created natively in onMapLoad */}
      </div>

      {address && (
        <div className="flex items-start gap-2 text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
          <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-ekami-gold-600" />
          <span>{address}</span>
        </div>
      )}
    </div>
  );
}
