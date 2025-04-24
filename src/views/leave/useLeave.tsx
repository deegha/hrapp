import { useState } from "react";
import { useNotificationStore } from "@/store/notificationStore";
import { createLeaveRequest } from "@/services";
import { leaveTypes } from "@/utils/staticValues";

export function useLeave() {
  const [selectedRange, setSelectedRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({ start: null, end: null });
  const [leaveType, setSelectedLeaveType] = useState(leaveTypes[0]);
  const [notes, setNotes] = useState("");
  const [selectedDates, setSelectedDates] = useState<
    Array<{
      date: Date;
      half: "AM" | "PM" | null;
    }>
  >([]);
  const [documents, setDocuments] = useState<Array<string>>();
  const { showNotification } = useNotificationStore();
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
    try {
      const leaves = selectedDates.map((date) => ({
        ...date,
        leaveType: parseInt(leaveType.value),
      }));

      await createLeaveRequest({
        leaves,
        documents,
        note: notes,
      });

      cleanForm();
      setLoading(false);
      showNotification({
        message: "Uploaded successfully!",
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
    setSelectedLeaveType(leaveTypes[0]);
    setSelectedRange({ start: null, end: null });
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
  };
}
