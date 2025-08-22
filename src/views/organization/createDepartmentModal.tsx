import React from "react";
import {useForm} from "react-hook-form";
import {InputField, Button} from "@/components";
import {TCreateDepartmentPayload} from "@/types/organization";

interface CreateDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TCreateDepartmentPayload) => Promise<void>;
}

export const CreateDepartmentModal: React.FC<CreateDepartmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: {errors, isSubmitting},
  } = useForm<TCreateDepartmentPayload>();

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = async (data: TCreateDepartmentPayload) => {
    await onSubmit(data);
    reset();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">Create New Department</h2>
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
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
