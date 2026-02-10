import { useState, useRef } from "react";

// 데이터 타입 정의
export interface CriminalData {
  phoneNumber: string;
  url: string;
  bankAccount: string;
  keywords: string;
  description: string;
}

interface ReportSectionProps {
  onReport: (data: CriminalData, files: File[]) => void;
  isSubmitting?: boolean;
}

export function ReportSection({ onReport, isSubmitting = false }: ReportSectionProps) {
  // 입력값 상태 관리
  const [formData, setFormData] = useState<CriminalData>({
    phoneNumber: "",
    url: "",
    bankAccount: "",
    keywords: "",
    description: "",
  });

  // 파일 상태 관리
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 파일 선택 핸들러 (여러 장 선택 가능)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  // 파일 삭제 핸들러 (인덱스로 삭제)
  const removeFile = (indexToRemove: number) => {
    setSelectedFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = () => {
    // 필수값 체크 등 유효성 검사 필요 시 여기에 추가
    onReport(formData, selectedFiles);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      
      {/* 1. 범죄자 신고 헤더 카드 (기존 디자인 유지) */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <span>+</span> 범죄자 신고
        </h2>
        
        <div className="mt-4 space-y-4">
          {/* 전화번호 입력 */}
          <div>
            <label className="text-xs font-semibold text-gray-500 ml-1">전화번호</label>
            <input
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="010-1234-5678"
              className="w-full mt-1 p-3 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/5 transition-all"
            />
          </div>

          {/* URL/도메인 입력 */}
          <div>
            <label className="text-xs font-semibold text-gray-500 ml-1">URL/도메인</label>
            <input
              name="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="example.com"
              className="w-full mt-1 p-3 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/5 transition-all"
            />
          </div>

          {/* 계좌번호 입력 */}
          <div>
            <label className="text-xs font-semibold text-gray-500 ml-1">계좌번호</label>
            <input
              name="bankAccount"
              value={formData.bankAccount}
              onChange={handleChange}
              placeholder="123456-78-901234"
              className="w-full mt-1 p-3 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/5 transition-all"
            />
          </div>

          {/* 사칭 키워드 입력 */}
          <div>
            <label className="text-xs font-semibold text-gray-500 ml-1">사칭 키워드</label>
            <input
              name="keywords"
              value={formData.keywords}
              onChange={handleChange}
              placeholder="예: 경찰청, 검찰청 등"
              className="w-full mt-1 p-3 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/5 transition-all"
            />
          </div>

          {/* === [증거 사진 첨부 영역] === */}
          <div>
            <label className="text-xs font-semibold text-gray-500 ml-1">증거 사진 (선택)</label>
            <div className="mt-1 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {/* 사진 추가 버튼 */}
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex-shrink-0 w-20 h-20 bg-gray-50 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors border border-dashed border-gray-300"
              >
                <span className="text-xl">+</span>
                <span className="text-[10px] mt-1">사진 추가</span>
              </button>

              {/* 선택된 사진 미리보기 리스트 */}
              {selectedFiles.map((file, idx) => (
                <div key={idx} className="relative flex-shrink-0 w-20 h-20 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 group">
                  <img 
                    src={URL.createObjectURL(file)} 
                    alt="preview" 
                    className="w-full h-full object-cover" 
                  />
                  {/* 삭제 버튼 (호버 시 더 잘 보이게 조정) */}
                  <button 
                    onClick={() => removeFile(idx)}
                    className="absolute top-0 right-0 w-6 h-6 bg-black/60 text-white flex items-center justify-center rounded-bl-lg text-xs hover:bg-black/80 transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* 숨겨진 파일 인풋 (multiple 속성으로 여러 장 선택 가능) */}
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileChange}
            />
          </div>
          {/* ========================================================= */}

          {/* 상세 설명 (선택) */}
          <div>
            <label className="text-xs font-semibold text-gray-500 ml-1">상세 설명 (선택)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="범죄 내용을 상세히 적어주세요"
              className="w-full mt-1 p-3 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/5 transition-all h-24 resize-none"
            />
          </div>

          {/* 신고하기 버튼 */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-[#0f172a] text-white py-4 rounded-xl font-bold text-sm hover:bg-[#1e293b] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-slate-200"
          >
            {isSubmitting ? "접수 중..." : "+ 신고하기"}
          </button>

        </div>
      </div>
    </div>
  );
}