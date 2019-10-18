const database = require("../database");

module.exports = () => {
  setInterval(async () => {
    const client = await database.connect();
    try {
      await client.query(/* SQL */ `
        INSERT INTO abc VALUES (1)
        `);
    } catch (error) {
    } finally {
      client.release();
    }
  }, 60000);
};

// with to_delete as (select id from the_table where
// creation_time < now() - interval '10 minutes' for update skip locked)
// delete from the_table using to_delete where the_table.id = to_delete.id;
