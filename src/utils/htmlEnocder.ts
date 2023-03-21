import { rehype } from "rehype";
import rehypeHighlight from "rehype-highlight";
import sql from "highlight.js/lib/languages/sql";

export const processHtml = (html: string) => {
	return rehype()
		.data("settings", { fragment: true })
		.use(rehypeHighlight, { languages: { sql: sql } })
		.processSync(`${html}`)
		.toString();
};

export function htmlEncode(sHtml: string) {
	return sHtml
		.replace(/```(tsx?|jsx?|html|xml)(.*)\s+([\s\S]*?)(\s.+)?```/g, (str: string) => {
			return str.replace(
				/[<&"]/g,
				(c: string) =>
					(({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" } as Record<string, string>)[c])
			);
		})
		.replace(
			/[<&"]/g,
			(c: string) =>
				(({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" } as Record<string, string>)[c])
		);
}
