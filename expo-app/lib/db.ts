// manages the temp database,  loading in the web as its not supported

const API = process.env.EXPO_PUBLIC_API_URL!;


export async function getCases() {
    const response = await fetch(`${API}/cases`);

    const data = await response.json();

    return data.map((c: any) => ({
        ...c,
        id: c._id,
    }));
}


export async function createCase(data:any){

    const res =
    await fetch(`${API}/cases`,{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify(data)

    });

    return await res.json();

}



export async function updateCase(   // used for when we update location or live feed in some way

    id:string,

    data:any

){
    const res =
    await fetch(`${API}/cases/${id}`,{

        method:"PUT",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify(data)

    });

    return await res.json();

}




export async function deleteCase(id:string){

    await fetch(`${API}/cases/${id}`,{

        method:"DELETE"

    });




}