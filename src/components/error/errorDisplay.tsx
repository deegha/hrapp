import React from "react";
import {AlertCircle} from "react-feather";

interface ErrorDisplayProps {
  message?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  message = "Something went wrong. Please try again.",
}) => {
  return (
    <div className="flex animate-appear flex-col items-center justify-center rounded-md border border-border bg-background p-8 text-center shadow-sm">
      <div className="mb-4 rounded-full bg-red-100 p-3">
        <AlertCircle className="size-8 text-red-600" />
      </div>
      <div className="mb-2 text-sm text-textSecondary">Error</div>
      <p className="text-md font-semiBold text-textPrimary">{message}</p>
    </div>
  );
};

export default ErrorDisplay;
