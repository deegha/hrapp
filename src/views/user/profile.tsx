import {PageLayout, Button, StatusTag, Shimmer} from "@/components";
import {fetchUser} from "@/services";
import {getAuthUser} from "@/utils/getAuthUser";
import useSWR, {mutate} from "swr";
import Link from "next/link";
import {roles} from "@/utils/staticValues";
import {DocumentUploader} from "@/components/documentUpload/documentUpload";
import {PendingDocumentSave} from "@/components/documentUpload/pendingDocumentSave";
import {createMyDocument, deleteMyDocument, downloadMyDocument} from "@/services/userService";
import {useNotificationStore} from "@/store/notificationStore";
import {useConfirmationModalStore} from "@/store/useConfirmationModalStore";
import {useState} from "react";
import {Trash} from "react-feather";

export function UserProfile() {
  const {showNotification} = useNotificationStore();
  const {openModal} = useConfirmationModalStore();
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [documentTitle, setDocumentTitle] = useState("");
  const [pendingDocumentUrl, setPendingDocumentUrl] = useState("");
  const [uploaderKey, setUploaderKey] = useState(0);

  const {data: userData} = useSWR(`fetch-auth-user`, async () => {
    const userSummary = await getAuthUser();

    if (!userSummary) return;

    return await fetchUser(userSummary.employeeId.toString());
  });

  const user = userData?.data;

  const userLevel = roles[user?.userLevel as keyof typeof roles] || user?.userLevel;

  const handleDocumentUpload = async (url: string) => {
    // Extract filename without extension as default title
    const filename = url.split("/").pop() || "";
    const nameWithoutExtension = filename.split(".").slice(0, -1).join(".");
    setDocumentTitle(nameWithoutExtension);
    setPendingDocumentUrl(url);
  };

  const saveDocument = async () => {
    if (!documentTitle.trim() || !pendingDocumentUrl) return;

    try {
      setUploadingDocument(true);
      const response = await createMyDocument(documentTitle.trim(), pendingDocumentUrl);

      if (response.error) {
        showNotification({
          type: "error",
          message: "Failed to save document",
        });
        return;
      }

      await mutate("fetch-auth-user");
      showNotification({
        type: "success",
        message: "Document uploaded successfully",
      });

      setDocumentTitle("");
      setPendingDocumentUrl("");
      setUploaderKey((k) => k + 1);
    } catch {
      showNotification({
        type: "error",
        message: "Failed to save document",
      });
    } finally {
      setUploadingDocument(false);
    }
  };

  const handleDeleteDocument = (documentId: number, title: string) => {
    openModal({
      title: "Delete document?",
      description: `Are you sure you want to delete "${title}"?`,
      onConfirm: async () => {
        try {
          const response = await deleteMyDocument(documentId);

          if (response.error) {
            showNotification({
              type: "error",
              message: "Failed to delete document",
            });
            return;
          }

          await mutate("fetch-auth-user");
          showNotification({
            type: "success",
            message: "Document deleted successfully",
          });
        } catch {
          showNotification({
            type: "error",
            message: "Failed to delete document",
          });
        }
      },
    });
  };

  return (
    <PageLayout
      pageName="My Profile"
      actionButton={
        <Link href="/my-profile/edit">
          <Button>Edit Profile</Button>
        </Link>
      }
    >
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-5">
          <h2 className="text-md font-bold">Personal Information</h2>
          {!user ? (
            <Shimmer />
          ) : (
            <div>
              <ProfileRow label="Name" value={`${user.firstName} ${user.lastName}`} />
              <ProfileRow label="Email" value={user.email} />
              <ProfileRow label="User Level" value={userLevel} />
              <ProfileRow
                label="Status"
                value={
                  user.UserStatus?.statusLabel ? (
                    <StatusTag status={user.UserStatus?.statusLabel} />
                  ) : (
                    "N/A"
                  )
                }
              />
              <ProfileRow
                label="Employee ID"
                value={user.employeeId?.toString() ? `EMP-${user.employeeId?.toString()}` : "N/A"}
              />

              <ProfileRow
                label="Managed by"
                value={user.manager ? `${user.manager.firstName} ${user.manager.lastName}` : "N/A"}
              />

              <ProfileRow label="Joined At" value={new Date(user.createdAt).toLocaleDateString()} />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <h2 className="text-md font-bold">My Documents</h2>
          {!user ? (
            <Shimmer />
          ) : (
            <div className="flex flex-col gap-4">
              {user.documents && user.documents.length > 0 && (
                <div>
                  {user.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between border-t border-border py-3"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">{doc.title}</div>
                        <button
                          onClick={async () => {
                            const ext = (() => {
                              try {
                                const p = new URL(doc.fileUrl).pathname;
                                return (p.split(".").pop() || "").toLowerCase();
                              } catch {
                                return (doc.fileUrl.split(".").pop() || "").toLowerCase();
                              }
                            })();
                            const safeExt = ext ? `.${ext}` : "";
                            const name = `${doc.title}${safeExt}`;
                            try {
                              await downloadMyDocument(doc.id, name);
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
                      </div>
                      <button
                        onClick={() => handleDeleteDocument(doc.id, doc.title)}
                        className="text-red-500 transition hover:text-red-700"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-medium">Upload New Document</h3>
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
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

const ProfileRow: React.FC<{label: string; value: React.ReactNode}> = ({label, value}) => (
  <div className="flex items-center gap-5 border-t border-border py-3">
    <div className="flex w-[400px] items-center gap-2">
      <div className="textSecondary text-sm font-semiBold">{label}</div>
      <div>:</div>
    </div>
    <div className="textPrimary text-sm">{value}</div>
  </div>
);
