import axios from "axios";
import { $api, BASE_URL } from "../Headers";
class locationInfo {
    static Post = async (data) => {
        const response = await axios.post(`${BASE_URL}/api/location-info`, data)
        return response;
    }
    static Put = async (id, data) => {
        const response = await axios.put(`${BASE_URL}/api/location-info/${id}`, data)
        return response;
    }
    static Get = async (id) => {
        const response = await axios.get(`${BASE_URL}/api/location-info/${id}`)
        return response;
    }
    static Delete = async (id) => {
        const response = await axios.delete(`${BASE_URL}/api/location-info/${id}`)
        return response;
    }

    static GetBarcode = async (id) => {
        const response = await $api.get(`/location-info/barcode/${id}`)
        return response;
    }

}

export { locationInfo };