import {X} from "react-feather";

interface IDrawer {
  open: boolean;
  children: React.ReactNode;
  close: () => void;
}

export function Drawer({open, children, close}: IDrawer) {
  return (
    <div className="relative">
      {open && <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={close} />}

      <div
        // eslint-disable-next-line tailwindcss/migration-from-tailwind-2
        className={`fixed right-0 top-0 z-50 h-full w-[560px] transform rounded-l-lg bg-white p-5 shadow-lg transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex w-full cursor-pointer justify-end text-textSecondary">
          <X onClick={close} />
        </div>
        <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 mt-4 max-h-[calc(100vh-60px)] overflow-y-auto py-5 pr-2">
          {children}
        </div>
      </div>
    </div>
  );
}
