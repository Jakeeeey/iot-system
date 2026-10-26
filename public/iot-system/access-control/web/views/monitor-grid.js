/**
 * ACCESS Professional - Monitor Door Tiles Grid View
 * Renders full monitored door tile cards with status, state badges, and emergency controls.
 */

var monitorDoorTilesExpanded = false;

function toggleMonitorDoorTiles() {
    monitorDoorTilesExpanded = !monitorDoorTilesExpanded;
    const grid = document.getElementById('monitored-doors-grid');
    const btn = document.getElementById('btn-toggle-door-tiles');
    if (grid) {
        grid.style.display = monitorDoorTilesExpanded ? 'grid' : 'none';
    }
    if (btn) {
        btn.classList.toggle('active-view', monitorDoorTilesExpanded);
        btn.innerHTML = monitorDoorTilesExpanded
            ? '<i class="fa-solid fa-chevron-up"></i> <span>Hide Tiles</span>'
            : '<i class="fa-solid fa-table-cells"></i> <span>Door Tiles</span>';
    }
}

function renderDoorTiles(allDoorsList) {
    const gridContainer = document.getElementById('monitored-doors-grid');
    if (!gridContainer) return;

    const isAll = monitoredDoorKeys.has('ALL');
    const visibleDoors = allDoorsList.filter(item => isAll || monitoredDoorKeys.has(item.key));

    if (visibleDoors.length === 0) {
        gridContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 30px; color: var(--text-dim); background: var(--bg-card-hover); border-radius: 8px; border: 1px dashed var(--border-subtle);">
                <i class="fa-solid fa-door-closed" style="font-size: 24px; margin-bottom: 8px; opacity: 0.5;"></i>
                <div>No doors currently selected for tile monitoring. Click door chips above to activate.</div>
            </div>
        `;
        return;
    }

    gridContainer.innerHTML = visibleDoors.map(item => {
        const hasSensor = item.door.sensorEnabled === true;
        const isDoorOpen = hasSensor ? item.door.open : !item.door.locked;
        const isLocked = item.door.locked !== false;

        const recentLog = auditLogs.find(l => 
            String(l.serialNumber) === String(item.ctrl.serialNumber) && 
            (l.doorNumber === item.door.id || l.doorName === item.door.name)
        );

        let lastEventHtml = '<i class="fa-solid fa-signal" style="color: var(--text-dim);"></i> <span>No recent swipe events</span>';
        if (recentLog) {
            const timeStr = new Date(recentLog.timestamp).toLocaleTimeString();
            const granted = recentLog.granted !== false;
            const icon = granted ? 'fa-check' : 'fa-xmark';
            const col = granted ? 'var(--accent-primary)' : 'var(--accent-danger)';
            lastEventHtml = `
                <i class="fa-solid ${icon}" style="color: ${col}; flex-shrink: 0;"></i>
                <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    <b style="color: var(--text-heading);">${esc(timeStr)}</b>: ${esc(recentLog.userName || (recentLog.cardNumber ? '#' + recentLog.cardNumber : recentLog.type))}
                </span>
            `;
        }

        const isUnreachable = item.ctrl.status === 'UNREACHABLE';
        const isOffline = item.ctrl.status === 'OFFLINE' || item.ctrl.status === 'UNCONNECTED' || isUnreachable || item.ctrl.isOnline === false;
        const isUnscanned = item.ctrl.status === 'UNSCANNED' || item.ctrl.scanned === false;

        const contactBadge = isOffline
            ? '<span class="door-status-pill status-unreachable" style="padding: 2px 6px; font-size: 10px;"><i class="fa-solid fa-triangle-exclamation"></i> Unreachable</span>'
            : (isLocked
                ? '<span style="color: var(--accent-primary);"><i class="fa-solid fa-lock"></i> Locked</span>'
                : '<span style="color: var(--accent-warning); font-weight: 600;"><i class="fa-solid fa-lock-open"></i> Unlocked</span>');

        const isLockdown = item.door.mode === 'NormallyClosed';
        const isAlwaysOpen = item.door.mode === 'NormallyOpen';
            const lockdownBtn = isLockdown
                ? `<button class="btn btn-danger-solid" style="padding: 4px 8px; font-size: 11px; flex-shrink: 0;" data-fn="toggleDoorLockdown" data-a1="${item.ctrl.serialNumber}" data-a2="${item.door.id}" data-requires="write" title="Release Lockdown"><i class="fa-solid fa-lock"></i> Locked Down</button>`
                : `<button class="btn btn-outline-danger" style="padding: 4px 8px; font-size: 11px; flex-shrink: 0;" data-fn="toggleDoorLockdown" data-a1="${item.ctrl.serialNumber}" data-a2="${item.door.id}" data-requires="write" title="Lockdown Door (reject cards/PINs)"><i class="fa-solid fa-lock"></i> Lock</button>`;

        let modeBadge = '';
        if (isLockdown) modeBadge = `<span class="badge-lockdown-indicator"><i class="fa-solid fa-lock"></i> LOCKDOWN</span>`;
        else if (isAlwaysOpen) modeBadge = `<span class="badge-open-indicator"><i class="fa-solid fa-door-open"></i> HELD OPEN</span>`;

        return `
            <div class="monitored-door-card ${isLockdown ? 'tile-lockdown' : ''} ${isOffline ? 'card-offline' : ''}" id="monitored-card-${item.ctrl.serialNumber}-${item.door.id}">
                <div class="monitored-card-header">
                    <div>
                        <div style="font-size: 13px; font-weight: 700; color: var(--text-heading); display: flex; align-items: center; gap: 6px;">
                            <span>${esc(item.door.name || 'Door ' + item.door.id)}</span>
                            ${modeBadge}
                            ${isOffline ? `<span class="badge-status ${isUnscanned ? 'badge-unscanned' : 'badge-offline'}" style="font-size: 9px; padding: 1px 5px;"><i class="fa-solid fa-triangle-exclamation"></i> ${isUnscanned ? 'UNSCANNED' : (isUnreachable ? 'UNREACHABLE' : 'OFFLINE')}</span>` : ''}
                        </div>
                        <div style="font-size: 11px; color: var(--text-dim); font-family: var(--font-mono);">${esc(item.ctrl.name)} · SN:${item.ctrl.serialNumber}</div>
                    </div>
                    ${isOffline
                        ? `<span class="badge-status badge-offline badge-icon-only" title="Controller Offline/Unreachable">
                            <i class="fa-solid fa-triangle-exclamation"></i>
                           </span>`
                        : `<span class="badge-status badge-icon-only" title="Relay: ${isLocked ? 'LOCKED' : 'UNLOCKED'}" style="${isLocked ? 'background: rgba(16,185,129,0.15); color: #10b981;' : 'background: rgba(245,158,11,0.15); color: #f59e0b;'}">
                            <i class="fa-solid ${isLocked ? 'fa-lock' : 'fa-lock-open'}"></i>
                           </span>`
                    }
                </div>

                <div class="monitored-card-body">
                    <div class="monitored-card-icon ${isDoorOpen ? 'open' : ''}" style="width: 36px; height: 36px; font-size: 16px;">
                        <i class="fa-solid ${isDoorOpen ? 'fa-door-open' : 'fa-door-closed'}"></i>
                    </div>
                    <div style="font-size: 11px; color: var(--text-muted); display: flex; flex-direction: column; gap: 3px; flex: 1;">
                        <div>State: ${contactBadge}</div>
                        <div>Mode: <b style="color: var(--accent-cyan);">${esc(item.door.mode || 'Controlled')}</b> | Delay: <b style="color: var(--text-heading);">${item.door.delay !== undefined ? item.door.delay : 3}s</b></div>
                    </div>
                    <div style="display: flex; gap: 4px; flex-shrink: 0;">
                        ${lockdownBtn}
                        <button class="btn btn-outline" style="padding: 4px 8px; font-size: 11px;"
                        data-fn="triggerRemoteOpen" data-a1="${item.ctrl.serialNumber}" data-a2="${item.door.id}" data-requires="write"
                        title="Pulse unlock door">
                            <i class="fa-solid fa-unlock"></i> Pulse
                        </button>
                    </div>
                </div>

                <div class="monitored-card-last-event" title="Most recent activity for this door">
                    ${lastEventHtml}
                </div>
            </div>
        `;
    }).join('');
}

// Global window bindings
window.toggleMonitorDoorTiles = toggleMonitorDoorTiles;
window.renderDoorTiles = renderDoorTiles;
