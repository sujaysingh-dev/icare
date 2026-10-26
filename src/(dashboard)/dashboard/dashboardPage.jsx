import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { FiUsers, FiMapPin, FiRefreshCw } from "react-icons/fi";
import toast from "react-hot-toast";

const API_URL = "https://icareteleradiology-backend.vercel.app/api";

export default function DashboardPage() {
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalCenters, setTotalCenters] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Get token from localStorage
    const getToken = () => {
        try {
            const savedResponse = JSON.parse(
                localStorage.getItem("responseList") || "null"
            );

            const user = Array.isArray(savedResponse)
                ? savedResponse[0]
                : savedResponse?.responseList?.[0] ?? savedResponse;

            return user?.token || localStorage.getItem("token") || null;
        } catch {
            return localStorage.getItem("token");
        }
    };

    // Clear session and redirect to login
    const handleSessionExpired = () => {
        localStorage.removeItem("responseList");
        localStorage.removeItem("token");

        toast.error("Session expired. Please login again.");
        window.location.replace("/login");
    };

    // Get authorization headers
    const getAuthHeaders = () => {
        const token = getToken();

        if (!token) {
            handleSessionExpired();
            return null;
        }

        return {
            Authorization: token.startsWith("Bearer ")
                ? token
                : `Bearer ${token}`,
            "Content-Type": "application/json",
        };
    };

    // Fetch dashboard data
    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const headers = getAuthHeaders();

            if (!headers) return;

            const payload = {
                genericRequestEntity: {
                    companyID: 1,
                    dropDown: false,
                    detailFlag: false,
                },
            };

            const [usersResponse, centersResponse] = await Promise.all([
                axios.post(`${API_URL}/users`, payload, { headers }),
                axios.post(`${API_URL}/centers`, payload, { headers }),
            ]);

            const usersData = usersResponse.data;
            const centersData = centersResponse.data;

            if (
                usersData?.success === false ||
                usersData?.responseStatus === false
            ) {
                throw new Error(
                    usersData?.errorMessage ||
                    usersData?.message ||
                    "Unable to fetch users."
                );
            }

            if (
                centersData?.success === false ||
                centersData?.responseStatus === false
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
            console.error("Dashboard API Error:", {
                message: err.message,
                status: err.response?.status,
                response: err.response?.data,
                url: err.config?.url,
            });

            if (err.response?.status === 401) {
                handleSessionExpired();
                return;
            }

            const message =
                err.response?.data?.errorMessage ||
                err.response?.data?.message ||
                (err.response?.status
                    ? `API request failed (${err.response.status})`
                    : err.message) ||
                "Dashboard data load nahi ho saka.";

            setError(message);
            toast.error(message);
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
            {/* Header */}
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

            {/* Error */}
            {error && (
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <span>{error}</span>

                    <button
                        type="button"
                        onClick={fetchDashboardData}
                        disabled={loading}
                        className="font-medium underline disabled:opacity-50"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Dashboard Cards */}
            <div className="grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2">
                {cards.map((card) => (
                    <div
                        key={card.title}
                        className="w-full border border-gray-200 bg-white p-5 shadow-sm"
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
                                className={`flex h-12 w-12 shrink-0 items-center justify-center ${card.iconStyle}`}
                            >
                                {card.icon}
                            </div>
                        </div>

                        <p className="mt-4 text-xs text-gray-400">
                            {loading ? "Loading data..." : "Total records"}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
