import React from "react";
import {PageLayout, ItemsList, Button, Layout} from "@/components";
import {useAttendanceSummery} from "@/hooks/attendance/useAttendanceSummery";

export function AttendancePage() {
  const {statCards, insightMessage, alerts, realTimeActivity} = useAttendanceSummery();

  const handleDownloadReport = () => {
    console.log("Downloading Monthly Attendance Report...");
  };

  return (
    <Layout>
      <PageLayout pageName="Attendance Dashboard">
        <div className="flex flex-col gap-8 py-4">
          {/* HEADER SECTION: Monthly Export */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-white p-4">
            <div>
              <h2 className="text-md font-semiBold text-textPrimary">Company Overview</h2>
              <p className="text-sm text-textSecondary">January 2026 Payroll Period</p>
            </div>
            <div>
              <Button onClick={handleDownloadReport}>Download Monthly Report</Button>
            </div>
          </div>

          {/* 1. HEALTH CHECK & PRODUCTIVITY METRICS */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {statCards.map((stat, index) => (
              <div key={index} className="rounded-lg border border-border bg-white p-4 shadow-sm">
                <div className="text-sm font-regular text-textSecondary">{stat.label}</div>
                <div
                  className={`text-lg font-extraBold ${stat.color === "primary" ? "text-primary" : "text-textPrimary"}`}
                >
                  {stat.value}
                </div>
                <div className="mt-1 text-xs text-textSecondary">{stat.sub}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* 2. RED FLAGS / TRENDS (Pattern Identification) */}
            <div className="flex flex-col gap-4">
              <h3 className="px-1 text-md font-semiBold">Attendance Alerts & Exceptions</h3>
              <div className="rounded-lg border border-border bg-white px-4">
                {alerts?.map((alert) => (
                  <ItemsList
                    key={alert.title}
                    title={alert.title}
                    content={`${alert.content} `}
                    status={alert.status}
                    onClick={() => console.log("View alert details")}
                  />
                ))}
              </div>
            </div>

            {/* 3. RECENT ACTIVITY (Who's In Now) */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-md font-semiBold">Real-time Activity</h3>
                <span className="cursor-pointer text-xs font-semiBold text-primary">View All</span>
              </div>
              <div className="rounded-lg border border-border bg-white px-4">
                {realTimeActivity?.map((log, index) => (
                  <ItemsList
                    key={index}
                    title={log.name}
                    content={`${log.type} at ${log.time}`}
                    status={log.status}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 4. LEAVE BURN RATE / UPCOMING HOLIDAYS */}
          <div className="bg-secondary/10 rounded-lg border border-border p-4">
            <h3 className="mb-2 text-sm font-semiBold text-textPrimary">HR Insights</h3>
            <p className="text-sm text-textSecondary">{insightMessage}</p>
          </div>
        </div>
      </PageLayout>
    </Layout>
  );
}

export default AttendancePage;
