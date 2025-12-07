import { Navigate, useLocation } from "react-router-dom";
import { useStaffStore } from "../store/useStaffStore";
import FullPageLoader from "./LoadingPage";

const RequireStaffAuth = ({ children, allowedRoles }) => {
    const { staffUser, loading } = useStaffStore();
    const location = useLocation();

    if (loading) {
        return <FullPageLoader />;
    }

    if (!staffUser) {
        // Redirect to appropriate login based on the path
        let loginPath = "/";
        if (location.pathname.includes("/admin")) loginPath = "/admin/login";
        else if (location.pathname.includes("/conductor")) loginPath = "/conductor/login";
        else if (location.pathname.includes("/driver")) loginPath = "/driver/login";
        else if (location.pathname.includes("/municipal")) loginPath = "/municipal/login";

        return <Navigate to={loginPath} state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(staffUser.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default RequireStaffAuth;
