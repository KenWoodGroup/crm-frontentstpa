import { $api } from "../Headers"

class AccessApi {
    static GetAccess = async (id) => {
        const response = await $api.get(`/user-access/${id}`)
        return response;
    }
    static CreateAccess = async (data) => {
        const response = await $api.post(`/user-access`, data)
        return response;
    }
} export { AccessApi }