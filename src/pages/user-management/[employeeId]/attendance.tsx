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
  const [editCheckOut, setEditCheckOut] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const swrKey =
    userId && !isNaN(userId)
      ? `userAttendance-${userId}-${page}-${limit}-${fromDate}-${toDate}`
      : null;

  function openEditModal(attendance: IAttendance) {
    setEditRecord(attendance);
    setEditCheckIn(
      attendance.checkInTime ? moment.utc(attendance.checkInTime).local().format("HH:mm") : "",
    );
    setEditCheckOut(
      attendance.checkOutTime ? moment.utc(attendance.checkOutTime).local().format("HH:mm") : "",
    );
  }

  async function handleSaveEdit() {
    if (!editRecord || !userId) return;
    try {
      setEditLoading(true);
      await updateUserAttendance(userId, {
        date: editRecord.date,
        checkInTime: editCheckIn
          ? new Date(`${editRecord.date}T${editCheckIn}:00`).toISOString()
          : undefined,
        checkOutTime: editCheckOut
          ? new Date(`${editRecord.date}T${editCheckOut}:00`).toISOString()
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

  console.log("userId:", userId);
  console.log("data:", data);

  if (!router.isReady) return null;

  const attendanceItems = data?.data.data || [];

  const getBulb = (s: string) => {
    switch (s) {
      case ATTENDANCE.FULL_DAY:
        return <span className="block size-3 rounded-full bg-gray-500" aria-hidden />;
      case ATTENDANCE.CHECKED_OUT:
        return <span className="block size-3 rounded-full bg-gray-500" aria-hidden />;
      case ATTENDANCE.CHECKED_IN:
        return <span className="block size-3 rounded-full bg-gray-500" aria-hidden />;
      case ATTENDANCE.NOT_CHECKED_OUT:
        return <span className="block size-3 rounded-full bg-gray-400" aria-hidden />;
      case ATTENDANCE.HALF_DAY:
        return <span className="block size-3 rounded-full bg-gray-400" aria-hidden />;
      case ATTENDANCE.ON_LEAVE:
        return <span className="block size-3 rounded-full bg-gray-500" aria-hidden />;
      case ATTENDANCE.NO_PAY:
        return <span className="block size-3 rounded-full bg-gray-500" aria-hidden />;
      case ATTENDANCE.ABSENT:
        return <span className="block size-3 rounded-full bg-gray-400" aria-hidden />;
      default:
        return <span className="block size-3 rounded-full bg-gray-300" aria-hidden />;
    }
  };

  const getStatusLabel = (status: string, isWFH?: boolean) => {
    switch (status) {
      case ATTENDANCE.FULL_DAY:
        return "Full day";
      case ATTENDANCE.CHECKED_OUT:
        return "Checked Out";
      case ATTENDANCE.CHECKED_IN:
        return isWFH ? "WFH — Checked In" : "Checked In";
      case ATTENDANCE.NOT_CHECKED_OUT:
        return "Not Checked Out";
      case ATTENDANCE.HALF_DAY:
        return "Half day";
      case ATTENDANCE.ON_LEAVE:
        return "On leave";
      case ATTENDANCE.NO_PAY:
        return "No pay";
      case ATTENDANCE.ABSENT:
        return "Absent";
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="flex w-full max-w-md flex-col gap-6 rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-800">
              Edit Attendance — {moment(editRecord.date).format("DD MMM YYYY")}
            </h2>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Check In Time</label>
                <input
                  type="time"
                  value={editCheckIn}
                  onChange={(e) => setEditCheckIn(e.target.value)}
                  className="rounded-lg border border-gray-300 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Check Out Time</label>
                <input
                  type="time"
                  value={editCheckOut}
                  onChange={(e) => setEditCheckOut(e.target.value)}
                  className="rounded-lg border border-gray-300 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="primary"
                onClick={handleSaveEdit}
                disabled={editLoading}
                loading={editLoading}
              >
                Save Changes
              </Button>
              <Button type="button" variant="danger" onClick={() => setEditRecord(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
