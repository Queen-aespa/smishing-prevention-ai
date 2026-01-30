import { useState } from "react";
import { Shield } from "lucide-react";
import { toast } from "sonner";
import { SearchSection } from "@/app/components/SearchSection";
import { SearchResults } from "@/app/components/SearchResults";

interface SearchResult {
  id: string;
  phone?: string;
  url?: string;
  account?: string;
  keyword?: string;
  description?: string;
  reportDate: string;
}

const mockCriminalData: SearchResult[] = [
  {
    id: "1",
    phone: "010-1234-5678",
    keyword: "경찰청",
    description: "경찰청을 사칭하여 보이스피싱 시도",
    reportDate: "2026-01-28",
  },
  {
    id: "2",
    phone: "010-9876-5432",
    keyword: "검찰청",
    description: "검찰청 직원을 사칭한 금융사기",
    reportDate: "2026-01-27",
  },
  {
    id: "3",
    url: "fake-bank-site.com",
    description: "은행 사이트를 모방한 피싱 사이트",
    reportDate: "2026-01-26",
  },
  {
    id: "4",
    account: "123456-78-901234",
    description: "사기 계좌로 신고됨",
    reportDate: "2026-01-25",
  },
];

export default function SearchPage() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [lastSearchType, setLastSearchType] = useState("");

  const handleSearch = (type: string, query: string) => {
    const results = mockCriminalData.filter((item) => {
      switch (type) {
        case "phone":
          return item.phone?.includes(query);
        case "url":
          return item.url?.includes(query);
        case "account":
          return item.account?.includes(query);
        case "keyword":
          return item.keyword?.toLowerCase().includes(query.toLowerCase());
        default:
          return false;
      }
    });

    setSearchResults(results);
    setLastSearchType(type);

    if (results.length > 0) {
      toast.warning(`주의: ${results.length}건의 범죄자 정보가 발견되었습니다.`);
    } else {
      toast.success("조회 결과가 없습니다. 안전한 정보입니다.");
    }
  };

  return (
    <div className="p-4">
      <SearchSection onSearch={handleSearch} />
      <SearchResults results={searchResults} searchType={lastSearchType} />

      {searchResults.length === 0 && (
        <div className="mt-8 text-center py-12">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-gray-900 dark:text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            범죄자 정보를 조회하세요
          </h3>
          <p className="text-sm text-muted-foreground">
            전화번호, URL, 계좌번호 등으로
            <br />
            사기 범죄자를 확인할 수 있습니다
          </p>
        </div>
      )}
    </div>
  );
}
