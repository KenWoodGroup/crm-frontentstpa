import { $api } from "../Headers"

class MaterialCategoryApi {
    static CreateCategoryMaterial = async (data) => {
        const response = await $api.post(`/local-categories`, data)
        return response
    }
    static GetAllCategoryMaterial = async (data) => {
        const response = await $api.get(`/local-categories/page/${data?.location_id}?page=${data?.page}`)
        return response
    }
        static PutCategoryMaterial = async (id, data) => {
        const response = await $api.put(`/local-categories/${id}`, data)
        return response
    }
        static DeleteCategoryMaterial = async (id, data) => {
        const response = await $api.put(`/local-categories/${id}`, data)
        return response
    }
     static CreateMaterialExel = async (id, data) => {
        const response = await $api.post(
            `/local-products/upload-material/${id}`,
            data,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            }
        );
        return response;
    };

}

export { MaterialCategoryApi }