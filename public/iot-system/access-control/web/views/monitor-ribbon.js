/**
 * ACCESS Professional - Monitor Ribbon View Modes & Slider Controls
 * Controls slider, vslider, and wrap view modes, ribbon collapse, and smooth scrolling.
 */

function setMonitorDoorsViewMode(mode) {
    if (mode === 'wrap' || mode === 'vslider') {
        monitorDoorsViewMode = mode;
    } else {
        monitorDoorsViewMode = 'slider';
    }
    try {
        localStorage.setItem('access_monitor_doors_view_mode', monitorDoorsViewMode);
    } catch (e) { /* intentional: localStorage restricted */ }

    const ribbon = document.getElementById('monitor-doors-ribbon');
    const chipsWrapper = document.getElementById('monitored-door-chips');
    const btnSlider = document.getElementById('btn-doors-mode-slider');
    const btnVSlider = document.getElementById('btn-doors-mode-vslider');
    const btnWrap = document.getElementById('btn-doors-mode-wrap');
    const btnLeft = document.getElementById('btn-doors-scroll-left');
    const btnRight = document.getElementById('btn-doors-scroll-right');
    const iconPrev = document.getElementById('icon-doors-scroll-prev');
    const iconNext = document.getElementById('icon-doors-scroll-next');

    if (ribbon) {
        ribbon.classList.toggle('mode-slider', monitorDoorsViewMode === 'slider');
        ribbon.classList.toggle('mode-vslider', monitorDoorsViewMode === 'vslider');
        ribbon.classList.toggle('mode-wrap', monitorDoorsViewMode === 'wrap');
    }

    if (chipsWrapper) {
        chipsWrapper.classList.toggle('mode-slider', monitorDoorsViewMode === 'slider');
        chipsWrapper.classList.toggle('mode-vslider', monitorDoorsViewMode === 'vslider');
        chipsWrapper.classList.toggle('mode-wrap', monitorDoorsViewMode === 'wrap');
    }

    if (btnSlider) btnSlider.classList.toggle('active-view', monitorDoorsViewMode === 'slider');
    if (btnVSlider) btnVSlider.classList.toggle('active-view', monitorDoorsViewMode === 'vslider');
    if (btnWrap) btnWrap.classList.toggle('active-view', monitorDoorsViewMode === 'wrap');

    if (monitorDoorsViewMode === 'wrap') {
        if (btnLeft) btnLeft.style.display = 'none';
        if (btnRight) btnRight.style.display = 'none';
    } else if (monitorDoorsViewMode === 'vslider') {
        if (btnLeft) { btnLeft.style.display = 'inline-flex'; btnLeft.title = 'Scroll Up'; }
        if (btnRight) { btnRight.style.display = 'inline-flex'; btnRight.title = 'Scroll Down'; }
        if (iconPrev) iconPrev.className = 'fa-solid fa-chevron-up';
        if (iconNext) iconNext.className = 'fa-solid fa-chevron-down';
    } else {
        if (btnLeft) { btnLeft.style.display = 'inline-flex'; btnLeft.title = 'Scroll Left'; }
        if (btnRight) { btnRight.style.display = 'inline-flex'; btnRight.title = 'Scroll Right'; }
        if (iconPrev) iconPrev.className = 'fa-solid fa-chevron-left';
        if (iconNext) iconNext.className = 'fa-solid fa-chevron-right';
    }

    setTimeout(updateMonitorChipsScrollArrows, 60);
}

function toggleMonitorDoorsCollapse() {
    monitorDoorsCollapsed = !monitorDoorsCollapsed;
    try {
        localStorage.setItem('access_monitor_doors_collapsed', String(monitorDoorsCollapsed));
    } catch (e) { /* intentional: localStorage restricted */ }
    applyMonitorDoorsCollapse();
}

function applyMonitorDoorsCollapse() {
    const ribbon = document.getElementById('monitor-doors-ribbon');
    const icon = document.getElementById('icon-collapse-door-ribbon');
    const summary = document.getElementById('ribbon-collapsed-summary');
    if (!ribbon) return;

    ribbon.classList.toggle('collapsed', monitorDoorsCollapsed);
    if (icon) {
        icon.className = monitorDoorsCollapsed ? 'fa-solid fa-chevron-down' : 'fa-solid fa-chevron-up';
    }

    if (summary) {
        let totalDoors = 0;
        controllers.forEach(c => { totalDoors += (c.doors || []).length; });
        const isAll = monitoredDoorKeys.has('ALL');
        const activeCount = isAll ? totalDoors : monitoredDoorKeys.size;
        summary.innerHTML = `<i class="fa-solid fa-layer-group"></i> <span>${activeCount}/${totalDoors} doors monitored (click to expand)</span>`;
    }
}

function scrollMonitorDoorChips(direction) {
    const chipsWrapper = document.getElementById('monitored-door-chips');
    if (!chipsWrapper) return;
    if (monitorDoorsViewMode === 'vslider') {
        chipsWrapper.scrollBy({ top: direction * 56, behavior: 'smooth' });
    } else {
        chipsWrapper.scrollBy({ left: direction * 240, behavior: 'smooth' });
    }
    setTimeout(updateMonitorChipsScrollArrows, 250);
}

function updateMonitorChipsScrollArrows() {
    if (monitorDoorsViewMode === 'wrap') return;
    const chipsWrapper = document.getElementById('monitored-door-chips');
    const btnLeft = document.getElementById('btn-doors-scroll-left');
    const btnRight = document.getElementById('btn-doors-scroll-right');
    if (!chipsWrapper || !btnLeft || !btnRight) return;

    if (monitorDoorsViewMode === 'vslider') {
        const maxScroll = chipsWrapper.scrollHeight - chipsWrapper.clientHeight;
        if (maxScroll <= 4) {
            btnLeft.disabled = true;
            btnRight.disabled = true;
        } else {
            btnLeft.disabled = chipsWrapper.scrollTop <= 4;
            btnRight.disabled = chipsWrapper.scrollTop >= maxScroll - 4;
        }
    } else {
        const maxScroll = chipsWrapper.scrollWidth - chipsWrapper.clientWidth;
        if (maxScroll <= 4) {
            btnLeft.disabled = true;
            btnRight.disabled = true;
        } else {
            btnLeft.disabled = chipsWrapper.scrollLeft <= 5;
            btnRight.disabled = chipsWrapper.scrollLeft >= maxScroll - 5;
        }
    }
}

// Global window bindings
window.setMonitorDoorsViewMode = setMonitorDoorsViewMode;
window.toggleMonitorDoorsCollapse = toggleMonitorDoorsCollapse;
window.applyMonitorDoorsCollapse = applyMonitorDoorsCollapse;
window.scrollMonitorDoorChips = scrollMonitorDoorChips;
window.updateMonitorChipsScrollArrows = updateMonitorChipsScrollArrows;
