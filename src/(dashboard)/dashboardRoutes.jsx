import { Route, Routes, Navigate } from "react-router-dom";
import { useState } from "react";

import DashboardPage from "./dashboard/dashboardPage";
import AllCenters from "./centers/allCenters";
import AllUsers from "./users/allUser";
import DashboardSidebar from "../../components/dashboardSidebar";
import ErrorPage from "./errorPage";

export default function DashboardRoutes() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-40 bg-black/50 md:hidden"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-50
                    w-64 bg-black text-white
                    transform transition-transform duration-300
                    md:relative md:translate-x-0 md:shrink-0
                    ${
                        sidebarOpen
                            ? "translate-x-0"
                            : "-translate-x-full"
                    }
                `}
            >
                <DashboardSidebar
                    onClose={() => setSidebarOpen(false)}
                />
            </aside>

            {/* Main Content */}
            <main className="flex min-w-0 flex-1 flex-col overflow-hidden">

                {/* Mobile Header */}
                <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-white px-4 md:hidden">
                    <button
                        type="button"
                        onClick={() => setSidebarOpen(true)}
                        className="text-2xl text-gray-800"
                        aria-label="Open sidebar"
                        aria-expanded={sidebarOpen}
                    >
                        ☰
                    </button>

                    <h1 className="text-lg font-semibold text-gray-900">
                        ICARE
                    </h1>
                </header>

                {/* Page Routes */}
                <div className="min-h-0 flex-1 overflow-y-auto">
                    <Routes>
                        <Route
                            index
                            element={<Navigate to="/dashboard" replace />}
                        />

                        <Route
                            path="/dashboard"
                            element={<DashboardPage />}
                        />

                        <Route
                            path="/centers"
                            element={<AllCenters />}
                        />

                        <Route
                            path="/users"
                            element={<AllUsers />}
                        />

                        <Route
                            path="*"
                            element={<ErrorPage />}
                        />
                    </Routes>
                </div>

            </main>
        </div>
    );
}
