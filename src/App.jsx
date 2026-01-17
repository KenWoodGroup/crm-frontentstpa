// src/app/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { supperAdminRoutes } from "./routes/adminRoutes";
import { userRoutes } from "./routes/userRoutes";
import Login from "./Components/Login/Login";
import ErrorPage from "./Components/ErrorPage/ErrorPage";
import SuperAdminLayout from "./layouts/SuperAdminLayout";
import MainLayout from "./layouts/MainLayout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ForgotPassword from "./Components/ResetPassword/ForgotPassword";
import WarehouseLayout from "./layouts/WarehouseLayout";
import { warehouseRoutes } from "./routes/warehouseRoutes";
import AppLayout from "./layouts/AppLayout";
import ManagerLayout from "./layouts/ManagerLayout";
import { managerRoutes } from "./routes/managerRoutes";
import Factory from "./Components/ProtectedRoutes/Factory";
import SuperAdmin from "./Components/ProtectedRoutes/SuperAdmin";
import Manager from "./Components/ProtectedRoutes/Manager";
import Warehouse from "./Components/ProtectedRoutes/Warehouse";
import MWarehouseLayout from "./layouts/MWarehouseLayout";
import Mwarehouse from "./Components/ProtectedRoutes/Mwarehouse";
import { mWarehouseRoutes } from "./routes/mWarehouseRoutes";
import SocketProvider from "./context/SocketProvider";


// React Query client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <SocketProvider>
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
                <Mwarehouse>
                  <MWarehouseLayout />
                </Mwarehouse>
              }>
                {mWarehouseRoutes?.map((r) => {
                  return (
                    <Route key={r.name} path={r.path} element={r.element} />
                  )
                })}
              </Route>
              <Route path="*" element={<ErrorPage />} />
            </Route>
          </Routes>
        </SocketProvider>
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
