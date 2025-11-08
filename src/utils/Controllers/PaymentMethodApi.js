import { $api } from "../Headers"

class PaymentMethodApi {
    static PaymentTypeCreate = async (data) => {
        const response = await $api.post(`/payment-method`, data)
        return response;
    }
    static PaymentTypeGet = async (id) => {
        const response = await $api.get(`/payment-method/all/${id}`)
        return response;
    }
    static PaymentTypeDelete = async (id) => {
        const response = await $api.delete(`/payment-method/${id}`)
        return response;
    }
    static PaymentTypeUpdate = async (id, data) => {
        const response = await $api.put(`/payment-method/${id}`, data)
        return response;
    }
} export { PaymentMethodApi }