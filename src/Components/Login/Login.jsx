import React, { useState } from "react";
import "./_components/login.css"
import Eye from "../../Components/UI/Svg/Eye";
import ClosedEye from "../../Components/UI/Svg/ClosedEye";
import { Auth } from "../../utils/Controllers/Auth";
import { NavLink, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { notify } from "../../utils/toast";
import Spinner from "../../Components/UI/spinner/Spinner";



export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const validate = () => {
    const em = email.trim();
    if (!em) return "Elektron pochta manzili kiriting.";
    if (!emailRegex.test(em)) return "Iltimos, yaroqli elektron pochta manzili kiriting.";
    if (!password) return "Parol kiriting.";
    if (password.length < 6) return "Parol kamida 6 ta belgidan iborat boʻlishi kerak.";
    return "";
  };

  // const handleForgot = () => {
  //   alert("Parolni tiklash: sizga email orqali ko'rsatmalar yuboriladi (demo).");
  // };

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
      const base_data = await Auth.Login({ email, password });
      console.log(base_data);

      const { data } = base_data;
      const { access_token, refresh_token } = data?.tokens || {};
      const { id, role, location_id } = data?.newUser;

      Cookies.set("token", access_token);
      Cookies.set("refresh_token", refresh_token);

      const roleMap = {
        super_admin: "SPAfefefeUID",
        admin: "AutngergUID",
        factory: "SefwfmgrUID",
        company: "SefwfmgrUID",
        warehouse: "SesdsdfmgrUID",
        dealer: "SwedsdfmgrUID",
      };

      const roleLinks = [
        { role: "super_admin", vektor: "/" },
        { role: "admin", vektor: "/manager/dashboard" },
        { role: "factory", vektor: "/factory/dashboard" },
        { role: "warehouse", vektor: "/warehouse/dashboard" },
        { role: "dealer", vektor: "/diler/dashboard" },
        { role: "company", vektor: "/company/dashboard" },
      ];

      Cookies.set("nesw", roleMap[role] || "");
      Cookies.set("us_nesw", id);
      Cookies.set("ul_nesw", location_id);
      Cookies.set("usd_nesw", data?.newUser?.location?.parent_id);

      notify.success("Login muvaffaqiyatli!");

      if (
        data?.newUser?.location?.parent?.type === "company" &&
        data?.newUser?.role === "warehouse"
      ) {
        navigate("/company-warehouse/dashboard");
      } else if (data?.newUser?.location?.parent?.type === "company" &&
        data?.newUser?.role === "dealer") {

      }
      else {
        const vektor_obj = roleLinks.find((item) => item.role === role);
        navigate(vektor_obj?.vektor || "/");
      }
      if (base_data?.status === 401) {
        console.log(base_data?.message || "Email yoki Parol xato");
      }
    } catch (err) {
      setError(
        err?.message === "Request failed with status code 401"
          ? "Email yoki Parol xato"
          : "Tizim xatosi yuz berdi."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page flex items-center justify-center px-9 py-20 ">
      <div className="login-card w-full max-w-[520px] rounded-[14px] p-[28px] border border-[#e6eef2]">
        <div className="flex gap-3.5 items-center mb-4.5">
          <div className="login-logo shadow-[0_8px_24px_rgba(19, 102, 214, 0.12)] w-16 h-16 rounded-[16px] flex items-center justify-center text-[#fff] font-bold text-[20px]" aria-hidden="true">KW</div>
          <div className="flex flex-col gap-0.5">
            <h1 id="login-heading" className="m-0 text-[18px] font-medium">KENWOOD</h1>
            <p className="m-0 text-[#6b7280] text-[13px] ">Ombor nazorati — tez, aniq va ishonchli</p>
          </div>
        </div>

        <form
          className="flex-col gap-3.5 mt-1.5"
          onSubmit={handleSubmit}
          noValidate
        >
          {error && (
            <div id="login-error" className="border-[rgba(239, 68, 68, 0.12)] text-[#ef4444] shadow-[0_6px_14px_rgba(239, 68, 68, 0.03)] px-2.5 py-3 rounded-[10px] text-[13px]">
              {error}
            </div>
          )}

          <label className="login-field" htmlFor="login-email">
            <span className="login-label">Elektron pochta</span>
            <input
              id="login-email"
              className="login-input"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="misol: user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              aria-required="true"
            />
          </label>

          <label className="login-field" htmlFor="login-password">
            <div className="login-field-top">
              <span className="login-label">Parol</span>
            </div>

            <div className="relative flex items-center">
              <input
                id="login-password"
                className="login-input login-input-with-icon"
                type={showPassword ? "text" : "password"}
                placeholder="Parolingizni kiriting"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
                aria-required="true"
              />

              <button
                type="button"
                className="login-toggle-icon absolute right-2 bg-transparent border-none h-8 w-8 inline-flex items-center justify-center rounded-[8px] text-[#6b7280]"
                onClick={() => setShowPassword((s) => !s)}
                aria-pressed={showPassword}
                aria-label={showPassword ? "Parolni yashirish" : "Parolni ko‘rsatish"}
                disabled={loading}
              >
                {/* Eye / Eye-off SVGs */}
                {showPassword ? (
                  <Eye />
                ) : (
                  <ClosedEye />
                )}
              </button>
            </div>

            <div className="flex justify-between mt-2">
              <NavLink to={"/register"}>
                <button type="button" className="bg-[rgba(19, 102, 214, 0.06)] px-1.5 py-2.5 rounded-full border-none text-[13px] font-medium">Ro'yhatdan o'tish</button>
              </NavLink>
              <NavLink to={"/forgot-password"}>
                <button type="button" className="login-forgot bg-[rgba(19, 102, 214, 0.06)] px-1.5 py-2.5 rounded-full border-none text-[13px] font-medium" disabled={loading}>
                  Parolni unutdingizmi?
                </button>
              </NavLink>
            </div>
          </label>

          <div className="flex gap-3 items-center mt-2">
            <button
              type="submit"
              className="login-btn login-primary login-full"
              disabled={loading}
              aria-busy={loading}
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

        <footer className="mt-4 text-center font-[3px] text-[#6b7280] " aria-hidden="true">
          <small>© {new Date().getFullYear()}  KENWOOD Barcha huquqlar himoyalangan.</small>
        </footer>
      </div>
    </div>
  );
}
