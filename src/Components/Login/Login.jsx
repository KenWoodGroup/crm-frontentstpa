import React, { useState } from "react";
import "./_components/login.css";
import Eye from "../../Components/UI/Svg/Eye";
import ClosedEye from "../../Components/UI/Svg/ClosedEye";
import { Auth } from "../../utils/Controllers/Auth";
import { locationInfo } from "../../utils/Controllers/locationInfo";
import { NavLink, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { notify } from "../../utils/toast";
import Spinner from "../../Components/UI/spinner/Spinner";
import Offerta from "./_components/Offerta";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOfferta, setShowOfferta] = useState(false);
  const [userData, setUserData] = useState(null);

  const navigate = useNavigate();

  const validate = () => {
    const un = username.trim();
    if (!un) return "Username kiriting.";
    if (!password) return "Parol kiriting.";
    if (password.length < 6)
      return "Parol kamida 6 ta belgidan iborat boʻlishi kerak.";
    return "";
  };

  const checkOffertaStatus = async (locationId) => {
    try {
      if (!locationId) return false;
      const response = await locationInfo?.GetInfo(locationId);
      return response?.data;
    } catch (error) {
      console.log("Error checking offerta status:", error);
      return false;
    }
  };

  const saveUserData = (data) => {
    const { access_token, refresh_token } = data?.tokens || {};
    const { id, role, location_id, location } = data?.newUser || {};

    const sellAccessEntry = location?.location_data?.find(
      (item) => item.key === "sell_access"
    );
    const sell_access_value = sellAccessEntry?.value;

    const sell_access =
      sell_access_value === true ||
      sell_access_value === "true" ||
      sell_access_value === 1 ||
      sell_access_value === "1";

    Cookies.set("token", access_token);
    Cookies.set("refresh_token", refresh_token);

    const roleMap = {
      super_admin: "SPAfefefeUID",
      admin: "AutngergUID",
      factory: "SefwfmgrUID",
      company: "SeCfmgrUID",
      warehouse: "SesdsdfmgrUID",
      cashier: "KesdsdfmgrUID",
      dealer: "SwedsdfmgrUID",
      independent: "inedsdfmgrUID",
      com_warehouse: "comedsdfmgrUID",
      building: "builewweUID",
    };

    Cookies.set("nesw", roleMap[role] || "");
    Cookies.set("us_nesw", id);
    Cookies.set("ul_nesw", location_id);
    Cookies.set("usd_nesw", location?.parent_id);

    const hashedValue = sell_access ? "terrwerwerw" : "fdqewfewf";
    Cookies.set("sedqwdqdqwd", hashedValue);

    const userWithAccess = { ...data.newUser, sell_access };
    setUserData(userWithAccess);

    return { locationId: location_id, userData: userWithAccess, role };
  };

  const redirectUser = (userData) => {
    if (!userData) return;
    const role = userData.role;

    if (
      userData?.location?.parent?.type === "company" &&
      role === "warehouse"
    ) {
      navigate("/company-warehouse/dashboard");
    } else if (
      userData?.location?.parent?.type === "company" &&
      role === "dealer"
    ) {
      navigate("/diler/dashboard");
    } else {
      const roleLinks = [
        { role: "super_admin", vektor: "/" },
        { role: "admin", vektor: "/manager/dashboard" },
        { role: "factory", vektor: "/factory/dashboard" },
        { role: "warehouse", vektor: "/warehouse/dashboard" },
        { role: "cashier", vektor: "/warehouse/dashboard" },
        { role: "dealer", vektor: "/diler/dashboard" },
        { role: "company", vektor: "/company/dashboard" },
        { role: "independent", vektor: "/independent/dashboard" },
        { role: "com_warehouse", vektor: "/company-warehouse/dashboard" },
        { role: "building", vektor: "/building/dashboard" },
      ];
      const vektor_obj = roleLinks.find((item) => item.role === role);
      navigate(vektor_obj?.vektor || "/");
    }
  };

  const shouldShowOfferta = (role) => {
    return ["factory"].includes(role);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    try {
      setLoading(true);
      const base_data = await Auth.Login({ username, password });
      const { data } = base_data;

      if (base_data?.status === 401) {
        setError("Username yoki Parol xato");
        return;
      }

      const { locationId, userData, role } = saveUserData(data);
      notify.success("Login muvaffaqiyatli!");

      if (shouldShowOfferta(role)) {
        const offertaAccepted = await checkOffertaStatus(locationId);

        if (!offertaAccepted) {
          setShowOfferta(true);
        } else {
          redirectUser(userData);
        }
      } else {
        redirectUser(userData);
      }
    } catch (err) {
      setError(
        err?.message === "Request failed with status code 401"
          ? "Username yoki Parol xato"
          : "Tizim xatosi yuz berdi."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOffertaClose = () => {
    setShowOfferta(false);
    Cookies.remove("token");
    Cookies.remove("refresh_token");
    Cookies.remove("nesw");
    Cookies.remove("us_nesw");
    Cookies.remove("ul_nesw");
    Cookies.remove("usd_nesw");
    Cookies.remove("sedqwdqdqwd");
    setUserData(null);
    setUsername("");
    setPassword("");
  };

  const handleOffertaAgree = () => {
    setShowOfferta(false);
    if (userData) redirectUser(userData);
  };

  return (
    <div className="login-page flex items-center justify-center px-9 py-20 bg-white dark:bg-background-dark !important transition-colors duration-200 !important">
      <div className="login-card w-full max-w-[520px] rounded-[14px] p-[28px] border border-[#e6eef2] dark:border-gray-700 !important bg-white dark:bg-card-dark !important shadow-lg dark:shadow-gray-900/20 !important transition-colors duration-200 !important">
        <div className="flex gap-3.5 items-center mb-4.5">
          <div className="login-logo shadow-[0_8px_24px_rgba(19,102,214,0.12)] dark:shadow-[0_8px_24px_rgba(19,102,214,0.2)] !important w-16 h-16 rounded-[16px] flex items-center justify-center text-[#fff] font-bold text-[20px] bg-blue-600 dark:bg-blue-700 !important">
            KW
          </div>
          <div className="flex flex-col gap-0.5">
            <h1 className="m-0 text-[18px] font-medium text-gray-900 dark:text-text-dark !important">KENWOOD</h1>
            <p className="m-0 text-[#6b7280] dark:text-gray-400 !important text-[13px]">
              Ombor nazorati — tez, aniq va ishonchli
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex-col gap-3.5 mt-1.5">
          {error && (
            <div className="border-[rgba(239,68,68,0.12)] dark:border-red-800/30 !important text-[#ef4444] dark:text-red-400 !important shadow-[0_6px_14px_rgba(239,68,68,0.03)] dark:shadow-red-900/10 !important px-2.5 py-3 rounded-[10px] text-[13px] bg-white dark:bg-red-900/10 !important">
              {error}
            </div>
          )}

          <label className="login-field" htmlFor="login-username">
            <span className="login-label text-gray-700 dark:text-gray-300 !important">Username</span>
            <input
              id="login-username"
              className="login-input border border-gray-300 dark:border-gray-600 !important bg-white dark:bg-card-dark !important text-gray-900 dark:text-gray-100 !important placeholder-gray-500 dark:placeholder-gray-400 !important"
              type="text"
              placeholder="Username kiriting"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </label>

          <label className="login-field" htmlFor="login-password">
            <div className="login-field-top">
              <span className="login-label text-gray-700 dark:text-gray-300 !important">Parol</span>
            </div>

            <div className="relative flex items-center">
              <input
                id="login-password"
                className="login-input login-input-with-icon border border-gray-300 dark:border-gray-600 !important bg-white dark:bg-gray-800 !important text-gray-900 dark:text-gray-100 !important placeholder-gray-500 dark:placeholder-gray-400 !important"
                type={showPassword ? "text" : "password"}
                placeholder="Parolingizni kiriting"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="login-toggle-icon absolute right-2 bg-transparent border-none h-8 w-8 inline-flex items-center justify-center rounded-[8px] text-[#6b7280] dark:text-gray-400 !important hover:text-gray-900 dark:hover:text-gray-200 !important hover:bg-gray-100 dark:hover:bg-gray-700 !important transition-colors duration-200 !important"
                onClick={() => setShowPassword((s) => !s)}
              >
                {showPassword ? <Eye /> : <ClosedEye />}
              </button>
            </div>
          </label>

          <div className="flex gap-3 items-center mt-2">
            <button
              type="submit"
              className="login-btn login-primary login-full bg-blue-600 dark:bg-blue-700 !important hover:bg-blue-700 dark:hover:bg-blue-600 !important text-white disabled:bg-blue-400 dark:disabled:bg-blue-800 !important transition-colors duration-200 !important"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner />
                  <span className="login-btn-text">Kirish...</span>
                </>
              ) : (
                <span className="login-btn-text">Kirish</span>
              )}
            </button>
          </div>
        </form>

        <footer className="mt-4 text-center font-[3px] text-[#6b7280] dark:text-gray-400 !important">
          <small>
            © {new Date().getFullYear()} KENWOOD Barcha huquqlar himoyalangan.
          </small>
        </footer>
      </div>

      <Offerta
        locationId={userData?.location_id}
        isOpen={showOfferta}
        onClose={handleOffertaClose}
        onAgree={handleOffertaAgree}
      />
    </div>
  );
}