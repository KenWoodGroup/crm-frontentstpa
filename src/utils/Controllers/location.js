import axios from "axios";
import { BASE_URL } from "../Headers";
class location {
    static Post = async (data) => {
        const response = await axios.post(`${BASE_URL}/api/locations`, data)
        return response;
    }
    static Put = async (id, data) => {
        const response = await axios.put(`${BASE_URL}/api/locations/${id}`, data)
        return response;
    }
    static Get = async (id) => {
        const response = await axios.get(`${BASE_URL}/api/locations/${id}`)
        return response;
    }
    static GetAll = async () => {
        const response = await axios.get(`${BASE_URL}/api/auth/locations`)
        return response;
    }
    static Delete = async (id) => {
        const response = await axios.delete(`${BASE_URL}/api/locations/${id}`)
        return response;
    }
}

export { location };