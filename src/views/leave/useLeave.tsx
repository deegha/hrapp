import {useState} from "react";
import {useNotificationStore} from "@/store/notificationStore";
import {createLeaveRequest} from "@/services";
import {useLeaveTypes} from "@/hooks/useLeaveTypes";
import {useLeaveBalance} from "@/hooks/useLeaveBalance";
import {useBookedDates} from "@/hooks/useBookedDates";

export function useLeave() {
  const {leaveTypes} = useLeaveTypes();
  const {leaveBalance} = useLeaveBalance();
  const {bookedDates} = useBookedDates();

  const [selectedRange, setSelectedRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({start: null, end: null});
  const [leaveType, setSelectedLeaveType] = useState<{label: string; value: string}>({
    label: "",
    value: "",
  });
  const [notes, setNotes] = useState("");
  const [selectedDates, setSelectedDates] = useState<
    Array<{
      date: Date;
      half: "AM" | "PM" | null;
    }>
  >([]);
  const [documents, setDocuments] = useState<Array<string>>();
  const {showNotification} = useNotificationStore();
  const [loading, setLoading] = useState(false);

  // Update selected leave type when leave types are loaded
  useState(() => {
    if (leaveTypes.length > 0 && !leaveType.value) {
      setSelectedLeaveType({label: leaveTypes[0].label, value: leaveTypes[0].value});
    }
  });

  const handleDocumentUpload = (url: string) => {
    if (!url) {
      showNotification({
        message: "Something went wrong when uploading image please try again",
        type: "error",
      });
    }

    const newDocs = documents ? [...documents] : [];
    newDocs?.push(url);

    setDocuments(newDocs);
  };

  const onSubmit = async () => {
    // Check if selected leave type has remaining days
    const selectedLeaveTypeBalance = leaveBalance?.leaveTypeBalances?.find(
      (balance) => balance.id === parseInt(leaveType.value),
    );

    const requestedDays = selectedDates.reduce((total, date) => {
      return total + (date.half ? 0.5 : 1);
    }, 0);

    if (selectedLeaveTypeBalance && selectedLeaveTypeBalance.remainingDays < requestedDays) {
      showNotification({
        message: `Insufficient ${selectedLeaveTypeBalance.name} balance. You have ${selectedLeaveTypeBalance.remainingDays} days remaining but requested ${requestedDays} days.`,
        type: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const leaves = selectedDates.map((date) => ({
        ...date,
        leaveType: parseInt(leaveType.value),
      }));

      const response = await createLeaveRequest({
        leaves,
        documents,
        note: notes,
      });

      if (response.error) {
        cleanForm();
        setLoading(false);
        showNotification({
          message: "Leave request unsuccessful!",
          type: "error",
        });

        return;
      }

      cleanForm();
      setLoading(false);
      showNotification({
        message: "Leave requested successfully!",
        type: "success",
      });
    } catch {
      setLoading(false);
      console.log("here we are");
      showNotification({
        message: "Something went wrong when submitting request",
        type: "error",
      });
    }
  };

  const cleanForm = () => {
    setDocuments([]);
    setSelectedDates([]);
    setSelectedLeaveType(
      leaveTypes.length > 0
        ? {label: leaveTypes[0].label, value: leaveTypes[0].value}
        : {label: "", value: ""},
    );
    setSelectedRange({start: null, end: null});
  };

  const getSelectedLeaveTypeBalance = () => {
    return leaveBalance?.leaveTypeBalances?.find(
      (balance) => balance.id === parseInt(leaveType.value),
    );
  };

  const hasNoRemainingDays = () => {
    const balance = getSelectedLeaveTypeBalance();
    return balance && balance.remainingDays <= 0;
  };

  return {
    handleDocumentUpload,
    onSubmit,
    cleanForm,
    selectedRange,
    setNotes,
    loading,
    selectedDates,
    setSelectedRange,
    setSelectedDates,
    notes,
    leaveType,
    setSelectedLeaveType,
    leaveTypes,
    leaveBalance,
    bookedDates,
    getSelectedLeaveTypeBalance,
    hasNoRemainingDays,
  };
}
