import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, User, UserCheck } from 'lucide-react';

const AdminStaff = () => {
  const [staff, setStaff] = useState([
    { id: '1', name: 'Rajesh Kumar', role: 'driver', employeeId: 'D001', phone: '+91 98765 43210', status: 'active' },
    { id: '2', name: 'Suresh Reddy', role: 'conductor', employeeId: 'C001', phone: '+91 98765 43211', status: 'active' },
    { id: '3', name: 'Amit Singh', role: 'driver', employeeId: 'D002', phone: '+91 98765 43212', status: 'inactive' },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    employeeId: '',
    phone: '',
    email: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Staff data:', formData);
    setShowModal(false);
    setEditingStaff(null);
    setFormData({ name: '', role: '', employeeId: '', phone: '', email: '' });
  };

  const handleEdit = (staffMember) => {
    setEditingStaff(staffMember);
    setFormData({
      name: staffMember.name,
      role: staffMember.role,
      employeeId: staffMember.employeeId,
      phone: staffMember.phone,
      email: staffMember.email || '',
    });
    setShowModal(true);
  };

  const handleDelete = (staffId) => {
    if (confirm('Are you sure you want to delete this staff member?')) {
      setStaff(staff.filter(s => s.id !== staffId));
    }
  };

  const toggleStatus = (staffId) => {
    setStaff(staff.map(s => 
      s.id === staffId 
        ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' }
        : s
    ));
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
              <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Staff</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <User className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{staff.filter(s => s.role === 'driver').length}</div>
                <div className="text-sm text-gray-600">Drivers</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{staff.filter(s => s.role === 'conductor').length}</div>
                <div className="text-sm text-gray-600">Conductors</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{staff.filter(s => s.status === 'active').length}</div>
                <div className="text-sm text-gray-600">Active Staff</div>
              </div>
            </div>
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Member</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {staff.map((staffMember) => (
                  <tr key={staffMember.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{staffMember.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                        staffMember.role === 'driver' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>{staffMember.role}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{staffMember.employeeId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{staffMember.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleStatus(staffMember.id)}
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          staffMember.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {staffMember.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => handleEdit(staffMember)} className="text-purple-600 hover:text-purple-700 p-1 rounded">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(staffMember.id)} className="text-red-600 hover:text-red-700 p-1 rounded">
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
            <h3 className="text-xl font-bold text-gray-900 mb-4">{editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select role</option>
                    <option value="driver">Driver</option>
                    <option value="conductor">Conductor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., D001 or C001"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email (Optional)</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="email@example.com"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingStaff(null);
                    setFormData({ name: '', role: '', employeeId: '', phone: '', email: '' });
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {editingStaff ? 'Update Staff' : 'Add Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStaff;
