import { Route, Routes } from "react-router-dom";
import Login from "./(authentication)/Login";
import DashboardRoutes from "./(dashboard)/dashboardRoutes";
import Landing from "./(page)/landing";
import ProtectedRoutes from "./ProtectedRoutes";

export default function App() {
    return (
        <div>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />

                <Route element={<ProtectedRoutes />}>
                    <Route path="/*" element={<DashboardRoutes />} />
                </Route>
            </Routes>
        </div>
    )
}