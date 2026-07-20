import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { productService } from "../../../services/product.service";


export default function EditProduct() {

  const { id } = useParams();
  const navigate = useNavigate();


  const [loading,setLoading] = useState(true);


  const [form,setForm] = useState<any>({
    name:"",
    slug:"",
    description:"",
    status:"DRAFT",
    moq:1,
    variant:{
      sku:"",
      weight:"",
      price:0,
      costPrice:0,
      stock:0
    }
  });



async function loadProduct(){

try{

 if(!id) return;


 const product =
 await productService.getProductById(id);


 setForm({

  name:product.name,
  slug:product.slug,
  description:product.description,
  status: (product as any).status || "DRAFT",
  moq:product.moq,


  variant:{
    sku:
    product.variants?.[0]?.sku || "",

    weight:
    product.variants?.[0]?.weight || "",

    price:
    product.variants?.[0]?.price || 0,

    costPrice:
    product.variants?.[0]?.costPrice || 0,

    stock:
    product.variants?.[0]?.stock || 0
  }

 });


}
catch(error){

toast.error(
"Failed to load product"
);

}

finally{

setLoading(false);

}

}




useEffect(()=>{

loadProduct();

},[id]);





function handleChange(
field:string,
value:any
){

setForm((prev:any)=>({

...prev,

[field]:value

}));

}



function handleVariantChange(
field:string,
value:any
){

setForm((prev:any)=>({

...prev,

variant:{
...prev.variant,
[field]:value
}

}));

}





async function handleSubmit(
e:React.FormEvent
){

e.preventDefault();


try{


await productService.updateProduct(
id!,
form
);


toast.success(
"Product updated successfully"
);


navigate(
"/admin/products"
);


}
catch(error){

toast.error(
"Update failed"
);

}


}





if(loading){

return <div>
Loading...
</div>

}





return (

<div className="
p-6
">


<h1 className="
text-3xl
font-bold
mb-6
">

Edit Product

</h1>



<form
onSubmit={handleSubmit}
className="
space-y-4
bg-white
p-6
rounded-xl
shadow
"
>



<input
className="border p-3 w-full"
value={form.name}
onChange={(e)=>
handleChange(
"name",
e.target.value
)
}
placeholder="Product Name"
/>




<input
className="border p-3 w-full"
value={form.slug}
onChange={(e)=>
handleChange(
"slug",
e.target.value
)
}
placeholder="Slug"
/>




<textarea

className="border p-3 w-full"

value={form.description}

onChange={(e)=>
handleChange(
"description",
e.target.value
)
}

placeholder="Description"

/>
<div className="mt-4">
  <label className="block font-medium mb-2">Product Status</label>
  <select
    className="border p-3 w-full rounded-lg"
    value={form.status}
    onChange={(e) => handleChange("status", e.target.value)}
  >
    <option value="DRAFT">Draft</option>
    <option value="PUBLISHED">Published</option>
    <option value="HIDDEN">Hidden</option>
    <option value="ARCHIVED">Archived</option>
  </select>
</div>




<h2 className="
font-bold
text-xl
">

Variant

</h2>



<input
className="border p-3 w-full"
value={form.variant.sku}
onChange={(e)=>
handleVariantChange(
"sku",
e.target.value
)
}
placeholder="SKU"
/>




<input
className="border p-3 w-full"
value={form.variant.weight}
onChange={(e)=>
handleVariantChange(
"weight",
e.target.value
)
}
placeholder="Weight"
/>




<input
className="border p-3 w-full"
type="number"
value={form.variant.price}
onChange={(e)=>
handleVariantChange(
"price",
Number(e.target.value)
)
}
placeholder="Price"
/>



<input
className="border p-3 w-full"
type="number"
value={form.variant.stock}
onChange={(e)=>
handleVariantChange(
"stock",
Number(e.target.value)
)
}
placeholder="Stock"
/>





<button

className="
bg-green-600
text-white
px-6
py-3
rounded-lg
"

>

Update Product

</button>



</form>


</div>

);

}