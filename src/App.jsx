// src/app/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { managerRoutes, supperAdminRoutes } from "./routes/adminRoutes";
import { userRoutes } from "./routes/userRoutes";

import Login from "./Components/Login/Login";
import ErrorPage from "./Components/ErrorPage/ErrorPage";
import ProtectedRoute from "./Components/ProtectedRoute";
import Register from "./Components/Register/Register";
import AdminLayout from "./layouts/AdminLayout";
import SuperAdminLayout from "./layouts/SuperAdminLayout";
// import ProtectedAdminsRoute from "../features/auth/ProtectedAdminsRoute";
// import ProtectedUsersRoute from "../features/auth/ProtectedUserRoute";
import MainLayout from "./layouts/MainLayout";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ForgotPassword from "./Components/ResetPassword/ForgotPassword";
import WarehouseLayout from "./layouts/WarehouseLayout";
import { warehouseRoutes } from "./routes/warehouseRoutes";
import DilerLayout from "./layouts/DilerLayout";
import { dilertoutes } from "./routes/dilerRoutes";
import AppLayout from "./layouts/AppLayout";

// React Query client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route element={
              <ProtectedRoute>
                <SuperAdminLayout />
              </ProtectedRoute>
            }>
              {supperAdminRoutes.map((r) => {
                return (
                  <Route key={r.name} path={r.path} element={r.element} />
                )
              })}
            </Route>
            <Route element={
              // <ProtectedAdminsRoute>
              <AdminLayout />
              // </ProtectedAdminsRoute>
            }>
              {managerRoutes?.map((r) => {
                return (
                  <Route key={r.name} path={r.path} element={r.element} />
                )
              })}
            </Route>
            <Route element={
              // <ProtectedUsersRoute>
              <MainLayout />
              // </ProtectedUsersRoute>
            }>
              {userRoutes.map((r) => {
                return (
                  <Route key={r.name} path={r.path} element={r.element} />
                )
              })}
            </Route>
            <Route element={
              // <ProtectedUsersRoute>
              <WarehouseLayout />
              // </ProtectedUsersRoute>
            }>
              {warehouseRoutes?.map((r) => {
                return (
                  <Route key={r.name} path={r.path} element={r.element} />
                )
              })}
            </Route>
            <Route element={
              // <ProtectedUsersRoute>
              <DilerLayout />
              // </ProtectedUsersRoute>
            }>
              {dilertoutes?.map((r) => {
                return (
                  <Route key={r.name} path={r.path} element={r.element} />
                )
              })}
            </Route>
            <Route path="*" element={<ErrorPage />} />
          </Route>
        </Routes>

      </Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </QueryClientProvider>
  );
}

export default App;
