/**
 * ACCESS Professional - Frontend Escaping & Core State Utilities
 * HTML Escaping, Global State singletons, Toast notifications, and Tab navigation.
 */

// HTML Escaping Utility to prevent Stored XSS from operator names or external inputs
function esc(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

const DEFAULT_START_DATE = '2026-01-01';
const DEFAULT_END_DATE = '2029-12-31';

// Filter predicate: ensures unscanned / dummy controllers are hidden across the dashboard
function isScannedController(ctrl) {
    if (!ctrl || !ctrl.serialNumber || ctrl.serialNumber === 0) return false;
    if (ctrl.ip === '127.0.0.1' || ctrl.ip === '0.0.0.0') return false;
    if (ctrl.status === 'UNSCANNED' && ctrl.scanned === false) return false;
    return true;
}

// Operator-managed enable flag. Stale controller objects may omit the field:
// undefined is treated as ENABLED (only an explicit false disables a board).
function isControllerEnabled(ctrl) {
    return !!ctrl && ctrl.enabled !== false;
}

// Strict predicate for privilege editors: only boards that are actually reachable
// (ONLINE + scanned + operator-enabled) may receive privilege pushes. OFFLINE /
// unscanned / disabled boards are hidden here but still shown on the Controllers
// tab and monitor via isScannedController so an operator can re-enable them.
function isActiveController(ctrl) {
    if (!isScannedController(ctrl)) return false;
    if (!isControllerEnabled(ctrl)) return false;
    if (ctrl.status !== 'ONLINE') return false;
    if (ctrl.scanned === false) return false;
    return true;
}
var controllers = [];
var users = [];
var auditLogs = [];
var historyLoaded = false;
var activeTab = 'tab-command';
var selectedUserCards = new Set();

// Controllers tab view mode: 'compact' | 'detailed' | 'table'
var controllersViewMode = 'compact';
try {
    const savedCtrlView = localStorage.getItem('access_controllers_view');
    if (savedCtrlView && ['compact', 'detailed', 'table'].includes(savedCtrlView)) {
        controllersViewMode = savedCtrlView;
    }
} catch (e) { /* intentional: localStorage restricted */ }

// Set of controller serials with expanded hardware details drawer
var expandedHardwareSerials = new Set();

// Active inline editing input tracking to prevent re-render interruption
var activeInlineEditElement = null;

function isCurrentlyEditing() {
    return activeInlineEditElement !== null || !!document.querySelector('.inline-input, .inline-editable input, .inline-editable select');
}

// Users tab view mode: 'table' | 'board'
var usersViewMode = 'table';

// Dynamic Monitored Doors State (Set of 'serial_doorId' strings or Set(['ALL']))
var monitoredDoorKeys = new Set(['ALL']);
try {
    const savedDoors = localStorage.getItem('access_monitored_doors');
    if (savedDoors) {
        const parsed = JSON.parse(savedDoors);
        if (Array.isArray(parsed) && parsed.length > 0) {
            monitoredDoorKeys = new Set(parsed);
        }
    }
} catch (e) {
    monitoredDoorKeys = new Set(['ALL']);
}

// Monitor filter state
var monitorFilters = { controllerId: '', door: '', cardNo: '', search: '' };

// Today's monitor stats
var todayStats = { granted: 0, denied: 0, cards: new Set() };
var todayStr = new Date().toDateString();

// Toast Notification Helper
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';

    let icon = 'fa-circle-info';
    let color = 'var(--accent-cyan)';
    if (type === 'success') { icon = 'fa-circle-check'; color = 'var(--accent-primary)'; }
    if (type === 'danger') { icon = 'fa-circle-exclamation'; color = 'var(--accent-danger)'; }
    if (type === 'warning') { icon = 'fa-triangle-exclamation'; color = 'var(--accent-warning)'; }

    toast.innerHTML = `
        <i class="fa-solid ${icon}" style="color: ${color}; font-size: 16px;"></i>
        <span>${esc(message)}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Tab navigation metadata
const tabMeta = {
    'tab-command': {
        title: 'Command Center',
        subtitle: 'Executive access telemetry, flow velocity analytics, threat intelligence, and facility controls'
    },
    'tab-controllers': {
        title: 'Controllers & Doors',
        subtitle: 'Search, discover, and configure B07D575HN8 access controller panels on your LAN'
    },
    'tab-users': {
        title: 'Users & Privileges',
        subtitle: 'Manage cardholders, PIN codes, and multi-board door access authorizations'
    },
    'tab-monitor': {
        title: 'Real-Time Monitor',
        subtitle: 'Live stream of card swipes and access validation decisions'
    },
    'tab-history': {
        title: 'History Records',
        subtitle: 'Review entrance logs stored in controller memory and export audit reports'
    },
    'tab-extended': {
        title: 'Extended Functions',
        subtitle: 'Time profiles, business hours auto-unlock, and keypad reader dual-factor modes'
    }
};

function resolveTabKey(raw) {
    if (!raw) return null;
    let k = String(raw).trim().toLowerCase();
    if (k.startsWith('#')) k = k.slice(1);
    if (!k.startsWith('tab-')) {
        if (k === 'command' || k === 'command-center' || k === 'dashboard') k = 'tab-command';
        else if (k === 'controllers' || k === 'controller' || k === 'doors' || k === 'door') k = 'tab-controllers';
        else if (k === 'users' || k === 'user' || k === 'privileges') k = 'tab-users';
        else if (k === 'monitor' || k === 'real-time' || k === 'monitoring') k = 'tab-monitor';
        else if (k === 'history' || k === 'records' || k === 'logs') k = 'tab-history';
        else if (k === 'extended' || k === 'functions' || k === 'settings') k = 'tab-extended';
        else k = 'tab-' + k;
    }
    return tabMeta[k] ? k : null;
}

function getInitialTab() {
    try {
        const params = new URLSearchParams(window.location.search);
        const queryTab = params.get('tab');
        const resolvedQuery = resolveTabKey(queryTab);
        if (resolvedQuery) return resolvedQuery;

        const hashTab = window.location.hash;
        const resolvedHash = resolveTabKey(hashTab);
        if (resolvedHash) return resolvedHash;
    } catch (e) {}
    return activeTab || 'tab-command';
}

function switchActiveTab(target) {
    if (!target) return;
    target = resolveTabKey(target) || target;

    // Synchronize Desktop / Drawer sidebar items
    document.querySelectorAll('.nav-item').forEach(i => {
        if (i.dataset.tab === target) {
            i.classList.add('active');
        } else {
            i.classList.remove('active');
        }
    });

    // Synchronize Mobile Bottom Navigation bar buttons
    document.querySelectorAll('.bottom-nav-item').forEach(btn => {
        if (btn.dataset.tab === target) {
            btn.classList.add('active');
        } else if (btn.dataset.tab) {
            btn.classList.remove('active');
        }
    });

    // Switch visible tab-content
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    const targetEl = document.getElementById(target);
    if (targetEl) targetEl.classList.add('active');

    activeTab = target;
    const safetyBar = document.getElementById('emergency-safety-bar');
    if (safetyBar) safetyBar.style.display = (target === 'tab-command') ? 'none' : '';
    const meta = tabMeta[target];
    if (meta) {
        const titleEl = document.getElementById('view-title');
        const subEl = document.getElementById('view-subtitle');
        if (titleEl) {
            titleEl.textContent = meta.title;
            titleEl.title = meta.subtitle || '';
        }
        if (subEl) {
            subEl.textContent = '';
            subEl.style.display = 'none';
        }
    }

    if (target === 'tab-command' && typeof renderCommandCenter === 'function') renderCommandCenter();
    if (target === 'tab-history' && typeof loadHistory === 'function') loadHistory();
    if (target === 'tab-monitor') {
        if (typeof updateMonitorStats === 'function') updateMonitorStats();
        if (typeof renderMonitoredDoors === 'function') renderMonitoredDoors();
        if (typeof updateAutoMonitorView === 'function') updateAutoMonitorView(false);
        if (typeof rebuildMonitorTable === 'function') rebuildMonitorTable();
    }
    if (target === 'tab-users' && typeof renderUsers === 'function') renderUsers();
    if (target === 'tab-controllers') {
        if (typeof renderControllers === 'function') renderControllers();
        if (typeof renderStats === 'function') renderStats();
    }

    try {
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({ type: 'ACCESS_TAB_CHANGED', tab: target }, '*');
        }
    } catch (e) {}

    closeMobileDrawer();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleMobileDrawer() {
    if (window.innerWidth > 992) return;
    const aside = document.querySelector('aside');
    const backdrop = document.getElementById('mobile-drawer-backdrop');
    if (!aside) return;

    const isOpen = aside.classList.toggle('mobile-open');
    if (backdrop) {
        if (isOpen) {
            backdrop.classList.add('active');
            backdrop.style.display = 'block';
            backdrop.style.opacity = '1';
            backdrop.style.pointerEvents = 'auto';
            document.body.style.overflow = 'hidden';
        } else {
            closeMobileDrawer();
        }
    }
}

function closeMobileDrawer() {
    const aside = document.querySelector('aside');
    const backdrop = document.getElementById('mobile-drawer-backdrop');
    if (aside && aside.classList.contains('mobile-open')) {
        aside.classList.remove('mobile-open');
    }
    if (backdrop) {
        backdrop.classList.remove('active');
        backdrop.style.display = 'none';
        backdrop.style.pointerEvents = 'none';
        backdrop.style.opacity = '0';
    }
    document.body.style.overflow = '';
}

function syncSidebarCollapseBtn() {
    const header = document.getElementById('brand-header-toggle');
    const collapsed = document.body.classList.contains('sidebar-collapsed');
    if (header) header.title = collapsed ? 'Expand sidebar' : 'Collapse sidebar';
}

function toggleSidebarCollapse() {
    if (window.innerWidth <= 992) return;
    document.body.classList.toggle('sidebar-collapsed');
    try { localStorage.setItem('access_sidebar_collapsed', document.body.classList.contains('sidebar-collapsed') ? 'true' : 'false'); } catch (e) {}
    syncSidebarCollapseBtn();
}

function initSidebarCollapse() {
    document.querySelectorAll('.nav-item').forEach(item => {
        const tabKey = item.dataset.tab;
        if (tabKey && tabMeta[tabKey] && tabMeta[tabKey].subtitle) {
            item.title = tabMeta[tabKey].subtitle;
        } else {
            const label = item.querySelector('span');
            if (label && !item.title) item.title = label.textContent.trim();
        }
    });
    try {
        if (localStorage.getItem('access_sidebar_collapsed') === 'true' && window.innerWidth > 992) {
            document.body.classList.add('sidebar-collapsed');
        }
    } catch (e) {}
    syncSidebarCollapseBtn();
}

function setupTabs() {
    closeMobileDrawer();
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const target = item.dataset.tab;
            if (target) switchActiveTab(target);
        });
    });

    document.querySelectorAll('.bottom-nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const target = item.dataset.tab;
            if (target) switchActiveTab(target);
        });
    });

    const initTab = getInitialTab();
    switchActiveTab(initTab);

    try {
        const params = new URLSearchParams(window.location.search);
        if (params.get('emergency') === '1' || params.get('tab') === 'emergency') {
            setTimeout(() => {
                if (typeof triggerEmergencyOpenConfirm === 'function') {
                    triggerEmergencyOpenConfirm();
                }
            }, 600);
        }
    } catch (e) {}

    window.addEventListener('hashchange', () => {
        const hashTab = getInitialTab();
        if (hashTab) switchActiveTab(hashTab);
    });

    window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SET_ACCESS_TAB') {
            const resolved = resolveTabKey(event.data.tab);
            if (resolved) switchActiveTab(resolved);
        }
    });
}

// Global window bindings for inline HTML attribute calls
// CSP-SAFE DELEGATED UI ACTIONS (replaces every inline onclick=/ondblclick=).
// The gateway serves `Content-Security-Policy: script-src ... 'nonce-<random>'`
// (lib/http-helpers.js). When a nonce source is present, browsers ignore
// 'unsafe-inline' for event-handler attributes, so inline onclick= never
// compiles (el.onclick === null) and every inline-wired control is dead.
// ALL UI actions therefore route through data-* attributes + this dispatcher:
//   data-fn="globalFn"   click handler (resolved lazily via window[])
//   data-dbl="globalFn"  dblclick handler
//   data-a1..data-a4     args (pure-integer strings coerce to Number, 'true'/'false' to Boolean)
//   data-ev              pass the DOM event as FIRST arg
//   data-el=self|parent  append the clicked element (or its parent) as LAST arg
function uiCoerceArg(v) {
    if (v === undefined || v === null) return undefined;
    const s = String(v);
    if (/^-?\d+$/.test(s)) {
        const n = Number(s);
        if (Number.isSafeInteger(n)) return n;
    }
    if (s === 'true') return true;
    if (s === 'false') return false;
    return s;
}

function uiDispatchAction(el, ev, isDbl) {
    const key = isDbl ? 'data-dbl' : 'data-fn';
    const fnName = el.getAttribute(key);
    if (!fnName) return;
    if (fnName === '__stop') { ev.stopPropagation(); return; }
    if (fnName === '__alert') { window.alert(el.getAttribute('data-a1') || ''); return; }
    const fn = window[fnName];
    if (typeof fn !== 'function') return;
    const args = [];
    if (el.hasAttribute('data-ev')) args.push(ev);
    for (let i = 1; i <= 4; i++) {
        if (!el.hasAttribute('data-a' + i)) break;
        args.push(uiCoerceArg(el.getAttribute('data-a' + i)));
    }
    const elMode = el.getAttribute('data-el');
    if (elMode === 'parent' && el.parentElement) args.push(el.parentElement);
    else if (elMode === 'self') args.push(el);
    fn.apply(null, args);
}

document.addEventListener('click', (e) => {
    const t = e.target && e.target.closest ? e.target.closest('[data-fn]') : null;
    if (t && document.contains(t)) uiDispatchAction(t, e, false);
});
document.addEventListener('dblclick', (e) => {
    const t = e.target && e.target.closest ? e.target.closest('[data-dbl]') : null;
    if (t && document.contains(t)) uiDispatchAction(t, e, true);
});

window.esc = esc;
window.isScannedController = isScannedController;
window.isControllerEnabled = isControllerEnabled;
window.isActiveController = isActiveController;
window.showToast = showToast;
window.switchActiveTab = switchActiveTab;
window.toggleMobileDrawer = toggleMobileDrawer;
window.closeMobileDrawer = closeMobileDrawer;
window.toggleSidebarCollapse = toggleSidebarCollapse;
window.initSidebarCollapse = initSidebarCollapse;
window.uiDispatchAction = uiDispatchAction;
window.uiCoerceArg = uiCoerceArg;
window.setupTabs = setupTabs;
window.resolveTabKey = resolveTabKey;
window.isCurrentlyEditing = isCurrentlyEditing;
