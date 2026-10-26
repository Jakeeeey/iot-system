/**
 * ACCESS Professional - Event History Log Views
 * Table rendering for historical access events, search, CSV export, and database clear modal.
 */

function renderHistory(filterSearch = '') {
    const tbody = document.getElementById('history-table-body');
    const emptyState = document.getElementById('history-empty');
    if (!tbody) return;

    let filtered = auditLogs;
    const filterType = document.getElementById('history-type-filter')?.value || '';
    if (filterType) {
        filtered = filtered.filter(l => l.type === filterType);
    }
    if (filterSearch) {
        filtered = filtered.filter(l => 
            (l.controllerName || '').toLowerCase().includes(filterSearch) ||
            (l.doorName || '').toLowerCase().includes(filterSearch) ||
            String(l.cardNumber || '').includes(filterSearch) ||
            String(l.rawCardNumber || '').includes(filterSearch) ||
            (l.userName || '').toLowerCase().includes(filterSearch) ||
            (l.type || '').toLowerCase().includes(filterSearch) ||
            (l.message || '').toLowerCase().includes(filterSearch)
        );
    }

    if (filtered.length === 0) {
        tbody.innerHTML = '';
        if (emptyState) emptyState.style.display = 'flex';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    tbody.innerHTML = filtered.map(log => {
        const d = new Date(log.timestamp);
        const timeStr = d.toLocaleDateString() + ' ' + d.toLocaleTimeString();

        const isGranted = log.granted !== false;
        const isSystem = !log.cardNumber || ['DISCOVERY', 'TIME_SYNC', 'SCAN_STARTED', 'SCAN_COMPLETED', 'PROBE', 'DOOR_CONFIG', 'HARDWARE_IMPORT', 'USER_PRIVILEGE', 'USER_REVOKED'].includes(log.type);

        const cInfo = log.cardNumber && typeof parseRfidCard === 'function' ? parseRfidCard(log.cardNumber) : null;
        const w26CardNum = cInfo ? cInfo.wiegandNum : (log.cardNumber ? Number(log.cardNumber) : null);

        const matchedUser = log.cardNumber ? users.find(u => 
            u.cardNumber === w26CardNum || 
            u.cardNumber === log.cardNumber || 
            (u.rawCardNumber && (u.rawCardNumber == log.cardNumber || u.rawCardNumber == log.rawCardNumber || (cInfo?.raw10D && u.rawCardNumber == cInfo.raw10D)))
        ) : null;
        const effectiveRaw = log.rawCardNumber || matchedUser?.rawCardNumber || (cInfo?.raw10D || null);
        const isUnknownCard = Boolean(log.unknownCard || (w26CardNum && !matchedUser && (!log.userName || log.userName === 'Unknown Cardholder') && log.type !== 'KEYPAD_PIN' && log.reason !== 18));

        let badge = '';
        if (log.type === 'REMOTE_OPEN') {
            badge = `<span class="badge-status" style="background: rgba(245,158,11,0.15); color: #f59e0b;"><i class="fa-solid fa-bolt"></i> PULSE</span>`;
        } else if (isSystem) {
            badge = `<span class="badge-status" style="background: rgba(6,182,212,0.15); color: #06b6d4;"><i class="fa-solid fa-circle-info"></i> ${esc(log.type)}</span>`;
        } else if (isUnknownCard) {
            if (isGranted) {
                badge = `<span class="badge-status" style="background: rgba(245,158,11,0.2); color: #f59e0b; border: 1px solid rgba(245,158,11,0.4);" title="SECURITY WARNING: Unregistered card granted access!"><i class="fa-solid fa-triangle-exclamation"></i> UNKNOWN (GRANTED)</span>`;
            } else {
                badge = `<span class="badge-status" style="background: rgba(239,68,68,0.15); color: #ef4444; border: 1px solid rgba(239,68,68,0.4);" title="Unknown card swipe denied"><i class="fa-solid fa-triangle-exclamation"></i> UNKNOWN (DENIED)</span>`;
            }
        } else if (isGranted) {
            badge = `<span class="badge-status" style="background: rgba(16,185,129,0.15); color: #10b981;"><i class="fa-solid fa-check"></i> GRANTED</span>`;
        } else {
            badge = `<span class="badge-status" style="background: rgba(239,68,68,0.15); color: #ef4444;"><i class="fa-solid fa-xmark"></i> DENIED</span>`;
        }

        const rawPin = log.pin || matchedUser?.pin;
        const isWrongPin = log.reason === 7 || (log.message && log.message.toLowerCase().includes('wrong pin'));
        const isKeypadOpen = log.type === 'KEYPAD_PIN' || log.reason === 18;
        let pinHtml = '<span style="color: var(--text-dim); font-size: 11px;">---</span>';

        if (isWrongPin) {
            pinHtml = `<span class="badge-pin-code badge-pin-wrong" title="Wrong PIN code entered"><i class="fa-solid fa-triangle-exclamation"></i> ${rawPin && rawPin !== '0' && rawPin !== 0 ? esc(rawPin) : 'Wrong PIN'}</span>`;
        } else if (rawPin && rawPin !== '0' && rawPin !== 0) {
            pinHtml = `<span class="badge-pin-code ${isKeypadOpen ? 'badge-pin-granted' : ''}" title="${isKeypadOpen ? 'Keypad PIN Access Granted' : 'Configured / Inputted Cardholder PIN'}"><i class="fa-solid fa-key"></i> <b>${esc(rawPin)}</b></span>`;
        } else if (isKeypadOpen) {
            pinHtml = `<span class="badge-pin-code badge-pin-granted" title="Keypad PIN Access"><i class="fa-solid fa-key"></i> Keypad PIN</span>`;
        }

        let actionBtn = '';
        if (w26CardNum && !matchedUser) {
            actionBtn = `
                <button class="btn btn-primary" style="padding: 3px 8px; font-size: 11px;" 
                        data-fn="openAddUserWithCard" data-a1="${w26CardNum}" data-a2="${esc(effectiveRaw || '')}" data-requires="write">
                    <i class="fa-solid fa-user-plus"></i> Enroll
                </button>
            `;
        }

        return `
            <tr>
                <td style="font-family: var(--font-mono); font-size: 12px; color: var(--text-muted);">${esc(timeStr)}</td>
                <td><span style="font-size: 11px; font-weight: 600; color: var(--accent-cyan);">${esc(log.type)}</span></td>
                <td>${esc(log.controllerName || (log.serialNumber ? 'SN:' + log.serialNumber : 'System'))}</td>
                <td>${esc(log.doorName || (log.doorNumber ? 'Door ' + log.doorNumber : '---'))}</td>
                <td>
                    ${w26CardNum ? `
                        <div style="display: flex; flex-direction: column; line-height: 1.25;">
                            <b style="font-family: var(--font-mono); font-size: 13px; color: var(--accent-cyan);">${w26CardNum}</b>
                            <span style="font-size: 10px; font-family: var(--font-mono); color: var(--text-dim);" title="Wiegand 26 (Facility Code: ${cInfo?.facility ?? 0}, Card ID: ${cInfo?.cardId ?? 0})${effectiveRaw ? ` | Raw 10D: ${esc(effectiveRaw)}` : ''}">
                                FC: ${cInfo?.facility ?? '---'} · ID: ${cInfo?.cardId ?? '---'}${effectiveRaw && String(effectiveRaw) !== String(w26CardNum) ? ` · 10D: ${esc(effectiveRaw)}` : ''}
                            </span>
                        </div>
                    ` : '<span style="color: var(--text-dim);">---</span>'}
                </td>
                <td>
                    ${pinHtml}
                </td>
                <td>${isUnknownCard ? `<span style="color: #f59e0b; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;" title="Warning: Unknown Cardholder"><i class="fa-solid fa-triangle-exclamation"></i> Unknown Cardholder</span>` : esc(log.userName || (matchedUser ? matchedUser.name : '---'))}</td>
                <td>${badge}</td>
                <td style="font-size: 12px; color: var(--text-muted); font-family: var(--font-mono);">${esc(log.message || '---')}</td>
                <td style="text-align: right;">${actionBtn}</td>
            </tr>
        `;
    }).join('');
}

function exportHistoryCsv() {
    window.location.href = '/api/history/export';
}

function openClearEventsModal() {
    if (!requireUiWrite()) return;
    const modalClearEvents = document.getElementById('modal-clear-events');
    const chkConfirmClearEvents = document.getElementById('chk-confirm-clear-events');
    const btnConfirmClearEvents = document.getElementById('btn-confirm-clear-events');
    const btnConfirmClearEventsText = document.getElementById('btn-confirm-clear-events-text');
    const iconConfirmClearEvents = document.getElementById('icon-confirm-clear-events');

    if (!modalClearEvents) return;
    if (chkConfirmClearEvents) chkConfirmClearEvents.checked = false;
    if (btnConfirmClearEvents) {
        btnConfirmClearEvents.disabled = true;
        btnConfirmClearEvents.style.opacity = '0.45';
        btnConfirmClearEvents.style.cursor = 'not-allowed';
        if (btnConfirmClearEventsText) btnConfirmClearEventsText.textContent = 'Clear iot_access_events Table';
        if (iconConfirmClearEvents) iconConfirmClearEvents.className = 'fa-solid fa-trash-can';
    }
    modalClearEvents.classList.add('active');
}

function closeClearEventsModal() {
    const modalClearEvents = document.getElementById('modal-clear-events');
    if (modalClearEvents) modalClearEvents.classList.remove('active');
}

async function executePurgeEvents() {
    if (!requireUiWrite()) return;
    const chkConfirmClearEvents = document.getElementById('chk-confirm-clear-events');
    const btnConfirmClearEvents = document.getElementById('btn-confirm-clear-events');
    const btnConfirmClearEventsText = document.getElementById('btn-confirm-clear-events-text');
    const iconConfirmClearEvents = document.getElementById('icon-confirm-clear-events');

    if (!chkConfirmClearEvents?.checked) return;

    if (btnConfirmClearEvents) {
        btnConfirmClearEvents.disabled = true;
        btnConfirmClearEvents.style.cursor = 'wait';
    }
    if (btnConfirmClearEventsText) btnConfirmClearEventsText.textContent = 'Purging Events...';
    try {
        const res = await fetch('/api/events/clear', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ confirm: true, clearRemote: false })
        });
        const data = await res.json();

        if (data.success) {
            auditLogs = [];
            todayStats.granted = 0;
            todayStats.denied = 0;
            todayStats.cards.clear();
            if (typeof updateMonitorStats === 'function') updateMonitorStats();
            if (activeTab === 'tab-history') renderHistory();
            if (activeTab === 'tab-monitor' && typeof rebuildMonitorTable === 'function') rebuildMonitorTable();
            closeClearEventsModal();
            showToast(data.message || 'iot_access_events table successfully cleared.', 'success');
        } else {
            showToast(`Failed to clear table: ${data.error || 'Unknown error'}`, 'danger');
            if (btnConfirmClearEvents) {
                btnConfirmClearEvents.disabled = false;
                btnConfirmClearEvents.style.cursor = 'pointer';
            }
            if (btnConfirmClearEventsText) btnConfirmClearEventsText.textContent = 'Retry Clear Events Table';
            if (iconConfirmClearEvents) iconConfirmClearEvents.className = 'fa-solid fa-triangle-exclamation';
        }
    } catch (err) {
        showToast(`Network error: ${err.message}`, 'danger');
        if (btnConfirmClearEvents) {
            btnConfirmClearEvents.disabled = false;
            btnConfirmClearEvents.style.cursor = 'pointer';
        }
        if (btnConfirmClearEventsText) btnConfirmClearEventsText.textContent = 'Retry Clear Events Table';
        if (iconConfirmClearEvents) iconConfirmClearEvents.className = 'fa-solid fa-triangle-exclamation';
    }
}

// Global window bindings
window.renderHistory = renderHistory;
window.exportHistoryCsv = exportHistoryCsv;
window.openClearEventsModal = openClearEventsModal;
window.closeClearEventsModal = closeClearEventsModal;
window.executePurgeEvents = executePurgeEvents;
