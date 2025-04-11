// functions/getSouvenirList.js (or whatever you name this file)
const { createClient } = require('@supabase/supabase-js/');
require('dotenv').config(); // Make sure dotenv is installed (npm install dotenv)

const supabaseKey = process.env.APIKEY_SECRET;
const supabaseUrl = process.env.APIURL_SECRET;

// Basic check if environment variables are loaded
if (!supabaseKey || !supabaseUrl) {
  console.error("Supabase URL or Key is missing. Check environment variables.");
  // Return an error immediately if config is missing
  // Note: This immediate return might not work perfectly in all Netlify setups,
  // but the console error is the main point here.
  // Ideally, the handler structure should still be returned.
}

// Initialize Supabase client *outside* the handler for potential reuse
// Add error handling for client creation if needed
let supabase;
try {
    supabase = createClient(supabaseUrl, supabaseKey);
} catch (error) {
    console.error("Failed to initialize Supabase client:", error);
    // Can't proceed without a client
}


const handler = async (event) => {
    // Check if Supabase client was initialized successfully
    if (!supabase) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Supabase client failed to initialize. Check server logs." })
        };
    }

    console.log("Function invoked. Attempting to fetch from 'back_up' table."); // Log start

    try {
        const { data, error } = await supabase
          .from("back_up") // Ensure this table name is exactly correct
          .select("*");

        // --- Check for Supabase-specific errors ---
        if (error) {
            console.error("Supabase query error:", error);
            // Throw the error to be caught by the catch block below
            throw error;
        }

        console.log(`Successfully fetched ${data ? data.length : 0} records.`); // Log success and count

        // --- Return the fetched data ---
        return {
            statusCode: 200,
            // Use the 'data' variable which contains the query result
            body: JSON.stringify(data || []) // Return data or empty array if data is null/undefined
        };

    } catch (error) {
        console.error("Caught an error:", error); // Log the full error object

        // --- Improved Error Response ---
        // Send back a structured error message
        const errorMessage = error.message || "An unknown error occurred.";
        const errorDetails = error.details || null; // Supabase might add details
        const errorHint = error.hint || null;     // Supabase might add hints
        const statusCode = error.status || 500;   // Use error status or default to 500

        return {
            statusCode: statusCode,
            body: JSON.stringify({
                message: errorMessage,
                details: errorDetails,
                hint: errorHint,
                // Avoid sending back raw header/data from error.response unless necessary for specific debugging
            })
        };
    }
};

module.exports = { handler };