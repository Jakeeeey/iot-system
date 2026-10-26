/**
 * ACCESS Professional Door Control Management - Web Console Bootstrapper
 * Coordinates DOM initialization, event delegation, and application lifecycle.
 */

document.addEventListener('DOMContentLoaded', () => {
    if (typeof initTheme === 'function') initTheme();
    if (typeof updateAdminTokenDisplay === 'function') updateAdminTokenDisplay();
    if (typeof setupTabs === 'function') setupTabs();
    if (typeof initSidebarCollapse === 'function') initSidebarCollapse();
    if (typeof initEventStream === 'function') initEventStream();

    // Chain loadControllers → loadUsers → loadHistory so all privileges, stats, and monitor rows populate immediately
    loadControllers().then(() => loadUsers()).then(() => loadHistory());

    // Command Center: quick actions, remote pulse, emergency confirm triggers
    document.getElementById('cc-qa-scan')?.addEventListener('click', () => scanNetwork());
    document.getElementById('cc-qa-sync')?.addEventListener('click', () => syncAllControllerClocks());
    document.getElementById('cc-qa-batch')?.addEventListener('click', () => openBatchPrivilegeModal());
    document.getElementById('cc-pulse-btn')?.addEventListener('click', () => ccDoPulse());
    document.getElementById('cc-em-open')?.addEventListener('click', () => triggerEmergencyOpenConfirm());
    document.getElementById('cc-em-lockdown')?.addEventListener('click', () => triggerLockdownConfirm());
    document.getElementById('cc-em-restore')?.addEventListener('click', () => triggerRestoreNormalConfirm());

    // Scanner Buttons
    document.getElementById('btn-scan-network')?.addEventListener('click', () => scanNetwork());
    document.getElementById('btn-sync-all-clocks')?.addEventListener('click', () => syncAllControllerClocks());
    document.getElementById('btn-probe-ip')?.addEventListener('click', probeDirectIp);
    if (typeof initScanModeToggle === 'function') initScanModeToggle();

    // Controllers View Mode Toggles & Search
    document.getElementById('btn-ctrl-compact')?.addEventListener('click', () => setControllersView('compact'));
    document.getElementById('btn-ctrl-detailed')?.addEventListener('click', () => setControllersView('detailed'));
    document.getElementById('btn-ctrl-table')?.addEventListener('click', () => setControllersView('table'));
    document.getElementById('controllers-search-input')?.addEventListener('input', () => renderControllers());

    // Users tab: import from hardware & sync fleet
    document.getElementById('btn-import-hardware')?.addEventListener('click', importFromHardware);
    document.getElementById('btn-sync-fleet')?.addEventListener('click', () => openBatchPrivilegeModal());

    // Batch Privileges Triggers
    document.getElementById('btn-batch-privilege')?.addEventListener('click', openBatchPrivilegeModal);
    document.getElementById('btn-batch-open-from-bar')?.addEventListener('click', openBatchPrivilegeModal);
    document.getElementById('btn-batch-clear-selection')?.addEventListener('click', clearUserSelection);
    document.getElementById('modal-batch-close')?.addEventListener('click', closeBatchPrivilegeModal);
    document.getElementById('btn-cancel-batch')?.addEventListener('click', closeBatchPrivilegeModal);

    // Batch Modal Action Mode Cards
    document.querySelectorAll('#modal-batch-privilege .batch-mode-card').forEach(card => {
        card.addEventListener('click', () => {
            const mode = card.dataset.mode;
            document.querySelectorAll('#modal-batch-privilege .batch-mode-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            const radio = card.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;
            if (typeof updateBatchSubmitButtonLabel === 'function') updateBatchSubmitButtonLabel(mode);
        });
    });

    // Single User Modal Action Mode Cards
    document.querySelectorAll('#modal-user .batch-mode-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('#modal-user .batch-mode-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            const radio = card.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;
        });
    });

    // Batch Modal Select/Clear All Users
    document.getElementById('link-batch-select-all-users')?.addEventListener('click', (e) => {
        e.preventDefault();
        users.forEach(u => selectedUserCards.add(u.cardNumber));
        if (typeof renderBatchSelectedUsersChips === 'function') renderBatchSelectedUsersChips();
        if (typeof updateBatchBarUI === 'function') updateBatchBarUI();
        if (typeof updateSelectAllHeaderState === 'function') updateSelectAllHeaderState();
        document.querySelectorAll('.chk-user-row').forEach(cb => {
            cb.checked = selectedUserCards.has(Number(cb.dataset.card));
        });
    });
    document.getElementById('link-batch-clear-users')?.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof clearUserSelection === 'function') clearUserSelection();
        if (typeof renderBatchSelectedUsersChips === 'function') renderBatchSelectedUsersChips();
    });

    // Batch Modal Select/Clear All Doors
    document.getElementById('link-batch-select-all-doors')?.addEventListener('click', (e) => {
        e.preventDefault();
        const searchInput = document.getElementById('batch-door-search-input');
        const query = (searchInput?.value || '').trim();
        const labels = document.querySelectorAll('#batch-doors-picker .perm-checkbox-label');
        labels.forEach(label => {
            if (!query || label.style.display !== 'none') {
                const cb = label.querySelector('input[type="checkbox"]');
                if (cb) cb.checked = true;
            }
        });
        const ctrlList = (typeof controllers !== 'undefined' && Array.isArray(controllers)) ? controllers : [];
        ctrlList.forEach(ctrl => {
            if (typeof updateBoardToggleLabel === 'function') {
                updateBoardToggleLabel(ctrl.serialNumber, 'batch-perm');
            }
        });
        if (typeof updateBatchDoorsSelectedCount === 'function') {
            updateBatchDoorsSelectedCount();
        }
    });
    document.getElementById('link-batch-clear-doors')?.addEventListener('click', (e) => {
        e.preventDefault();
        const searchInput = document.getElementById('batch-door-search-input');
        const query = (searchInput?.value || '').trim();
        const labels = document.querySelectorAll('#batch-doors-picker .perm-checkbox-label');
        labels.forEach(label => {
            if (!query || label.style.display !== 'none') {
                const cb = label.querySelector('input[type="checkbox"]');
                if (cb) cb.checked = false;
            }
        });
        const ctrlList = (typeof controllers !== 'undefined' && Array.isArray(controllers)) ? controllers : [];
        ctrlList.forEach(ctrl => {
            if (typeof updateBoardToggleLabel === 'function') {
                updateBoardToggleLabel(ctrl.serialNumber, 'batch-perm');
            }
        });
        if (typeof updateBatchDoorsSelectedCount === 'function') {
            updateBatchDoorsSelectedCount();
        }
    });

    // Batch Modal Dates Checkbox
    document.getElementById('chk-batch-update-dates')?.addEventListener('change', (e) => {
        const datesGroup = document.getElementById('batch-dates-group');
        if (datesGroup) datesGroup.style.display = e.target.checked ? 'grid' : 'none';
    });

    // Batch Form Submit
    document.getElementById('form-batch-privileges')?.addEventListener('submit', submitBatchPrivileges);

    // Table Header "Select All" Checkbox
    document.getElementById('chk-user-select-all')?.addEventListener('change', (e) => {
        toggleSelectAllUsers(e.target.checked);
    });

    // Event delegation for table row checkboxes
    document.getElementById('users-table-body')?.addEventListener('change', (e) => {
        if (e.target && e.target.classList.contains('chk-user-row')) {
            const card = Number(e.target.dataset.card);
            if (e.target.checked) {
                selectedUserCards.add(card);
            } else {
                selectedUserCards.delete(card);
            }
            const tr = e.target.closest('tr');
            if (tr) tr.classList.toggle('row-selected', e.target.checked);
            if (typeof updateBatchBarUI === 'function') updateBatchBarUI();
            if (typeof updateSelectAllHeaderState === 'function') updateSelectAllHeaderState();
        }
    });

    // Users tab: view toggle
    document.getElementById('btn-view-table')?.addEventListener('click', () => setUsersView('table'));
    document.getElementById('btn-view-board')?.addEventListener('click', () => setUsersView('board'));

    // User Modal Triggers
    document.getElementById('btn-add-user')?.addEventListener('click', () => openUserModal());
    document.getElementById('modal-user-close')?.addEventListener('click', closeUserModal);
    document.getElementById('btn-cancel-user')?.addEventListener('click', closeUserModal);

    // Door Modal Triggers
    document.getElementById('modal-door-close')?.addEventListener('click', closeDoorModal);
    document.getElementById('btn-cancel-door')?.addEventListener('click', closeDoorModal);

    // Emergency Modal Triggers
    document.getElementById('modal-emergency-close')?.addEventListener('click', closeEmergencyModal);
    document.getElementById('btn-cancel-emergency')?.addEventListener('click', closeEmergencyModal);
    document.getElementById('btn-confirm-emergency-action')?.addEventListener('click', () => {
        if (typeof pendingEmergencyAction === 'function') {
            const action = pendingEmergencyAction;
            action();
        }
    });

    // Query active emergency overrides on startup
    if (typeof fetchEmergencyStatus === 'function') fetchEmergencyStatus();

    // Select All / Clear All Doors in User Modal
    document.getElementById('link-select-all-doors')?.addEventListener('click', (e) => {
        e.preventDefault();
        const searchInput = document.getElementById('single-door-search-input');
        const query = (searchInput?.value || '').trim();
        document.querySelectorAll('#modal-doors-picker .perm-checkbox-label').forEach(label => {
            if (!query || label.style.display !== 'none') {
                const cb = label.querySelector('input[type="checkbox"]');
                if (cb) cb.checked = true;
            }
        });
        const ctrlList = (typeof controllers !== 'undefined' && Array.isArray(controllers)) ? controllers : [];
        ctrlList.forEach(ctrl => {
            if (typeof updateBoardToggleLabel === 'function') updateBoardToggleLabel(ctrl.serialNumber, 'perm');
        });
        if (typeof updateSingleDoorsSelectedCount === 'function') updateSingleDoorsSelectedCount();
    });
    document.getElementById('link-clear-all-doors')?.addEventListener('click', (e) => {
        e.preventDefault();
        const searchInput = document.getElementById('single-door-search-input');
        const query = (searchInput?.value || '').trim();
        document.querySelectorAll('#modal-doors-picker .perm-checkbox-label').forEach(label => {
            if (!query || label.style.display !== 'none') {
                const cb = label.querySelector('input[type="checkbox"]');
                if (cb) cb.checked = false;
            }
        });
        const ctrlList = (typeof controllers !== 'undefined' && Array.isArray(controllers)) ? controllers : [];
        ctrlList.forEach(ctrl => {
            if (typeof updateBoardToggleLabel === 'function') updateBoardToggleLabel(ctrl.serialNumber, 'perm');
        });
        if (typeof updateSingleDoorsSelectedCount === 'function') updateSingleDoorsSelectedCount();
    });

    // Users: Search & Department / Door Filter
    document.getElementById('users-search-input')?.addEventListener('input', renderUsers);
    document.getElementById('users-dept-filter')?.addEventListener('change', renderUsers);
    document.getElementById('users-door-filter')?.addEventListener('change', renderUsers);

    // Dynamic Monitored Doors Target Controls
    document.getElementById('btn-monitor-select-all')?.addEventListener('click', selectAllMonitoredDoors);
    document.getElementById('btn-monitor-clear-all')?.addEventListener('click', clearAllMonitoredDoors);
    document.getElementById('btn-toggle-door-tiles')?.addEventListener('click', toggleMonitorDoorTiles);

    // Monitor: Filter bar inputs
    document.getElementById('monitor-filter-controller')?.addEventListener('change', (e) => {
        monitorFilters.controllerId = e.target.value;
        rebuildMonitorTable();
    });
    document.getElementById('monitor-filter-door')?.addEventListener('input', (e) => {
        monitorFilters.door = e.target.value.trim();
        rebuildMonitorTable();
    });
    document.getElementById('monitor-filter-card')?.addEventListener('input', (e) => {
        monitorFilters.cardNo = e.target.value.trim();
        rebuildMonitorTable();
    });
    document.getElementById('monitor-search-input')?.addEventListener('input', (e) => {
        monitorFilters.search = e.target.value.trim();
        rebuildMonitorTable();
    });
    document.getElementById('btn-clear-monitor-filters')?.addEventListener('click', () => {
        monitorFilters = { controllerId: '', door: '', cardNo: '', search: '' };
        const filterCtrl = document.getElementById('monitor-filter-controller');
        const filterDoor = document.getElementById('monitor-filter-door');
        const filterCard = document.getElementById('monitor-filter-card');
        const filterSearch = document.getElementById('monitor-search-input');
        if (filterCtrl) filterCtrl.value = '';
        if (filterDoor) filterDoor.value = '';
        if (filterCard) filterCard.value = '';
        if (filterSearch) filterSearch.value = '';
        rebuildMonitorTable();
    });

    // History: Search + Type filter
    document.getElementById('history-search-input')?.addEventListener('input', () => {
        const searchTerm = (document.getElementById('history-search-input')?.value || '').toLowerCase();
        renderHistory(searchTerm);
    });
    document.getElementById('history-type-filter')?.addEventListener('change', () => {
        const searchTerm = (document.getElementById('history-search-input')?.value || '').toLowerCase();
        renderHistory(searchTerm);
    });

    // Clear Monitor Display
    document.getElementById('btn-clear-monitor')?.addEventListener('click', () => {
        const tbody = document.getElementById('monitor-table-body');
        if (tbody) tbody.innerHTML = '';
        const cardsContainer = document.getElementById('monitor-cards-container');
        if (cardsContainer) cardsContainer.innerHTML = '';
    });

    // Save Door Config Form
    document.getElementById('form-door')?.addEventListener('submit', (e) => {
        if (typeof submitDoorConfigForm === 'function') submitDoorConfigForm(e);
    });

    // Live input converter for #user-card
    document.getElementById('user-card')?.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        const hint = document.getElementById('user-card-hint');
        if (!hint) return;
        const info = typeof parseRfidCard === 'function' ? parseRfidCard(val) : null;
        if (info && info.raw10D) {
            hint.style.display = 'block';
            hint.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles" style="color: var(--accent-warning);"></i> 10-Digit Card detected (<b>${info.raw10D}</b>). Auto-converts to Hardware W26: <b>${info.wiegandNum}</b> (Facility: ${info.facility}, Card: ${info.cardId})`;
        } else if (info && info.wiegandNum) {
            hint.style.display = 'block';
            hint.innerHTML = `<i class="fa-solid fa-circle-check" style="color: var(--accent-primary);"></i> Valid Wiegand 26: <b>${info.wiegandNum}</b> (Facility: ${info.facility}, Card: ${info.cardId})`;
        } else {
            hint.style.display = 'none';
        }
    });

    // Save User Form
    document.getElementById('form-user')?.addEventListener('submit', (e) => {
        if (typeof submitUserForm === 'function') submitUserForm(e);
    });

    // Export CSV
    document.getElementById('btn-export-csv')?.addEventListener('click', exportHistoryCsv);

    // Clear Events Modal Listeners
    const modalClearEvents = document.getElementById('modal-clear-events');
    const chkConfirmClearEvents = document.getElementById('chk-confirm-clear-events');
    const btnConfirmClearEvents = document.getElementById('btn-confirm-clear-events');

    document.getElementById('btn-clear-events-table')?.addEventListener('click', openClearEventsModal);
    document.getElementById('btn-clear-db-events-monitor')?.addEventListener('click', openClearEventsModal);
    document.getElementById('modal-clear-events-close')?.addEventListener('click', closeClearEventsModal);
    document.getElementById('btn-cancel-clear-events')?.addEventListener('click', closeClearEventsModal);
    modalClearEvents?.addEventListener('click', (e) => {
        if (e.target === modalClearEvents) closeClearEventsModal();
    });

    document.getElementById('btn-clear-modal-export-csv')?.addEventListener('click', () => {
        exportHistoryCsv();
    });

    chkConfirmClearEvents?.addEventListener('change', () => {
        const checked = chkConfirmClearEvents.checked;
        if (btnConfirmClearEvents) {
            btnConfirmClearEvents.disabled = !checked;
            btnConfirmClearEvents.style.opacity = checked ? '1' : '0.45';
            btnConfirmClearEvents.style.cursor = checked ? 'pointer' : 'not-allowed';
        }
    });

    btnConfirmClearEvents?.addEventListener('click', () => {
        if (typeof executePurgeEvents === 'function') executePurgeEvents();
    });

    // Populate initial dropdowns and views
    updateMonitorControllerFilter();
    updateAutoMonitorView(true);

    // Window resize handler
    let lastIsMobile = window.innerWidth <= 768;
    window.addEventListener('resize', () => {
        if (typeof updateMonitorChipsScrollArrows === 'function') updateMonitorChipsScrollArrows();
        if (window.innerWidth > 992 && typeof closeMobileDrawer === 'function') {
            closeMobileDrawer();
        }
        const currentIsMobile = window.innerWidth <= 768;
        if (currentIsMobile !== lastIsMobile) {
            lastIsMobile = currentIsMobile;
            monitorViewUserOverride = false;
            updateAutoMonitorView(true);
        } else {
            updateAutoMonitorView(false);
        }
    });

    // Global escape key handler
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (typeof closeMobileDrawer === 'function') closeMobileDrawer();
            closeUserModal();
            closeDoorModal();
            closeClearEventsModal();
            closeBatchPrivilegeModal();
            closeEmergencyModal();
        }
    });
});
