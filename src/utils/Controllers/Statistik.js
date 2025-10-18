import { $api } from "../Headers"

class Statistik {

    static GetStatistik = async (id) => {
        const response = await $api.get(`/statistic/location/${id}`)
        return response;
    }
    static GetStatistikProductSum = async (data) => {
        const response = await $api.get(`/statistic/chart-product-sum/${data?.id}/${data?.year}/${data?.month}`)
        return response;
    }
    static GetStatistikProductCount = async (data) => {
        const response = await $api.get(`/statistic/chart-product-count/${data?.id}/${data?.year}/${data?.month}`)
        return response;
    }
    static GetStatistikSum = async (data) => {
        const response = await $api.get(`/statistic/chart-sum/${data?.id}/${data?.year}`)
        return response;
    }
    static GetStatistikDiler = async (data) => {
        const response = await $api.get(`/statistic/chart-dealer-product/${data?.id}/${data?.year}/${data?.month}`)
        return response;
    }
} export { Statistik }