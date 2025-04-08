// Docs on event and context https://docs.netlify.com/functions/build/#code-your-function-2
// Docs on event and context https://docs.netlify.com/functions/build/#code-your-function-2
const { createClient } = require('@supabase/supabase-js/');
require('dotenv').config();

const supabaseKey = process.env.APIKEY_SECRET
const supabaseUrl = process.env.APIURL_SECRET

const supabase = createClient(supabaseUrl, supabaseKey);

const handler = async (event) => {
  const {table, code} = event.queryStringParameters
  console.log(table)
  try{
    const {data} = await supabase
    .from(table)
    .update({regist_status:true})
    .eq("id", code)

    return{
      statusCode: 200,
      body:JSON.stringify(data)
    }
  }catch(error){
    const{status, statusText, header, data} = error.response
    return{
      statusCode: status,
      body: JSON.stringify({status, statusText, header, data})
    }
  }
}

module.exports = { handler }
