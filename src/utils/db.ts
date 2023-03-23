import { createClient, Client } from "@libsql/client";

class TursoDB {
	private db: any;
	private url: string;
	constructor(url: string) {
		this.url = url;
		if (!this.url.includes("turso.io")) {
			throw new Error("You must provide a valid http URL");
		} else {
			this.db = createClient({ url: this.url });
			console.log(this.db);
		}
	}

	async query(sql: string, params?: any) {
		return await this.db.execute(sql, params);
	}

	async transaction(stmts: string[] | any[]) {
		return await this.db.transaction(stmts);
	}

	getName() {
		if (!this.url.includes("@")) return "Unknown DB";
		return this.url.split("@").pop()?.split("-").shift() ?? "";
	}
}

export default TursoDB;
