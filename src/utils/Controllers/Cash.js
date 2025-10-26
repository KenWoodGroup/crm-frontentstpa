import { $api } from "../Headers"

class Cash {
    static CreateKassa = async (data) => {
        const response = await $api.post(`/cash`, data)
        return response;
    }
    static GetKassa = async (id) => {
        const response = await $api.get(`/cash/location/${id}`,)
        return response;
    }
    static DeleteKassa = async (id) => {
        const response = await $api.delete(`/cash/${id}`,)
        return response;
    }
    static EditKassa = async (id, data) => {
        const response = await $api.put(`/cash/${id}`, data)
        return response;
    }
} export { Cash }