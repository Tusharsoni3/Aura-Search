import React, { Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// ─── Lazy Page Imports ────────────────────────────────────────────────────────
const LandingPage = React.lazy(() => import("./pages/LandingPage"));
const LoginPage = React.lazy(() => import("./pages/LoginPage"));
const SignupPage = React.lazy(() => import("./pages/SignupPage"));
const ProfilePage = React.lazy(() => import("./pages/profile/ProfilePage"));
const ForgotPasswordPage = React.lazy(
  () => import("./pages/ForgotPasswordPage"),
);
const ResetPasswordPage = React.lazy(() => import("./pages/ResetPasswordPage"));
const Verify2FAPage = React.lazy(() => import("./pages/Verify2FAPage"));
const ChatPage = React.lazy(() => import("./pages/ChatPage"));

// ─── Full-screen Suspense Fallback ────────────────────────────────────────────
function PageSpinner() {
  return (
    <div
      style={{ background: "#0B0C11" }}
      className="fixed inset-0 flex items-center justify-center"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="spinner" />
        <span
          style={{ color: "#64748B" }}
          className="text-sm font-medium tracking-wide"
        >
          Loading…
        </span>
      </div>
    </div>
  );
}

// ─── Loading Spinner (inline, for route guards) ───────────────────────────────
function RouteSpinner() {
  return (
    <div
      style={{ background: "#0B0C11" }}
      className="fixed inset-0 flex items-center justify-center"
    >
      <div className="spinner" />
    </div>
  );
}

// ─── Protected Route ──────────────────────────────────────────────────────────
// Requires the user to be authenticated. Redirects to /login otherwise.
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <RouteSpinner />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// ─── Public Route ─────────────────────────────────────────────────────────────
// Redirects already-authenticated users away from auth pages (→ /chat).
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <RouteSpinner />;

  if (isAuthenticated) {
    return <Navigate to="/chat" replace />;
  }

  return children;
}

// ─── App Routes ───────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <Routes>
        {/* Public / guest routes */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignupPage />
            </PublicRoute>
          }
        />

        {/* Semi-auth routes (require a session cookie but not full auth state) */}
        <Route path="/verify-2fa" element={<Verify2FAPage />} />

        {/* Fully public utility routes */}
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* Protected routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:chatId"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  return <AppRoutes />;
}
