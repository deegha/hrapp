import {Detail, Autocomplete} from "@/components";
import {XCircle} from "react-feather";
import {TDepartment} from "@/types/organization";
import {useState} from "react";

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
}

export function UserDepartment({
  currentDepartment,
  departments,
  onAssignDepartment,
  onRemoveDepartment,
  loading,
  canRemove,
}: IProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const departmentOptions = departments
    .filter((dept) => dept.departmentName.toLowerCase().includes(searchTerm.toLowerCase()))
    .map((dept) => ({
      label: dept.departmentName,
      value: dept.id.toString(),
    }));

  const currentDepartmentOption = currentDepartment
    ? {
        label: currentDepartment.departmentName,
        value: currentDepartment.id.toString(),
      }
    : null;

  return (
    <Detail
      loading={loading}
      label={"Department"}
      value={
        currentDepartment ? (
          <div className="flex items-center gap-2">
            {currentDepartment.departmentName}
            {canRemove && (
              <div
                onClick={onRemoveDepartment}
                className="cursor-pointer font-bold text-red-500 hover:text-red-700"
              >
                <XCircle size={12} />
              </div>
            )}
          </div>
        ) : (
          <Autocomplete
            loading={loading}
            value={currentDepartmentOption}
            options={departmentOptions}
            onSearch={(term) => setSearchTerm(term)}
            onChange={(option) => {
              if (!option) return;
              onAssignDepartment(option.value);
              setSearchTerm("");
            }}
            placeholder="Select department..."
          />
        )
      }
    />
  );
}
