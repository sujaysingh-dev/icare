import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { FiUser, FiEye, FiEyeOff } from "react-icons/fi";

export default function Login() {
    const navigate = useNavigate();

    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showHide, setShowHide] = useState(false);

    useEffect(() => {
        try {
            const responseList = JSON.parse(
                localStorage.getItem("responseList") || "[]"
            );

            const token = responseList[0]?.token;

            if (token) {
                navigate("/dashboard", { replace: true });
            }
        } catch {
            localStorage.removeItem("responseList");
        }
    }, [navigate]);

    async function handleSubmit(e) {
        e.preventDefault();

        if (loading) return;

        setLoading(true);

        try {
            const response = await axios.post(
                "http://localhost:5000/api/auth/login",
                {
                    userName,
                    password,
                }
            );

            const data = response.data;

            if (data.success && data.responseList?.[0]?.token) {
                localStorage.setItem(
                    "errorMessage",
                    JSON.stringify(data.errorMessage ?? null)
                );

                localStorage.setItem(
                    "statusMessage",
                    data.statusMessage ?? ""
                );

                localStorage.setItem(
                    "statusCode",
                    JSON.stringify(data.statusCode ?? null)
                );

                localStorage.setItem(
                    "success",
                    JSON.stringify(data.success)
                );

                localStorage.setItem("date", data.date ?? "");

                localStorage.setItem(
                    "responseList",
                    JSON.stringify(data.responseList)
                );

                toast.success("Login successful!");
                navigate("/dashboard", { replace: true });
            } else {
                toast.error(
                    data.errorMessage ||
                    data.message ||
                    "Login failed."
                );
            }
        } catch (err) {
            toast.error(
                err.response?.data?.errorMessage ||
                err.response?.data?.message ||
                "Login failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    function showHidePassword() {
        setShowHide((prev) => !prev);
    }

    const label = "text-md font-medium";

    const inputBox =
        "w-full border border-gray-300 p-3 pr-10 rounded-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition duration-150";

    const button =
        "bg-black p-3 hover:bg-black/80 active:scale-[0.99] duration-100 text-white w-full rounded-sm disabled:opacity-50";

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="flex flex-col w-full max-w-sm border border-black/10 bg-white p-6 sm:p-8 rounded-sm shadow-xl">
                <h1 className="text-4xl font-bold mb-2 text-gray-900">
                    Login
                </h1>

                <p className="text-sm text-gray-500 mb-6">
                    Welcome back! Please login to your account.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {/* Username */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="username" className={label}>
                            Username
                        </label>

                        <div className="relative">
                            <input
                                type="text"
                                id="username"
                                value={userName}
                                onChange={(e) =>
                                    setUserName(e.target.value)
                                }
                                placeholder="Enter your username"
                                autoComplete="username"
                                className={inputBox}
                                required
                            />

                            <FiUser
                                size={18}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="password" className={label}>
                            Password
                        </label>

                        <div className="relative">
                            <input
                                type={showHide ? "text" : "password"}
                                id="password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                className={inputBox}
                                required
                            />

                            <button
                                type="button"
                                onClick={showHidePassword}
                                aria-label={
                                    showHide
                                        ? "Hide password"
                                        : "Show password"
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                            >
                                {showHide ? (
                                    <FiEyeOff size={18} />
                                ) : (
                                    <FiEye size={18} />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`${button} ${label}`}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
}
