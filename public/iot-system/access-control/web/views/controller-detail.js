/**
 * ACCESS Professional - Controller Detailed Panel View
 * Renders detailed accordion rows with technical specs and full door action controls.
 */

function toggleHardwareMeta(serial) {
    if (expandedHardwareSerials.has(serial)) {
        expandedHardwareSerials.delete(serial);
    } else {
        expandedHardwareSerials.add(serial);
    }
    const card = document.getElementById(`card-ctrl-${serial}`);
    if (card) {
        const isExp = expandedHardwareSerials.has(serial);
        const drawer = card.querySelector('.hardware-meta-drawer');
        const btn = card.querySelector('.meta-toggle-btn');
        if (drawer) drawer.classList.toggle('expanded', isExp);
        if (btn) btn.classList.toggle('expanded', isExp);
    } else {
        if (typeof renderControllers === 'function') renderControllers();
    }
}

function renderControllersDetailed(list) {
    const container = document.getElementById('controllers-container');
    if (!container) return;

    container.innerHTML = list.map(ctrl => {
        const isExpanded = !expandedHardwareSerials.has(ctrl.serialNumber);
        const isUnreachable = ctrl.status === 'UNREACHABLE';
        const isOffline = ctrl.status === 'OFFLINE' || ctrl.status === 'UNCONNECTED' || isUnreachable;
        const isUnscanned = ctrl.scanned === false || ctrl.status === 'UNSCANNED';
        const isEnabled = isControllerEnabled(ctrl);
        const statusBadgeClass = isOffline ? 'badge-offline' : (isUnscanned ? 'badge-unscanned' : '');
        const statusText = isUnscanned ? 'UNSCANNED' : (ctrl.status || 'ONLINE');

        const doorsHtml = (ctrl.doors || []).map(door => {
            const hasSensor = door.sensorEnabled === true;
            const isDoorOpen = hasSensor ? door.open : !door.locked;
            const isLocked = door.locked !== false;
            const isLockdown = door.mode === 'NormallyClosed';
            const isAlwaysOpen = door.mode === 'NormallyOpen';

            const lockdownBtn = isLockdown
                ? `<button class="btn btn-danger-solid btn-lock-action" id="btn-lock-${ctrl.serialNumber}-${door.id}" data-fn="toggleDoorLockdown" data-a1="${ctrl.serialNumber}" data-a2="${door.id}" data-requires="write" title="Release lockdown (resume Controlled mode)"><i class="fa-solid fa-lock"></i> <span>Locked</span></button>`
                : `<button class="btn btn-outline-danger btn-lock-action" id="btn-lock-${ctrl.serialNumber}-${door.id}" data-fn="toggleDoorLockdown" data-a1="${ctrl.serialNumber}" data-a2="${door.id}" data-requires="write" title="Permanently lock door until disabled (rejects all cards/PINs)"><i class="fa-solid fa-lock"></i> <span>Lock</span></button>`;

            let modeBadge = '';
            if (isLockdown) modeBadge = `<span class="badge-lockdown-indicator"><i class="fa-solid fa-lock"></i> LOCKDOWN</span>`;
            else if (isAlwaysOpen) modeBadge = `<span class="badge-open-indicator"><i class="fa-solid fa-door-open"></i> HELD OPEN</span>`;

            return `
            <div class="door-row ${isLockdown ? 'tile-lockdown' : ''} ${isDoorOpen ? 'door-state-open' : ''}" id="door-row-${ctrl.serialNumber}-${door.id}">
                <div class="door-info">
                    <div class="door-icon ${isDoorOpen ? 'open' : ''} ${isLockdown ? 'lockdown' : ''}" 
                         id="door-icon-det-${ctrl.serialNumber}-${door.id}"
                         data-fn="openDoorConfigModal" data-a1="${ctrl.serialNumber}" data-a2="${door.id}"
                         style="cursor: pointer;"
                         title="${isDoorOpen ? 'Door is OPEN' : 'Door is Closed'} (Click to configure)">
                        <i class="fa-solid ${isLockdown ? 'fa-shield-halved' : (isDoorOpen ? 'fa-door-open' : 'fa-door-closed')}"></i>
                    </div>
                    <div class="door-details-body">
                        <div class="door-title-row">
                            <span class="door-num-badge" data-fn="openDoorConfigModal" data-a1="${ctrl.serialNumber}" data-a2="${door.id}" style="cursor: pointer;" title="Configure Door ${door.id}">D${door.id}</span>
                            <span class="inline-editable door-display-name" 
                                  id="door-name-det-${ctrl.serialNumber}-${door.id}"
                                  data-fn="startInlineEditDoorName" data-dbl="startInlineEditDoorName" data-a1="${ctrl.serialNumber}" data-a2="${door.id}" data-el="self"
                                  style="cursor: pointer;"
                                  title="Click to rename door">
                                ${esc(door.name || 'Door ' + door.id)}
                                <i class="fa-solid fa-pen inline-editable-icon" 
                                   data-fn="startInlineEditDoorName" data-a1="${ctrl.serialNumber}" data-a2="${door.id}" data-el="parent" data-requires="write"
                                   style="font-size: 9px;" title="Rename door"></i>
                            </span>
                            ${modeBadge}
                            ${(isOffline || isUnscanned) ? `<span class="door-status-pill status-unreachable" title="${isUnscanned ? 'Unscanned' : (isUnreachable ? 'Unreachable' : 'Offline')}"><i class="fa-solid fa-triangle-exclamation"></i></span>` : `<span class="door-status-pill ${isLocked ? 'status-locked' : 'status-unlocked'}" title="${isLocked ? 'Locked' : 'Unlocked'}"><i class="fa-solid ${isLocked ? 'fa-lock' : 'fa-lock-open'}"></i></span>`}
                        </div>
                        <div class="compact-tile-params detailed-params-row">
                            <div class="door-param-chip" title="Access Mode (Click to change)">
                                <i class="fa-solid fa-sliders chip-icon"></i>
                                <span class="chip-label">Mode:</span>
                                <span class="inline-editable chip-value" style="color: var(--accent-cyan); cursor: pointer;"
                                      id="door-mode-det-${ctrl.serialNumber}-${door.id}"
                                      data-fn="startInlineEditDoorMode" data-dbl="startInlineEditDoorMode" data-a1="${ctrl.serialNumber}" data-a2="${door.id}" data-el="self"
                                      title="Click to change mode">
                                    ${esc(door.mode || 'Controlled')}
                                    <i class="fa-solid fa-caret-down inline-editable-icon" data-fn="startInlineEditDoorMode" data-a1="${ctrl.serialNumber}" data-a2="${door.id}" data-el="parent" data-requires="write"></i>
                                </span>
                            </div>
                            <div class="door-param-chip" title="Relay Delay Seconds (Click to change)">
                                <i class="fa-solid fa-stopwatch chip-icon"></i>
                                <span class="chip-label">Delay:</span>
                                <b class="inline-editable chip-value" style="color: var(--text-heading); cursor: pointer;"
                                   id="door-delay-det-${ctrl.serialNumber}-${door.id}"
                                   data-fn="startInlineEditDoorDelay" data-dbl="startInlineEditDoorDelay" data-a1="${ctrl.serialNumber}" data-a2="${door.id}" data-el="self"
                                   title="Click to change delay">
                                    ${door.delay !== undefined ? door.delay : 3}s
                                    <i class="fa-solid fa-pen inline-editable-icon" data-fn="startInlineEditDoorDelay" data-a1="${ctrl.serialNumber}" data-a2="${door.id}" data-el="parent" data-requires="write"></i>
                                </b>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="door-actions">
                    ${lockdownBtn}
                    <button class="btn btn-outline" style="padding: 6px 12px; font-size: 11px;" 
                            data-fn="openDoorConfigModal" data-a1="${ctrl.serialNumber}" data-a2="${door.id}" title="Door Settings">
                        <i class="fa-solid fa-gear"></i> Settings
                    </button>
                    <button class="btn btn-primary" id="btn-pulse-${ctrl.serialNumber}-${door.id}" 
                            style="padding: 6px 14px; font-size: 11px;" 
                            data-fn="triggerRemoteOpen" data-a1="${ctrl.serialNumber}" data-a2="${door.id}" data-requires="write" title="Pulse open door">
                        <i class="fa-solid fa-unlock"></i> Pulse Open
                    </button>
                </div>
            </div>
            `;
        }).join('');

        return `
            <div class="controller-card ${isOffline || isUnscanned ? 'card-offline' : ''} ${isEnabled ? '' : 'card-disabled'}" id="card-ctrl-${ctrl.serialNumber}">
                <div class="card-header">
                    <div class="card-title-group">
                        <h3>
                            <i class="fa-solid fa-server" style="color: var(--accent-cyan);"></i>
                            <span class="inline-editable" 
                                  id="ctrl-name-det-${ctrl.serialNumber}"
                                  data-fn="startInlineEditControllerName" data-dbl="startInlineEditControllerName" data-a1="${ctrl.serialNumber}" data-el="self"
                                  style="cursor: pointer;"
                                  title="Click to rename controller">
                                ${esc(ctrl.name)}
                                <i class="fa-solid fa-pen inline-editable-icon" 
                                   data-fn="startInlineEditControllerName" data-a1="${ctrl.serialNumber}" data-el="parent" data-requires="write"
                                   style="font-size: 10px;" title="Rename controller"></i>
                            </span>
                        </h3>
                        <span>SN: ${ctrl.serialNumber} | ${esc(ctrl.model || 'B07D575HN8 (4-Door)')}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; justify-content: flex-end;">
                        <span class="badge-status badge-disabled" id="ctrl-disabled-det-${ctrl.serialNumber}" style="${isEnabled ? 'display: none;' : ''}" title="Controller disabled: excluded from access and emergency actions">DISABLED</span>
                        <button class="btn btn-outline btn-toggle-enabled" id="btn-toggle-enabled-det-${ctrl.serialNumber}" style="padding: 3px 8px; font-size: 10px;"
                                data-fn="toggleControllerEnabled" data-a1="${ctrl.serialNumber}" data-requires="write"
                                title="${isEnabled ? 'Disable this controller' : 'Enable this controller'}">
                            <i class="fa-solid ${isEnabled ? 'fa-toggle-on' : 'fa-toggle-off'}"></i> <span>${isEnabled ? 'Disable' : 'Enable'}</span>
                        </button>
                        <span class="badge-status ${statusBadgeClass}" id="ctrl-status-det-${ctrl.serialNumber}">${esc(statusText)}</span>
                    </div>
                </div>

                <div class="meta-toggle-bar">
                    <span class="meta-summary-pill" id="ctrl-ip-det-${ctrl.serialNumber}"><i class="fa-solid fa-network-wired"></i> ${esc(ctrl.ip)}:${esc(ctrl.port || 60000)}</span>
                    <button class="meta-toggle-btn ${isExpanded ? 'expanded' : ''}" 
                            data-fn="toggleHardwareMeta" data-a1="${ctrl.serialNumber}"
                            title="Toggle Hardware Technical Details">
                        <i class="fa-solid fa-microchip"></i> Hardware Details
                        <i class="fa-solid fa-chevron-down meta-chevron"></i>
                    </button>
                </div>

                ${typeof buildHardwareMetaDrawerHtml === 'function' ? buildHardwareMetaDrawerHtml(ctrl, isExpanded) : ''}

                <div class="doors-list">
                    ${doorsHtml}
                </div>
            </div>
        `;
    }).join('');
}

// Global window bindings
window.toggleHardwareMeta = toggleHardwareMeta;
window.renderControllersDetailed = renderControllersDetailed;
