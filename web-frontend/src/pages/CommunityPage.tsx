import { useEffect, useState } from "react";
import axios from "axios";
import { 
  ChevronDown, 
  ShieldAlert, 
  MapPin, 
  Calendar, 
  User, 
  AlertTriangle,
  Loader2,
  X, // 닫기 아이콘 추가
  Maximize2 // 확대 아이콘 추가 (선택사항)
} from "lucide-react";

// 백엔드 DTO 타입 정의
interface ReportData {
  id: string;
  summary: string;
  riskLevel: string;
  timestamp: number;
  advice: string;
  contextInfo: string;
  imageUrl: string;
  reporterNickname: string;
  reporterRegion: string;
  reporterAge: string;
  reporterJob: string;
}

export default function CommunityPage() {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // ✨ [추가] 이미지 확대 모달 상태 관리
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:8080/api/reports");
        setReports(response.data);
      } catch (err) {
        console.error("데이터 로딩 실패:", err);
        setError("서버 연결에 실패했습니다. 관리자에게 문의해주세요.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getRiskBadgeStyle = (level: string) => {
    switch (level) {
      case "High":
      case "Critical":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "Medium":
        return "bg-orange-500/10 text-orange-600 border-orange-500/20";
      default:
        return "bg-green-500/10 text-green-600 border-green-500/20";
    }
  };

  return (
    <div className="min-h-screen w-full bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        
        {/* 헤더 섹션 */}
        <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Community Report
            </p>
            <h1 className="text-2xl font-semibold leading-none tracking-tight">
              스미싱 제보 목록
            </h1>
            <p className="text-sm text-muted-foreground">
              AI가 분석한 최신 스미싱 의심 사례를 실시간으로 확인하세요.
            </p>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <p>{error}</p>
          </div>
        )}

        {/* 로딩 상태 */}
        {loading ? (
          <div className="flex h-40 flex-col items-center justify-center space-y-4 rounded-xl border border-border bg-card text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm">데이터를 불러오는 중입니다...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => {
              const isExpanded = expandedId === report.id;

              return (
                <div
                  key={report.id}
                  className={`group overflow-hidden rounded-xl border transition-all duration-200 ${
                    isExpanded
                      ? "border-primary/50 bg-card shadow-md"
                      : "border-border bg-card hover:bg-muted/30"
                  }`}
                >
                  {/* 요약 헤더 */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : report.id)}
                    className="flex cursor-pointer flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${getRiskBadgeStyle(
                            report.riskLevel
                          )}`}
                        >
                          {report.riskLevel} Risk
                        </span>
                        <span className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="mr-1 h-3 w-3" />
                          {formatDate(report.timestamp)}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-foreground">
                        {report.summary.replace(/"/g, "")}
                      </h3>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center font-medium text-primary">
                          <User className="mr-1 h-3 w-3" />
                          익명 제보자
                        </span>
                        <span className="h-3 w-[1px] bg-border"></span>
                        <span className="flex items-center">
                          <MapPin className="mr-1 h-3 w-3" />
                          {report.reporterRegion || "지역 미설정"}
                        </span>
                      </div>
                    </div>

                    <ChevronDown
                      className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${
                        isExpanded ? "rotate-180 text-primary" : ""
                      }`}
                    />
                  </div>

                  {/* 상세 내용 */}
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isExpanded
                        ? "grid-rows-[1fr] border-t border-border opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden bg-muted/20">
                      <div className="space-y-4 p-5">
                        
                        {/* 작성자 상세 프로필 */}
                        <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg">
                            🕵️
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              익명 제보자
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {report.reporterAge} · {report.reporterJob} · {report.reporterRegion}
                            </p>
                          </div>
                        </div>

                        {/* AI 조언 */}
                        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-primary">
                            <ShieldAlert className="h-4 w-4" />
                            AI 보안 조언
                          </div>
                          <p className="text-sm leading-relaxed text-foreground/90">
                            {report.advice}
                          </p>
                        </div>

                        {/* 신고 내용 및 이미지 */}
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <h4 className="text-xs font-semibold uppercase text-muted-foreground">
                              신고 내용
                            </h4>
                            <p className="rounded-lg border border-border bg-card p-3 text-sm text-foreground shadow-sm">
                              {report.contextInfo}
                            </p>
                          </div>

                          {report.imageUrl && (
                            <div className="space-y-2">
                              <h4 className="text-xs font-semibold uppercase text-muted-foreground">
                                첨부 이미지 (클릭하여 확대)
                              </h4>
                              {/* ✨ [수정] 이미지 클릭 이벤트 및 스타일 추가 */}
                              <div 
                                className="group/image relative overflow-hidden rounded-lg border border-border bg-card cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation(); // 아코디언 닫힘 방지
                                  setSelectedImage(report.imageUrl);
                                }}
                              >
                                <img
                                  src={report.imageUrl}
                                  alt="신고 이미지"
                                  className="h-40 w-full object-cover transition-transform duration-300 group-hover/image:scale-105"
                                />
                                {/* 호버 시 확대 아이콘 표시 (옵션) */}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover/image:bg-black/20">
                                  <Maximize2 className="h-8 w-8 text-white opacity-0 transition-opacity group-hover/image:opacity-100 drop-shadow-lg" />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ✨ [추가] 이미지 전체화면 모달 (Overlay) */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)} // 배경 클릭 시 닫기
        >
          <div className="relative max-w-5xl max-h-full w-full flex items-center justify-center">
            {/* 닫기 버튼 */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
            >
              <X className="h-8 w-8" />
            </button>
            
            {/* 확대된 이미지 */}
            <img
              src={selectedImage}
              alt="확대된 이미지"
              className="max-h-[85vh] w-auto rounded-lg object-contain shadow-2xl ring-1 ring-white/10"
              onClick={(e) => e.stopPropagation()} // 이미지 클릭 시 닫힘 방지
            />
          </div>
        </div>
      )}
    </div>
  );
}