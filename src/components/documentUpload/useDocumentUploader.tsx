import {useState, useCallback} from "react";
import {useDropzone} from "react-dropzone";

type FileWithUrl = {
  name: string;
  url: string;
};

export const useDocumentUploader = (onUploadComplete: (url: string) => void) => {
  const [uploadedFiles, setUploadedFiles] = useState<FileWithUrl[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setIsUploading(true);

      for (const file of acceptedFiles) {
        if (file.size > 10 * 1024 * 1024) {
          alert("File size should not exceed 10MB.");
          continue;
        }

        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET as string);

          const response = await fetch(
            `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY as string}/upload`,
            {
              method: "POST",
              body: formData,
            },
          );

          const data = await response.json();
          if (data.secure_url) {
            const newFile = {name: file.name, url: data.secure_url};
            setUploadedFiles((prev) => [...prev, newFile]);
            onUploadComplete(data.secure_url);
          } else {
            console.error("Upload failed:", data);
            alert("Upload failed.");
          }
        } catch (error) {
          console.error("Upload error:", error);
          alert("Upload error.");
        }
      }

      setIsUploading(false);
    },
    [onUploadComplete],
  );

  const {getRootProps, getInputProps} = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "application/pdf": [],
    },
    multiple: true,
  });

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return {
    getRootProps,
    getInputProps,
    uploadedFiles,
    removeFile,
    isUploading,
  };
};
