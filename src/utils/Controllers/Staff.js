import { $api } from "../Headers"

class Staff {
    static StaffGet = async (id) => {
        const response = await $api.get(`/staffs/all/${id}`)
        return response
    }
    static CreateStaff = async (data) => {
        const response = await $api.post(`/staffs`, data)
        return response
    }
    static DeleteStaff = async (id) => {
        const response = await $api.delete(`/staffs/${id}`)
        return response;
    }
    static EditStaff = async (id, data) => {
        const response = await $api.put(`/staffs/by-id/${id}`, data)
        return response;
    }
} export { Staff }