import {PageLayout, NoDataFoundComponent, ItemsList, Button, Pagination} from "@/components";
import moment from "moment";
import {useState} from "react";
import {AttendanceModal} from "./AttendanceModal";
import {AttendanceDateFilter} from "./AttendanceDateFilter";
import {getMyAttendanceRecords, getMyWFHRequests} from "@/services/attendanceService";
import useSWR from "swr";
import {useRouter} from "next/router";

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

export function MyAttendance() {
  const router = useRouter();
  const limit = Number(router.query.limit) || 10;
  const page = Number(router.query.page) || 1;

  const [fromDate, setFromDate] = useState(moment().subtract(29, "days").format("YYYY-MM-DD"));
  const [toDate, setToDate] = useState(moment().format("YYYY-MM-DD"));

  const [isModalOpen, setIsCreateModalOpen] = useState(false);

  const {data} = useSWR(`attendanceRecords-${page}-${limit}-${fromDate}-${toDate}`, () =>
    getMyAttendanceRecords(page, limit, fromDate, toDate),
  );
  const {data: wfhData} = useSWR("myWFHRequests", getMyWFHRequests);

  const attendanceItems = data?.data.data || [];
  const wfhItems = wfhData?.data || [];

  function handleDateChange(from: string, to: string) {
    setFromDate(from);
    setToDate(to);
  }

  return (
    <PageLayout
      pageName="My Attendance"
      actionButton={<Button onClick={() => setIsCreateModalOpen(true)}>Mark Attendance</Button>}
    >
      <div className="flex flex-col gap-5">
        {/* 👇 Date filter */}
        <AttendanceDateFilter fromDate={fromDate} toDate={toDate} onChange={handleDateChange} />

        {attendanceItems?.length === 0 ? (
          <div className="py-12">
            <NoDataFoundComponent />
          </div>
        ) : (
          <div>
            {attendanceItems.map((attendance) => {
              const status = attendance.attendance;

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

              const statusLabel = (() => {
                switch (status) {
                  case ATTENDANCE.FULL_DAY:
                    return "Full day";
                  case ATTENDANCE.CHECKED_OUT:
                    return "Checked Out";
                  case ATTENDANCE.CHECKED_IN:
                    return attendance.isWFH ? "WFH — Checked In" : "Checked In";
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
              })();

              return (
                <ItemsList
                  key={`${attendance.date}`}
                  title={attendance.date}
                  actionArea={
                    <div className="flex items-center gap-2" aria-hidden>
                      {getBulb(status)}
                      <span className="text-sm text-textSecondary">{statusLabel}</span>
                    </div>
                  }
                  content={
                    <div>
                      {status === ATTENDANCE.ON_LEAVE ? (
                        <div className="text-teal-800">You have been on leave this day</div>
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
                      ) : (
                        <>
                          You have checked in{" "}
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

        {wfhItems.filter((wfh) => wfh.status !== "APPROVED").length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-gray-700">WFH Requests</h2>
            {wfhItems
              .filter((wfh) => wfh.status !== "APPROVED")
              .map((wfh) => (
                <ItemsList
                  key={wfh.id}
                  title={moment(wfh.date).format("DD MMM YYYY")}
                  actionArea={
                    <div className="flex items-center gap-2">
                      <span
                        className={`block size-3 rounded-full ${
                          wfh.status === "REJECTED" ? "bg-red-500" : "bg-yellow-400"
                        }`}
                      />
                      <span className="text-sm text-textSecondary">{wfh.status}</span>
                    </div>
                  }
                  content={
                    <div>
                      Work From Home — Requested on{" "}
                      {moment(wfh.createdAt).format("DD MMM YYYY, h:mm A")}
                    </div>
                  }
                />
              ))}
          </div>
        )}

        {data && data?.data?.totalPages > 1 && (
          <Pagination numberOfPage={data?.data.totalPages || 0} />
        )}

        <AttendanceModal isOpen={isModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      </div>
    </PageLayout>
  );
}
