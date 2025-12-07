import React, { useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { User, Mail, Phone, Camera, Save } from "lucide-react";

const ProfilePage = () => {
    const { authUser } = useAuthStore();
    const [formData, setFormData] = useState({
        fullName: authUser?.fullName || "",
        email: authUser?.email || "",
        contact_number: authUser?.contact_number || "",
    });
    const [isEditing, setIsEditing] = useState(false);

    // Mock update - in a real app, you'd call an API here
    const handleSave = (e) => {
        setIsEditing(false);
        // TODO: Implement updateProfile in authStore/backend
        console.log("Updated Profile:", formData);
    };

    if (!authUser) return (
        <div className="min-h-screen flex items-center justify-center">
            <p>Please login to view your profile.</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pt-20 px-4">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm p-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                    <button
                        onClick={() => isEditing ? handleSave({}) : setIsEditing(true)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${isEditing
                            ? "bg-green-600 text-white hover:bg-green-700"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                    >
                        {isEditing ? (
                            <div className="flex items-center space-x-2">
                                <Save className="h-4 w-4" />
                                <span>Save Changes</span>
                            </div>
                        ) : "Edit Profile"}
                    </button>
                </div>

                <div className="flex flex-col items-center mb-8">
                    <div className="relative">
                        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4 overflow-hidden">
                            {authUser.profile_picture_url ? (
                                <img src={authUser.profile_picture_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User className="h-10 w-10" />
                            )}
                        </div>
                        {isEditing && (
                            <button className="absolute bottom-4 right-0 bg-gray-900 text-white p-2 rounded-full hover:bg-gray-800">
                                <Camera className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">{authUser.fullName}</h2>
                    <p className="text-gray-500">Passenger</p>
                </div>

                <form className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                value={formData.fullName}
                                disabled={!isEditing}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${isEditing ? "border-gray-300 bg-white" : "border-gray-100 bg-gray-50 text-gray-500"
                                    }`}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="email"
                                value={formData.email}
                                disabled // Email usually can't be changed easily
                                className="w-full pl-10 pr-4 py-3 border border-gray-100 bg-gray-50 text-gray-500 rounded-lg cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="tel"
                                value={formData.contact_number}
                                disabled={!isEditing}
                                onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${isEditing ? "border-gray-300 bg-white" : "border-gray-100 bg-gray-50 text-gray-500"
                                    }`}
                            />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;
