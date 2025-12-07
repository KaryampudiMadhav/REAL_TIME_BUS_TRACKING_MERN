import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  XCircle,
  Loader
} from "lucide-react";
import { axiosInstance } from "../../utils/axiosInstance";
import toast from "react-hot-toast";

const AdminIssues = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Issues
  const fetchIssues = async () => {
    try {
      const response = await axiosInstance.get("/admin-dashboard/issues");
      setIssues(response.data);
    } catch (error) {
      console.error("Error fetching issues:", error);
      toast.error("Failed to load issues.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  // Handle Verify / Reject
  const customVerifyIssue = async (issueId, isVerified) => {
    try {
      await axiosInstance.post("/admin-dashboard/issues/verify", {
        issueIds: [issueId],
        isVerified: isVerified,
        adminNote: isVerified ? "Verified by Admin" : "Rejected by Admin"
      });
      toast.success(isVerified ? "Issue Verified" : "Issue Rejected");

      // Optimistic Update
      setIssues(prev => prev.map(issue =>
        issue._id === issueId
          ? { ...issue, is_verified: isVerified, status: isVerified ? "VERIFIED" : "REJECTED" }
          : issue
      ));
    } catch (error) {
      console.error("Verification failed:", error);
      toast.error("Action failed");
    }
  };

  const updateIssueStatus = () => {
    toast("Use Verify/Reject buttons.");
  };

  const getStatusColor = (status, isVerified) => {
    if (status === "REJECTED") return "bg-red-100 text-red-800";
    if (status === "RESOLVED") return "bg-green-100 text-green-800";
    if (isVerified || status === "VERIFIED") return "bg-blue-100 text-blue-800";
    if (status === "NEW") return "bg-orange-100 text-orange-800";
    return "bg-gray-100 text-gray-800";
  };

  const getIssueIcon = (type) => {
    switch (type) {
      case "breakdown": return "🔧";
      case "traffic": return "🚦";
      case "medical_emergency": return "🚑";
      case "accident": return "💥";
      default: return "⚠️";
    }
  };

  // Stats
  const newIssues = issues.filter(i => i.status === "NEW" || (!i.is_verified && i.status !== "REJECTED"));
  const verifiedIssuesCount = issues.filter(i => i.is_verified || i.status === "VERIFIED").length;
  const resolvedIssuesCount = issues.filter(i => i.status === "RESOLVED").length;

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader className="animate-spin h-8 w-8 text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Link to="/admin/dashboard" className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
              <ArrowLeft className="h-5 w-5" /> Back
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Issue Management</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-orange-500 flex items-center">
            <AlertTriangle className="h-8 w-8 text-orange-500 mr-4" />
            <div>
              <div className="text-2xl font-bold">{newIssues.length}</div>
              <div className="text-sm text-gray-600">Pending Verification</div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-blue-500 flex items-center">
            <CheckCircle className="h-8 w-8 text-blue-500 mr-4" />
            <div>
              <div className="text-2xl font-bold">{verifiedIssuesCount}</div>
              <div className="text-sm text-gray-600">Verified Issues</div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-green-500 flex items-center">
            <div className="text-2xl mr-4">✅</div>
            <div>
              <div className="text-2xl font-bold">{resolvedIssuesCount}</div>
              <div className="text-sm text-gray-600">Resolved Issues</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {issues.map((issue) => (
            <div key={issue._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className="text-3xl">{getIssueIcon(issue.issue_type)}</div>
                  <div>
                    <h3 className="text-lg font-semibold capitalize flex items-center gap-2">
                      {issue.issue_type?.replace(/_/g, " ")}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(issue.status, issue.is_verified)}`}>
                        {issue.status}
                      </span>
                    </h3>
                    <p className="text-gray-600 mt-1">{issue.message}</p>
                    <div className="text-xs text-gray-400 mt-2 flex gap-3">
                      <span>Reported: {new Date(issue.createdAt).toLocaleString()}</span>
                      {issue.trip_id && <span>Trip: {typeof issue.trip_id === 'object' ? issue.trip_id._id : issue.trip_id}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {!issue.is_verified && issue.status !== 'REJECTED' && (
                    <>
                      <button
                        onClick={() => customVerifyIssue(issue._id, true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1 font-bold text-sm"
                      >
                        <CheckCircle className="h-4 w-4" /> Verify
                      </button>
                      <button
                        onClick={() => customVerifyIssue(issue._id, false)}
                        className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 flex items-center gap-1 font-bold text-sm"
                      >
                        <XCircle className="h-4 w-4" /> Reject
                      </button>
                    </>
                  )}
                  {issue.is_verified && issue.status !== 'RESOLVED' && (
                    <span className="px-3 py-1 bg-green-50 text-green-700 text-sm font-semibold rounded-lg border border-green-100 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" /> Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {issues.length === 0 && <div className="text-center text-gray-500 py-10">No issues found.</div>}
        </div>
      </div>
    </div>
  );
};

export default AdminIssues;
