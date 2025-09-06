import {Button} from "@/components";

type PendingDocumentSaveProps = {
  title: string;
  onTitleChange: (value: string) => void;
  loading?: boolean;
  onSave: () => void;
  onCancel: () => void;
};

export function PendingDocumentSave({
  title,
  onTitleChange,
  loading = false,
  onSave,
  onCancel,
}: PendingDocumentSaveProps) {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-border p-4">
      <div className="text-sm font-medium">Document ready to save</div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Document Title:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="rounded-md border border-border px-3 py-2 text-sm"
          placeholder="Enter document title"
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={onSave} loading={loading} disabled={!title.trim()}>
          Save Document
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
