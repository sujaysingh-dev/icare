import { useNavigate } from "react-router-dom";

export default function ErrorPage() {
    const navigate = useNavigate();

    return (
        <div className="h-screen flex flex-col items-center justify-center gap-4">
            <h1 className="text-6xl font-bold text-red-600">404</h1>
            <p className="text-lg">Page Not Found</p>
            <button onClick={() => navigate(-1)} className="border p-2 rounded-sm hover:bg-gray-100">Go Back</button>
        </div>
    );
}