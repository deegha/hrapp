import {getAuthToken} from "@/utils/getAuthToken";

export async function downloadWithAuth(resourcePath: string, filename?: string) {
  const base = process.env.NEXT_PUBLIC_API as string;
  const url = new URL(resourcePath, base).toString();

  const response = await fetch(url, {
    headers: {
      authorization: `Bearer ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    // Allow caller to handle 401/other
    throw new Error(response.status === 401 ? "Unauthorized" : "Failed to download document");
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  if (filename) a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}
