const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseKey = process.env.APIKEY_SECRET;
const supabaseUrl = process.env.APIURL_SECRET;

const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);
    const { id, status } = data;

    if (!id || typeof status !== 'boolean') {
      return { statusCode: 400, body: 'Invalid request body' };
    }

    // --- Memperbarui Data di Supabase ---
    const { error } = await supabase
      .from('back_up') // Ganti 'souvenirs' dengan nama tabel Anda
      .update({ status: status })
      .eq('id', id);

    if (error) {
      console.error('Error updating souvenir status in Supabase:', error);
      return { statusCode: 500, body: 'Internal Server Error' };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Souvenir status updated successfully' })
    };

  } catch (error) {
    console.error('Error processing request:', error);
    return { statusCode: 500, body: 'Internal Server Error' };
  }
};