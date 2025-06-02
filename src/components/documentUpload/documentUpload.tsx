import {useDocumentUploader} from "./useDocumentUploader";
import {Upload, Trash} from "react-feather";
import {cn} from "@/utils/cn";

type DocumentUploaderProps = {
  onUploadComplete: (url: string) => void;
};

export const DocumentUploader = ({onUploadComplete}: DocumentUploaderProps) => {
  const {getRootProps, getInputProps, uploadedFiles, removeFile, isUploading} =
    useDocumentUploader(onUploadComplete);

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={cn(
          "relative cursor-pointer rounded-md border-2 border-dashed border-border p-8 text-center transition hover:border-gray-400",
          isUploading && "pointer-events-none opacity-50",
        )}
      >
        <input {...getInputProps()} />

        {isUploading && (
          <div className="bg-white/70 absolute inset-0 z-10 flex items-center justify-center rounded-2xl">
            <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        )}

        <div className={cn("flex flex-col items-center justify-center", isUploading && "blur-sm")}>
          <Upload className="mb-4 size-10 text-textSecondary" />
          <p className="text-textSecondary">Drag & drop files here, or click to select files</p>
          <p className="mt-2 text-sm text-textSecondary">(JPG, PNG, PDF. Max size 10MB)</p>
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="mt-6 space-y-4">
          {uploadedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-xl border bg-gray-50 p-4"
            >
              <div className="flex items-center gap-3">
                <a
                  href={file.url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-blue-600 hover:underline"
                >
                  {file.name}
                </a>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="text-red-500 transition hover:text-red-700"
              >
                <Trash size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
