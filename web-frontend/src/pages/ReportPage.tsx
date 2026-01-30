import { toast } from "sonner";
import { ReportSection } from "@/app/components/ReportSection";
import type { CriminalData } from "@/app/components/ReportSection";

export default function ReportPage() {
  const handleReport = (data: CriminalData) => {
    void data;
    toast.success("신고가 접수되었습니다. 검토 후 등록됩니다.");
  };

  return (
    <div className="p-4">
      <ReportSection onReport={handleReport} />
    </div>
  );
}
