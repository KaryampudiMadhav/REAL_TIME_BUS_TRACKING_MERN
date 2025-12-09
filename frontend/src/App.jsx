import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import PassengerDashboard from "./pages/passenger/PassengerDashboard";
import SearchResults from "./pages/passenger/SearchResults";
import SeatSelection from "./pages/passenger/SeatSelection";
import LiveTracking from "./pages/passenger/LiveTracking";
import BookingConfirmation from "./pages/passenger/BookingConfirmation";
import MyBookings from "./pages/passenger/MyBookings";
import ProfilePage from "./pages/passenger/ProfilePage";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ConductorDashboard from "./pages/conductor/ConductorDashboard";
import ConductorLogin from "./pages/conductor/ConductorLogin";
import AdminRoutes from "./pages/admin/AdminRoutes";
import AdminVehicles from "./pages/admin/AdminVehicles";
import AdminStaff from "./pages/admin/AdminStaff";
import AdminTrips from "./pages/admin/AdminTrips";
import AdminIssues from "./pages/admin/AdminIssues";
import MunicipalLogin from "./pages/municipal/MunicipalLogin";
import MunicipalDashboard from "./pages/municipal/MunicipalDashboard";
import MunicipalAnalytics from "./pages/municipal/MunicipalAnalytics";
import MunicipalCrowd from "./pages/municipal/MunicipalCrowd";
import Header from "./components/Header";
import Login from "./pages/passenger/LoginPage";
import VerifyEmailForm from "./pages/passenger/userVerification";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/useAuthStore.js";
import { useStaffStore } from "./store/useStaffStore.js";
import FullPageLoader from "./components/LoadingPage.jsx";
import ForgotPasswordPage from "./pages/passenger/forgotPassword.jsx";
import ResetPasswordPage from "./pages/passenger/resetPassword.jsx";
import { useEffect } from "react";
import AuthForm from "./pages/passenger/SignUpPage";
import RequireStaffAuth from "./components/RequireStaffAuth";

import { useLocation } from "react-router-dom";

const ConditionalHeader = () => {
  const location = useLocation();
  const hideHeaderRoutes = ["/admin", "/municipal", "/conductor"];
  const shouldHide = hideHeaderRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  return shouldHide ? null : <Header />;
};

function App() {
  const { authUser, loading, checkAuth } = useAuthStore();
  const { checkAuth: checkStaffAuth } = useStaffStore();

  useEffect(() => {
    checkAuth();
    checkStaffAuth();
  }, [checkAuth, checkStaffAuth]);

  if (loading) {
    return <FullPageLoader />;
  }
  console.log(authUser);
  return (
    <Router>
      <div className="pt-16 min-h-screen bg-gray-50">
        <ConditionalHeader />
        <Routes>
          <Route
            path="/signup"
            element={!authUser ? <AuthForm /> : <Navigate to="/" />}
          />
          <Route path="/verify-email/:email" element={<VerifyEmailForm />} />
          <Route path="/resend-verification" element={<VerifyEmailForm />} />
          <Route
            path="/login"
            element={!authUser ? <Login /> : <Navigate to="/" />}
          />
          <Route path="/forgot" element={<ForgotPasswordPage />} />
          <Route path="/reset/:token" element={<ResetPasswordPage />} />
          <Route path="/" element={<PassengerDashboard />} />
          <Route path="/search" element={<SearchResults />} />
          <Route
            path="/seats/:tripId"
            element={authUser ? <SeatSelection /> : <Navigate to="/login" />}
          />
          <Route path="/tracking/:tripId" element={<LiveTracking />} />
          <Route
            path="/booking-confirmation"
            element={
              authUser ? <BookingConfirmation /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/booking"
            element={authUser ? <MyBookings /> : <Navigate to="/login" />}
          />
          <Route
            path="/profile"
            element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
          />



          <Route path="/conductor/login" element={<ConductorLogin />} />
          <Route path="/conductor/dashboard" element={
            <RequireStaffAuth allowedRoles={["CONDUCTOR"]}>
              <ConductorDashboard />
            </RequireStaffAuth>
          } />

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={
            <RequireStaffAuth allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </RequireStaffAuth>
          } />
          <Route path="/admin/routes" element={
            <RequireStaffAuth allowedRoles={["ADMIN"]}>
              <AdminRoutes />
            </RequireStaffAuth>
          } />
          <Route path="/admin/vehicles" element={
            <RequireStaffAuth allowedRoles={["ADMIN"]}>
              <AdminVehicles />
            </RequireStaffAuth>
          } />
          <Route path="/admin/staff" element={
            <RequireStaffAuth allowedRoles={["ADMIN"]}>
              <AdminStaff />
            </RequireStaffAuth>
          } />
          <Route path="/admin/trips" element={
            <RequireStaffAuth allowedRoles={["ADMIN"]}>
              <AdminTrips />
            </RequireStaffAuth>
          } />
          <Route path="/admin/issues" element={
            <RequireStaffAuth allowedRoles={["ADMIN"]}>
              <AdminIssues />
            </RequireStaffAuth>
          } />

          <Route path="/municipal/login" element={<MunicipalLogin />} />
          <Route path="/municipal/dashboard" element={
            <RequireStaffAuth allowedRoles={["MUNICIPAL"]}>
              <MunicipalDashboard />
            </RequireStaffAuth>
          } />
          <Route path="/municipal/analytics" element={
            <RequireStaffAuth allowedRoles={["MUNICIPAL"]}>
              <MunicipalAnalytics />
            </RequireStaffAuth>
          } />
          <Route path="/municipal/crowd" element={
            <RequireStaffAuth allowedRoles={["MUNICIPAL"]}>
              <MunicipalCrowd />
            </RequireStaffAuth>
          } />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
