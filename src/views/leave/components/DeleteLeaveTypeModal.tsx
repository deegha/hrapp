import React, {useState} from "react";
import {Button} from "@/components";
import {X} from "react-feather";
import {deleteLeaveType} from "@/services";
import {useNotificationStore} from "@/store/notificationStore";

export const DeleteLeaveTypeModal = ({
  open,
  onClose,
  leaveTypeId,
  onDeleted,
}: {
  open: boolean;
  onClose: () => void;
  leaveTypeId: number | null;
  onDeleted?: () => void;
}) => {
  const {showNotification} = useNotificationStore();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!leaveTypeId) return;
    try {
      setLoading(true);
      await deleteLeaveType(leaveTypeId);
      showNotification({message: "Leave type deleted successfully!", type: "success"});
      onDeleted?.();
      onClose();
    } catch (error) {
      const errorMessage = typeof error === "string" ? error : "Failed to delete leave type";
      showNotification({message: errorMessage, type: "error"});
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Delete Leave Type</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete this leave type? This action cannot be undone and will
            affect any related leave policies.
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <Button onClick={onClose} variant="secondary" disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleDelete} variant="danger" loading={loading}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};
