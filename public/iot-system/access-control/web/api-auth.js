/**
 * ACCESS Professional - Admin Authentication & Fetch Interceptor
 * Manages the in-memory auth role, token/cookie sync, and global fetch
 * interception. Roles: viewer (read-only, default), admin, superadmin.
 */

const AUTH_ADMIN_KEY = 'access_admin_token';
const AUTH_SUPER_KEY = 'access_superadmin_token';
const AUTH_COOKIE_MAX_AGE = 43200; // 12 hours

// In-memory role state. Never inferred from localStorage.
let _authRole = 'viewer';
let _isPrompting = false;
let _handling401 = false;

// The default role is read-only viewer, even before the status request lands.
if (typeof document !== 'undefined' && document.body) {
    document.body.dataset.authRole = _authRole;
}

function getAuthRole() {
    return _authRole;
}

function canWrite() {
    return _authRole === 'admin' || _authRole === 'superadmin';
}

function canAdminister() {
    return _authRole === 'superadmin';
}

/* --------------------------------------------------------------------------
 * Local auth state helpers (localStorage + non-HttpOnly mirror cookies)
 * ------------------------------------------------------------------------ */

function _readToken(key) {
    try {
        return localStorage.getItem(key);
    } catch (e) {
        return null;
    }
}

function _writeToken(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (e) {
        // localStorage may be unavailable (private mode); cookie mirror still applies.
    }
    try {
        document.cookie = key + '=' + encodeURIComponent(value) +
            '; Path=/; Max-Age=' + AUTH_COOKIE_MAX_AGE + '; SameSite=Strict';
    } catch (e) {
        // best-effort cookie mirror
    }
}

function _removeToken(key) {
    try {
        localStorage.removeItem(key);
    } catch (e) {
        // best-effort
    }
    try {
        document.cookie = key + '=; Path=/; Max-Age=0; SameSite=Strict';
    } catch (e) {
        // best-effort
    }
}

function clearLocalAuthState() {
    _removeToken(AUTH_ADMIN_KEY);
    _removeToken(AUTH_SUPER_KEY);
    applyAuthRole('viewer');
}

function setLocalTokens(tokens, roleOverride) {
    const opts = tokens || {};
    const adminToken = typeof opts.adminToken === 'string' ? opts.adminToken : '';
    const superToken = typeof opts.superToken === 'string' ? opts.superToken : '';

    if (adminToken) {
        _writeToken(AUTH_ADMIN_KEY, adminToken);
    } else {
        _removeToken(AUTH_ADMIN_KEY);
    }

    if (superToken) {
        _writeToken(AUTH_SUPER_KEY, superToken);
    } else {
        _removeToken(AUTH_SUPER_KEY);
    }

    const derived = superToken ? 'superadmin' : (adminToken ? 'admin' : 'viewer');
    applyAuthRole(roleOverride || derived);
}

/* --------------------------------------------------------------------------
 * Role application + pill
 * ------------------------------------------------------------------------ */

function applyAuthRole(role) {
    _authRole = (role === 'admin' || role === 'superadmin') ? role : 'viewer';

    if (typeof document !== 'undefined' && document.body) {
        document.body.dataset.authRole = _authRole;
    }

    updateAdminTokenDisplay();

    if (typeof window !== 'undefined' && typeof window.CustomEvent === 'function') {
        try {
            window.dispatchEvent(new window.CustomEvent('auth-role-changed', {
                detail: {
                    role: _authRole,
                    canWrite: canWrite(),
                    canAdminister: canAdminister()
                }
            }));
        } catch (e) {
            // CustomEvent construction/dispatch is best-effort.
        }
    }
}

function _setModalDefaults(role) {
    const title = document.getElementById('admin-token-modal-title');
    const msg = document.getElementById('admin-token-modal-msg');

    if (title) {
        title.textContent = role === 'superadmin'
            ? 'Superadmin Session'
            : role === 'admin'
                ? 'Admin Session'
                : 'Access Authentication';
    }

    if (msg) {
        if (role === 'superadmin') {
            msg.innerHTML = 'Current session: <strong style="color: #f59e0b;">Superadmin</strong>. Enter a token to rotate credentials or switch accounts:';
        } else if (role === 'admin') {
            msg.innerHTML = 'Current session: <strong style="color: var(--accent-primary);">Admin</strong>. Enter a token to re-authenticate or rotate credentials:';
        } else {
            msg.innerHTML = 'Read-only <strong>viewer</strong> mode. Enter an ADMIN_TOKEN for standard access or a SUPERADMIN_TOKEN for full control:';
        }
    }
}

function updateAdminTokenDisplay() {
    const role = getAuthRole();
    const textEl = document.getElementById('admin-token-text');
    const iconEl = document.getElementById('admin-token-icon');

    if (textEl) {
        if (role === 'superadmin') {
            textEl.innerHTML = '<span style="color: #f59e0b; font-weight: 700;">Superadmin</span>';
        } else if (role === 'admin') {
            textEl.innerHTML = '<span style="color: var(--accent-primary); font-weight: 600;">Admin</span>';
        } else {
            textEl.innerHTML = '<span style="color: var(--text-dim); font-weight: 500;">Viewer</span>';
        }
    }

    if (iconEl) {
        if (role === 'superadmin') {
            iconEl.className = 'fa-solid fa-user-shield';
            iconEl.style.color = '#f59e0b';
        } else if (role === 'admin') {
            iconEl.className = 'fa-solid fa-key';
            iconEl.style.color = 'var(--accent-primary)';
        } else {
            iconEl.className = 'fa-solid fa-eye';
            iconEl.style.color = 'var(--text-dim)';
        }
    }

    const removeBtn = document.getElementById('btn-admin-token-remove');
    if (removeBtn) {
        removeBtn.style.display = role === 'viewer' ? 'none' : '';
    }

    _setModalDefaults(role);
}

/* --------------------------------------------------------------------------
 * Global fetch interceptor
 * ------------------------------------------------------------------------ */

const _nativeFetch = (typeof window !== 'undefined' && typeof window.fetch === 'function')
    ? window.fetch.bind(window)
    : null;

function _headersToObject(headers) {
    if (!headers) return {};
    if (typeof Headers === 'function' && headers instanceof Headers) {
        const obj = {};
        headers.forEach(function (value, key) { obj[key] = value; });
        return obj;
    }
    if (Array.isArray(headers)) {
        const obj = {};
        for (let i = 0; i < headers.length; i++) {
            const pair = headers[i];
            if (pair && pair.length >= 2) obj[String(pair[0])] = String(pair[1]);
        }
        return obj;
    }
    return Object.assign({}, headers);
}

function _hasHeader(headers, name) {
    const lower = String(name).toLowerCase();
    const keys = Object.keys(headers);
    for (let i = 0; i < keys.length; i++) {
        if (keys[i].toLowerCase() === lower) return true;
    }
    return false;
}

function _setHeaderIfAbsent(headers, name, value) {
    if (!_hasHeader(headers, name)) headers[name] = value;
}

function _pathnameOf(url) {
    const raw = (typeof url === 'string') ? url : (url && url.url ? url.url : String(url));
    try {
        if (typeof URL === 'function' && typeof window !== 'undefined' && window.location) {
            return new URL(raw, window.location.href).pathname;
        }
    } catch (e) {
        // fall through to manual parsing
    }
    const q = raw.indexOf('?');
    return q === -1 ? raw : raw.slice(0, q);
}

function _forbiddenResponse() {
    const payload = { success: false, error: 'Forbidden: read-only viewer mode.' };
    if (typeof Response === 'function') {
        try {
            return new Response(JSON.stringify(payload), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (e) {
            // fall through to the minimal Response-shaped object
        }
    }
    return {
        ok: false,
        status: 403,
        json: async function () { return payload; }
    };
}

if (typeof window !== 'undefined' && _nativeFetch) {
    window.fetch = async function (url, options) {
        const opts = Object.assign({}, options || {});
        const headers = _headersToObject(opts.headers);

        const adminToken = _readToken(AUTH_ADMIN_KEY);
        const superToken = _readToken(AUTH_SUPER_KEY);
        const activeToken = superToken || adminToken;

        if (activeToken) {
            _setHeaderIfAbsent(headers, 'Authorization', 'Bearer ' + activeToken);
            _setHeaderIfAbsent(headers, 'X-Admin-Token', activeToken);
            _setHeaderIfAbsent(headers, 'X-Requested-With', 'XMLHttpRequest');
        }
        if (superToken) {
            _setHeaderIfAbsent(headers, 'X-Superadmin-Token', superToken);
        }
        opts.headers = headers;

        const method = String(
            opts.method || (url && typeof url === 'object' && url.method) || 'GET'
        ).toUpperCase();
        const pathname = _pathnameOf(url);
        const isMutation = method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS';
        const isAuthEndpoint = pathname === '/api/auth/login' || pathname === '/api/auth/logout';

        // Read-only viewer: block mutations before they reach the network.
        if (isMutation && !canWrite() && !isAuthEndpoint) {
            if (typeof showToast === 'function') {
                showToast('Read-only viewer mode — sign in to make changes.', 'warning');
            }
            promptForAdminToken(true);
            return _forbiddenResponse();
        }

        const response = await _nativeFetch(url, opts);

        if (response && response.status === 401) {
            console.warn('[Security] 401 Unauthorized for endpoint:', pathname);
            if (!_handling401) {
                _handling401 = true;
                clearLocalAuthState();
                promptForAdminToken(true);
                setTimeout(function () { _handling401 = false; }, 1000);
            }
        }

        return response;
    };
}

/* --------------------------------------------------------------------------
 * Auth status
 * ------------------------------------------------------------------------ */

async function refreshAuthStatus() {
    try {
        if (typeof window === 'undefined' || typeof window.fetch !== 'function') return;

        const res = await window.fetch('/api/auth/status', { cache: 'no-store' });
        let data = null;
        try {
            data = await res.json();
        } catch (e) {
            data = null;
        }

        if (!data || !data.success || !data.role) return;

        if (data.role === 'viewer' || data.role === 'none') {
            // Also clears a stale/invalid local token.
            clearLocalAuthState();
        } else if (data.role === 'admin') {
            // Admin must not retain superadmin rights.
            _removeToken(AUTH_SUPER_KEY);
            applyAuthRole('admin');
        } else if (data.role === 'superadmin') {
            // Never fabricate/copy a superadmin token; the server may accept the
            // admin token for super checks when ADMIN_TOKEN === SUPERADMIN_TOKEN.
            applyAuthRole('superadmin');
        } else {
            applyAuthRole('viewer');
        }
    } catch (e) {
        // Gateway offline/booting: keep the viewer default.
    }
}

/* --------------------------------------------------------------------------
 * Auth modal
 * ------------------------------------------------------------------------ */

function openAdminTokenModal(isRetry) {
    const overlay = document.getElementById('modal-admin-token');
    const input = document.getElementById('admin-token-input');
    if (!overlay || !input) {
        fallbackAdminTokenPrompt(isRetry);
        return;
    }

    const role = getAuthRole();
    const title = document.getElementById('admin-token-modal-title');
    const msg = document.getElementById('admin-token-modal-msg');

    _setModalDefaults(role);
    if (isRetry) {
        if (title) title.textContent = 'Authentication Required';
        if (msg) msg.textContent = 'Authentication required (401/403). Enter ADMIN_TOKEN or SUPERADMIN_TOKEN:';
    }

    input.value = '';
    input.type = 'password';
    const toggle = document.getElementById('admin-token-toggle');
    if (toggle) toggle.innerHTML = '<i class="fa-solid fa-eye"></i>';
    overlay.classList.add('active');
    setTimeout(function () {
        try { input.focus(); } catch (e) { /* best-effort */ }
    }, 50);
}

function closeAdminTokenModal() {
    const overlay = document.getElementById('modal-admin-token');
    if (overlay) overlay.classList.remove('active');
    _isPrompting = false;
}

function fallbackAdminTokenPrompt(isRetry) {
    // The dialog markup ships with index.html. If it is missing, delegate to the
    // modal when possible; never save an unverified token from a native prompt.
    const overlay = document.getElementById('modal-admin-token');
    const input = document.getElementById('admin-token-input');
    if (overlay && input) {
        openAdminTokenModal(isRetry);
        return;
    }
    if (typeof showToast === 'function') {
        showToast('Authentication dialog unavailable. Reload the page to sign in.', 'danger');
    }
    _isPrompting = false;
}

function promptForAdminToken(isRetry) {
    if (_isPrompting) return;
    _isPrompting = true;
    try {
        openAdminTokenModal(isRetry === true);
    } catch (e) {
        _isPrompting = false;
    }
}

async function saveAdminTokenFromModal() {
    const input = document.getElementById('admin-token-input');
    const entered = input ? input.value.trim() : '';
    if (!entered) {
        if (typeof showToast === 'function') {
            showToast('Enter a token, or use Remove to clear it.', 'warning');
        }
        return;
    }

    let resp = null;
    let data = null;
    let networkError = null;

    try {
        resp = await _nativeFetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: entered })
        });
        try {
            data = await resp.json();
        } catch (e) {
            data = null;
        }
    } catch (e) {
        networkError = e;
    }

    const role = data && data.role;
    const verified = !!resp && resp.ok && !!(data && data.success) &&
        (role === 'admin' || role === 'superadmin');

    if (!verified) {
        const status = resp ? resp.status : 0;
        const serverError = (data && data.error)
            ? data.error
            : (networkError ? 'gateway unreachable' : ('HTTP ' + status));

        if (status === 429) {
            // Throttling is not proof the token is wrong: keep existing rights.
            if (typeof showToast === 'function') {
                showToast('Login throttled — ' + serverError, 'warning');
            }
        } else if (status >= 400 && status < 500) {
            // Invalid token: remove both rights before reporting.
            clearLocalAuthState();
            if (typeof showToast === 'function') {
                showToast('Invalid token — ' + serverError, 'danger');
            }
        } else {
            // Network/5xx fault: cannot conclude the token is invalid.
            if (typeof showToast === 'function') {
                showToast('Sign-in failed — ' + serverError, 'danger');
            }
        }

        try {
            if (input) {
                input.select();
                input.focus();
            }
        } catch (e) {
            // best-effort
        }
        return;
    }

    if (role === 'superadmin') {
        // Prefer writing only the super token; keep an existing admin key so a
        // separate admin credential is not silently discarded.
        const existingAdmin = _readToken(AUTH_ADMIN_KEY);
        setLocalTokens({
            adminToken: existingAdmin || undefined,
            superToken: entered
        }, 'superadmin');
        if (typeof showToast === 'function') {
            showToast('Signed in as Superadmin. Session valid for 12 hours.', 'success');
        }
    } else {
        setLocalTokens({ adminToken: entered, superToken: undefined }, 'admin');
        if (typeof showToast === 'function') {
            showToast('Signed in as Admin. Session valid for 12 hours.', 'success');
        }
    }

    closeAdminTokenModal();
    if (input) input.value = '';
    if (typeof initEventStream === 'function') initEventStream();
}

async function removeAdminTokenFromModal() {
    try {
        if (_nativeFetch) {
            await _nativeFetch('/api/auth/logout', { method: 'POST' });
        }
    } catch (e) {
        // Best-effort logout: local state is cleared regardless.
    }

    clearLocalAuthState();
    closeAdminTokenModal();
    if (typeof showToast === 'function') {
        showToast('Signed out. Read-only viewer mode.', 'info');
    }
    if (typeof initEventStream === 'function') initEventStream();
}

/* --------------------------------------------------------------------------
 * Bindings
 * ------------------------------------------------------------------------ */

let _authBindingsReady = false;

function initAuthBindings() {
    if (_authBindingsReady) return;
    _authBindingsReady = true;

    const overlay = document.getElementById('modal-admin-token');
    const input = document.getElementById('admin-token-input');
    const saveBtn = document.getElementById('btn-admin-token-save');
    const cancelBtn = document.getElementById('btn-admin-token-cancel');
    const closeBtn = document.getElementById('modal-admin-token-close');
    const removeBtn = document.getElementById('btn-admin-token-remove');
    const toggle = document.getElementById('admin-token-toggle');

    if (saveBtn) saveBtn.addEventListener('click', saveAdminTokenFromModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeAdminTokenModal);
    if (closeBtn) closeBtn.addEventListener('click', closeAdminTokenModal);
    if (removeBtn) removeBtn.addEventListener('click', removeAdminTokenFromModal);

    if (toggle && input) {
        toggle.addEventListener('click', function () {
            const show = input.type === 'password';
            input.type = show ? 'text' : 'password';
            toggle.innerHTML = show
                ? '<i class="fa-solid fa-eye-slash"></i>'
                : '<i class="fa-solid fa-eye"></i>';
            try { input.focus(); } catch (e) { /* best-effort */ }
        });
    }

    if (input) {
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveAdminTokenFromModal();
            } else if (e.key === 'Escape') {
                closeAdminTokenModal();
            }
        });
    }

    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        const ov = document.getElementById('modal-admin-token');
        if (ov && ov.classList.contains('active')) closeAdminTokenModal();
    });

    if (overlay) {
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) closeAdminTokenModal();
        });
    }

    updateAdminTokenDisplay();
    refreshAuthStatus();
}

if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAuthBindings);
    } else {
        initAuthBindings();
    }
}

/* --------------------------------------------------------------------------
 * Global exports
 * ------------------------------------------------------------------------ */

window.getAuthRole = getAuthRole;
window.canWrite = canWrite;
window.canAdminister = canAdminister;
window.refreshAuthStatus = refreshAuthStatus;
window.updateAdminTokenDisplay = updateAdminTokenDisplay;
window.promptForAdminToken = promptForAdminToken;
window.clearAuthState = clearLocalAuthState;
window.logout = removeAdminTokenFromModal;
window.openAdminTokenModal = openAdminTokenModal;
window.closeAdminTokenModal = closeAdminTokenModal;
