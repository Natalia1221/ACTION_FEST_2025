const participantData = JSON.parse(localStorage.getItem("participantData"));
const table = localStorage.getItem("table");
const two_digit_id = participantData.id.slice(0,2)

function commonData(participantData){
    const id = participantData.id
    const category = {MT : "MATH SCIENCE",
                     ES : "ENGLISH STORY TELLING",
                     DP : "DIGITAL DESIGN",
                     DC : "MODERN DANCE"
    }
    return `
                <tr>
                    <th scope="row">Email</th>
                    <td id="email">${participantData.email}</td>
                </tr>
                <tr>
                    <th scope="row">Jenis Lomba</th>
                    <td id="wa_num">${category[participantData.id.slice(0,2)]}</td>
                </tr>
                <tr>
                    <th scope="row">WA Number</th>
                    <td id="wa_num">${participantData.wa_num}</td>
                </tr>
    `
}

function danceMember(participantData){
    return `
                    <tr>
                        <th scope="row">Group Name</th>
                        <td id="group_name">${participantData.group_name}</td>
                    </tr>
        `
}

function eng_designMember(participantData){
    return `
                <tr><th>Student Name</th><td id="name">${participantData.full_name}</td></tr>
                <tr><th>School</th><td id="school">${participantData.school}</td></tr>
                <tr><th>Grade</th><td id="grade">${participantData.grade}</td></tr>
            `
}

function getMember(participantData){
    let members =''
    for (let i = 1; i <= 3; i++) {
        const name = participantData[`member${i}_name`];
        const school = participantData[`member${i}_school`];
        const grade = participantData[`member${i}_grade`];
                
        if(name != "none"){
            members +=`
                    <tr class="table-secondary"><td colspan="2"><strong>Member ${i}</strong></td></tr>
                    <tr><th>Name</th><td id="member${i}_name">${name}</td></tr>
                    <tr><th>School</th><td id="member${i}_school">${school}</td></tr>
                    <tr><th>Grade</th><td id="member${i}_grade">${grade}</td></tr>
            `
        }
    }
    return members
}

function getRegistStatus(){
    if(two_digit_id == "DC"){
        return `
                <div class="card text-center">
                    <div class="card-body">
                        
                        <h5 class="card-title">Data ${participantData.group_name} Sudah Teregistrasi</h5>
                        <p class="card-text">Silahkan Nikmati Festivalnya</p>
                    </div>
                </div>
            `
    }else if(two_digit_id == "MT"){
        return `
                <div class="card text-center">
                    <div class="card-body">
                        
                        <h5 class="card-title">Data Anda Sudah Teregistrasi</h5>
                        <p class="card-text">Silahkan Nikmati Festivalnya</p>
                    </div>
                </div>
            `
    }else{
        return `
                <div class="card text-center">
                    <div class="card-body">
                        
                        <h5 class="card-title">Data ${participantData.full_name} Sudah Teregistrasi</h5>
                        <p class="card-text">Silahkan Nikmati Festivalnya</p>
                    </div>
                </div>
            `
    }
    
}

if (participantData) {
    let table = document.getElementById("content-table")
    
    
    let content = commonData(participantData)

    if(two_digit_id=="DC" || two_digit_id=="MT"){
        if(two_digit_id == "DC"){
            content += danceMember(participantData)
        }
         
        content += getMember(participantData)
        
    }else{
        content += eng_designMember(participantData)
    }
    
    content += `<tr class="table-secondary"><td colspan="2"><strong>Teacher</strong></td></tr>
                <tr><th>Teacher's Name</th><td id="teacher_name">${participantData.teacher_name?participantData.teacher_name:"-"}</td></tr>
                <tr><th>Teacher's Number</th><td id="teacher_number">${participantData.teacher_number?participantData.number:"-"}</td></tr>
        `
    table.innerHTML = content
}

const button_register = document.getElementById("register_button")
if(participantData.regist_status==true){
    const alert = document.getElementById("alert")
    alert.innerHTML = `<div class="alert alert-success" role="alert">
                            Akun Sudah Teregistrasi
                    </div>`
    button_register.className ="d-none"
}else if(participantData.regist_status==false || participantData.regist_status==null){
    button_register.innerText = "Registrasi Akun"
    button_register.className ="btn btn-lg btn-primary"
}

document.getElementById("register_button").addEventListener("click", function(){
    fetch( `/.netlify/functions/register?table=${table}&code=${participantData.id}`)
          .then(() => {
            document.getElementById("detail").innerHTML = getRegistStatus(participantData)
          })
})

function extractFileId(driveUrl) {
    const match = driveUrl.match(/\/d\/(.+?)\//);
    return match ? match[1] : null;
  }

function download(dataurl, filename) {
    const fileId = extractFileId(dataurl);
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `${participantData.id}_Sertifikat.jpg`; // You can customize the filename
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

document.getElementById("sertif_download").addEventListener("click", function(){
    download(participantData.sertif_link)
})