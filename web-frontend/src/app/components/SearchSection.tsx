import { useState } from "react";
import { Search, AlertTriangle } from "lucide-react";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

interface SearchSectionProps {
  onSearch: (type: string, query: string) => void;
}

export function SearchSection({ onSearch }: SearchSectionProps) {
  const [searchType, setSearchType] = useState("phone");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchType, searchQuery);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-gray-900 dark:text-white" />
        </div>
        <h2 className="font-semibold">범죄자 정보 조회</h2>
      </div>
      
      <div className="space-y-3">
        <Select value={searchType} onValueChange={setSearchType}>
          <SelectTrigger className="h-12 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="phone">전화번호</SelectItem>
            <SelectItem value="url">URL/도메인</SelectItem>
            <SelectItem value="account">계좌번호</SelectItem>
            <SelectItem value="keyword">사칭 키워드</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Input
            className="h-12 rounded-xl flex-1"
            placeholder={
              searchType === "phone"
                ? "010-1234-5678"
                : searchType === "url"
                ? "example.com"
                : searchType === "account"
                ? "123456-78-901234"
                : "사칭 키워드 입력"
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch} className="shrink-0 h-12 px-6 rounded-xl bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-200 dark:text-gray-900">
            <Search className="w-4 h-4 mr-2" />
            조회
          </Button>
        </div>
      </div>
    </div>
  );
}