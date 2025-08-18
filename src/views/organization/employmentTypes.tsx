import {useState} from "react";
import {
  Button,
  PageLayout,
  NoDataFoundComponent,
  EmploymentTypesShimmer,
  ErrorDisplay,
} from "@/components";
import useSWR from "swr";
import {
  fetchEmploymentTypes,
  createEmploymentType,
  deleteEmploymentType,
} from "@/services/organizationService";
import {TCreateEmploymentTypePayload} from "@/types/organization";
import {useNotificationStore} from "@/store/notificationStore";
import {useConfirmationModalStore} from "@/store/useConfirmationModalStore";
import {Trash} from "react-feather";
import {CreateEmploymentTypeModal} from "./createEmploymentTypeModal";

export function EmploymentTypes() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const {showNotification} = useNotificationStore();
  const {openModal} = useConfirmationModalStore();

  const {data, error, isLoading, mutate} = useSWR("employment-types", fetchEmploymentTypes);

  const employmentTypes = data?.data || [];

  const onCreateSubmit = async (formData: TCreateEmploymentTypePayload) => {
    try {
      await createEmploymentType(formData);
      showNotification({
        message: "Employment type created successfully",
        type: "success",
      });
      setIsCreateModalOpen(false);
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

  if (error) {
    return (
      <PageLayout pageName="Employment Types">
        <ErrorDisplay message={(error as Error).message || "Error loading employment types"} />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      actionButton={<Button onClick={() => setIsCreateModalOpen(true)}>Add New Type</Button>}
      pageName="Employment Types"
    >
      {isLoading ? (
        <EmploymentTypesShimmer />
      ) : employmentTypes.length === 0 ? (
        <NoDataFoundComponent />
      ) : (
        <div className="flex flex-col">
          {employmentTypes.map((type) => (
            <div
              key={type.id}
              onClick={() => {}}
              className="flex cursor-pointer justify-between border-t border-border py-3"
            >
              <div>
                <p className="text-sm font-semibold">{type.typeLabel}</p>
                <div className="flex gap-2 text-sm text-textSecondary">
                  <div className="text-xs text-textSecondary">
                    Created{" "}
                    {new Date(type.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>
              <div className="text-sm">
                {type.organizationId === null ? (
                  <div className="inline-block rounded-md bg-primary px-[6px] py-[2px] text-xxs font-medium text-white">
                    System
                  </div>
                ) : (
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

      <CreateEmploymentTypeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={onCreateSubmit}
      />
    </PageLayout>
  );
}
