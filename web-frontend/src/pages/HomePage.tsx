import { Link } from "react-router-dom";
import { Button } from "@/app/components/ui/button";

export default function HomePage() {
  return (
    <div className="p-6 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-600 font-semibold">
          Home
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
          무엇을 도와드릴까요?
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          신고 또는 조회를 선택해 빠르게 이동할 수 있습니다.
        </p>
      </div>

      <div className="grid gap-4">
        <Button asChild className="h-12 w-full">
          <Link to="/report">신고하기</Link>
        </Button>
        <Button asChild variant="outline" className="h-12 w-full">
          <Link to="/search">조회하기</Link>
        </Button>
      </div>

      <div className="grid gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              최근 활동 요약
            </h3>
            <span className="text-xs text-gray-500">최근 7일</span>
          </div>
          <div className="mt-4 grid gap-3">
            <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-sm dark:bg-gray-800/70">
              <span className="text-gray-500">최근 조회</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                3건
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-sm dark:bg-gray-800/70">
              <span className="text-gray-500">최근 신고</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                2건
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            긴급 알림
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            최근 피싱 키워드가 급증하고 있습니다.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["택배 지연", "검찰 조사", "대출 승인"].map((label) => (
              <span
                key={label}
                className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              보호 레벨
            </h3>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200">
              안전
            </span>
          </div>
          <div className="mt-4 h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
            <div className="h-2 w-2/3 rounded-full bg-gray-900 dark:bg-gray-200" />
          </div>
          <p className="mt-3 text-sm text-gray-500">
            최근 30일 기준으로 위험 신호가 낮습니다.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            피싱 예방법
          </h3>
          <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 text-gray-400">•</span>
              <span>출처가 불명확한 링크는 열지 마세요.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-0.5 text-gray-400">•</span>
              <span>금융정보 요청 메시지는 즉시 의심하세요.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-0.5 text-gray-400">•</span>
              <span>알 수 없는 앱 설치 요구는 거절하세요.</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              커뮤니티 바로가기
            </h3>
            <Link
              to="/community"
              className="text-xs font-semibold text-gray-900 hover:text-gray-700"
            >
              더 보기
            </Link>
          </div>
          <div className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <div className="rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800/70">
              최신 글: “문자 링크 눌렀는데 괜찮을까요?”
            </div>
            <div className="rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800/70">
              인기 글: “계좌 신고 절차 정리”
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
