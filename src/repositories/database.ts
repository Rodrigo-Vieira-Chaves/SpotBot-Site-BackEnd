import sqlite3 from 'sqlite3';

class DatabaseInstance
{
    private readonly database: sqlite3.Database;
    private readonly DBNAME = './src/repositories/database.db';

    private readonly SQL_TABLES_SCRIPT =
        `
            CREATE TABLE IF NOT EXISTS users (
                userID TEXT PRIMARY KEY,
                userName TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS bots (
                botID TEXT PRIMARY KEY,
                userID TEXT NOT NULL,
                botName TEXT NOT NULL UNIQUE,
                exchange TEXT NOT NULL,
                status TEXT NOT NULL,
                account TEXT NOT NULL,
                apiKey TEXT NOT NULL UNIQUE,
                apiSecret TEXT NOT NULL UNIQUE,
                FOREIGN KEY (userID) REFERENCES users (userID)
            );
        `;

    constructor ()
    {
        this.database = new sqlite3.Database(this.DBNAME, (err) =>
        {
            if (err)
            {
                console.log(err.message);
                throw err;
            }
            else
            {
                this.database.exec(this.SQL_TABLES_SCRIPT);
                console.log(`'${this.DBNAME}' created successfully.`);
            }
        });
    }

    getDatabase ()
    {
        return this.database;
    }
}

const databaseInstance = new DatabaseInstance();
export { databaseInstance };
