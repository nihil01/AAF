import {
    CapacitorSQLite, SQLiteConnection
} from '@capacitor-community/sqlite';
import type {
    SQLiteDBConnection
} from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';

class SQLiteService {
    private sqlite: SQLiteConnection;
    private database: SQLiteDBConnection | null = null;
    private databaseName: string = '';
    private connected: boolean = false;

    constructor() {
        this.sqlite = new SQLiteConnection(CapacitorSQLite);
    }

    private async initializeWebComponent(): Promise<void> {
        if (Capacitor.getPlatform() === 'web') {
            try {
                console.log("🌐 Initializing SQLite for web platform...");
                
                // Check if the jeep-sqlite element already exists
                let jeepSqlite = document.querySelector('jeep-sqlite');
                
                if (!jeepSqlite) {
                    console.log("🔧 Creating jeep-sqlite web component...");
                    jeepSqlite = document.createElement('jeep-sqlite');
                    jeepSqlite.setAttribute('id', 'jeep-sqlite');
                    document.body.appendChild(jeepSqlite);
                    console.log("✅ jeep-sqlite web component created");
                } else {
                    console.log("✅ jeep-sqlite web component already exists");
                }
                
                // Wait a bit for the component to be ready
                await new Promise(resolve => setTimeout(resolve, 100));
                console.log("✅ Web component initialization completed");
            } catch (error) {
                console.error("❌ Error creating jeep-sqlite web component:", error);
                throw error;
            }
        } else {
            console.log(`📱 Skipping web component initialization for platform: ${Capacitor.getPlatform()}`);
        }
    }

    public async initialize(): Promise<void> {
        try {
            console.log("🚀 Initializing SQLite database...");
            console.log(`🌐 Platform: ${this.getPlatform()}`);
            console.log(`📱 SQLite Supported: ${this.isSupported()}`);
            
            // Initialize web component for web platform
            await this.initializeWebComponent();
            
            await this.createConnection('aaf.db');
            await this.createUserChatTable();
            console.log("✅ SQLite database initialized successfully");
        } catch (error) {
            console.error("❌ Error initializing SQLite database:", error);
            throw error;
        }
    }

    private async createConnection(
        databaseName: string,
        encrypted: boolean = false,
        mode: string = 'no-encryption',
        version: number = 1,
        readOnly: boolean = false
    ): Promise<SQLiteDBConnection> {
        try {
            if (this.connected) {
                throw new Error('Database already connected');
            }
        
            this.databaseName = databaseName;
            this.database = await this.sqlite.createConnection(
                databaseName,
                encrypted,
                mode,
                version,
                readOnly
            );
            
            // Open the database connection
            await this.database.open();
            this.connected = true;
            console.log("✅ Database connection opened successfully");
            return this.database;
        } catch (error) {
            console.error('Error creating SQLite connection:', error);
            throw error;
        }
    }

    public async createUserChatTable(): Promise<void> {
        try {
            const sql = `CREATE TABLE IF NOT EXISTS user_chat (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                chat_id TEXT UNIQUE,
                data TEXT
            )`;

            await this.query(sql);
            console.log("✅ User chat table created/verified");
        } catch (error) {
            console.error("❌ Error creating user chat table:", error);
            throw error;
        }
    }


    public async insertIntoUserChat(chatId: string, data: any): Promise<void> {
        try {
            // First try to update existing record
            const insertSql = `INSERT INTO user_chat (chat_id, data) VALUES(?, ?)`;
            await this.query(insertSql, [ chatId, JSON.stringify(data) ]);

        } catch (error) {
            console.error("❌ Error updating user chat:", error);
            throw error;
        }
    }

    public async getUserChatData(chatId: string): Promise<any> {
        try {
            const sql = `SELECT * FROM user_chat WHERE chat_id = ?`;
            const result = await this.query(sql, [chatId]);
            
            if (result.rows && result.rows.length > 0) {
                const row = result.rows[0];
                // Parse the JSON data if it exists
                if (row.data) {
                    try {
                        row.data = JSON.parse(row.data);
                    } catch (parseError) {
                        console.warn("⚠️ Could not parse chat data as JSON:", parseError);
                    }
                }
                return row;
            }
            
            return null; // No chat found
        } catch (error) {
            console.error("❌ Error getting user chat:", error);
            throw error;
        }
    }

    private async query(sql: string, values: any[] = []): Promise<any> {
        try {
            // Check if we need to establish a connection
            if (!this.connected || !this.database) {
                console.log("🔗 Establishing database connection...");
                await this.createConnection('aaf.db');
            }

            if (!this.database) {
                throw new Error('Database connection not established');
            }

            console.log(`🔍 Executing query: ${sql.substring(0, 50)}...`);
            const result = await this.database.query(sql, values);
            console.log("✅ Query executed successfully");
            return result;
        } catch (error) {
            console.error('❌ Error executing query:', error);
            console.error('Query was:', sql);
            console.error('Values were:', values);
            throw error;
        }
    }

    public async closeConnection(): Promise<void> {
        if (this.database && this.databaseName) {
            await this.sqlite.closeConnection(this.databaseName, false);
            this.database = null;
        }
    }

    public isSupported(): boolean {
        const platform = Capacitor.getPlatform();
        return platform === 'ios' || platform === 'android' || platform === 'web';
    }

    public getPlatform(): string {
        return Capacitor.getPlatform();
    }

    public isDatabaseOpen(): boolean {
        return this.connected && this.database !== null;
    }
}

// Export singleton instance
export const sqliteService = new SQLiteService();

// Convenience function for easy initialization
export const initializeSQLite = async (): Promise<void> => {
    try {
        console.log(`🌐 Platform: ${sqliteService.getPlatform()}`);
        console.log(`📱 SQLite Supported: ${sqliteService.isSupported()}`);
        
        if (sqliteService.isSupported()) {
            await sqliteService.initialize();
        } else {
            console.warn("⚠️ SQLite not supported on this platform");
        }
    } catch (error) {
        console.error("❌ Failed to initialize SQLite:", error);
        throw error;
    }
};

