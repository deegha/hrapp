import {Detail} from "@/components";
import {XCircle} from "react-feather";
import {TDepartment} from "@/types/organization";

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
          <div className="flex flex-col gap-2">
            <select
              disabled={loading}
              onChange={(e) => {
                if (e.target.value) {
                  onAssignDepartment(e.target.value);
                }
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
              defaultValue=""
            >
              <option value="" disabled>
                Select department...
              </option>
              {departments?.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.departmentName}
                </option>
              ))}
            </select>
          </div>
        )
      }
    />
  );
}
