// src/app/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { managerRoutes, supperAdminRoutes } from "./routes/adminRoutes";
import { userRoutes } from "./routes/userRoutes";

// Layout
// import Footer from "../components/layout/Footer";

// Sahifalar
// import Dashboard from "../pages/Dashboard";
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
// import ProductList from "../features/products/ProductList";
// import Cart from "../features/cart/Cart";
// import AdminOrders from "../features/orders/AdminOrders";

// React Query client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
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
          {/* <Route element={
            <ProtectedRoute>
              <HomePages/>
           </ProtectedRoute>
          }> 
            <Route path="/" element={
                <HomePage/>
            } />
            <Route path="/qwerty" element={<Qwerty/>} />
          </Route> */}

          <Route path="*" element={<ErrorPage />} />
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
