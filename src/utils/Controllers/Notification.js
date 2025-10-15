import { $api } from "../Headers"

class Notification {
    static GetNotification = async (data) => {
        const response = await $api.get(`/invoices/location/${data?.id}/page?page=${data?.page}`)
        return response;
    }
    static GetNotoficationById = async (id) => {
        const response = await $api.get(`/invoices/${id}`)
        return response;
    }

} export { Notification }