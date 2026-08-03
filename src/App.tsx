import { useState, lazy, Suspense, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate, useLocation } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import ArtifactStudio from "@/components/ArtifactStudio";
import LoginModal from "@/components/LoginModal";
import { useStore } from "@/store";
import { supabase } from "@/lib/supabase";

// Pages are lazy-loaded so the main bundle stays small and each route loads
// on demand instead of on first paint.
const Home = lazy(() => import("@/pages/Home"));
const Settings = lazy(() => import("@/pages/Settings"));
const History = lazy(() => import("@/pages/History"));
const Agents = lazy(() => import("@/pages/Agents"));
const KnowledgeBase = lazy(() => import("@/pages/KnowledgeBase"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const ActionBoardPage = lazy(() => import("@/pages/ActionBoardPage"));
const ResetPasswordPage = lazy(() => import("@/pages/ResetPassword"));

// Admin-only routes are guarded by the account role resolved from Supabase.
function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { isAdminAuthenticated } = useStore();
  const location = useLocation();

  if (!isAdminAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}

// Restores the signed-in session on page load so a refresh does not log the
// user out. Auth state is deliberately NOT persisted in the app store — it is
// re-derived from Supabase (the source of truth) once the store has hydrated.
function SessionRestore() {
  useEffect(() => {
    const cleanups: Array<() => void> = [];

    const startListening = () => {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        const store = useStore.getState();
        if (session?.user) {
          if (!store.isAuthenticated) {
            store.loginUser({ id: session.user.id, email: session.user.email || '' });
          }
        } else if (store.isAuthenticated) {
          store.logoutUser();
        }
      });
      cleanups.push(() => data.subscription.unsubscribe());
    };

    // Wait for the persisted store to hydrate so it can't clobber the restore.
    if (useStore.persist?.hasHydrated?.()) {
      startListening();
    } else {
      const unsub = useStore.persist.onFinishHydration(() => {
        unsub();
        startListening();
      });
      cleanups.push(unsub);
    }

    return () => { cleanups.forEach((fn) => fn()); };
  }, []);

  return null;
}

function AppLayout() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <div className="flex h-full w-full inset-0 fixed bg-[#070913] overflow-hidden selection:bg-primary selection:text-background font-sans text-text">
      {/* Background Subtle Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Restores the Supabase session after refresh */}
      <SessionRestore />

      {/* Persistent Sidebar */}
      <Sidebar onOpenLoginModal={() => setIsLoginModalOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-hidden flex flex-col relative z-10">
        <Outlet />
      </main>

      {/* Live Artifact & Document Preview Canvas */}
      <ArtifactStudio />

      {/* Pop-up Sign In Modal (Triggers when user clicks Sign In) */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Suspense fallback={<div className="h-full w-full flex items-center justify-center bg-[#070913] text-cyan-400 font-mono text-sm">Loading...</div>}>
        <Routes>
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/history" element={<History />} />
            <Route path="/action-board" element={<ActionBoardPage />} />
            <Route path="/agents" element={<RequireAdmin><Agents /></RequireAdmin>} />
            <Route path="/knowledge-base" element={<RequireAdmin><KnowledgeBase /></RequireAdmin>} />
            <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}
