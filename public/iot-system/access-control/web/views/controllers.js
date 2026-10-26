/**
 * ACCESS Professional - Controllers & Doors Coordinator View
 * View mode switcher, stats calculation, Directus status, and modal triggers.
 */

function setControllersView(mode) {
    controllersViewMode = mode;
    try { localStorage.setItem('access_controllers_view', mode); } catch (e) { /* intentional: localStorage restricted */ }
    renderControllers();
}

function renderStats() {
    const onlineCount = controllers.filter(c => c.status === 'ONLINE' && c.scanned !== false).length;
    // Boards that dropped out: was-reachable (OFFLINE/UNCONNECTED) + never-seen (UNREACHABLE).
    // Display stays plain online-only count.
    const offlineCount = controllers.filter(c => c.status === 'OFFLINE' || c.status === 'UNCONNECTED' || c.status === 'UNREACHABLE').length;
    const boardsEl = document.getElementById('stat-boards-count');
    if (boardsEl) {
        boardsEl.textContent = onlineCount;
    }

    let totalDoors = 0;
    controllers.forEach(c => {
        if (Array.isArray(c.doors)) totalDoors += c.doors.length;
    });
    const doorsEl = document.getElementById('stat-doors-count');
    if (doorsEl) doorsEl.textContent = totalDoors;
    const usersEl = document.getElementById('stat-users-count');
    if (usersEl) usersEl.textContent = users.length;
}

function updateDirectusStatus(directus) {
    const textEl = document.getElementById('directus-status-text');
    const iconEl = document.getElementById('directus-status-icon');
    const pillEl = document.getElementById('directus-status-pill');
    if (!textEl || !directus) return;

    if (directus.status === 'CONNECTED') {
        textEl.textContent = 'Active';
        textEl.style.color = 'var(--accent-primary)';
        if (iconEl) iconEl.style.color = 'var(--accent-primary)';
        if (pillEl) pillEl.title = `Directus DB Connected: ${directus.targetUrl}`;
    } else if (directus.status === 'FORBIDDEN') {
        textEl.textContent = 'Standby (403)';
        textEl.style.color = 'var(--accent-warning)';
        if (iconEl) iconEl.style.color = 'var(--accent-warning)';
        if (pillEl) pillEl.title = 'Directus Standby: Awaiting Public permissions or DIRECTUS_TOKEN';
    } else if (directus.status === 'UNREACHABLE') {
        textEl.textContent = 'Offline';
        textEl.style.color = 'var(--accent-danger)';
        if (iconEl) iconEl.style.color = 'var(--accent-danger)';
        if (pillEl) pillEl.title = `Directus Unreachable: ${directus.targetUrl}`;
    } else {
        textEl.textContent = directus.status || 'Standby';
        textEl.style.color = 'var(--text-muted)';
        if (iconEl) iconEl.style.color = 'var(--text-muted)';
    }
}

function renderControllers() {
    if (typeof isCurrentlyEditing === 'function' && isCurrentlyEditing()) {
        console.log('[renderControllers] Skipped full render because inline editing is active');
        return;
    }

    const container = document.getElementById('controllers-container');
    const tableContainer = document.getElementById('controllers-table-container');
    const emptyState = document.getElementById('controllers-empty');
    if (!container || !tableContainer) return;

    const btnCompact = document.getElementById('btn-ctrl-compact');
    const btnDetailed = document.getElementById('btn-ctrl-detailed');
    const btnTable = document.getElementById('btn-ctrl-table');
    if (btnCompact) btnCompact.classList.toggle('active-view', controllersViewMode === 'compact');
    if (btnDetailed) btnDetailed.classList.toggle('active-view', controllersViewMode === 'detailed');
    if (btnTable) btnTable.classList.toggle('active-view', controllersViewMode === 'table');

    const rawList = typeof filterControllers === 'function' ? filterControllers() : controllers;
    const filtered = rawList.slice().sort((a, b) => {
        const aOff = (a.status === 'OFFLINE' || a.status === 'UNCONNECTED' || a.status === 'UNREACHABLE' || a.status === 'UNSCANNED' || a.scanned === false) ? 1 : 0;
        const bOff = (b.status === 'OFFLINE' || b.status === 'UNCONNECTED' || b.status === 'UNREACHABLE' || b.status === 'UNSCANNED' || b.scanned === false) ? 1 : 0;
        if (aOff !== bOff) return aOff - bOff;
        return (a.serialNumber || 0) - (b.serialNumber || 0);
    });

    if (filtered.length === 0) {
        container.innerHTML = '';
        container.style.display = 'none';
        tableContainer.style.display = 'none';
        if (emptyState) emptyState.style.display = 'flex';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    if (controllersViewMode === 'table') {
        container.style.display = 'none';
        tableContainer.style.display = 'block';
        if (typeof renderControllersTable === 'function') renderControllersTable(filtered);
    } else {
        tableContainer.style.display = 'none';
        container.style.display = 'grid';
        if (controllersViewMode === 'compact') {
            if (typeof renderControllersCompact === 'function') renderControllersCompact(filtered);
        } else {
            if (typeof renderControllersDetailed === 'function') renderControllersDetailed(filtered);
        }
    }

    if (typeof updateMonitorControllerFilter === 'function') updateMonitorControllerFilter();
}

function openDoorConfigModal(serial, doorNumber) {
    const ctrl = controllers.find(c => c.serialNumber === serial);
    const door = ctrl?.doors?.find(d => d.id === doorNumber) || { id: doorNumber, name: `Door ${doorNumber}`, delay: 3, mode: 'Controlled' };

    const titleEl = document.getElementById('modal-door-title') || document.getElementById('door-modal-title');
    if (titleEl) titleEl.textContent = `${ctrl?.name || 'Controller'} - Door ${doorNumber} Settings`;
    const serialEl = document.getElementById('door-serial');
    if (serialEl) serialEl.value = serial;
    const numEl = document.getElementById('door-number');
    if (numEl) numEl.value = doorNumber;
    const nameEl = document.getElementById('door-name-input');
    if (nameEl) nameEl.value = door.name || `Door ${doorNumber}`;
    const delayEl = document.getElementById('door-delay-input');
    if (delayEl) delayEl.value = door.delay !== undefined ? door.delay : 3;
    const modeEl = document.getElementById('door-mode-input');
    if (modeEl) modeEl.value = door.mode || 'Controlled';
    const sensorEl = document.getElementById('door-sensor-input');
    if (sensorEl) sensorEl.value = door.sensorEnabled ? 'true' : 'false';
    const lockEl = document.getElementById('door-locktype-input');
    if (lockEl) lockEl.value = door.lockType === 'magnetic' ? 'magnetic' : 'strike';

    const authRole = typeof getUiAuthRole === 'function' ? getUiAuthRole() : 'viewer';
    const isSuperadmin = typeof canUiAdminister === 'function' ? canUiAdminister() : authRole === 'superadmin';
    const canManagePasscodes = typeof canUiWrite === 'function' ? canUiWrite() : (authRole === 'admin' || isSuperadmin);

    const keypads = (ctrl && Array.isArray(ctrl.keypads)) ? ctrl.keypads : [];
    const keypadEnabled = keypads[doorNumber - 1] !== false;
    const keypadToggle = document.getElementById('door-keypad-toggle');
    if (keypadToggle) {
        keypadToggle.checked = keypadEnabled;
        keypadToggle.disabled = !canManagePasscodes;
        keypadToggle.onchange = () => {
            if (typeof toggleReaderKeypad === 'function') toggleReaderKeypad(serial, doorNumber, keypadToggle);
        };
    }
    const keypadStateEl = document.getElementById('door-keypad-state');
    if (keypadStateEl) {
        keypadStateEl.textContent = keypadEnabled ? 'Keypad: Enabled' : 'Keypad: Disabled';
        keypadStateEl.classList.toggle('is-off', !keypadEnabled);
    }

    const passcodeGroup = document.getElementById('door-passcodes-group');
    if (passcodeGroup) {
        passcodeGroup.style.display = canManagePasscodes ? '' : 'none';
    }

    renderDoorModalPasscodes(door.passcodes, serial, doorNumber, canManagePasscodes, isSuperadmin);

    if (door.passcodes === undefined || !Array.isArray(door.passcodes)) {
        fetch('/api/controllers?all=true')
            .then(res => res.json())
            .then(data => {
                if (data.success && Array.isArray(data.controllers)) {
                    const freshCtrl = data.controllers.find(c => c.serialNumber === serial);
                    const freshDoor = freshCtrl?.doors?.find(d => d.id === doorNumber);
                    if (freshDoor && Array.isArray(freshDoor.passcodes)) {
                        const cIdx = controllers.findIndex(c => c.serialNumber === serial);
                        if (cIdx >= 0) controllers[cIdx] = freshCtrl;
                        const modalEl = document.getElementById('modal-door');
                        const sVal = parseInt(document.getElementById('door-serial')?.value, 10);
                        const dVal = parseInt(document.getElementById('door-number')?.value, 10);
                        if (modalEl && modalEl.classList.contains('active') && sVal === serial && dVal === doorNumber) {
                            renderDoorModalPasscodes(freshDoor.passcodes, serial, doorNumber, canManagePasscodes, isSuperadmin);
                        }
                    }
                }
            })
            .catch(() => {});
    }

    const passcodeInput = document.getElementById('door-passcodes-input');
    if (passcodeInput) {
        passcodeInput.value = '';
        passcodeInput.placeholder = 'Type new code(s), e.g. 1234 5678';
    }
    const savePassBtn = document.getElementById('btn-save-door-passcodes');
    if (savePassBtn) {
        savePassBtn.disabled = !canManagePasscodes;
        savePassBtn.onclick = () => {
            if (canManagePasscodes && typeof saveDoorPasscodes === 'function') saveDoorPasscodes(serial, doorNumber, savePassBtn);
        };
    }

    const modal = document.getElementById('modal-door');
    if (modal) modal.classList.add('active');
}

function renderDoorModalPasscodes(passcodes, serial, doorNumber, canManagePasscodes, isSuperadmin) {
    const activeCodes = (Array.isArray(passcodes) ? passcodes : [])
        .map(v => parseInt(v, 10))
        .filter(v => Number.isInteger(v) && v > 0);
    const listEl = document.getElementById('door-passcodes-list');
    if (!listEl) return;
    listEl.innerHTML = '';
    if (activeCodes.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'passcode-row passcode-row-empty';
        empty.textContent = 'No passcodes saved for this door.';
        listEl.appendChild(empty);
    } else {
        activeCodes.forEach(code => {
            const row = document.createElement('div');
            row.className = 'passcode-row';
            const val = document.createElement('span');
            val.className = 'passcode-row-value';
            const strCode = String(code);
            val.textContent = '••••••••';
            val.setAttribute('data-code', strCode);
            row.appendChild(val);

            const actions = document.createElement('div');
            actions.className = 'passcode-row-actions';
            actions.style.display = 'flex';
            actions.style.gap = '6px';
            actions.style.alignItems = 'center';

            let isMasked = true;
            const toggleBtn = document.createElement('button');
            toggleBtn.type = 'button';
            toggleBtn.className = 'btn btn-outline passcode-row-toggle';
            toggleBtn.style.padding = '3px 8px';
            toggleBtn.style.fontSize = '11px';
            toggleBtn.style.display = 'inline-flex';
            toggleBtn.style.alignItems = 'center';
            toggleBtn.style.gap = '4px';
            toggleBtn.title = 'Show digits';
            toggleBtn.innerHTML = '<i class="fa-solid fa-eye"></i> <span>Show digits</span>';
            toggleBtn.onclick = () => {
                isMasked = !isMasked;
                val.textContent = isMasked ? '••••••••' : strCode;
                toggleBtn.title = isMasked ? 'Show digits' : 'Hide digits';
                toggleBtn.innerHTML = isMasked
                    ? '<i class="fa-solid fa-eye"></i> <span>Show digits</span>'
                    : '<i class="fa-solid fa-eye-slash"></i> <span>Hide digits</span>';
            };
            actions.appendChild(toggleBtn);

            if (canManagePasscodes) {
                const del = document.createElement('button');
                del.type = 'button';
                del.className = 'btn btn-outline passcode-row-delete';
                del.setAttribute('data-requires', 'write');
                del.title = 'Delete this passcode';
                del.innerHTML = '<i class="fa-solid fa-trash"></i> <span>Delete</span>';
                del.onclick = () => {
                    if (typeof deleteDoorPasscode === 'function') deleteDoorPasscode(serial, doorNumber, code);
                };
                actions.appendChild(del);
            }
            row.appendChild(actions);
            listEl.appendChild(row);
        });
    }
}

function closeDoorModal() {
    const modal = document.getElementById('modal-door');
    if (modal) modal.classList.remove('active');
}

async function submitDoorConfigForm(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (typeof requireUiWrite === 'function' && !requireUiWrite()) return;
    const serial = parseInt(document.getElementById('door-serial').value, 10);
    const doorNumber = parseInt(document.getElementById('door-number').value, 10);
    const name = document.getElementById('door-name-input').value.trim();
    const delay = parseInt(document.getElementById('door-delay-input').value, 10);
    const mode = document.getElementById('door-mode-input').value;
    const sensorEnabled = document.getElementById('door-sensor-input')?.value === 'true';
    const lockTypeRaw = document.getElementById('door-locktype-input')?.value;
    const lockType = lockTypeRaw === 'magnetic' ? 'magnetic' : 'strike';

    if (window.currentEmergencyState === 'EMERGENCY_OPEN' && mode !== 'NormallyOpen') {
        showToast('Cannot lock door: Facility Emergency Open is active.', 'danger');
        return;
    }
    if (window.currentEmergencyState === 'LOCKDOWN' && mode !== 'NormallyClosed') {
        showToast('Cannot change door mode: Facility Lockdown is active.', 'danger');
        return;
    }

    try {
        const res = await fetch(`/api/controllers/${serial}/door`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ doorNumber, name, delay, mode, sensorEnabled, lockType })
        });
        const data = await res.json();
        if (data.success) {
            closeDoorModal();
            if (data.controller) {
                const idx = controllers.findIndex(c => c.serialNumber === serial);
                if (idx >= 0) controllers[idx] = data.controller;
                renderControllers();
                if (typeof renderUsers === 'function') renderUsers();
                if (activeTab === 'tab-monitor' && typeof renderMonitoredDoors === 'function') renderMonitoredDoors();
            }
            showToast(`Door ${doorNumber} updated to "${name || 'Door ' + doorNumber}".`, 'success');
        } else {
            showToast(`Error: ${data.error}`, 'danger');
        }
    } catch (err) {
        showToast(`Save error: ${err.message}`, 'danger');
    }
}

// Global window bindings
window.setControllersView = setControllersView;
window.renderStats = renderStats;
window.updateDirectusStatus = updateDirectusStatus;
window.renderControllers = renderControllers;
window.openDoorConfigModal = openDoorConfigModal;
window.closeDoorModal = closeDoorModal;
window.submitDoorConfigForm = submitDoorConfigForm;
