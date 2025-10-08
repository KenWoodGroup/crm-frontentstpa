import { $api } from "../Headers";
class user {
    static Post = async (data) => {
        const response = await $api.post(`/user`, data)
        return response;
    }
    static Put = async (id, data) => {
        const response = await $api.put(`/user/${id}`, data)
        return response;
    }
    static Get = async (id) => {
        const response = await $api.get(`/user/${id}`)
        return response;
    }
    static GetPagination = async (page) => {
        const response = await $api.get(`/user/page?page=${page}`)
        return response;
    }
    static GetLocationUsers = async (locationId) => {
        const response = await $api.get(`/user/${locationId}`)
        return response;
    }
    static Delete = async (id) => {
        const response = await $api.delete(`/user/${id}`)
        return response;
    }
}

export { user };