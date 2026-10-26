/**
 * ACCESS Professional - SSE Real-Time EventStream Client
 * Establishes persistent EventSource connection to /api/stream and updates UI state reactively.
 */

let currentEventSource = null;

function initEventStream() {
    if (currentEventSource) {
        try { currentEventSource.close(); } catch (e) { /* intentional: best-effort SSE cleanup */ }
    }
    const token = localStorage.getItem('access_admin_token');
    if (token) {
        const secureFlag = window.location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = `access_admin_token=${encodeURIComponent(token)}; path=/; SameSite=Strict; max-age=43200${secureFlag}`;
    }
    const eventSource = new EventSource('/api/stream');
    currentEventSource = eventSource;

    eventSource.onopen = () => {
        const el = document.getElementById('gateway-status');
        if (el) el.textContent = 'Gateway: Connected (60000)';
        const mobEl = document.getElementById('mobile-gateway-indicator');
        if (mobEl) mobEl.textContent = 'Live: 60000';
    };

    function mergeControllerWithExisting(incoming, existing) {
        if (!existing) return incoming;
        const merged = { ...existing, ...incoming };
        if (incoming.pin === undefined && existing.pin !== undefined) merged.pin = existing.pin;
        if (incoming.supervisorPin === undefined && existing.supervisorPin !== undefined) merged.supervisorPin = existing.supervisorPin;
        if (incoming.keypads === undefined && existing.keypads !== undefined) merged.keypads = existing.keypads;

        if (Array.isArray(incoming.doors)) {
            merged.doors = incoming.doors.map(inDoor => {
                if (!inDoor || typeof inDoor !== 'object') return inDoor;
                const exDoor = Array.isArray(existing.doors) ? existing.doors.find(d => d.id === inDoor.id) : null;
                if (!exDoor) return inDoor;
                const doorMerged = { ...exDoor, ...inDoor };
                if ((!inDoor.passcodes || (Array.isArray(inDoor.passcodes) && inDoor.passcodes.length === 0)) && exDoor.passcodes) {
                    doorMerged.passcodes = exDoor.passcodes;
                }
                if (inDoor.pin === undefined && exDoor.pin !== undefined) doorMerged.pin = exDoor.pin;
                if (inDoor.supervisorPin === undefined && exDoor.supervisorPin !== undefined) doorMerged.supervisorPin = exDoor.supervisorPin;
                return doorMerged;
            });
        } else if (existing.doors) {
            merged.doors = existing.doors;
        }
        return merged;
    }

    eventSource.addEventListener('controller_discovered', (e) => {
        const ctrl = JSON.parse(e.data);
        if (!isScannedController(ctrl)) return;
        const idx = controllers.findIndex(c => c.serialNumber === ctrl.serialNumber);
        if (idx >= 0) controllers[idx] = mergeControllerWithExisting(ctrl, controllers[idx]);
        else controllers.push(ctrl);

        if (typeof renderControllers === 'function') renderControllers();
        if (typeof renderStats === 'function') renderStats();
        if (typeof renderUsers === 'function') renderUsers();
        if (activeTab === 'tab-monitor' && typeof renderMonitoredDoors === 'function') renderMonitoredDoors();
        showToast(`Discovered B07D575HN8 Controller SN:${ctrl.serialNumber} (${ctrl.ip})`, 'success');
    });

    eventSource.addEventListener('controller_update', (e) => {
        const data = JSON.parse(e.data);
        if (Array.isArray(data)) {
            const filtered = data.filter(c => !(c.ip === '127.0.0.1' && c.mac === 'N/A'));
            controllers = filtered.map(incoming => {
                const existing = controllers.find(c => c.serialNumber === incoming.serialNumber);
                return mergeControllerWithExisting(incoming, existing);
            });
            if (typeof updateControllerDomInPlace === 'function') {
                controllers.forEach(c => updateControllerDomInPlace(c));
            }
        } else {
            const ctrl = data;
            if (ctrl.ip === '127.0.0.1' && ctrl.mac === 'N/A') {
                controllers = controllers.filter(c => c.serialNumber !== ctrl.serialNumber);
                if (typeof renderControllers === 'function') renderControllers();
                if (typeof renderStats === 'function') renderStats();
                return;
            }
            const idx = controllers.findIndex(c => c.serialNumber === ctrl.serialNumber);
            if (idx >= 0) {
                controllers[idx] = mergeControllerWithExisting(ctrl, controllers[idx]);
                if (typeof updateControllerDomInPlace === 'function') updateControllerDomInPlace(controllers[idx]);
            } else {
                controllers.push(ctrl);
                if (typeof isCurrentlyEditing === 'function' && !isCurrentlyEditing() && typeof renderControllers === 'function') {
                    renderControllers();
                }
            }
        }

        if (typeof renderStats === 'function') renderStats();
        if (activeTab === 'tab-monitor' && typeof renderMonitoredDoors === 'function') renderMonitoredDoors();
    });

    eventSource.addEventListener('controller_status', (e) => {
        try {
            const { serialNumber, status } = JSON.parse(e.data);
            const ctrl = controllers.find(c => c.serialNumber === serialNumber);
            if (ctrl) {
                ctrl.status = status;
                if (typeof updateControllerDomInPlace === 'function') updateControllerDomInPlace(ctrl);
                if (typeof renderStats === 'function') renderStats();
                if (activeTab === 'tab-monitor' && typeof renderMonitoredDoors === 'function') renderMonitoredDoors();
            }
        } catch (err) {
            console.warn('[sse-controller-status]', err.message);
        }
    });

    eventSource.addEventListener('emergency_status', (e) => {
        try {
            const status = JSON.parse(e.data);
            if (typeof updateEmergencyBanner === 'function') updateEmergencyBanner(status);
        } catch (err) { console.warn('[sse-emergency-status]', err.message); }
    });

    eventSource.addEventListener('controller_deleted', (e) => {
        const data = JSON.parse(e.data);
        controllers = controllers.filter(c => c.serialNumber !== data.serialNumber);
        if (typeof renderControllers === 'function') renderControllers();
        if (typeof renderStats === 'function') renderStats();
        if (typeof renderUsers === 'function') renderUsers();
        if (activeTab === 'tab-monitor' && typeof renderMonitoredDoors === 'function') renderMonitoredDoors();
        showToast(`Controller SN:${data.serialNumber} removed.`, 'info');
    });

    eventSource.addEventListener('user_update', (e) => {
        const user = JSON.parse(e.data);
        const idx = users.findIndex(u => u.cardNumber === user.cardNumber);
        if (idx >= 0) {
            const prev = users[idx] || {};
            const merged = Object.assign({}, prev, user);
            if (user.permissions === undefined) merged.permissions = prev.permissions;
            if (user.pin === undefined) merged.pin = prev.pin;
            if (user.permissionMatrix === undefined && prev.permissionMatrix !== undefined) merged.permissionMatrix = prev.permissionMatrix;
            if (user.pinCode === undefined && prev.pinCode !== undefined) merged.pinCode = prev.pinCode;
            users[idx] = merged;
        }
        else users.push(user);

        if (typeof renderUsers === 'function') renderUsers();
        if (typeof renderStats === 'function') renderStats();
    });

    eventSource.addEventListener('user_deleted', (e) => {
        const data = JSON.parse(e.data);
        users = users.filter(u => u.cardNumber !== data.cardNumber);
        if (typeof renderUsers === 'function') renderUsers();
        if (typeof renderStats === 'function') renderStats();
    });

    eventSource.addEventListener('audit_log', (e) => {
        const log = JSON.parse(e.data);
        auditLogs.unshift(log);
        if (new Date(log.timestamp).toDateString() === todayStr) {
            if (log.type === 'SWIPE_EVENT' || log.type === 'SWIPE_GRANTED' || log.type === 'SWIPE_DENIED') {
                if (log.granted !== false) todayStats.granted++;
                else todayStats.denied++;
                if (log.cardNumber) todayStats.cards.add(log.cardNumber);
            }
        }
        if (typeof updateMonitorStats === 'function') updateMonitorStats();
        if (typeof appendMonitorRow === 'function') appendMonitorRow(log);

        if (log.serialNumber && log.doorNumber) {
            const cardEl = document.getElementById(`monitored-card-${log.serialNumber}-${log.doorNumber}`);
            if (cardEl) {
                cardEl.classList.remove('pulse-flash');
                void cardEl.offsetWidth; // trigger reflow
                cardEl.classList.add('pulse-flash');
            }
        }

        if (log.unknownCard) {
            const statusText = log.granted !== false ? 'GRANTED' : 'DENIED';
            const doorName = log.doorName || (log.doorNumber ? `Door ${log.doorNumber}` : 'Door');
            if (typeof showToast === 'function') {
                const toastType = log.granted !== false ? 'danger' : 'warning';
                showToast(`WARNING: Unknown Card #${log.cardNumber} (${statusText}) at ${doorName}`, toastType);
            }
        }

        if (activeTab === 'tab-monitor' && typeof renderMonitoredDoors === 'function') renderMonitoredDoors();
        if (activeTab === 'tab-history' && typeof renderHistory === 'function') renderHistory();
        if (activeTab === 'tab-command' && typeof renderCommandCenter === 'function') renderCommandCenter();
    });

    eventSource.addEventListener('events_cleared', () => {
        auditLogs = [];
        todayStats.granted = 0;
        todayStats.denied = 0;
        todayStats.cards.clear();
        if (typeof updateMonitorStats === 'function') updateMonitorStats();
        if (activeTab === 'tab-history' && typeof renderHistory === 'function') renderHistory();
        if (activeTab === 'tab-monitor' && typeof rebuildMonitorTable === 'function') rebuildMonitorTable();
        showToast('iot_access_events table was cleared.', 'info');
    });

    eventSource.addEventListener('pending_pairing', (e) => {
        try {
            const data = JSON.parse(e.data);
            if (typeof showToast === 'function') showToast(`Unpaired controller SN:${data.serialNumber} at ${data.ip}:${data.port} — run Network Scan to pair it.`, 'warning');
        } catch (err) { console.warn('[sse-pending-pairing]', err.message); }
    });

    eventSource.addEventListener('security_alert', (e) => {
        try {
            const data = JSON.parse(e.data);
            const detail = data.detail || 'spoofed packet rejected';
            if (typeof showToast === 'function') showToast(`Security alert SN:${data.serialNumber}: ${detail}`, 'danger');
            const log = { timestamp: new Date().toISOString(), type: 'SECURITY', serialNumber: data.serialNumber, message: `Security alert from ${data.sourceIp}:${data.sourcePort} — ${detail}`, sourceIp: data.sourceIp, sourcePort: data.sourcePort, detail: data.detail };
            auditLogs.unshift(log);
            if (typeof updateMonitorStats === 'function') updateMonitorStats();
            if (typeof appendMonitorRow === 'function') appendMonitorRow(log);
            if (activeTab === 'tab-monitor' && typeof renderMonitoredDoors === 'function') renderMonitoredDoors();
            if (activeTab === 'tab-history' && typeof renderHistory === 'function') renderHistory();
            if (activeTab === 'tab-command' && typeof renderCommandCenter === 'function') renderCommandCenter();
        } catch (err) { console.warn('[sse-security-alert]', err.message); }
    });

    eventSource.addEventListener('door_open_alert', (e) => {
        try {
            const data = JSON.parse(e.data);
            const where = data.doorName || `Door ${data.doorNumber || ''}`.trim();
            if (typeof showToast === 'function') showToast(`${where} opened with NO credential — possible Super Password or forced entry (SN:${data.serialNumber})`, 'warning');
        } catch (err) { console.warn('[sse-door-open-alert]', err.message); }
    });

    eventSource.addEventListener('auth_expired', () => {
        try { eventSource.close(); } catch (e) { /* intentional: best-effort SSE cleanup */ }
        currentEventSource = null;
        const el = document.getElementById('gateway-status');
        if (el) el.textContent = 'Gateway: Session expired — please log in again';
        if (typeof showToast === 'function') showToast('Session expired. Please log in again.', 'error');
    });

    eventSource.onerror = () => {
        const el = document.getElementById('gateway-status');
        if (el) el.textContent = 'Gateway: Reconnecting...';
        const mobEl = document.getElementById('mobile-gateway-indicator');
        if (mobEl) mobEl.textContent = 'Offline';
    };
}

window.initEventStream = initEventStream;
