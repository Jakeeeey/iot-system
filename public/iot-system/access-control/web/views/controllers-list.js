/**
 * ACCESS Professional - Controllers Fleet Table & Filtering
 * Renders unified controllers/doors list table view, search filtering, and door action buttons.
 */

function getControllersSearchTerm() {
    return (document.getElementById('controllers-search-input')?.value || '').toLowerCase().trim();
}

function filterControllers() {
    let list = controllers.filter(isScannedController);
    const term = getControllersSearchTerm();
    if (term) {
        list = list.filter(ctrl => {
            const matchesCtrl = (ctrl.name || '').toLowerCase().includes(term) ||
                String(ctrl.serialNumber).includes(term) ||
                (ctrl.ip || '').includes(term) ||
                (ctrl.location || '').toLowerCase().includes(term);
            if (matchesCtrl) return true;
            return (ctrl.doors || []).some(d => 
                (d.name || '').toLowerCase().includes(term) ||
                String(d.id) === term
            );
        });
    }
    return list.slice().sort((a, b) => {
        const aOff = (a.status === 'OFFLINE' || a.status === 'UNCONNECTED' || a.status === 'UNREACHABLE' || a.status === 'UNSCANNED' || a.scanned === false) ? 1 : 0;
        const bOff = (b.status === 'OFFLINE' || b.status === 'UNCONNECTED' || b.status === 'UNREACHABLE' || b.status === 'UNSCANNED' || b.scanned === false) ? 1 : 0;
        if (aOff !== bOff) return aOff - bOff;
        return (a.serialNumber || 0) - (b.serialNumber || 0);
    });
}

function renderControllersTable(list) {
    const tbody = document.getElementById('controllers-table-body');
    if (!tbody) return;

    const rows = [];
    list.forEach(ctrl => {
        const isUnreachable = ctrl.status === 'UNREACHABLE';
        const isOffline = ctrl.status === 'OFFLINE' || ctrl.status === 'UNCONNECTED' || isUnreachable;
        const isUnscanned = ctrl.scanned === false || ctrl.status === 'UNSCANNED';
        const isEnabled = isControllerEnabled(ctrl);
        const statusBadgeClass = isOffline ? 'badge-offline' : (isUnscanned ? 'badge-unscanned' : '');

        (ctrl.doors || []).forEach(door => {
            const isFirstDoor = (ctrl.doors || [])[0]?.id === door.id;
            const hasSensor = door.sensorEnabled === true;
            const isDoorOpen = hasSensor ? door.open : !door.locked;
            const isLocked = door.locked !== false;

            const recentLog = auditLogs.find(l => 
                String(l.serialNumber) === String(ctrl.serialNumber) && 
                (l.doorNumber === door.id || l.doorName === door.name)
            );

            let lastEventText = '<span style="color: var(--text-dim);">No recent activity</span>';
            if (recentLog) {
                const timeStr = new Date(recentLog.timestamp).toLocaleTimeString();
                const granted = recentLog.granted !== false;
                const col = granted ? 'var(--accent-primary)' : 'var(--accent-danger)';
                lastEventText = `<b style="color: var(--text-heading);">${esc(timeStr)}</b>: <span style="color: ${col};">${esc(recentLog.userName || (recentLog.cardNumber ? '#' + recentLog.cardNumber : recentLog.type))}</span>`;
            }

            rows.push(`
                <tr id="door-row-tbl-${ctrl.serialNumber}-${door.id}">
                    <td>
                        <div style="font-weight: 600; color: var(--text-heading);">
                            <span class="inline-editable" 
                                  id="ctrl-name-tbl-${ctrl.serialNumber}"
                                  data-fn="startInlineEditControllerName" data-dbl="startInlineEditControllerName" data-a1="${ctrl.serialNumber}" data-el="self"
                                  style="cursor: pointer;"
                                  title="Click to rename controller">
                                ${esc(ctrl.name)}
                                <i class="fa-solid fa-pen inline-editable-icon" 
                                   data-fn="startInlineEditControllerName" data-a1="${ctrl.serialNumber}" data-el="parent" data-requires="write"
                                   style="font-size: 9px;" title="Rename controller"></i>
                            </span>
                        </div>
                        <div style="font-size: 11px; color: var(--text-dim); font-family: var(--font-mono);"><span data-ctrl-ip="${ctrl.serialNumber}">${esc(ctrl.ip)}</span> · SN:${ctrl.serialNumber} <span class="badge-status ${statusBadgeClass}" style="margin-left: 6px;">${esc(statusText)}</span> <span class="badge-status badge-disabled" data-ctrl-disabled="${ctrl.serialNumber}" style="margin-left: 6px; ${isEnabled ? 'display: none;' : ''}" title="Controller disabled: excluded from access and emergency actions">DISABLED</span></div>
                    </td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div class="door-icon ${isDoorOpen ? 'open' : ''}" id="door-icon-tbl-${ctrl.serialNumber}-${door.id}" 
                                 data-fn="openDoorConfigModal" data-a1="${ctrl.serialNumber}" data-a2="${door.id}"
                                 style="width: 28px; height: 28px; font-size: 11px; cursor: pointer;" title="Configure Door ${door.id} Settings">
                                <i class="fa-solid ${isDoorOpen ? 'fa-door-open' : 'fa-door-closed'}"></i>
                            </div>
                            <span class="door-num-badge" data-fn="openDoorConfigModal" data-a1="${ctrl.serialNumber}" data-a2="${door.id}" style="cursor: pointer;" title="Configure Door ${door.id}">D${door.id}</span>
                            <span class="inline-editable door-display-name" 
                                  id="door-name-tbl-${ctrl.serialNumber}-${door.id}"
                                  data-fn="startInlineEditDoorName" data-dbl="startInlineEditDoorName" data-a1="${ctrl.serialNumber}" data-a2="${door.id}" data-el="self"
                                  style="cursor: pointer;"
                                  title="Click to rename door">
                                ${esc(door.name || 'Door ' + door.id)}
                                <i class="fa-solid fa-pen inline-editable-icon" 
                                   data-fn="startInlineEditDoorName" data-a1="${ctrl.serialNumber}" data-a2="${door.id}" data-el="parent" data-requires="write"
                                   style="font-size: 9px;" title="Rename door"></i>
                            </span>
                        </div>
                    </td>
                    <td>
                        ${(isOffline || isUnscanned) ? `<span class="door-status-pill status-unreachable"><i class="fa-solid fa-triangle-exclamation"></i> ${isUnscanned ? 'Unscanned' : (isUnreachable ? 'Unreachable' : 'Offline')}</span>` : `<span class="door-status-pill ${isLocked ? 'status-locked' : 'status-unlocked'}" id="door-status-tbl-${ctrl.serialNumber}-${door.id}"><i class="fa-solid ${isLocked ? 'fa-lock' : 'fa-lock-open'}"></i> ${isLocked ? 'Locked' : 'Unlocked'}</span>`}
                        ${door.mode === 'NormallyClosed' ? '<div style="margin-top: 4px;"><span class="badge-lockdown-indicator"><i class="fa-solid fa-lock"></i> LOCKDOWN</span></div>' : ''}
                        ${door.mode === 'NormallyOpen' ? '<div style="margin-top: 4px;"><span class="badge-open-indicator"><i class="fa-solid fa-door-open"></i> HELD OPEN</span></div>' : ''}
                    </td>
                    <td>
                        <span class="inline-editable" style="color: var(--accent-cyan); cursor: pointer;"
                              id="door-mode-tbl-${ctrl.serialNumber}-${door.id}"
                              data-fn="startInlineEditDoorMode" data-dbl="startInlineEditDoorMode" data-a1="${ctrl.serialNumber}" data-a2="${door.id}" data-el="self"
                              title="Click to change mode">
                            ${esc(door.mode || 'Controlled')}
                            <i class="fa-solid fa-caret-down inline-editable-icon" data-fn="startInlineEditDoorMode" data-a1="${ctrl.serialNumber}" data-a2="${door.id}" data-el="parent" data-requires="write"></i>
                        </span>
                    </td>
                    <td>
                        <b class="inline-editable" style="color: var(--text-heading); cursor: pointer;"
                           id="door-delay-tbl-${ctrl.serialNumber}-${door.id}"
                           data-fn="startInlineEditDoorDelay" data-dbl="startInlineEditDoorDelay" data-a1="${ctrl.serialNumber}" data-a2="${door.id}" data-el="self"
                           title="Click to change delay">
                            ${door.delay !== undefined ? door.delay : 3}s
                            <i class="fa-solid fa-pen inline-editable-icon" data-fn="startInlineEditDoorDelay" data-a1="${ctrl.serialNumber}" data-a2="${door.id}" data-el="parent" data-requires="write"></i>
                        </b>
                    </td>
                    <td style="font-size: 11px;">
                        ${lastEventText}
                    </td>
                    <td style="text-align: right;">
                        <div style="display: flex; gap: 6px; justify-content: flex-end;">
                            ${isFirstDoor ? `<button class="btn btn-outline btn-toggle-enabled" style="padding: 4px 8px; font-size: 11px;" data-fn="toggleControllerEnabled" data-a1="${ctrl.serialNumber}" data-ctrl-toggle="${ctrl.serialNumber}" data-requires="write" title="${isEnabled ? 'Disable this controller' : 'Enable this controller'}"><i class="fa-solid ${isEnabled ? 'fa-toggle-on' : 'fa-toggle-off'}"></i> <span>${isEnabled ? 'Disable' : 'Enable'}</span></button>` : ''}
                            ${door.mode === 'NormallyClosed' 
                                ? `<button class="btn btn-danger-solid btn-lock-action" id="btn-lock-${ctrl.serialNumber}-${door.id}" style="padding: 4px 8px; font-size: 11px;" data-fn="toggleDoorLockdown" data-a1="${ctrl.serialNumber}" data-a2="${door.id}" data-requires="write" title="Release Lockdown"><i class="fa-solid fa-lock"></i> <span>Locked</span></button>`
                                : `<button class="btn btn-outline-danger btn-lock-action" id="btn-lock-${ctrl.serialNumber}-${door.id}" style="padding: 4px 8px; font-size: 11px;" data-fn="toggleDoorLockdown" data-a1="${ctrl.serialNumber}" data-a2="${door.id}" data-requires="write" title="Lockdown Door (reject cards/PINs)"><i class="fa-solid fa-lock"></i> <span>Lock</span></button>`
                            }
                            <button class="btn btn-outline btn-gear-action" style="padding: 4px 8px; font-size: 11px;" 
                                    data-fn="openDoorConfigModal" data-a1="${ctrl.serialNumber}" data-a2="${door.id}" title="Door Settings">
                                <i class="fa-solid fa-gear"></i>
                            </button>
                            <button class="btn btn-primary btn-pulse-action" id="btn-pulse-${ctrl.serialNumber}-${door.id}" 
                                    style="padding: 4px 10px; font-size: 11px;" 
                                    data-fn="triggerRemoteOpen" data-a1="${ctrl.serialNumber}" data-a2="${door.id}" data-requires="write" title="Pulse unlock door">
                                <i class="fa-solid fa-unlock"></i> <span>Pulse</span>
                            </button>
                        </div>
                    </td>
                </tr>
            `);
        });
    });

    tbody.innerHTML = rows.join('');
}

// Global window bindings
window.getControllersSearchTerm = getControllersSearchTerm;
window.filterControllers = filterControllers;
window.renderControllersTable = renderControllersTable;
