import { $api } from "../Headers"

class Payment {
    static Payment = async (data) => {
        const response = await $api.post(`/payments`, data)
        return response;
    }
    static PaymentHistory = async (data) => {
        const response = await $api.get(`/payments/filter/${data?.location_id}/${data?.startDate}/${data?.endDate}/${data?.searchName}/${data?.method}/${data?.amount}/page?page=${data?.page}`,)
        return response;
    }
    static SverkaGet = async (data) => {
        const response = await $api.get(`/payments/location/${data?.location_id}/${data?.startDate}/${data?.endDate}/page?page=${data?.page}`)
        return response;
    }
} export { Payment }