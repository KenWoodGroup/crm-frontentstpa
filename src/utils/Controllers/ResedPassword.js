import axios from "../axios"

class ResetPassword {
    static EmailSend = async (data) => {
        const response = await axios.post(`/api/verification/send`, data);
        return response
    }
    static SendOtp = async (data) => {
        const response = await axios.post(`/api/verification/verify`, data);
        return response
    }
    static PasswordSend = async (data) => {
        const response = await axios.post(`/api/auth/reset-password`, data);
        return response
    }
} export { ResetPassword }