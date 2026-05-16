import {useRouter} from "next/router";
import {
  PageLayout,
  NoDataFoundComponent,
  ItemsList,
  Pagination,
  Button,
  Layout,
} from "@/components";
import {AttendanceDateFilter} from "@/views/myAttendace/AttendanceDateFilter";
import {getUserAttendanceById, updateUserAttendance} from "@/services/attendanceService";
import moment from "moment";
import {useState} from "react";
import useSWR from "swr";
import {IAttendance} from "@/types";
import {fetchMyPermissions} from "@/services/userService";
import {useNotificationStore} from "@/store/notificationStore";
import {mutate} from "swr";

const ATTENDANCE = {
  ON_LEAVE: "on_leave",
  FULL_DAY: "full_day",
  NO_PAY: "no_pay",
  HALF_DAY: "half_day",
  ABSENT: "absent",
  CHECKED_IN: "checked_in",
  CHECKED_OUT: "checked_out",
  NOT_CHECKED_OUT: "not_checked_out",
  PENDING: "pending",
};

export default function UserAttendancePage() {
  const router = useRouter();
  const page = Number(router.query.page) || 1;
  const limit = Number(router.query.limit) || 10;

  const [fromDate, setFromDate] = useState(moment().subtract(29, "days").format("YYYY-MM-DD"));
  const [toDate, setToDate] = useState(moment().format("YYYY-MM-DD"));

  const userId = router.isReady ? Number(router.query.employeeId) : null;

  const {data} = useSWR(
    userId && !isNaN(userId)
      ? `userAttendance-${userId}-${page}-${limit}-${fromDate}-${toDate}`
      : null,
    () => getUserAttendanceById(userId!, page, limit, fromDate, toDate),
  );

  const {showNotification} = useNotificationStore();

  const {data: permissionData} = useSWR("my-permissions", fetchMyPermissions);
  const isL1Admin =
    permissionData?.data?.permission === "ADMIN_USER" ||
    permissionData?.data?.permission === "SUPER_USER";

  const [editRecord, setEditRecord] = useState<IAttendance | null>(null);
  const [editCheckIn, setEditCheckIn] = useState("");
  const [editCheckInLocalDate, setEditCheckInLocalDate] = useState("");
  const [editCheckOut, setEditCheckOut] = useState("");
  const [editCheckOutLocalDate, setEditCheckOutLocalDate] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const swrKey =
    userId && !isNaN(userId)
      ? `userAttendance-${userId}-${page}-${limit}-${fromDate}-${toDate}`
      : null;

  function openEditModal(attendance: IAttendance) {
    setEditRecord(attendance);
    if (attendance.checkInTime) {
      const localCheckIn = moment.utc(attendance.checkInTime).local();
      setEditCheckInLocalDate(localCheckIn.format("YYYY-MM-DD"));
      setEditCheckIn(localCheckIn.format("HH:mm"));
    } else {
      setEditCheckInLocalDate(attendance.date);
      setEditCheckIn("");
    }
    if (attendance.checkOutTime) {
      const localCheckOut = moment.utc(attendance.checkOutTime).local();
      setEditCheckOutLocalDate(localCheckOut.format("YYYY-MM-DD"));
      setEditCheckOut(localCheckOut.format("HH:mm"));
    } else {
      setEditCheckOutLocalDate(attendance.date);
      setEditCheckOut("");
    }
  }

  async function handleSaveEdit() {
    if (!editRecord || !userId) return;
    try {
      setEditLoading(true);
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      await updateUserAttendance(userId, {
        date: editRecord.date,
        timezone,
        checkInTime: editCheckIn
          ? moment(`${editCheckInLocalDate}T${editCheckIn}:00`).utc().toISOString()
          : undefined,
        checkOutTime: editCheckOut
          ? moment(`${editCheckOutLocalDate}T${editCheckOut}:00`).utc().toISOString()
          : undefined,
      });
      showNotification({type: "success", message: "Attendance updated successfully"});
      setEditRecord(null);
      mutate(swrKey);
    } catch {
      showNotification({type: "error", message: "Failed to update attendance"});
    } finally {
      setEditLoading(false);
    }
  }

  if (!router.isReady) return null;

  const attendanceItems = data?.data.data || [];

  const getBulb = (s: string) => {
    switch (s) {
      case ATTENDANCE.FULL_DAY:
        return <span className="block size-3 rounded-full bg-green-500" aria-hidden />;
      case ATTENDANCE.CHECKED_OUT:
        return <span className="block size-3 rounded-full bg-green-500" aria-hidden />;
      case ATTENDANCE.CHECKED_IN:
        return <span className="block size-3 rounded-full bg-green-400" aria-hidden />;
      case ATTENDANCE.NOT_CHECKED_OUT:
        return <span className="block size-3 rounded-full bg-orange-400" aria-hidden />;
      case ATTENDANCE.HALF_DAY:
        return <span className="block size-3 rounded-full bg-yellow-400" aria-hidden />;
      case ATTENDANCE.ON_LEAVE:
        return <span className="block size-3 rounded-full bg-blue-400" aria-hidden />;
      case ATTENDANCE.NO_PAY:
        return <span className="block size-3 rounded-full bg-gray-500" aria-hidden />;
      case ATTENDANCE.ABSENT:
        return <span className="block size-3 rounded-full bg-gray-300" aria-hidden />;
      case ATTENDANCE.PENDING:
        return <span className="block size-3 rounded-full bg-purple-400" aria-hidden />;
      default:
        return <span className="block size-3 rounded-full bg-gray-300" aria-hidden />;
    }
  };

  const getStatusLabel = (status: string, isWFH?: boolean) => {
    const prefix = isWFH ? "Work Remote — " : "";
    switch (status) {
      case ATTENDANCE.FULL_DAY:
        return `${prefix}Full day`;
      case ATTENDANCE.HALF_DAY:
        return `${prefix}Half day`;
      case ATTENDANCE.CHECKED_IN:
        return `${prefix}Checked In`;
      case ATTENDANCE.NOT_CHECKED_OUT:
        return `${prefix}Not Checked Out`;
      case ATTENDANCE.CHECKED_OUT:
        return "Checked Out";
      case ATTENDANCE.ON_LEAVE:
        return "On leave";
      case ATTENDANCE.NO_PAY:
        return "No pay";
      case ATTENDANCE.ABSENT:
        return "Absent";
      case ATTENDANCE.PENDING:
        return "Pending Approval";
      default:
        return "Unknown";
    }
  };

  return (
    <Layout>
      <PageLayout
        pageName="User Attendance"
        actionButton={
          <Button variant="secondary" onClick={() => router.push(`/user-management`)}>
            Back to Users
          </Button>
        }
      >
        <div className="flex flex-col gap-5">
          <AttendanceDateFilter
            fromDate={fromDate}
            toDate={toDate}
            onChange={(from, to) => {
              setFromDate(from);
              setToDate(to);
            }}
          />

          {attendanceItems.length === 0 ? (
            <div className="py-12">
              <NoDataFoundComponent />
            </div>
          ) : (
            <div>
              {attendanceItems.map((attendance) => {
                const status = attendance.attendance;
                return (
                  <ItemsList
                    key={attendance.date}
                    title={attendance.date}
                    actionArea={
                      <div className="flex items-center gap-2" aria-hidden>
                        {getBulb(status)}
                        <span className="text-sm text-textSecondary">
                          {getStatusLabel(status, attendance.isWFH)}
                        </span>
                        {isL1Admin && status !== ATTENDANCE.ON_LEAVE && (
                          <button
                            onClick={() => openEditModal(attendance)}
                            className="ml-2 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-600 shadow-sm hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    }
                    content={
                      <div>
                        {status === ATTENDANCE.ON_LEAVE ? (
                          <div className="text-teal-800">On leave this day</div>
                        ) : status === ATTENDANCE.CHECKED_OUT ? (
                          <div className="text-green-700">
                            Working From Home — Checked in at{" "}
                            {attendance.checkInTime
                              ? moment
                                  .utc(attendance.checkInTime)
                                  .local()
                                  .format("DD MMM YYYY, h:mm A")
                              : "Not recorded"}{" "}
                            and checked out at{" "}
                            {attendance.checkOutTime
                              ? moment
                                  .utc(attendance.checkOutTime)
                                  .local()
                                  .format("DD MMM YYYY, h:mm A")
                              : "Not recorded"}
                          </div>
                        ) : status === ATTENDANCE.CHECKED_IN ? (
                          <div className="text-blue-600">
                            {attendance.isWFH ? "Working From Home — " : ""}Checked in at{" "}
                            {attendance.checkInTime
                              ? moment
                                  .utc(attendance.checkInTime)
                                  .local()
                                  .format("DD MMM YYYY, h:mm A")
                              : "Not recorded"}{" "}
                            — Not yet checked out
                          </div>
                        ) : status === ATTENDANCE.NOT_CHECKED_OUT ? (
                          <div className="text-orange-600">
                            Checked in at{" "}
                            {attendance.checkInTime
                              ? moment
                                  .utc(attendance.checkInTime)
                                  .local()
                                  .format("DD MMM YYYY, h:mm A")
                              : "Not recorded"}{" "}
                            — Did not check out
                          </div>
                        ) : status === ATTENDANCE.ABSENT ? (
                          <div className="text-gray-400">No attendance recorded</div>
                        ) : (
                          <>
                            Checked in at{" "}
                            {attendance.checkInTime
                              ? moment
                                  .utc(attendance.checkInTime)
                                  .local()
                                  .format("DD MMM YYYY, h:mm A")
                              : "Not recorded"}{" "}
                            and checked out at{" "}
                            {attendance.checkOutTime
                              ? moment
                                  .utc(attendance.checkOutTime)
                                  .local()
                                  .format("DD MMM YYYY, h:mm A")
                              : "Not recorded"}
                          </>
                        )}
                      </div>
                    }
                  />
                );
              })}
            </div>
          )}

          {data && data?.data?.totalPages > 1 && (
            <Pagination numberOfPage={data?.data.totalPages || 0} />
          )}
        </div>
      </PageLayout>
      {editRecord && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setEditRecord(null)}
        >
          <div className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-gray-100 bg-gray-50 px-6 py-5">
              <div>
                <p className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Editing attendance
                </p>
                <h2 className="text-xl font-bold text-gray-900">
                  {moment(editRecord.date).format("dddd, DD MMM YYYY")}
                </h2>
              </div>
              <button
                onClick={() => setEditRecord(null)}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
                aria-label="Close"
              >
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="flex flex-col gap-5 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                    <svg
                      className="size-4 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                      />
                    </svg>
                    Check In
                  </label>
                  <input
                    type="time"
                    value={editCheckIn}
                    onChange={(e) => setEditCheckIn(e.target.value)}
                    className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 transition-all focus:border-green-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-100"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                    <svg
                      className="size-4 text-rose-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Check Out
                  </label>
                  <input
                    type="time"
                    value={editCheckOut}
                    onChange={(e) => setEditCheckOut(e.target.value)}
                    className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 transition-all focus:border-rose-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-100"
                  />
                </div>
              </div>

              <p className="flex items-center gap-1.5 text-xs text-gray-400">
                <svg
                  className="size-3.5 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Times are in your local timezone ({Intl.DateTimeFormat().resolvedOptions().timeZone}
                )
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setEditRecord(null)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <Button
                type="button"
                variant="primary"
                onClick={handleSaveEdit}
                disabled={editLoading}
                loading={editLoading}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
