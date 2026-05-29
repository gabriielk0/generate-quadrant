const { createClient } = require("@libsql/client");
const fs = require("fs");
const path = require("path");

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error("Error: Missing TURSO_DATABASE_URL in environment variables.");
  process.exit(1);
}

const client = createClient({ url, authToken });

async function main() {
  try {
    const sqlPath = path.join(__dirname, "../prisma/schema.sql");
    if (!fs.existsSync(sqlPath)) {
      console.error(`Error: Schema file not found at ${sqlPath}. Make sure to generate it first.`);
      process.exit(1);
    }
    const sql = fs.readFileSync(sqlPath, "utf8");

    console.log(`Connecting to Turso at: ${url}`);
    console.log("Applying schema DDL statements...");
    await client.executeMultiple(sql);
    console.log("Schema successfully applied to Turso database!");
  } catch (error) {
    console.error("Error applying schema to Turso:", error);
    process.exit(1);
  } finally {
    client.close();
  }
}

main();
