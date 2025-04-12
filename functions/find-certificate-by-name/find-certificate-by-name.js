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
    // Initialize client for each invocation in serverless environment
    return createClient(supabaseUrl, supabaseKey);
  } catch (error) {
    console.error("[find-certificate] Failed to initialize Supabase client:", error);
    return null;
  }
};

// --- Configuration for the 'back-up' table ---
// !! IMPORTANT: VERIFY THESE VALUES MATCH YOUR SUPABASE TABLE AND COLUMNS !!
const TARGET_TABLE = 'back_up'; // The exact name of your Supabase table

const NAME_COLUMN = 'name';             // Column containing participant name
const SCHOOL_COLUMN = 'school';           // Column containing school name
const STATUS_COLUMN = 'status';           // Column indicating certificate readiness (boolean: true/false)
const CATEGORY_COLUMN = 'category_competition'; // Column indicating competition category ('MATH', 'DANCE', etc)
const ID_COLUMN = 'id';                 // A unique ID column
const CHAMPION_COLUMN = 'champion';       // Column with champion status (0, 1, 2, 3)
// --- End Configuration ---

// Define the specific columns to select from the target table
const COLUMNS_TO_SELECT = `${ID_COLUMN}, ${NAME_COLUMN}, ${SCHOOL_COLUMN}, ${STATUS_COLUMN}, ${CATEGORY_COLUMN}, ${CHAMPION_COLUMN}`;


const handler = async (event) => {
  // Initialize Supabase client for this invocation
  const supabase = getSupabaseClient();
  if (!supabase) {
    // Service unavailable if DB connection fails
    return {
        statusCode: 503,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: "Database connection failed. Service unavailable." })
    };
  }

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
        statusCode: 405,
        headers: { 'Content-Type': 'application/json', Allow: 'GET' },
        body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  // --- Input Validation ---
  const { name } = event.queryStringParameters || {}; // Add default empty object
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return {
        statusCode: 400, // Bad Request
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: "Missing or invalid 'name' query parameter." })
    };
  }

  const participantName = name.trim();
  console.log(`[find-certificate] Searching table '${TARGET_TABLE}' for name: ${participantName}`);

  try {
    // --- Query the specific table ---
    const { data, error } = await supabase
        .from(TARGET_TABLE)
        .select(COLUMNS_TO_SELECT)
        .ilike(NAME_COLUMN, participantName); // Case-insensitive search

    if (error) {
        console.error(`[find-certificate] Error querying table ${TARGET_TABLE}:`, error.message);
        // Throw an error to be caught by the outer catch block
        throw new Error(`Database query failed on table ${TARGET_TABLE}.`);
    }

    console.log(`[find-certificate] Found ${data ? data.length : 0} matches in '${TARGET_TABLE}' for name: ${participantName}`);

    // --- Analyze Query Results ---
    if (!data || data.length === 0) {
      // Name not found
      console.log(`[find-certificate] Name '${participantName}' not found in table '${TARGET_TABLE}'.`);
      return {
        statusCode: 404, // Not Found
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `Participant '${participantName}' not found. Please check the spelling.` })
      };
    } else if (data.length > 1) {
      // Multiple matches found - Ambiguous!
      console.warn(`[find-certificate] Ambiguous result: Name '${participantName}' found multiple times in table '${TARGET_TABLE}'.`);
      return {
        statusCode: 409, // Conflict
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: `Ambiguous result: Multiple participants named '${participantName}' found. Please contact support for assistance.` })
      };
    } else {
      // Exactly one match found - Success!
      const uniqueParticipant = data[0];
      const foundCategory = uniqueParticipant[CATEGORY_COLUMN];
      const foundSchool = uniqueParticipant[SCHOOL_COLUMN];
      const foundChampionStatus = uniqueParticipant[CHAMPION_COLUMN];

      console.log(`[find-certificate] Found unique participant '${participantName}' with category: ${foundCategory}, champion status: ${foundChampionStatus}`);

      // --- Final Validation of Required Data Fields from DB ---
      // Check School
      if (!foundSchool) {
          console.warn(`[find-certificate] Participant ${uniqueParticipant[NAME_COLUMN]} found, but school name ('${SCHOOL_COLUMN}') is missing.`);
          return {
              statusCode: 422, // Unprocessable Entity
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ error: `Participant ${uniqueParticipant[NAME_COLUMN]} found, but required school information is missing.` })
          };
      }
      // Check Category
      if (typeof foundCategory !== 'string' || !foundCategory.trim()) {
           console.warn(`[find-certificate] Participant ${uniqueParticipant[NAME_COLUMN]} found, but category ('${CATEGORY_COLUMN}') is missing or invalid.`);
           return {
               statusCode: 422, // Unprocessable Entity
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ error: `Participant ${uniqueParticipant[NAME_COLUMN]} found, but required category information is missing or invalid.` })
           };
      }
      // Check Status Column Existence
      if (!(STATUS_COLUMN in uniqueParticipant)) {
            console.warn(`[find-certificate] Participant ${uniqueParticipant[NAME_COLUMN]} found, but status column ('${STATUS_COLUMN}') is missing from data.`);
            return {
                statusCode: 422, // Unprocessable Entity
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: `Participant ${uniqueParticipant[NAME_COLUMN]} found, but required status information is missing.` })
            };
      }
      // Check Champion Column Existence
      if (!(CHAMPION_COLUMN in uniqueParticipant) || typeof foundChampionStatus === 'undefined' || foundChampionStatus === null) {
            // Allow champion status to be 0, so check for undefined/null specifically
            console.warn(`[find-certificate] Participant ${uniqueParticipant[NAME_COLUMN]} found, but champion status ('${CHAMPION_COLUMN}') is missing or null.`);
            return {
                statusCode: 422, // Unprocessable Entity
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: `Participant ${uniqueParticipant[NAME_COLUMN]} found, but required champion information is missing.` })
            };
       }
      // --- End Validation ---

      // Prepare the data structure expected by the frontend
      const resultToSend = {
          ...uniqueParticipant, // Includes id, name, school, status, category, champion (using configured names)
          competitionInfo: {
              category: foundCategory,       // The category found in the DB
              statusColumn: STATUS_COLUMN    // Tell frontend which column name holds the status value
          }
      };

      // Return the single participant object as JSON
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resultToSend)
      };
    }

  } catch (error) {
    console.error("[find-certificate] Unexpected error processing request:", error.message, error.stack);
    // Return a generic server error message for unexpected issues
    return {
      statusCode: 500, // Internal Server Error
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: "An unexpected error occurred while searching for the participant. Please try again later or contact support." })
    };
  }
};

module.exports = { handler };