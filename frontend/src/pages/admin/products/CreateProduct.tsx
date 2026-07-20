import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import ProductForm from "../../../components/admin/products/ProductForm";
import { categoryService } from "../../../services/category.service";
import { productService } from "../../../services/product.service";
import type { Category } from "../../../types/category";


export default function CreateProduct() {


  const navigate = useNavigate();


  const [categories,setCategories] =
    useState<Category[]>([]);


  const [loading,setLoading] =
    useState(false);



  // Load Categories

  useEffect(()=>{

    async function loadCategories(){

      try{

        const response =
  await categoryService.getAllCategories();


setCategories(
  response
);
console.log("Categories:", response);

      }
      catch(error){

        console.error(error);

        toast.error(
          "Failed to load categories"
        );

      }

    }


    loadCategories();


  },[]);

async function handleCreateProduct(data:any){
  
  console.log(data);

 try{
 setLoading(true);
 await productService.createProduct(
 data
 );


 toast.success(
 "Product created successfully"
 );

 navigate(
 "/admin/products"
 );
 }
 catch(error:any){


 toast.error(
 error?.response?.data?.message
 ||
 "Product creation failed"
 );

 }
 finally{
setLoading(false);
 }
 }

  return (
    <div
      className="
      p-6
   "
    >
      <h1
      className="
      text-3xl
      font-bold
      mb-6
      "
      >
        Create Product
      </h1>

      <ProductForm
      categories={
          categories
        }


        onSubmit={
          handleCreateProduct
        }


        loading={
          loading
        }


        submitText="
        Create Product
        "

      />


    </div>

  );

}