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

type RequestFlowType = "WORK_REMOTE" | "ATTENDANCE_APPROVAL";

export function AttendanceModal({isOpen, onClose}: IAttendanceModal) {
  const {locationSettings, isLoadingLocationSettings} = useOfficeLocationSettings();
  const {showNotification} = useNotificationStore();

  const {data, mutate} = useSWR("attendance/isMarked", isAttendanceMarked);
  const attendanceMarker = data?.data;

  const {data: wfhData, mutate: mutateWFH} = useSWR("myWFHRequests", getMyWFHRequests);

  const todayStr = moment().format("YYYY-MM-DD");

  const hasPendingWorkRemote = wfhData?.data?.some(
    (wfh) =>
      wfh.status === "PENDING" &&
      wfh.requestType === "WORK_REMOTE" &&
      moment(wfh.date).format("YYYY-MM-DD") === todayStr,
  );

  const hasPendingAttendanceApproval = wfhData?.data?.some(
    (wfh) =>
      wfh.status === "PENDING" &&
      wfh.requestType === "ATTENDANCE_APPROVAL" &&
      moment(wfh.date).format("YYYY-MM-DD") === todayStr,
  );

  const hasApprovedWorkRemote = wfhData?.data?.some(
    (wfh) =>
      wfh.status === "APPROVED" &&
      wfh.requestType === "WORK_REMOTE" &&
      moment(wfh.date).format("YYYY-MM-DD") === todayStr,
  );

  const [userLocation, setUserLocation] = useState<{lat: number; lon: number} | null>(null);
  const [withinLocation, setWithinLocation] = useState<boolean | null>(null);
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null);
  const [locationError, setLocationError] = useState<boolean>(false);
  const [locationErrorCode, setLocationErrorCode] = useState<number | null>(null);
  const [locationRetry, setLocationRetry] = useState(0);
  const [requestLoading, setRequestLoading] = useState(false);

  const [showRequestConfirm, setShowRequestConfirm] = useState(false);
  const [requestFlowType, setRequestFlowType] = useState<RequestFlowType>("WORK_REMOTE");
  const [requestNote, setRequestNote] = useState("");

  function handleClose() {
    onClose();
  }

  function handleRetryLocation() {
    setLocationError(false);
    setLocationErrorCode(null);
    setWithinLocation(null);
    setDistanceMeters(null);
    setUserLocation(null);
    setLocationRetry((n) => n + 1);
  }

  function openRequestFlow(type: RequestFlowType) {
    setRequestFlowType(type);
    setRequestNote("");
    setShowRequestConfirm(true);
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
    if (isLoadingLocationSettings) return;
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
      if (!mounted) return;
      setWithinLocation(false);
      setLocationError(true);
      setLocationErrorCode(err.code);
    };

    navigator.geolocation.getCurrentPosition(success, error, {
      enableHighAccuracy: false,
      timeout: 15000,
      maximumAge: 60000,
    });

    return () => {
      mounted = false;
    };
  }, [isOpen, locationSettings, isLoadingLocationSettings, locationRetry]);

  const today = moment().format("DD MMM YYYY");

  async function handleMarkAttendance() {
    if (attendanceMarker === "ATTENDANCE_MARKED") return;
    await markAttendance({
      punchTime: Date.now(),
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

  async function handleConfirmRequest() {
    if (!requestNote.trim()) return;
    try {
      setRequestLoading(true);
      await requestWFH({
        date: new Date().toISOString(),
        latitude: userLocation?.lat,
        longitude: userLocation?.lon,
        note: requestNote,
        requestType: requestFlowType,
      });
      const successMsg =
        requestFlowType === "ATTENDANCE_APPROVAL"
          ? "Attendance request sent to your manager. Your attendance will show as pending until approved."
          : "Work Remote request sent to your manager for approval.";
      showNotification({message: successMsg, type: "success"});
      setShowRequestConfirm(false);
      setRequestNote("");
      mutateWFH();
      handleClose();
    } catch {
      showNotification({message: "Failed to send request. Please try again.", type: "error"});
    } finally {
      setRequestLoading(false);
    }
  }

  if (!isOpen) return null;

  // Request confirmation modal (Work Remote OR Attendance Approval)
  if (showRequestConfirm) {
    const isAttendanceApproval = requestFlowType === "ATTENDANCE_APPROVAL";
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm">
        <div className="flex w-full max-w-md flex-col gap-6 rounded-xl bg-white p-6 shadow-xl">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {isAttendanceApproval ? "Check In Without Location" : "Request Work Remote"}
            </h2>
            <p className="mt-1 text-sm text-textSecondary">
              {isAttendanceApproval
                ? "Use this when you're physically at the office but your device can't get a GPS fix. Your manager will approve your check-in."
                : "Use this when you're working from home or another location outside the office. Your manager will be notified to approve."}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Note <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none"
              rows={4}
              placeholder={
                isAttendanceApproval
                  ? "e.g. GPS not working, indoor office area, device issue..."
                  : "Enter your reason for working remotely..."
              }
              value={requestNote}
              onChange={(e) => setRequestNote(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="primary"
              onClick={handleConfirmRequest}
              disabled={!requestNote.trim() || requestLoading}
              loading={requestLoading}
            >
              Submit Request
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                setShowRequestConfirm(false);
                setRequestNote("");
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
        <div className="flex w-full max-w-md flex-col gap-6 rounded-2xl bg-white p-8 shadow-2xl">
          {/* Header */}
          <div className="flex flex-col items-center gap-1 text-center">
            <h2 className="text-2xl font-bold text-gray-800">
              {attendanceMarker === "ATTENDANCE_MARKED"
                ? "Already Checked In"
                : attendanceMarker
                  ? "Check Out"
                  : "Check In"}
            </h2>
            <p className="text-sm text-gray-400">
              {attendanceMarker === "ATTENDANCE_MARKED"
                ? `Attendance recorded for ${today}`
                : attendanceMarker
                  ? `Checking out for ${today}`
                  : `Checking in for ${today}`}
            </p>
          </div>

          {/* Body */}
          {attendanceMarker === "ATTENDANCE_MARKED" ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-green-100 text-3xl">
                ✓
              </div>
              <div>
                <p className="font-semibold text-gray-800">You&apos;re all set for today!</p>
                <p className="mt-1 text-sm text-gray-500">
                  Your attendance has already been recorded. No further action needed.
                </p>
              </div>
            </div>
          ) : hasPendingAttendanceApproval ? (
            <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 text-center">
              <p className="font-semibold text-purple-800">Check-in Request Pending</p>
              <p className="mt-1 text-sm text-purple-700">
                Your request to check in without location is waiting for your manager&apos;s
                approval. Your attendance will be confirmed once approved.
              </p>
            </div>
          ) : hasPendingWorkRemote ? (
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-center">
              <p className="font-semibold text-yellow-800">Work Remote Request Pending</p>
              <p className="mt-1 text-sm text-yellow-700">
                You have a pending request to work remotely today. Your attendance will be recorded
                once your manager approves it.
              </p>
            </div>
          ) : hasApprovedWorkRemote ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-full rounded-xl border border-green-200 bg-green-50 p-4">
                <p className="font-semibold text-green-800">Working Remotely Today</p>
                <p className="mt-1 text-sm text-green-700">
                  Your manager has approved your request to work remotely.
                </p>
              </div>
              <Button type="button" variant="secondary" onClick={handleMarkAttendance}>
                Check out now
              </Button>
            </div>
          ) : locationError ? (
            <div className="flex flex-col gap-4">
              {locationErrorCode === 1 ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
                  <p className="font-semibold text-red-700">Location access blocked</p>
                  <p className="mt-1 text-sm text-red-600">
                    Allow location access in your browser settings, then tap Retry. Your location is
                    needed to verify you&apos;re at the office.
                  </p>
                </div>
              ) : (
                <>
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
                    <p className="font-semibold text-amber-800">Can&apos;t detect your location</p>
                    <p className="mt-1 text-sm text-amber-700">
                      {attendanceMarker
                        ? "Your device couldn't get a location fix. You can retry or check out without location."
                        : "Your device couldn't confirm your location. Choose an option below based on where you are."}
                    </p>
                  </div>
                  {!attendanceMarker && (
                    <div className="flex flex-col gap-2 rounded-xl border border-gray-100 bg-gray-50 p-3 text-xs text-gray-500">
                      <p>
                        <span className="font-semibold text-gray-700">
                          Check in without location
                        </span>
                        {" — "}You&apos;re physically at the office but your device can&apos;t get a
                        GPS fix.
                      </p>
                      <p>
                        <span className="font-semibold text-gray-700">Work from home</span>
                        {" — "}You&apos;re working from outside the office today.
                      </p>
                    </div>
                  )}
                </>
              )}
              <div className="flex flex-col gap-2">
                <Button type="button" variant="primary" onClick={handleRetryLocation}>
                  Retry
                </Button>
                {locationErrorCode !== 1 && attendanceMarker && (
                  <Button type="button" variant="secondary" onClick={handleMarkAttendance}>
                    Check out without location
                  </Button>
                )}
                {locationErrorCode !== 1 && !attendanceMarker && (
                  <>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => openRequestFlow("ATTENDANCE_APPROVAL")}
                    >
                      Check in without location
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => openRequestFlow("WORK_REMOTE")}
                    >
                      Work from home
                    </Button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 text-center">
              {withinLocation === null ? (
                <p className="text-sm text-gray-400">Detecting your location…</p>
              ) : withinLocation ? (
                <>
                  <div className="w-full rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                    You are within {distanceMeters ? distanceMeters.toFixed(0) : "0"} m of the
                    office
                  </div>
                  <Button
                    type="button"
                    variant={attendanceMarker ? "secondary" : "primary"}
                    onClick={handleMarkAttendance}
                  >
                    {attendanceMarker ? "Check out now" : "Check in now"}
                  </Button>
                </>
              ) : (
                <div className="flex w-full flex-col items-center gap-4">
                  <div className="w-full rounded-xl border border-orange-200 bg-orange-50 p-4 text-center">
                    <p className="font-semibold text-orange-700">You&apos;re outside the office</p>
                    <p className="mt-1 text-sm text-orange-600">
                      You are {distanceMeters ? `${distanceMeters.toFixed(0)} m` : "some distance"}{" "}
                      away. If you&apos;re working from home or another location, request Work
                      Remote.
                    </p>
                  </div>
                  {attendanceMarker ? (
                    <Button type="button" variant="secondary" onClick={handleMarkAttendance}>
                      Check out anyway
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => openRequestFlow("WORK_REMOTE")}
                    >
                      Request Work Remote
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-gray-100 pt-4">
            <Button type="button" variant="danger" onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
