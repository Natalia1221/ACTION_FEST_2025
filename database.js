import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// Create a single supabase client for interacting with your database
const supabase = createClient(process.env.APIURL_SECRET,process.env.APIKEY_SECRET)

export async function getDanceMathToDB(){
    const {data: participants, error} = await supabase
    .from("dance_math")
    .select("*");

    if(error){
        console.error("Error fetching expenses:", error)
        return []
    }
    return participants
}

export async function getEngPostToDB(){
    const {data: participants, error} = await supabase
    .from("eng_post")
    .select("*");

    if(error){
        console.error("Error fetching expenses:", error)
        return []
    }
    return participants
}

export async function updateDanceMathToDB(participantId, updateStatusRegis){
    try{
        const {data, error} = await supabase
        .from("dance_math")
        .update({regist_status:updateStatusRegis})
        .eq("id", participantId)

        if(error){
            console.error("Error obhect:"+ JSON.stringify(error, null, 2))
        }else{
            console.log("Status Updated")
        }
    }catch(err){
        conseole.error("Error updateing status: ", err)
    }
}

export async function updateEngPostToDB(participantId, updateStatusRegis){
    try{
        const {data, error} = await supabase
        .from("eng_post")
        .update({regist_status:updateStatusRegis})
        .eq("id", participantId)

        if(error){
            console.error("Error obhect:"+ JSON.stringify(error, null, 2))
        }else{
            console.log("Status Updated")
        }
    }catch(err){
        conseole.error("Error updateing status: ", err)
    }
}