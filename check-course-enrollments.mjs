import pg from "pg";
const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

await client.connect();

// Check course_enrollments table
const result = await client.query(`
  SELECT column_name, data_type 
  FROM information_schema.columns 
  WHERE table_name = 'course_enrollments' 
  ORDER BY ordinal_position
`);

console.log("course_enrollments table structure:");
console.table(result.rows);

await client.end();
