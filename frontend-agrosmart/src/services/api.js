const conToken = (claveToken) => (url, options = {}) => {
    const token = localStorage.getItem(claveToken);
    const headers = { ...(options.headers || {}) };
    if (token) headers.Authorization = `Bearer ${token}`;
    return fetch(url, { ...options, headers });
};

export const adminFetch = conToken('adminTokenAgrosmart');
export const clienteFetch = conToken('tokenAgrosmart');
