import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { getAuth } from "firebase/auth"; // [추가] Firebase Auth 임포트
import { ReportSection } from "@/app/components/ReportSection";
import type { CriminalData } from "@/app/components/ReportSection";

export default function ReportPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const API_URL = "https://smishing-prevention-ai.onrender.com/api/reports"; 
  const navigate = useNavigate();

  const handleReport = async (data: CriminalData, files: File[]) => {
    if (isSubmitting) return;

    // [추가] 현재 로그인한 유저 UID 가져오기
    const auth = getAuth();
    const currentUser = auth.currentUser;


    if (!currentUser) {
      toast.error("로그인이 필요한 서비스입니다.");
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("신고를 안전하게 접수하고 있습니다...");

    try {
      const formData = new FormData();
      
      // [수정] 데이터 객체에 reporterUid 추가하여 전송
      const reportData = {
        ...data,
        reporterUid: currentUser.uid // UID 추가
      };

      const jsonBlob = new Blob([JSON.stringify(reportData)], { type: "application/json" });
      formData.append("data", jsonBlob);

      files.forEach((file) => {
        formData.append("files", file);
      });

      await axios.post(API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.dismiss(loadingToast);
      toast.success("신고가 성공적으로 접수되었습니다!");

    } catch (error) {
      console.error("Report Error:", error);
      toast.dismiss(loadingToast);
      toast.error("신고 접수에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 bg-gray-50/30 min-h-screen">
      <div className="max-w-md mx-auto mb-6">
        <h1 className="text-xl font-bold px-1">신고하기</h1>
        <p className="text-sm text-gray-500 px-1">의심 사례를 접수하세요</p>
      </div>
      <ReportSection onReport={handleReport} isSubmitting={isSubmitting} />
    </div>
  );
}
