import { useEffect, useState } from "react";
import axios from "axios";
import { FiUsers, FiMapPin, FiRefreshCw } from "react-icons/fi";

const API_URL = "https://icareteleradiology-backend.vercel.app/api";

export default function DashboardPage() {
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalCenters, setTotalCenters] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            const config = {
                headers: token
                    ? { Authorization: `Bearer ${token}` }
                    : {},
            };

            const [usersResponse, centersResponse] = await Promise.all([
                axios.get(`${API_URL}/users`, config),
                axios.get(`${API_URL}/centers`, config),
            ]);

            const usersData = usersResponse.data?.responseList;
            const centersData = centersResponse.data?.responseList;

            setTotalUsers(
                Array.isArray(usersData) ? usersData.length : 0
            );

            setTotalCenters(
                Array.isArray(centersData) ? centersData.length : 0
            );
        } catch (err) {
            console.error("Dashboard API Error:", err);
            setError("Dashboard data load nahi ho saka.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const cards = [
        {
            title: "Total Centers",
            count: totalCenters,
            icon: <FiMapPin size={24} />,
            iconStyle: "bg-blue-100 text-blue-600",
        },
        {
            title: "Total Users",
            count: totalUsers,
            icon: <FiUsers size={24} />,
            iconStyle: "bg-green-100 text-green-600",
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
            <div className="mb-6 flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Dashboard
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Centers aur users ka overview
                    </p>
                </div>

                <button
                    onClick={fetchDashboardData}
                    disabled={loading}
                    className="flex items-center gap-2 rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                    <FiRefreshCw className={loading ? "animate-spin" : ""} />
                    Refresh
                </button>
            </div>

            {error && (
                <div className="mb-4 flex items-center justify-between gap-3 rounded-sm border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <span>{error}</span>
                    <button
                        onClick={fetchDashboardData}
                        className="font-medium underline"
                    >
                        Retry
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {cards.map((card) => (
                    <div
                        key={card.title}
                        className="rounded-sm border border-gray-200 bg-white p-5 shadow-sm"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    {card.title}
                                </p>

                                <h2 className="mt-3 text-3xl font-semibold text-gray-900">
                                    {loading ? "..." : card.count}
                                </h2>
                            </div>

                            <div
                                className={`flex h-12 w-12 items-center justify-center rounded-sm ${card.iconStyle}`}
                            >
                                {card.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
