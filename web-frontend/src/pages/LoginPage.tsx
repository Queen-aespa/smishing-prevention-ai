import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ShieldCheck } from "lucide-react";
import { auth } from "@/firebase";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";

const mapFirebaseError = (error: unknown) => {
  const code =
    typeof error === "object" && error && "code" in error
      ? String(error.code)
      : "";

  switch (code) {
    case "auth/invalid-email":
      return "이메일 형식을 확인해주세요.";
    case "auth/user-disabled":
      return "비활성화된 계정입니다. 관리자에게 문의해주세요.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "이메일 또는 비밀번호가 올바르지 않습니다.";
    case "auth/too-many-requests":
      return "요청이 많습니다. 잠시 후 다시 시도해주세요.";
    default:
      return "로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
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
        <div className="pointer-events-none absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-gray-200/60 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 right-[-10%] h-96 w-96 rounded-full bg-gray-300/40 blur-3xl" />

        <div className="relative mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
          <div className="mb-10 rounded-3xl border border-white/60 bg-white/80 p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.6)] backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-600">
                  Smishing Guard
                </p>
                <h1 className="text-2xl font-semibold">안전한 메시지 분석</h1>
                <p className="mt-1 text-sm text-slate-500">
                  로그인하고 위험 신호를 즉시 확인하세요.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
                  placeholder="비밀번호를 입력하세요"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>

              {error ? (
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                  {error}
                </div>
              ) : null}

              <Button type="submit" className="h-11 w-full" disabled={loading}>
                {loading ? "로그인 중..." : "로그인"}
              </Button>

              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>계정이 없나요?</span>
                <Link
                  to="/signup"
                  className="font-semibold text-gray-900 hover:text-gray-700"
                >
                  회원가입
                </Link>
              </div>
            </form>
          </div>

          <div className="text-center text-xs text-slate-500">
            로그인 시 서비스 약관 및 개인정보 처리방침에 동의한 것으로
            간주합니다.
          </div>
        </div>
      </div>
    </div>
  );
}
