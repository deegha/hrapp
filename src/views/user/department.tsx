import {Detail, Autocomplete} from "@/components";
import {XCircle} from "react-feather";
import {TDepartment} from "@/types/organization";
import {TApproval} from "@/types";
import {useState, useMemo} from "react";

export interface IProps {
  currentDepartment?: {
    id: number;
    departmentName: string;
  };
  departments: TDepartment[];
  onAssignDepartment: (departmentId: string) => void;
  onRemoveDepartment: () => void;
  loading: boolean;
  canRemove: boolean;
  userId: number;
  approvals?: TApproval[];
}

// Helper function to create status badge
const StatusBadge = ({children}: {children: React.ReactNode}) => (
  <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
    {children}
  </span>
);

export function UserDepartment({
  currentDepartment,
  departments,
  onAssignDepartment,
  onRemoveDepartment,
  loading,
  canRemove,
  userId,
  approvals = [],
}: IProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Memoize pending status calculations for better performance
  const {hasPendingAssignment, hasPendingRemoval} = useMemo(() => {
    const departmentApprovals = approvals.filter(
      (approval) => approval.type === "DEPARTMENT_ASSIGNMENT" && approval.targetId === userId,
    );

    return {
      hasPendingAssignment: departmentApprovals.some((approval) => {
        const data = approval.data as {action: "ASSIGN" | "REMOVE"} | null;
        return data?.action === "ASSIGN";
      }),
      hasPendingRemoval: departmentApprovals.some((approval) => {
        const data = approval.data as {action: "ASSIGN" | "REMOVE"} | null;
        return data?.action === "REMOVE";
      }),
    };
  }, [approvals, userId]);

  // Memoize filtered department options
  const departmentOptions = useMemo(
    () =>
      departments
        .filter((dept) => dept.departmentName.toLowerCase().includes(searchTerm.toLowerCase()))
        .map((dept) => ({
          label: dept.departmentName,
          value: dept.id.toString(),
        })),
    [departments, searchTerm],
  );

  const currentDepartmentOption = useMemo(
    () =>
      currentDepartment
        ? {
            label: currentDepartment.departmentName,
            value: currentDepartment.id.toString(),
          }
        : null,
    [currentDepartment],
  );

  const handleDepartmentChange = (option: {label: string; value: string} | null) => {
    if (!option) return;
    onAssignDepartment(option.value);
    setSearchTerm("");
  };

  const renderCurrentDepartment = () => (
    <div className="flex items-center gap-2">
      {currentDepartment?.departmentName}
      {hasPendingRemoval && <StatusBadge>Pending removal</StatusBadge>}
      {canRemove && !hasPendingRemoval && (
        <div
          onClick={onRemoveDepartment}
          className="cursor-pointer font-bold text-red-500 hover:text-red-700"
        >
          <XCircle size={12} />
        </div>
      )}
    </div>
  );

  const renderDepartmentAssignment = () => (
    <div className="flex flex-col gap-2">
      {hasPendingAssignment && <StatusBadge>Pending assignment</StatusBadge>}
      {!hasPendingAssignment && (
        <Autocomplete
          loading={loading}
          value={currentDepartmentOption}
          options={departmentOptions}
          onSearch={setSearchTerm}
          onChange={handleDepartmentChange}
          placeholder="Select department..."
        />
      )}
    </div>
  );

  return (
    <Detail
      loading={loading}
      label="Department"
      value={currentDepartment ? renderCurrentDepartment() : renderDepartmentAssignment()}
    />
  );
}
