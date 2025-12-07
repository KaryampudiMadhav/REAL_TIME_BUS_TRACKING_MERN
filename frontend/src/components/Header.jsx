import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bus, User, BarChart3, LogOut, LayoutDashboard } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useStaffStore } from "../store/useStaffStore";
import toast from "react-hot-toast";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { authUser, logout: passengerLogout } = useAuthStore();
  const { staffUser, staffLogout } = useStaffStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  console.log("Header staffUser:", staffUser);

  const isActive = (path) => location.pathname.startsWith(path);

  const handleLogout = async () => {
    if (authUser) {
      await passengerLogout();
      navigate("/", { replace: true });
    } else if (staffUser) {
      await staffLogout();
      navigate("/", { replace: true });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Bus className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">
              BusTracker Pro
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">

            {/* STAFF VIEW */}
            {staffUser ? (
              <>
                <div className="px-3 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-md">
                  {staffUser.role} Portal
                </div>

                {(staffUser.role === "CONDUCTOR") && (
                  <Link to="/conductor/dashboard" className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${isActive("/conductor") ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-blue-600"}`}>
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                )}
                {(staffUser.role === "ADMIN") && (
                  <Link to="/admin/dashboard" className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${isActive("/admin") ? "bg-purple-100 text-purple-700" : "text-gray-600 hover:text-purple-600"}`}>
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                )}
                {(staffUser.role === "MUNICIPAL") && (
                  <Link to="/municipal/dashboard" className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${isActive("/municipal") ? "bg-orange-100 text-orange-700" : "text-gray-600 hover:text-orange-600"}`}>
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                )}
              </>
            ) : authUser ? (
              /* PASSENGER VIEW */
              <>
                <Link
                  to="/booking"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive("/booking")
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-blue-600"
                    }`}
                >
                  My Bookings
                </Link>
                <Link
                  to="/profile"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive("/profile")
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-blue-600"
                    }`}
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </>
            ) : (
              /* GUEST / LANDING VIEW */
              <>
                <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium text-sm">Passenger Login</Link>
                <div className="h-4 w-px bg-gray-300"></div>

                <Link to="/conductor/login" className="text-gray-600 hover:text-yellow-600 font-medium text-sm">Conductor</Link>
                <Link to="/admin/login" className="text-gray-600 hover:text-purple-600 font-medium text-sm">Admin</Link>
                <Link to="/municipal/login" className="text-gray-600 hover:text-orange-600 font-medium text-sm">Municipal</Link>
              </>
            )}

            {(authUser || staffUser) && (
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <LogOut className="h-6 w-6 rotate-180" /> // Using LogOut as close icon alternative or X
              ) : (
                <div className="space-y-1.5">
                  <div className="w-6 h-0.5 bg-gray-600"></div>
                  <div className="w-6 h-0.5 bg-gray-600"></div>
                  <div className="w-6 h-0.5 bg-gray-600"></div>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pt-2 pb-4 shadow-lg max-h-[80vh] overflow-y-auto">
          <div className="flex flex-col space-y-3">
            {staffUser ? (
              <>
                <div className="px-3 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-md text-center">
                  {staffUser.role} Portal
                </div>
                {(staffUser.role === "CONDUCTOR") && (
                  <Link to="/conductor/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Dashboard</Link>
                )}
                {(staffUser.role === "ADMIN") && (
                  <Link to="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Dashboard</Link>
                )}
                {(staffUser.role === "MUNICIPAL") && (
                  <Link to="/municipal/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Dashboard</Link>
                )}
              </>
            ) : authUser ? (
              <>
                <Link to="/booking" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">My Bookings</Link>
                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Profile</Link>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Passenger Login</Link>
                <Link to="/conductor/login" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Conductor Login</Link>
                <Link to="/admin/login" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Admin Login</Link>
              </>
            )}

            {(authUser || staffUser) && (
              <button
                onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
