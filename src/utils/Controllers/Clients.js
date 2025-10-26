import { $api } from "../Headers"

class Clients {

    static ClientsCreate = async (data) => {
        const response = await $api.post(`/locations/client`, data)
        return response;
    }
    static GetClients = async (data) => {
        const response = await $api.get(`/locations/type/${data?.location_id}/${data?.type}/${data?.search}/page?page=${data?.page}`)
        return response;
    }
    static DeleteClient = async (id) => {
        const response = await $api.delete(`/locations/${id}`)
        return response;
    }
    static EditClient = async (id, data) => {
        const response = await $api.put(`/locations/${id}`, data);
        return response;
    };

} export { Clients }