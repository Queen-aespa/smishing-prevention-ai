import { useState } from "react";
import { UserInfoSection } from "@/app/components/UserInfoSection";

export default function ProfilePage() {
  const [ageGroup, setAgeGroup] = useState("");
  const [gender, setGender] = useState("");

  return (
    <div className="p-4">
      <UserInfoSection
        ageGroup={ageGroup}
        gender={gender}
        onAgeGroupChange={setAgeGroup}
        onGenderChange={setGender}
      />

      <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
        <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">
          안전 수칙
        </h3>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
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

      <div className="mt-4 text-center py-6 text-sm text-muted-foreground">
        <p className="font-semibold mb-2">긴급 신고</p>
        <div className="flex gap-4 justify-center">
          <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-900 dark:text-white font-bold">112</p>
            <p className="text-xs">경찰</p>
          </div>
          <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-900 dark:text-white font-bold">182</p>
            <p className="text-xs">금융감독원</p>
          </div>
        </div>
      </div>
    </div>
  );
}
