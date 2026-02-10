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
  X,
  Maximize2,
  ChevronLeft, // 이전 아이콘 추가
  ChevronRight // 다음 아이콘 추가
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // ✨ [추가] 페이지네이션 상태 관리
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5; // 한 페이지당 보여줄 게시글 수

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await axios.get("http://localhost:8080/api/reports");
        setReports(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("데이터 로딩 실패:", err);
        if (axios.isAxiosError(err)) {
          if (!err.response) {
            setError("백엔드 서버 연결에 실패했습니다. 서버 실행 상태를 확인해주세요.");
          } else if (err.response.status >= 500) {
            setError("서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
          } else {
            setError(`요청 처리 중 오류가 발생했습니다. (HTTP ${err.response.status})`);
          }
        } else {
          setError("알 수 없는 오류가 발생했습니다.");
        }
        setReports([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  // ✨ [추가] 현재 페이지에 보여줄 데이터 계산
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = reports.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(reports.length / postsPerPage);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getRiskBadgeStyle = (level: string) => {
    switch (level) {
      case "STOP_IMMEDIATELY":
        return "bg-destructive/10 text-destructive border-destructive/30 font-bold animate-pulse";
      case "WARNING":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      case "CAUTION":
        return "bg-orange-500/10 text-orange-600 border-orange-500/20";
      case "SAFE":
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
              AI가 분석한 최신 스미싱 의심 사례를 실시간으로 확인하세요. ({reports.length}건)
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex h-40 flex-col items-center justify-center space-y-4 rounded-xl border border-border bg-card text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm">데이터를 불러오는 중입니다...</p>
          </div>
        ) : !error && reports.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center space-y-2 rounded-xl border border-border bg-card text-muted-foreground">
            <p className="text-sm font-medium">등록된 커뮤니티 제보가 아직 없습니다.</p>
            <p className="text-xs">제보가 등록되면 이곳에 표시됩니다.</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {/* ✨ reports 대신 currentPosts를 맵핑합니다. */}
              {currentPosts.map((report) => {
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
                    {/* 요약 헤더 (기존과 동일) */}
                    <div
                      onClick={() => setExpandedId(isExpanded ? null : report.id)}
                      className="flex cursor-pointer flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getRiskBadgeStyle(report.riskLevel)}`}>
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
                      <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${isExpanded ? "rotate-180 text-primary" : ""}`} />
                    </div>

                    {/* 상세 내용 (기존과 동일) */}
                    <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr] border-t border-border opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                      <div className="overflow-hidden bg-muted/20">
                        <div className="space-y-4 p-5">
                          <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg">🕵️</div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">익명 제보자</p>
                              <p className="text-xs text-muted-foreground">{report.reporterAge} · {report.reporterJob} · {report.reporterRegion}</p>
                            </div>
                          </div>
                          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-primary"><ShieldAlert className="h-4 w-4" />AI 보안 조언</div>
                            <p className="text-sm leading-relaxed text-foreground/90">{report.advice}</p>
                          </div>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <h4 className="text-xs font-semibold uppercase text-muted-foreground">신고 내용</h4>
                              <p className="rounded-lg border border-border bg-card p-3 text-sm text-foreground shadow-sm">{report.contextInfo}</p>
                            </div>
                            {report.imageUrl && (
                              <div className="space-y-2">
                                <h4 className="text-xs font-semibold uppercase text-muted-foreground">첨부 이미지</h4>
                                <div 
                                  className="group/image relative overflow-hidden rounded-lg border border-border bg-card cursor-pointer"
                                  onClick={(e) => { e.stopPropagation(); setSelectedImage(report.imageUrl); }}
                                >
                                  <img src={report.imageUrl} alt="신고 이미지" className="h-40 w-full object-cover transition-transform duration-300 group-hover/image:scale-105" />
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

            {/* ✨ [추가] 페이지네이션 컨트롤 UI */}
            {reports.length > postsPerPage && (
              <div className="mt-8 flex items-center justify-center gap-2 pb-10">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-card text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 이미지 전체화면 모달 (기존과 동일) */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl max-h-full w-full flex items-center justify-center">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
            >
              <X className="h-8 w-8" />
            </button>
            <img
              src={selectedImage}
              alt="확대된 이미지"
              className="max-h-[85vh] w-auto rounded-lg object-contain shadow-2xl ring-1 ring-white/10"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
