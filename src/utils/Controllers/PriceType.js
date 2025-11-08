import { $api } from "../Headers"

class PriceType {
    static PriceTypeCreatee = async (data) => {
        const response = await $api.post(`/price-type`, data)
        return response;
    }
    static PriceTypeGet = async (id) => {
        const response = await $api.get(`/price-type/all/${id}`)
        return response;
    }
    static PriceTypeDelete = async (id) => {
        const response = await $api.delete(`/price-type/${id}`)
        return response;
    }
    static PriceTypeEdit = async (id, data) => {
        const response = await $api.put(`/price-type/${id}`, data)
        return response;
    }
} export { PriceType }