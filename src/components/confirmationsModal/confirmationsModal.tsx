import {useConfirmationModalStore} from "@/store/useConfirmationModalStore";
import {Button} from "@/components";

export function ConfirmationsModal() {
  const {isOpen, title, description, onConfirm, onCancel, closeModal} = useConfirmationModalStore();

  if (!isOpen) return null;

  const handleCancel = () => {
    onCancel?.();
    closeModal();
  };

  const handleConfirm = () => {
    onConfirm();
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">{title}</h2>
        <p className="mb-6 text-gray-600">{description}</p>
        <div className="flex justify-end space-x-3">
          <Button variant="danger" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirm}>
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}
