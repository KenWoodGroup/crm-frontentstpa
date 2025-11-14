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
    static GetStatistikTovarAnalitikCard = async (id) => {
        const response = await $api.get(`/statistic/analytics-card/${id}`)
        return response;
    }
    static GetStatistikTovarAnalitikTop = async (data) => {
        const response = await $api.get(`/statistic/top-sel/${data?.id}/${data?.startDate}/${data?.endDate}`)
        return response;
    }
    static GetStatistikTovarAnalitikSeal = async (data) => {
        const response = await $api.get(`/statistic/least-sel/${data?.id}/${data?.startDate}/${data?.endDate}`)
        return response;
    }
} export { Statistik }