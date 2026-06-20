import {useRouter} from "next/router";
import {ItemsList} from "@/components";
import {TAdminOrganization} from "@/services/adminService";
import {Users} from "react-feather";

interface IProps {
  organizations: TAdminOrganization[];
}

export function OrganizationsList({organizations}: IProps) {
  const router = useRouter();

  return (
    <div>
      {organizations.map((org) => (
        <ItemsList
          key={org.id}
          onClick={() => router.push(`/admin-panel/organizations/${org.id}`)}
          title={org.organizationName}
          content={
            <span className="flex items-center gap-1">
              <Users size={11} />
              {org.activeUserCount} active {org.activeUserCount === 1 ? "user" : "users"}
            </span>
          }
        />
      ))}
    </div>
  );
}
