import {Button} from "@/components";
import {useMyDetails} from "@/hooks/useMydetails";
import {useOfficeLocationSettings} from "@/hooks/useOfficeLocationSettings";
import moment from "moment";
import {useState, useEffect} from "react";
import QRCode from "react-qr-code";

interface IAttendanceQRModal {
  isOpen: boolean;
  onClose: () => void;
}

export function AttendanceQRModal({isOpen, onClose}: IAttendanceQRModal) {
  const {locationSettings} = useOfficeLocationSettings();
  const details = useMyDetails();
  const qrValue = "https://example.com";

  function handleClose() {
    onClose();
  }

  const [userLocation, setUserLocation] = useState<{lat: number; lon: number} | null>(null);
  const [withinLocation, setWithinLocation] = useState<boolean | null>(null);
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null);

  // Haversine formula to compute distance (in meters) between two lat/lon points
  function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371000; // Earth radius in meters
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  useEffect(() => {
    let mounted = true;
    setWithinLocation(null);
    setDistanceMeters(null);

    if (!isOpen) return;

    if (!locationSettings) {
      setWithinLocation(false);
      return;
    }

    if (!navigator?.geolocation) {
      setWithinLocation(false);
      return;
    }

    const success = (pos: GeolocationPosition) => {
      if (!mounted) return;
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      setUserLocation({lat, lon});

      const centerLat = Number(locationSettings.centerLat);
      const centerLon = Number(locationSettings.centerLon);

      if (Number.isFinite(centerLat) && Number.isFinite(centerLon)) {
        const dist = haversineDistance(lat, lon, centerLat, centerLon);
        setDistanceMeters(dist);
        setWithinLocation(dist <= 50); // 50 meters radius
      } else {
        setWithinLocation(false);
      }
    };

    const error = (err: GeolocationPositionError) => {
      console.error("Geolocation error:", err);
      if (!mounted) return;
      setWithinLocation(false);
    };

    navigator.geolocation.getCurrentPosition(success, error, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    });

    return () => {
      mounted = false;
      // No need to clear watcher because we used getCurrentPosition (not watchPosition)
    };
  }, [isOpen, locationSettings]);

  const today = moment().format("DD, MM, YYYY");

  if (!isOpen) return null;
  return (
    <div>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm">
        <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-xl bg-white p-6 shadow-xl">
          <div className="flex flex-col items-center">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">Mark your attendance</h2>
            <p className="text-sm text-textSecondary">Marking attendance for {today}</p>
          </div>

          <div className="flex flex-col items-center gap-2 text-center">
            {withinLocation === null ? (
              <p className="text-sm text-textSecondary">Checking location…</p>
            ) : withinLocation ? (
              <>
                <Button type="button" variant="primary" onClick={handleClose}>
                  Mark my attendance
                </Button>
                <p className="text-sm font-semibold text-green-600">
                  You are within {distanceMeters ? distanceMeters.toFixed(1) : "0"} m of office
                </p>
              </>
            ) : (
              <p className="text-sm font-semibold text-red-600">
                You are outside the office by{" "}
                {distanceMeters ? distanceMeters.toFixed(1) : "an unknown distance"} m
              </p>
            )}
          </div>

          <div>
            <Button type="button" variant="secondary" onClick={handleClose}>
              Close modal
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
