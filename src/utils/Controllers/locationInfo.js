import axios from "axios";
import { $api, BASE_URL } from "../Headers";
class locationInfo {
    static Post = async (data) => {
        const response = await axios.post(`${BASE_URL}/api/location-info`, data)
        return response;
    }
    static Put = async (id, data) => {
        const response = await $api.put(`/location-info/${id}`, data)
        return response;
    }
    static Create = async (data) => {
        const response = await $api.post(`/location-info`, data)
        return response;
    }
    static GetInfo = async (id) => {
        const response = await $api.get(`/location-info/offer/${id}`)
        return response;
    }
    static GetLocationInfo = async (id) => {
        const response = await $api.get(`/location-info/${id}`)
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