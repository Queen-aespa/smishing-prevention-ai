import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebase";
import { Button } from "@/app/components/ui/button";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<{
    displayName?: string | null;
    email?: string | null;
    ageGroup?: string | null;
    gender?: string | null;
  } | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setUserData(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const snapshot = await getDoc(doc(db, "users", user.uid));
        const data = snapshot.exists() ? snapshot.data() : {};
        setUserData({
          displayName: data.displayName ?? user.displayName ?? null,
          email: data.email ?? user.email ?? null,
          ageGroup: data.ageGroup ?? null,
          gender: data.gender ?? null,
        });
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const ageGroupLabel = useMemo(() => {
    const value = userData?.ageGroup ?? "";
    const map: Record<string, string> = {
      "10s": "10대",
      "20s": "20대",
      "30s": "30대",
      "40s": "40대",
      "50s": "50대",
      "60s": "60대 이상",
    };
    return map[value] ?? "-";
  }, [userData?.ageGroup]);

  const genderLabel = useMemo(() => {
    const value = userData?.gender ?? "";
    const map: Record<string, string> = {
      male: "남성",
      female: "여성",
      other: "기타",
    };
    return map[value] ?? "-";
  }, [userData?.gender]);

  return (
    <div className="p-4 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-600 font-semibold">
              My Page
            </p>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              내 정보
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              가입 시 입력한 정보를 확인하세요.
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-gray-100 text-gray-700 flex items-center justify-center text-lg font-semibold">
            {userData?.displayName?.[0] ?? "🙂"}
          </div>
        </div>

        {loading ? (
          <div className="mt-6 space-y-3">
            <div className="h-4 w-32 rounded bg-gray-100 dark:bg-gray-800" />
            <div className="h-4 w-48 rounded bg-gray-100 dark:bg-gray-800" />
            <div className="h-4 w-40 rounded bg-gray-100 dark:bg-gray-800" />
          </div>
        ) : userData ? (
          <div className="mt-6 space-y-4 text-sm">
            <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800/70">
              <span className="text-gray-500">이름</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {userData.displayName ?? "-"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800/70">
              <span className="text-gray-500">이메일</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {userData.email ?? "-"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800/70">
              <span className="text-gray-500">연령대</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {ageGroupLabel}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800/70">
              <span className="text-gray-500">성별</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {genderLabel}
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-dashed border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-700">
            로그인이 필요합니다. 로그인 후 내 정보를 확인할 수 있습니다.
            <div className="mt-4">
              <Button asChild className="h-10">
                <Link to="/login">로그인 하러가기</Link>
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          안전 수칙
        </h3>
        <ul className="mt-3 space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-gray-900 dark:text-gray-100 mt-0.5">•</span>
            <span>의심되는 전화는 즉시 끊으세요</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-900 dark:text-gray-100 mt-0.5">•</span>
            <span>개인정보를 절대 알려주지 마세요</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-900 dark:text-gray-100 mt-0.5">•</span>
            <span>의심스러운 링크를 클릭하지 마세요</span>
          </li>
        </ul>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-800 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100">
        <p className="font-semibold mb-2">긴급 신고</p>
        <div className="flex gap-4 justify-center">
          <div className="px-4 py-2 bg-white/70 dark:bg-gray-800 rounded-lg">
            <p className="font-bold">112</p>
            <p className="text-xs">경찰</p>
          </div>
          <div className="px-4 py-2 bg-white/70 dark:bg-gray-800 rounded-lg">
            <p className="font-bold">182</p>
            <p className="text-xs">금융감독원</p>
          </div>
        </div>
      </div>
    </div>
  );
}
