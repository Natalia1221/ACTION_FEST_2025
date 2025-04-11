// functions/markSouvenirDone.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseKey = process.env.APIKEY_SECRET;
const supabaseUrl = process.env.APIURL_SECRET;

const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event) => {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const {code, name, school, category} = event.queryStringParameters;

    if ( !code || !name || !school || !category) {
        return { statusCode: 400, body: 'Missing parameters' };
    }

    try {
        // Insert name and school into the back_up table
        const { error: insertError } = await supabase
            .from('back_up') // Replace with your actual back_up table name
            .insert({
                name: decodeURIComponent(name),
                school: decodeURIComponent(school),
                category_competition :decodeURIComponent(category)
            });

        if (insertError) {
            throw insertError;
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Souvenir marked as done, data updated, and backup created." }),
        };
    } catch (error) {
        console.error('Error in markSouvenirDone:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};