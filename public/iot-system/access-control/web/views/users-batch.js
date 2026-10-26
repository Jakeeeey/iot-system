/**
 * ACCESS Professional - Batch User Selection Bar & Multi-Select
 * Selection bar management, row checkbox delegation, and selected user chips.
 */

function updateBatchBarUI() {
    const bar = document.getElementById('users-batch-bar');
    const countEl = document.getElementById('batch-bar-count');
    const badgeEl = document.getElementById('batch-badge-count');
    const previewEl = document.getElementById('batch-bar-names-preview');
    const modalCountEl = document.getElementById('batch-modal-user-count');

    const count = selectedUserCards.size;

    if (countEl) countEl.textContent = count;
    if (badgeEl) {
        badgeEl.textContent = count;
        badgeEl.style.display = count > 0 ? 'inline-block' : 'none';
    }
    if (modalCountEl) modalCountEl.textContent = count;

    if (bar) {
        bar.style.display = count > 0 ? 'flex' : 'none';
    }

    if (previewEl) {
        if (count === 0) {
            previewEl.textContent = '';
        } else {
            const selectedNames = [];
            for (const c of selectedUserCards) {
                const u = users.find(user => user.cardNumber === c);
                if (u) selectedNames.push(u.name || `#${c}`);
                if (selectedNames.length >= 3) break;
            }
            if (count > 3) {
                previewEl.textContent = `(${selectedNames.join(', ')} +${count - 3} more)`;
            } else {
                previewEl.textContent = `(${selectedNames.join(', ')})`;
            }
        }
    }
}

function updateSelectAllHeaderState() {
    const headerChk = document.getElementById('chk-user-select-all');
    if (!headerChk) return;
    const filtered = typeof filterUsers === 'function' ? filterUsers() : users;
    if (filtered.length === 0) {
        headerChk.checked = false;
        headerChk.indeterminate = false;
        return;
    }
    const visibleCards = filtered.map(u => u.cardNumber);
    const selectedCount = visibleCards.filter(c => selectedUserCards.has(c)).length;
    if (selectedCount === 0) {
        headerChk.checked = false;
        headerChk.indeterminate = false;
    } else if (selectedCount === visibleCards.length) {
        headerChk.checked = true;
        headerChk.indeterminate = false;
    } else {
        headerChk.checked = false;
        headerChk.indeterminate = true;
    }
}

function toggleSelectAllUsers(checked) {
    const filtered = typeof filterUsers === 'function' ? filterUsers() : users;
    filtered.forEach(u => {
        if (checked) {
            selectedUserCards.add(u.cardNumber);
        } else {
            selectedUserCards.delete(u.cardNumber);
        }
    });
    document.querySelectorAll('.chk-user-row').forEach(cb => {
        const card = Number(cb.dataset.card);
        cb.checked = selectedUserCards.has(card);
        const tr = cb.closest('tr');
        if (tr) tr.classList.toggle('row-selected', cb.checked);
    });
    updateBatchBarUI();
    updateSelectAllHeaderState();
}

function clearUserSelection() {
    selectedUserCards.clear();
    document.querySelectorAll('.chk-user-row').forEach(cb => {
        cb.checked = false;
        const tr = cb.closest('tr');
        if (tr) tr.classList.remove('row-selected');
    });
    const headerChk = document.getElementById('chk-user-select-all');
    if (headerChk) {
        headerChk.checked = false;
        headerChk.indeterminate = false;
    }
    updateBatchBarUI();
}

function renderBatchSelectedUsersChips() {
    const container = document.getElementById('batch-selected-users-list');
    const countEl = document.getElementById('batch-modal-user-count');
    if (!container) return;

    if (countEl) countEl.textContent = selectedUserCards.size;

    if (selectedUserCards.size === 0) {
        container.innerHTML = `
            <div style="font-size: 12px; color: var(--text-dim); padding: 12px 8px; width: 100%; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 4px;">
                <div style="color: var(--accent-cyan);"><i class="fa-solid fa-user-plus"></i> No cardholders selected yet</div>
                <div>Use the search bar above to add specific people, or click <a href="#" id="batch-chip-select-all" style="color: var(--accent-primary); font-weight: 600;">Select All Registered</a> to include everyone.</div>
            </div>
        `;
        document.getElementById('batch-chip-select-all')?.addEventListener('click', (e) => {
            e.preventDefault();
            users.forEach(u => selectedUserCards.add(u.cardNumber));
            renderBatchSelectedUsersChips();
            updateBatchBarUI();
            updateSelectAllHeaderState();
            document.querySelectorAll('.chk-user-row').forEach(cb => {
                cb.checked = selectedUserCards.has(Number(cb.dataset.card));
            });
        });
        return;
    }

    const chips = [];
    selectedUserCards.forEach(cardNumber => {
        const u = users.find(user => user.cardNumber === cardNumber);
        const name = u ? u.name : `Card #${cardNumber}`;
        chips.push(`
            <span class="batch-user-chip">
                <i class="fa-solid fa-user" style="color: var(--accent-cyan); font-size: 11px;"></i>
                <span style="font-weight: 600;">${esc(name)}</span>
                <span style="font-size: 10px; color: var(--text-dim); font-family: var(--font-mono);">#${cardNumber}</span>
                <i class="fa-solid fa-xmark remove-chip-btn" data-fn="removeCardFromBatch" data-a1="${cardNumber}" title="Remove from batch"></i>
            </span>
        `);
    });

    container.innerHTML = chips.join('');
}

function addCardToBatch(cardNumber) {
    const card = Number(cardNumber);
    if (!card || isNaN(card)) return;
    selectedUserCards.add(card);
    renderBatchSelectedUsersChips();
    updateBatchBarUI();
    updateSelectAllHeaderState();
    const cb = document.querySelector(`.chk-user-row[data-card="${card}"]`);
    if (cb) {
        cb.checked = true;
        const tr = cb.closest('tr');
        if (tr) tr.classList.add('row-selected');
    }
}

function addDepartmentToBatch(deptName) {
    if (!deptName) return;
    let added = 0;
    users.forEach(u => {
        if (u.department === deptName && u.cardNumber) {
            selectedUserCards.add(Number(u.cardNumber));
            added++;
        }
    });
    renderBatchSelectedUsersChips();
    updateBatchBarUI();
    updateSelectAllHeaderState();
    document.querySelectorAll('.chk-user-row').forEach(cb => {
        const card = Number(cb.dataset.card);
        cb.checked = selectedUserCards.has(card);
        const tr = cb.closest('tr');
        if (tr) tr.classList.toggle('row-selected', cb.checked);
    });
    if (typeof showToast === 'function') {
        showToast(`Added ${added} cardholder(s) from "${deptName}" to batch`, 'success');
    }
}

function removeCardFromBatch(cardNumber) {
    selectedUserCards.delete(cardNumber);
    renderBatchSelectedUsersChips();
    updateBatchBarUI();
    updateSelectAllHeaderState();
    const cb = document.querySelector(`.chk-user-row[data-card="${cardNumber}"]`);
    if (cb) {
        cb.checked = false;
        const tr = cb.closest('tr');
        if (tr) tr.classList.remove('row-selected');
    }
}

function initBatchUserSearch() {
    const input = document.getElementById('batch-user-search-input');
    const dropdown = document.getElementById('batch-user-search-dropdown');
    if (!input || !dropdown) return;

    function renderDropdown(searchTerm = '') {
        const query = searchTerm.toLowerCase().trim();
        const matches = users.filter(u => {
            if (!query) return true;
            return (
                (u.name || '').toLowerCase().includes(query) ||
                String(u.cardNumber || '').includes(query) ||
                (u.department || '').toLowerCase().includes(query) ||
                String(u.rawCardNumber || '').includes(query)
            );
        }).slice(0, 30);

        if (matches.length === 0) {
            dropdown.innerHTML = `
                <div style="padding: 12px; font-size: 12px; color: var(--text-dim); text-align: center;">
                    <i class="fa-solid fa-circle-info"></i> No cardholders match "${esc(searchTerm)}"
                </div>
            `;
            dropdown.style.display = 'block';
            return;
        }

        const unaddedMatches = matches.filter(u => !selectedUserCards.has(Number(u.cardNumber)));
        let html = '';
        if (unaddedMatches.length > 1) {
            html += `
                <div class="batch-search-add-all-header" id="btn-batch-add-all-search-matches" data-fn="batchAddAllMatches">
                    <span><i class="fa-solid fa-user-plus"></i> Add All ${unaddedMatches.length} Matching Cardholders</span>
                    <span style="font-size: 10px; opacity: 0.8;">Click to add all</span>
                </div>
            `;
        }

        html += matches.map(u => {
            const isAdded = selectedUserCards.has(Number(u.cardNumber));
            const initial = esc((u.name || 'U').charAt(0).toUpperCase());
            return `
                <div class="batch-search-item ${isAdded ? 'already-added' : ''}" data-card="${u.cardNumber}">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div class="user-avatar" style="width: 24px; height: 24px; font-size: 10px;">${initial}</div>
                        <div>
                            <div style="font-size: 12px; font-weight: 600; color: var(--text-heading);">${esc(u.name || 'Unnamed')}</div>
                            <div style="font-size: 10px; color: var(--text-dim);">${esc(u.department || 'General')} · #${esc(u.cardNumber)}</div>
                        </div>
                    </div>
                    <div>
                        ${isAdded 
                            ? '<span style="font-size: 11px; color: var(--accent-primary); font-weight: 600;"><i class="fa-solid fa-check"></i> Added</span>' 
                            : '<span class="btn btn-outline" style="padding: 2px 8px; font-size: 10px;"><i class="fa-solid fa-plus"></i> Add</span>'}
                    </div>
                </div>
            `;
        }).join('');

        dropdown.innerHTML = html;
        dropdown.style.display = 'block';

        dropdown.querySelector('#btn-batch-add-all-search-matches')?.addEventListener('click', (e) => {
            e.stopPropagation();
            unaddedMatches.forEach(u => selectedUserCards.add(Number(u.cardNumber)));
            renderBatchSelectedUsersChips();
            updateBatchBarUI();
            updateSelectAllHeaderState();
            document.querySelectorAll('.chk-user-row').forEach(cb => {
                cb.checked = selectedUserCards.has(Number(cb.dataset.card));
            });
            input.value = '';
            dropdown.style.display = 'none';
        });

        dropdown.querySelectorAll('.batch-search-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = Number(item.dataset.card);
                if (selectedUserCards.has(card)) {
                    removeCardFromBatch(card);
                } else {
                    addCardToBatch(card);
                }
                renderDropdown(input.value);
            });
        });
    }

    input.addEventListener('focus', () => {
        document.getElementById('batch-dept-dropdown')?.style.setProperty('display', 'none');
        renderDropdown(input.value);
    });

    input.addEventListener('input', () => {
        renderDropdown(input.value);
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            dropdown.style.display = 'none';
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const firstItem = dropdown.querySelector('.batch-search-item:not(.already-added)');
            if (firstItem) {
                addCardToBatch(Number(firstItem.dataset.card));
                renderDropdown(input.value);
            }
        }
    });
}

function initBatchDeptDropdown() {
    const btn = document.getElementById('btn-batch-add-by-dept');
    const dropdown = document.getElementById('batch-dept-dropdown');
    if (!btn || !dropdown) return;

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById('batch-user-search-dropdown')?.style.setProperty('display', 'none');
        if (dropdown.style.display === 'block') {
            dropdown.style.display = 'none';
            return;
        }

        const deptMap = new Map();
        users.forEach(u => {
            const d = u.department || 'General';
            deptMap.set(d, (deptMap.get(d) || 0) + 1);
        });

        const sortedDepts = Array.from(deptMap.entries()).sort((a, b) => b[1] - a[1]);
        dropdown.innerHTML = `
            <div style="padding: 6px 12px; font-size: 11px; font-weight: 700; color: var(--text-dim); text-transform: uppercase; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                Add All from Department
            </div>
            ${sortedDepts.map(([dept, count]) => `
                <div class="batch-dept-item" data-dept="${esc(dept)}">
                    <span><i class="fa-solid fa-users-viewfinder" style="color: var(--accent-cyan); font-size: 11px; margin-right: 6px;"></i> ${esc(dept)}</span>
                    <span class="batch-dept-count">${count} users</span>
                </div>
            `).join('')}
        `;
        dropdown.style.display = 'block';

        dropdown.querySelectorAll('.batch-dept-item').forEach(item => {
            item.addEventListener('click', (ev) => {
                ev.stopPropagation();
                const dept = item.dataset.dept;
                addDepartmentToBatch(dept);
                dropdown.style.display = 'none';
            });
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.batch-user-search-wrapper')) {
            document.getElementById('batch-user-search-dropdown')?.style.setProperty('display', 'none');
            document.getElementById('batch-dept-dropdown')?.style.setProperty('display', 'none');
        }
    });
}

// Global initialization
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initBatchUserSearch();
            initBatchDeptDropdown();
        });
    } else {
        initBatchUserSearch();
        initBatchDeptDropdown();
    }
}

// Global window bindings
window.updateBatchBarUI = updateBatchBarUI;
window.updateSelectAllHeaderState = updateSelectAllHeaderState;
window.toggleSelectAllUsers = toggleSelectAllUsers;
window.clearUserSelection = clearUserSelection;
window.renderBatchSelectedUsersChips = renderBatchSelectedUsersChips;
window.addCardToBatch = addCardToBatch;
window.addDepartmentToBatch = addDepartmentToBatch;
window.removeCardFromBatch = removeCardFromBatch;
window.initBatchUserSearch = initBatchUserSearch;
window.initBatchDeptDropdown = initBatchDeptDropdown;

