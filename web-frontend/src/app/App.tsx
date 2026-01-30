import { useState } from "react";
import { UserInfoSection } from "@/app/components/UserInfoSection";
import { SearchSection } from "@/app/components/SearchSection";
import { ReportSection, CriminalData } from "@/app/components/ReportSection";
import { SearchResults } from "@/app/components/SearchResults";
import { BottomNav } from "@/app/components/BottomNav";
import { Shield, Bell } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/app/components/ui/sonner";

interface SearchResult {
  id: string;
  phone?: string;
  url?: string;
  account?: string;
  keyword?: string;
  description?: string;
  reportDate: string;
}

export default function App() {
  const [ageGroup, setAgeGroup] = useState("");
  const [gender, setGender] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [lastSearchType, setLastSearchType] = useState("");
  const [activeTab, setActiveTab] = useState("search");

  // Mock data for demonstration
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

  const handleSearch = (type: string, query: string) => {
    // Mock search - filter mock data based on search type and query
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

  const handleReport = (data: CriminalData) => {
    // Mock report submission
    toast.success("신고가 접수되었습니다. 검토 후 등록됩니다.");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Toaster />
      
      {/* App Container */}
      <div className="max-w-md mx-auto bg-white dark:bg-gray-950 min-h-screen shadow-2xl border-x border-gray-200 dark:border-gray-800">
        {/* Header */}
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

        {/* Content Area with bottom padding for nav */}
        <div className="pb-20 overflow-y-auto">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="p-4">
              <UserInfoSection
                ageGroup={ageGroup}
                gender={gender}
                onAgeGroupChange={setAgeGroup}
                onGenderChange={setGender}
              />
              
              <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
                <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">안전 수칙</h3>
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
          )}

          {/* Search Tab */}
          {activeTab === "search" && (
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
                    전화번호, URL, 계좌번호 등으로<br />
                    사기 범죄자를 확인할 수 있습니다
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Report Tab */}
          {activeTab === "report" && (
            <div className="p-4">
              <ReportSection onReport={handleReport} />
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
}