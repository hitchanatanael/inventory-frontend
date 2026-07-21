const DEFAULT_API_BASE_URL = "http://localhost:5000/api";

const getApiBaseUrl = () => {
    const envBaseUrl = import.meta.env?.VITE_API_BASE_URL;
    return (envBaseUrl || DEFAULT_API_BASE_URL).replace(/\/$/, "");
};

const parseJsonResponse = async (response) => {
    const text = await response.text();

    if (!text) {
        return null;
    }

    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
};

const getErrorMessage = (payload, fallback) => {
    if (
        payload &&
        typeof payload.message === "string" &&
        payload.message.trim()
    ) {
        return payload.message;
    }

    return fallback;
};

export const apiRequest = async (path, options = {}) => {
    const { body, headers, ...requestOptions } = options;
    const hasBody = body !== undefined && body !== null;

    const response = await fetch(`${getApiBaseUrl()}${path}`, {
        ...requestOptions,
        headers: {
            ...(hasBody ? { "Content-Type": "application/json" } : {}),
            ...headers,
        },
        body: hasBody ? JSON.stringify(body) : undefined,
    });

    const payload = await parseJsonResponse(response);

    if (!response.ok) {
        throw new Error(
            getErrorMessage(
                payload,
                `Request failed with status ${response.status}`,
            ),
        );
    }

    if (!payload) {
        return {
            success: response.ok,
            message: response.ok ? "Request berhasil." : "Request gagal.",
            data: null,
        };
    }

    if (payload.success === false) {
        throw new Error(getErrorMessage(payload, "Request gagal."));
    }

    return payload;
};
