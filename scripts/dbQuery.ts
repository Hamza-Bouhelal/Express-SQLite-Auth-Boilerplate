import { Database } from "sqlite3";
import { getConfig } from "../src/utils/config";

const { DB_PATH } = getConfig();

const db = new Database(DB_PATH + "/db.sqlite3", (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the database.");
});

async function runQueryAll(query: string) {
  await db.all(query, [], (err, row) => {
    if (err) {
      console.log(err);
    } else {
      console.log(row);
    }
  });
}
async function runQuery(query: string) {
  await db.run(query, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("success");
    }
  });
}
