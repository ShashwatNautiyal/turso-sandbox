// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import TursoDB from "@/utils/db";
import type { NextApiRequest, NextApiResponse } from "next";

export type ConnectResponse = Record<any, any> | { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<ConnectResponse>) {
	const reqUrl = req.query.url;
	const query = req.body.query as string;

	if (!query) return res.status(400).json({ error: "Invalid query" });

	if (typeof reqUrl === "string" && reqUrl) {
		const db = new TursoDB(reqUrl);

		try {
			const result = await db.query(query);
			if (result.success) {
				return res.status(200).json({ ...result });
			} else {
				return res.status(400).json({ error: result.error?.message.split("(").shift() });
			}
		} catch (error: any) {
			return res.status(400).json({ error: "Invalid query" });
		}
	}

	return res.status(400).json({ error: "Invalid URL" });
}
