import { $api } from "../Headers"

class ClientCategory {

    static ClientCategoryCreate = async (data) => {
        const response = await $api.post(`/client-type`, data)
        return response;
    }
    static GetClientCategory = async (id) => {
        const response = await $api.get(`/client-type/all/${id}`)
        return response;
    }
    static DeleteClientCategory = async (id) => {
        const response = await $api.delete(`/client-type/${id}`)
        return response;
    }
    static EditClientCategory = async (id, data) => {
        const response = await $api.put(`/client-type/${id}`, data);
        return response;
    };

} export { ClientCategory }