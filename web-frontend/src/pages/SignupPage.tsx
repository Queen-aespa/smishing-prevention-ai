import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Sparkles } from "lucide-react";
import { auth, db } from "@/firebase";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";

export default function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nickname, setNickname] = useState(""); // 명세서: nickname
  const [birth, setBirth] = useState("");       // 명세서: birth
  const [gender, setGender] = useState("");     // 명세서: gender
  const [region, setRegion] = useState("");     // 명세서: region
  const [job, setJob] = useState("");           // 명세서: job
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
      
      // Firestore에 명세서 규격대로 저장
      await setDoc(doc(db, "users", result.user.uid), {
        uid: result.user.uid,
        email: email.trim(),
        nickname: nickname.trim(),
        birth: birth, // YYYYMMDD 형식 문자열
        gender: gender === "male" ? "남성" : "여성", // 한글 저장
        region: region,
        job: job,
        createdAt: Number(Date.now()), // Number 타입 타임스탬프
      });

      navigate("/");
    } catch (err: any) {
      setError("회원가입 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 text-slate-900">
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
        <div className="mb-10 rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900 text-white"><Sparkles className="h-6 w-6" /></div>
            <h1 className="text-2xl font-semibold">새 계정 만들기</h1>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label>닉네임</Label>
              <Input placeholder="닉네임을 입력하세요" value={nickname} onChange={(e) => setNickname(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>이메일</Label>
              <Input type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>비밀번호</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>확인</Label>
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>생년월일</Label>
                <Input placeholder="19950101" maxLength={8} value={birth} onChange={(e) => setBirth(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>성별</Label>
                <RadioGroup value={gender} onValueChange={setGender} className="flex h-10 items-center gap-4">
                  <div className="flex items-center space-x-1"><RadioGroupItem value="male" id="m"/><Label htmlFor="m">남</Label></div>
                  <div className="flex items-center space-x-1"><RadioGroupItem value="female" id="f"/><Label htmlFor="f">여</Label></div>
                </RadioGroup>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>거주 지역</Label>
                <Input placeholder="서울" value={region} onChange={(e) => setRegion(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>직업</Label>
                <Input placeholder="학생" value={job} onChange={(e) => setJob(e.target.value)} required />
              </div>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="h-12 w-full bg-gray-900 text-white rounded-xl" disabled={loading}>
              {loading ? "가입 중..." : "회원가입 완료"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}