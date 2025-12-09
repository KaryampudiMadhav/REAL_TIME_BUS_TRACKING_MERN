import React, { useState } from "react";
import { Link, useLocation, Navigate, Outlet } from "react-router-dom";
import {
    LayoutDashboard,
    Bus,
    Users,
    MapPin,
    Activity,
    AlertTriangle,
    Menu,
    X,
    LogOut,
} from "lucide-react";
import { useStaffStore } from "../store/useStaffStore";
import { motion, AnimatePresence } from "framer-motion";

const AdminLayout = () => {
    const { staffUser, staffLogout } = useStaffStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    if (!staffUser || staffUser.role !== "ADMIN") {
        return <Navigate to="/admin/login" replace />;
    }

    const handleLogout = async () => {
        await staffLogout();
    };

    const navLinks = [
        { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
        { icon: MapPin, label: "Routes", path: "/admin/routes" },
        { icon: Bus, label: "Vehicles", path: "/admin/vehicles" },
        { icon: Users, label: "Staff", path: "/admin/staff" },
        { icon: Activity, label: "Trips", path: "/admin/trips" },
        { icon: AlertTriangle, label: "Issues", path: "/admin/issues" },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header */}
            <motion.nav
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="glass sticky top-0 z-50 border-b border-white/20"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-200">
                                <LayoutDashboard className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600">
                                    Admin <span className="text-blue-600">Portal</span>
                                </h1>
                                <p className="text-xs text-gray-500 font-medium tracking-wide">
                                    BUS TRANSIT SYSTEM
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-6">
                            <div className="hidden md:flex space-x-2">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 font-medium ${isActive(link.path)
                                                ? "bg-blue-50 text-blue-600 shadow-sm"
                                                : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                                            }`}
                                    >
                                        <link.icon className="h-4 w-4" />
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                            <div className="h-8 w-px bg-gray-200 hidden md:block" />
                            <button
                                onClick={handleLogout}
                                className="hidden md:flex items-center gap-2 text-gray-500 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl transition-all font-semibold"
                            >
                                <LogOut className="h-5 w-5" />
                                <span>Logout</span>
                            </button>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                            >
                                {isMobileMenuOpen ? (
                                    <X className="h-6 w-6" />
                                ) : (
                                    <Menu className="h-6 w-6" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
                        >
                            <div className="px-4 py-4 space-y-2">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive(link.path)
                                                ? "bg-blue-50 text-blue-600"
                                                : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                                            }`}
                                    >
                                        <link.icon className="h-5 w-5" />
                                        {link.label}
                                    </Link>
                                ))}
                                <div className="h-px bg-gray-100 my-2" />
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all font-semibold"
                                >
                                    <LogOut className="h-5 w-5" />
                                    Logout
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.nav>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
