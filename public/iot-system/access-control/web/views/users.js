/**
 * ACCESS Professional - Users & Privileges Views
 * Renders user matrix in Table and Per-Board modes with search filtering.
 */

function getUsersSearchTerm() {
    return (document.getElementById('users-search-input')?.value || '').toLowerCase().trim();
}

function formatValidityDate(dateStr) {
    if (!dateStr) return '---';
    const s = String(dateStr).trim();
    const m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (m) {
        const yyyy = m[1];
        const mm = m[2].padStart(2, '0');
        const dd = m[3].padStart(2, '0');
        return `${mm}/${dd}/${yyyy}`;
    }
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const yyyy = d.getFullYear();
        return `${mm}/${dd}/${yyyy}`;
    }
    return s;
}

function populateDepartmentFilter() {
    const select = document.getElementById('users-dept-filter');
    if (!select) return;

    const currentVal = (select.value || '').trim();
    const depts = new Set();
    (users || []).forEach(u => {
        const d = (u.department || '').trim();
        if (d) depts.add(d);
    });

    const sorted = Array.from(depts).sort((a, b) => a.localeCompare(b));
    const existingOptions = Array.from(select.options).slice(1).map(o => o.value);
    const isSame = existingOptions.length === sorted.length && existingOptions.every((v, i) => v === sorted[i]);
    if (isSame) {
        return;
    }

    select.innerHTML = '<option value="">All Departments</option>' +
        sorted.map(d => `<option value="${esc(d)}"${d.toLowerCase() === currentVal.toLowerCase() ? ' selected' : ''}>${esc(d)}</option>`).join('');
    if (currentVal) {
        select.value = currentVal;
    }
}

function populateDoorFilter() {
    const select = document.getElementById('users-door-filter');
    if (!select) return;

    const currentVal = (select.value || '').trim();
    const ctrlList = (typeof controllers !== 'undefined' && Array.isArray(controllers)) ? controllers : [];
    const activeControllers = ctrlList.filter(c => (typeof isScannedController === 'function' ? isScannedController(c) : true) && (typeof isControllerEnabled === 'function' ? isControllerEnabled(c) : true));
    const list = activeControllers.length > 0 ? activeControllers : ctrlList;

    let optionsHtml = '<option value="">All Doors</option>';
    list.forEach(ctrl => {
        const ctrlLabel = ctrl.name || `Controller ${ctrl.serialNumber}`;
        const doors = Array.isArray(ctrl.doors) ? ctrl.doors : [];
        if (doors.length > 0) {
            optionsHtml += `<optgroup label="${esc(ctrlLabel)} (SN:${ctrl.serialNumber})">`;
            doors.forEach(door => {
                const val = `${ctrl.serialNumber}_${door.id}`;
                optionsHtml += `<option value="${val}">${esc(door.name || 'Door ' + door.id)}</option>`;
            });
            optionsHtml += `</optgroup>`;
        }
    });

    if (select.dataset.lastSig !== optionsHtml) {
        select.dataset.lastSig = optionsHtml;
        select.innerHTML = optionsHtml;
        if (currentVal) {
            select.value = currentVal;
        }
    }
}

function filterUsers() {
    const searchTerm = getUsersSearchTerm();
    const deptFilter = (document.getElementById('users-dept-filter')?.value || '').toLowerCase().trim();
    const doorFilter = (document.getElementById('users-door-filter')?.value || '').trim();

    if (!searchTerm && !deptFilter && !doorFilter) return users;

    let doorSerial = null;
    let doorKey = null;
    if (doorFilter) {
        const parts = doorFilter.split('_');
        if (parts.length === 2) {
            doorSerial = parseInt(parts[0], 10);
            doorKey = `door${parts[1]}`;
        }
    }

    return (users || []).filter(u => {
        const uDept = (u.department || 'General').trim();
        if (deptFilter && uDept.toLowerCase() !== deptFilter) return false;

        if (doorSerial && doorKey) {
            const perms = u.permissions?.[doorSerial];
            if (!perms || !perms[doorKey]) return false;
        }

        if (!searchTerm) return true;
        return (
            (u.name || '').toLowerCase().includes(searchTerm) ||
            String(u.cardNumber).includes(searchTerm) ||
            String(u.rawCardNumber || '').includes(searchTerm) ||
            uDept.toLowerCase().includes(searchTerm)
        );
    });
}

function renderUsersTable(filtered) {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;

    if (filtered.length === 0) {
        const hasFilters = Boolean(getUsersSearchTerm() || document.getElementById('users-dept-filter')?.value || document.getElementById('users-door-filter')?.value);
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: var(--text-dim);">
                    <i class="fa-solid fa-users" style="font-size: 24px; margin-bottom: 8px;"></i>
                    <div>${hasFilters ? 'No user authorizations match the active search or filters.' : 'No user authorizations found. Click <b>+ Add User Privilege</b> to grant access or <b>Extract from Hardware</b> to import.'}</div>
                </td>
            </tr>
        `;
        if (typeof updateBatchBarUI === 'function') updateBatchBarUI();
        if (typeof updateSelectAllHeaderState === 'function') updateSelectAllHeaderState();
        return;
    }

    tbody.innerHTML = filtered.map(user => {
        const permChips = [];
        controllers.forEach(ctrl => {
            const ctrlPerms = user.permissions?.[ctrl.serialNumber] || {};
            (ctrl.doors || []).forEach(door => {
                if (ctrlPerms[`door${door.id}`]) {
                    permChips.push(`<span class="matrix-chip">${esc(ctrl.name.replace('Controller ', 'C').split('(')[0].trim())} · ${esc(door.name || 'D' + door.id)}</span>`);
                }
            });
        });

        const syncBadge = user.syncStatus === 'SYNCED'
            ? '<span class="badge-status" style="background: rgba(16,185,129,0.15); color: #10b981;">SYNCED</span>'
            : (user.syncStatus === 'PARTIAL' || user.syncStatus === 'PARTIAL_SYNC')
            ? '<span class="badge-status" style="background: rgba(245,158,11,0.15); color: #f59e0b;">PARTIAL</span>'
            : '<span class="badge-status" style="background: rgba(245,158,11,0.15); color: #f59e0b;">PENDING</span>';

        const initial = esc((user.name || 'U').charAt(0).toUpperCase());
        const isChecked = selectedUserCards.has(Number(user.cardNumber));

        return `
            <tr class="${isChecked ? 'row-selected' : ''}" data-user-id="${esc(user.id || '')}">
                <td style="text-align: center; width: 40px;" data-fn="__stop">
                    <input type="checkbox" class="chk-user-row" data-card="${user.cardNumber}" data-requires="write"
                           ${isChecked ? 'checked' : ''} 
                           style="cursor: pointer; width: 16px; height: 16px; accent-color: var(--accent-primary);">
                </td>
                <td>
                    <div class="user-name-cell">
                        <div class="user-avatar">${initial}</div>
                        <div>
                            <div style="font-weight: 600; color: var(--text-heading);">${esc(user.name)}</div>
                        </div>
                    </div>
                </td>
                <td>${esc(user.department || 'General')}</td>
                <td>
                    <b style="font-family: var(--font-mono); color: var(--accent-cyan); font-size: 13px;">${esc(user.cardNumber)}</b>
                </td>
                <td>
                    <div style="font-size: 12px; font-family: var(--font-mono); color: var(--text-muted);">
                        ${formatValidityDate(user.startDate)} ➔ ${formatValidityDate(user.endDate)}
                    </div>
                </td>
                <td style="max-width: 320px; width: 320px;">
                    ${permChips.length > 0 ? `<div class="door-perms-container" title="${permChips.length} door(s) assigned — scroll to see all">${permChips.join('')}</div>` : '<span style="color: var(--text-dim); font-size: 11px;">No Doors Assigned</span>'}
                </td>
                <td>${syncBadge}</td>
                <td style="text-align: right;">
                    <button class="btn btn-outline" style="padding: 5px 10px; font-size: 11px; margin-right: 4px;" 
                            data-fn="editUser" data-a1="${user.cardNumber}" data-requires="write" title="Edit privileges">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="btn btn-danger" style="padding: 5px 10px; font-size: 11px;" 
                            data-fn="deleteUser" data-a1="${user.cardNumber}" data-el="self" data-requires="write" title="Delete user">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    if (typeof updateBatchBarUI === 'function') updateBatchBarUI();
    if (typeof updateSelectAllHeaderState === 'function') updateSelectAllHeaderState();
}

function renderUsersByBoard(filtered) {
    const container = document.getElementById('users-board-view');
    if (!container) return;

    const doorFilter = (document.getElementById('users-door-filter')?.value || '').trim();
    let filterSerial = null;
    let filterDoorId = null;
    if (doorFilter) {
        const parts = doorFilter.split('_');
        if (parts.length === 2) {
            filterSerial = parseInt(parts[0], 10);
            filterDoorId = parseInt(parts[1], 10);
        }
    }

    const activeControllers = controllers.filter(c => isScannedController(c) && isControllerEnabled(c));
    if (activeControllers.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-server"></i>
                <h3 style="color: var(--text-heading); font-size: 16px;">No Controllers Detected</h3>
                <p>Run Scan Network first to populate the board view.</p>
            </div>
        `;
        return;
    }

    const controllersToShow = filterSerial ? activeControllers.filter(c => c.serialNumber === filterSerial) : activeControllers;

    container.innerHTML = controllersToShow.map(ctrl => {
        const doorsToShow = (filterSerial && ctrl.serialNumber === filterSerial && filterDoorId)
            ? (ctrl.doors || []).filter(d => d.id === filterDoorId)
            : (ctrl.doors || []);
        const doorSections = doorsToShow.map(door => {
            const doorKey = `door${door.id}`;
            const authorizedUsers = filtered.filter(u => {
                const perms = u.permissions?.[ctrl.serialNumber] || {};
                return !!perms[doorKey];
            });

            const userPills = authorizedUsers.length > 0
                ? authorizedUsers.map(u => `
                    <div class="board-user-pill">
                        <div class="user-avatar" style="width: 26px; height: 26px; font-size: 10px;">${esc((u.name || 'U').charAt(0).toUpperCase())}</div>
                        <div>
                            <div style="font-size: 12px; font-weight: 600; color: var(--text-heading);">${esc(u.name)}</div>
                            <div style="font-size: 10px; color: var(--text-dim); font-family: var(--font-mono);">#${esc(u.cardNumber)}</div>
                        </div>
                        <button class="btn btn-outline" style="padding: 2px 7px; font-size: 10px; margin-left: auto;"
                                data-fn="editUser" data-a1="${u.cardNumber}" data-requires="write" title="Edit privileges">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                    </div>
                `).join('')
                : `<div style="font-size: 12px; color: var(--text-dim); padding: 8px 4px; font-style: italic;">No users authorized for this door</div>`;

            return `
                <div class="board-door-section">
                    <div class="board-door-header">
                        <i class="fa-solid fa-door-closed" style="color: var(--accent-primary);"></i>
                        <span>${esc(door.name || 'Door ' + door.id)}</span>
                        <span class="board-user-count">${authorizedUsers.length} user${authorizedUsers.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div class="board-users-list">
                        ${userPills}
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="board-view-card">
                <div class="board-view-header">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <i class="fa-solid fa-server" style="color: var(--accent-cyan); font-size: 18px;"></i>
                        <div>
                            <div style="font-weight: 700; font-size: 15px; color: var(--text-heading);">${esc(ctrl.name)}</div>
                            <div style="font-size: 11px; color: var(--text-dim); font-family: var(--font-mono);">SN: ${ctrl.serialNumber} · ${esc(ctrl.ip)}</div>
                        </div>
                    </div>
                    <span class="badge-status">${esc(ctrl.status || 'ONLINE')}</span>
                </div>
                <div class="board-doors-grid">
                    ${doorSections}
                </div>
            </div>
        `;
    }).join('');
}

function renderUsers() {
    populateDepartmentFilter();
    populateDoorFilter();
    const filtered = filterUsers();

    const tableContainer = document.getElementById('users-table-container');
    const boardContainer = document.getElementById('users-board-view');

    if (usersViewMode === 'board') {
        if (tableContainer) tableContainer.style.display = 'none';
        if (boardContainer) boardContainer.style.display = 'block';
        renderUsersByBoard(filtered);
    } else {
        if (tableContainer) tableContainer.style.display = 'block';
        if (boardContainer) boardContainer.style.display = 'none';
        renderUsersTable(filtered);
    }
}

function setUsersView(mode) {
    usersViewMode = mode;

    const btnTable = document.getElementById('btn-view-table');
    const btnBoard = document.getElementById('btn-view-board');

    if (btnTable) btnTable.classList.toggle('active-view', mode === 'table');
    if (btnBoard) btnBoard.classList.toggle('active-view', mode === 'board');

    renderUsers();
}

// Global window bindings
window.getUsersSearchTerm = getUsersSearchTerm;
window.filterUsers = filterUsers;
window.populateDepartmentFilter = populateDepartmentFilter;
window.populateDoorFilter = populateDoorFilter;
window.formatValidityDate = formatValidityDate;
window.renderUsersTable = renderUsersTable;
window.renderUsersByBoard = renderUsersByBoard;
window.renderUsers = renderUsers;
window.setUsersView = setUsersView;
