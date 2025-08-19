import React from "react";
import {useForm} from "react-hook-form";
import {InputField, Button} from "@/components";
import {TCreateEmploymentTypePayload} from "@/types/organization";

interface CreateEmploymentTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TCreateEmploymentTypePayload) => Promise<void>;
}

export const CreateEmploymentTypeModal: React.FC<CreateEmploymentTypeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: {errors, isSubmitting},
  } = useForm<TCreateEmploymentTypePayload>();

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = async (data: TCreateEmploymentTypePayload) => {
    await onSubmit(data);
    reset();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">Create New Employment Type</h2>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <InputField
            label="Type Label"
            {...register("typeLabel", {
              required: "Type label is required",
              minLength: {
                value: 1,
                message: "Type label must be at least 1 character",
              },
              maxLength: {
                value: 50,
                message: "Type label cannot exceed 50 characters",
              },
            })}
            error={errors.typeLabel?.message}
            placeholder="e.g., CONTRACTOR, PART_TIME"
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
