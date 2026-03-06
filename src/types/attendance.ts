type AttendanceType = "CHECK_IN" | "CHECK_OUT";

export interface IAttendancePayload {
  punchTime: number;
  type: AttendanceType;
  latitude?: number;
  longitude?: number;
}

export interface IAttendance {
  date: string;
  checkInTime: Date | null;
  checkOutTime: Date | null;
  attendance:
    | "full_day"
    | "half_day"
    | "on_paid_leave"
    | "no_pay"
    | "absent"
    | "checked_in"
    | "checked_out"
    | "not_checked_out";
  isWFH?: boolean;
  location: {
    lat: number;
    lon: number;
  };
}

export interface IRealTimeActivity {
  id: number;
  name: string;
  time: string;
  type: "Clock In" | "Clock Out";
  status: "approved" | "pending" | "rejected"; // TGenericStatus
  isVerifiedIp: boolean;
}
export interface IAttendanceAlert {
  id: number;
  name: string;
  detail: string;
  status: "absent" | "pending" | "rejected"; // Matches your TGenericStatus
  date: string;
}

/**
 * Interface representing the attendance summary for the employer dashboard.
 * This is based on calculations for today's presence and monthly overtime.
 */
export interface IAttendanceSummary {
  /** Total number of unique employees who clocked in today */
  presentToday: number;

  /** Percentage of the total workforce currently present (e.g., 88) */
  presentPercentage: number;

  /** Number of employees who clocked in after the policy start time (e.g., 09:00 AM) */
  lateArrivals: number;

  /** Number of employees with an approved leave record for today */
  onLeave: number;

  /** * Cumulative hours worked across the organization that exceed
   * the daily WORKING_HOURS_PER_DAY threshold (8h) for the current month.
   */
  overtimeHours: number;

  insights: {
    attendanceTrend: number;
    approachingOvertimeLimitCount: number;
  };

  realTimeActivity: IRealTimeActivity[];
  attendanceAlerts: IAttendanceAlert[];
}
