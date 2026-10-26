/**
 * ACCESS Professional - Batch User Privileges Dispatcher & Modal
 * Manages the batch assignment modal, door picker matrix, progress bar, and bulk 0x50 UDP dispatch.
 */

function openBatchPrivilegeModal() {
    if (!requireUiWrite()) return;
    const searchInput = document.getElementById('batch-user-search-input');
    if (searchInput) searchInput.value = '';
    const userDropdown = document.getElementById('batch-user-search-dropdown');
    if (userDropdown) userDropdown.style.display = 'none';
    const deptDropdown = document.getElementById('batch-dept-dropdown');
    if (deptDropdown) deptDropdown.style.display = 'none';

    const doorSearchInput = document.getElementById('batch-door-search-input');
    if (doorSearchInput) doorSearchInput.value = '';
    const clearDoorBtn = document.getElementById('btn-batch-clear-door-search');
    if (clearDoorBtn) clearDoorBtn.style.display = 'none';
    const doorMetaBox = document.getElementById('batch-doors-search-meta');
    if (doorMetaBox) doorMetaBox.style.display = 'none';

    if (selectedUserCards.size === 0) {
        const filtered = typeof filterUsers === 'function' ? filterUsers() : users;
        if (filtered.length > 0) {
            filtered.forEach(u => selectedUserCards.add(u.cardNumber));
            document.querySelectorAll('.chk-user-row').forEach(cb => {
                cb.checked = selectedUserCards.has(Number(cb.dataset.card));
            });
            if (typeof updateSelectAllHeaderState === 'function') updateSelectAllHeaderState();
        }
    }

    if (typeof renderBatchSelectedUsersChips === 'function') renderBatchSelectedUsersChips();
    renderBatchDoorsPicker();

    const grantRadio = document.querySelector('input[name="batch-action-mode"][value="grant"]');
    if (grantRadio) grantRadio.checked = true;
    document.querySelectorAll('.batch-mode-card').forEach(c => {
        c.classList.toggle('active', c.dataset.mode === 'grant');
    });
    updateBatchSubmitButtonLabel('grant');

    const chkDates = document.getElementById('chk-batch-update-dates');
    if (chkDates) chkDates.checked = false;
    const datesGroup = document.getElementById('batch-dates-group');
    if (datesGroup) datesGroup.style.display = 'none';

    const progContainer = document.getElementById('batch-progress-container');
    if (progContainer) progContainer.style.display = 'none';

    const btnSubmit = document.getElementById('btn-submit-batch');
    if (btnSubmit) btnSubmit.disabled = false;

    if (typeof updateBatchBarUI === 'function') updateBatchBarUI();
    document.getElementById('modal-batch-privilege')?.classList.add('active');
}

function closeBatchPrivilegeModal() {
    document.getElementById('modal-batch-privilege')?.classList.remove('active');
}

function onBatchDoorCheckboxChange(serial) {
    if (typeof updateBoardToggleLabel === 'function') {
        updateBoardToggleLabel(serial, 'batch-perm');
    }
    updateBatchDoorsSelectedCount();
}

function updateBatchDoorsSelectedCount() {
    const badge = document.getElementById('batch-doors-selected-badge');
    if (!badge) return;
    const checked = document.querySelectorAll('#batch-doors-picker input[type="checkbox"]:checked').length;
    badge.textContent = `${checked} selected`;
    badge.style.display = checked > 0 ? 'inline-block' : 'none';
}

function clearBatchDoorsSearch() {
    const input = document.getElementById('batch-door-search-input');
    if (input) {
        input.value = '';
        input.focus();
    }
    applyBatchDoorsSearch();
}

function applyBatchDoorsSearch() {
    const input = document.getElementById('batch-door-search-input');
    const clearBtn = document.getElementById('btn-batch-clear-door-search');
    const metaBox = document.getElementById('batch-doors-search-meta');
    const matchCountEl = document.getElementById('batch-doors-match-count');
    const selectAllLink = document.getElementById('link-batch-select-all-doors');
    const clearDoorsLink = document.getElementById('link-batch-clear-doors');
    const picker = document.getElementById('batch-doors-picker');
    if (!picker) return;

    const query = (input?.value || '').toLowerCase().trim();
    if (clearBtn) clearBtn.style.display = query ? 'block' : 'none';

    const boardSections = picker.querySelectorAll('.perm-board-section');
    if (boardSections.length === 0) return;

    let totalDoors = 0;
    let matchingDoors = 0;

    boardSections.forEach(section => {
        const boardName = (section.getAttribute('data-controller-name') || '').toLowerCase();
        const serial = String(section.getAttribute('data-serial') || '').toLowerCase();
        const boardMatches = query ? (boardName.includes(query) || serial.includes(query)) : true;

        const doorLabels = section.querySelectorAll('.perm-checkbox-label');
        let boardHasVisibleDoor = false;

        doorLabels.forEach(label => {
            totalDoors++;
            const doorName = (label.getAttribute('data-door-name') || '').toLowerCase();
            const doorId = String(label.getAttribute('data-door-id') || '').toLowerCase();
            const doorMatches = !query || boardMatches || doorName.includes(query) || doorId === query || `door ${doorId}`.includes(query);

            if (doorMatches) {
                label.style.display = 'flex';
                boardHasVisibleDoor = true;
                matchingDoors++;
                if (query && !boardMatches) {
                    label.classList.add('door-match-highlight');
                } else {
                    label.classList.remove('door-match-highlight');
                }
            } else {
                label.style.display = 'none';
                label.classList.remove('door-match-highlight');
            }
        });

        if (boardHasVisibleDoor) {
            section.style.display = 'block';
        } else {
            section.style.display = 'none';
        }
    });

    let emptyEl = document.getElementById('batch-doors-no-matches');
    if (query && matchingDoors === 0) {
        if (!emptyEl) {
            emptyEl = document.createElement('div');
            emptyEl.id = 'batch-doors-no-matches';
            emptyEl.className = 'batch-doors-empty-search';
            picker.appendChild(emptyEl);
        }
        emptyEl.innerHTML = `
            <i class="fa-solid fa-magnifying-glass"></i>
            <div>No target doors found matching "<strong>${esc(query)}</strong>"</div>
            <button type="button" class="btn btn-outline" style="margin-top: 8px; font-size: 11px; padding: 4px 10px;" onclick="clearBatchDoorsSearch()">Clear Search Filter</button>
        `;
        emptyEl.style.display = 'block';
    } else if (emptyEl) {
        emptyEl.style.display = 'none';
    }

    if (query) {
        if (metaBox) metaBox.style.display = 'flex';
        if (matchCountEl) {
            matchCountEl.innerHTML = `<i class="fa-solid fa-filter" style="color: var(--accent-cyan); margin-right: 4px;"></i> Showing <strong>${matchingDoors}</strong> of ${totalDoors} doors`;
        }
        if (selectAllLink) selectAllLink.textContent = `Select Filtered (${matchingDoors})`;
        if (clearDoorsLink) clearDoorsLink.textContent = `Clear Filtered`;
    } else {
        if (metaBox) metaBox.style.display = 'none';
        if (selectAllLink) selectAllLink.textContent = 'Select All Doors';
        if (clearDoorsLink) clearDoorsLink.textContent = 'Clear';
    }
}

function initBatchDoorsSearch() {
    const input = document.getElementById('batch-door-search-input');
    const clearBtn = document.getElementById('btn-batch-clear-door-search');
    if (!input) return;

    if (!input.dataset.searchBound) {
        input.dataset.searchBound = '1';
        input.addEventListener('input', () => {
            applyBatchDoorsSearch();
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                input.value = '';
                applyBatchDoorsSearch();
                input.blur();
            }
        });
    }

    if (clearBtn && !clearBtn.dataset.searchBound) {
        clearBtn.dataset.searchBound = '1';
        clearBtn.addEventListener('click', () => {
            clearBatchDoorsSearch();
        });
    }
}

function renderBatchDoorsPicker() {
    const picker = document.getElementById('batch-doors-picker');
    if (!picker) return;

    const activeControllers = controllers.filter(isActiveController);
    if (activeControllers.length === 0) {
        picker.innerHTML = `
            <div style="color: var(--text-dim); font-size: 12px; padding: 10px; text-align: center;">
                <i class="fa-solid fa-triangle-exclamation" style="color: var(--accent-warning);"></i>
                No controllers currently detected on LAN. Run <b>Scan Network</b> to auto-populate doors.
            </div>
        `;
        updateBatchDoorsSelectedCount();
        return;
    }

    picker.innerHTML = activeControllers.map(ctrl => {
        const checkboxes = (ctrl.doors || []).map(door => {
            const displayName = (door.name && !door.name.match(/^Door\s*\d+$/i))
                ? `Door ${door.id}: ${door.name}`
                : (door.name || `Door ${door.id}`);
            return `
                <label class="perm-checkbox-label" data-door-name="${esc(displayName).toLowerCase()}" data-door-id="${door.id}" data-serial="${ctrl.serialNumber}">
                    <input type="checkbox" name="batch-perm-${ctrl.serialNumber}-${door.id}" value="1" onchange="onBatchDoorCheckboxChange(${ctrl.serialNumber})">
                    <span>${esc(displayName)}</span>
                </label>
            `;
        }).join('');

        return `
            <div class="perm-board-section" data-serial="${ctrl.serialNumber}" data-controller-name="${esc(ctrl.name).toLowerCase()}">
                <div class="perm-board-title" style="cursor: pointer; user-select: none; display: flex; justify-content: space-between; align-items: center;" data-fn="toggleBoardDoors" data-a1="${ctrl.serialNumber}" data-a2="batch-perm" title="Click controller to select or deselect its doors">
                    <span><i class="fa-solid fa-server"></i> ${esc(ctrl.name)} (SN:${ctrl.serialNumber})</span>
                    <span class="board-toggle-indicator" id="batch-board-toggle-${ctrl.serialNumber}" style="font-size: 11px; font-weight: 500; color: var(--accent-cyan); display: inline-flex; align-items: center; gap: 4px;">
                        <i class="fa-solid fa-list-check"></i>
                        <span>Select All Doors</span>
                    </span>
                </div>
                <div class="perm-doors-grid">
                    ${checkboxes}
                </div>
            </div>
        `;
    }).join('');

    updateBatchDoorsSelectedCount();
    applyBatchDoorsSearch();
}

function updateBatchSubmitButtonLabel(mode) {
    const label = document.getElementById('batch-submit-label');
    const icon = document.getElementById('batch-submit-icon');
    if (!label) return;

    if (mode === 'grant') {
        label.textContent = 'Grant Doors & Push UDP';
        if (icon) icon.className = 'fa-solid fa-circle-plus';
    } else if (mode === 'revoke') {
        label.textContent = 'Revoke Doors & Push UDP';
        if (icon) icon.className = 'fa-solid fa-circle-minus';
    } else if (mode === 'replace') {
        label.textContent = 'Overwrite All & Push UDP';
        if (icon) icon.className = 'fa-solid fa-arrows-rotate';
    }
}

async function submitBatchPrivileges(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!requireUiWrite()) return;

    if (selectedUserCards.size === 0) {
        showToast('Please select at least one cardholder for batch privileges.', 'warning');
        return;
    }

    const modeRadio = document.querySelector('input[name="batch-action-mode"]:checked');
    const action = modeRadio ? modeRadio.value : 'grant';

    const doors = {};
    let totalDoorsChecked = 0;
    controllers.forEach(ctrl => {
        const d1 = !!document.querySelector(`input[name="batch-perm-${ctrl.serialNumber}-1"]`)?.checked;
        const d2 = !!document.querySelector(`input[name="batch-perm-${ctrl.serialNumber}-2"]`)?.checked;
        const d3 = !!document.querySelector(`input[name="batch-perm-${ctrl.serialNumber}-3"]`)?.checked;
        const d4 = !!document.querySelector(`input[name="batch-perm-${ctrl.serialNumber}-4"]`)?.checked;
        doors[ctrl.serialNumber] = { door1: d1, door2: d2, door3: d3, door4: d4 };
        if (d1) totalDoorsChecked++;
        if (d2) totalDoorsChecked++;
        if (d3) totalDoorsChecked++;
        if (d4) totalDoorsChecked++;
    });

    const updateDates = !!document.getElementById('chk-batch-update-dates')?.checked;
    const startDate = document.getElementById('batch-start-date')?.value || DEFAULT_START_DATE;
    const endDate = document.getElementById('batch-end-date')?.value || DEFAULT_END_DATE;

    if (totalDoorsChecked === 0 && action !== 'replace' && !updateDates) {
        showToast('Please check at least one door to assign/revoke, or enable validity dates update.', 'warning');
        return;
    }

    const cardNumbers = Array.from(selectedUserCards);
    const count = cardNumbers.length;

    const btnSubmit = document.getElementById('btn-submit-batch');
    const submitLabel = document.getElementById('batch-submit-label');
    const submitIcon = document.getElementById('batch-submit-icon');
    const progContainer = document.getElementById('batch-progress-container');
    const progText = document.getElementById('batch-progress-text');
    const progBar = document.getElementById('batch-progress-bar');
    const progPct = document.getElementById('batch-progress-pct');

    if (btnSubmit) btnSubmit.disabled = true;
    if (submitLabel) submitLabel.textContent = 'Uploading to Hardware...';
    if (submitIcon) submitIcon.className = 'fa-solid fa-spinner fa-spin';
    if (progContainer) progContainer.style.display = 'block';
    if (progBar) progBar.style.width = '35%';
    if (progPct) progPct.textContent = '35%';
    if (progText) progText.innerHTML = `<i class="fa-solid fa-spinner fa-spin" style="margin-right: 6px; color: var(--accent-cyan);"></i> Dispatching 0x50 packets to controllers for ${count} users...`;

    try {
        const res = await fetch('/api/users/batch-privileges', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cardNumbers,
                action,
                doors,
                updateDates,
                startDate,
                endDate
            })
        });

        if (progBar) progBar.style.width = '85%';
        if (progPct) progPct.textContent = '85%';

        const data = await res.json();
        if (data.success) {
            if (progBar) progBar.style.width = '100%';
            if (progPct) progPct.textContent = '100%';

            if (typeof loadUsers === 'function') await loadUsers();

            const rawBoardResults = Array.isArray(data.boardResults)
                ? data.boardResults
                : (data.data && Array.isArray(data.data.boardResults) ? data.data.boardResults : null);

            if (!rawBoardResults) {
                if (progText) progText.innerHTML = `<i class="fa-solid fa-triangle-exclamation" style="color: var(--accent-warning); margin-right: 6px;"></i> Completed for ${esc(String(data.count ?? count))} cardholder(s), but per-board confirmations are unavailable (old server response).`;
                showToast(`Batch privileges updated for ${data.count ?? count} cardholder(s), but per-board confirmations unavailable (old server).`, 'warning');
                if (btnSubmit) btnSubmit.disabled = false;
                updateBatchSubmitButtonLabel(action);
            } else if (rawBoardResults.length === 0) {
                if (progText) progText.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #10b981; margin-right: 6px;"></i> Completed! No boards were touched.`;
                showToast('Batch completed: no boards were touched.', 'warning');
                if (btnSubmit) btnSubmit.disabled = false;
                updateBatchSubmitButtonLabel(action);
            } else {
                const list = (typeof controllers !== 'undefined' && Array.isArray(controllers)) ? controllers : [];
                const rows = rawBoardResults.map(r => {
                    const serial = r.serial;
                    const match = list.find(c => Number(c.serialNumber) === Number(serial));
                    const boardName = match && match.name ? match.name : `SN:${serial}`;
                    const okN = Number(r.ok) || 0;
                    const failN = Number(r.failed) || 0;
                    const failCards = Array.isArray(r.failedCards) ? r.failedCards : [];
                    const failDetail = (failN > 0 && failCards.length > 0)
                        ? ` <span style="color: var(--accent-danger);">— failed cards: ${esc(failCards.map(String).join(', '))}</span>`
                        : '';
                    return `<div class="batch-board-row" style="padding: 2px 0; font-size: 12px;">${esc(String(boardName))} (${esc('SN:' + serial)}) — ${esc(String(okN))} accepted, ${esc(String(failN))} failed${failDetail}</div>`;
                }).join('');
                if (progText) progText.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #10b981; margin-right: 6px;"></i> Completed!<div style="margin-top: 6px;">${rows}</div>`;
                const acceptedBoards = rawBoardResults.filter(r => (Number(r.failed) || 0) === 0).length;
                const failedSends = rawBoardResults.reduce((s, r) => s + (Number(r.failed) || 0), 0);
                showToast(`Batch accepted by ${acceptedBoards}/${rawBoardResults.length} boards, ${failedSends} card(s) failed`, failedSends > 0 ? 'warning' : 'success');
                if (btnSubmit) btnSubmit.disabled = false;
                updateBatchSubmitButtonLabel(action);
            }
        } else {
            showToast(`Batch privilege error: ${data.error}`, 'danger');
            if (btnSubmit) btnSubmit.disabled = false;
            updateBatchSubmitButtonLabel(action);
            if (progContainer) progContainer.style.display = 'none';
        }
    } catch (err) {
        showToast(`Request failed: ${err.message}`, 'danger');
        if (btnSubmit) btnSubmit.disabled = false;
        updateBatchSubmitButtonLabel(action);
        if (progContainer) progContainer.style.display = 'none';
    }
}

// Global window bindings
window.openBatchPrivilegeModal = openBatchPrivilegeModal;
window.closeBatchPrivilegeModal = closeBatchPrivilegeModal;
window.renderBatchDoorsPicker = renderBatchDoorsPicker;
window.applyBatchDoorsSearch = applyBatchDoorsSearch;
window.clearBatchDoorsSearch = clearBatchDoorsSearch;
window.initBatchDoorsSearch = initBatchDoorsSearch;
window.updateBatchDoorsSelectedCount = updateBatchDoorsSelectedCount;
window.onBatchDoorCheckboxChange = onBatchDoorCheckboxChange;
window.updateBatchSubmitButtonLabel = updateBatchSubmitButtonLabel;
window.submitBatchPrivileges = submitBatchPrivileges;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initBatchDoorsSearch();
    });
} else {
    initBatchDoorsSearch();
}

