import {PageLayout, NoDataFoundComponent, ItemsList, Button, Pagination} from "@/components";
import moment from "moment";
import {useState} from "react";
import {AttendanceModal} from "./AttendanceModal";
import {getMyAttendanceRecords} from "@/services/attendanceService";
import useSWR from "swr";
import {useRouter} from "next/router";

const ATTENDANCE = {
  ON_LEAVE: "on_leave",
  FULL_DAY: "full_day",
  NO_PAY: "no_pay",
  HALF_DAY: "half_day",
  ABSENT: "absent",
};

export function MyAttendance() {
  const router = useRouter();
  const limit = Number(router.query.limit) || 10;
  const page = Number(router.query.page) || 1;

  const [isModalOpen, setIsCreateModalOpen] = useState(false);
  const {data} = useSWR(`attendanceRecords-${page}-${limit}`, () =>
    getMyAttendanceRecords(page, limit),
  );

  const attendanceItems = data?.data.data || [];

  return (
    <PageLayout
      pageName="My Attendance"
      actionButton={<Button onClick={() => setIsCreateModalOpen(true)}>Mark Attendance</Button>}
    >
      <div className="flex flex-col gap-5">
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
                    return <span className="block h-3 w-3 rounded-full bg-green-500" aria-hidden />;
                  case ATTENDANCE.NO_PAY:
                    return <span className="block h-3 w-3 rounded-full bg-red-500" aria-hidden />;
                  case ATTENDANCE.HALF_DAY:
                    return (
                      <span className="block h-3 w-3 rounded-full bg-yellow-400" aria-hidden />
                    );
                  case ATTENDANCE.ON_LEAVE:
                    return <span className="block h-3 w-3 rounded-full bg-teal-600" aria-hidden />;
                  case ATTENDANCE.ABSENT:
                    return <span className="block h-3 w-3 rounded-full bg-gray-500" aria-hidden />;
                  default:
                    return <span className="block h-3 w-3 rounded-full bg-gray-300" aria-hidden />;
                }
              };

              const statusLabel = (() => {
                switch (status) {
                  case ATTENDANCE.FULL_DAY:
                    return "Full day";
                  case ATTENDANCE.NO_PAY:
                    return "No pay";
                  case ATTENDANCE.HALF_DAY:
                    return "Half day";
                  case ATTENDANCE.ON_LEAVE:
                    return "On leave";
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
                      ) : (
                        <>
                          You have checked in{" "}
                          {attendance.checkInTime
                            ? moment(attendance.checkInTime).format("DD MMM YYYY, h:mm A")
                            : "Not recorded"}{" "}
                          and checked out at{" "}
                          {attendance.checkOutTime
                            ? moment(attendance.checkOutTime).format("DD MMM YYYY, h:mm A")
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

        <AttendanceModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
          }}
        />
      </div>
    </PageLayout>
  );
}
