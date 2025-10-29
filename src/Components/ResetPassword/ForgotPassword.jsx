import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ResetPassword } from "../../utils/Controllers/ResedPassword";
import { Alert } from "../../utils/Alert";

export default function ForgotPassword() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSendEmail = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await ResetPassword.EmailSend({ email: email });
            Alert("Tasdiqlash kodi emailingizga yuborildi", "success");
            setStep(2);
        } catch (err) {
            Alert("Tasdiqlash kodini yuborish muvaffaqiyatsiz tugadi ❌", "error");
        } finally {
            setLoading(false);
        }
    };

    // 2-qadam: OTP ni tasdiqlash
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await ResetPassword.SendOtp({ email: email, otp: otp });
            Alert("OTP muvaffaqiyatli tasdiqlandi", "success");
            setStep(3);
        } catch (err) {
            Alert("Noto'g'ri OTP", "error");
        } finally {
            setLoading(false);
        }
    };

    // 3-qadam: parolni tiklash
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) return Alert("Parollar mos kelmadi", "error");

        try {
            setLoading(true);
            await ResetPassword.PasswordSend({ email: email, password: password, otp: otp });
            Alert("Parol muvaffaqiyatli tiklandi", "success");
            setStep(1);
            setEmail("");
            setOtp("");
            setPassword("");
            setConfirmPassword("");
            navigate("/login");
        } catch (err) {
            Alert("Parolni tiklashda xatolik", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="w-full min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
            <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md transition-all duration-300">
                <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
                    Parolni Unutdingizmi?
                </h1>

                {step === 1 && (
                    <form onSubmit={handleSendEmail}>
                        <p className="text-gray-600 text-center mb-6">
                            Email manzilingizni kiriting va biz sizga tasdiqlash kodini yuboramiz.
                        </p>
                        <label className="block text-gray-700 mb-2">Email Manzil</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none mb-4"
                            placeholder="siz@example.com"
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                        >
                            {loading ? "Yuborilmoqda..." : "Email Yuborish"}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyOtp}>
                        <p className="text-gray-600 text-center mb-6">
                            Biz yuborgan 6 xonali kodni kiriting <b>{email}</b>
                        </p>
                        <label className="block text-gray-700 mb-2">Tasdiqlash Kodi</label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none mb-4"
                            placeholder="OTP ni kiriting"
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                        >
                            {loading ? "Tasdiqlanmoqda..." : "OTP ni Tasdiqlash"}
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword}>
                        <p className="text-gray-600 text-center mb-6">
                            Yangi parolingizni yarating.
                        </p>
                        <label className="block text-gray-700 mb-2">Yangi Parol</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none mb-4"
                            placeholder="Yangi parolni kiriting"
                            required
                        />

                        <label className="block text-gray-700 mb-2">
                            Yangi Parolni Tasdiqlang
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none mb-4"
                            placeholder="Yangi parolni qayta kiriting"
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                        >
                            {loading ? "Saqlanmoqda..." : "Parolni Tiklash"}
                        </button>
                    </form>
                )}

                <div className="flex justify-center mt-6 space-x-2">
                    {[1, 2, 3].map((num) => (
                        <div
                            key={num}
                            className={`w-3 h-3 rounded-full ${step === num ? "bg-blue-600" : "bg-gray-300"
                                }`}
                        ></div>
                    ))}
                </div>
            </div>
        </section>
    );
}