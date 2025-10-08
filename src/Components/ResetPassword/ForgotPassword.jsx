import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // 1-step: send verification email
    const handleSendEmail = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            // await axios.post(`${BASE_URL}/api/verification/send`, { email });
            alert("Verification code sent to your email ✅");
            setStep(2);
        } catch (err) {
            alert("Failed to send verification code ❌");
        } finally {
            setLoading(false);
        }
    };

    // 2-step: verify OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            // await axios.post(`${BASE_URL}/api/verification/verify`, { email, otp });
            alert("OTP verified successfully ✅");
            setStep(3);
        } catch (err) {
            alert("Invalid OTP ❌");
        } finally {
            setLoading(false);
        }
    };

    // 3-step: reset password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) return alert("Passwords do not match ❌");

        try {
            setLoading(true);
            // await axios.post(`${BASE_URL}/api/auth/reset-password`, {
            //     email,
            //     password,
            //     otp,
            // });
            alert("Password successfully reset ✅");
            setStep(1);
            setEmail("");
            setOtp("");
            setPassword("");
            setConfirmPassword("");
            navigate("/login");
        } catch (err) {
            alert("Error resetting password ❌");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="w-full min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
            <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md transition-all duration-300">
                <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
                    Forgot Password
                </h1>

                {step === 1 && (
                    <form onSubmit={handleSendEmail}>
                        <p className="text-gray-600 text-center mb-6">
                            Enter your email and we’ll send you a verification code.
                        </p>
                        <label className="block text-gray-700 mb-2">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none mb-4"
                            placeholder="you@example.com"
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                        >
                            {loading ? "Sending..." : "Send Email"}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyOtp}>
                        <p className="text-gray-600 text-center mb-6">
                            Enter the 6-digit code we sent to <b>{email}</b>
                        </p>
                        <label className="block text-gray-700 mb-2">Verification Code</label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none mb-4"
                            placeholder="Enter OTP"
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                        >
                            {loading ? "Verifying..." : "Verify OTP"}
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword}>
                        <p className="text-gray-600 text-center mb-6">
                            Create your new password below.
                        </p>
                        <label className="block text-gray-700 mb-2">New Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none mb-4"
                            placeholder="Enter new password"
                            required
                        />

                        <label className="block text-gray-700 mb-2">
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none mb-4"
                            placeholder="Confirm new password"
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                        >
                            {loading ? "Saving..." : "Reset Password"}
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
