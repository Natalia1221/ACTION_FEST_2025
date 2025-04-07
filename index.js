document.getElementById("submit-button").addEventListener("click", async function(){
    register_code = document.getElementById("codeInput").value.toUpperCase()
    
    if(register_code.slice(0,3)== "MAT" || register_code.slice(0,3)== "DAN"){
        table = "dance_math";
    }else if(register_code.slice(0,3)== "ENG" || register_code.slice(0,3)== "POS"){
        table = "eng_post";
    }else if(unique_code.slice(0,3)!=""){
        alert("Code Tidak Valid.");
    }

    fetch( `/.netlify/functions/database?table=${table}`)
      .then(res => res.json())
      .then(data => console.log(data));
})