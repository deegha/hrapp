import {PageLayout, Button, StatusTag, Shimmer} from "@/components";
import {fetchUser} from "@/services";
import {getAuthUser} from "@/utils/getAuthUser";
import useSWR from "swr";
import Link from "next/link";
import {roles} from "@/utils/staticValues";

export function UserProfile() {
  const {data: userData} = useSWR(`fetch-auth-user`, async () => {
    const userSummary = await getAuthUser();

    if (!userSummary) return;

    return await fetchUser(userSummary.employeeId.toString());
  });

  const user = userData?.data;

  const userLevel = roles[user?.userLevel as keyof typeof roles] || user?.userLevel;

  return (
    <PageLayout
      pageName="My Profile"
      actionButton={
        <Link href="/my-profile/edit">
          <Button>Edit Profile</Button>
        </Link>
      }
    >
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-5">
          <h2 className="text-md font-bold">Personal Information</h2>
          {!user ? (
            <Shimmer />
          ) : (
            <div>
              <ProfileRow label="Name" value={`${user.firstName} ${user.lastName}`} />
              <ProfileRow label="Email" value={user.email} />
              <ProfileRow label="User Level" value={userLevel} />
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
                value={user.employeeId?.toString() ? `EMP-${user.employeeId?.toString()}` : "N/A"}
              />

              <ProfileRow label="Joined At" value={new Date(user.createdAt).toLocaleDateString()} />
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

const ProfileRow: React.FC<{label: string; value: React.ReactNode}> = ({label, value}) => (
  <div className="flex items-center gap-5 border-t border-border py-4">
    <div className="flex w-[400px] items-center gap-2">
      <div className="textSecondary text-sm font-semiBold">{label}</div>
      <div>:</div>
    </div>
    <div className="textPrimary text-sm">{value}</div>
  </div>
);
