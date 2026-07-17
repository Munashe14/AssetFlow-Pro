import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AssetsPage from "./pages/AssetsPage";
import CheckoutsPage from "./pages/CheckoutsPage";
import MaintenancePage from "./pages/MaintanencePage";
import RepairsPage from "./pages/RepairsPage";
import DisposalPage from "./pages/DisposalPage";
import ReportsPage from "./pages/ReportsPage";
import NotificationsPage from "./pages/NotificationsPage";
import UsersPage from "./pages/UsersPage";
import Departmentspage from "./pages/DepartmentsPage";
import CreateAccountPage from "./pages/CreateAccountPage";
import DepreciationPage from "./pages/DepreciationPage";

function PrivateRoute({children}) {
  const token = localStorage.getItem("access_token");
  return token ? children: <Navigate to="/login" replace/>;
}

export default function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/create-account" element={<CreateAccountPage />} />
        <Route path="/" element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />}/>
          <Route path="assets" element={<AssetsPage />}/>
          <Route path="checkouts" element={<CheckoutsPage />}/>
          <Route path="maintenance" element={<MaintenancePage />}/>
          <Route path="repairs" element={<RepairsPage/>}/>
          <Route path="disposal" element={<DisposalPage/>}/>
          <Route path="reports" element={<ReportsPage/>}/>
          <Route path="depreciation" element={<DepreciationPage />}/>
          <Route path="notifications" element={<NotificationsPage/>}/>
          <Route path="users" element={<UsersPage/>}/>
          <Route path="departments" element={<Departmentspage/>}/>
        </Route>
    </Routes>
    </BrowserRouter>
    
  );
}