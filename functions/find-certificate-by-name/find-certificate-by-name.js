// functions/find-certificate-by-name.js
const { createClient } = require('@supabase/supabase-js/');
require('dotenv').config(); // Make sure to install dotenv: npm install dotenv

const supabaseKey = process.env.APIKEY_SECRET;
const supabaseUrl = process.env.APIURL_SECRET;

// Helper function to initialize Supabase client safely
const getSupabaseClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    console.error("[find-certificate] Supabase URL or Key is missing in environment variables.");
    return null;
  }
  try {
    return createClient(supabaseUrl, supabaseKey);
  } catch (error) {
    console.error("[find-certificate] Failed to initialize Supabase client:", error);
    return null;
  }
};

// --- Configuration for the 'back-up' table ---
const TARGET_TABLE = 'back_up'; // The exact name of your table

// *** CONFIRM THESE COLUMN NAMES in your 'back-up' table ***
const NAME_COLUMN = 'name';             // Column containing participant name
const SCHOOL_COLUMN = 'school';           // Column containing school name
const STATUS_COLUMN = 'status';    // Column indicating certificate readiness (boolean: true/false) - CHANGE IF NEEDED
const CATEGORY_COLUMN = 'category_competition';         // Column indicating competition category ('MATH', 'DANCE', etc) - CHANGE IF NEEDED
const ID_COLUMN = 'id'; 
const CHAMPION = 'champion'               // A unique ID column (optional but good practice)
// --- End Configuration ---

// Define the specific columns to select from the target table
const COLUMNS_TO_SELECT = `${ID_COLUMN}, ${NAME_COLUMN}, ${SCHOOL_COLUMN}, ${STATUS_COLUMN}, ${CATEGORY_COLUMN}, ${CHAMPION}`;


const handler = async (event) => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    // Service unavailable if DB connection fails
    return { statusCode: 503, body: JSON.stringify({ error: "Database connection failed. Service unavailable." }) };
  }

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers: { Allow: 'GET' }, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  // --- Input Validation ---
  const { name } = event.queryStringParameters;
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing or invalid 'name' query parameter." }) };
  }

  const participantName = name.trim();
  console.log(`[find-certificate] Searching table '${TARGET_TABLE}' for name: ${participantName}`);

  try {
    // --- Query the specific 'back-up' table ---
    const { data, error } = await supabase
        .from(TARGET_TABLE)
        .select(COLUMNS_TO_SELECT)
        .ilike(NAME_COLUMN, participantName); // Case-insensitive search on the configured name column

    if (error) {
        console.error(`[find-certificate] Error querying table ${TARGET_TABLE}:`, error.message);
        // Don't expose detailed error messages usually, but log them
        throw new Error(`Database query failed on table ${TARGET_TABLE}.`);
    }

    console.log(`[find-certificate] Found ${data ? data.length : 0} matches in '${TARGET_TABLE}' for name: ${participantName}`);

    // --- Analyze Query Results ---
    if (!data || data.length === 0) {
      // Name not found in the table
      console.log(`[find-certificate] Name '${participantName}' not found in table '${TARGET_TABLE}'.`);
      return {
        statusCode: 404, // Not Found
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `Participant '${participantName}' not found. Please check the spelling.` })
      };
    } else if (data.length > 1) {
      // Multiple participants found with the same name in this table - Ambiguous!
      console.warn(`[find-certificate] Ambiguous result: Name '${participantName}' found multiple times in table '${TARGET_TABLE}'.`);
      return {
        statusCode: 409, // Conflict - indicates ambiguity within the table
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: `Ambiguous result: Multiple participants named '${participantName}' found. Please contact support for assistance.` })
      };
    } else {
      // Exactly one match found - Success!
      const uniqueParticipant = data[0];
      const foundCategory = uniqueParticipant[CATEGORY_COLUMN]; // Get category using the configured column name
      const foundSchool = uniqueParticipant[SCHOOL_COLUMN];     // Get school using the configured column name

      console.log(`[find-certificate] Found unique participant '${participantName}' with category: ${foundCategory}`);

      // --- Final Validation of Required Data Fields from DB ---
      if (!foundSchool) {
          console.warn(`[find-certificate] Participant ${uniqueParticipant[NAME_COLUMN]} found, but school name ('${SCHOOL_COLUMN}') is missing.`);
          return {
              statusCode: 422, // Unprocessable Entity (data incomplete)
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ error: `Participant ${uniqueParticipant[NAME_COLUMN]} found, but required school information is missing.` })
          };
      }
      // Ensure category is a non-empty string
      if (typeof foundCategory !== 'string' || !foundCategory.trim()) {
           console.warn(`[find-certificate] Participant ${uniqueParticipant[NAME_COLUMN]} found, but category ('${CATEGORY_COLUMN}') is missing or invalid.`);
           return {
               statusCode: 422, // Unprocessable Entity
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ error: `Participant ${uniqueParticipant[NAME_COLUMN]} found, but required category information is missing or invalid.` })
           };
      }
      // Check if the status column key exists in the result (value can be true, false, or null)
      if (!(STATUS_COLUMN in uniqueParticipant)) {
            console.warn(`[find-certificate] Participant ${uniqueParticipant[NAME_COLUMN]} found, but status column ('${STATUS_COLUMN}') is missing from data.`);
            return {
                statusCode: 422, // Unprocessable Entity
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: `Participant ${uniqueParticipant[NAME_COLUMN]} found, but required status information is missing.` })
            };
      }
      // --- End Validation ---


      // Prepare the data structure expected by the frontend
      // Add the 'competitionInfo' object for compatibility with the frontend logic
      const resultToSend = {
          ...uniqueParticipant, // Includes id, name, school, status, category (using configured names)
          competitionInfo: {
              category: foundCategory,       // The category found in the DB
              statusColumn: STATUS_COLUMN    // Tell frontend which column name holds the status value
          }
      };

      // Return the single participant object
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resultToSend)
      };
    }

  } catch (error) {
    console.error("[find-certificate] Unexpected error processing request:", error.message);
    // Return a generic server error message for unexpected issues
    return {
      statusCode: 500, // Internal Server Error
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: "An unexpected error occurred while searching for the participant. Please try again later." })
    };
  }
};

module.exports = { handler };