import { $api } from "../Headers"

class ProductApi {



    static CreateProduct = async (data) => {
        const response = await $api.post(`/products`, data)
        return response
    }

    static GetAllCategory = async () => {
        const response = await $api.get(`/categories`)
        return response
    }

    static GetSubCategoryByID = async (id) => {
        const response = await $api.get(`/subcategories/categoryId/${id}`)
        return response
    }

    static GetProductById = async (id) => {
        const response = await $api.get(`/subcategories/subcategoryId/${id}`)
        return response
    }
    static GetAllProduct = async (page) => {
        const response = await $api.get(`/products/page?page=${page}`)
        return response;
    }
    static GetMiniCategoryById = async (id) => {
        const response = await $api.get(`/subcategories/products/${id}`)
        return response;
    };
    static GetProductBySubCategory = async (id) => {
        const response = await $api.get(`/products/subcategoryId/${id}`)
        return response;
    };
    static GetProductByLocationIdBySubCategory = async (data) => {
        const response = await $api.get(`/products/by-location/${data?.subcategory_id}/${data?.location_id}`)
        return response;
    }
    static GetProductId = async (id) => {
        const response = await $api.get(`/products/subcategory/${id}`)
        return response;
    }
    static GetSelectProduct = async (data) => {
        const response = await $api.get(`/products/location-products/${data?.location_id}/${data?.sub_id}`)
        return response;
    }
    static GetMyAllProducts = async (id) => {
        const response = await $api.get(`/location-info/products/${id}`)
        return response;
    }
    static GetProductByName = async (name) => {
        const response = await $api.get(`/products/by-name/${name}`)
        return response;
    }

    
}

export { ProductApi }