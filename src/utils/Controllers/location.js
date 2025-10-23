import axios from "axios";
import { BASE_URL } from "../Headers";
import { $api } from "../Headers";
class location {
    static Post = async (data) => {
        const response = await axios.post(`${BASE_URL}/api/locations`, data)
        return response;
    }
    static Put = async (id, data) => {
        const response = await $api.put(`/locations/${id}`, data)
        return response;
    }
    static Get = async (id) => {
        const response = await $api.get(`/locations/${id}`)
        return response;
    }
    static GetAll = async () => {
        const response = await $api.get(`/locations`)
        return response;
    }

    static GetAllClients = async (id) => {
        const response = await $api.get(`/locations/all/${id}`)
        return response;
    }

    static getAllGroupLocations = async (id) => {
        const response = await $api.get(`/locations/all-location/${id}`)
        return response;
    }
    static Delete = async (id) => {
        const response = await $api.delete(`/locations/${id}`)
        return response;
    }
    static GetFactory = async (data) => {
        const response = await $api.get(`/locations/type/${data?.type}/all/page?page=${data?.page}`)
        return response;
    }
    static GetDebtor = async (data) => {
        const response = await $api.get(`/locations/debtor/${data?.parent_id}/${data?.type}/${data?.searchName}/page?page=${data?.page}`)
        return response;
    }
}

export { location };