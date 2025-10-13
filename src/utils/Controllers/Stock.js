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
    static getLocationStocksByChildId = async (location_id, id) => {
        const response = await $api.get(`/stock/category/${location_id}/${id}`)
        return response;
    }
    static getLocationStocksBySearch = async ({data}) => {
        const response = await $api.get(`/stock/search/${data.locationId}/${data.search}`)
        return response;
    }
    static getByBarcode = async (code) => {
        const response = await $api.get(`/stock/barcode/${encodeURIComponent(code)}`)
        return response;
    }

    static EditStock = async (data) => {
        const response = await $api.put(`/stock/${data?.id}`, data?.form)
        return response;
    }

} export { Stock } 