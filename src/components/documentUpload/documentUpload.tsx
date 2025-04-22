import { useDocumentUploader } from "./useDocumentUploader";
import { Upload, Trash } from "react-feather";
import { cn } from "@/utils/cn";

type DocumentUploaderProps = {
  onUploadComplete: (url: string) => void;
};

export const DocumentUploader = ({
  onUploadComplete,
}: DocumentUploaderProps) => {
  const {
    getRootProps,
    getInputProps,
    uploadedFiles,
    removeFile,
    isUploading,
  } = useDocumentUploader(onUploadComplete);

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed border-border rounded-md p-8 text-center cursor-pointer hover:border-gray-400 transition relative",
          isUploading && "opacity-50 pointer-events-none"
        )}
      >
        <input {...getInputProps()} />

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 rounded-2xl z-10">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <div
          className={cn(
            "flex flex-col items-center justify-center",
            isUploading && "blur-sm"
          )}
        >
          <Upload className="h-10 w-10 text-textSecondary mb-4" />
          <p className="text-textSecondary">
            Drag & drop files here, or click to select files
          </p>
          <p className="text-sm text-textSecondary mt-2">
            (JPG, PNG, PDF. Max size 10MB)
          </p>
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="mt-6 space-y-4">
          {uploadedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-50 rounded-xl p-4 border"
            >
              <div className="flex items-center gap-3">
                <a
                  href={file.url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {file.name}
                </a>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="text-red-500 hover:text-red-700 transition"
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
