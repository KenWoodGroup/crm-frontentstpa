import { $api } from "../Headers"

class ProductToMaterialApi {

    static CreateProductMaterial = async (data)=>{
        const response = await $api.post(`/product-materials/list`, data)
        return response;
    }

    static GetProductMaterial = async (id)=>{
        const response = await $api.get(`/product-materials/all/${id}`)
        return response;
    }
      static PutProductMaterial = async (data)=>{
        const response = await $api.put(`/product-materials/list`, data)
        return response;
    }
      static RemoveProductMaterial = async (id)=>{
        const response = await $api.delete(`/product-materials/${id}`)
        return response;
    }

} export { ProductToMaterialApi }