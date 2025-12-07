import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bus, User, Lock, Eye, EyeOff } from "lucide-react";
import { useStaffStore } from "../../store/useStaffStore";
import toast from "react-hot-toast";

const ConductorLogin = () => {
    const navigate = useNavigate();
    const { staffLogin, loading: storeLoading } = useStaffStore();
    const [credentials, setCredentials] = useState({
        employeeId: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await staffLogin(credentials, "CONDUCTOR");

        if (result.success) {
            toast.success("Login successful!");
            navigate("/conductor/dashboard");
        } else {
            toast.error(result.error);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                        <Bus className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Conductor Portal
                    </h1>
                    <p className="text-gray-600">Sign in to manage trips and tickets</p>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Employee ID
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={credentials.employeeId}
                                    onChange={(e) =>
                                        setCredentials((prev) => ({
                                            ...prev,
                                            employeeId: e.target.value,
                                        }))
                                    }
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter your employee ID"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={credentials.password}
                                    onChange={(e) =>
                                        setCredentials((prev) => ({
                                            ...prev,
                                            password: e.target.value,
                                        }))
                                    }
                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || storeLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
                        >
                            {loading || storeLoading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    {/* Demo Credentials */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                            Demo Credentials:
                        </p>
                        <div className="text-xs text-gray-600 space-y-1">
                            <p>
                                <span className="font-medium">Conductor:</span> CON001 / password123
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConductorLogin;
