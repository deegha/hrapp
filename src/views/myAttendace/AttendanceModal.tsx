import {Button} from "@/components";
import {OFFICE_LOCATION_RADIUS_METERS} from "@/constants/configs";
import {useOfficeLocationSettings} from "@/hooks/useOfficeLocationSettings";
import moment from "moment";
import {useState, useEffect} from "react";
import {markAttendance, isAttendanceMarked, requestWFH, getMyWFHRequests} from "@/services";
import useSWR from "swr";
import {useNotificationStore} from "@/store/notificationStore";

interface IAttendanceModal {
  isOpen: boolean;
  onClose: () => void;
}

export function AttendanceModal({isOpen, onClose}: IAttendanceModal) {
  const {locationSettings} = useOfficeLocationSettings();
  const {showNotification} = useNotificationStore();

  const {data, mutate} = useSWR("attendance/isMarked", isAttendanceMarked);
  const attendanceMarker = data?.data;

  // 👇 fetch WFH requests to check for pending
  const {data: wfhData, mutate: mutateWFH} = useSWR("myWFHRequests", getMyWFHRequests);
  const hasPendingWFH = wfhData?.data?.some(
    (wfh) =>
      wfh.status === "PENDING" &&
      moment(wfh.date).format("YYYY-MM-DD") === moment().format("YYYY-MM-DD"),
  );

  // 👇 check if WFH is approved for today
  const hasApprovedWFH = wfhData?.data?.some(
    (wfh) =>
      wfh.status === "APPROVED" &&
      moment(wfh.date).format("YYYY-MM-DD") === moment().format("YYYY-MM-DD"),
  );

  const [userLocation, setUserLocation] = useState<{lat: number; lon: number} | null>(null);
  const [withinLocation, setWithinLocation] = useState<boolean | null>(null);
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null);
  const [locationError, setLocationError] = useState<boolean>(false);
  const [wfhLoading, setWfhLoading] = useState(false);

  const [showWFHConfirm, setShowWFHConfirm] = useState(false);
  const [wfhNote, setWfhNote] = useState("");

  function handleClose() {
    onClose();
  }

  function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371000;
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
        setWithinLocation(dist <= OFFICE_LOCATION_RADIUS_METERS);
      } else {
        setWithinLocation(false);
      }
    };

    const error = (err: GeolocationPositionError) => {
      console.error("Geolocation error:", err);
      if (!mounted) return;
      setWithinLocation(false);
      setLocationError(true);
    };

    navigator.geolocation.getCurrentPosition(success, error, {
      enableHighAccuracy: false,
      timeout: 15000,
      maximumAge: 60000,
    });

    return () => {
      mounted = false;
    };
  }, [isOpen, locationSettings]);

  const today = moment().format("DD, MM, YYYY");

  async function handleMarkAttendance() {
    if (attendanceMarker === "ATTENDANCE_MARKED") return;
    await markAttendance({
      punchTime: new Date().toISOString(),
      type: attendanceMarker ? "CHECK_OUT" : "CHECK_IN",
      latitude: userLocation?.lat,
      longitude: userLocation?.lon,
    });
    showNotification({
      message: attendanceMarker ? "Checked out successfully." : "Checked in successfully.",
      type: "success",
    });
    mutate();
    handleClose();
  }

  async function handleConfirmWFH() {
    if (!wfhNote.trim()) return;
    try {
      setWfhLoading(true);
      await requestWFH({
        date: new Date().toISOString(),
        latitude: userLocation?.lat,
        longitude: userLocation?.lon,
        note: wfhNote,
      });
      showNotification({
        message: "Work from home request sent to your manager for approval.",
        type: "success",
      });
      setShowWFHConfirm(false);
      setWfhNote("");
      mutateWFH(); // 👈 refresh WFH requests after submission
      handleClose();
    } catch {
      showNotification({
        message: "Failed to send WFH request. Please try again.",
        type: "error",
      });
    } finally {
      setWfhLoading(false);
    }
  }

  if (!isOpen) return null;

  // WFH confirmation modal
  if (showWFHConfirm) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm">
        <div className="flex w-full max-w-md flex-col gap-6 rounded-xl bg-white p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-gray-800">Request Work From Home</h2>
          <p className="text-sm text-textSecondary">
            Please provide a reason for your WFH request.
          </p>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Note <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none"
              rows={4}
              placeholder="Enter your reason for working from home..."
              value={wfhNote}
              onChange={(e) => setWfhNote(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="primary"
              onClick={handleConfirmWFH}
              disabled={!wfhNote.trim() || wfhLoading}
              loading={wfhLoading}
            >
              Confirm
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                setShowWFHConfirm(false);
                setWfhNote("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm">
        <div className="flex w-full max-w-md flex-col items-center gap-10 rounded-xl bg-white p-6 shadow-xl">
          <div className="flex flex-col items-center">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">Mark your attendance</h2>
            <p className="text-sm text-textSecondary">Marking attendance for {today}</p>
          </div>

          {locationError && (
            <>
              <p className="text-sm text-red-600">
                Unable to retrieve your location. Please ensure location services are enabled.
              </p>
              <p>You can enable location from exclamation mark in the address bar</p>
            </>
          )}

          {attendanceMarker === "ATTENDANCE_MARKED" ? (
            <p className="text-sm font-semibold text-green-600">
              You have already marked your attendance today.
            </p>
          ) : // 👇 Pending WFH request — block all actions
          hasPendingWFH ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
                <p className="font-semibold">WFH Request Pending</p>
                <p className="mt-1">
                  You have a pending Work From Home request for today. Please wait for your manager
                  to approve or reject it before marking attendance.
                </p>
              </div>
            </div>
          ) : // 👇 Approved WFH — show checkout option
          hasApprovedWFH ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
                <p className="font-semibold">Working From Home Today</p>
                <p className="mt-1">Your WFH request has been approved.</p>
              </div>
              <Button type="button" variant="secondary" onClick={handleMarkAttendance}>
                Check out now
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-center">
              {withinLocation === null ? (
                <p className="text-sm text-textSecondary">Checking location…</p>
              ) : withinLocation ? (
                <>
                  <p className="text-sm font-semibold text-green-600">
                    You are within {distanceMeters ? distanceMeters.toFixed(1) : "0"} m of office
                  </p>
                  <Button
                    type="button"
                    variant={attendanceMarker ? "secondary" : "primary"}
                    onClick={handleMarkAttendance}
                  >
                    {attendanceMarker ? "Check out now" : "Check in now"}
                  </Button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <p className="text-sm font-semibold text-red-600">
                    You are outside the office by{" "}
                    {distanceMeters ? distanceMeters.toFixed(1) : "an unknown distance"} m
                  </p>
                  <Button type="button" variant="secondary" onClick={() => setShowWFHConfirm(true)}>
                    Request Work From Home
                  </Button>
                </div>
              )}
            </div>
          )}

          <div>
            <Button type="button" variant="danger" onClick={handleClose}>
              Close modal
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
