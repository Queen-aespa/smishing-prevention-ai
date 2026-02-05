import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "@/layouts/AppShell";
import HomePage from "@/pages/HomePage";
import SearchPage from "@/pages/SearchPage";
import ReportPage from "@/pages/ReportPage";
import CommunityPage from "@/pages/CommunityPage";
import ProfilePage from "@/pages/ProfilePage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Route>
    </Routes>
  );
}
