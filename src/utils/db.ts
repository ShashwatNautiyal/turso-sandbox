import { createClient, Client } from "@libsql/client";
import DatabaseConstructor, { Database } from "better-sqlite3";

class TursoDB {
	private db: any;
	private url: string;
	constructor(url: string) {
		this.url = url;
		if (!this.url.includes("@") || !this.url.includes("-")) {
			throw new Error("You must provide a valid http URL");
		} else {
			this.db = createClient({ url });
		}
	}

	async query(sql: string, params?: any) {
		return await this.db.execute(sql, params);
	}

	async transaction(stmts: string[] | any[]) {
		return await this.db.transaction(stmts);
	}

	getName() {
		if (!this.url.includes("@") || !this.url.includes("-")) return "Local DB";
		return this.url.split("@").pop()?.split("-").shift() ?? "";
	}
}

export default TursoDB;
