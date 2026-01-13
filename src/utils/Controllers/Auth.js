import axios from "axios";
import { $api, BASE_URL } from "../Headers";
class Auth {
    static Login = async (data) => {
        const response = await axios.post(`${BASE_URL}/api/auth/login`, data)
        return response;
    }
    static Logout = async (data) => {
        const response = await $api.post(`/auth/logout`, data)
        return response;
    }
}

export { Auth };