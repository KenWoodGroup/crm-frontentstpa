import { $api } from "../Headers"

class LocalProduct {
    static CreateProduct = async (data) => {
        const response = await $api.post(`/local-products`, data)
        return response;
    }
    static CreateProductExel = async (id, data) => {
        const response = await $api.post(
            `/local-products/upload/${id}`,
            data,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            }
        );
        return response;
    };

    static CreateProductInArray = async (data) => {
        const response = await $api.post(`/local-products/array`, data)
        return response;
    }
    static GetProduct = async (data) => {
        const response = await $api.get(`/local-products/paginate/${data?.location_id}/${data?.category_id}/page?page=${data?.page}`)
        return response;
    }
    static GetCategory = async (id) => {
        const response = await $api.get(`/local-products/category/${id}`)
        return response;
    }
    static GetMyProduct = async (data) => {
        const response = await $api.get(`/local-products/products/${data?.location_id}/${data?.sub_id}`)
        return response;
    }
    static GetMyProductLocation = async (data) => {
        const response = await $api.get(`/local-products/by-location/${data?.sub_id}/${data?.location_id}`)
        return response;
    }
    static DeleteProduct = async (id) => {
        const response = await $api.delete(`/local-products/${id}`)
        return response;
    }
    static EditProduct = async (id, data) => {
        const response = await $api.put(`/local-products/by-id/${id}`, data)
        return response;
    }
} export { LocalProduct }