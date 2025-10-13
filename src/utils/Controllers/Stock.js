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

    static EditStock = async (data) => {
        const response = await $api.put(`/stock/${data?.id}`, data?.form)
        return response;
    }

} export { Stock } 