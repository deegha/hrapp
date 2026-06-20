import {useEffect, useState} from "react";
import {useRouter} from "next/router";
import {useAdminAuthStore, initializeAdminAuthStore} from "@/store/adminAuthStore";
import {adminCheckAuthServiceCall} from "@/services/adminService";
import {Button} from "@/components";

export default function AdminPanel() {
  const router = useRouter();
  const {user, logout, isAuthenticated} = useAdminAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    initializeAdminAuthStore();

    const verify = async () => {
      try {
        const res = await adminCheckAuthServiceCall();
        if (res.error) {
          router.push("/admin-panel/login");
        }
      } catch {
        router.push("/admin-panel/login");
      } finally {
        setChecking(false);
      }
    };

    verify();
  }, [router]);

  const handleLogout = () => {
    logout();
    router.push("/admin-panel/login");
  };

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-[#80CBC4] border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-full bg-[#80CBC4]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <span className="font-semibold text-gray-800">Admin Panel</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user?.firstName} {user?.lastName}
            </span>
            <div className="w-28">
              <Button variant="danger" onClick={handleLogout}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="mb-2 text-2xl font-bold text-gray-800">Operations Dashboard</h1>
        <p className="mb-8 text-gray-500">
          Signed in as <span className="font-medium text-gray-700">{user?.email}</span>
        </p>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-1 text-sm font-medium text-gray-500">Role</h2>
            <p className="text-lg font-semibold text-gray-800">{user?.userRole}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
