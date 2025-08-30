import {useState} from "react";
import {Button} from "@/components";
import {ArrowUp} from "react-feather";
import {useNotificationStore} from "@/store/notificationStore";
import {useConfirmationModalStore} from "@/store/useConfirmationModalStore";
import {updateEmploymentType} from "@/services/userService";

type EmploymentType = {id: number; typeLabel: string};

interface EmploymentTypePromotionProps {
  employeeId: number;
  currentType?: EmploymentType | null;
  employmentTypes?: EmploymentType[];
  userName: string;
  userStatus?: string;
  onPromoted: () => void | Promise<void>;
}

export function EmploymentTypePromotion({
  employeeId,
  currentType,
  employmentTypes,
  userName,
  userStatus,
  onPromoted,
}: EmploymentTypePromotionProps) {
  const {showNotification} = useNotificationStore();
  const {openModal} = useConfirmationModalStore();
  const [loading, setLoading] = useState(false);

  const getNextEmploymentType = () => {
    if (!currentType || !employmentTypes) return null;
    const transitions: Record<string, string> = {INTERN: "PROBATION", PROBATION: "FULLTIME"};
    const nextTypeLabel = transitions[currentType.typeLabel];
    if (!nextTypeLabel) return null;
    return employmentTypes.find((t) => t.typeLabel === nextTypeLabel) || null;
  };

  const nextType = getNextEmploymentType();
  const canPromote = nextType && userStatus === "APPROVED";

  const handleEmploymentTypeTransition = () => {
    if (!nextType) return;
    openModal({
      title: `Promote to ${nextType.typeLabel}?`,
      description: `Are you sure you want to promote ${userName} from ${currentType?.typeLabel} to ${nextType.typeLabel}?`,
      onConfirm: async () => {
        try {
          setLoading(true);
          const response = await updateEmploymentType(employeeId, nextType.id);
          if (response.error) {
            showNotification({
              type: "error",
              message: "Something went wrong when updating employment type",
            });
            return;
          }
          await onPromoted();
          showNotification({
            type: "success",
            message: `Successfully promoted to ${nextType.typeLabel}`,
          });
        } catch {
          showNotification({
            type: "error",
            message: "Something went wrong when updating employment type",
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  if (!canPromote) return null;

  return (
    <Button variant="secondary" onClick={handleEmploymentTypeTransition} loading={loading}>
      <div className="flex items-center gap-1">
        <ArrowUp size={14} />
        Promote to {nextType?.typeLabel}
      </div>
    </Button>
  );
}
