import { $api } from "../Headers"

class InvoicesApi {
    static CreateInvoice = async (data) => {
        const response = await $api.post(`/invoices`, data)
        return response;
    }

    static GetAllInvoices = async (page) => {
        const response = await $api.get(`/invoices/page?page=${page}`)
        return response;
    }
    static GetInvoiceById = async (id) => {
        const response = await $api.get(`/invoices/${id}`)
        return response;
    }
    static GetInvoicesInLocation = async (location_id, page) => {
        const response = await $api.get(`/invoices/location/${location_id}/page?page=${page}`)
        return response;
    }
    static GetFilteredInvoices = async (data) => {
        const response = await $api.get(`/invoices/filter/${data.loc_id}/${data.startDate}/${data.endDate}/${data.type}/${data.sender}/${data.receiver}/${data.status}/${data.payment}/${data.search}/page?page=${data.page}`)
        return response;
    }
    static DeleteInvoice = async (id) => {
        const response = await $api.delete(`/invoices/${id}`)
        return response;
    }
    static EditInvoice = async (data, id) => {
        const response = await $api.put(`/invoices/${id}`, data)
        return response;
    }
}
export { InvoicesApi}