import { Route, Routes } from "react-router-dom";
import DashboardPage from "./dashboard/dashboardPage";
import AllCenters from "./centers/allCenters";
import AllUsers from "./users/allUser";
import DashboardSidebar from "../../components/dashboardSidebar";
import ErrorPage from "./errorPage";

export default function DashboardRoutes() {
    return (
        <div className="flex max-h-screen">
            <div>
                <DashboardSidebar />
            </div>
            <div className="w-full max-h-screen overflow-hidden">
                <Routes>
                    <Route path="/dashboard" element={<DashboardPage/>} />
                    <Route path="/centers" element={<AllCenters />} />
                    <Route path="/users" element={<AllUsers />} />
                    <Route path="/*" element={<ErrorPage/>} />
                </Routes>
            </div>
        </div>
    )
}