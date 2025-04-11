// POP UP MODAL
// --- Info Modal Logic (Kept for potential external use) ---
const confirmationModal = document.getElementById('already-registered-modal');
const confirmationModalOverlay = document.getElementById('confirmation-modal-overlay');
const confirmationModalContentBox = document.getElementById('confirmation-modal-content-box');
const confirmRegistrationButton = document.getElementById('confirm-registration');


function showConfirmationModal() {
    if (!confirmationModal || !confirmationModalOverlay || !confirmationModalContentBox) return;
    confirmationModal.classList.remove('hidden'); confirmationModal.classList.add('flex');
    document.body.classList.add('modal-open');
    void confirmationModalOverlay.offsetWidth; void confirmationModalContentBox.offsetWidth; // Reflow
    confirmationModalOverlay.classList.remove('opacity-0'); confirmationModalOverlay.classList.add('opacity-100');
    confirmationModalContentBox.classList.remove('scale-95'); confirmationModalContentBox.classList.add('scale-100');
 }

function hideConfirmationModal() {
    if (!confirmationModal || !confirmationModalOverlay || !confirmationModalContentBox) return;
    confirmationModalOverlay.classList.remove('opacity-100'); confirmationModalOverlay.classList.add('opacity-0');
    confirmationModalContentBox.classList.remove('scale-100'); confirmationModalContentBox.classList.add('scale-95');
    setTimeout(() => {
        confirmationModal.classList.add('hidden'); confirmationModal.classList.remove('flex');
         // Check if info modal is also closed before removing body class
         if (!document.getElementById('info-modal')?.classList.contains('flex')) {
              document.body.classList.remove('modal-open');
         }
    }, 300);
}

confirmRegistrationButton.addEventListener('click', function(){
    hideConfirmationModal()
})
// --- Edit Modal Button Listeners ---
const editModal = document.getElementById('edit-data-modal');
const confirmEditButton = document.getElementById('save-edit');
const cancelEditButton = document.getElementById('cancel-edit');

cancelEditButton.addEventListener('click', function(){
    hideEditModal()
})


function showEditModal(currentEditIndex) {
    if (!editModal) return;
  
    editModal.classList.remove('hidden');
  
    // Ambil elemen nama dan sekolah berdasarkan index
    const nameEl = document.getElementById(`name${currentEditIndex}`);
    const schoolEl = document.getElementById(`sch_grade${currentEditIndex}`);
  
    const schoolMatch = schoolEl.innerHTML.match(/School:<\/span>\s*(.*?)<br>/);
    const gradeMatch = schoolEl.innerHTML.match(/Grade:<\/span>\s*(.*)/);
  
    // Isi modal edit dengan data lama
    document.getElementById("edit-name").value = nameEl.textContent;
    document.getElementById("edit-school").value = schoolMatch ? schoolMatch[1] : '';
    document.getElementById("edit-grade").value = gradeMatch ? gradeMatch[1] : '';
  
    // Bersihkan event listener sebelumnya (jika ada)
    const newConfirmButton = confirmEditButton.cloneNode(true);
    confirmEditButton.parentNode.replaceChild(newConfirmButton, confirmEditButton);
  
    // Tambahkan event listener baru
    newConfirmButton.addEventListener("click", async function () {
      const newName = document.getElementById("edit-name").value.trim();
      const newSchool = document.getElementById("edit-school").value.trim();
      const newGrade = document.getElementById("edit-grade").value.trim();
  
      if (!newName || !newSchool || !newGrade) {
        alert("Please fill in all fields.");
        return;
      }
  
      // Update DOM
      nameEl.textContent = newName;
      schoolEl.innerHTML = `
        <span class="font-medium">School:</span> ${newSchool} <br>
        <span class="font-medium">Grade:</span> ${newGrade}
      `;
  
      // Update localStorage
      const keyName = `member${currentEditIndex}_name`;
      const keySchool = `member${currentEditIndex}_school`;
      const keyGrade = `member${currentEditIndex}_grade`;
      
      if (two_digit_id == "DC" || two_digit_id == "MT"){
        participantData[keyName] = newName;
        participantData[keySchool] = newSchool;
        participantData[keyGrade] = newGrade;
      }else{
        participantData['full_name'] = newName;
        participantData['school'] = newSchool;
        participantData['grade'] = newGrade;
      }
  
      localStorage.setItem("participantData", JSON.stringify(participantData));
  
      // Kirim ke serverless function (gunakan encode)
      const params = new URLSearchParams({
        table:table,
        code: participantData.id,
        i: currentEditIndex,
        name: newName,
        school: newSchool,
        grade: newGrade
      });
  
      fetch(`/.netlify/functions/edit?${params.toString()}`)
      .then(res => res.json())

      hideEditModal();
    });
  }
  



function hideEditModal() {
    if (!confirmationModal) return;
    setTimeout(() => {
        editModal.classList.add('hidden'); 
    }, 200);
}


// END OF POP UP MODAL

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

    document.getElementById('email').innerHTML = participantData.email
    document.getElementById('competition').innerHTML = category[participantData.id.slice(0,2)]
    document.getElementById("wa_num").innerHTML = participantData.wa_num
    if (participantData.id.slice(0,2) != "DC"){
        document.getElementById("group").classList.add("hidden");
    }else{
        document.getElementById("group_name").innerHTML = participantData.group_name
    }
}

function danceMember(participantData){
    return `
                    <tr>
                        <th scope="row">Group Name</th>
                        <td id="group_name">${participantData.group_name}</td>
                    </tr>
        `
}

function getMember(participantData){
    const container = document.getElementById("participant_list")
    
    for (let i = 1; i <= 3; i++) {
        const name = two_digit_id == "ES" || two_digit_id =="DP"?participantData[`full_name`]:participantData[`member${i}_name`];
        const school = two_digit_id == "ES" || two_digit_id =="DP"?participantData[`school`]:participantData[`member${i}_school`];
        const grade = two_digit_id == "ES" || two_digit_id =="DP"?participantData[`grade`]:participantData[`member${i}_grade`];
        const isRegistered = two_digit_id == "ES" || two_digit_id =="DP"?participantData[`regist_status`]:participantData[`member${i}_status`];
        console.log
        if(name != "none"){
            const div = document.createElement("div");
            const border = document.createElement("hr")
            border.className = "my-6 border-gray-300"
            div.className = "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ";
    
            div.innerHTML += `
            <div>
                <h3 class="text-lg font-semibold text-gray-700" id="name${i}">${name}</h3> 
                <p class="text-sm text-gray-600 mt-1" id="sch_grade${i}">
                    <span class="font-medium">School:</span> ${school} <br> 
                    <span class="font-medium">Grade:</span> ${grade}  
                </p>
            </div>
            <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:items-center">
                <button value="${i}" id="registered_button${i}" class="registered_button w-full sm:w-auto py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium ${
                    isRegistered ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
                } transition duration-150 ease-in-out" ${isRegistered ? 'disabled' : ''}>
                    ${isRegistered ? 'Registered' : 'Register Now'}
                </button>

                <button value="${i}" id="edit_button${i}" class="w-full sm:w-auto py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-100 transition duration-150 ease-in-out">
                Edit Data
                </button>
            </div>
            `

            container.appendChild(div);
            container.appendChild(border)

            // Register button event
            const regBtn = document.getElementById(`registered_button${i}`);
            regBtn.addEventListener("click", () => {
                fetch( `/.netlify/functions/register?table=${table}&code=${participantData.id}&column=member${i}_status&data="none"`)
                .then(res => res.json())
                
                showConfirmationModal()
                participantData[`member${i}_status`] = true
                localStorage.setItem("participantData", JSON.stringify(participantData));
                regBtn.disabled = true;
                regBtn.textContent = "Registered";
                regBtn.classList.remove("bg-blue-600", "hover:bg-blue-700");
                regBtn.classList.add("bg-gray-400", "cursor-not-allowed");
            });

            const editBtn = document.getElementById(`edit_button${i}`);
            editBtn.addEventListener("click", () => {
                showEditModal(i)
                
            });


        }
        if (two_digit_id == "ES" || two_digit_id =="DP"){
            break
        }
    }

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

//UPDATE DETAIL
// ... (Your existing code)

async function setupRealtimeSubscription(participantData) {
    const table = localStorage.getItem("table");
    const supabase = createClient(process.env.APIURL_SECRET, process.env.APIKEY_SECRET);

    supabase
        .channel('table-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: table }, payload => {
            console.log('Change received!', payload);
            // Handle the change
            if (payload.eventType === 'UPDATE' && payload.new.id === participantData.id){
                updateUI(payload.new);
            }
        })
        .subscribe()
}

function updateUI(newData){
    const two_digit_id = newData.id.slice(0,2)
    for (let i = 1; i <= 3; i++) {
        const isRegistered = two_digit_id == "ES" || two_digit_id =="DP"?newData[`regist_status`]:newData[`member${i}_status`];
        const regBtn = document.getElementById(`registered_button${i}`);
        if(regBtn && isRegistered){
            regBtn.disabled = true;
            regBtn.textContent = "Registered";
            regBtn.classList.remove("bg-blue-600", "hover:bg-blue-700");
            regBtn.classList.add("bg-gray-400", "cursor-not-allowed");
        }

    }
}

if (participantData) {
    commonData(participantData)
    getMember(participantData)
    setupRealtimeSubscription(participantData); // Start the real-time subscription
}




