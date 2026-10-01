const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

const envPath = ".env";
const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};
envContent.split("\n").forEach((line) => {
  const parts = line.split("=");
  if (parts.length === 2) {
    env[parts[0].trim()] = parts[1].trim();
  }
});

const supabaseUrl = env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  const { data: students, error } = await supabase
    .from("students")
    .select("muid")
    .limit(20);

  if (error) {
    console.error("Error fetching students:", error.message);
    return;
  }
  if (!students || students.length === 0) {
    console.log("No students found in the database.");
    return;
  }

  for (const student of students) {
    const muid = student.muid;
    console.log(`Fetching profile for muid: ${muid}`);

    const res = await fetch(`https://mulearn.org/api/v1/dashboard/profile/user-profile/${encodeURIComponent(muid)}/`);
    if (res.status === 400 || res.status === 403) {
      console.log(`Private profile for ${muid}, trying next...`);
      continue;
    }
    if (!res.ok) {
      console.error(`HTTP Error: ${res.status} for ${muid}, trying next...`);
      continue;
    }
    const json = await res.json();
    console.log("Profile response structure:");
    console.log(JSON.stringify(json, null, 2));
    break;
  }
}

main().catch(console.error);
