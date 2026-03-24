import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

interface LocationContextType {
  location: Location | null;
  loading: boolean;
  error: string | null;
  requestLocation: () => Promise<void>;
  city: string | null;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);

  const requestLocation = async () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      const msg = "Geolocation is not supported by your browser";
      setError(msg);
      toast.error(msg);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setLocation({ latitude, longitude, accuracy });
        setLoading(false);
        
        // Simple reverse geocoding attempt (can be replaced with a real API like Google/OpenStreetMap)
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          setCity(data.address?.city || data.address?.town || data.address?.village || "Unknown");
          toast.success(`Location detected: ${data.address?.city || "Current Location"}`);
        } catch (e) {
          console.error("Geocoding error", e);
        }
      },
      (err) => {
        const msg = "Location access denied. Please allow location for local suggestions.";
        setError(msg);
        toast.error(msg);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  // Try to load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("user-location");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setLocation(parsed.coords);
        setCity(parsed.city);
      } catch (e) {}
    }
  }, []);

  // Save to localStorage when location changes
  useEffect(() => {
    if (location) {
      localStorage.setItem("user-location", JSON.stringify({ coords: location, city, timestamp: Date.now() }));
    }
  }, [location, city]);

  return (
    <LocationContext.Provider value={{ location, loading, error, requestLocation, city }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};
