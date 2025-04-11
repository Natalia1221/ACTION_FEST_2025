const { createClient } = require('@supabase/supabase-js/');
require('dotenv').config();

const supabaseKey = process.env.APIKEY_SECRET;
const supabaseUrl = process.env.APIURL_SECRET;

const supabase = createClient(supabaseUrl, supabaseKey);

const handler = async (event) => {
    const { table, code, name, school, grade, i } = event.queryStringParameters;

    // Validasi Input
    if (!table || !code || !name || !school || !grade) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Missing required parameters." }),
        };
    }

    // Sanitasi Input (contoh sederhana)
    const sanitizedName = name.trim();
    const sanitizedSchool = school.trim();
    const sanitizedGrade = grade.trim();

    let updateObject = {};
    if (code.slice(0, 2) === "MT" || code.slice(0, 2) === "DC") {
        updateObject[`member${i}_name`] = sanitizedName;
        updateObject[`member${i}_school`] = sanitizedSchool;
        updateObject[`member${i}_grade`] = sanitizedGrade;
    } else {
        updateObject[`full_name`] = sanitizedName;
        updateObject[`school`] = sanitizedSchool;
        updateObject[`grade`] = sanitizedGrade;
    }

    try {
        const { data, error, count } = await supabase
            .from(table)
            .update(updateObject)
            .eq("id", code);

        if (error) {
            console.error("Supabase Error:", error);
            return {
                statusCode: 500,
                body: JSON.stringify({ message: "Failed to update data.", details: error }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Data updated successfully.", data, count }),
        };
    } catch (error) {
        console.error("Function Error:", error);
        return {
            statusCode: error?.response?.status || 500,
            body: JSON.stringify({
                message: error.message,
                details: error?.response?.data || null,
            }),
        };
    }
};

module.exports = { handler };