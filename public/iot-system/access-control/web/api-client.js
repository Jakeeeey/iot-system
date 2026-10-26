/**
 * ACCESS Professional - API Client & Hardware Action Dispatcher
 * Dispatches REST API requests for controllers, users, history, scans, and door pulses.
 */

async function loadControllers() {
    try {
        const res = await fetch('/api/controllers?all=true');
        const data = await res.json();
        if (data.success && Array.isArray(data.controllers)) {
            // Include all configured hardware controllers; exclude only local mock loopbacks
            controllers = data.controllers.filter(c => !(c.ip === '127.0.0.1' && c.mac === 'N/A'));
            if (typeof renderControllers === 'function') renderControllers();
            if (typeof renderStats === 'function') renderStats();
            if (typeof renderCommandCenter === 'function') renderCommandCenter();
            if (data.directus && typeof updateDirectusStatus === 'function') {
                updateDirectusStatus(data.directus);
            }
            if (controllers.length === 0 && !window._initialScanTriggered) {
                window._initialScanTriggered = true;
                setTimeout(() => scanNetwork(), 500);
            }
        }
    } catch (e) {
        console.error('[Load Controllers Error]', e);
    }
}

async function loadUsers() {
    try {
        const res = await fetch('/api/users');
        const data = await res.json();
        const userList = Array.isArray(data) ? data : (data && data.success && Array.isArray(data.users) ? data.users : null);
        if (userList) {
            users = userList;
            if (typeof renderUsers === 'function') renderUsers();
            if (typeof renderStats === 'function') renderStats();
        }
    } catch (e) {
        console.error('[Load Users Error]', e);
    }
}

async function loadHistory() {
    try {
        // Always fetch the FULL telemetry set — History tab filters client-side
        // (renderHistory reads #history-type-filter itself). Fetching filtered
        // subsets here used to overwrite global auditLogs and corrupt
        // Command Center velocity/analytics with the History category choice.
        const url = '/api/history?limit=500';

        const res = await fetch(url);
        const data = await res.json();
        if (data.success && Array.isArray(data.logs)) {
            auditLogs = data.logs;
            if (typeof renderHistory === 'function') {
                const searchTerm = (document.getElementById('history-search-input')?.value || '').toLowerCase();
                renderHistory(searchTerm);
            }
            if (typeof rebuildMonitorTable === 'function') rebuildMonitorTable();
        }
    } catch (e) {
        console.error('[Load History Error]', e);
    } finally {
        historyLoaded = true;
        if (typeof activeTab !== 'undefined' && activeTab === 'tab-command' && typeof renderCommandCenter === 'function') renderCommandCenter();
    }
}

async function scanNetwork() {
    const btn = document.getElementById('btn-scan-network');
    const icon = btn?.querySelector('i');
    if (btn) btn.disabled = true;
    if (icon) icon.className = 'fa-solid fa-spinner fa-spin';

    showToast('Broadcast scanner active: sending 0x94 probe across LAN...', 'info');

    try {
        const res = await fetch('/api/scan', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
            showToast(`Scan complete: Discovered ${data.controllers.length} active UHPPOTE controllers.`, 'success');
            await loadControllers();
        } else {
            showToast(`Scan failed: ${data.error}`, 'danger');
        }
    } catch (e) {
        showToast(`Scan error: ${e.message}`, 'danger');
    } finally {
        if (btn) btn.disabled = false;
        if (icon) icon.className = 'fa-solid fa-radar';
    }
}

function renderScanModeButton(btn, mode) {
    if (!btn) return;
    const on = mode === 'continuous';
    btn.dataset.mode = on ? 'continuous' : 'initial-only';
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.classList.toggle('btn-primary', on);
    btn.classList.toggle('btn-outline', !on);
    const label = btn.querySelector('span');
    if (label) label.textContent = on ? 'Continuous: On' : 'Continuous: Off';
}

async function loadScanMode() {
    const btn = document.getElementById('continuous-monitor-cb');
    if (!btn) return;
    try {
        const res = await fetch('/api/settings/scan-mode');
        const data = await res.json();
        if (data && data.success && typeof data.mode === 'string') {
            renderScanModeButton(btn, data.mode);
        }
    } catch (e) {
        console.error('[Load Scan Mode Error]', e);
    }
}

async function handleScanModeChange() {
    const btn = document.getElementById('continuous-monitor-cb');
    if (!btn) return;
    const current = btn.dataset.mode === 'continuous' ? 'continuous' : 'initial-only';
    const mode = current === 'continuous' ? 'initial-only' : 'continuous';
    try {
        const res = await fetch('/api/settings/scan-mode', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mode })
        });
        const data = await res.json();
        if (data && data.success) {
            renderScanModeButton(btn, mode);
            showToast(mode === 'continuous' ? 'Continuous monitoring enabled.' : 'Continuous monitoring disabled (initial scan only).', 'success');
        } else {
            showToast(`Failed to update scan mode: ${(data && data.error) || 'unknown error'}`, 'danger');
        }
    } catch (err) {
        showToast(`Scan mode update error: ${err.message}`, 'danger');
    }
}

function initScanModeToggle() {
    const btn = document.getElementById('continuous-monitor-cb');
    if (!btn) return;
    btn.addEventListener('click', handleScanModeChange);
    loadScanMode();
}

async function probeDirectIp() {
    const inputEl = document.getElementById('probe-ip-input');
    const inputVal = inputEl && typeof inputEl.value === 'string' ? inputEl.value.trim() : '';
    const ip = inputVal || prompt('Enter Controller IP to probe directly (e.g. 192.168.1.100):');
    if (!ip) return;

    showToast(`Sending unicast probe to ${ip.trim()}...`, 'info');
    try {
        const res = await fetch('/api/scan/probe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ip: ip.trim() })
        });
        const data = await res.json();
        if (data.success) {
            const found = Array.isArray(data.controllers) && data.controllers.length > 0 ? data.controllers[0] : null;
            if (!found) {
                showToast('Probe failed: no controllers responded.', 'danger');
                return;
            }
            showToast(`Controller responded! Added SN:${found.serialNumber} (${found.ip})`, 'success');
            await loadControllers();
        } else {
            showToast(`Probe failed: ${data.error}`, 'danger');
        }
    } catch (e) {
        showToast(`Probe error: ${e.message}`, 'danger');
    }
}

const boardRetryInFlight = new Set();

function isBoardOffline(ctrl) {
    return !!ctrl && (ctrl.status === 'OFFLINE' || ctrl.status === 'UNCONNECTED' || ctrl.status === 'UNREACHABLE');
}

async function retryBoardConnection(serial) {
    const list = (typeof controllers !== 'undefined' && Array.isArray(controllers)) ? controllers : [];
    const ctrl = list.find(c => c.serialNumber === serial);
    const name = (ctrl && ctrl.name) || `SN:${serial}`;
    const ip = ctrl && ctrl.ip;
    if (ctrl && typeof isControllerEnabled === 'function' && !isControllerEnabled(ctrl)) {
        showToast(`Cannot retry ${name}: controller is disabled. Enable it first.`, 'warning');
        return false;
    }
    if (!ip) {
        showToast(`Cannot retry ${name}: no known IP address.`, 'warning');
        return false;
    }
    if (boardRetryInFlight.has(serial)) {
        showToast(`Connection retry already in progress for ${name}...`, 'info');
        return false;
    }
    boardRetryInFlight.add(serial);
    try {
        showToast(`Controller ${name} is offline — retrying connection to ${ip}...`, 'info');
        const res = await fetch('/api/scan/probe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ip })
        });
        const data = await res.json().catch(() => ({}));
        if (!data.success) {
            showToast(`Retry failed: ${data.error || 'probe error'}`, 'danger');
            return false;
        }
        if (typeof loadControllers === 'function') await loadControllers();
        const fresh = list.find(c => c.serialNumber === serial);
        if (fresh && fresh.status === 'ONLINE') {
            showToast(`Controller ${name} reconnected.`, 'success');
            return true;
        }
        showToast(`Controller ${name} still offline (${(fresh && fresh.status) || 'unknown'}).`, 'warning');
        return false;
    } catch (e) {
        showToast(`Retry error: ${e.message}`, 'danger');
        return false;
    } finally {
        boardRetryInFlight.delete(serial);
    }
}

async function setReaderKeypads(serial, reader, enabled) {
    try {
        const res = await fetch(`/api/controllers/${serial}/keypads`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reader, enabled })
        });
        const data = await res.json().catch(() => ({}));
        if (data && data.success && data.controller) {
            const idx = controllers.findIndex(c => c.serialNumber === data.controller.serialNumber);
            if (idx >= 0) controllers[idx] = data.controller;
            if (typeof updateControllerDomInPlace === 'function') updateControllerDomInPlace(data.controller);
            if (typeof updateMonitorControllerFilter === 'function') updateMonitorControllerFilter();
            if (activeTab === 'tab-monitor' && typeof renderMonitoredDoors === 'function') renderMonitoredDoors();
            return { success: true, controller: data.controller };
        }
        const error = (data && data.error) || 'Server error';
        showToast(`Keypad update failed: ${error}`, 'danger');
        return { success: false, error };
    } catch (e) {
        showToast(`Keypad update error: ${e.message}`, 'danger');
        return { success: false, error: e.message };
    }
}

async function setDoorPasscodes(serial, doorNumber, passcodes) {
    try {
        const res = await fetch(`/api/controllers/${serial}/doors/${doorNumber}/passcodes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ passcodes })
        });
        const data = await res.json().catch(() => ({}));
        if (data && data.success && data.controller) {
            const idx = controllers.findIndex(c => c.serialNumber === data.controller.serialNumber);
            if (idx >= 0) controllers[idx] = data.controller;
            if (typeof updateControllerDomInPlace === 'function') updateControllerDomInPlace(data.controller);
            if (typeof updateMonitorControllerFilter === 'function') updateMonitorControllerFilter();
            if (activeTab === 'tab-monitor' && typeof renderMonitoredDoors === 'function') renderMonitoredDoors();
            return { success: true, controller: data.controller };
        }
        const error = (data && data.error) || 'Server error';
        showToast(`Passcode update failed: ${error}`, 'danger');
        return { success: false, error };
    } catch (e) {
        showToast(`Passcode update error: ${e.message}`, 'danger');
        return { success: false, error: e.message };
    }
}

async function triggerRemoteOpen(serial, doorNumber) {
    if (window.currentEmergencyState === 'LOCKDOWN') {
        showToast('Cannot pulse open door: Facility Lockdown is active.', 'danger');
        return;
    }
    const ctrl = controllers.find(c => c.serialNumber === serial);
    if (isBoardOffline(ctrl)) {
        const reconnected = await retryBoardConnection(serial);
        if (!reconnected) return;
    }

    const btn = document.getElementById(`btn-pulse-${serial}-${doorNumber}`);
    const originalHtml = btn ? btn.innerHTML : '';
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Pulsing...';
    }

    try {
        const res = await fetch(`/api/controllers/${serial}/doors/${doorNumber}/open`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        showToast(data.success ? `Door ${doorNumber} unlocked remotely.` : `Remote open failed: ${data.error}`, data.success ? 'success' : 'danger');
    } catch (e) {
        showToast(`Unlock error: ${e.message}`, 'danger');
    } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = originalHtml; }
    }
}

async function toggleDoorLockdown(serial, doorNumber) {
    if (window.currentEmergencyState === 'EMERGENCY_OPEN') {
        showToast('Cannot lock door: Facility Emergency Open is active.', 'danger');
        return;
    }
    if (window.currentEmergencyState === 'LOCKDOWN') {
        showToast('Cannot modify door lockdown: Facility Lockdown is active.', 'danger');
        return;
    }
    const ctrl = controllers.find(c => c.serialNumber === serial);
    const door = ctrl?.doors?.find(d => d.id === doorNumber);
    if (!door) return;
    if (isBoardOffline(ctrl)) {
        const reconnected = await retryBoardConnection(serial);
        if (!reconnected) return;
    }

    const isCurrentlyLockdown = door.mode === 'NormallyClosed';
    const newMode = isCurrentlyLockdown ? 'Controlled' : 'NormallyClosed';
    const actionLabel = isCurrentlyLockdown ? 'Release Lockdown' : 'Engage Lockdown';

    const lockBtn = document.getElementById(`btn-lock-${serial}-${doorNumber}`);
    const origHtml = lockBtn ? lockBtn.innerHTML : '';
    if (lockBtn) {
        lockBtn.disabled = true;
        lockBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    }

    try {
        const res = await fetch(`/api/controllers/${serial}/doors/${doorNumber}/toggle-lockdown`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        if (data.success) {
            if (data.controller) {
                const idx = controllers.findIndex(c => c.serialNumber === serial);
                if (idx >= 0) controllers[idx] = data.controller;
                if (typeof updateControllerDomInPlace === 'function') updateControllerDomInPlace(data.controller);
                if (activeTab === 'tab-monitor' && typeof renderMonitoredDoors === 'function') renderMonitoredDoors();
            }
            showToast(
                isCurrentlyLockdown
                    ? `Lockdown RELEASED on Door ${doorNumber}. Access Mode returned to Controlled.`
                    : `LOCKDOWN ENGAGED on Door ${doorNumber}. All card swipes and PINs rejected.`,
                isCurrentlyLockdown ? 'info' : 'danger'
            );
        } else {
            showToast(`${actionLabel} failed: ${data.error}`, 'danger');
            if (lockBtn) lockBtn.innerHTML = origHtml;
        }
    } catch (e) {
        showToast(`Lockdown toggle error: ${e.message}`, 'danger');
        if (lockBtn) lockBtn.innerHTML = origHtml;
    } finally {
        if (lockBtn) lockBtn.disabled = false;
    }
}

async function syncControllerClock(serial) {
    const ctrl = (typeof controllers !== 'undefined' ? controllers : []).find(c => c.serialNumber === serial);
    if (isBoardOffline(ctrl)) {
        const reconnected = await retryBoardConnection(serial);
        if (!reconnected) return;
    }
    showToast(`Synchronizing hardware clock for Controller ${serial}...`, 'info');
    try {
        const res = await fetch(`/api/controllers/${serial}/sync-time`, { method: 'POST' });
        const data = await res.json();
        if (data.success) {
            showToast(`Clock synced successfully on Controller ${serial}.`, 'success');
        } else {
            showToast(`Clock sync failed: ${data.error}`, 'danger');
        }
    } catch (e) {
        showToast(`Clock sync error: ${e.message}`, 'danger');
    }
}

async function syncAllControllerClocks() {
    const btn = document.getElementById('btn-sync-all-clocks');
    const icon = btn?.querySelector('i');
    const label = btn?.querySelector('span');
    const originalIconClass = icon ? icon.className : '';
    const originalLabel = label ? label.textContent : '';
    if (btn) btn.disabled = true;
    if (icon) icon.className = 'fa-solid fa-spinner fa-spin';
    if (label) label.textContent = 'Syncing clocks...';

    if (typeof showToast === 'function') showToast('Pushing gateway clock to all active boards...', 'info');

    try {
        const res = await fetch('/api/controllers/sync-all-clocks', { method: 'POST' });
        const data = await res.json();
        if (data && data.success) {
            const nested = data.data && typeof data.data === 'object' ? data.data : {};
            const rawResults = data.boardResults || nested.boardResults || [];
            const results = Array.isArray(rawResults) ? rawResults : [];
            const accepted = typeof data.accepted === 'number' ? data.accepted : (typeof nested.accepted === 'number' ? nested.accepted : results.filter(r => r && r.ok === true && !r.failed).length);
            const failed = typeof data.failed === 'number' ? data.failed : (typeof nested.failed === 'number' ? nested.failed : results.filter(r => r && (r.ok === false || r.failed)).length);
            const total = results.length > 0 ? results.length : (accepted + failed);
            const failedSerials = results.filter(r => r && (r.ok === false || r.failed)).map(r => r.serial).filter(Boolean);
            let message = `Clocks synced on ${accepted}/${total} boards`;
            if (failed > 0 && failedSerials.length > 0) message += ` - failed: ${failedSerials.join(', ')}`;
            else if (failed > 0) message += ` - ${failed} failed`;
            if (typeof showToast === 'function') showToast(message, 'success');
        } else {
            const errMsg = (data && (data.error || data.message)) || 'unknown error';
            if (typeof showToast === 'function') showToast(`Clock sync failed: ${errMsg}`, 'danger');
        }
    } catch (e) {
        if (typeof showToast === 'function') showToast(`Clock sync error: ${e.message}`, 'danger');
    } finally {
        if (btn) btn.disabled = false;
        if (icon) icon.className = originalIconClass;
        if (label) label.textContent = originalLabel;
    }
}

async function importFromHardware() {
    const activeControllers = controllers.filter(c => isScannedController(c) && isControllerEnabled(c));
    if (activeControllers.length === 0) {
        showToast('No enabled controllers detected on LAN. Run Scan Network first or enable a controller.', 'warning');
        return;
    }

    const btn = document.getElementById('btn-import-hardware');
    const originalText = btn ? btn.innerHTML : '';
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Extracting from LAN...';
    }

    try {
        const res = await fetch('/api/users/import-hardware', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
            await loadUsers();
            showToast(`Import completed: ${data.totalImported} cardholders extracted and registered!`, 'success');
        } else {
            showToast(`Import failed: ${data.error}`, 'danger');
        }
    } catch (e) {
        showToast(`Import error: ${e.message}`, 'danger');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }
}

async function deleteUser(cardNumber, btnEl) {
    const user = users.find(u => u.cardNumber === cardNumber);
    const displayName = user ? `${user.name} (#${cardNumber})` : `Card #${cardNumber}`;

    if (!confirm(`Are you sure you want to permanently delete user privileges for ${displayName}?\n\nThis will send 0x52 delete packets to all controllers on LAN.`)) {
        return;
    }

    const btn = (btnEl && btnEl.closest) ? btnEl.closest('button') || btnEl : document.querySelector(`button[data-fn="deleteUser"][data-a1="${cardNumber}"]`);
    if (btn && btn.disabled) return;
    const origHtml = btn ? btn.innerHTML : '';
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        btn.style.opacity = '0.7';
        btn.style.cursor = 'wait';
    }
    showToast(`Deleting ${displayName} from hardware...`, 'info');

    try {
        const res = await fetch(`/api/users/${cardNumber}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            users = users.filter(u => u.cardNumber !== cardNumber);
            if (typeof renderUsers === 'function') renderUsers();
            if (typeof renderStats === 'function') renderStats();
            showToast(`Privilege for ${displayName} revoked and deleted from hardware.`, 'info');
        } else {
            showToast(`Delete failed: ${data.error}`, 'danger');
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = origHtml;
                btn.style.opacity = '';
                btn.style.cursor = '';
            }
        }
    } catch (e) {
        showToast(`Delete error: ${e.message}`, 'danger');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = origHtml;
            btn.style.opacity = '';
            btn.style.cursor = '';
        }
    }
}

// Global window bindings
window.loadControllers = loadControllers;
window.loadUsers = loadUsers;
window.loadHistory = loadHistory;
window.scanNetwork = scanNetwork;
window.probeDirectIp = probeDirectIp;
window.loadScanMode = loadScanMode;
window.handleScanModeChange = handleScanModeChange;
window.initScanModeToggle = initScanModeToggle;
window.setReaderKeypads = setReaderKeypads;
window.setDoorPasscodes = setDoorPasscodes;
window.triggerRemoteOpen = triggerRemoteOpen;
window.toggleDoorLockdown = toggleDoorLockdown;
window.syncControllerClock = syncControllerClock;
window.syncAllControllerClocks = syncAllControllerClocks;
window.importFromHardware = importFromHardware;
window.deleteUser = deleteUser;
