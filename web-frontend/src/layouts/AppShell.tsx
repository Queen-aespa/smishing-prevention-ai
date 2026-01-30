import { useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Shield, Bell } from "lucide-react";
import { BottomNav } from "@/app/components/BottomNav";
import { Toaster } from "@/app/components/ui/sonner";

const tabToPath: Record<string, string> = {
  search: "/search",
  report: "/report",
  profile: "/profile",
};

const pathToTab: Record<string, string> = {
  "/search": "search",
  "/report": "report",
  "/profile": "profile",
};

export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = useMemo(() => {
    const match = Object.keys(pathToTab).find((path) =>
      location.pathname.startsWith(path)
    );
    return match ? pathToTab[match] : "search";
  }, [location.pathname]);

  const handleTabChange = (tab: string) => {
    const target = tabToPath[tab] ?? "/search";
    navigate(target);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Toaster />

      <div className="max-w-md mx-auto bg-white dark:bg-gray-950 min-h-screen shadow-2xl border-x border-gray-200 dark:border-gray-800">
        <div className="sticky top-0 z-40 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 px-6 py-4 shadow-sm border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gray-900 text-white dark:bg-white dark:text-gray-900 p-2 rounded-xl">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold">범죄자 조회</h1>
                <p className="text-xs text-gray-500">안전한 생활을 위해</p>
              </div>
            </div>
            <button className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="pb-20 overflow-y-auto">
          <Outlet />
        </div>

        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    </div>
  );
}
