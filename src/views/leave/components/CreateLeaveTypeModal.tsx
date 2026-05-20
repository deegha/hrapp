import React, {useEffect, useMemo, useState} from "react";
import {Button, InputField} from "@/components";
import {X} from "react-feather";
import {PolicyDropdown} from "./PolicyDropdown";
import {EmploymentDaysEditor} from "./EmploymentDaysEditor";
import {useNotificationStore} from "@/store/notificationStore";
import {createLeaveType} from "@/services";
import {TCreateLeaveTypePayload} from "@/types";

type EmploymentType = {typeLabel: string};

export const CreateLeaveTypeModal = ({
  open,
  onClose,
  employmentTypes,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  employmentTypes: EmploymentType[];
  onCreated?: () => void;
}) => {
  const {showNotification} = useNotificationStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<TCreateLeaveTypePayload>({
    name: "",
    daysPerYear: 10,
    accrualType: "ALL_FROM_DAY_1",
    canCarryForward: false,
    applicableGender: "ALL",
    daysPerEmploymentType: {},
  });

  const accrualOptions = useMemo(
    () => [
      {label: "All from Day 1", value: "ALL_FROM_DAY_1"},
      {label: "Half Day per Month", value: "HALF_DAY_PER_MONTH"},
    ],
    [],
  );

  const carryForwardOptions = useMemo(
    () => [
      {label: "Not Allowed", value: "false"},
      {label: "Allowed", value: "true"},
    ],
    [],
  );

  const genderOptions = useMemo(
    () => [
      {label: "All Employees", value: "ALL"},
      {label: "Female Only", value: "FEMALE"},
      {label: "Male Only", value: "MALE"},
    ],
    [],
  );

  useEffect(() => {
    if (!open) return;
    if (employmentTypes.length > 0) {
      const defaultDays: Record<string, number> = {};
      employmentTypes.forEach((typeItem) => (defaultDays[typeItem.typeLabel] = 10));
      setForm((prev) => ({...prev, daysPerEmploymentType: defaultDays}));
    }
  }, [open, employmentTypes]);

  const handleCreate = async () => {
    try {
      setLoading(true);
      await createLeaveType(form);
      showNotification({message: "Leave type created successfully!", type: "success"});
      onCreated?.();
      onClose();
      const defaults: Record<string, number> = {};
      employmentTypes.forEach((typeItem) => (defaults[typeItem.typeLabel] = 10));
      setForm({
        name: "",
        daysPerYear: 10,
        accrualType: "ALL_FROM_DAY_1",
        canCarryForward: false,
        applicableGender: "ALL",
        daysPerEmploymentType: defaults,
      });
    } catch (error) {
      const errorMessage = typeof error === "string" ? error : "Failed to create leave type";
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
        className="flex max-h-[90vh] w-full max-w-md flex-col rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-lg font-semibold text-gray-800">Create New Leave Type</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto px-6 pb-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Leave Type Name</label>
            <InputField
              value={form.name}
              onChange={(e) => setForm((prev) => ({...prev, name: e.target.value}))}
              placeholder="e.g., Paternity Leave"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Days Per Employment Type
            </label>
            <EmploymentDaysEditor
              employmentTypes={employmentTypes}
              daysByType={form.daysPerEmploymentType}
              fallback={10}
              onChange={(label, days) =>
                setForm((prev) => ({
                  ...prev,
                  daysPerEmploymentType: {...prev.daysPerEmploymentType, [label]: days},
                }))
              }
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Accrual Type</label>
            <PolicyDropdown
              value={form.accrualType}
              options={accrualOptions}
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  accrualType: value as "ALL_FROM_DAY_1" | "HALF_DAY_PER_MONTH",
                }))
              }
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Carry Forward</label>
            <PolicyDropdown
              value={form.canCarryForward.toString()}
              options={carryForwardOptions}
              onChange={(value) =>
                setForm((prev) => ({...prev, canCarryForward: value === "true"}))
              }
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Applicable To</label>
            <PolicyDropdown
              value={form.applicableGender}
              options={genderOptions}
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  applicableGender: value as "ALL" | "FEMALE" | "MALE",
                }))
              }
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 border-t border-gray-100 p-6 pt-4">
          <Button onClick={onClose} variant="secondary" disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            variant="primary"
            loading={loading}
            disabled={!form.name.trim()}
          >
            Create Leave Type
          </Button>
        </div>
      </div>
    </div>
  );
};
