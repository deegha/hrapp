import { X } from "react-feather";

interface IDrawer {
  open: boolean;
  children: React.ReactNode;
  close: () => void;
}

export function Drawer({ open, children, close }: IDrawer) {
  return (
    <div
      className={`fixed top-0 right-0 h-full w-[560px] bg-white shadow-lg rounded-lg transform transition-transform duration-300 ease-out p-5 ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="w-full flex justify-end text-textSecondary cursor-pointer ">
        <X onClick={close} />
      </div>
      <div className="py-5"> {children}</div>
    </div>
  );
}
