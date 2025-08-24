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
  fetchDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "@/services/organizationService";
import {TCreateDepartmentPayload, TUpdateDepartmentPayload} from "@/types/organization";
import {useNotificationStore} from "@/store/notificationStore";
import {useConfirmationModalStore} from "@/store/useConfirmationModalStore";
import {Trash, Edit} from "react-feather";
import {CreateDepartmentModal} from "./createDepartmentModal";
import {UpdateDepartmentModal} from "./updateDepartmentModal";

export function Departments() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<{id: number; name: string} | null>(
    null,
  );
  const {showNotification} = useNotificationStore();
  const {openModal} = useConfirmationModalStore();

  const {data, error, isLoading, mutate} = useSWR("departments", fetchDepartments);

  const departments = data?.data || [];

  const onCreateSubmit = async (formData: TCreateDepartmentPayload) => {
    try {
      await createDepartment(formData);
      showNotification({
        message: "Department created successfully",
        type: "success",
      });
      setIsCreateModalOpen(false);
      mutate();
    } catch (error) {
      showNotification({
        message: (error as Error).message || "Failed to create department",
        type: "error",
      });
    }
  };

  const onUpdateSubmit = async (formData: TUpdateDepartmentPayload) => {
    if (!selectedDepartment) return;

    try {
      await updateDepartment(selectedDepartment.id, formData);
      showNotification({
        message: "Department updated successfully",
        type: "success",
      });
      setIsUpdateModalOpen(false);
      setSelectedDepartment(null);
      mutate();
    } catch (error) {
      showNotification({
        message: (error as Error).message || "Failed to update department",
        type: "error",
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteDepartment(id);
      showNotification({
        message: "Department deleted successfully",
        type: "success",
      });
      mutate();
    } catch (error) {
      showNotification({
        message: (error as Error).message || "Failed to delete department",
        type: "error",
      });
    }
  };

  const confirmDelete = (id: number) => {
    openModal({
      title: "Delete Department",
      description: "Are you sure you want to delete this department? This action cannot be undone.",
      onConfirm: () => handleDelete(id),
      onCancel: () => {},
    });
  };

  const openUpdateModal = (department: {id: number; departmentName: string}) => {
    setSelectedDepartment({id: department.id, name: department.departmentName});
    setIsUpdateModalOpen(true);
  };

  if (error) {
    return (
      <PageLayout pageName="Departments">
        <ErrorDisplay message={(error as Error).message || "Error loading departments"} />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      actionButton={<Button onClick={() => setIsCreateModalOpen(true)}>Add New Department</Button>}
      pageName="Departments"
    >
      {isLoading ? (
        <EmploymentTypesShimmer />
      ) : departments.length === 0 ? (
        <NoDataFoundComponent />
      ) : (
        <div className="flex flex-col">
          {departments.map((department) => (
            <div
              key={department.id}
              onClick={() => {}}
              className="flex cursor-pointer justify-between border-t border-border py-3"
            >
              <div>
                <p className="text-sm font-semibold">{department.departmentName}</p>
                <div className="flex gap-2 text-sm text-textSecondary">
                  <div className="text-xs text-textSecondary">
                    Created{" "}
                    {new Date(department.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openUpdateModal(department)}
                  className="flex items-center justify-center rounded-md p-2 text-blue-500 hover:bg-blue-50 hover:text-blue-700"
                  title="Edit department"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => confirmDelete(department.id)}
                  className="flex items-center justify-center rounded-md p-2 text-red-500 hover:bg-red-50 hover:text-red-700"
                  title="Delete department"
                >
                  <Trash size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateDepartmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={onCreateSubmit}
      />

      <UpdateDepartmentModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedDepartment(null);
        }}
        onSubmit={onUpdateSubmit}
        initialName={selectedDepartment?.name || ""}
      />
    </PageLayout>
  );
}
