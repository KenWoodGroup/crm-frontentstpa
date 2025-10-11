import { $api } from "../Headers"

class Stock {
    static StockGetByLocationId = async (data) => {
        const response = await $api.get(`/stock/locationId/${data?.id}/page?page=${data?.page}`)
        return response;
    }
    static CreateBarcode = async (data) => {
        const response = await $api.post(`/stock`, data)
        return response;
    }
} export { Stock } 