import { $api } from "../Headers"

class WarehouseApi {
    static CreateWarehouse = async (data) => {
        const response = await $api.post(`/locations`, data)
        return response;
    }

    static GetWarehouseDetail = async (id) => {
        const response = await $api.get(`/locations/${id}`)
        return response;
    }

    static WarehouseGetAll = async (data) => {
        const response = await $api.get(`/locations/${data?.id}/page?page=${data?.page}`)
        return response;
    }
    static WarehouseDelete = async (id) => {
        const response = await $api.delete(`/locations/${id}`)
        return response;
    }
    static WarehouseEdit = async (data, id) => {
        const response = await $api.put(`/locations/${id}`, data)
        return response;
    }
}
export { WarehouseApi }