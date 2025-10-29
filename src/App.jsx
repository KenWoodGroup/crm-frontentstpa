// src/app/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { supperAdminRoutes } from "./routes/adminRoutes";
import { userRoutes } from "./routes/userRoutes";

import Login from "./Components/Login/Login";
import ErrorPage from "./Components/ErrorPage/ErrorPage";
import ProtectedRoute from "./Components/ProtectedRoute";
import SuperAdminLayout from "./layouts/SuperAdminLayout";
import MainLayout from "./layouts/MainLayout";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ForgotPassword from "./Components/ResetPassword/ForgotPassword";
import WarehouseLayout from "./layouts/WarehouseLayout";
import { warehouseRoutes } from "./routes/warehouseRoutes";
import DilerLayout from "./layouts/DilerLayout";
import { dilertoutes } from "./routes/dilerRoutes";
import AppLayout from "./layouts/AppLayout";
import CompanyLayout from "./layouts/CompanyLayout";
import { companyRoutes } from "./routes/companyRoutes";
import CompanyWarehouseLayout from "./layouts/CompanyWarehouseLayout";
import { companyWarehouseRoutes } from "./routes/companyWarehouseRoutes";
import CompanyDilerLayout from "./layouts/CompanyDilerLayout";
import { companyDiler } from "./routes/companyDilerRoutes";
import ManagerLayout from "./layouts/ManagerLayout";
import { managerRoutes } from "./routes/managerRoutes";
import Factory from "./Components/ProtectedRoutes/Factory";
import SuperAdmin from "./Components/ProtectedRoutes/SuperAdmin";
import Manager from "./Components/ProtectedRoutes/Manager";
import Warehouse from "./Components/ProtectedRoutes/Warehouse";
import Dealer from "./Components/ProtectedRoutes/Dealer";

// React Query client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route element={
              <SuperAdmin>
                <SuperAdminLayout />
              </SuperAdmin>

            }>
              {supperAdminRoutes.map((r) => {
                return (
                  <Route key={r.name} path={r.path} element={r.element} />
                )
              })}
            </Route>
            <Route element={
              <Manager>
                <ManagerLayout />
              </Manager>
            }>
              {managerRoutes?.map((r) => {
                return (
                  <Route key={r.name} path={r.path} element={r.element} />
                )
              })}
            </Route>
            <Route element={
              <Factory>
                <MainLayout />
              </Factory>
            }>
              {userRoutes.map((r) => {
                return (
                  <Route key={r.name} path={r.path} element={r.element} />
                )
              })}
            </Route>
            <Route element={
              <Warehouse>
                <WarehouseLayout />
              </Warehouse>
            }>
              {warehouseRoutes?.map((r) => {
                return (
                  <Route key={r.name} path={r.path} element={r.element} />
                )
              })}
            </Route>
            <Route element={
              <Dealer>
                <DilerLayout />
              </Dealer>
            }>
              {dilertoutes?.map((r) => {
                return (
                  <Route key={r.name} path={r.path} element={r.element} />
                )
              })}
            </Route>
            {/* <Route element={
              // <ProtectedUsersRoute>
              <CompanyLayout />
              // </ProtectedUsersRoute>
            }>
              {companyRoutes?.map((r) => {
                return (
                  <Route key={r.name} path={r.path} element={r.element} />
                )
              })}
            </Route> */}
            {/* <Route element={
              // <ProtectedUsersRoute>
              <CompanyWarehouseLayout />
              // </ProtectedUsersRoute>
            }>
              {companyWarehouseRoutes?.map((r) => {
                return (
                  <Route key={r.name} path={r.path} element={r.element} />
                )
              })}
            </Route>
            <Route element={
              // <ProtectedUsersRoute>
              <CompanyDilerLayout />
              // </ProtectedUsersRoute>
            }>
              {companyDiler?.map((r) => {
                return (
                  <Route key={r.name} path={r.path} element={r.element} />
                )
              })}
            </Route> */}
            <Route path="*" element={<ErrorPage />} />
          </Route>
        </Routes>

      </Router >
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </QueryClientProvider >
  );
}

export default App;
