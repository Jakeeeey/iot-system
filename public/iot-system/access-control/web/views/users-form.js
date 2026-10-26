/**
 * ACCESS Professional - User Privilege Enrollment Modal Form
 * Manages single user creation, editing, W26/10D card hint detection, and door picker.
 */

function openUserModal(user = null) {
    if (!requireUiWrite()) return;
    const isEdit = !!user;
    const titleEl = document.getElementById('modal-user-title');
    if (titleEl) titleEl.textContent = isEdit ? 'Edit User Open Privilege' : 'Add User Open Privilege';

    const nameInput = document.getElementById('user-name');
    if (nameInput) nameInput.value = user ? user.name : '';

    const deptSelect = document.getElementById('user-dept');
    const customDeptInput = document.getElementById('user-dept-custom');
    if (customDeptInput) {
        customDeptInput.style.display = 'none';
        customDeptInput.value = '';
    }

    if (deptSelect) {
        const deptSet = new Set([
            'Accounting', 'Administrator', 'Audit', 'Development', 'Engineering',
            'Facility', 'General Staff', 'Human Resource', 'Logistics', 'M.I.S',
            'Marketing', 'Motorpool', 'Operations', 'Production', 'QA', 'Sales',
            'Security', 'Utility', 'Warehouse'
        ]);
        (users || []).forEach(u => {
            const d = (u.department || '').trim();
            if (d) deptSet.add(d);
        });
        if (user && user.department && user.department.trim()) {
            deptSet.add(user.department.trim());
        }

        const sortedDepts = Array.from(deptSet).sort((a, b) => a.localeCompare(b));
        deptSelect.innerHTML = sortedDepts.map(d => `<option value="${esc(d)}">${esc(d)}</option>`).join('') +
            '<option value="__custom__">+ Enter New Department...</option>';

        const targetDept = user ? (user.department || 'General Staff') : 'General Staff';
        if (sortedDepts.includes(targetDept)) {
            deptSelect.value = targetDept;
        } else if (targetDept) {
            deptSelect.value = '__custom__';
            if (customDeptInput) {
                customDeptInput.style.display = 'block';
                customDeptInput.value = targetDept;
            }
        } else {
            deptSelect.value = 'General Staff';
        }

        deptSelect.onchange = () => {
            if (deptSelect.value === '__custom__') {
                if (customDeptInput) {
                    customDeptInput.style.display = 'block';
                    customDeptInput.focus();
                }
            } else {
                if (customDeptInput) {
                    customDeptInput.style.display = 'none';
                }
            }
        };
    }
    const cardInput = document.getElementById('user-card');
    const rawCardHidden = document.getElementById('user-raw-card');
    const initialRaw = user && user.rawCardNumber ? String(user.rawCardNumber) : '';
    if (rawCardHidden) rawCardHidden.value = initialRaw;
    const initialCardVal = user ? (user.rawCardNumber || user.cardNumber) : '';
    if (cardInput) {
        cardInput.value = initialCardVal;
        cardInput.oninput = () => {
            const val = cardInput.value.trim();
            const parsed = typeof parseRfidCard === 'function' ? parseRfidCard(val) : null;
            if (rawCardHidden) {
                if (parsed?.raw10D) {
                    rawCardHidden.value = parsed.raw10D;
                } else if (val.length >= 8 && /^\d+$/.test(val)) {
                    rawCardHidden.value = val;
                } else if (!val) {
                    rawCardHidden.value = '';
                }
            }
            renderUserCardHint(val, rawCardHidden ? rawCardHidden.value : '');
        };
    }
    const pinInput = document.getElementById('user-pin');
    if (pinInput) pinInput.value = user && user.pin ? user.pin : '';
    const startInput = document.getElementById('user-start-date');
    if (startInput) startInput.value = user ? (user.startDate || DEFAULT_START_DATE).slice(0, 10) : DEFAULT_START_DATE;
    const endInput = document.getElementById('user-end-date');
    if (endInput) endInput.value = user ? (user.endDate || DEFAULT_END_DATE).slice(0, 10) : DEFAULT_END_DATE;

    renderUserCardHint(initialCardVal, initialRaw);

    const searchInput = document.getElementById('single-door-search-input');
    if (searchInput) searchInput.value = '';
    const clearSearchBtn = document.getElementById('btn-single-clear-door-search');
    if (clearSearchBtn) clearSearchBtn.style.display = 'none';
    const searchMeta = document.getElementById('single-doors-search-meta');
    if (searchMeta) searchMeta.style.display = 'none';

    const replaceRadio = document.querySelector('input[name="single-action-mode"][value="replace"]');
    if (replaceRadio) replaceRadio.checked = true;
    document.querySelectorAll('#modal-user .batch-mode-card').forEach(c => {
        c.classList.toggle('active', c.dataset.mode === 'replace');
    });

    const picker = document.getElementById('modal-doors-picker');
    if (picker) {
        const activeControllers = controllers.filter(isActiveController);
        if (activeControllers.length === 0) {
            picker.innerHTML = `
                <div style="color: var(--text-dim); font-size: 12px; padding: 10px; text-align: center;">
                    <i class="fa-solid fa-triangle-exclamation" style="color: var(--accent-warning);"></i>
                    No controllers currently detected on LAN. Run <b>Scan Network</b> to auto-populate doors.
                </div>
            `;
        } else {
            picker.innerHTML = activeControllers.map(ctrl => {
                const ctrlPerms = user?.permissions?.[ctrl.serialNumber] || {};
                const checkboxes = (ctrl.doors || []).map(door => {
                    const isChecked = !!ctrlPerms[`door${door.id}`];
                    const displayName = (door.name && !door.name.match(/^Door\s*\d+$/i))
                        ? `Door ${door.id}: ${door.name}`
                        : (door.name || `Door ${door.id}`);
                    return `
                        <label class="perm-checkbox-label" data-door-name="${esc(displayName).toLowerCase()}" data-door-id="${door.id}" data-serial="${ctrl.serialNumber}">
                            <input type="checkbox" name="perm-${ctrl.serialNumber}-${door.id}" value="1" ${isChecked ? 'checked' : ''} onchange="onSingleDoorCheckboxChange(${ctrl.serialNumber})">
                            <span>${esc(displayName)}</span>
                        </label>
                    `;
                }).join('');

                const allChecked = (ctrl.doors || []).length > 0 && (ctrl.doors || []).every(d => !!ctrlPerms[`door${d.id}`]);

                return `
                    <div class="perm-board-section" data-serial="${ctrl.serialNumber}" data-controller-name="${esc(ctrl.name).toLowerCase()}">
                        <div class="perm-board-title" style="cursor: pointer; user-select: none; display: flex; justify-content: space-between; align-items: center;" data-fn="toggleBoardDoors" data-a1="${ctrl.serialNumber}" data-a2="perm" title="Click controller to select or deselect its doors">
                            <span><i class="fa-solid fa-server"></i> ${esc(ctrl.name)} (SN:${ctrl.serialNumber})</span>
                            <span class="board-toggle-indicator" id="board-toggle-${ctrl.serialNumber}" style="font-size: 11px; font-weight: 500; color: var(--accent-cyan); display: inline-flex; align-items: center; gap: 4px;">
                                <i class="fa-solid ${allChecked ? 'fa-check-double' : 'fa-list-check'}"></i>
                                <span>${allChecked ? 'Deselect Board' : 'Select All Doors'}</span>
                            </span>
                        </div>
                        <div class="perm-doors-grid">
                            ${checkboxes}
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    updateSingleDoorsSelectedCount();
    applySingleDoorsSearch();

    const modal = document.getElementById('modal-user');
    if (modal) modal.classList.add('active');

    const prevResults = document.getElementById('user-sync-results');
    if (prevResults) {
        prevResults.style.display = 'none';
        prevResults.innerHTML = '';
    }
}

function toggleBoardDoors(serial, prefix = 'perm') {
    const selector = `input[name^="${prefix}-${serial}-"]`;
    const cbs = Array.from(document.querySelectorAll(selector));
    if (cbs.length === 0) return;

    // In batch mode with active filter, toggle visible doors
    const visibleCbs = cbs.filter(cb => {
        const label = cb.closest('.perm-checkbox-label');
        return !label || label.style.display !== 'none';
    });
    const targetCbs = visibleCbs.length > 0 ? visibleCbs : cbs;

    const allChecked = targetCbs.every(cb => cb.checked);
    const targetState = !allChecked;
    targetCbs.forEach(cb => { cb.checked = targetState; });
    updateBoardToggleLabel(serial, prefix);
    if (prefix === 'batch-perm' && typeof updateBatchDoorsSelectedCount === 'function') {
        updateBatchDoorsSelectedCount();
    }
    if (prefix === 'perm' && typeof updateSingleDoorsSelectedCount === 'function') {
        updateSingleDoorsSelectedCount();
    }
}

function updateBoardToggleLabel(serial, prefix = 'perm') {
    const selector = `input[name^="${prefix}-${serial}-"]`;
    const cbs = Array.from(document.querySelectorAll(selector));
    if (cbs.length === 0) return;
    const allChecked = cbs.every(cb => cb.checked);
    const indicatorId = prefix === 'perm' ? `board-toggle-${serial}` : `batch-board-toggle-${serial}`;
    const el = document.getElementById(indicatorId);
    if (el) {
        el.innerHTML = `<i class="fa-solid ${allChecked ? 'fa-check-double' : 'fa-list-check'}"></i> <span>${allChecked ? 'Deselect Board' : 'Select All Doors'}</span>`;
    }
}

function onSingleDoorCheckboxChange(serial) {
    updateBoardToggleLabel(serial, 'perm');
    updateSingleDoorsSelectedCount();
}

function updateSingleDoorsSelectedCount() {
    const badge = document.getElementById('single-doors-selected-badge');
    if (!badge) return;
    const checked = document.querySelectorAll('#modal-doors-picker input[type="checkbox"]:checked').length;
    badge.textContent = `${checked} selected`;
    badge.style.display = checked > 0 ? 'inline-block' : 'none';
}

function clearSingleDoorsSearch() {
    const input = document.getElementById('single-door-search-input');
    if (input) {
        input.value = '';
        input.focus();
    }
    applySingleDoorsSearch();
}

function applySingleDoorsSearch() {
    const input = document.getElementById('single-door-search-input');
    const clearBtn = document.getElementById('btn-single-clear-door-search');
    const metaBox = document.getElementById('single-doors-search-meta');
    const matchCountEl = document.getElementById('single-doors-match-count');
    const picker = document.getElementById('modal-doors-picker');
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
            } else {
                label.style.display = 'none';
            }
        });

        section.style.display = boardHasVisibleDoor ? 'block' : 'none';
    });

    if (query) {
        if (metaBox) metaBox.style.display = 'flex';
        if (matchCountEl) matchCountEl.textContent = `Showing ${matchingDoors} of ${totalDoors} doors`;
    } else if (metaBox) {
        metaBox.style.display = 'none';
    }
}

function initSingleDoorsSearch() {
    const input = document.getElementById('single-door-search-input');
    const clearBtn = document.getElementById('btn-single-clear-door-search');
    if (!input || input.dataset.searchBound) return;
    input.dataset.searchBound = '1';
    input.addEventListener('input', () => applySingleDoorsSearch());
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            input.value = '';
            applySingleDoorsSearch();
            input.blur();
        }
    });
    if (clearBtn && !clearBtn.dataset.searchBound) {
        clearBtn.dataset.searchBound = '1';
        clearBtn.addEventListener('click', () => clearSingleDoorsSearch());
    }
}

function renderUserCardHint(cardVal, rawOverride = '') {
    const cardHint = document.getElementById('user-card-hint');
    if (!cardHint) return;
    const str = String(cardVal || '').trim();
    if (!str) {
        cardHint.style.display = 'none';
        return;
    }
    const cInfo = typeof parseRfidCard === 'function' ? parseRfidCard(str) : null;
    if (cInfo) {
        cardHint.style.display = 'block';
        const tenD = rawOverride || cInfo.raw10D || (str.length >= 8 && /^\d+$/.test(str) ? str : null);
        cardHint.innerHTML = `<i class="fa-solid fa-id-card"></i> Hardware W26: <b>${esc(cInfo.wiegandNum)}</b> (FC: ${esc(cInfo.facility)}, ID: ${esc(cInfo.cardId)})${tenD ? ` | <i class="fa-solid fa-id-badge"></i> 10D Printed / Raw: <b>${esc(tenD)}</b>` : ` <span style="color: var(--accent-warning); margin-left: 6px;">— Tip: If your physical card has a 10-digit number, enter it here to link both!</span>`}`;
    } else {
        cardHint.style.display = 'none';
    }
}

function openAddUserWithCard(cardNumber, rawCardNumber = '') {
    openUserModal({
        name: 'New Cardholder',
        department: 'General Staff',
        cardNumber: cardNumber,
        rawCardNumber: rawCardNumber || '',
        pin: '',
        startDate: DEFAULT_START_DATE,
        endDate: DEFAULT_END_DATE,
        permissions: {}
    });
}

function editUser(cardIdentifier) {
    const cardStr = String(cardIdentifier || '').trim();
    const cardNum = Number(cardIdentifier);
    const user = users.find(u =>
        String(u.cardNumber) === cardStr ||
        (Number.isFinite(cardNum) && u.cardNumber === cardNum) ||
        String(u.rawCardNumber) === cardStr ||
        String(u.id) === cardStr
    );
    if (user) openUserModal(user);
    else console.warn('[editUser] User not found for card:', cardIdentifier);
}

function closeUserModal() {
    const modal = document.getElementById('modal-user');
    if (modal) modal.classList.remove('active');
}

function ensureUserSyncResultsContainer() {
    let el = document.getElementById('user-sync-results');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'user-sync-results';
    el.style.display = 'none';
    const form = document.getElementById('form-user');
    if (form && form.parentNode) form.parentNode.insertBefore(el, form.nextSibling);
    else document.querySelector('#modal-user .modal-card')?.appendChild(el);
    return el;
}

function wireUserSyncDoneButtons(box) {
    if (!box || typeof box.querySelectorAll !== 'function') return;
    box.querySelectorAll('[data-close-user]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (e && e.preventDefault) e.preventDefault();
            closeUserModal();
        });
    });
}
function boardLabelForSerial(serial) {
    const list = (typeof controllers !== 'undefined' && Array.isArray(controllers)) ? controllers : [];
    const ctrl = list.find(c => String(c.serialNumber) === String(serial));
    if (ctrl) return `${ctrl.name} (SN:${ctrl.serialNumber})`;
    return `SN:${serial}`;
}

function renderUserSyncResults(syncResults) {
    const box = ensureUserSyncResultsContainer();
    if (!box) return { accepted: 0, total: 0 };
    const list = Array.isArray(syncResults) ? syncResults : null;
    if (!list) {
        box.style.display = 'block';
        box.innerHTML = `
            <div style="margin-top: 14px; background: var(--bg-card-hover); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 12px 16px;">
                <div style="font-size: 12px; color: var(--accent-warning);"><i class="fa-solid fa-triangle-exclamation" style="margin-right: 6px;"></i> ${esc('Per-board confirmations unavailable for this upload.')}</div>
                <div style="margin-top: 10px; text-align: right;">
                    <button type="button" class="btn btn-outline" data-close-user><span>Done</span></button>
                </div>
            </div>
        `;
        wireUserSyncDoneButtons(box);
        return { accepted: 0, total: 0, unavailable: true };
    }
    const accepted = list.filter(r => r && r.success).length;
    const total = list.length;
    const rows = total === 0
        ? `<div style="font-size: 12px; color: var(--text-dim); padding: 4px 0;">${esc('No boards responded to this upload.')}</div>`
        : list.map(r => {
            const serial = r ? r.serial : undefined;
            const label = esc(boardLabelForSerial(serial));
            if (r && r.success) {
                const doors = Array.isArray(r.doorResults) ? r.doorResults : [];
                const doorRows = doors.map(d => {
                    const doorId = (d && d.door !== undefined && d.door !== null) ? String(d.door) : '?';
                    if (!d || d.unverified || d.actual === null || d.actual === undefined) {
                        return `<div style="margin-left: 24px; font-size: 11px; padding: 2px 0; color: var(--text-dim);"><i class="fa-solid fa-circle-question" style="color: var(--accent-warning); margin-right: 6px;"></i> <span>${esc(`Door ${doorId} unverified (read-back unavailable)`)}</span></div>`;
                    }
                    if (d.match === true) {
                        return `<div style="margin-left: 24px; font-size: 11px; padding: 2px 0; color: var(--text-main);"><i class="fa-solid fa-check" style="color: #10b981; margin-right: 6px;"></i> <span>${esc(`Door ${doorId} verified`)}</span></div>`;
                    }
                    const reqText = d.requested ? 'allowed' : 'denied';
                    const actText = d.actual ? 'allowed' : 'denied';
                    return `<div style="margin-left: 24px; font-size: 11px; padding: 2px 0; color: var(--text-main);"><i class="fa-solid fa-xmark" style="color: #ef4444; margin-right: 6px;"></i> <span>${esc(`Door ${doorId} mismatch (requested: ${reqText}, actual: ${actText})`)}</span></div>`;
                }).join('');
                return `<div style="font-size: 12px; padding: 4px 0; color: var(--text-main);"><div style="display: flex; align-items: center; gap: 8px;"><i class="fa-solid fa-circle-check" style="color: #10b981;"></i> <span>${label}</span> <span style="color: #10b981; font-weight: 600;">Accepted</span></div>${doorRows}</div>`;
            }
            const errText = esc(String((r && r.error) || 'No ACK from controller'));
            return `<div style="font-size: 12px; padding: 4px 0; color: var(--text-main);"><div style="display: flex; align-items: center; gap: 8px;"><i class="fa-solid fa-circle-xmark" style="color: #ef4444;"></i> <span>${label}</span> <span style="color: #ef4444; font-weight: 600;">Failed</span></div><div style="margin-left: 24px; color: var(--text-dim); font-size: 11px;">${errText}</div></div>`;
        }).join('');
    box.style.display = 'block';
    box.innerHTML = `
        <div style="margin-top: 14px; background: var(--bg-card-hover); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 12px 16px;">
            <div style="font-size: 12px; font-weight: 600; color: var(--text-main); margin-bottom: 6px;"><i class="fa-solid fa-server" style="margin-right: 6px; color: var(--accent-cyan);"></i> ${esc(`Hardware confirmations: ${accepted}/${total} boards accepted`)}</div>
            ${rows}
            <div style="margin-top: 10px; text-align: right;">
                <button type="button" class="btn btn-outline" data-close-user><span>Done</span></button>
            </div>
        </div>
    `;
    wireUserSyncDoneButtons(box);
    return { accepted, total };
}

function renderUserSyncError(message) {
    const box = ensureUserSyncResultsContainer();
    if (!box) return;
    box.style.display = 'block';
    box.innerHTML = `
        <div style="margin-top: 14px; background: var(--bg-card-hover); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 12px 16px;">
            <div style="font-size: 12px; color: #ef4444;"><i class="fa-solid fa-circle-xmark" style="margin-right: 6px;"></i> ${esc(message)}</div>
            <div style="margin-top: 10px; text-align: right;">
                <button type="button" class="btn btn-outline" data-close-user><span>Close</span></button>
            </div>
        </div>
    `;
    wireUserSyncDoneButtons(box);
}

async function submitUserForm(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!requireUiWrite()) return;
    const name = document.getElementById('user-name').value.trim();
    let department = document.getElementById('user-dept')?.value?.trim() || 'General Staff';
    if (department === '__custom__') {
        const customVal = document.getElementById('user-dept-custom')?.value?.trim();
        department = customVal || 'General Staff';
    }
    const cardRaw = document.getElementById('user-card').value.trim();
    const cardParsed = typeof parseRfidCard === 'function' ? parseRfidCard(cardRaw) : null;
    const cardNumber = cardParsed ? cardParsed.wiegandNum : parseInt(cardRaw, 10);
    const rawCardHiddenVal = document.getElementById('user-raw-card')?.value?.trim();
    const rawCardNumber = rawCardHiddenVal || cardParsed?.raw10D || (cardRaw.length >= 8 && /^\d+$/.test(cardRaw) ? cardRaw : null);
    const pin = parseInt(document.getElementById('user-pin').value, 10) || 0;
    const startDate = document.getElementById('user-start-date').value;
    const endDate = document.getElementById('user-end-date').value;

    const modeRadio = document.querySelector('input[name="single-action-mode"]:checked');
    const mode = modeRadio ? modeRadio.value : 'replace';

    const checkedPerms = {};
    controllers.forEach(ctrl => {
        checkedPerms[ctrl.serialNumber] = {
            door1: !!document.querySelector(`input[name="perm-${ctrl.serialNumber}-1"]`)?.checked,
            door2: !!document.querySelector(`input[name="perm-${ctrl.serialNumber}-2"]`)?.checked,
            door3: !!document.querySelector(`input[name="perm-${ctrl.serialNumber}-3"]`)?.checked,
            door4: !!document.querySelector(`input[name="perm-${ctrl.serialNumber}-4"]`)?.checked
        };
    });

    let checkedCount = 0;
    Object.values(checkedPerms).forEach(p => {
        if (p.door1) checkedCount++;
        if (p.door2) checkedCount++;
        if (p.door3) checkedCount++;
        if (p.door4) checkedCount++;
    });

    const existingUser = Array.isArray(users) ? users.find(u =>
        u.cardNumber === cardNumber || String(u.rawCardNumber) === String(cardRaw)
    ) : null;

    let permissions;
    if (!existingUser || mode === 'replace') {
        permissions = checkedPerms;
    } else if (mode === 'grant') {
        if (checkedCount === 0) {
            showToast('Grant mode: check at least one door to add.', 'warning');
            return;
        }
        permissions = {};
        controllers.forEach(ctrl => {
            const prev = existingUser.permissions?.[ctrl.serialNumber] || {};
            const next = checkedPerms[ctrl.serialNumber] || {};
            permissions[ctrl.serialNumber] = {
                door1: !!prev.door1 || !!next.door1,
                door2: !!prev.door2 || !!next.door2,
                door3: !!prev.door3 || !!next.door3,
                door4: !!prev.door4 || !!next.door4
            };
        });
    } else if (mode === 'revoke') {
        if (checkedCount === 0) {
            showToast('Revoke mode: check at least one door to remove.', 'warning');
            return;
        }
        permissions = {};
        controllers.forEach(ctrl => {
            const prev = existingUser.permissions?.[ctrl.serialNumber] || {};
            const next = checkedPerms[ctrl.serialNumber] || {};
            permissions[ctrl.serialNumber] = {
                door1: !!prev.door1 && !next.door1,
                door2: !!prev.door2 && !next.door2,
                door3: !!prev.door3 && !next.door3,
                door4: !!prev.door4 && !next.door4
            };
        });
    }

    const submitBtn = document.querySelector('#form-user button[type="submit"]');
    const submitSpan = submitBtn ? submitBtn.querySelector('span') : null;
    const submitIcon = submitBtn ? submitBtn.querySelector('i') : null;
    const origLabel = submitSpan ? submitSpan.textContent : '';
    const origIcon = submitIcon ? submitIcon.className : '';
    if (submitBtn) submitBtn.disabled = true;
    if (submitSpan) submitSpan.textContent = 'Uploading to Hardware...';
    if (submitIcon) submitIcon.className = 'fa-solid fa-spinner fa-spin';

    try {
        const res = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, department, cardNumber, rawCardNumber, pin, startDate, endDate, permissions })
        });
        let data = null;
        try {
            data = await res.json();
        } catch (parseErr) {
            renderUserSyncError(`Upload failed: ${res.status} ${res.statusText || 'Invalid server response'}. Form unchanged — fix and retry.`);
            showToast('Save error: invalid server response (per-board confirmations unavailable).', 'danger');
            return;
        }
        if (!res.ok || !data.success) {
            const errMsg = (data && data.error) ? String(data.error) : `HTTP ${res.status}`;
            renderUserSyncError(`Upload failed: ${errMsg}. Form unchanged — fix and retry.`);
            showToast(`Save error: ${errMsg}`, 'danger');
            return;
        }
        const syncResults = (data && data.syncResults !== undefined)
            ? data.syncResults
            : (data && data.data && data.data.syncResults !== undefined ? data.data.syncResults : undefined);
        const outcome = renderUserSyncResults(syncResults);
        if (outcome.unavailable) {
            showToast('User saved, but per-board confirmations unavailable.', 'warning');
        } else {
            showToast(`Privileges accepted by ${outcome.accepted}/${outcome.total} boards`, outcome.accepted === outcome.total ? 'success' : 'warning');
        }
        try {
            if (typeof loadUsers === 'function') await loadUsers();
        } catch (refreshErr) {
            console.warn('[submitUserForm] post-save refresh failed:', refreshErr?.message || refreshErr);
        }
        setTimeout(() => {
            if (typeof rebuildMonitorTable === 'function') rebuildMonitorTable();
            if (typeof renderHistory === 'function') renderHistory();
        }, 300);
    } catch (err) {
        renderUserSyncError(`Upload failed: ${err.message}. Form unchanged — check network and retry.`);
        showToast(`Save error: ${err.message}`, 'danger');
    } finally {
        if (submitBtn) submitBtn.disabled = false;
        if (submitSpan) submitSpan.textContent = origLabel;
        if (submitIcon) submitIcon.className = origIcon;
    }
}

// Global window bindings
window.openUserModal = openUserModal;
window.openAddUserWithCard = openAddUserWithCard;
window.editUser = editUser;
window.closeUserModal = closeUserModal;
window.submitUserForm = submitUserForm;
window.renderUserSyncResults = renderUserSyncResults;
window.toggleBoardDoors = toggleBoardDoors;
window.updateBoardToggleLabel = updateBoardToggleLabel;
window.onSingleDoorCheckboxChange = onSingleDoorCheckboxChange;
window.updateSingleDoorsSelectedCount = updateSingleDoorsSelectedCount;
window.applySingleDoorsSearch = applySingleDoorsSearch;
window.clearSingleDoorsSearch = clearSingleDoorsSearch;
window.initSingleDoorsSearch = initSingleDoorsSearch;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initSingleDoorsSearch();
    });
} else {
    initSingleDoorsSearch();
}
