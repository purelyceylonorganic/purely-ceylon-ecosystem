export const safeNotification = async (

callback:()=>Promise<void>

)=>{

try{

await callback();

}catch(error){

console.error(

"Notification Error",

error

);

}

};