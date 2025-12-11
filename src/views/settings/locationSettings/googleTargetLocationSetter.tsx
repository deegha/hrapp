import React, {useState, useCallback, useEffect, useMemo} from "react";
import {GoogleMap, useJsApiLoader, Marker, Circle} from "@react-google-maps/api";
import {saveTargetLocation} from "@/services";
import {Button} from "@/components";
import {useOfficeLocationSettings} from "@/hooks/useOfficeLocationSettings";

const colorfulMarkerLabel = {
  text: "My office", // The text you want to display (e.g., initials, short name)
  color: "#FFFFFF", // The color of the label text (e.g., White)
  fontSize: "14px", // The font size of the label
  fontWeight: "bold", // The font weight
};

const circleOptions = {
  strokeColor: "#3283F8",
  strokeOpacity: 0.8,
  strokeWeight: 2,
  fillColor: "#3283F8",
  fillOpacity: 0.35,
  clickable: false,
  draggable: false,
  editable: false,
  visible: true,
  zIndex: 1,
};

interface Coordinates {
  lat: number;
  lng: number;
}

// --- Constants for Sri Lanka ---
const SRI_LANKA_CENTER: Coordinates = {lat: 7.8731, lng: 80.7718};
const INITIAL_ZOOM = 8;
const DEFAULT_RADIUS_METERS = 40;

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
const GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY";

const GoogleTargetLocationSetter: React.FC = () => {
  const {locationSettings, isLoadingLocationSettings} = useOfficeLocationSettings();
  const [selectedLocation, setSelectedLocation] = useState<Coordinates>(SRI_LANKA_CENTER);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error" | "loaded">("idle");
  const [currentZoom, setCurrentZoom] = useState<number>(INITIAL_ZOOM);

  useEffect(() => {
    if (locationSettings) {
      setSelectedLocation({
        lat: locationSettings.centerLat,
        lng: locationSettings.centerLon,
      });
      setCurrentZoom(locationSettings.currentZoom || INITIAL_ZOOM);

      setStatus("loaded");
    }
  }, [locationSettings]);

  // 1. Hook to load the Google Maps API script
  const {isLoaded, loadError} = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const customMarkerIcon = useMemo(() => {
    // Only execute this code if the Google Maps API script has loaded (isLoaded is true).
    if (!isLoaded) return undefined; // window.google.maps.Size is now guaranteed to exist.

    return {
      url: "images/office-location-pin.png",
      scaledSize: new window.google.maps.Size(80, 80),
    };
  }, [isLoaded]);

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
      const success = await saveTargetLocation(selectedLocation, currentZoom);
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
    if (status === "loaded") return "✅ You already have a saved location.";
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

  const onZoomChanged = useCallback(function (this: google.maps.Map) {
    // The 'this' context inside onZoomChanged is the map instance itself.
    const newZoom = this.getZoom();
    if (newZoom !== undefined) {
      setCurrentZoom(newZoom);
    }
  }, []);

  if (loadError)
    return <div className="p-4 text-red-600">Error loading maps. Check your API key.</div>;
  if (!isLoaded) return <div className="p-4 text-gray-600">Loading map...</div>;

  return (
    <div className="mx-auto max-w-3xl space-y-4 overflow-hidden rounded-xl">
      <div className="max-w-[400px] overflow-hidden rounded-lg border border-gray-300">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={selectedLocation} // Center map on Sri Lanka
          zoom={currentZoom}
          options={mapOptions}
          onClick={onMapClick}
          onZoomChanged={onZoomChanged}
        >
          {selectedLocation && (
            <Circle
              center={selectedLocation}
              radius={DEFAULT_RADIUS_METERS} // Uses the radius state (e.g., 5000 meters)
              options={circleOptions}
            />
          )}
          {/* Display Marker at selected location */}
          {selectedLocation && (
            <Marker
              position={selectedLocation}
              icon={customMarkerIcon}
              title="My Office"
              label={colorfulMarkerLabel}
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
            Selected: Lat: <span className="font-mono">{selectedLocation.lat}</span>, Lng:{" "}
            <span className="font-mono">{selectedLocation.lng}</span>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        {status !== "loaded" ? (
          <div>
            <Button onClick={handleSave} disabled={!selectedLocation || status === "saving"}>
              {getButtonText()}
            </Button>
          </div>
        ) : (
          <p className="text-sm text-textSecondary">
            Click anywhere in the map if you want to choose a new location
          </p>
        )}
      </div>
    </div>
  );
};

export default GoogleTargetLocationSetter;
