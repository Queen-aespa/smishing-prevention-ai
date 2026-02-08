import { useState } from "react";
import axios from "axios";
import { Shield, Loader2, ShieldCheck, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { SearchSection } from "@/app/components/SearchSection";
import { SearchResults } from "@/app/components/SearchResults";

// ✨ [수정] 백엔드 DTO와 정확히 일치시킨 인터페이스
interface SearchResult {
  id: string;
  phone?: string;
  url?: string;
  account?: string;
  keyword?: string;
  description?: string;
  reportDate: string;
  isSpam?: boolean; // 백엔드 DTO에 추가된 필드
}

export default function SearchPage() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [lastSearchType, setLastSearchType] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchedQuery, setSearchedQuery] = useState("");

  const handleSearch = async (type: string, query: string) => {
    console.log("🚀 [Frontend] 검색 요청:", { type, query });
    setLoading(true);
    setHasSearched(false);
    
    try {
      // 백엔드 호출
      const response = await axios.post("http://localhost:8080/api/search", {
        type: type,   // DTO의 type 필드 매핑
        query: query  // DTO의 query 필드 매핑
      });

      console.log("✅ [Frontend] 응답 수신:", response.data);

      const results: SearchResult[] = response.data;
      setSearchResults(results);
      setLastSearchType(type);
      setSearchedQuery(query);
      setHasSearched(true);

      if (results.length > 0) {
        toast.warning(`주의: ${results.length}건의 신고 기록이 발견되었습니다.`);
      } else {
        toast.success("신고 기록이 없는 번호입니다.");
      }
    } catch (error) {
      console.error("❌ [Frontend] 에러:", error);
      toast.error("검색 중 오류가 발생했습니다.");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <SearchSection onSearch={handleSearch} />

      {loading && (
        <div className="mt-12 text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">조회 중...</p>
        </div>
      )}

      {/* 1. 위험 결과가 있을 때 */}
      {!loading && searchResults.length > 0 && (
        <div className="mt-4">
          <div className="mb-4 text-center p-4 bg-red-50 rounded-xl border border-red-100">
             <ShieldAlert className="w-12 h-12 mx-auto text-red-500 mb-2" />
             <p className="text-red-700 font-bold">경고: 위험한 번호입니다!</p>
          </div>
          <SearchResults results={searchResults} searchType={lastSearchType} />
        </div>
      )}

      {/* 2. 안전한 번호일 때 */}
      {!loading && hasSearched && searchResults.length === 0 && (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="p-8 rounded-2xl border-2 border-green-100 bg-green-50/50 dark:bg-green-900/10 dark:border-green-800 text-center">
            <div className="inline-flex items-center justify-center p-4 bg-white dark:bg-green-900 rounded-full shadow-sm mb-4">
              <ShieldCheck className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              "{searchedQuery}"
            </h2>
            <span className="inline-block px-4 py-1 rounded-full bg-green-100 text-green-700 text-sm font-bold mb-4 dark:bg-green-800 dark:text-green-200">
              SAFE
            </span>
            <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
              신고 기록이 없는 번호입니다.
            </p>
          </div>
        </div>
      )}
      
      {/* 3. 초기 상태 */}
      {!loading && !hasSearched && (
        <div className="mt-8 text-center py-12">
          {/* ...기존 안내 문구... */}
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-gray-900 dark:text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            범죄자 정보를 조회하세요
          </h3>
          <p className="text-sm text-muted-foreground">
            전화번호, URL, 계좌번호 등으로<br />사기 범죄자를 확인할 수 있습니다
          </p>
        </div>
      )}
    </div>
  );
}