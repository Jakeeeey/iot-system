/**
 * ACCESS Professional - Emergency & Facility Lockdown Controls
 * Handles emergency unlock, full site lockdown, normal state restoration, and banner status.
 */

var pendingEmergencyAction = null;

let currentEmergencyContext = {
    keyword: '',
    reason: '',
    superadminToken: ''
};

function getEmergencyReason(contractDefault) {
    const input = document.getElementById('emergency-reason-input');
    const typed = input && typeof input.value === 'string' ? input.value.trim() : '';
    return typed || currentEmergencyContext.reason || contractDefault;
}

function getEmergencyPayload(keywordDefault, reasonDefault) {
    const reasonInput = document.getElementById('emergency-reason-input');
    const keywordInput = document.getElementById('emergency-keyword-input');
    const superInput = document.getElementById('emergency-superadmin-input');

    const reason = (reasonInput && typeof reasonInput.value === 'string' ? reasonInput.value.trim() : '') || currentEmergencyContext.reason || reasonDefault;
    const keyword = (keywordInput && typeof keywordInput.value === 'string' ? keywordInput.value.trim().toUpperCase() : '') || currentEmergencyContext.keyword || keywordDefault;
    const superadminToken = (superInput && typeof superInput.value === 'string' ? superInput.value.trim() : '')
        || currentEmergencyContext.superadminToken
        || localStorage.getItem('access_superadmin_token')
        || '';

    return {
        confirm: true,
        reason,
        keyword,
        superadminToken
    };
}

function handleSuperadminSuccess(token) {
    if (token && !localStorage.getItem('access_superadmin_token')) {
        localStorage.setItem('access_superadmin_token', token);
        const secureFlag = window.location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = `access_superadmin_token=${encodeURIComponent(token)}; path=/; SameSite=Strict; max-age=43200${secureFlag}`;
        if (typeof updateAdminTokenDisplay === 'function') updateAdminTokenDisplay();
    }
}

async function fetchEmergencyStatus() {
    try {
        const res = await fetch('/api/emergency/status');
        const data = await res.json();
        if (data.success) {
            const status = data.data || (({ success, ...rest }) => rest)(data);
            updateEmergencyBanner(status);
        }
    } catch (e) {
        console.warn('[emergency-status-fetch]', e.message);
    }
}

let _isEmergencyActionRunning = false;

function setEmergencyLoadingState(actionType, isLoading) {
    _isEmergencyActionRunning = isLoading;

    const modalConfirmBtn = document.getElementById('btn-confirm-emergency-action');
    const modalCancelBtn = document.getElementById('btn-cancel-emergency');
    const modalCloseBtn = document.getElementById('modal-emergency-close');
    const keywordInput = document.getElementById('emergency-keyword-input');
    const superInput = document.getElementById('emergency-superadmin-input');
    const reasonInput = document.getElementById('emergency-reason-input');

    const safetyOpenBtn = document.getElementById('btn-emergency-open');
    const safetyLockBtn = document.getElementById('btn-emergency-lockdown');
    const safetyRestoreBtn = document.getElementById('btn-emergency-restore');
    const ccOpenBtn = document.getElementById('cc-em-open');
    const ccLockBtn = document.getElementById('cc-em-lockdown');
    const ccRestoreBtn = document.getElementById('cc-em-restore');
    const bannerRestoreBtn = document.getElementById('btn-banner-restore');
    const badgeEl = document.getElementById('safety-global-badge');

    const allActionBtns = [
        safetyOpenBtn, safetyLockBtn, safetyRestoreBtn,
        ccOpenBtn, ccLockBtn, ccRestoreBtn,
        bannerRestoreBtn
    ].filter(Boolean);

    if (isLoading) {
        if (modalConfirmBtn) {
            modalConfirmBtn.classList.add('btn-loading');
            modalConfirmBtn.setAttribute('disabled', 'true');
            modalConfirmBtn.style.opacity = '0.82';
            modalConfirmBtn.style.cursor = 'wait';
            const icon = modalConfirmBtn.querySelector('#btn-confirm-emergency-icon') || modalConfirmBtn.querySelector('i');
            const label = modalConfirmBtn.querySelector('#btn-confirm-emergency-label') || modalConfirmBtn.querySelector('span');
            if (icon) icon.className = 'fa-solid fa-spinner fa-spin';
            let loadingMsg = 'Broadcasting Command...';
            if (actionType === 'open') loadingMsg = 'Broadcasting Emergency Unlock...';
            else if (actionType === 'lockdown') loadingMsg = 'Broadcasting Facility Lockdown...';
            else if (actionType === 'restore') loadingMsg = 'Restoring Standard Operation...';
            if (label) label.textContent = loadingMsg;
        }

        if (modalCancelBtn) {
            modalCancelBtn.setAttribute('disabled', 'true');
            modalCancelBtn.style.pointerEvents = 'none';
            modalCancelBtn.style.opacity = '0.45';
        }
        if (modalCloseBtn) {
            modalCloseBtn.setAttribute('disabled', 'true');
            modalCloseBtn.style.pointerEvents = 'none';
        }
        if (keywordInput) keywordInput.setAttribute('disabled', 'true');
        if (superInput) superInput.setAttribute('disabled', 'true');
        if (reasonInput) reasonInput.setAttribute('disabled', 'true');

        allActionBtns.forEach(btn => {
            btn.setAttribute('disabled', 'true');
            btn.classList.add('btn-loading');
        });

        if (actionType === 'open') {
            if (safetyOpenBtn) safetyOpenBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Unlocking All...</span>';
            if (ccOpenBtn) ccOpenBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Unlocking...</span>';
        } else if (actionType === 'lockdown') {
            if (safetyLockBtn) safetyLockBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Locking Down...</span>';
            if (ccLockBtn) ccLockBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Locking Down...</span>';
        } else if (actionType === 'restore') {
            if (safetyRestoreBtn) safetyRestoreBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Restoring Normal...</span>';
            if (ccRestoreBtn) ccRestoreBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Restoring...</span>';
            if (bannerRestoreBtn) bannerRestoreBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Restoring Normal...';
        }

        if (badgeEl) {
            badgeEl.className = 'safety-state-badge badge-transmitting';
            badgeEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Transmitting...';
        }
    } else {
        if (modalConfirmBtn) {
            modalConfirmBtn.classList.remove('btn-loading');
        }
        if (modalCancelBtn) {
            modalCancelBtn.removeAttribute('disabled');
            modalCancelBtn.style.pointerEvents = '';
            modalCancelBtn.style.opacity = '';
        }
        if (modalCloseBtn) {
            modalCloseBtn.removeAttribute('disabled');
            modalCloseBtn.style.pointerEvents = '';
        }
        if (keywordInput) keywordInput.removeAttribute('disabled');
        if (superInput) superInput.removeAttribute('disabled');
        if (reasonInput) reasonInput.removeAttribute('disabled');

        allActionBtns.forEach(btn => {
            btn.removeAttribute('disabled');
            btn.classList.remove('btn-loading');
        });

        if (safetyOpenBtn) safetyOpenBtn.innerHTML = '<i class="fa-solid fa-door-open"></i> <span>Emergency Open All</span>';
        if (safetyLockBtn) safetyLockBtn.innerHTML = '<i class="fa-solid fa-lock"></i> <span>Lockdown All Doors</span>';
        if (safetyRestoreBtn) safetyRestoreBtn.innerHTML = '<i class="fa-solid fa-rotate-left"></i> <span>Restore Normal Mode</span>';
        if (ccOpenBtn) ccOpenBtn.innerHTML = '<i class="fa-solid fa-door-open"></i> <span>Emergency Open</span>';
        if (ccLockBtn) ccLockBtn.innerHTML = '<i class="fa-solid fa-lock"></i> <span>Lockdown</span>';
        if (ccRestoreBtn) ccRestoreBtn.innerHTML = '<i class="fa-solid fa-rotate-left"></i> <span>Restore</span>';
        if (bannerRestoreBtn) bannerRestoreBtn.innerHTML = '<i class="fa-solid fa-rotate-left"></i> Resume Normal Control';

        closeEmergencyModal();
    }
}

function appendUnreachableWarning(descEl, status) {
    const unreachable = Number(status && status.unreachableBoards) || 0;
    if (!descEl || unreachable <= 0) return;
    descEl.appendChild(document.createElement('br'));
    const warnEl = document.createElement('span');
    warnEl.style.color = 'var(--accent-warning)';
    warnEl.style.fontWeight = '600';
    warnEl.textContent = `${unreachable} board(s) offline were not updated.`;
    descEl.appendChild(warnEl);
}

function notifySkippedEmergencyBoards(data) {
    const skipped = data && Array.isArray(data.skipped) ? data.skipped : [];
    if (skipped.length === 0) return;
    showToast(`Skipped ${skipped.length} unreachable/disabled board(s) — not updated.`, 'warning');
}

window.currentEmergencyState = 'NORMAL';

function updateEmergencyBanner(status) {
    if (status && status.state) {
        window.currentEmergencyState = status.state;
    }
    if (_isEmergencyActionRunning) return;
    const banner = document.getElementById('emergency-active-banner');
    const titleEl = document.getElementById('banner-state-title');
    const descEl = document.getElementById('banner-state-desc');
    const badgeEl = document.getElementById('safety-global-badge');
    const actionBtn = document.getElementById('btn-banner-restore');

    if (!status) return;

    if (status.state === 'EMERGENCY_OPEN') {
        if (banner) {
            banner.style.display = 'flex';
            banner.className = 'emergency-active-banner open-active';
        }
        if (titleEl) titleEl.textContent = 'FACILITY EMERGENCY UNLOCK ACTIVE';
        if (descEl) {
            descEl.textContent = 'All door relays across all controllers are held OPEN for life-safety egress. Standard RFID validations are bypassed.';
            appendUnreachableWarning(descEl, status);
        }
        if (badgeEl) {
            badgeEl.className = 'safety-state-badge badge-emergency-open';
            badgeEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Emergency Open Active';
        }
        if (actionBtn) {
            actionBtn.style.display = 'inline-flex';
            actionBtn.innerHTML = '<i class="fa-solid fa-rotate-left"></i> Restore Normal Operation';
            actionBtn.onclick = triggerRestoreNormalConfirm;
        }
    } else if (status.state === 'LOCKDOWN') {
        if (banner) {
            banner.style.display = 'flex';
            banner.className = 'emergency-active-banner lockdown-active';
        }
        if (titleEl) titleEl.textContent = 'FACILITY FULL LOCKDOWN ACTIVE';
        if (descEl) {
            descEl.textContent = 'All perimeter and interior doors are LOCKED DOWN. Only designated security master cards may gain entrance.';
            appendUnreachableWarning(descEl, status);
        }
        if (badgeEl) {
            badgeEl.className = 'safety-state-badge badge-lockdown';
            badgeEl.innerHTML = '<i class="fa-solid fa-lock"></i> Full Lockdown Active';
        }
        if (actionBtn) {
            actionBtn.style.display = 'inline-flex';
            actionBtn.innerHTML = '<i class="fa-solid fa-rotate-left"></i> Cancel Lockdown';
            actionBtn.onclick = triggerRestoreNormalConfirm;
        }
    } else if (status.state === 'PARTIAL') {
        const lockedCount = status.normallyClosedCount || 0;
        const heldOpenCount = status.normallyOpenCount || 0;
        const descText = heldOpenCount > 0
            ? `${heldOpenCount} door(s) are held open for emergency unlock while ${lockedCount} door(s) are locked down.`
            : `${lockedCount} door(s) are currently isolated in forced lockdown mode.`;
        if (banner) {
            banner.style.display = 'flex';
            banner.className = 'emergency-active-banner partial-active';
        }
        if (titleEl) titleEl.textContent = 'PARTIAL DOOR LOCKDOWN ACTIVE';
        if (descEl) descEl.textContent = descText;
        if (badgeEl) {
            badgeEl.className = 'safety-state-badge badge-partial';
            badgeEl.innerHTML = `<i class="fa-solid fa-lock"></i> ${lockedCount} Doors Locked`;
        }
        if (actionBtn) {
            actionBtn.style.display = 'inline-flex';
            actionBtn.innerHTML = '<i class="fa-solid fa-rotate-left"></i> Clear All Lockdowns';
            actionBtn.onclick = triggerRestoreNormalConfirm;
        }
    } else {
        if (banner) {
            banner.style.display = 'none';
            banner.className = 'emergency-active-banner';
        }
        if (badgeEl) {
            badgeEl.className = 'safety-state-badge badge-normal';
            badgeEl.innerHTML = '<i class="fa-solid fa-circle-check"></i> Normal (Controlled)';
        }
    }
}

function openEmergencyModal(config) {
    if (!requireUiWrite()) return;
    const modal = document.getElementById('modal-emergency-confirm');
    const titleEl = document.getElementById('emergency-confirm-title')
        || document.getElementById('modal-emergency-heading');
    const descEl = document.getElementById('emergency-confirm-desc')
        || document.getElementById('modal-emergency-msg');
    const confirmBtn = document.getElementById('btn-confirm-emergency-action');
    const cancelBtn = document.getElementById('btn-cancel-emergency');
    const closeBtn = document.getElementById('modal-emergency-close');
    const iconEl = document.getElementById('emergency-confirm-icon')
        || document.getElementById('modal-emergency-icon');
    const keywordGroup = document.getElementById('emergency-keyword-group');
    const keywordPrompt = document.getElementById('emergency-keyword-prompt');
    const keywordInput = document.getElementById('emergency-keyword-input');
    const superGroup = document.getElementById('emergency-superadmin-group');
    const superInput = document.getElementById('emergency-superadmin-input');
    const roleBanner = document.getElementById('modal-emergency-role-banner');
    const roleMsg = document.getElementById('modal-emergency-role-msg');

    if (!modal) return;

    if (titleEl) titleEl.textContent = config.title;
    if (descEl) descEl.textContent = config.description;
    if (confirmBtn) {
        confirmBtn.classList.remove('btn-loading');
        confirmBtn.removeAttribute('disabled');
        const label = confirmBtn.querySelector('#btn-confirm-emergency-label') || confirmBtn.querySelector('span') || confirmBtn;
        label.textContent = config.buttonText;
        confirmBtn.className = `btn ${config.buttonClass}`;
    }
    if (cancelBtn) {
        cancelBtn.removeAttribute('disabled');
        cancelBtn.style.pointerEvents = '';
        cancelBtn.style.opacity = '';
    }
    if (closeBtn) {
        closeBtn.removeAttribute('disabled');
        closeBtn.style.pointerEvents = '';
    }
    if (iconEl) iconEl.className = `fa-solid ${config.iconClass}`;

    const reasonInput = document.getElementById('emergency-reason-input');
    if (reasonInput) {
        reasonInput.removeAttribute('disabled');
        reasonInput.value = '';
    }
    if (keywordInput) keywordInput.removeAttribute('disabled');
    if (superInput) superInput.removeAttribute('disabled');

    const reqKeyword = config.keyword ? String(config.keyword).trim().toUpperCase() : '';
    if (keywordGroup) {
        keywordGroup.style.display = reqKeyword ? 'block' : 'none';
    }
    if (keywordPrompt && reqKeyword) keywordPrompt.textContent = reqKeyword;
    if (keywordInput) {
        keywordInput.value = '';
        keywordInput.placeholder = reqKeyword ? `Type ${reqKeyword} to confirm...` : '';
    }

    const currentRole = typeof getUiAuthRole === 'function' ? getUiAuthRole() : 'viewer';
    const isSuper = typeof canUiAdminister === 'function' ? canUiAdminister() : currentRole === 'superadmin';

    if (superGroup) {
        superGroup.style.display = isSuper ? 'none' : 'block';
    }
    if (superInput) superInput.value = '';

    if (roleBanner && roleMsg) {
        const roleIcon = document.getElementById('modal-emergency-role-icon');
        roleBanner.style.background = '';
        roleBanner.style.borderColor = '';
        roleBanner.style.color = '';
        if (isSuper) {
            roleBanner.classList.remove('banner-warning');
            roleBanner.classList.add('banner-success');
            if (roleIcon) {
                roleIcon.className = 'fa-solid fa-shield-halved';
            }
            roleMsg.innerHTML = reqKeyword
                ? '<strong>Superadmin session active</strong>. Type confirmation keyword to unlock:'
                : '<strong>Superadmin session active</strong>. Ready to restore standard operation.';
        } else {
            roleBanner.classList.remove('banner-success');
            roleBanner.classList.add('banner-warning');
            if (roleIcon) {
                roleIcon.className = 'fa-solid fa-shield-halved';
            }
            roleMsg.innerHTML = reqKeyword
                ? '<strong>Superadmin authorization required</strong>. Enter credentials and type keyword:'
                : '<strong>Superadmin authorization required</strong>. Enter Superadmin credentials:';
        }
    }

    function checkFormValidity() {
        let keywordValid = true;
        if (reqKeyword) {
            const val = keywordInput ? keywordInput.value.trim().toUpperCase() : '';
            keywordValid = val === reqKeyword || (reqKeyword === 'OPEN' && (val === 'OPEN ALL' || val === 'EMERGENCY OPEN ALL'))
                || (reqKeyword === 'LOCK' && (val === 'LOCKDOWN' || val === 'LOCKDOWN ALL DOORS'));
        }

        const superTokenVal = superInput ? superInput.value.trim() : '';
        const superValid = isSuper || superTokenVal.length > 0 || !localStorage.getItem('access_admin_token');

        const canProceed = Boolean(keywordValid && superValid);
        if (confirmBtn) {
            if (canProceed) {
                confirmBtn.removeAttribute('disabled');
                confirmBtn.style.opacity = '1';
                confirmBtn.style.cursor = 'pointer';
            } else {
                confirmBtn.setAttribute('disabled', 'true');
                confirmBtn.style.opacity = '0.45';
                confirmBtn.style.cursor = 'not-allowed';
            }
        }
        return canProceed;
    }

    if (keywordInput) {
        keywordInput.oninput = checkFormValidity;
        keywordInput.onkeydown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (checkFormValidity() && confirmBtn) confirmBtn.click();
            }
        };
    }
    if (superInput) {
        superInput.oninput = checkFormValidity;
        superInput.onkeydown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (checkFormValidity() && confirmBtn) confirmBtn.click();
            }
        };
    }

    checkFormValidity();

    pendingEmergencyAction = () => {
        currentEmergencyContext = {
            keyword: keywordInput ? keywordInput.value.trim().toUpperCase() : '',
            reason: reasonInput ? reasonInput.value.trim() : '',
            superadminToken: superInput ? superInput.value.trim() : ''
        };
        config.action();
    };

    modal.classList.add('active');
    setTimeout(() => {
        try {
            if (reqKeyword && keywordInput) {
                keywordInput.focus();
            } else if (!isSuper && superInput) {
                superInput.focus();
            } else if (confirmBtn) {
                confirmBtn.focus();
            }
        } catch (e) {}
    }, 50);
}

function closeEmergencyModal() {
    const modal = document.getElementById('modal-emergency-confirm');
    if (modal) modal.classList.remove('active');
    pendingEmergencyAction = null;
}

function triggerEmergencyOpenConfirm() {
    openEmergencyModal({
        title: 'Emergency Unlock All Doors?',
        description: 'This will broadcast an immediate pulse and mode shift to UNLOCK every door on every controller. Use only during building fire, evacuation, or life-safety emergencies.',
        buttonText: 'Execute Emergency Unlock',
        buttonClass: 'btn-danger',
        iconClass: 'fa-triangle-exclamation',
        keyword: 'OPEN',
        action: executeEmergencyOpen
    });
}

function triggerLockdownConfirm() {
    openEmergencyModal({
        title: 'Execute Full Facility Lockdown?',
        description: 'This will lock down all doors fleet-wide. Normal badge access will be suspended immediately. Use only during active security threats.',
        buttonText: 'Initiate Full Lockdown',
        buttonClass: 'btn-danger',
        iconClass: 'fa-lock',
        keyword: 'LOCK',
        action: executeFacilityLockdown
    });
}

function triggerRestoreNormalConfirm() {
    openEmergencyModal({
        title: 'Restore Normal Access Control Operation?',
        description: 'This will clear all facility-wide emergency unlock and lockdown states. Doors will return to their standard programmed access schedules and RFID reader validation.',
        buttonText: 'Restore Standard Operation',
        buttonClass: 'btn-primary',
        iconClass: 'fa-rotate-left',
        action: executeRestoreNormal
    });
}

async function executeEmergencyOpen() {
    if (!requireUiWrite()) return;
    setEmergencyLoadingState('open', true);
    try {
        const payload = getEmergencyPayload('OPEN', 'Operator-confirmed emergency evacuation via console modal');
        const res = await fetch('/api/doors/emergency-open', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
            handleSuperadminSuccess(payload.superadminToken);
            showToast('EMERGENCY UNLOCK EXECUTED: All doors held open!', 'danger');
            notifySkippedEmergencyBoards(data);
        } else {
            showToast(`Failed to execute emergency unlock: ${data.error}`, 'danger');
            if (res.status === 403 && typeof promptForAdminToken === 'function') {
                promptForAdminToken(true);
            }
        }
    } catch (e) {
        showToast(`Emergency unlock request failed: ${e.message}`, 'danger');
    } finally {
        setEmergencyLoadingState('open', false);
        fetchEmergencyStatus();
    }
}

async function executeFacilityLockdown() {
    if (!requireUiWrite()) return;
    setEmergencyLoadingState('lockdown', true);
    try {
        const payload = getEmergencyPayload('LOCK', 'Operator-confirmed facility lockdown via console modal');
        const res = await fetch('/api/doors/emergency-lockdown', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
            handleSuperadminSuccess(payload.superadminToken);
            showToast('FACILITY LOCKDOWN EXECUTED: All doors secured!', 'warning');
            notifySkippedEmergencyBoards(data);
        } else {
            showToast(`Failed to execute lockdown: ${data.error}`, 'danger');
            if (res.status === 403 && typeof promptForAdminToken === 'function') {
                promptForAdminToken(true);
            }
        }
    } catch (e) {
        showToast(`Lockdown request failed: ${e.message}`, 'danger');
    } finally {
        setEmergencyLoadingState('lockdown', false);
        fetchEmergencyStatus();
    }
}

async function executeRestoreNormal() {
    if (!requireUiWrite()) return;
    setEmergencyLoadingState('restore', true);
    try {
        const payload = getEmergencyPayload('', 'Operator-confirmed restore to normal operation via console modal');
        const res = await fetch('/api/doors/restore-all', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
            handleSuperadminSuccess(payload.superadminToken);
            showToast('Access control restored to standard operating parameters.', 'success');
            notifySkippedEmergencyBoards(data);
        } else {
            showToast(`Failed to restore normal state: ${data.error}`, 'danger');
            if (res.status === 403 && typeof promptForAdminToken === 'function') {
                promptForAdminToken(true);
            }
        }
    } catch (e) {
        showToast(`Restore state request failed: ${e.message}`, 'danger');
    } finally {
        setEmergencyLoadingState('restore', false);
        fetchEmergencyStatus();
    }
}

// Global window bindings
window.fetchEmergencyStatus = fetchEmergencyStatus;
window.updateEmergencyBanner = updateEmergencyBanner;
window.setEmergencyLoadingState = setEmergencyLoadingState;
window.openEmergencyModal = openEmergencyModal;
window.closeEmergencyModal = closeEmergencyModal;
window.triggerEmergencyOpenConfirm = triggerEmergencyOpenConfirm;
window.triggerLockdownConfirm = triggerLockdownConfirm;
window.triggerRestoreNormalConfirm = triggerRestoreNormalConfirm;
window.executeEmergencyOpen = executeEmergencyOpen;
window.executeFacilityLockdown = executeFacilityLockdown;
window.executeRestoreNormal = executeRestoreNormal;
