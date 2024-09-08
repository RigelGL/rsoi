function _internal(method, path, data, jwt, isMultipart = false) {
    const headers = isMultipart ? {} : (method === 'GET' || method === 'DELETE' ? {} : { 'Content-Type': 'application/json;charset=utf-8' });
    if (jwt)
        headers.Authorization = jwt;

    const body = isMultipart ? data : data ? JSON.stringify(data) : undefined;
    const mode = 'cors';

    return new Promise(resolve => fetch('/api/' + path, { method, mode, headers, body }).then(async e => {
        if (e.status < 500) {
            let json;
            try {
                json = await e.json();
            } catch (e) {
                json = null;
            }

            const headers = { location: e.headers.get('location') };

            resolve({ json, headers, status: Math.floor(e.status / 100) * 100, realStatus: e.status })
        }
        resolve({ json: {}, headers: {}, status: 500, realStatus: e.status })
    }).catch(e => resolve({ json: {}, status: 500 })));
}

const _execArrayQueue = [];
let refreshGetting = false;

function _execAuth(method, url, data, isMultipart = false) {
    return new Promise(resolve => {
        _internal(method, url, data, localStorage.getItem('access'), isMultipart).then(try1 => {
            if (try1.status === 401) {

                if (refreshGetting) {
                    _execArrayQueue.push({ method, url, data, isMultipart, resolve });
                }
                else {
                    refreshGetting = true;
                    _internal('POST', 'user/updateTokens', null, localStorage.getItem('refresh')).then(tokens => {
                        if (tokens.status !== 200) {
                            localStorage.removeItem('access')
                            localStorage.removeItem('refresh')
                            window.location.href = '/login';
                            resolve({ status: 401, json: {} });
                            return;
                        }

                        const access = tokens.json.access;
                        localStorage.setItem('access', access);
                        localStorage.setItem('refresh', tokens.json.refresh);

                        _internal(method, url, data, access, isMultipart).then(e => resolve(e));
                        while (_execArrayQueue.length) {
                            const ask = _execArrayQueue.shift();
                            _internal(ask.method, ask.url, ask.data, access, ask.isMultipart).then(e => ask.resolve(e));
                        }
                        refreshGetting = false;
                    });
                }
            }
            else
                resolve(try1);
        });
    });
}

function addDataToUrl(url, data) {
    if (data) {
        const arr = [];
        for (const [ key, value ] of Object.entries(data)) {
            if (value !== undefined)
                arr.push(`${key}=${typeof value === 'object' ? JSON.stringify(value) : value}`);
        }
        if (arr.length)
            url += (url.indexOf('?') > 0 ? '&' : '?') + arr.join('&');
    }
    return url;
}

export function authGet(url, data) {
    return _execAuth('GET', addDataToUrl(url, data), null);
}

export function authPost(url, data) {
    return _execAuth('POST', url, data);
}

export function authPut(url, data) {
    return _execAuth('PUT', url, data);
}

export function authPatch(url, data) {
    return _execAuth('PATCH', url, data);
}

export function authDelete(url, data) {
    return _execAuth('DELETE', addDataToUrl(url, data), null);
}

export function get(url, data) {
    return _internal('GET', addDataToUrl(url, data), null, null);
}

export function post(url, data) {
    return _internal('POST', url, data, null);
}

export function put(url, data) {
    return _internal('PUT', url, data, null);
}

export function patch(url, data) {
    return _internal('PATCH', url, data, null);
}

export function del(url, data) {
    return _internal('DELETE', addDataToUrl(url, data), data, null);
}

export function authPostFile(url, file, data) {
    let formData = new FormData();
    formData.append('file', file);
    for (const e in data)
        e !== undefined && formData.append(e, data[e]);

    return _execAuth('POST', url, formData, true);
}


export function ezAction(url, call) {
    return async (data) => new Promise(resolve => {
        console.log({data, arguments})
        let target = url;
        if (!target.startsWith('v1/'))
            target = 'v1/' + target;
        (url.match(/\{[a-z]+}/gi) || []).forEach(rawKey => {
            const key = rawKey.substring(1, rawKey.length - 1);
            target = target.replace(rawKey, data[key]);
            data[key] = undefined;
        });

        call(target, data).then(e => {
            if (e.status !== 200)
                return resolve(e);
            resolve(e);
        })
    });
}

export function getCreatedId(url) {
    return +url.substring(url.lastIndexOf('/') + 1);
}

export default {
    authGet,
    authPost,
    authPostFile,
    authPut,
    authPatch,
    authDelete,
    get,
    post,
    put,
    patch,
    del,
    ezAction,
    getCreatedId,
}