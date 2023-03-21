import { useEffect, useState } from "react";

const useLocalStorageState = <T>(key: string, state: T) => {
	const [localState, setLocalState] = useState(() => {
		if (typeof window !== "undefined")
			if (localStorage.getItem(key)) return JSON.parse(localStorage.getItem(key) ?? "") as T;
		return state;
	});

	useEffect(() => {
		if (localState) {
			localStorage.setItem(key, JSON.stringify(localState));
		}
	}, [localState, key]);

	return [localState, setLocalState] as const;
};

export default useLocalStorageState;
