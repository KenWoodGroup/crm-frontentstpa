import { $api } from "../Headers"

class UserApi {
    static UserCreate = async (data) => {
        const response = await $api.post(`/user`, data)
        return response;
    }
    static UserGet = async (data) => {
        const response = await $api.get(`/user/locationId/${data?.id}`)
        return response;
    }
    static UserById = async (id) => {
        const response = await $api.get(`/user/${id}`)
        return response;
    }
    static UserDelete = async (id) => {
        const response = await $api.delete(`/user/${id}`,)
        return response;
    }
    static UserEdit = async (data, id) => {
        const response = await $api.put(`/user/${id}`, data)
        return response;
    }
    static ResetPassword = async (data, id) => {
        const response = await $api.post(`/user/reset-password/${id}`, data)
        return response;
    }


}
export { UserApi }