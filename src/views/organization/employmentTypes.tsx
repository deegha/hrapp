import {useState} from "react";
import {Button, PageLayout, InputField, NoDataFoundComponent} from "@/components";
import useSWR from "swr";
import {
  fetchEmploymentTypes,
  createEmploymentType,
  deleteEmploymentType,
} from "@/services/organizationService";
import {TCreateEmploymentTypePayload} from "@/types/organization";
import {useForm} from "react-hook-form";
import {useNotificationStore} from "@/store/notificationStore";
import {useConfirmationModalStore} from "@/store/useConfirmationModalStore";
import {Trash} from "react-feather";

export function EmploymentTypes() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const {showNotification} = useNotificationStore();
  const {openModal} = useConfirmationModalStore();

  const {data, error, isLoading, mutate} = useSWR("employment-types", fetchEmploymentTypes);

  const {
    register,
    handleSubmit,
    reset,
    formState: {errors, isSubmitting},
  } = useForm<TCreateEmploymentTypePayload>();

  const employmentTypes = data?.data || [];

  const onCreateSubmit = async (formData: TCreateEmploymentTypePayload) => {
    try {
      await createEmploymentType(formData);
      showNotification({
        message: "Employment type created successfully",
        type: "success",
      });
      setIsCreateModalOpen(false);
      reset();
      mutate();
    } catch (error) {
      showNotification({
        message: (error as Error).message || "Failed to create employment type",
        type: "error",
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteEmploymentType(id);
      showNotification({
        message: "Employment type deleted successfully",
        type: "success",
      });
      mutate();
    } catch (error) {
      showNotification({
        message: (error as Error).message || "Failed to delete employment type",
        type: "error",
      });
    }
  };

  const confirmDelete = (id: number) => {
    openModal({
      title: "Delete Employment Type",
      description:
        "Are you sure you want to delete this employment type? This action cannot be undone.",
      onConfirm: () => handleDelete(id),
      onCancel: () => {},
    });
  };

  if (error) return <div>Error loading employment types</div>;

  return (
    <PageLayout
      actionButton={<Button onClick={() => setIsCreateModalOpen(true)}>Add New Type</Button>}
      pageName="Employment Types"
    >
      {isLoading ? (
        <div>Loading...</div>
      ) : employmentTypes.length === 0 ? (
        <NoDataFoundComponent />
      ) : (
        <div className="flex flex-col gap-5">
          {employmentTypes.map((type) => (
            <div
              key={type.id}
              className="group flex cursor-pointer justify-between border-t border-border py-4 transition-colors duration-200 hover:bg-gray-50/50"
            >
              <div className="flex-1">
                <div className="mb-3 flex items-center gap-3">
                  <h3 className="text-base font-semibold text-textPrimary">{type.typeLabel}</h3>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur-sm transition-all duration-200 ${
                      type.organizationId === null
                        ? "border-primary/30 from-primary/15 to-primary/5 hover:shadow-primary/20 bg-gradient-to-r text-primary"
                        : "border-secondary/30 from-secondary/15 to-secondary/5 hover:shadow-secondary/20 bg-gradient-to-r text-secondary"
                    }`}
                  >
                    <div
                      className={`size-2 rounded-full ${
                        type.organizationId === null ? "bg-primary/60" : "bg-secondary/60"
                      }`}
                    />
                    {type.organizationId === null ? "System" : "Custom"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-textSecondary">
                  <svg
                    className="size-4 opacity-60"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>
                    Created{" "}
                    {new Date(type.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
              <div className="text-sm">
                {type.organizationId !== null && (
                  <button
                    onClick={() => confirmDelete(type.id)}
                    className="flex items-center justify-center rounded-md p-2 text-red-500 hover:bg-red-50 hover:text-red-700"
                    title="Delete employment type"
                  >
                    <Trash size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">Create New Employment Type</h2>
            <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-4">
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
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
