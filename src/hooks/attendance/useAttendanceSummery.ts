import {useMemo} from "react";
import useSWR from "swr";
import {getAdminAttendanceSummery} from "@/services";

export function useAttendanceSummery() {
  const {data, isLoading, error} = useSWR("admin-attendance-summery", async () => {
    const response = await getAdminAttendanceSummery();
    // Assuming response.data is of type IAttendanceSummary
    return response?.data;
  });

  const processedData = useMemo(() => {
    if (!data) return {statCards: [], insightMessage: ""};

    const cards = [
      {
        label: "Present Today",
        value: data.presentToday.toString(),
        sub: `${data.presentPercentage}%`,
        color: "textPrimary",
      },
      {
        label: "Late Arrivals",
        value: data.lateArrivals.toString(),
        sub: "Action Required",
        color: "text-orange-500",
      },
      {
        label: "On Leave",
        value: data.onLeave.toString(),
        sub: "Planned",
        color: "textSecondary",
      },
      {
        label: "Overtime Hours",
        value: `${data.overtimeHours}h`,
        sub: "This Month",
        color: "primary",
      },
    ];

    const trendDirection = data.insights.attendanceTrend >= 0 ? "up" : "down";
    const absoluteTrend = Math.abs(data.insights.attendanceTrend);

    const message = `Team attendance is ${trendDirection} ${absoluteTrend}% compared to last month. ${data.insights.approachingOvertimeLimitCount} employees are approaching their maximum overtime limit for this pay cycle.`;

    const realTimeActivity = data.realTimeActivity;

    const alerts = data.attendanceAlerts.map((alert) => ({
      title: alert.name,
      content: `${alert.date} • ${alert.detail}`,
      status: alert.status,
    }));

    return {statCards: cards, insightMessage: message, alerts, realTimeActivity};
  }, [data]);

  return {
    statCards: processedData.statCards,
    insightMessage: processedData.insightMessage,
    alerts: processedData.alerts,
    isLoading,
    error,
    realTimeActivity: processedData.realTimeActivity,
  };
}
