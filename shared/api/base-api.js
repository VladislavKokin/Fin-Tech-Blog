export async function request(path, { method = 'GET', body } = {}) {
    try {
        const response = await fetch(`/api${path}`, {
            method,
            credentials: 'same-origin',
            headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
            body: body === undefined ? undefined : JSON.stringify(body),
        });
        const result = await response.json().catch(() => null);
        if (!response.ok || result?.error || !result) {
            return { error: result?.error || 'Ошибка сервера. Попробуйте ещё раз.', res: null, status: response.status };
        }
        return { error: null, res: result.data, status: response.status };
    } catch {
        return { error: 'Не удалось связаться с сервером. Попробуйте ещё раз.', res: null, status: 0 };
    }
}
