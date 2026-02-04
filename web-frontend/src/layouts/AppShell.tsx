import { useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Shield, Bell, LogOut } from "lucide-react";
import { BottomNav } from "@/app/components/BottomNav";
import { Toaster } from "@/app/components/ui/sonner";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase";

const tabToPath: Record<string, string> = {
  home: "/home",
  community: "/community",
  profile: "/profile",
};

const pathToTab: Record<string, string> = {
  "/home": "home",
  "/community": "community",
  "/profile": "profile",
};

const headerMap: Record<
  string,
  { title: string; subtitle: string; accentClass: string }
> = {
  "/home": {
    title: "홈",
    subtitle: "빠르게 이동하세요",
    accentClass: "bg-gray-900 text-white dark:bg-white dark:text-gray-900",
  },
  "/community": {
    title: "커뮤니티",
    subtitle: "정보를 나누세요",
    accentClass: "bg-gray-900 text-white",
  },
  "/profile": {
    title: "마이페이지",
    subtitle: "내 정보 확인",
    accentClass: "bg-gray-900 text-white",
  },
  "/search": {
    title: "범죄자 조회",
    subtitle: "안전한 생활을 위해",
    accentClass: "bg-gray-900 text-white dark:bg-white dark:text-gray-900",
  },
  "/report": {
    title: "신고하기",
    subtitle: "의심 사례를 접수하세요",
    accentClass: "bg-gray-900 text-white",
  },
};

export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const activeTab = useMemo(() => {
    const match = Object.keys(pathToTab).find((path) =>
      location.pathname.startsWith(path)
    );
    return match ? pathToTab[match] : "home";
  }, [location.pathname]);

  const headerMeta = useMemo(() => {
    const match = Object.keys(headerMap).find((path) =>
      location.pathname.startsWith(path)
    );
    return match ? headerMap[match] : headerMap["/home"];
  }, [location.pathname]);

  const handleTabChange = (tab: string) => {
    const target = tabToPath[tab] ?? "/search";
    navigate(target);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut(auth);
      navigate("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isProfile = location.pathname.startsWith("/profile");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Toaster />

      <div className="max-w-md mx-auto bg-white dark:bg-gray-950 min-h-screen shadow-2xl border-x border-gray-200 dark:border-gray-800">
        <div className="sticky top-0 z-40 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 px-6 py-4 shadow-sm border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`${headerMeta.accentClass} p-2 rounded-xl`}>
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold">{headerMeta.title}</h1>
                <p className="text-xs text-gray-500">{headerMeta.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              {isProfile ? (
                <button
                  onClick={handleLogout}
                  className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-xs font-semibold"
                  disabled={isLoggingOut}
                >
                  <span className="flex items-center gap-1">
                    <LogOut className="w-4 h-4" />
                    {isLoggingOut ? "로그아웃 중" : "로그아웃"}
                  </span>
                </button>
              ) : null}
            </div>
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
