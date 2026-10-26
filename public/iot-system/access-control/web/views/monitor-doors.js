/**
 * ACCESS Professional - Real-Time Monitor Doors Selection
 * Handles dynamic monitored door chips, selection clicks, and active counts.
 */

var monitorDoorsViewMode = 'slider';
var monitorDoorsCollapsed = false;
try {
    monitorDoorsViewMode = localStorage.getItem('access_monitor_doors_view_mode') || 'slider';
    monitorDoorsCollapsed = localStorage.getItem('access_monitor_doors_collapsed') === 'true';
} catch (e) { /* intentional: localStorage restricted */ }

var doorClickTimer = null;
var lastClickedDoorKey = null;

function saveMonitoredDoors() {
    try {
        localStorage.setItem('access_monitored_doors', JSON.stringify(Array.from(monitoredDoorKeys)));
    } catch (e) { /* intentional: localStorage restricted */ }
}

function selectAllMonitoredDoors() {
    monitoredDoorKeys = new Set(['ALL']);
    saveMonitoredDoors();
    renderMonitoredDoors();
    if (typeof rebuildMonitorTable === 'function') rebuildMonitorTable();
    showToast('Monitoring all doors fleet-wide.', 'info');
}

function clearAllMonitoredDoors() {
    monitoredDoorKeys = new Set();
    saveMonitoredDoors();
    renderMonitoredDoors();
    if (typeof rebuildMonitorTable === 'function') rebuildMonitorTable();
    showToast('Cleared door monitoring targets. Select door(s) above to monitor.', 'warning');
}

function getAllDoorsFlat() {
    const list = [];
    controllers.forEach(c => {
        (c.doors || []).forEach(d => {
            list.push({ ctrl: c, door: d, key: `${c.serialNumber}_${d.id}` });
        });
    });
    return list;
}

function resolveDoorDisplayName(serial, doorId) {
    const ctrl = controllers.find(c => String(c.serialNumber) === String(serial));
    const door = ctrl?.doors?.find(d => String(d.id) === String(doorId));
    return `${ctrl?.name || 'Controller ' + serial} - ${door?.name || 'Door ' + doorId}`;
}

function handleDoorChipClick(event, serial, doorId) {
    if (event) event.stopPropagation();
    const key = `${serial}_${doorId}`;

    if (doorClickTimer) {
        clearTimeout(doorClickTimer);
        doorClickTimer = null;
        if (lastClickedDoorKey === key) return;
    }

    lastClickedDoorKey = key;
    doorClickTimer = setTimeout(() => {
        doorClickTimer = null;
        lastClickedDoorKey = null;
        executeDoorSingleClick(serial, doorId);
    }, 240);
}

function handleDoorChipDblClick(event, serial, doorId) {
    if (event) event.stopPropagation();
    if (doorClickTimer) {
        clearTimeout(doorClickTimer);
        doorClickTimer = null;
    }
    lastClickedDoorKey = null;
    executeDoorDblClick(serial, doorId);
}

function executeDoorSingleClick(serial, doorId) {
    const doorName = resolveDoorDisplayName(serial, doorId);
    const key = `${serial}_${doorId}`;
    const allDoors = getAllDoorsFlat();

    if (monitoredDoorKeys.has('ALL')) {
        monitoredDoorKeys = new Set([key]);
        showToast(`Monitoring only: ${doorName}`, 'info');
    } else {
        if (monitoredDoorKeys.has(key)) {
            monitoredDoorKeys.delete(key);
            if (monitoredDoorKeys.size === 0) {
                showToast(`Deselected ${doorName}. None selected.`, 'warning');
            } else {
                showToast(`Deselected ${doorName}.`, 'info');
            }
        } else {
            monitoredDoorKeys.add(key);
            if (monitoredDoorKeys.size === allDoors.length && allDoors.length > 0) {
                monitoredDoorKeys = new Set(['ALL']);
                showToast(`All doors selected fleet-wide.`, 'info');
            } else {
                showToast(`Added ${doorName} to monitor.`, 'success');
            }
        }
    }

    saveMonitoredDoors();
    renderMonitoredDoors();
    if (typeof rebuildMonitorTable === 'function') rebuildMonitorTable();
}

function executeDoorDblClick(serial, doorId) {
    const doorName = resolveDoorDisplayName(serial, doorId);
    const key = `${serial}_${doorId}`;
    const allDoors = getAllDoorsFlat();

    if (monitoredDoorKeys.has('ALL')) {
        monitoredDoorKeys = new Set(allDoors.map(d => d.key).filter(k => k !== key));
        showToast(`Deselected ${doorName}. (${monitoredDoorKeys.size} doors active)`, 'warning');
    } else {
        if (monitoredDoorKeys.has(key)) {
            monitoredDoorKeys.delete(key);
            if (monitoredDoorKeys.size === 0) {
                showToast(`Deselected ${doorName}. (None selected)`, 'warning');
            } else {
                showToast(`Deselected ${doorName}.`, 'warning');
            }
        } else {
            showToast(`${doorName} is already deselected.`, 'info');
            return;
        }
    }

    saveMonitoredDoors();
    renderMonitoredDoors();
    if (typeof rebuildMonitorTable === 'function') rebuildMonitorTable();
}

function toggleMonitoredDoor(serial, doorId, doorName) {
    executeDoorSingleClick(serial, doorId, doorName || `Door ${doorId}`);
}

function renderMonitoredDoors() {
    const chipsContainer = document.getElementById('monitored-door-chips');
    const badge = document.getElementById('monitored-doors-count-badge');
    if (!chipsContainer) return;

    const allDoorsList = getAllDoorsFlat();
    const isAll = monitoredDoorKeys.has('ALL');
    const activeCount = isAll ? allDoorsList.length : monitoredDoorKeys.size;

    if (badge) {
        if (isAll) {
            badge.textContent = `Monitoring: All Doors (${allDoorsList.length})`;
            badge.style.background = 'rgba(16, 185, 129, 0.15)';
            badge.style.color = '#10b981';
        } else if (monitoredDoorKeys.size === 0) {
            badge.textContent = 'Monitoring: None Selected (0 Doors)';
            badge.style.background = 'rgba(239, 68, 68, 0.15)';
            badge.style.color = '#ef4444';
        } else {
            badge.textContent = `Monitoring: ${activeCount} of ${allDoorsList.length} Doors`;
            badge.style.background = 'rgba(6, 182, 212, 0.15)';
            badge.style.color = '#06b6d4';
        }
    }

    const savedScrollLeft = chipsContainer.scrollLeft;
    const savedScrollTop = chipsContainer.scrollTop;

    let chipsHtml = `
        <button class="door-chip ${isAll ? 'active' : ''}" data-fn="selectAllMonitoredDoors" title="Monitor all doors fleet-wide">
            <i class="fa-solid fa-check-double"></i> All Doors (${allDoorsList.length})
        </button>
    `;

    chipsHtml += allDoorsList.map(item => {
        const isSelected = isAll || monitoredDoorKeys.has(item.key);
        const hasSensor = item.door.sensorEnabled === true;
        const isDoorOpen = hasSensor ? item.door.open : !item.door.locked;
        const isUnreachable = item.ctrl.status === 'UNREACHABLE';
        const isOffline = item.ctrl.status === 'OFFLINE' || item.ctrl.status === 'UNCONNECTED' || isUnreachable;
        const isUnscanned = item.ctrl.scanned === false || item.ctrl.status === 'UNSCANNED';
        const shortCtrl = esc((item.ctrl.name || '').replace('Controller ', 'C'));
        const shortDoor = esc(item.door.name || 'D' + item.door.id);
        const chipTitle = esc(isSelected
            ? `${item.ctrl.name} - ${item.door.name || 'Door ' + item.door.id}: Active${isOffline ? ' (Offline)' : (isUnscanned ? ' (Unscanned)' : '')}. Click to toggle · Double-click to deselect only this door`
            : `${item.ctrl.name} - ${item.door.name || 'Door ' + item.door.id}: Inactive${isOffline ? ' (Offline)' : (isUnscanned ? ' (Unscanned)' : '')}. Click to select`);
        const dotStyle = (isOffline || isUnscanned) ? 'style="background: #ef4444;"' : '';
        return `
            <button class="door-chip ${isSelected ? 'active' : ''}" 
                    data-fn="handleDoorChipClick" data-dbl="handleDoorChipDblClick" data-ev data-a1="${item.ctrl.serialNumber}" data-a2="${item.door.id}"
                    title="${chipTitle}">
                <span class="chip-dot ${isDoorOpen ? 'open' : ''} ${isOffline || isUnscanned ? 'offline' : ''}" ${dotStyle}></span>
                <span><b>${shortCtrl}</b> · ${shortDoor}</span>
            </button>
        `;
    }).join('');

    chipsContainer.innerHTML = chipsHtml;
    chipsContainer.scrollLeft = savedScrollLeft;
    chipsContainer.scrollTop = savedScrollTop;

    if (!chipsContainer._wheelAttached) {
        chipsContainer.addEventListener('wheel', (e) => {
            if (monitorDoorsViewMode === 'slider') {
                if (e.deltaY !== 0 && chipsContainer.scrollWidth > chipsContainer.clientWidth) {
                    e.preventDefault();
                    chipsContainer.scrollLeft += e.deltaY;
                    if (typeof updateMonitorChipsScrollArrows === 'function') updateMonitorChipsScrollArrows();
                }
            }
        }, { passive: false });
        chipsContainer._wheelAttached = true;
    }

    if (typeof renderDoorTiles === 'function') {
        renderDoorTiles(allDoorsList);
    }
}

// Global window bindings
window.resolveDoorDisplayName = resolveDoorDisplayName;
window.selectAllMonitoredDoors = selectAllMonitoredDoors;
window.clearAllMonitoredDoors = clearAllMonitoredDoors;
window.handleDoorChipClick = handleDoorChipClick;
window.handleDoorChipDblClick = handleDoorChipDblClick;
window.toggleMonitoredDoor = toggleMonitoredDoor;
window.renderMonitoredDoors = renderMonitoredDoors;
