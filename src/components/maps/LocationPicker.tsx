import { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, Autocomplete } from '@react-google-maps/api';
import { MapPin, Search } from 'lucide-react';

const DOUALA_CENTER = { lat: 4.0511, lng: 9.7679 }; // Douala, Cameroon

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  defaultLocation?: { lat: number; lng: number };
  height?: string;
}

export default function LocationPicker({ 
  onLocationSelect, 
  defaultLocation = DOUALA_CENTER,
  height = '400px'
}: LocationPickerProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markerPos, setMarkerPos] = useState(defaultLocation);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [address, setAddress] = useState('');
  const markerRef = useRef<google.maps.Marker | null>(null);

  const mapContainerStyle = {
    width: '100%',
    height: height,
  };

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    
    // Create native marker
    markerRef.current = new google.maps.Marker({
      position: defaultLocation,
      map: map,
      draggable: true,
      animation: google.maps.Animation.DROP,
    });
    
    // Handle marker drag
    markerRef.current.addListener('dragend', () => {
      const pos = markerRef.current?.getPosition();
      if (pos) {
        const lat = pos.lat();
        const lng = pos.lng();
        setMarkerPos({ lat, lng });
        
        // Reverse geocode
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const addr = results[0].formatted_address;
            setAddress(addr);
            onLocationSelect({ lat, lng, address: addr });
          }
        });
      }
    });
  }, [defaultLocation, onLocationSelect]);
  
  useEffect(() => {
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng && markerRef.current) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarkerPos({ lat, lng });
      
      // Update marker position
      markerRef.current.setPosition({ lat, lng });
      markerRef.current.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(() => {
        markerRef.current?.setAnimation(null);
      }, 700);

      // Reverse geocode to get address
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const addr = results[0].formatted_address;
          setAddress(addr);
          onLocationSelect({ lat, lng, address: addr });
        }
      });
    }
  }, [onLocationSelect]);

  const onAutocompleteLoad = (autocompleteInstance: google.maps.places.Autocomplete) => {
    setAutocomplete(autocompleteInstance);
  };

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const addr = place.formatted_address || '';
        
        setMarkerPos({ lat, lng });
        
        // Update marker position
        if (markerRef.current) {
          markerRef.current.setPosition({ lat, lng });
        }
        setAddress(addr);
        onLocationSelect({ lat, lng, address: addr });
        
        if (map) {
          map.panTo({ lat, lng });
          map.setZoom(15);
        }
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-1">
          📍 Click anywhere on the map to set location
        </p>
        <p className="text-xs text-blue-600 dark:text-blue-300">
          Or search for a landmark/area name below
        </p>
      </div>

      {/* Search Box */}
      <div className="relative">
        <Autocomplete
          onLoad={onAutocompleteLoad}
          onPlaceChanged={onPlaceChanged}
          options={{
            componentRestrictions: { country: 'cm' }, // Restrict to Cameroon
            types: ['establishment', 'geocode'],
          }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for a landmark or area (optional)..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
        </Autocomplete>
      </div>

      {/* Map */}
      <div className="rounded-lg overflow-hidden border-4 border-ekami-gold-400 dark:border-ekami-gold-600 shadow-lg cursor-crosshair">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={markerPos}
          zoom={15}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onClick={onMapClick}
          options={{
            streetViewControl: false,
            mapTypeControl: true,
            fullscreenControl: true,
            zoomControl: true,
            gestureHandling: 'greedy',
            mapTypeControlOptions: {
              position: 3, // TOP_RIGHT
            },
          }}
        >
          {/* Marker is created natively in onLoad */}
        </GoogleMap>
      </div>

      {/* Selected Location Info */}
      {address && (
        <div className="space-y-2">
          <div className="flex items-start gap-3 p-4 bg-ekami-gold-50 dark:bg-ekami-gold-900/20 rounded-lg border border-ekami-gold-200 dark:border-ekami-gold-800">
            <MapPin className="w-5 h-5 text-ekami-gold-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-ekami-charcoal-900 dark:text-white">Selected Location</p>
              <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400 mt-1">{address}</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-ekami-charcoal-500 dark:text-ekami-silver-500 font-mono">
                <span className="bg-white dark:bg-gray-800 px-2 py-1 rounded border border-gray-300 dark:border-gray-600">
                  📍 {markerPos.lat.toFixed(6)}, {markerPos.lng.toFixed(6)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
