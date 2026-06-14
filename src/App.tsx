import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import MobileLayout from "./layouts/MobileLayout";
import FinancialAccessGate from "./components/FinancialAccessGate";

const Dashboard = lazy(() => import("./modules/dashboard"));
const Visitors = lazy(() => import("./modules/visitantes"));
const Members = lazy(() => import("./modules/membros"));
const Children = lazy(() => import("./modules/criancas"));
const Youth = lazy(() => import("./modules/jovens"));
const Discipleship = lazy(() => import("./modules/discipulado"));
const Baptism = lazy(() => import("./modules/batismo"));
const Financial = lazy(() => import("./modules/financeiro"));
const Messages = lazy(() => import("./modules/mensagens"));
const Certificates = lazy(() => import("./modules/certificados"));
const Birthdays = lazy(() => import("./modules/aniversariantes"));
const Settings = lazy(() => import("./modules/usuarios"));
const ChurchSettings = lazy(() => import("./modules/igrejas"));
const Login = lazy(() => import("./pages/Login"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const MobileLanding = lazy(() => import("./pages/MobileLanding"));
const MobileMembers = lazy(() => import("./pages/MobileMembers"));
const MobileVisitors = lazy(() => import("./pages/MobileVisitors"));
const MobileChildren = lazy(() => import("./pages/MobileChildren"));
const MobileYouth = lazy(() => import("./pages/MobileYouth"));
const PublicDiscipleshipCourse = lazy(() => import("./pages/PublicDiscipleshipCourse"));

function RouteFallback() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="h-10 w-10 rounded-full border-2 border-white/20 border-t-purple-500 animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Suspense fallback={<RouteFallback />}>
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
          <Route path="children" element={<Children />} />
          <Route path="youth" element={<Youth />} />
          <Route path="discipleship" element={<Discipleship />} />
          <Route path="baptism" element={<Baptism />} />
          <Route path="financial" element={<FinancialAccessGate><Financial /></FinancialAccessGate>} />
          <Route path="messages" element={<Messages />} />
          <Route path="certificates" element={<Certificates />} />
          <Route path="certificates/apresentacao-bebe/gerar" element={<Certificates />} />
          <Route path="birthdays" element={<Birthdays />} />
          <Route path="settings" element={<Settings />} />
          <Route path="church" element={<ChurchSettings />} />
        </Route>

        <Route path="/mobile/*" element={<MobileLayout />}>
          <Route index element={<MobileLanding />} />
          <Route path="members" element={<MobileMembers />} />
          <Route path="visitors" element={<MobileVisitors />} />
          <Route path="children" element={<MobileChildren />} />
          <Route path="youth" element={<MobileYouth />} />
        </Route>

        {/* Legacy routes redirect */}
        <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="/visitors" element={<Navigate to="/app/visitors" replace />} />
        <Route path="/members" element={<Navigate to="/app/members" replace />} />
        <Route path="/children" element={<Navigate to="/app/children" replace />} />
        <Route path="/youth" element={<Navigate to="/app/youth" replace />} />
        <Route path="/discipleship" element={<Navigate to="/app/discipleship" replace />} />
        <Route path="/baptism" element={<Navigate to="/app/baptism" replace />} />
        <Route path="/financial" element={<Navigate to="/app/financial" replace />} />
        <Route path="/messages" element={<Navigate to="/app/messages" replace />} />
        <Route path="/certificates" element={<Navigate to="/app/certificates" replace />} />
        <Route path="/birthdays" element={<Navigate to="/app/birthdays" replace />} />
        <Route path="/settings" element={<Navigate to="/app/settings" replace />} />
        <Route path="/church" element={<Navigate to="/app/church" replace />} />

        {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
