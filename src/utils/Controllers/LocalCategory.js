import { $api } from "../Headers"

class LocalCategory {
    static CreateCategory = async (data) => {
        const response = await $api.post(`/local-categories`, data)
        return response;
    }
    static GetAllCateogry = async (data) =>{
        const response = await $api.get(`/local-categories/all/${data?.type}/${data?.location_id}`)
        return response
    }
    static GetallCateogry = async (data) => {
        const response = await $api.get(`/local-categories/page/${data?.type}/${data?.location_id}?page=${data?.page}`)
        return response;
    }
    static GetAll = async (id) => {
        const response = await $api.get(`/local-categories/all/${id}`)
        return response;
    }
    static EditCategory = async (id, data) => {
        const response = await $api.put(`/local-categories/${id}`, data)
        return response;
    }
    static DeleteCategory = async (id) => {
        const response = await $api.delete(`/local-categories/${id}`)
        return response;
    }
}
export { LocalCategory }