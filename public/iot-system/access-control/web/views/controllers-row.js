/**
 * ACCESS Professional - Controllers & Doors Row / Card Elements
 * Shared DOM builders for hardware metadata, door parameter chips, and in-place DOM updates.
 */

function buildHardwareMetaDrawerHtml(ctrl, isExpanded) {
    return `
        <div class="hardware-meta-drawer ${isExpanded ? 'expanded' : ''}">
            <div class="meta-item">
                <label>IP Address & Port</label>
                <span id="ctrl-ip-drawer-${ctrl.serialNumber}">${esc(ctrl.ip)}:${esc(ctrl.port || 60000)}</span>
            </div>
            <div class="meta-item">
                <label>Subnet & Gateway</label>
                <span>${esc(ctrl.subnetMask)} / ${esc(ctrl.gateway)}</span>
            </div>
            <div class="meta-item">
                <label>MAC Address</label>
                <span>${esc(ctrl.mac || 'N/A')}</span>
            </div>
            <div class="meta-item">
                <label>Firmware Version</label>
                <span>${esc(ctrl.firmware || 'v8.42')}</span>
            </div>
            <div class="meta-item" style="grid-column: 1 / -1; display: flex; justify-content: space-between; align-items: center; margin-top: 4px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.06);">
                <label style="margin: 0;"><i class="fa-solid fa-clock" style="color: var(--accent-cyan); margin-right: 4px;"></i> Hardware Clock</label>
                <button class="btn btn-outline" style="font-size: 10px; padding: 3px 8px;" 
                        data-fn="syncControllerClock" data-a1="${ctrl.serialNumber}" data-requires="write" title="Sync controller clock with server time">
                    Sync Clock
                </button>
            </div>
        </div>
    `;
}

function updateControllerDomInPlace(ctrl) {
    if (!ctrl || !ctrl.serialNumber) return;
    const serial = ctrl.serialNumber;

    const card = document.getElementById(`card-ctrl-${serial}`);
    if (card) {
        const isUnreachable = ctrl.status === 'UNREACHABLE';
        const isOffline = ctrl.status === 'OFFLINE' || ctrl.status === 'UNCONNECTED' || isUnreachable;
        const isUnscanned = ctrl.scanned === false || ctrl.status === 'UNSCANNED';
        const isEnabled = isControllerEnabled(ctrl);
        const statusBadgeClass = isOffline ? 'badge-offline' : (isUnscanned ? 'badge-unscanned' : '');
        const statusText = isUnscanned ? 'UNSCANNED' : (ctrl.status || 'ONLINE');

        const statusEl = document.getElementById(`ctrl-status-${serial}`) || document.getElementById(`ctrl-status-det-${serial}`);
        if (statusEl) {
            statusEl.textContent = statusText;
            statusEl.className = `badge-status ${statusBadgeClass}`.trim();
        }
        card.classList.toggle('card-offline', isOffline || isUnscanned);
        card.classList.toggle('card-disabled', !isEnabled);

        const disabledBadge = document.getElementById(`ctrl-disabled-${serial}`) || document.getElementById(`ctrl-disabled-det-${serial}`);
        if (disabledBadge) disabledBadge.style.display = isEnabled ? 'none' : '';

        const toggleBtn = document.getElementById(`btn-toggle-enabled-${serial}`) || document.getElementById(`btn-toggle-enabled-det-${serial}`);
        if (toggleBtn) {
            toggleBtn.innerHTML = `<i class="fa-solid ${isEnabled ? 'fa-toggle-on' : 'fa-toggle-off'}"></i> <span>${isEnabled ? 'Disable' : 'Enable'}</span>`;
            toggleBtn.title = isEnabled ? 'Disable this controller' : 'Enable this controller';
        }

        const ipPill = document.getElementById(`ctrl-ip-${serial}`) || document.getElementById(`ctrl-ip-det-${serial}`);
        if (ipPill) ipPill.innerHTML = `<i class="fa-solid fa-network-wired"></i> ${esc(ctrl.ip)}:${esc(ctrl.port || 60000)}`;
        const ipDrawer = document.getElementById(`ctrl-ip-drawer-${serial}`);
        if (ipDrawer) ipDrawer.textContent = `${ctrl.ip}:${ctrl.port || 60000}`;

        const nameEl = document.getElementById(`ctrl-name-${serial}`) || document.getElementById(`ctrl-name-det-${serial}`);
        if (nameEl && !nameEl.querySelector('input') && nameEl.tagName !== 'INPUT' && activeInlineEditElement?.getAttribute('data-serial') !== String(serial)) {
            nameEl.innerHTML = `${esc(ctrl.name)} <i class="fa-solid fa-pen inline-editable-icon" data-fn="startInlineEditControllerName" data-a1="${serial}" data-el="parent" data-requires="write" style="font-size: 10px;" title="Rename controller"></i>`;
        }

        (ctrl.doors || []).forEach(door => {
            const hasSensor = door.sensorEnabled === true;
            const isDoorOpen = hasSensor ? door.open : !door.locked;
            const isLocked = door.locked !== false;
            const isLockdown = door.mode === 'NormallyClosed';
            const isAlwaysOpen = door.mode === 'NormallyOpen';

            let modeBadge = '';
            if (isLockdown) {
                modeBadge = `<span class="badge-lockdown-indicator" title="Permanent lockdown active"><i class="fa-solid fa-lock"></i> LOCKDOWN</span>`;
            } else if (isAlwaysOpen) {
                modeBadge = `<span class="badge-open-indicator" title="Emergency hold open"><i class="fa-solid fa-door-open"></i> HELD OPEN</span>`;
            }

            const tile = document.getElementById(`door-tile-${serial}-${door.id}`);
            if (tile) {
                tile.classList.toggle('tile-lockdown', isLockdown);
                tile.classList.toggle('door-state-open', isDoorOpen);

                const iconEl = document.getElementById(`door-icon-${serial}-${door.id}`);
                if (iconEl) {
                    iconEl.className = `door-icon ${isDoorOpen ? 'open' : ''} ${isLockdown ? 'lockdown' : ''}`;
                    iconEl.title = isDoorOpen ? 'Door is OPEN' : 'Door is Closed';
                    iconEl.innerHTML = `<i class="fa-solid ${isLockdown ? 'fa-shield-halved' : (isDoorOpen ? 'fa-door-open' : 'fa-door-closed')}"></i>`;
                }

                const doorNameEl = document.getElementById(`door-name-${serial}-${door.id}`);
                if (doorNameEl && !doorNameEl.querySelector('input') && doorNameEl.tagName !== 'INPUT' && 
                    (activeInlineEditElement?.getAttribute('data-door') !== String(door.id) || activeInlineEditElement?.getAttribute('data-serial') !== String(serial))) {
                    doorNameEl.innerHTML = `${esc(door.name || 'Door ' + door.id)} <i class="fa-solid fa-pen inline-editable-icon" data-fn="startInlineEditDoorName" data-a1="${serial}" data-a2="${door.id}" data-el="parent" data-requires="write" style="font-size: 9px;" title="Rename door"></i>`;
                }

                const statusEl = document.getElementById(`door-status-${serial}-${door.id}`) || document.getElementById(`door-status-det-${serial}-${door.id}`);
                if (statusEl) {
                    if (isOffline || isUnscanned) {
                        statusEl.innerHTML = `<span class="door-status-pill status-unreachable" title="${isUnscanned ? 'Unscanned' : (isUnreachable ? 'Unreachable' : 'Offline')}"><i class="fa-solid fa-triangle-exclamation"></i></span>`;
                    } else if (modeBadge) {
                        statusEl.innerHTML = modeBadge;
                    } else {
                        statusEl.innerHTML = `<span class="door-status-pill ${isLocked ? 'status-locked' : 'status-unlocked'}" title="${isLocked ? 'Locked' : 'Unlocked'}"><i class="fa-solid ${isLocked ? 'fa-lock' : 'fa-lock-open'}"></i></span>`;
                    }
                }

                const modeEl = document.getElementById(`door-mode-${serial}-${door.id}`);
                if (modeEl && !modeEl.querySelector('select') && modeEl.tagName !== 'SELECT') {
                    modeEl.innerHTML = `${esc(door.mode || 'Controlled')} <i class="fa-solid fa-caret-down inline-editable-icon" data-fn="startInlineEditDoorMode" data-a1="${serial}" data-a2="${door.id}" data-el="parent" data-requires="write"></i>`;
                }

                const delayEl = document.getElementById(`door-delay-${serial}-${door.id}`);
                if (delayEl && !delayEl.querySelector('input') && delayEl.tagName !== 'INPUT') {
                    delayEl.innerHTML = `${door.delay !== undefined ? door.delay : 3}s <i class="fa-solid fa-pen inline-editable-icon" data-fn="startInlineEditDoorDelay" data-a1="${serial}" data-a2="${door.id}" data-el="parent" data-requires="write"></i>`;
                }

                const lockBtn = document.getElementById(`btn-lock-${serial}-${door.id}`);
                if (lockBtn) {
                    lockBtn.setAttribute('data-requires', 'write');
                    lockBtn.className = isLockdown ? 'btn btn-danger-solid btn-lock-action' : 'btn btn-outline-danger btn-lock-action';
                    lockBtn.innerHTML = isLockdown ? '<i class="fa-solid fa-lock"></i> <span>Locked</span>' : '<i class="fa-solid fa-lock"></i> <span>Lock</span>';
                    lockBtn.title = isLockdown ? 'Lockdown active: Door is permanently locked. Click to release.' : 'Permanently lock this door (rejects all cards/PINs)';
                }
            }

            const row = document.getElementById(`door-row-${serial}-${door.id}`);
            if (row) {
                row.classList.toggle('tile-lockdown', isLockdown);
                row.classList.toggle('door-state-open', isDoorOpen);

                const iconEl = row.querySelector('.door-icon');
                if (iconEl) {
                    iconEl.className = `door-icon ${isDoorOpen ? 'open' : ''} ${isLockdown ? 'lockdown' : ''}`;
                    iconEl.innerHTML = `<i class="fa-solid ${isLockdown ? 'fa-shield-halved' : (isDoorOpen ? 'fa-door-open' : 'fa-door-closed')}"></i>`;
                }

                const doorNameEl = document.getElementById(`door-name-det-${serial}-${door.id}`);
                if (doorNameEl && !doorNameEl.querySelector('input') && doorNameEl.tagName !== 'INPUT' && 
                    (activeInlineEditElement?.getAttribute('data-door') !== String(door.id) || activeInlineEditElement?.getAttribute('data-serial') !== String(serial))) {
                    doorNameEl.innerHTML = `${esc(door.name || 'Door ' + door.id)} <i class="fa-solid fa-pen inline-editable-icon" data-fn="startInlineEditDoorName" data-a1="${serial}" data-a2="${door.id}" data-el="parent" data-requires="write" style="font-size: 9px;" title="Rename door"></i>`;
                }

                const pill = row.querySelector('.door-status-pill');
                if (pill) {
                    if (isOffline || isUnscanned) {
                        pill.className = 'door-status-pill status-unreachable';
                        pill.title = isUnscanned ? 'Unscanned' : (isUnreachable ? 'Unreachable' : 'Offline');
                        pill.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i>`;
                    } else {
                        pill.className = `door-status-pill ${isLocked ? 'status-locked' : 'status-unlocked'}`;
                        pill.title = isLocked ? 'Locked' : 'Unlocked';
                        pill.innerHTML = `<i class="fa-solid ${isLocked ? 'fa-lock' : 'fa-lock-open'}"></i>`;
                    }
                }

                const rowLockBtn = document.getElementById(`btn-lock-${serial}-${door.id}`);
                if (rowLockBtn) {
                    rowLockBtn.className = isLockdown ? 'btn btn-danger-solid btn-lock-action' : 'btn btn-outline-danger btn-lock-action';
                    rowLockBtn.innerHTML = isLockdown ? '<i class="fa-solid fa-lock"></i> <span>Locked</span>' : '<i class="fa-solid fa-lock"></i> <span>Lock</span>';
                }
            }
        });
    } else if (controllersViewMode !== 'table') {
        if (typeof isCurrentlyEditing === 'function' && !isCurrentlyEditing()) {
            renderControllers();
        }
    }

    if (controllersViewMode === 'table') {
        const isEnabled = isControllerEnabled(ctrl);
        const ctrlNameTbl = document.getElementById(`ctrl-name-tbl-${serial}`);
        if (ctrlNameTbl && !ctrlNameTbl.querySelector('input') && ctrlNameTbl.tagName !== 'INPUT') {
            ctrlNameTbl.innerHTML = `${esc(ctrl.name)} <i class="fa-solid fa-pen inline-editable-icon" data-fn="startInlineEditControllerName" data-a1="${serial}" data-el="parent" data-requires="write" style="font-size: 9px;" title="Rename controller"></i>`;
        }
        document.querySelectorAll(`[data-ctrl-ip="${serial}"]`).forEach(el => { el.textContent = ctrl.ip; });
        document.querySelectorAll(`[data-ctrl-disabled="${serial}"]`).forEach(el => {
            el.style.display = isEnabled ? 'none' : '';
        });
        document.querySelectorAll(`[data-ctrl-toggle="${serial}"]`).forEach(el => {
            el.innerHTML = `<i class="fa-solid ${isEnabled ? 'fa-toggle-on' : 'fa-toggle-off'}"></i> <span>${isEnabled ? 'Disable' : 'Enable'}</span>`;
            el.title = isEnabled ? 'Disable this controller' : 'Enable this controller';
        });
        (ctrl.doors || []).forEach(door => {
            const doorNameTbl = document.getElementById(`door-name-tbl-${serial}-${door.id}`);
            if (doorNameTbl && !doorNameTbl.querySelector('input') && doorNameTbl.tagName !== 'INPUT') {
                doorNameTbl.innerHTML = `${esc(door.name || 'Door ' + door.id)} <i class="fa-solid fa-pen inline-editable-icon" data-fn="startInlineEditDoorName" data-a1="${serial}" data-a2="${door.id}" data-el="parent" data-requires="write" style="font-size: 9px;" title="Rename door"></i>`;
            }
        });
    }
}

// Global window bindings
window.buildHardwareMetaDrawerHtml = buildHardwareMetaDrawerHtml;
window.updateControllerDomInPlace = updateControllerDomInPlace;
