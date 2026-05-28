import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import MobileLayout from "./layouts/MobileLayout";
import FinancialAccessGate from "./components/FinancialAccessGate";
import Dashboard from "./pages/Dashboard";
import Visitors from "./pages/Visitors";
import Members from "./pages/Members";
import Discipleship from "./pages/Discipleship";
import Baptism from "./pages/Baptism";
import Financial from "./pages/Financial";
import Messages from "./pages/Messages";
import Certificates from "./pages/Certificates";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import LandingPage from "./pages/LandingPage";
import MobileLanding from "./pages/MobileLanding";
import MobileMembers from "./pages/MobileMembers";
import MobileVisitors from "./pages/MobileVisitors";
import PublicDiscipleshipCourse from "./pages/PublicDiscipleshipCourse";

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Direct access route for login */}
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/course/:token" element={<PublicDiscipleshipCourse />} />

        {/* Application Routes */}
        <Route path="/app/*" element={<MainLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="visitors" element={<Visitors />} />
          <Route path="members" element={<Members />} />
          <Route path="discipleship" element={<Discipleship />} />
          <Route path="baptism" element={<Baptism />} />
          <Route path="financial" element={<FinancialAccessGate><Financial /></FinancialAccessGate>} />
          <Route path="messages" element={<Messages />} />
          <Route path="certificates" element={<Certificates />} />
          <Route path="certificates/apresentacao-bebe/gerar" element={<Certificates />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="/mobile/*" element={<MobileLayout />}>
          <Route index element={<MobileLanding />} />
          <Route path="members" element={<MobileMembers />} />
          <Route path="visitors" element={<MobileVisitors />} />
        </Route>

        {/* Legacy routes redirect */}
        <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="/visitors" element={<Navigate to="/app/visitors" replace />} />
        <Route path="/members" element={<Navigate to="/app/members" replace />} />
        <Route path="/discipleship" element={<Navigate to="/app/discipleship" replace />} />
        <Route path="/baptism" element={<Navigate to="/app/baptism" replace />} />
        <Route path="/financial" element={<Navigate to="/app/financial" replace />} />
        <Route path="/messages" element={<Navigate to="/app/messages" replace />} />
        <Route path="/certificates" element={<Navigate to="/app/certificates" replace />} />
        <Route path="/settings" element={<Navigate to="/app/settings" replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
