import { $api } from "../Headers"

class Stock {

    static StockGetByLocationId = async (data) => {
        const response = await $api.get(`/stock/location/${data?.id}/page?page=${data?.page}`)
        return response;
    }

    static CreateBarcode = async (data) => {
        const response = await $api.post(`/stock`, data)
        return response;
    }
    static getLocationStocksByChildId = async (location_id, id, operation_type) => {
        const response = await $api.get(`/stock/category/${location_id}/${id}/${operation_type}`)
        return response;
    }
    static getLocationStocksBySearch = async ({ data }) => {
        const response = await $api.get(`/stock/search/${data.locationId}/${data.fac_id}/${data.operation_type}/${data.search}`)
        return response;
    }
    static getByBarcode = async ({payload}) => {
        const response = await $api.get(`/stock/barcode/${encodeURIComponent(payload.operation_type)}/${payload.code}`)
        return response;
    }

    static EditStock = async (data) => {
        const response = await $api.put(`/stock/${data?.id}`, data?.form)
        return response;
    }
    static EditBarcode = async (data) => {
        const response = await $api.put(`/stock/barcode/${data?.id}`, data?.editData)
        return response;
    }

} export { Stock } 