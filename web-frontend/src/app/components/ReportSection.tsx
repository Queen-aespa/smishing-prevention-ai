import { Plus } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { useState } from "react";

interface ReportSectionProps {
  onReport: (data: CriminalData) => void;
}

export interface CriminalData {
  phone?: string;
  url?: string;
  account?: string;
  keyword?: string;
  description?: string;
}

export function ReportSection({ onReport }: ReportSectionProps) {
  const [formData, setFormData] = useState<CriminalData>({});

  const handleSubmit = () => {
    if (
      formData.phone ||
      formData.url ||
      formData.account ||
      formData.keyword
    ) {
      onReport(formData);
      setFormData({});
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
          <Plus className="w-5 h-5 text-gray-900 dark:text-white" />
        </div>
        <h2 className="font-semibold">범죄자 신고</h2>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="phone" className="text-sm font-medium mb-2 block">
            전화번호
          </Label>
          <Input
            id="phone"
            className="h-12 rounded-xl"
            placeholder="010-1234-5678"
            value={formData.phone || ""}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="url" className="text-sm font-medium mb-2 block">
            URL/도메인
          </Label>
          <Input
            id="url"
            className="h-12 rounded-xl"
            placeholder="example.com"
            value={formData.url || ""}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="account" className="text-sm font-medium mb-2 block">
            계좌번호
          </Label>
          <Input
            id="account"
            className="h-12 rounded-xl"
            placeholder="123456-78-901234"
            value={formData.account || ""}
            onChange={(e) =>
              setFormData({ ...formData, account: e.target.value })
            }
          />
        </div>

        <div>
          <Label htmlFor="keyword" className="text-sm font-medium mb-2 block">
            사칭 키워드
          </Label>
          <Input
            id="keyword"
            className="h-12 rounded-xl"
            placeholder="예: 경찰청, 검찰청 등"
            value={formData.keyword || ""}
            onChange={(e) =>
              setFormData({ ...formData, keyword: e.target.value })
            }
          />
        </div>

        <div>
          <Label htmlFor="description" className="text-sm font-medium mb-2 block">
            상세 설명 (선택)
          </Label>
          <Textarea
            id="description"
            className="rounded-xl"
            placeholder="범죄 내용을 상세히 적어주세요"
            value={formData.description || ""}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={3}
          />
        </div>

        <Button
          onClick={handleSubmit}
          className="w-full h-12 rounded-xl bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 dark:text-gray-900 mt-2"
        >
          <Plus className="w-4 h-4 mr-2" />
          신고하기
        </Button>
      </div>
    </div>
  );
}