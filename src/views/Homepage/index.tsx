import React from "react";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import axios from "axios";
import { BsServer, BsPlayFill, BsCheck } from "react-icons/bs";
import { SiQuantconnect } from "react-icons/si";
import { MdOutlineCheckCircle, MdPlayCircleOutline } from "react-icons/md";
import { IoIosArrowForward } from "react-icons/io";
import { CgSpinner } from "react-icons/cg";
import { BiErrorCircle } from "react-icons/bi";
import { ImSpinner3 } from "react-icons/im";
import { MdSave } from "react-icons/md";
import useLocalStorageState from "@/utils/useLocalStorageState";
import { htmlEncode, processHtml } from "@/utils/htmlEnocder";

const Homepage = () => {
	const [recentQueriesActive, setRecentQueriesActive] = useState<boolean>(false);
	const [savedQueriesActive, setSavedQueriesActive] = useState<boolean>(false);
	const [query, setQuery] = useState<string>("");
	const [dbName, setDbName] = useState<string>("");
	const [isDBLoading, setIsDBLoading] = useState<boolean>(false);
	const [localUrl, setLocalUrl] = useLocalStorageState<string>("dbUrl", "");
	const [isQueryLoading, setIsQueryLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>("");
	const [isQuerySaving, setIsQuerySaving] = useState<boolean>(false);
	const [recentQueries, setRecentQueries] = useLocalStorageState<string[]>(
		`${localUrl}-recentQueries`,
		[]
	);
	const [savedQueries, setSavedQueries] = useLocalStorageState<string[]>(
		`${localUrl}-savedQueries`,
		[]
	);
	const [data, setData] = useState<{
		columns: any[];
		meta: { duration: number };
		rows: any[][];
		success: boolean;
	} | null>(null);

	const numbersRef = useRef<any>(null);

	useEffect(() => {
		if (localUrl) {
			handleConnect(localUrl);
			savedQueries.length > 0 && setSavedQueriesActive(true);
			recentQueries.length > 0 && setRecentQueriesActive(true);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleScroll = (e: any) => {
		if (numbersRef.current) {
			numbersRef.current.scrollTop = e.currentTarget.scrollTop;
		}
	};

	const htmlStr = useMemo(
		() =>
			processHtml(
				`<pre aria-hidden=true><code ${`class="language-sql"`} >${htmlEncode(
					String(query || "")
				)}</code><br /></pre>`
			),
		[query]
	);

	const handleConnect = async (url: string) => {
		try {
			setIsDBLoading(true);
			const res = await axios.get(`api/connect?url=${url}`);
			setDbName(res.data.name);
		} catch (error) {
			setDbName("");
			console.log(error);
		} finally {
			setIsDBLoading(false);
		}
	};

	const handleQuery = async (query: string) => {
		try {
			setError("");
			setIsQueryLoading(true);
			const res = await axios.post(`api/query?url=${localUrl}`, { query });
			setData(res.data);
			setRecentQueries((prev) => {
				if (prev.includes(query)) {
					return prev;
				}
				if (prev.length >= 5) {
					prev.shift();
				}
				return [query, ...prev];
			});
		} catch (error: any) {
			setData(null);
			setError(error.response.data.error);
			console.log(error);
		} finally {
			setIsQueryLoading(false);
		}
	};

	const handleSaveQuery = (query: string) => {
		setIsQuerySaving(true);
		setSavedQueries((prev) => {
			if (prev.includes(query)) {
				return prev;
			}
			return [...prev, query];
		});
		setTimeout(() => {
			setIsQuerySaving(false);
		}, 1000);
	};

	const paddingLeft =
		query.split("\n").length / 10 + 30 > 50 ? 70 : query.split("\n").length / 10 + 40;

	return (
		<div>
			<Head>
				<title>Turso Sandbox</title>
				<meta name="description" content="Created by Shashwat Nautiyal" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			{/* Header */}
			<div className="flex h-16 items-center justify-between border-b-2 border-gray-200 px-6">
				<div className="flex cursor-pointer items-center gap-2">
					<Image src="/images/turso-logo.svg" alt="Turso Logo" width={34} height={34} />
					<h1 className="text-xl font-medium text-[#191B4D]">Turso Sandbox</h1>
				</div>

				<div className="flex w-1/2 items-center gap-2">
					<input
						type="text"
						value={localUrl}
						onChange={(e) => setLocalUrl(e.target.value)}
						placeholder="Enter your DB url"
						className="w-full rounded-md border bg-gray-200 py-1 px-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
					/>
					<button
						onClick={() => handleConnect(localUrl)}
						className="flex h-fit items-center gap-1.5 rounded-md bg-yellow-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-yellow-600"
					>
						<SiQuantconnect size={20} className={isDBLoading ? "animate-spin" : ""} />
						Connect
					</button>
				</div>

				<button
					onClick={() => handleQuery(query)}
					disabled={!dbName || isQueryLoading}
					className="flex h-fit items-center rounded-md bg-green-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-600 disabled:pointer-events-none disabled:opacity-60"
				>
					{isQueryLoading ? (
						<CgSpinner size={20} className="animate-spin" />
					) : (
						<BsPlayFill size={20} />
					)}
					Run
				</button>
			</div>

			<div className="flex">
				{/* Sidebar */}
				<div className="flex h-[calc(100vh-64px)] min-w-[320px] flex-col gap-2 border-r-2 border-gray-200 bg-slate-50 p-6">
					{/* Database */}
					<div className="select-none font-medium uppercase text-gray-500">Database</div>

					<div className="flex cursor-pointer items-center justify-between rounded-lg border-2 bg-white p-2">
						<div className="flex gap-2">
							<BsServer className="text-[#191B4D]" size={24} />
							<div className="font-medium capitalize">{dbName ? dbName : "Not connected"}</div>
						</div>
						{dbName && (
							<div className="flex items-center rounded-lg bg-green-500 pr-2 text-xs font-medium text-white">
								<BsCheck size={20} />
								Connected
							</div>
						)}
					</div>

					<div className="my-4 -mx-6 h-[2px] bg-gray-200/50" />

					{/* Recent Queries */}
					<div
						onClick={() => setRecentQueriesActive((prev) => !prev)}
						className="flex cursor-pointer select-none items-center gap-1 font-medium uppercase text-gray-500"
					>
						<IoIosArrowForward
							size={16}
							className={`${recentQueriesActive ? "rotate-90 transform" : ""} transition-all`}
						/>
						Recent Queries
					</div>

					{recentQueriesActive &&
						recentQueries.map((query, index) => (
							<div key={index} className="ml-6 flex items-center gap-2">
								<span className="rounded-md bg-yellow-500 px-[4px] text-xs text-white">SQL</span>
								<div
									onClick={() => setQuery(query)}
									className="w-[250px] cursor-pointer overflow-hidden overflow-ellipsis whitespace-nowrap text-sm text-[#191B4D]"
								>
									{query}
								</div>
							</div>
						))}

					<div className="my-4 -mx-6 h-[2px] bg-gray-200/50" />

					{/* Saved Queries */}
					<div
						onClick={() => setSavedQueriesActive((prev) => !prev)}
						className="flex cursor-pointer select-none items-center gap-1 font-medium uppercase text-gray-500"
					>
						<IoIosArrowForward
							size={16}
							className={`${savedQueriesActive ? "rotate-90 transform" : ""} transition-all`}
						/>
						Saved Queries
					</div>

					{savedQueriesActive &&
						savedQueries.map((query, index) => (
							<div key={index} className="ml-6 flex items-center gap-2">
								<span className="rounded-md bg-green-500 px-[4px] text-xs text-white">SQL</span>
								<div
									onClick={() => setQuery(query)}
									className="w-[250px] cursor-pointer overflow-hidden overflow-ellipsis whitespace-nowrap text-sm text-[#191B4D]"
								>
									{query}
								</div>
							</div>
						))}
				</div>

				<div className="flex w-full max-w-[calc(100vw-320px)] flex-col px-6">
					{/* CodeSandBox */}
					<div className="mt-6 h-[calc(40vh-64px)] w-full  overflow-auto">
						<div className="relative w-full overflow-hidden text-left">
							<div ref={numbersRef} className="absolute top-0 left-4 ">
								{[...Array(query.split("\n").length)].map((_, index) => (
									<div key={index} className="font-medium text-gray-400">
										{index + 1}
									</div>
								))}
							</div>

							<textarea
								className="absolute top-0 left-0 resize-none text-base font-medium"
								style={{ paddingLeft: `${paddingLeft}px` }}
								autoComplete="off"
								autoCorrect="off"
								spellCheck="false"
								autoCapitalize="off"
								placeholder="Write your query here..."
								value={query}
								onChange={(e) => setQuery(e.target.value)}
							/>

							<div
								onScroll={handleScroll}
								style={{ paddingLeft: `${paddingLeft}px` }}
								dangerouslySetInnerHTML={{
									__html: query ? htmlStr : "<p class='text-gray-400'>Write your query here...</p>",
								}}
							/>
						</div>
					</div>

					<div className="-mx-6 mt-6 h-[2px] bg-gray-200" />

					<div className="flex h-14 items-center gap-3">
						{isQueryLoading ? (
							<ImSpinner3 size={24} className="animate-spin text-gray-400" />
						) : error ? (
							<BiErrorCircle size={24} className="text-red-500" />
						) : data ? (
							<MdOutlineCheckCircle className="text-green-500" size={24} />
						) : (
							<MdPlayCircleOutline className="text-yellow-500" size={24} />
						)}
						{isQueryLoading ? (
							<div className="text-gray-400">Executing your query...</div>
						) : error ? (
							<div className="text-red-500">{error}</div>
						) : data ? (
							<>
								<span className="font-medium">{data?.rows.length} Rows</span>
								<span className="text-sm text-gray-400">{data?.meta.duration}ms</span>
								<button
									disabled={isQuerySaving}
									onClick={() => handleSaveQuery(query)}
									className="ml-auto flex h-fit items-center gap-1 rounded-md bg-green-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-600 disabled:pointer-events-none disabled:opacity-60"
								>
									{isQuerySaving ? (
										<CgSpinner size={20} className="animate-spin" />
									) : (
										<MdSave size={20} />
									)}
									Save Query
								</button>
							</>
						) : (
							<div className="text-gray-400">Run a SQL query to see the results</div>
						)}
					</div>

					<div className="-mx-6 h-[2px] bg-gray-200" />

					<div className="-mx-6 h-[calc(54vh-62px)] min-w-full overflow-auto">
						<div className="inline-block min-w-full">
							<div className="overflow-hidden">
								{!data ? (
									<div className="mt-4 text-center text-gray-400">No Results</div>
								) : data.columns.length > 0 ? (
									<table className="min-w-full divide-y-2 divide-gray-200/50 border-b-2 border-gray-200/50">
										<thead className="bg-slate-50">
											<tr className="divide-x-2 divide-gray-200/50">
												{data?.columns.map((column, index) => (
													<th
														key={index}
														scope="col"
														className="w-min px-1.5 py-2 text-left text-sm font-medium uppercase text-gray-500 md:px-2 md:py-2.5 lg:px-2.5 lg:py-3"
													>
														{column}
													</th>
												))}
											</tr>
										</thead>
										<tbody className="divide-y-2 divide-gray-200/50 bg-white">
											{data.rows.map((row, index) => (
												<tr
													key={index}
													className={`${
														index % 2 === 0 ? "" : "bg-slate-50"
													} divide-x-2 divide-gray-200/50`}
												>
													{row.map((data, index) => (
														<td
															key={index}
															className="w-min px-1.5 py-2 text-left text-base text-gray-700 md:px-2 md:py-2.5 lg:px-2.5 lg:py-3"
														>
															{data}
														</td>
													))}
												</tr>
											))}
										</tbody>
									</table>
								) : (
									<>
										{query.toLowerCase().includes("insert") && data.success && (
											<div className="mt-4 text-center text-gray-400">
												Row inserted successfully
											</div>
										)}
										{query.toLowerCase().includes("create") && data.success && (
											<div className="mt-4 text-center text-gray-400">
												Table created successfully
											</div>
										)}
									</>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Homepage;
