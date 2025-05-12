import { PageLayout, Button, StatusTag } from "@/components";
import { fetchUser } from "@/services";
import { getAuthUser } from "@/utils/getAuthUser";
import useSWR from "swr";

export function UserProfile() {
  const { data: userData } = useSWR(`fetch-auth-user`, async () => {
    const userSummary = JSON.parse((await getAuthUser()) as string);
    if (!userSummary) return;

    return fetchUser(userSummary.employeeId);
  });

  if (!userData) return <div></div>;

  const user = userData?.data;

  return (
    <PageLayout pageName="My Profile">
      <div>
        <ProfileRow label="Name" value={`${user.firstName} ${user.lastName}`} />
        <ProfileRow label="Email" value={user.email} />
        <ProfileRow label="User Level" value={user.userStatusId.toString()} />
        <ProfileRow
          label="Status"
          value={
            user.UserStatus?.statusLabel ? (
              <StatusTag status={user.UserStatus?.statusLabel} />
            ) : (
              "N/A"
            )
          }
        />
        <ProfileRow
          label="Employee ID"
          value={user.employeeId?.toString() ?? "N/A"}
        />

        <ProfileRow
          label="Joined At"
          value={new Date(user.createdAt).toLocaleDateString()}
        />
      </div>
      <div className="w-[200px]">
        <Button>Edit</Button>
      </div>
    </PageLayout>
  );
}

const ProfileRow: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div className="flex  border-border border-t py-4 gap-5">
    <div className="flex gap-2">
      <div className="w-[400px] text-sm textSecondary font-semiBold ">
        {label}
      </div>
      <div>:</div>
    </div>
    <div className="text-sm textPrimary">{value}</div>
  </div>
);
