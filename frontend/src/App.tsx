import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { Layout } from './components/Layout';
import { PageLoader } from './components/Spinner';
import { Toaster } from './components/Toaster';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { TransactionFormPage } from './pages/TransactionFormPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { PaymentMethodsPage } from './pages/PaymentMethodsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

/**
 * Initializes application-level authentication and renders the root router and global UI.
 *
 * The component triggers authentication bootstrap on mount, renders a global Toaster, and
 * configures public and protected application routes with shared layout for authenticated pages.
 *
 * @returns The root React element for the application containing routing and global UI.
 */
export default function App() {
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const user = useAuthStore((s) => s.user);
  const initializing = useAuthStore((s) => s.initializing);

  // Restore the session (if any) once on mount.
  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  // Element for "/": a loader while restoring the session, the app shell for
  // authenticated users (so the dashboard stays at "/"), and the marketing
  // landing page for guests.
  const rootElement = initializing ? <PageLoader /> : user ? <Layout /> : <LandingPage lang="en" />;

  return (
    <>
      <Toaster />
      <Routes>
        {/* Root: landing for guests, app shell (dashboard) for users */}
        <Route path="/" element={rootElement}>
          <Route index element={<DashboardPage />} />
        </Route>

        {/* Public landing — Russian / Uzbek */}
        <Route path="/ru" element={<LandingPage lang="ru" />} />
        <Route path="/uz" element={<LandingPage lang="uz" />} />

        {/* Public auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected routes share the app Layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/transactions/new" element={<TransactionFormPage />} />
            <Route path="/transactions/:id/edit" element={<TransactionFormPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/payment-methods" element={<PaymentMethodsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}
