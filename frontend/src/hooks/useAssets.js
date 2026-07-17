import { useState, useEffect, useCallback } from "react";
import { getAssets } from "../api/asset";

export function useAssets() {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getAssets();
            setAssets(res.data);
        } catch (e) {
            setError(e.message);
        }finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {fetch();}, [fetch]);

    return {assets, loading, error, refresh: fetch};
}