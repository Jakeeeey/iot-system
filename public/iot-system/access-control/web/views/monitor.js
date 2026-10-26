/**
 * ACCESS Professional - Real-Time Monitor Feed Views
 * Live swipe activity streaming, adaptive table/cards layout, and real-time statistics widget.
 */

var monitorViewUserOverride = false;
var currentMonitorView = window.innerWidth <= 768 ? 'cards' : 'table';

function updateMonitorStats() {
    const gEl = document.getElementById('monitor-stat-granted');
    const dEl = document.getElementById('monitor-stat-denied');
    const cEl = document.getElementById('monitor-stat-cards');
    if (gEl) gEl.textContent = todayStats.granted;
    if (dEl) dEl.textContent = todayStats.denied;
    if (cEl) cEl.textContent = todayStats.cards.size;
}

function matchesMonitorFilters(log) {
    const { controllerId, door, cardNo, search } = monitorFilters;

    if (!monitoredDoorKeys.has('ALL')) {
        if (monitoredDoorKeys.size === 0) return false;
        if (log.serialNumber !== undefined && log.doorNumber !== undefined) {
            const key = `${log.serialNumber}_${log.doorNumber}`;
            if (!monitoredDoorKeys.has(key)) return false;
        } else if (log.serialNumber !== undefined) {
            const anyDoorOnCtrl = Array.from(monitoredDoorKeys).some(k => k.startsWith(`${log.serialNumber}_`));
            if (!anyDoorOnCtrl) return false;
        }
    }

    if (controllerId && String(log.serialNumber) !== String(controllerId)) return false;
    if (door && !(log.doorName || '').toLowerCase().includes(door.toLowerCase()) &&
              !(log.doorNumber !== undefined && String(log.doorNumber) === door)) return false;

    if (cardNo) {
        const parsedFilter = typeof parseRfidCard === 'function' ? parseRfidCard(cardNo) : null;
        const filterWiegand = parsedFilter ? String(parsedFilter.wiegandNum) : null;
        const matched = String(log.cardNumber || '').includes(cardNo) ||
                        String(log.rawCardNumber || '').includes(cardNo) ||
                        (filterWiegand && String(log.cardNumber || '').includes(filterWiegand));
        if (!matched) return false;
    }
    if (search) {
        const s = search.toLowerCase();
        const parsedSearch = typeof parseRfidCard === 'function' ? parseRfidCard(s) : null;
        const searchWiegand = parsedSearch ? String(parsedSearch.wiegandNum) : null;
        return (
            (log.controllerName || '').toLowerCase().includes(s) ||
            (log.doorName || '').toLowerCase().includes(s) ||
            String(log.cardNumber || '').includes(s) ||
            String(log.rawCardNumber || '').includes(s) ||
            (searchWiegand && String(log.cardNumber || '').includes(searchWiegand)) ||
            (log.userName || '').toLowerCase().includes(s) ||
            (log.type || '').toLowerCase().includes(s) ||
            (log.message || '').toLowerCase().includes(s)
        );
    }
    return true;
}

function rebuildMonitorTable() {
    const tbody = document.getElementById('monitor-table-body');
    const cardsContainer = document.getElementById('monitor-cards-container');
    if (tbody) tbody.innerHTML = '';
    if (cardsContainer) cardsContainer.innerHTML = '';

    const recent = auditLogs.slice(0, 60);
    const filtered = recent.filter(matchesMonitorFilters);

    if (filtered.length === 0) {
        if (tbody) {
            tbody.innerHTML = `
                <tr class="monitor-empty-tr">
                    <td colspan="9" style="text-align: center; padding: 40px 12px; color: var(--text-dim);">
                        <i class="fa-solid fa-satellite-dish" style="font-size: 24px; margin-bottom: 8px; display: block; opacity: 0.5;"></i>
                        No real-time monitor events match current filter.
                    </td>
                </tr>
            `;
        }
        if (cardsContainer) {
            cardsContainer.innerHTML = `
                <div class="empty-state" style="padding: 40px 12px;">
                    <i class="fa-solid fa-satellite-dish" style="font-size: 28px; margin-bottom: 8px; opacity: 0.5;"></i>
                    <p style="font-size: 13px; color: var(--text-dim); margin: 0;">No real-time monitor events match current filter.</p>
                </div>
            `;
        }
        return;
    }

    filtered.slice().reverse().forEach(log => {
        if (typeof appendMonitorRow === 'function') appendMonitorRow(log);
    });
}

function updateAutoMonitorView(force = false) {
    const isMobile = window.innerWidth <= 768;
    const targetMode = isMobile ? 'cards' : 'table';
    if (!monitorViewUserOverride || force) {
        setMonitorViewMode(targetMode, false);
    } else {
        const scrollHint = document.getElementById('monitor-table-scroll-hint');
        if (scrollHint) {
            scrollHint.style.display = (currentMonitorView === 'table' && isMobile) ? 'flex' : 'none';
        }
    }
}

function setMonitorViewMode(mode, fromUserClick = false) {
    currentMonitorView = mode;
    if (fromUserClick) {
        monitorViewUserOverride = true;
    }

    const btnCards = document.getElementById('btn-monitor-view-cards');
    const btnTable = document.getElementById('btn-monitor-view-table');
    const wrapTable = document.getElementById('monitor-table-wrapper');
    const wrapCards = document.getElementById('monitor-cards-container');
    const scrollHint = document.getElementById('monitor-table-scroll-hint');
    const isMobile = window.innerWidth <= 768;

    if (mode === 'cards') {
        if (btnCards) btnCards.classList.add('active-view');
        if (btnTable) btnTable.classList.remove('active-view');
        if (wrapTable) wrapTable.style.display = 'none';
        if (wrapCards) wrapCards.style.display = 'flex';
        if (scrollHint) scrollHint.style.display = 'none';
    } else {
        if (btnTable) btnTable.classList.add('active-view');
        if (btnCards) btnCards.classList.remove('active-view');
        if (wrapTable) wrapTable.style.display = 'block';
        if (wrapCards) wrapCards.style.display = 'none';
        if (scrollHint) {
            scrollHint.style.display = isMobile ? 'flex' : 'none';
        }
    }
}

function updateMonitorControllerFilter() {
    const sel = document.getElementById('monitor-filter-controller');
    if (!sel) return;
    const current = sel.value;
    const activeControllers = controllers.filter(isScannedController);
    sel.innerHTML = '<option value="">All Controllers</option>' +
        activeControllers.map(c => `<option value="${c.serialNumber}" ${String(c.serialNumber) === current ? 'selected' : ''}>${esc(c.name)}</option>`).join('');
}

// Global window bindings
window.updateMonitorStats = updateMonitorStats;
window.matchesMonitorFilters = matchesMonitorFilters;
window.rebuildMonitorTable = rebuildMonitorTable;
window.updateAutoMonitorView = updateAutoMonitorView;
window.setMonitorViewMode = setMonitorViewMode;
window.updateMonitorControllerFilter = updateMonitorControllerFilter;
