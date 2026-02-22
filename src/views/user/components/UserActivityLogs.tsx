interface UserActivityLogsProps {
  logs?: {id: number; createdAt: string; content: string}[];
}

export function UserActivityLogs({logs}: UserActivityLogsProps) {
  if (!logs || logs.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <h2>Most Recent User Logs</h2>
      {logs.map((log, i) => (
        <div key={i} className="flex flex-col gap-1 border-b border-border py-2 text-sm">
          <div className="flex font-semibold text-textSecondary">
            <div className="text-sm">{log.content}</div>
          </div>
          <div className="text-xs text-textSecondary">{new Date(log.createdAt).toDateString()}</div>
        </div>
      ))}
    </div>
  );
}
