const path = require("path");
const fs = require("fs").promises;
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const { Client } = require("pg");

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

const restartDb = async () => {
  await client.connect();
  try {
    const reset = await fs.readFile(
      path.join(__dirname, "./reset.sql"),
      "utf-8"
    );
    const tables = await fs.readFile(
      path.join(__dirname, "./tables.sql"),
      "utf-8"
    );
    const functions = await fs.readFile(
      path.join(__dirname, "./functions.sql"),
      "utf-8"
    );
    const triggers = await fs.readFile(
      path.join(__dirname, "./triggers.sql"),
      "utf-8"
    );
    const data = await fs.readFile(path.join(__dirname, "./data.sql"), "utf-8");

    console.log("Restarting database...");
    await client.query(`
    ${reset}
    ${functions}
    ${tables}
    ${triggers}
    ${data}`);
    console.log("Restarted database.");
  } catch (error) {
    console.error(error);
  } finally {
    process.exit();
  }
};

restartDb();
