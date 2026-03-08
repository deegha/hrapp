import React, {useState} from "react";
import {format} from "date-fns";
import {Trash2} from "react-feather";
import {Button, DatePicker, InputField} from "@/components";
import {useNotificationStore} from "@/store/notificationStore";
import useSWR, {mutate} from "swr";
import {
  fetchHolidays,
  createHoliday,
  deleteHoliday,
  THoliday,
} from "@/services/organizationService";

export function LeaveSettings() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const {showNotification} = useNotificationStore();

  const {data: holidaysData} = useSWR("holidays", fetchHolidays);
  const holidays = holidaysData?.data || [];

  const getHolidayForDate = (date: Date): THoliday | undefined => {
    const dateString = date.toISOString().split("T")[0];
    return holidays.find((h) => h.date.split("T")[0] === dateString);
  };

  const handleDateClick = (date: Date) => {
    const existing = getHolidayForDate(date);
    if (existing) return;

    setSelectedDate(date);
    setName("");
    setDescription("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !selectedDate) return;

    setSaving(true);
    try {
      await createHoliday({
        name: name.trim(),
        date: selectedDate.toISOString(),
        description: description.trim() || undefined,
      });
      showNotification({type: "success", message: "Holiday added"});
      setModalOpen(false);
      mutate("holidays");
    } catch {
      showNotification({type: "error", message: "Failed to add holiday"});
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteHoliday(id);
      showNotification({type: "success", message: "Holiday removed"});
      mutate("holidays");
    } catch {
      showNotification({type: "error", message: "Failed to remove holiday"});
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold">Public Holidays</h2>
        <p className="text-sm text-textSecondary">
          Click on a date to mark it as a public holiday. Holidays will be visible to all employees.
        </p>
      </div>

      <DatePicker
        holidays={holidays.map((h) => ({date: h.date, name: h.name}))}
        onDateClick={handleDateClick}
      />

      {holidays.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-textSecondary">Marked Holidays</h3>
          {holidays.map((holiday) => (
            <div
              key={holiday.id}
              className="flex items-center justify-between rounded-md border border-gray-200 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{holiday.name}</span>
                <span className="text-sm text-textSecondary">
                  {format(new Date(holiday.date), "dd MMM yyyy")}
                </span>
                {holiday.description && (
                  <span className="text-sm text-textSecondary">{holiday.description}</span>
                )}
              </div>
              <button
                onClick={() => handleDelete(holiday.id)}
                className="text-red-400 hover:text-red-600"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              Add Holiday - {selectedDate && format(selectedDate, "dd MMM yyyy")}
            </h2>
            <div className="mb-4 flex flex-col gap-4">
              <InputField
                label="Holiday Name"
                placeholder="e.g. Christmas Day"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                className="bg-white text-black"
              />
              <div className="flex flex-col gap-1">
                <label className="text-sm text-textSecondary">Description (optional)</label>
                <textarea
                  className="rounded-md border border-gray-300 p-2 text-sm focus:border-primary focus:outline-none"
                  placeholder="Add a description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <Button variant="danger" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave} loading={saving}>
                Save Holiday
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
