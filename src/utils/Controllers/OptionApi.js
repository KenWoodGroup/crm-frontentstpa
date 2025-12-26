import { $api } from "../Headers"

class OptionApi {
    static CreateOption = async (data) => {
        const response = await $api.post('/options', data)
        return response
    }
    static GetOption = async (page) => {
        const response = await $api.get(`/options/paginate/page?page=${page}`,)
        return response
    }
    static DeleteOption = async (id) => {
        const response = await $api.delete(`/options/${id}`,)
        return response
    }
    static UpdateOption = async (id, data) => {
        const response = await $api.put(`/options/${id}`, data);
        return response.data;
    };
} export { OptionApi }