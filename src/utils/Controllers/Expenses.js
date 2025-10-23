import { $api } from "../Headers"

class Expenses {
    static CreateExpenses = async (data) => {
        const response = await $api.post(`/expenses`, data)
        return response;
    }
    static GetExpenses = async (data) => {
        const response = await $api.get(`/expenses/filter/${data?.location_id}/${data?.startDate}/${data?.endDate}/page?page=${data?.page}`)
        return response;
    }
    static DeleteExpenses = async (id) => {
        const response = await $api.delete(`/expenses/${id}`)
        return response;
    }
    static EditExpenses = async (data, id) => {
        const response = await $api.put(`/expenses/${id}`, data)
        return response;
    }
} export { Expenses }