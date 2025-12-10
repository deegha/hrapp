import {Button} from "@/components";
import {useMyDetails} from "@/hooks/useMydetails";
import moment from "moment";
import QRCode from "react-qr-code";

interface IAttendanceQRModal {
  isOpen: boolean;
  onClose: () => void;
}

export function AttendanceQRModal({isOpen, onClose}: IAttendanceQRModal) {
  const details = useMyDetails();
  const qrValue = "https://example.com";

  console.log(details, "dd");

  function handleClose() {
    onClose();
  }

  const today = moment().format("DD, MM, YYYY");

  if (!isOpen) return null;
  return (
    <div>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm">
        <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-xl bg-white p-6 shadow-xl">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Mark your attendance</h2>
          <p className="text-sm text-textSecondary">Marking attendance for {today}</p>

          <div className="flex w-full items-center justify-center">
            <QRCode value={qrValue} size={256} />
          </div>

          <p className="text-sm text-textSecondary">
            Show this code to your manager to mark attendance
          </p>
          <div>
            <Button type="button" variant="secondary" onClick={handleClose}>
              Close modal
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
