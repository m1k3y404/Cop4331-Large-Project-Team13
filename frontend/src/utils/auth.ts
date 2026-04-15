// handles both old {username,email} and linguine's jwt {token} response shapes -dechante
export function saveAuth(data: { token?: string; username?: string; email?: string }) {
    const token = data.token || "session";
    let username = data.username;

    if (!username && data.token) {
        try {
            const payload = JSON.parse(atob(data.token.split(".")[1] || ""));
            username = payload.username || payload.sub;
        } catch {
            // malformed token, skip
        }
    }

    localStorage.setItem("token", token);
    if (username) localStorage.setItem("username", username);
}
