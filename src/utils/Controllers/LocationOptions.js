import { $api } from "../Headers"

class LocationOptions {
    static GetByLocationId = async (id) => {
        return await $api.get(`location-options/all/${id}`)
    }
    static CreateLocationOption = async (data) => {
        return await $api.post(`/location-options`, data)
    }
    static DeleteLocationOption = async (id) => {
        return await $api.delete(`/location-options/${id}`)
    }
} export { LocationOptions }