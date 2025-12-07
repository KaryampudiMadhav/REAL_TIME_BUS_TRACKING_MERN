import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Edit, Trash2, MapPin } from "lucide-react";

const AdminRoutes = () => {
  const [routes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    from: "",
    to: "",
    distance: 0,
    duration: 0,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Route data:", formData);
    setShowModal(false);
    setEditingRoute(null);
    setFormData({ name: "", from: "", to: "", distance: 0, duration: 0 });
  };

  const handleEdit = (route) => {
    setEditingRoute(route);
    setFormData({
      name: route.name,
      from: route.from,
      to: route.to,
      distance: route.distance,
      duration: route.duration,
    });
    setShowModal(true);
  };

  const handleDelete = (routeId) => {
    if (confirm("Are you sure you want to delete this route?")) {
      console.log("Deleting route:", routeId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/admin/dashboard"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                Route Management
              </h1>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Route</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Routes Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    From - To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Distance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stops
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {routes.map((route) => (
                  <tr key={route.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {route.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {route.from} → {route.to}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {route.distance} km
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {route.duration}h
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {route.stops.length} stops
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(route)}
                          className="text-purple-600 hover:text-purple-700 p-1 rounded"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(route.id)}
                          className="text-red-600 hover:text-red-700 p-1 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {editingRoute ? "Edit Route" : "Add New Route"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Route Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Hyderabad - Bangalore"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From
                  </label>
                  <input
                    type="text"
                    value={formData.from}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, from: e.target.value }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Starting city"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To
                  </label>
                  <input
                    type="text"
                    value={formData.to}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, to: e.target.value }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Destination city"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Distance (km)
                  </label>
                  <input
                    type="number"
                    value={formData.distance}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        distance: Number(e.target.value),
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Distance in kilometers"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (hours)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        duration: Number(e.target.value),
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Estimated duration in hours"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingRoute(null);
                    setFormData({
                      name: "",
                      from: "",
                      to: "",
                      distance: 0,
                      duration: 0,
                    });
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {editingRoute ? "Update Route" : "Add Route"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRoutes;
