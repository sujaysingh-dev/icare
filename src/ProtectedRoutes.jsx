
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoutes() {
    let token = null;

    try {
        const responseList = JSON.parse(
            localStorage.getItem("responseList") || "[]"
        );

        token = responseList[0]?.token || null;
    } catch {
        localStorage.clear();
    }

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
