/**
 * ACCESS Professional - Real-Time Monitor Event Feed DOM Renderer
 * Formats incoming log records into responsive event cards and table rows with Wiegand and PIN parsing.
 */

function createMonitorCardInnerHtml(log, timeStr, statusBadge, actionBtn, w26CardNum, cInfo, effectiveRaw, matchedUser) {
    const doorDisplay = esc(log.doorName || (log.doorNumber ? 'Door ' + log.doorNumber : '---'));
    const ctrlDisplay = esc(log.controllerName || (log.serialNumber ? 'SN:' + log.serialNumber : 'System'));
    const isUnknownCard = Boolean(log.unknownCard || (w26CardNum && !matchedUser && (!log.userName || log.userName === 'Unknown Cardholder') && log.type !== 'KEYPAD_PIN' && log.reason !== 18));
    const cardholderDisplay = esc(log.userName || (matchedUser ? matchedUser.name : 'Unknown Cardholder'));
    const isUnregistered = !log.userName && !matchedUser;

    return `
        <div class="feed-card-header">
            <div class="feed-card-time">
                <i class="fa-regular fa-clock" style="color: var(--text-dim);"></i>
                <b>${esc(timeStr)}</b>
                <span class="feed-card-type">${esc(log.type)}</span>
            </div>
            <div class="feed-card-badges">
                ${statusBadge}
                ${actionBtn}
            </div>
        </div>

        <div class="feed-card-grid">
            <div class="feed-cell">
                <span class="feed-cell-lbl"><i class="fa-solid fa-door-closed"></i> Door</span>
                <span class="feed-cell-val font-highlight">${doorDisplay}</span>
            </div>
            <div class="feed-cell">
                <span class="feed-cell-lbl"><i class="fa-solid fa-server"></i> Controller</span>
                <span class="feed-cell-val">${ctrlDisplay}</span>
            </div>
            <div class="feed-cell">
                <span class="feed-cell-lbl"><i class="fa-solid fa-id-card"></i> Card (W26 / 10D)</span>
                <span class="feed-cell-val font-mono" style="color: var(--accent-cyan);">
                    ${w26CardNum ? `<b>${w26CardNum}</b> <small style="color:var(--text-dim);">(FC:${cInfo?.facility ?? '---'}${effectiveRaw && String(effectiveRaw) !== String(w26CardNum) ? ` · 10D:${esc(effectiveRaw)}` : ''})</small>` : '<span style="color:var(--text-dim);">---</span>'}
                </span>
            </div>
            <div class="feed-cell feed-cell-full">
                <span class="feed-cell-lbl"><i class="fa-solid fa-user"></i> Cardholder</span>
                <span class="feed-cell-val font-user" style="${isUnknownCard ? 'color: #f59e0b; font-weight: 600;' : (isUnregistered ? 'color: var(--text-dim); font-style: italic;' : 'color: var(--text-heading);')}">
                    ${isUnknownCard ? `<i class="fa-solid fa-triangle-exclamation" style="margin-right: 4px;"></i> Unknown Cardholder` : cardholderDisplay}
                </span>
            </div>
            ${log.message ? `
            <div class="feed-cell feed-cell-full">
                <span class="feed-cell-lbl"><i class="fa-solid fa-circle-info"></i> Details / Hardware Message</span>
                <span class="feed-cell-val" style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">${esc(log.message)}</span>
            </div>` : ''}
        </div>
    `;
}

function appendMonitorRow(log) {
    const tbody = document.getElementById('monitor-table-body');
    const cardsContainer = document.getElementById('monitor-cards-container');
    if (!tbody && !cardsContainer) return;

    if (typeof matchesMonitorFilters === 'function' && !matchesMonitorFilters(log)) return;

    const d = new Date(log.timestamp);
    const timeStr = d.toLocaleTimeString();

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

    let rowClass = '';
    let cardBorderClass = '';
    let badge = '';

    if (log.type === 'REMOTE_OPEN') {
        rowClass = 'monitor-row-system';
        cardBorderClass = 'card-border-system';
        badge = `<span class="badge-status" style="background: rgba(245,158,11,0.15); color: #f59e0b;"><i class="fa-solid fa-bolt"></i> PULSE</span>`;
    } else if (isSystem) {
        rowClass = 'monitor-row-system';
        cardBorderClass = 'card-border-system';
        badge = `<span class="badge-status" style="background: rgba(6,182,212,0.15); color: #06b6d4;"><i class="fa-solid fa-circle-info"></i> ${esc(log.type)}</span>`;
    } else if (isUnknownCard) {
        if (isGranted) {
            rowClass = 'monitor-row-warning';
            cardBorderClass = 'card-border-warning';
            badge = `<span class="badge-status" style="background: rgba(245,158,11,0.2); color: #f59e0b; border: 1px solid rgba(245,158,11,0.4);" title="SECURITY WARNING: Unregistered card granted access!"><i class="fa-solid fa-triangle-exclamation"></i> UNKNOWN (GRANTED)</span>`;
        } else {
            rowClass = 'monitor-row-denied';
            cardBorderClass = 'card-border-denied';
            badge = `<span class="badge-status" style="background: rgba(239,68,68,0.15); color: #ef4444; border: 1px solid rgba(239,68,68,0.4);" title="Unknown card swipe denied"><i class="fa-solid fa-triangle-exclamation"></i> UNKNOWN (DENIED)</span>`;
        }
    } else if (isGranted) {
        rowClass = 'monitor-row-granted';
        cardBorderClass = 'card-border-granted';
        badge = `<span class="badge-status" style="background: rgba(16,185,129,0.15); color: #10b981;"><i class="fa-solid fa-check"></i> GRANTED</span>`;
    } else {
        rowClass = 'monitor-row-denied';
        cardBorderClass = 'card-border-denied';
        badge = `<span class="badge-status" style="background: rgba(239,68,68,0.15); color: #ef4444;"><i class="fa-solid fa-xmark"></i> DENIED</span>`;
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

    if (tbody) {
        const emptyTr = tbody.querySelector('.monitor-empty-tr');
        if (emptyTr) emptyTr.remove();

        const tr = document.createElement('tr');
        tr.className = `monitor-row monitor-row-new ${rowClass}`;
        tr.innerHTML = `
            <td class="sticky-col" style="font-family: var(--font-mono); font-size: 12px; font-weight: 600;">${esc(timeStr)}</td>
            <td><span style="font-size: 11px; font-weight: 600; color: var(--accent-cyan);">${esc(log.type)}</span></td>
            <td>${esc(log.controllerName || 'System')}</td>
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
                ${isUnknownCard ? `
                    <span style="color: #f59e0b; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;" title="Warning: Unknown Cardholder">
                        <i class="fa-solid fa-triangle-exclamation"></i> Unknown Cardholder
                    </span>
                ` : esc(log.userName || (matchedUser ? matchedUser.name : '---'))}
            </td>
            <td>${badge}</td>
            <td style="text-align: right;">${actionBtn}</td>
        `;

        tbody.insertBefore(tr, tbody.firstChild);
        setTimeout(() => tr.classList.remove('monitor-row-new'), 600);

        while (tbody.children.length > 60) {
            tbody.removeChild(tbody.lastChild);
        }
    }

    if (cardsContainer) {
        const emptyCard = cardsContainer.querySelector('.empty-state');
        if (emptyCard) emptyCard.remove();

        const card = document.createElement('div');
        card.className = `monitor-feed-card ${cardBorderClass} monitor-row-new`;
        card.innerHTML = createMonitorCardInnerHtml(log, timeStr, badge, actionBtn, w26CardNum, cInfo, effectiveRaw, matchedUser);

        cardsContainer.insertBefore(card, cardsContainer.firstChild);
        setTimeout(() => card.classList.remove('monitor-row-new'), 600);

        while (cardsContainer.children.length > 60) {
            cardsContainer.removeChild(cardsContainer.lastChild);
        }
    }
}

// Global window bindings
window.createMonitorCardInnerHtml = createMonitorCardInnerHtml;
window.appendMonitorRow = appendMonitorRow;
