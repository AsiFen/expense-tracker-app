import pgPromise from 'pg-promise';
import dotenv from 'dotenv';
const d = process.env.database_url
dotenv.config();

const connectPromise = {
    connectionString: process.env.database_url,
    ssl: {rejectUnauthorized: false}
};

const db = pgPromise()(connectPromise);

db.connect();
//export the database
export default db;