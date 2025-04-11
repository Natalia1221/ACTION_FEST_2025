const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseKey = process.env.APIKEY_SECRET;
const supabaseUrl = process.env.APIURL_SECRET;

if (!supabaseKey || !supabaseUrl) {
    console.error("Supabase URL or Key is missing. Check environment variables.");
}

let supabase;
try {
    supabase = createClient(supabaseUrl, supabaseKey);
} catch (error) {
    console.error("Failed to initialize Supabase client:", error);
}

const handler = async (event) => {
    if (!supabase) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Supabase client failed to initialize. Check server logs." })
        };
    }

    const { name } = JSON.parse(event.body); // Parse the name from the request body

    if (!name) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Name is required." })
        };
    }

    try {
        const { data, error } = await supabase
            .from("certif") // Use the correct table name "certif"
            .select("*")
            .eq("name", name); // Filter by name

        if (error) {
            console.error("Supabase query error:", error);
            throw error;
        }

        if (data && data.length > 0) {
            return {
                statusCode: 200,
                body: JSON.stringify(data[0]) // Return the first matching record
            };
        } else {
            return {
                statusCode: 404, // Not found
                body: JSON.stringify({ message: "Certificate not found." })
            };
        }

    } catch (error) {
        console.error("Caught an error:", error);

        const errorMessage = error.message || "An unknown error occurred.";
        const errorDetails = error.details || null;
        const errorHint = error.hint || null;
        const statusCode = error.status || 500;

        return {
            statusCode: statusCode,
            body: JSON.stringify({
                message: errorMessage,
                details: errorDetails,
                hint: errorHint,
            })
        };
    }
};

module.exports = { handler };