import { AlertTriangle, Phone, Globe, CreditCard, Tag } from "lucide-react";
import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";

interface SearchResult {
  id: string;
  phone?: string;
  url?: string;
  account?: string;
  keyword?: string;
  description?: string;
  reportDate: string;
}

interface SearchResultsProps {
  results: SearchResult[];
  searchType: string;
}

export function SearchResults({ results, searchType }: SearchResultsProps) {
  if (results.length === 0) {
    return null;
  }

  const getIcon = () => {
    switch (searchType) {
      case "phone":
        return <Phone className="w-4 h-4" />;
      case "url":
        return <Globe className="w-4 h-4" />;
      case "account":
        return <CreditCard className="w-4 h-4" />;
      case "keyword":
        return <Tag className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getTypeLabel = () => {
    switch (searchType) {
      case "phone":
        return "전화번호";
      case "url":
        return "URL/도메인";
      case "account":
        return "계좌번호";
      case "keyword":
        return "사칭 키워드";
      default:
        return "검색";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-gray-900 dark:bg-white p-2 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-white dark:text-gray-900" />
        </div>
        <h2 className="font-semibold">조회 결과</h2>
        <Badge variant="secondary" className="ml-auto rounded-full bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900">
          {results.length}건
        </Badge>
      </div>

      <div className="space-y-3">
        {results.map((result) => (
          <div key={result.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {getIcon()}
                <span className="font-medium">{getTypeLabel()}</span>
              </div>
              
              <div className="space-y-1 text-sm">
                {result.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 text-muted-foreground" />
                    <span>{result.phone}</span>
                  </div>
                )}
                {result.url && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-3 h-3 text-muted-foreground" />
                    <span>{result.url}</span>
                  </div>
                )}
                {result.account && (
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-3 h-3 text-muted-foreground" />
                    <span>{result.account}</span>
                  </div>
                )}
                {result.keyword && (
                  <div className="flex items-center gap-2">
                    <Tag className="w-3 h-3 text-muted-foreground" />
                    <span>{result.keyword}</span>
                  </div>
                )}
                {result.description && (
                  <p className="text-muted-foreground mt-2">{result.description}</p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  신고일: {result.reportDate}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}