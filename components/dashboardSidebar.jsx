
import { NavLink, useNavigate } from "react-router-dom";

export default function DashboardSidebar() {
    const navigate = useNavigate();

    const linkClass = ({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 text-md font-medium rounded-sm transition-colors duration-150 ${isActive
            ? "bg-white text-black"
            : "text-white/80 hover:bg-white/10 hover:text-white"
        }`;

    function handleLogout() {
        // Clear login-related data
        [
            "errorMessage",
            "statusMessage",
            "statusCode",
            "success",
            "date",
            "responseList",
        ].forEach((key) => localStorage.removeItem(key));

        navigate("/login", { replace: true });
    }

    const logoutStyle = "w-full flex items-center gap-3 px-3 py-2 text-md font-medium rounded-sm text-white/80 hover:bg-red-500/20 hover:text-red-400 transition-colors duration-150"

    return (
        <aside className="h-screen bg-black text-white w-40 flex flex-col rounded-r-sm shrink-0">
            <div className="h-20 flex items-center justify-center text-2xl font-bold border-b border-white/10">
                ICARE
            </div>

            <nav className="flex flex-col p-3 gap-2">
                <NavLink to="/dashboard" className={linkClass} end>
                    Dashboard
                </NavLink>

                <NavLink to="/centers" className={linkClass}>
                    Centers
                </NavLink>

                <NavLink to="/users" className={linkClass}>
                    Users
                </NavLink>
            </nav>

            {/* Logout button at bottom */}
            <div className="mt-auto p-3 border-t border-white/10">
                <button type="button" onClick={handleLogout} className={logoutStyle}>
                    Logout
                </button>
            </div>
        </aside>
    );
}
