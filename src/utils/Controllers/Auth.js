import axios from "axios";
import { BASE_URL } from "../Headers";
class Auth {
    static Login = async (data) => {
        const response = await axios.post(`${BASE_URL}/api/auth/login`, data)
        return response;
    }
}

export { Auth };