import { $api } from "../Headers"

class Partner {
    static PartnerCreate = async (data) => {
        const response = await $api.post(`/locations/partner`, data)
        return response;
    }
    static ParentGet = async (data) => {
        const response = await $api.get(`locations/partner/${data?.id}/page?page=${data?.page}`)
        return response;
    }
    static GetAllPartner = async (id) => {
        const response = await $api.get(`/locations/partner-all/${id}`)
        return response;
    }
    static PartnerDelete = async (id) => {
        const response = await $api.delete(`/locations/${id}`)
        return response;
    }
    static PartnerEdit = async (id, data) => {
        const response = await $api.put(`/locations/partner/${id}`, data)
        return response;
    }
} export { Partner }