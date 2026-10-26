import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
    FiUsers,
    FiMapPin,
    FiRefreshCw,
} from "react-icons/fi";
import toast from "react-hot-toast";

const API_URL = "https://icareteleradiology-backend.vercel.app/api";

export default function DashboardPage() {
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalCenters, setTotalCenters] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Get token using the same logic as AllUsers.jsx
    const getToken = () => {
        try {
            const savedResponse = JSON.parse(
                localStorage.getItem("responseList") || "null"
            );

            const user = Array.isArray(savedResponse)
                ? savedResponse[0]
                : savedResponse?.responseList?.[0] ?? savedResponse;

            return (
                user?.token ||
                localStorage.getItem("token") ||
                null
            );
        } catch {
            return localStorage.getItem("token");
        }
    };

    // Fetch users and centers
    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const token = getToken();

            if (!token) {
                throw new Error("Session expired. Please login again.");
            }

            const headers = {
                Authorization: token.startsWith("Bearer ")
                    ? token
                    : `Bearer ${token}`,
                "Content-Type": "application/json",
            };

            const payload = {
                genericRequestEntity: {
                    companyID: 1,
                    dropDown: false,
                    detailFlag: false,
                },
            };

            const [usersResponse, centersResponse] = await Promise.all([
                axios.post(
                    `${API_URL}/users`,
                    payload,
                    { headers }
                ),
                axios.post(
                    `${API_URL}/centers`,
                    payload,
                    { headers }
                ),
            ]);

            const usersData = usersResponse.data;
            const centersData = centersResponse.data;

            if (
                usersData?.success === false ||
                usersData?.responseStatus === false ||
                Number(usersData?.statusCode) >= 400
            ) {
                throw new Error(
                    usersData?.errorMessage ||
                    usersData?.message ||
                    "Unable to fetch users."
                );
            }

            if (
                centersData?.success === false ||
                centersData?.responseStatus === false ||
                Number(centersData?.statusCode) >= 400
            ) {
                throw new Error(
                    centersData?.errorMessage ||
                    centersData?.message ||
                    "Unable to fetch centers."
                );
            }

            const users = Array.isArray(usersData?.responseList)
                ? usersData.responseList
                : [];

            const centers = Array.isArray(centersData?.responseList)
                ? centersData.responseList
                : [];

            setTotalUsers(users.length);
            setTotalCenters(centers.length);
        } catch (err) {
            console.error("Dashboard fetch error:", {
                message: err.message,
                status: err.response?.status,
                data: err.response?.data,
                url: err.config?.url,
            });

            setError(
                err.response?.data?.errorMessage ||
                err.response?.data?.message ||
                err.message ||
                "Dashboard data load nahi ho saka."
            );

            toast.error("Dashboard data load nahi ho saka.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const cards = [
        {
            title: "Total Centers",
            count: totalCenters,
            icon: <FiMapPin size={24} />,
            iconStyle: "bg-blue-50 text-blue-600",
        },
        {
            title: "Total Users",
            count: totalUsers,
            icon: <FiUsers size={24} />,
            iconStyle: "bg-green-50 text-green-600",
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Dashboard
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage your centers and users
                    </p>
                </div>

                <button
                    type="button"
                    onClick={fetchDashboardData}
                    disabled={loading}
                    className="flex items-center gap-2 border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                    <FiRefreshCw
                        className={loading ? "animate-spin" : ""}
                    />
                    Refresh
                </button>
            </div>

            {error && (
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <span>{error}</span>

                    <button
                        type="button"
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
                        className="border border-gray-200 bg-white p-5 shadow-sm"
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
                                className={`flex h-12 w-12 items-center justify-center ${card.iconStyle}`}
                            >
                                {card.icon}
                            </div>
                        </div>

                        <p className="mt-4 text-xs text-gray-400">
                            {loading
                                ? "Loading data..."
                                : "Total records"}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
