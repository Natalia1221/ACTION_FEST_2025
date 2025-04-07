import {getDanceMathToDB, getEngPostToDB} from './database.js'

document.getElementById("submit-button").addEventListener("click", async function(){
    const unique_code = document.getElementById("codeInput").value.toUpperCase()
    let participants;
    if(unique_code.slice(0,3)== "MAT" || unique_code.slice(0,3)== "DAN"){
        participants =await getDanceMathToDB();
    }else if(unique_code.slice(0,3)== "ENG" || unique_code.slice(0,3)== "POS"){
        participants =await getEngPostToDB();
        console.log("HAI")
    }else if(unique_code.slice(0,3)!=""){
        alert("Code Tidak Valid.");
    }
    const data = checkCode(unique_code, participants)

    if(data){
        // Simpan data ke localStorage
        localStorage.setItem("participantData", JSON.stringify(data));
        window.location.href = "register.html";
    }else{
        alert("Code Tidak Valid.");
    }
})

function checkCode(id, participants){
    return participants.find(participant => participant.id === id)
}

