import { Outlet, NavLink } from "react-router-dom";

export default function AdminLayout(){

const menu = [
 {
  name:"Dashboard",
  path:"/admin/dashboard"
 },
 {
  name:"Products",
  path:"/admin/products"
 },
 {
  name:"Orders",
  path:"/admin/orders"
 },
 {
  name:"Inventory",
  path:"/admin/inventory"
 }
];
return (

<div className="flex min-h-screen bg-gray-100">


<aside
className="
w-64
bg-white
shadow-lg
p-5
"
>

<h1
className="
text-2xl
font-bold
mb-8
"
>
PCO Admin
</h1>


<nav className="space-y-2">


{
menu.map(item=>(

<NavLink

key={item.path}

to={item.path}

className={({isActive})=>
`
block
px-4
py-3
rounded-lg
${
isActive
?
"bg-black text-white"
:
"hover:bg-gray-100"
}
`
}

>

{item.name}

</NavLink>

))
}


</nav>


</aside>



<main
className="
flex-1
p-6
"
>

<Outlet />

</main>


</div>


)

}