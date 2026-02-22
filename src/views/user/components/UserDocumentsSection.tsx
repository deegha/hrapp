import {useEffect, useState} from "react";
import {Trash} from "react-feather";
import {DocumentUploader} from "@/components/documentUpload/documentUpload";
import {PendingDocumentSave} from "@/components/documentUpload/pendingDocumentSave";
import {useNotificationStore} from "@/store/notificationStore";
import {useConfirmationModalStore} from "@/store/useConfirmationModalStore";
import {
  addUserDocument,
  deleteUserDocument,
  downloadEmployeeDocument,
} from "@/services/userService";

type TDocument = {
  id: number;
  title: string;
  fileUrl: string;
  createdAt: string;
};

interface UserDocumentsSectionProps {
  userId: number;
  documents?: TDocument[];
  canUpload: boolean;
  isAdmin: boolean;
  onChanged: () => void | Promise<void>;
}

export function UserDocumentsSection({
  userId,
  documents,
  canUpload,
  isAdmin,
  onChanged,
}: UserDocumentsSectionProps) {
  const {showNotification} = useNotificationStore();
  const {openModal} = useConfirmationModalStore();
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [documentTitle, setDocumentTitle] = useState("");
  const [pendingDocumentUrl, setPendingDocumentUrl] = useState("");
  const [uploaderKey, setUploaderKey] = useState(0);

  const handleDocumentUpload = async (url: string) => {
    const filename = url.split("/").pop() || "";
    const nameWithoutExtension = filename.split(".").slice(0, -1).join(".");
    setDocumentTitle(nameWithoutExtension);
    setPendingDocumentUrl(url);
  };

  const saveDocument = async () => {
    if (!documentTitle.trim() || !pendingDocumentUrl) return;
    try {
      setUploadingDocument(true);
      const response = await addUserDocument(userId, documentTitle.trim(), pendingDocumentUrl);
      if (response.error) {
        showNotification({type: "error", message: "Failed to save document"});
        return;
      }
      await onChanged();
      showNotification({type: "success", message: "Document uploaded successfully"});
      setDocumentTitle("");
      setPendingDocumentUrl("");
      // reset the uploader preview list
      setUploaderKey((k) => k + 1);
    } catch {
      showNotification({type: "error", message: "Failed to save document"});
    } finally {
      setUploadingDocument(false);
    }
  };

  // Clear any pending upload when switching users
  useEffect(() => {
    setDocumentTitle("");
    setPendingDocumentUrl("");
    setUploaderKey((k) => k + 1);
  }, [userId]);

  const handleDeleteDocument = (documentId: number, title: string) => {
    openModal({
      title: "Delete document?",
      description: `Are you sure you want to delete "${title}"?`,
      onConfirm: async () => {
        try {
          const response = await deleteUserDocument(userId, documentId);
          if (response.error) {
            showNotification({type: "error", message: "Failed to delete document"});
            return;
          }
          await onChanged();
          showNotification({type: "success", message: "Document deleted successfully"});
        } catch {
          showNotification({type: "error", message: "Failed to delete document"});
        }
      },
    });
  };

  const getDownloadName = (fileUrl: string, title: string) => {
    const ext = (() => {
      try {
        const p = new URL(fileUrl).pathname;
        return (p.split(".").pop() || "").toLowerCase();
      } catch {
        return (fileUrl.split(".").pop() || "").toLowerCase();
      }
    })();
    const safeExt = ext ? `.${ext}` : "";
    return `${title}${safeExt}`;
  };

  return (
    <div className="flex flex-col gap-3">
      <h2>Documents</h2>
      {documents && documents.length > 0 && (
        <div>
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between border-t border-border py-3"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{doc.title}</div>
                {canUpload && (
                  <button
                    onClick={async () => {
                      const name = getDownloadName(doc.fileUrl, doc.title);
                      try {
                        await downloadEmployeeDocument(userId, doc.id, name);
                      } catch {
                        showNotification({
                          type: "error",
                          message: "Failed to download document",
                        });
                      }
                    }}
                    className="text-left text-xs text-blue-500 underline"
                  >
                    Download
                  </button>
                )}
              </div>
              {isAdmin && (
                <button
                  onClick={() => handleDeleteDocument(doc.id, doc.title)}
                  className="text-red-500 transition hover:text-red-700"
                >
                  <Trash size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {canUpload && (
        <div className="flex flex-col gap-3">
          <h3>Upload New Document</h3>
          <DocumentUploader key={uploaderKey} onUploadComplete={handleDocumentUpload} />

          {pendingDocumentUrl && (
            <PendingDocumentSave
              title={documentTitle}
              onTitleChange={setDocumentTitle}
              loading={uploadingDocument}
              onSave={saveDocument}
              onCancel={() => {
                setDocumentTitle("");
                setPendingDocumentUrl("");
                setUploaderKey((k) => k + 1);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
