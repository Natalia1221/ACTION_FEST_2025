// --- Confirmation Modal Logic ---
const registrationForm = document.getElementById('registration-form');
const confirmationModal = document.getElementById('confirmation-modal');
const confirmationModalOverlay = document.getElementById('confirmation-modal-overlay');
const confirmationModalContentBox = document.getElementById('confirmation-modal-content-box');
const cancelConfirmationButton = document.getElementById('cancel-confirmation');
const confirmRegistrationButton = document.getElementById('confirm-registration');
const confCodeSpan = document.getElementById('conf-code'); // Reference to the code span

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

// --- Form Input Validation Function ---
function validateInput(inputElement) {
    const errorMsgElement = document.getElementById(`${inputElement.id}-error`);
    let isValid = inputElement.checkValidity(); // Basic check (e.g., required)

    // Add custom validation if needed (e.g., length, format)
    // if (inputElement.id === 'registration-code') {
    //    isValid = isValid && inputElement.value.length === 8; // Example: code must be 8 chars
    // }

    if (isValid) {
        inputElement.classList.remove('input-error');
        if (errorMsgElement) errorMsgElement.classList.add('hidden');
    } else {
        inputElement.classList.add('input-error');
        if (errorMsgElement) errorMsgElement.classList.remove('hidden');
    }
    return isValid;
}


// --- Form Submission Handler (Simplified) ---
if (registrationForm && confirmationModal && cancelConfirmationButton && confirmRegistrationButton && confCodeSpan) {

    registrationForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent actual submission

        let isFormValid = true;
        let firstInvalidElement = null;

        // --- Clear previous errors ---
        const codeInput = document.getElementById('registration-code');
        codeInput.classList.remove('input-error');
        const errorMsg = document.getElementById('registration-code-error');
        if (errorMsg) errorMsg.classList.add('hidden');

        // --- Validate Field ---
        if (!validateInput(codeInput)) {
            isFormValid = false;
            firstInvalidElement = codeInput;
        }

        // --- Handle Validation Result ---
        if (!isFormValid && firstInvalidElement) {
            firstInvalidElement.focus();
            firstInvalidElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (isFormValid) {
            const registrationCode = codeInput.value;

            // Populate confirmation modal
            confCodeSpan.textContent = registrationCode;
            showConfirmationModal();
        }
    });

    // Add real-time validation feedback on input blur
    const codeInputForBlur = document.getElementById('conf-code');
    if (codeInputForBlur) {
         codeInputForBlur.addEventListener('blur', () => validateInput(codeInputForBlur));
    }


    // --- Confirmation Modal Button Listeners ---
    cancelConfirmationButton.addEventListener('click', hideConfirmationModal);

    confirmRegistrationButton.addEventListener('click', function() {

        hideConfirmationModal();
        registrationForm.reset(); // Reset the form after confirmation

        codeToVerify = confCodeSpan.innerText.toUpperCase()

        if(codeToVerify.slice(0,2)== "MT" || codeToVerify.slice(0,2)== "DC"){
            table = "dance_math";
        }else if(codeToVerify.slice(0,2)== "ES" || codeToVerify.slice(0,2)== "DP"){
            table = "eng_post";
        }else if(codeToVerify.slice(0,2)!=""){
            alert("Code Tidak Valid.");
        }
        

        fetch( `/.netlify/functions/database?table=${table}&code=${codeToVerify}`)
          .then(res => res.json())
          .then(data => {
              if(data.id.toUpperCase() == codeToVerify.toUpperCase()){
                localStorage.setItem("participantData", JSON.stringify(data));
                localStorage.setItem("table", table);
                window.location.href = "detail.html";
              }else{
                alert("Data tidak ditemukan.");
              }
        })
    });

    // Closing confirmation modal via overlay or escape key
    if(confirmationModalOverlay) confirmationModalOverlay.addEventListener('click', hideConfirmationModal);
    if(confirmationModalContentBox) confirmationModalContentBox.addEventListener('click', (event) => event.stopPropagation());
    window.addEventListener('keydown', (event) => {
         if (event.key === 'Escape' && confirmationModal && !confirmationModal.classList.contains('hidden')) hideConfirmationModal();
    });
    // Initial transition states
    if(confirmationModalOverlay) confirmationModalOverlay.classList.add('opacity-0');
    if(confirmationModalContentBox) confirmationModalContentBox.classList.add('scale-95');

} else {
    console.error("Critical Form or Modal elements not found for validation!");
}