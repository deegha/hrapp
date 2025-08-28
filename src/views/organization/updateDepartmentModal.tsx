import React, {useEffect} from "react";
import {useForm} from "react-hook-form";
import {InputField, Button} from "@/components";
import {TUpdateDepartmentPayload} from "@/types/organization";

interface UpdateDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TUpdateDepartmentPayload) => Promise<void>;
  initialName: string;
}

export const UpdateDepartmentModal: React.FC<UpdateDepartmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialName,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: {errors, isSubmitting},
  } = useForm<TUpdateDepartmentPayload>();

  useEffect(() => {
    if (isOpen && initialName) {
      setValue("departmentName", initialName);
    }
  }, [isOpen, initialName, setValue]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = async (data: TUpdateDepartmentPayload) => {
    await onSubmit(data);
    reset();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">Update Department</h2>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <InputField
            label="Department Name"
            {...register("departmentName", {
              required: "Department name is required",
              minLength: {
                value: 1,
                message: "Department name must be at least 1 character",
              },
              maxLength: {
                value: 100,
                message: "Department name cannot exceed 100 characters",
              },
            })}
            error={errors.departmentName?.message}
            placeholder="e.g., Human Resources, Engineering"
          />
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
