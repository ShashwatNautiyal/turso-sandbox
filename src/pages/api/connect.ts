// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import TursoDB from "@/utils/db";
import type { NextApiRequest, NextApiResponse } from "next";

export type ConnectResponse = { name: string } | { error: string };

export default function handler(req: NextApiRequest, res: NextApiResponse<ConnectResponse>) {
	const reqUrl = req.query.url;

	if (typeof reqUrl === "string" && reqUrl) {
		const db = new TursoDB(reqUrl);

		return res.status(200).json({ name: db.getName() });
	}

	return res.status(400).json({ error: "Invalid URL" });
}
