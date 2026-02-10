import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/firebase";
import { Button } from "@/app/components/ui/button";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null); // 명세서 기반 데이터

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        setUserData(null);
        setLoading(false);
        return;
      }

      // 실시간 데이터 리슨
      const userRef = doc(db, "users", user.uid);
      const unsubscribeData = onSnapshot(userRef, (snapshot) => {
        if (snapshot.exists()) {
          setUserData(snapshot.data());
        }
        setLoading(false);
      });

      return () => unsubscribeData();
    });

    return () => unsubscribeAuth();
  }, []);

  return (
    <div className="p-4 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-600 font-semibold">My Page</p>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">내 정보</h2>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-gray-100 text-gray-700 flex items-center justify-center text-lg font-semibold">
            {userData?.nickname?.[0] ?? "🙂"}
          </div>
        </div>

        {loading ? (
          <div className="mt-6 space-y-3 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-10 w-full rounded-xl bg-gray-100 dark:bg-gray-800" />
            ))}
          </div>
        ) : userData ? (
          <div className="mt-6 space-y-3 text-sm">
            {[
              { label: "닉네임", value: userData.nickname },
              { label: "이메일", value: userData.email },
              { label: "생년월일", value: userData.birth },
              { label: "성별", value: userData.gender },
              { label: "거주 지역", value: userData.region },
              { label: "직업", value: userData.job },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800/70">
                <span className="text-gray-500">{item.label}</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{item.value || "-"}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 text-center">
            <Button asChild className="h-10"><Link to="/login">로그인 하러가기</Link></Button>
          </div>
        )}
      </div>

      {/* 하단 안전 수칙/긴급 신고 디자인 유지 */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">안전 수칙</h3>
        <ul className="mt-3 space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li>• 의심되는 전화는 즉시 끊으세요</li>
          <li>• 개인정보를 절대 알려주지 마세요</li>
          <li>• 의심스러운 링크를 클릭하지 마세요</li>
        </ul>
      </div>
    </div>
  );
}
