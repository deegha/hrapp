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

  const today = moment().format("DD, MM, YYYY");

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
              {isAttendanceApproval ? "Request Attendance Approval" : "Request Work Remote"}
            </h2>
            <p className="mt-1 text-sm text-textSecondary">
              {isAttendanceApproval
                ? "Your attendance will show as pending until your manager or admin approves it."
                : "Your manager will be notified to approve your Work Remote request."}
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
                  ? "Explain why your location could not be verified..."
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
        <div className="flex w-full max-w-md flex-col items-center gap-10 rounded-xl bg-white p-6 shadow-xl">
          <div className="flex flex-col items-center">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              {attendanceMarker === "ATTENDANCE_MARKED"
                ? "Attendance Marked"
                : attendanceMarker
                  ? "Check Out"
                  : "Check In"}
            </h2>
            <p className="text-sm text-textSecondary">
              {attendanceMarker === "ATTENDANCE_MARKED"
                ? `Attendance already recorded for ${today}`
                : attendanceMarker
                  ? `Checking out for ${today}`
                  : `Checking in for ${today}`}
            </p>
          </div>

          {attendanceMarker === "ATTENDANCE_MARKED" ? (
            <p className="text-sm font-semibold text-green-600">
              You have already marked your attendance today.
            </p>
          ) : hasPendingAttendanceApproval ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="rounded-lg bg-purple-50 p-4 text-sm text-purple-800">
                <p className="font-semibold">Attendance Approval Pending</p>
                <p className="mt-1">
                  Your attendance request is waiting for manager approval. Your attendance will be
                  confirmed once approved.
                </p>
              </div>
            </div>
          ) : hasPendingWorkRemote ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
                <p className="font-semibold">Work Remote Request Pending</p>
                <p className="mt-1">
                  You have a pending Work Remote request for today. Please wait for your manager to
                  approve or reject it before marking attendance.
                </p>
              </div>
            </div>
          ) : hasApprovedWorkRemote ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
                <p className="font-semibold">Working Remotely Today</p>
                <p className="mt-1">Your Work Remote request has been approved.</p>
              </div>
              <Button type="button" variant="secondary" onClick={handleMarkAttendance}>
                Check out now
              </Button>
            </div>
          ) : locationError ? (
            <div className="flex flex-col items-center gap-4 text-center">
              {locationErrorCode === 1 ? (
                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
                  <p className="font-semibold">Location permission denied</p>
                  <p className="mt-1">
                    Click the location icon in the address bar and allow access for this site, then
                    click Retry.
                  </p>
                </div>
              ) : (
                <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
                  <p className="font-semibold">Location signal unavailable</p>
                  <p className="mt-1">
                    {attendanceMarker
                      ? "Your device couldn't get a location fix. You can retry or check out without location."
                      : "Your device couldn't get a location fix. You can retry, request attendance approval (pending until manager confirms), or request Work Remote."}
                  </p>
                </div>
              )}
              <div className="flex flex-wrap justify-center gap-3">
                <Button type="button" variant="primary" onClick={handleRetryLocation}>
                  Retry
                </Button>
                {locationErrorCode !== 1 && attendanceMarker && (
                  <Button type="button" variant="secondary" onClick={handleMarkAttendance}>
                    Check out without location
                  </Button>
                )}
                {locationErrorCode !== 1 && !attendanceMarker && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => openRequestFlow("ATTENDANCE_APPROVAL")}
                  >
                    Request attendance approval
                  </Button>
                )}
                {!attendanceMarker && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => openRequestFlow("WORK_REMOTE")}
                  >
                    Request Work Remote
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-center">
              {withinLocation === null ? (
                <p className="text-sm text-textSecondary">Checking your location…</p>
              ) : withinLocation ? (
                <>
                  <p className="text-sm font-semibold text-green-600">
                    You are within {distanceMeters ? distanceMeters.toFixed(1) : "0"} m of the
                    office
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
                  <div className="rounded-lg bg-orange-50 p-4 text-sm text-orange-700">
                    <p className="font-semibold">Outside office area</p>
                    <p className="mt-1">
                      You are {distanceMeters ? `${distanceMeters.toFixed(0)} m` : "some distance"}{" "}
                      away from the office.
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
