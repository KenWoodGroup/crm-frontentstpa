import React, { useState } from "react";
import "./_components/Register.css";
import { NavLink, useNavigate } from "react-router-dom";
import { notify } from "../../utils/toast";
import Spinner from "../../Components/UI/spinner/Spinner";
import CloseIcon from "../../Components/UI/Svg/CloseIcon";
import { location } from "../../utils/Controllers/location";
import { locationInfo } from "../../utils/Controllers/locationInfo";

export default function Register() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [oferta, setOferta] = useState(false);
    const [form, setForm] = useState({
        companyName: "",
        companyEmail: "",
        companyPhone: "",
        fullName: "",
        password: "",
        confirmPassword: "",
        bank: "",
        stir: "",
        accountNumber: "",
        legalAddress: "",
        activityType: "",
        termsAccepted: false,
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleActivitySelect = (type) => {
        setForm((prev) => ({ ...prev, activityType: type }));
    };
    const checkOfertaRead = (e) => {
        const isConfirmed = sessionStorage.getItem("oferta");
        if (isConfirmed !== "true") {
            setOferta(true);
        } else {
            handleChange(e);
        }
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        if (!form.companyName.trim()) newErrors.companyName = "Kompaniya nomi kiritilishi shart";
        if (!form.companyEmail.includes("@")) newErrors.companyEmail = "Email noto‘g‘ri kiritilgan";
        if (!form.companyPhone.trim()) newErrors.companyPhone = "Telefon raqam kiritilishi shart";
        if (!form.fullName.trim()) newErrors.fullName = "Ism va familiya kiritilishi shart";
        if (form.password.length < 8) newErrors.password = "Parol kamida 8 belgidan iborat bo‘lishi kerak";
        if (form.password !== form.confirmPassword)
            newErrors.confirmPassword = "Parollar bir xil emas";
        if (!form.bank.trim()) newErrors.bank = "Bank nomi kiritilishi kerak";
        if (!form.stir.trim()) newErrors.stir = "STIR/INN kiritilishi shart";
        if (!form.accountNumber.trim()) newErrors.accountNumber = "Hisob raqami kiritilishi shart";
        if (!form.legalAddress.trim()) newErrors.legalAddress = "Yuridik manzil kiritilishi shart";
        if (!form.activityType) newErrors.activityType = "Faoliyat turini tanlang";
        if (!form.termsAccepted)
            newErrors.termsAccepted = "Ofertani o‘qib chiqib, rozilik bildiring";

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            console.log("✅ Form ma’lumotlari:", form);
            try {
                setLoading(true);
                const readyLocation = {
                    type: form.activityType,
                    name: form.companyName,
                    full_name: form.fullName,
                    address: form.legalAddress,
                    phone: form.companyPhone,
                    email: form.companyEmail,
                    password: form.password,
                }
                const base_data = await location.Post(readyLocation);
                console.log("base-data:", base_data);

                if (base_data.status === 201) {
                    try {
                        const readyLocationInfo = {
                            location_id: base_data.data.location.id,
                            key: "bank, stir, account_number, terms_accepted",
                            value: form.bank + ", " + form.stir + ", " + form.accountNumber + ", " + form.termsAccepted,
                        }
                        console.log("rli", readyLocationInfo);

                        const locationData = await locationInfo.Post(readyLocationInfo);
                        console.log(locationData);
                        notify.success("Ro‘yxatdan o‘tish muvaffaqiyatli yakunlandi");
                        navigate("/login");
                    } catch (e) {
                        console.error("❌ Xatolik yuz berdi:", e);

                    }
                }

            } catch (error) {
                console.error("❌ Ro‘yxatdan o‘tishda xatolik:", error);
                if (error.status === 400) {
                    const message = error.response?.data?.message;
                    if (typeof message === "string") {
                        notify.error(message);
                    } else if (Array.isArray(message)) {
                        message.map((item) => {
                            return (
                                notify.error(item)
                            );
                        })
                    } else {
                        notify.error("Noma’lum xatolik yuz berdi. Iltimos, qayta urinib ko‘ring.");
                    }
                }
            } finally {
                setLoading(false);
            }
        };
    }
    if (oferta) {
        return (
            <section className="oferta-section fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="oferta-container rounded-2xl p-8 bg-white max-w-lg w-full">
                    <span onClick={() => setOferta(false)} className="oferta-close cursor-pointer absolute top-4 right-4">
                        <CloseIcon />
                    </span>
                    <h1>Oferta shartlari</h1>
                    <p>Bu yerda oferta shartlari matni bo‘ladi...</p>
                    <button onClick={() => {
                        setOferta(false);
                        sessionStorage.setItem("oferta", "true");
                    }}>Ofertani o‘qib chiqdim va roziman</button>
                </div>
            </section>
        )
    }
    return (
        <main className="regis-root max-w-[1100px] mx-auto my-0 px-[160px] py-[40px]">
            <div className="text-center mb-10">
                <div className="regis-logo inline-block bg-[var(--regis-bg)] text-[#fff] font-semibold text-[26px] w-[60px] h-[60px] rounded-full leading-[60px] mb-[10px]">KW</div>
                <div>
                    <h1 className="m-0 text-[22px] text-[#222]">Kenwood Group</h1>
                    <p className="text-[#777] text-[14px]">Ombor nazorati va inventarizatsiya platformasi</p>
                </div>
            </div>

            <form className="regis-form bg-[#fff] rounded-[16px] shadow-[0_0_15px_rgba(0,0,0,0.08)] p-[30px] [@media(max-width:370px)]:p-[12px]" onSubmit={handleSubmit} noValidate>
                <div className="regis-grid grid grid-cols-2 gap-y-6 gap-x-10">
                    <div>
                        <label className="regis-label">Kompaniya nomi</label>
                        <input
                            type="text"
                            name="companyName"
                            value={form.companyName}
                            onChange={handleChange}
                            placeholder="Kenwood Qurilish MChJ"
                        />
                        {errors.companyName && <div className="regis-error">{errors.companyName}</div>}

                        <label className="regis-label">Kompaniya emaili</label>
                        <input
                            type="email"
                            name="companyEmail"
                            value={form.companyEmail}
                            onChange={handleChange}
                            placeholder="email@company.uz"
                        />
                        {errors.companyEmail && <div className="regis-error">{errors.companyEmail}</div>}

                        <label className="regis-label">Telefon raqam</label>
                        <input
                            type="tel"
                            name="companyPhone"
                            value={form.companyPhone}
                            onChange={handleChange}
                            placeholder="+998 90 123 45 67"
                        />
                        {errors.companyPhone && <div className="regis-error">{errors.companyPhone}</div>}

                        <label className="regis-label">FISh</label>
                        <input
                            type="text"
                            name="fullName"
                            value={form.fullName}
                            onChange={handleChange}
                            placeholder="Ism Familiya"
                        />
                        {errors.fullName && <div className="regis-error">{errors.fullName}</div>}
                    </div>

                    <div>
                        <label className="regis-label">Parol</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Kamida 8 belgi"
                        />
                        {errors.password && <div className="regis-error">{errors.password}</div>}

                        <label className="regis-label">Parolni tasdiqlash</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            placeholder="Parolni qayta kiriting"
                        />
                        {errors.confirmPassword && <div className="regis-error">{errors.confirmPassword}</div>}

                        <label className="regis-label">Bank</label>
                        <input
                            type="text"
                            name="bank"
                            value={form.bank}
                            onChange={handleChange}
                            placeholder="Bank nomi"
                        />
                        {errors.bank && <div className="regis-error">{errors.bank}</div>}

                        <label className="regis-label">STIR / INN</label>
                        <input
                            type="text"
                            name="stir"
                            value={form.stir}
                            onChange={handleChange}
                            placeholder="Masalan: 123456789"
                        />
                        {errors.stir && <div className="regis-error">{errors.stir}</div>}
                    </div>
                </div>

                <div className="regis-grid">
                    <div>
                        <label className="regis-label">Hisob raqami</label>
                        <input
                            type="text"
                            name="accountNumber"
                            value={form.accountNumber}
                            onChange={handleChange}
                            placeholder="1234 5678 9101 1121"
                        />
                        {errors.accountNumber && <div className="regis-error">{errors.accountNumber}</div>}
                    </div>

                    <div>
                        <label className="regis-label">Yuridik manzil</label>
                        <input
                            type="text"
                            name="legalAddress"
                            value={form.legalAddress}
                            onChange={handleChange}
                            placeholder="Viloyat, shahar, ko‘cha, uy"
                        />
                        {errors.legalAddress && <div className="regis-error">{errors.legalAddress}</div>}
                    </div>
                </div>

                {/* Faoliyat turi tanlash */}
                <div className="regis-activity">
                    <span className="regis-label">Faoliyat turi</span>
                    <div className="regis-activity-options">
                        <button
                            type="button"
                            className={`regis-activity-btn ${form.activityType === "factory" ? "active" : ""
                                }`}
                            onClick={() => handleActivitySelect("factory")}
                        >
                            Ta’minotchi
                        </button>
                        <button
                            type="button"
                            className={`regis-activity-btn ${form.activityType === "company" ? "active" : ""
                                }`}
                            onClick={() => handleActivitySelect("company")}
                        >
                            Iste’molchi
                        </button>
                    </div>
                    {errors.activityType && <div className="regis-error">{errors.activityType}</div>}
                </div>

                <div className="regis-footer">
                    <label className="regis-checkbox">
                        <input
                            type="checkbox"
                            name="termsAccepted"
                            checked={form.termsAccepted}
                            onChange={checkOfertaRead}
                        />
                        <span>
                            Men <span onClick={() => setOferta(true)} className="regis-link">oferta shartlarini </span>  o‘qib chiqdim va roziman
                        </span>
                    </label>
                    {errors.termsAccepted && <div className="regis-error">{errors.termsAccepted}</div>}

                    <div className="footer-regis">
                        {loading ? (
                            <button type="button" className="regis-btn flex gap-4" disabled>
                                <Spinner />
                                Ro‘yxatdan o‘tish...
                            </button>) :

                            <button type="submit" className="regis-btn">Ro‘yxatdan o‘tish</button>
                        }
                        <NavLink to={"/login"}>
                            <button type="button">Accountingiz bormi</button>
                        </NavLink>
                    </div>
                </div>
            </form>
        </main>
    );
}
