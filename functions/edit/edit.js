// Docs on event and context https://docs.netlify.com/functions/build/#code-your-function-2
// Docs on event and context https://docs.netlify.com/functions/build/#code-your-function-2
const { createClient } = require('@supabase/supabase-js/');
require('dotenv').config();

const supabaseKey = process.env.APIKEY_SECRET
const supabaseUrl = process.env.APIURL_SECRET

const supabase = createClient(supabaseUrl, supabaseKey);

const handler = async (event) => {
  const {table, code, name, school, grade, i} = event.queryStringParameters
  console.log("MASUK")
  
  let updateObject = {};
  if (code.slice(0, 2) === "MT" || code.slice(0, 2) === "DC") {
        updateObject[`member${i}_name`] = name
        updateObject[`member${i}_school`] = school
        updateObject[`member${i}_grade`] = grade
  } else {
        updateObject[`full_name`] = name
        updateObject[`school`] = school
        updateObject[`grade`] = grade
  }
    
  

  try{
    const {data} = await supabase
    .from(table)
    .update(updateObject)
    .eq("id", code)

    return{
      statusCode: 200,
      body:JSON.stringify(data)
    }
  }catch (error) {
    return {
      statusCode: error?.response?.status || 500,
      body: JSON.stringify({
        message: error.message,
        details: error?.response?.data || null,
      }),
    };
  }
}

module.exports = { handler }
