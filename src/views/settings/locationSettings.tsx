import React, {useState, useCallback, useMemo} from "react";
import {GoogleMap, useJsApiLoader, Marker} from "@react-google-maps/api";
import {saveTargetLocation} from "@/services";
import {Button} from "@/components";

interface Coordinates {
  lat: number;
  lng: number;
}

// --- Constants for Sri Lanka ---
const SRI_LANKA_CENTER: Coordinates = {lat: 7.8731, lng: 80.7718};
const INITIAL_ZOOM = 7;

// --- Map Styling and Options ---
const containerStyle = {
  width: "100%",
  height: "400px", // Explicit height is required for Google Maps as well
};
const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
};

// Replace 'YOUR_GOOGLE_MAPS_API_KEY' with your actual key
const GOOGLE_MAPS_API_KEY = "AIzaSyDD21yNwqbKVIYP8820R84addUOXE-BbWo";

const GoogleTargetLocationSetter: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<Coordinates | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  // 1. Hook to load the Google Maps API script
  const {isLoaded, loadError} = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  // 2. Map Event Handler (Click)
  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newPos: Coordinates = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };
      setSelectedLocation(newPos);
      setStatus("idle"); // Reset status on new selection
    }
  }, []);

  // 3. API Save Handler
  const handleSave = useCallback(async () => {
    if (!selectedLocation) {
      setStatus("error");
      return;
    }
    setStatus("saving");
    try {
      const success = await saveTargetLocation(selectedLocation);
      if (success) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch (e) {
      console.error("Save API Error:", e);
      setStatus("error");
    }
  }, [selectedLocation]);

  // 4. Status Messages
  const getStatusMessage = () => {
    if (status === "success") return "✅ Target location saved successfully!";
    if (status === "saving") return "⏳ Saving location...";
    if (status === "error") return "❌ Error saving location. Try again.";
    if (selectedLocation) return "Location selected. Click SAVE to confirm.";
    return "Click on the map to select your new target location.";
  };

  const getButtonText = () => {
    if (status === "saving") return "Saving...";
    if (status === "success") return "Saved!";
    return "Save Target Location";
  };

  // 5. Render Logic
  if (loadError)
    return <div className="p-4 text-red-600">Error loading maps. Check your API key.</div>;
  if (!isLoaded) return <div className="p-4 text-gray-600">Loading map...</div>;

  return (
    <div className="mx-auto max-w-3xl space-y-4 rounded-xl">
      {/* Map Container */}
      <div className="overflow-hidden rounded-lg border border-gray-300">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={SRI_LANKA_CENTER} // Center map on Sri Lanka
          zoom={INITIAL_ZOOM}
          options={mapOptions}
          onClick={onMapClick}
        >
          {/* Display Marker at selected location */}
          {selectedLocation && (
            <Marker
              position={selectedLocation}
              // Google Maps uses lat, lng object directly for position
            />
          )}
        </GoogleMap>
      </div>

      {/* Status & Save Button */}
      <div className="flex flex-col items-center space-y-2">
        <p
          className={`rounded-lg p-3 text-center font-semibold ${
            status === "success"
              ? "bg-green-100 text-green-700"
              : status === "error"
                ? "bg-red-100 text-red-700"
                : "bg-indigo-50 text-indigo-700"
          }`}
        >
          {getStatusMessage()}
        </p>

        {selectedLocation && (
          <div className="text-center text-sm text-gray-600">
            Selected: Lat: <span className="font-mono">{selectedLocation.lat.toFixed(6)}</span>,
            Lng: <span className="font-mono">{selectedLocation.lng.toFixed(6)}</span>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <div>
          <Button onClick={handleSave} disabled={!selectedLocation || status === "saving"}>
            {getButtonText()}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GoogleTargetLocationSetter;
