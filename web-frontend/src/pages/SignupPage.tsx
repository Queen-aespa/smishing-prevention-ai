import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { Sparkles } from "lucide-react";
import { auth, db } from "@/firebase";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";

const mapFirebaseError = (error: unknown) => {
  const code =
    typeof error === "object" && error && "code" in error
      ? String(error.code)
      : "";

  switch (code) {
    case "auth/email-already-in-use":
      return "이미 사용 중인 이메일입니다.";
    case "auth/invalid-email":
      return "이메일 형식을 확인해주세요.";
    case "auth/weak-password":
      return "비밀번호는 최소 6자 이상이어야 합니다.";
    case "auth/too-many-requests":
      return "요청이 많습니다. 잠시 후 다시 시도해주세요.";
    default:
      return "회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
};

export default function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [gender, setGender] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setLoading(true);

    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const displayName = name.trim();
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }

      await setDoc(
        doc(db, "users", result.user.uid),
        {
          displayName: displayName || null,
          email: result.user.email ?? email.trim(),
          ageGroup: ageGroup || null,
          gender: gender || null,
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      navigate("/search");
    } catch (err) {
      setError(mapFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 text-slate-900">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-20 right-[-5%] h-72 w-72 rounded-full bg-gray-200/60 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-48 left-[-10%] h-96 w-96 rounded-full bg-gray-300/40 blur-3xl" />

        <div className="relative mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
          <div className="mb-10 rounded-3xl border border-white/60 bg-white/80 p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.6)] backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900 text-white">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-600">
                  Get Started
                </p>
                <h1 className="text-2xl font-semibold">새 계정 만들기</h1>
                <p className="mt-1 text-sm text-slate-500">
                  가입하고 안전 분석 리포트를 받아보세요.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="이름을 입력하세요"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@email.com"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="최소 6자"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="비밀번호를 다시 입력하세요"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ageGroup">연령대</Label>
                <Select value={ageGroup} onValueChange={setAgeGroup}>
                  <SelectTrigger id="ageGroup" className="h-12 rounded-xl">
                    <SelectValue placeholder="연령대를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10s">10대</SelectItem>
                    <SelectItem value="20s">20대</SelectItem>
                    <SelectItem value="30s">30대</SelectItem>
                    <SelectItem value="40s">40대</SelectItem>
                    <SelectItem value="50s">50대</SelectItem>
                    <SelectItem value="60s">60대 이상</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>성별</Label>
                <RadioGroup
                  value={gender}
                  onValueChange={setGender}
                  className="mt-2"
                >
                  <div className="grid grid-cols-3 gap-3">
                    <div className="relative">
                      <RadioGroupItem
                        value="male"
                        id="signup-male"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="signup-male"
                        className="flex items-center justify-center h-12 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 cursor-pointer transition-all peer-data-[state=checked]:border-gray-900 dark:peer-data-[state=checked]:border-white peer-data-[state=checked]:bg-gray-50 dark:peer-data-[state=checked]:bg-gray-800 hover:border-gray-300"
                      >
                        남성
                      </Label>
                    </div>
                    <div className="relative">
                      <RadioGroupItem
                        value="female"
                        id="signup-female"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="signup-female"
                        className="flex items-center justify-center h-12 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 cursor-pointer transition-all peer-data-[state=checked]:border-gray-900 dark:peer-data-[state=checked]:border-white peer-data-[state=checked]:bg-gray-50 dark:peer-data-[state=checked]:bg-gray-800 hover:border-gray-300"
                      >
                        여성
                      </Label>
                    </div>
                    <div className="relative">
                      <RadioGroupItem
                        value="other"
                        id="signup-other"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="signup-other"
                        className="flex items-center justify-center h-12 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 cursor-pointer transition-all peer-data-[state=checked]:border-gray-900 dark:peer-data-[state=checked]:border-white peer-data-[state=checked]:bg-gray-50 dark:peer-data-[state=checked]:bg-gray-800 hover:border-gray-300"
                      >
                        기타
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {error ? (
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                  {error}
                </div>
              ) : null}

              <Button type="submit" className="h-11 w-full" disabled={loading}>
                {loading ? "가입 중..." : "회원가입"}
              </Button>

              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>이미 계정이 있나요?</span>
                <Link
                  to="/login"
                  className="font-semibold text-gray-900 hover:text-gray-700"
                >
                  로그인
                </Link>
              </div>
            </form>
          </div>

          <div className="text-center text-xs text-slate-500">
            가입 시 서비스 약관 및 개인정보 처리방침에 동의한 것으로
            간주합니다.
          </div>
        </div>
      </div>
    </div>
  );
}
