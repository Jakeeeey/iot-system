/**
 * ACCESS Professional - Controller & Door Inline Editing Views
 * Handles live inline renaming of controllers and doors, delay timing, mode selection, and sensor toggling.
 */

function getUiAuthRole() {
    if (typeof window.getAuthRole === 'function') {
        try {
            const role = window.getAuthRole();
            if (role === 'admin' || role === 'superadmin') return role;
            return 'viewer';
        } catch (e) { /* ignore */ }
    }
    const role = (typeof document !== 'undefined' && document.body && document.body.dataset)
        ? document.body.dataset.authRole
        : '';
    return (role === 'admin' || role === 'superadmin') ? role : 'viewer';
}

function canUiWrite() {
    if (typeof window.canWrite === 'function') {
        try { return window.canWrite() === true; } catch (e) { /* ignore */ }
    }
    const role = getUiAuthRole();
    return role === 'admin' || role === 'superadmin';
}

function canUiAdminister() {
    if (typeof window.canAdminister === 'function') {
        try { return window.canAdminister() === true; } catch (e) { /* ignore */ }
    }
    return getUiAuthRole() === 'superadmin';
}

function requireUiWrite() {
    if (canUiWrite()) return true;
    if (typeof showToast === 'function') {
        showToast('Read-only viewer mode — sign in to make changes.', 'warning');
    }
    if (typeof promptForAdminToken === 'function') promptForAdminToken(false);
    return false;
}

function setupInlineInputListeners(input, currentVal, finish, save) {
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); save(); }
        if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); finish(currentVal); }
    });
    input.addEventListener('blur', () => { save(); });
}

async function postControllerUpdate(url, body, successMsg, revertVal, finish) {
    if (!canUiWrite()) {
        if (typeof finish === 'function') finish(revertVal);
        return false;
    }
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (data.success && data.controller) {
            const idx = controllers.findIndex(c => c.serialNumber === data.controller.serialNumber);
            if (idx >= 0) controllers[idx] = data.controller;
            if (typeof updateControllerDomInPlace === 'function') updateControllerDomInPlace(data.controller);
            if (typeof updateMonitorControllerFilter === 'function') updateMonitorControllerFilter();
            if (activeTab === 'tab-monitor' && typeof renderMonitoredDoors === 'function') renderMonitoredDoors();
            showToast(successMsg, 'success');
            return true;
        } else {
            showToast(`Update failed: ${data.error || 'Server error'}`, 'danger');
            finish(revertVal);
            return false;
        }
    } catch (e) {
        showToast(`Save error: ${e.message}`, 'danger');
        finish(revertVal);
        return false;
    }
}

async function toggleControllerEnabled(serial, btnEl) {
    if (!requireUiWrite()) return;
    const ctrl = controllers.find(c => c.serialNumber === serial);
    if (!ctrl) return;

    const nextEnabled = !isControllerEnabled(ctrl);
    const label = ctrl.name || `Controller ${serial}`;
    const btn = btnEl
        || document.getElementById(`btn-toggle-enabled-${serial}`)
        || document.getElementById(`btn-toggle-enabled-det-${serial}`)
        || document.querySelector(`[data-ctrl-toggle="${serial}"]`);
    const origHtml = btn ? btn.innerHTML : '';
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    }

    const ok = await postControllerUpdate(
        `/api/controllers/${serial}/enabled`,
        { enabled: nextEnabled },
        nextEnabled ? `${label} enabled.` : `${label} disabled.`,
        !nextEnabled,
        () => {}
    );

    if (btn) {
        btn.disabled = false;
        if (!ok) btn.innerHTML = origHtml;
    }
}

function startInlineEditControllerName(serial, el) {
    if (!requireUiWrite()) return;
    if (!el || el.tagName === 'INPUT' || el.querySelector('.inline-input')) return;
    if (typeof isCurrentlyEditing === 'function' && isCurrentlyEditing()) {
        const prev = document.querySelector('.inline-input');
        if (prev) prev.blur();
    }

    const ctrl = controllers.find(c => c.serialNumber === serial);
    const currentName = ctrl?.name || `Controller ${serial}`;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'inline-input';
    input.value = currentName;
    input.style.width = '200px';
    input.setAttribute('data-serial', serial);

    activeInlineEditElement = input;
    let finished = false;

    const finish = (finalName) => {
        if (finished) return;
        finished = true;
        activeInlineEditElement = null;
        el.innerHTML = `${esc(finalName)} <i class="fa-solid fa-pen inline-editable-icon" data-fn="startInlineEditControllerName" data-a1="${serial}" data-el="parent" data-requires="write" style="font-size: 10px;" title="Rename controller"></i>`;
        if (input.parentNode) input.replaceWith(el);
    };

    const save = async () => {
        if (finished) return;
        const newName = input.value.trim();
        if (!newName || newName === currentName) { finish(currentName); return; }
        if (!canUiWrite()) { finish(currentName); return; }
        finish(newName);
        await postControllerUpdate(`/api/controllers/${serial}`, { name: newName }, `Controller renamed to "${newName}".`, currentName, finish);
    };

    setupInlineInputListeners(input, currentName, finish, save);
    el.replaceWith(input);
    input.focus();
    input.select();
}

function startInlineEditDoorName(serial, doorId, el) {
    if (!requireUiWrite()) return;
    if (!el || el.tagName === 'INPUT' || el.querySelector('.inline-input')) return;
    if (typeof isCurrentlyEditing === 'function' && isCurrentlyEditing()) {
        const prev = document.querySelector('.inline-input');
        if (prev) prev.blur();
    }

    const ctrl = controllers.find(c => c.serialNumber === serial);
    const door = ctrl?.doors?.find(d => d.id === doorId);
    const currentName = door?.name || `Door ${doorId}`;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'inline-input';
    input.value = currentName;
    input.style.width = '160px';
    input.setAttribute('data-serial', serial);
    input.setAttribute('data-door', doorId);

    activeInlineEditElement = input;
    let finished = false;

    const finish = (finalName) => {
        if (finished) return;
        finished = true;
        activeInlineEditElement = null;
        el.innerHTML = `${esc(finalName)} <i class="fa-solid fa-pen inline-editable-icon" data-fn="startInlineEditDoorName" data-a1="${serial}" data-a2="${doorId}" data-el="parent" data-requires="write" style="font-size: 9px;" title="Rename door"></i>`;
        if (input.parentNode) input.replaceWith(el);
    };

    const save = async () => {
        if (finished) return;
        const newName = input.value.trim();
        if (!newName || newName === currentName) { finish(currentName); return; }
        if (!canUiWrite()) { finish(currentName); return; }
        finish(newName);
        await postControllerUpdate(`/api/controllers/${serial}/door`, { doorNumber: doorId, name: newName }, `Door ${doorId} renamed to "${newName}".`, currentName, finish);
    };

    setupInlineInputListeners(input, currentName, finish, save);
    el.replaceWith(input);
    input.focus();
    input.select();
}

function startInlineEditDoorDelay(serial, doorId, el) {
    if (!requireUiWrite()) return;
    if (!el || el.tagName === 'INPUT') return;
    if (typeof isCurrentlyEditing === 'function' && isCurrentlyEditing()) {
        const prev = document.querySelector('.inline-input');
        if (prev) prev.blur();
    }

    const ctrl = controllers.find(c => c.serialNumber === serial);
    const door = ctrl?.doors?.find(d => d.id === doorId);
    const currentDelay = door?.delay !== undefined ? door.delay : 3;

    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'inline-input';
    input.min = '1';
    input.max = '60';
    input.value = currentDelay;
    input.style.width = '50px';

    activeInlineEditElement = input;
    let finished = false;

    const finish = (finalDelay) => {
        if (finished) return;
        finished = true;
        activeInlineEditElement = null;
        el.innerHTML = `${esc(finalDelay)}s <i class="fa-solid fa-pen inline-editable-icon" data-fn="startInlineEditDoorDelay" data-a1="${serial}" data-a2="${doorId}" data-el="parent" data-requires="write"></i>`;
        if (input.parentNode) input.replaceWith(el);
    };

    const save = async () => {
        if (finished) return;
        const newDelay = parseInt(input.value, 10);
        if (isNaN(newDelay) || newDelay < 1 || newDelay > 60 || newDelay === currentDelay) { finish(currentDelay); return; }
        if (!canUiWrite()) { finish(currentDelay); return; }
        finish(newDelay);
        await postControllerUpdate(`/api/controllers/${serial}/door`, { doorNumber: doorId, delay: newDelay }, `Door ${doorId} delay updated to ${newDelay}s (saved to hardware).`, currentDelay, finish);
    };

    setupInlineInputListeners(input, currentDelay, finish, save);
    el.replaceWith(input);
    input.focus();
    input.select();
}

function startInlineEditDoorMode(serial, doorId, el) {
    if (!requireUiWrite()) return;
    if (window.currentEmergencyState === 'EMERGENCY_OPEN') {
        showToast('Cannot lock door: Facility Emergency Open is active.', 'warning');
        return;
    }
    if (window.currentEmergencyState === 'LOCKDOWN') {
        showToast('Cannot change door mode: Facility Lockdown is active.', 'warning');
        return;
    }
    if (!el || el.tagName === 'SELECT') return;
    if (typeof isCurrentlyEditing === 'function' && isCurrentlyEditing()) {
        const prev = document.querySelector('.inline-input');
        if (prev) prev.blur();
    }

    const ctrl = controllers.find(c => c.serialNumber === serial);
    const door = ctrl?.doors?.find(d => d.id === doorId);
    const currentMode = door?.mode || 'Controlled';

    const sel = document.createElement('select');
    sel.className = 'inline-input';
    sel.innerHTML = `
        <option value="Controlled" ${currentMode === 'Controlled' ? 'selected' : ''}>Controlled</option>
        <option value="NormallyOpen" ${currentMode === 'NormallyOpen' ? 'selected' : ''}>Normally Open</option>
        <option value="NormallyClosed" ${currentMode === 'NormallyClosed' ? 'selected' : ''}>Normally Closed</option>
    `;

    activeInlineEditElement = sel;
    let finished = false;

    const finish = (finalMode) => {
        if (finished) return;
        finished = true;
        activeInlineEditElement = null;
        el.innerHTML = `${esc(finalMode)} <i class="fa-solid fa-caret-down inline-editable-icon" data-fn="startInlineEditDoorMode" data-a1="${serial}" data-a2="${doorId}" data-el="parent" data-requires="write"></i>`;
        if (sel.parentNode) sel.replaceWith(el);
    };

    const save = async () => {
        if (finished) return;
        const newMode = sel.value;
        if (newMode === currentMode) { finish(currentMode); return; }
        if (!canUiWrite()) { finish(currentMode); return; }
        finish(newMode);
        await postControllerUpdate(`/api/controllers/${serial}/door`, { doorNumber: doorId, mode: newMode }, `Door ${doorId} mode updated to ${newMode} (saved to hardware).`, currentMode, finish);
    };

    sel.addEventListener('change', () => { save(); });
    sel.addEventListener('blur', () => { save(); });
    sel.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); finish(currentMode); }
    });

    el.replaceWith(sel);
    sel.focus();
}

async function toggleInlineDoorSensor(serial, doorId) {
    if (!requireUiWrite()) return;
    const ctrl = controllers.find(c => c.serialNumber === serial);
    const door = ctrl?.doors?.find(d => d.id === doorId);
    if (!door) return;

    const newSensorEnabled = !(door.sensorEnabled === true);
    await postControllerUpdate(
        `/api/controllers/${serial}/door`,
        { doorNumber: doorId, sensorEnabled: newSensorEnabled },
        newSensorEnabled ? `Door ${doorId}: Sensor monitoring ENABLED (reads SEN terminal).` : `Door ${doorId}: Set to NO SENSOR WIRED (ignores open circuit).`,
        !newSensorEnabled,
        () => {}
    );
}

async function toggleReaderKeypad(serial, reader, checkboxEl) {
    if (!requireUiWrite()) return;
    const cb = checkboxEl || document.getElementById('door-keypad-toggle');
    if (!cb) return;
    const ctrl = controllers.find(c => c.serialNumber === serial);
    if (!ctrl) return;

    const next = cb.checked === true;
    const previous = !next;
    const stateEl = document.getElementById('door-keypad-state');

    cb.disabled = true;
    if (stateEl) stateEl.textContent = 'Keypad: Saving...';

    const result = await setReaderKeypads(serial, reader, next);

    if (result && result.success) {
        if (stateEl) {
            stateEl.textContent = next ? 'Keypad: Enabled' : 'Keypad: Disabled';
            stateEl.classList.toggle('is-off', !next);
        }
        showToast(`Door ${reader} keypad ${next ? 'enabled' : 'disabled'} (saved to hardware).`, 'success');
    } else {
        cb.checked = previous;
        if (stateEl) {
            stateEl.textContent = previous ? 'Keypad: Enabled' : 'Keypad: Disabled';
            stateEl.classList.toggle('is-off', !previous);
        }
    }
    cb.disabled = false;
}

function readDoorPasscodeAdditions() {
    const el = document.getElementById('door-passcodes-input');
    const raw = el ? String(el.value).trim() : '';
    if (raw === '') return { error: 'Enter at least one new passcode (4-8 digits).' };
    const tokens = raw.split(/[\s,;]+/).filter(Boolean);
    if (tokens.length > 4) {
        return { error: 'Maximum 4 new passcodes at once.' };
    }
    const values = [];
    for (let i = 0; i < tokens.length; i++) {
        const tok = tokens[i];
        if (!/^\d+$/.test(tok)) {
            return { error: `Passcode ${i + 1} must be digits only (4-8 digits).` };
        }
        const n = parseInt(tok, 10);
        if (n < 1000 || n > 99999999) {
            return { error: `Passcode ${i + 1} must be 4-8 digits (1000-99999999).` };
        }
        if (values.includes(n)) {
            return { error: `Duplicate passcode ${n}.` };
        }
        values.push(n);
    }
    return { values };
}

function getDoorActivePasscodes(serial, doorNumber) {
    const ctrl = (typeof controllers !== 'undefined' && Array.isArray(controllers))
        ? controllers.find(c => c.serialNumber === serial)
        : null;
    const door = ctrl && Array.isArray(ctrl.doors) ? ctrl.doors.find(d => d.id === doorNumber) : null;
    return door && Array.isArray(door.passcodes)
        ? door.passcodes.map(v => parseInt(v, 10)).filter(v => Number.isInteger(v) && v > 0)
        : [];
}

function padPasscodes(active) {
    const padded = active.slice(0, 4);
    while (padded.length < 4) padded.push(0);
    return padded;
}

async function saveDoorPasscodes(serial, doorNumber, btnEl) {
    if (!requireUiWrite()) return;
    const parsed = readDoorPasscodeAdditions();
    if (parsed.error) {
        showToast(parsed.error, 'warning');
        return;
    }

    const existing = getDoorActivePasscodes(serial, doorNumber);
    const merged = existing.slice();
    parsed.values.forEach(code => {
        if (!merged.includes(code)) merged.push(code);
    });
    if (merged.length > 4) {
        showToast(`Door ${doorNumber} already has ${existing.length} passcode(s); a door supports at most 4. Ask a superadmin to delete some first.`, 'warning');
        return;
    }

    const btn = btnEl || document.getElementById('btn-save-door-passcodes');
    const originalHtml = btn ? btn.innerHTML : '';
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Saving...</span>';
    }

    const result = await setDoorPasscodes(serial, doorNumber, padPasscodes(merged));

    if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalHtml;
    }
    if (result && result.success) {
        const input = document.getElementById('door-passcodes-input');
        if (input) input.value = '';
        showToast(`Door ${doorNumber} passcodes saved (${merged.length} active).`, 'success');
        if (typeof openDoorConfigModal === 'function') openDoorConfigModal(serial, doorNumber);
    }
}

async function deleteDoorPasscode(serial, doorNumber, code) {
    if (!requireUiWrite()) return;
    const existing = getDoorActivePasscodes(serial, doorNumber);
    const remaining = existing.filter(c => c !== code);
    const result = await setDoorPasscodes(serial, doorNumber, padPasscodes(remaining));
    if (result && result.success) {
        showToast(`Passcode deleted from door ${doorNumber}.`, 'success');
        if (typeof openDoorConfigModal === 'function') openDoorConfigModal(serial, doorNumber);
    }
}

// Global window bindings
window.getUiAuthRole = getUiAuthRole;
window.canUiWrite = canUiWrite;
window.canUiAdminister = canUiAdminister;
window.requireUiWrite = requireUiWrite;
window.startInlineEditControllerName = startInlineEditControllerName;
window.toggleControllerEnabled = toggleControllerEnabled;
window.toggleReaderKeypad = toggleReaderKeypad;
window.saveDoorPasscodes = saveDoorPasscodes;
window.deleteDoorPasscode = deleteDoorPasscode;
window.startInlineEditDoorName = startInlineEditDoorName;
window.startInlineEditDoorDelay = startInlineEditDoorDelay;
window.startInlineEditDoorMode = startInlineEditDoorMode;
window.toggleInlineDoorSensor = toggleInlineDoorSensor;

window.addEventListener('auth-role-changed', function () {
    if (canUiWrite()) return;
    if (typeof closeDoorModal === 'function') closeDoorModal();
    if (typeof closeUserModal === 'function') closeUserModal();
    if (typeof closeBatchPrivilegeModal === 'function') closeBatchPrivilegeModal();
    if (typeof closeEmergencyModal === 'function') closeEmergencyModal();
    if (typeof closeClearEventsModal === 'function') closeClearEventsModal();
    const activeInput = document.querySelector('.inline-input');
    if (activeInput) activeInput.blur();
});

if (typeof window.scanNetwork === 'function' && !window._scanNetworkUiGuarded) {
    const scanNetworkImpl = window.scanNetwork;
    window._scanNetworkUiGuarded = true;
    window.scanNetwork = function () {
        if (!canUiWrite()) return undefined;
        return scanNetworkImpl.apply(this, arguments);
    };
}
