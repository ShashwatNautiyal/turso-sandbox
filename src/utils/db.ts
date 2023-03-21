import { createClient, Client } from "@libsql/client";

class TursoDB {
	private db: Client;
	private url: string;
	constructor(url: string) {
		this.url = url;
		this.db = createClient({ url });
	}

	async query(sql: string, params?: any) {
		return await this.db.execute(sql, params);
	}

	async transaction(stmts: string[] | any[]) {
		return await this.db.transaction(stmts);
	}

	getName() {
		return this.url.split("@").pop()?.split("-").shift() ?? "";
	}
}

export default TursoDB;
