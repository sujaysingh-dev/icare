import { NavLink, useNavigate } from "react-router-dom";
import {
    FiHome,
    FiUsers,
    FiMapPin,
    FiLogOut,
    FiX,
} from "react-icons/fi";

export default function DashboardSidebar({ onClose = () => {} }) {
    const navigate = useNavigate();

    const linkClass = ({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 text-md font-medium rounded-sm transition-colors duration-150 ${
            isActive
                ? "bg-white text-black"
                : "text-white/80 hover:bg-white/10 hover:text-white"
        }`;

    const handleLogout = () => {
        localStorage.removeItem("responseList");
        localStorage.removeItem("token");

        onClose();
        navigate("/login", { replace: true });
    };

    const handleNavigation = () => {
        onClose();
    };

    return (
        <div className="flex h-full w-full flex-col bg-black px-4 py-5">

            {/* Sidebar Header */}
            <div className="mb-8 flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-wider text-white">
                    ICARE
                </h2>

                {/* Close Button: Mobile Only */}
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-sm p-2 text-white hover:bg-white/10 md:hidden"
                    aria-label="Close sidebar"
                >
                    <FiX size={22} />
                </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-1 flex-col gap-2">
                <NavLink
                    to="/dashboard"
                    className={linkClass}
                    onClick={handleNavigation}
                >
                    <FiHome size={20} />
                    <span>Dashboard</span>
                </NavLink>

                <NavLink
                    to="/centers"
                    className={linkClass}
                    onClick={handleNavigation}
                >
                    <FiMapPin size={20} />
                    <span>Centers</span>
                </NavLink>

                <NavLink
                    to="/users"
                    className={linkClass}
                    onClick={handleNavigation}
                >
                    <FiUsers size={20} />
                    <span>Users</span>
                </NavLink>
            </nav>

            {/* Logout at Bottom */}
            <div className="mt-auto border-t border-white/10 pt-4">
                <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-sm px-3 py-2 text-md font-medium text-white/80 transition-colors hover:bg-red-500/20 hover:text-red-400"
                >
                    <FiLogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>

        </div>
    );
}
