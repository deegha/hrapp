import {PageLayout, NoDataFound, ItemsList, Button} from "@/components";
import moment from "moment";
import {useState} from "react";
import {AttendanceQRModal} from "./attendanceQRModal";

const ATTENDANCE = {
  ON_LEAVE: "on leave",
  FULL_DAY: "full day",
  NO_PAY: "no pay",
};

export function MyAttendance() {
  const [isModalOpen, setIsCreateModalOpen] = useState(false);

  const attendanceItems = [
    {
      date: "12th tue 2025",
      checkInTime: "9:00 AM",
      checkOutTime: "3:00 PM",
      remarks: "Checked out half day",
      createdAt: moment(),
      completedHours: 8,
      attendance: ATTENDANCE.FULL_DAY,
    },
    {
      date: "13th wed 2025",
      checkInTime: "9:00 AM",
      checkOutTime: "2:00 PM",
      remarks: "Going to graduation",
      createdAt: moment(),
      completedHours: 8,
      attendance: ATTENDANCE.ON_LEAVE,
    },
    {
      date: "14th thurs 2025",
      checkInTime: "9:00 AM",
      checkOutTime: "6:00 PM",
      remarks: "",
      createdAt: moment(),
      completedHours: 8,
      attendance: ATTENDANCE.NO_PAY,
    },
  ];

  const actionItems = (attendance: string) => {
    switch (attendance) {
      case ATTENDANCE.FULL_DAY:
        return {
          text: "",
          actionItem: "",
        };

      case ATTENDANCE.ON_LEAVE:
        return {
          text: "",
          actionItem: "",
        };

      default:
        return {
          text: "",
          actionItem: "",
        };
    }
  };

  return (
    <PageLayout
      pageName="My Attendance"
      actionButton={<Button onClick={() => setIsCreateModalOpen(true)}>Mark Attendance</Button>}
    >
      <div className="flex flex-col gap-5">
        <div>
          {attendanceItems?.map((attendance) => (
            <ItemsList
              key={`${attendance.date}`}
              title={attendance.date}
              actionArea={
                <div>{attendance.attendance === ATTENDANCE.ON_LEAVE && <div className="" />}</div>
              }
              content={
                <div>
                  {attendance.attendance === ATTENDANCE.ON_LEAVE ? (
                    <div className="text-teal-800">You have been on leave this day</div>
                  ) : (
                    <>
                      You have checked in {attendance.checkInTime} and checked out at{" "}
                      {attendance.checkOutTime}
                    </>
                  )}
                </div>
              }
            />
          ))}
        </div>
      </div>
      <AttendanceQRModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
        }}
      />
    </PageLayout>
  );
}
