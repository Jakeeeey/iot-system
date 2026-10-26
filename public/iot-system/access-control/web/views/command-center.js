/**
 * ACCESS Professional - Command Center Analytics Dashboard
 * Real-time operational intelligence, executive access telemetry,
 * 24-hour flow velocity curves, decision matrix, door throughput rankings,
 * shift heatmaps, threat anomaly classifications, and facility controls.
 */

var CC_SWIPE_TYPES = ['SWIPE_GRANTED', 'SWIPE_DENIED', 'SWIPE_EVENT', 'REMOTE_OPEN'];

var ccState = {
    timeRange: 'all',
    decisionFilter: 'all',
    controllerFilter: 'all',
    velocityDate: '',
    hoverHour: null,
    controlsInitialized: false
};

function ccParseDate(ts) {
    if (!ts) return null;
    if (ts instanceof Date) return isNaN(ts.getTime()) ? null : ts;
    if (typeof ts === 'string') {
        const raw = ts.trim();
        if (!raw) return null;
        const hasTz = /[zZ]$|[+-]\d\d:\d\d$/.test(raw);
        const iso = hasTz ? raw : `${raw.replace(' ', 'T')}Z`;
        const d = new Date(iso);
        if (!isNaN(d.getTime())) return d;
        const fallback = new Date(raw);
        if (!isNaN(fallback.getTime())) return fallback;
        return null;
    }
    const d = new Date(ts);
    return isNaN(d.getTime()) ? null : d;
}

function ccGetLocalDateStr(d = new Date()) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function ccScannedBoards() {
    if (typeof controllers === 'undefined' || !Array.isArray(controllers)) return [];
    if (typeof isScannedController === 'function') {
        return controllers.filter(isScannedController);
    }
    return controllers.filter(c => c && c.serialNumber && c.ip !== '127.0.0.1');
}

function ccIsBoardOffline(ctrl) {
    if (!ctrl) return true;
    if (typeof isBoardOffline === 'function') return isBoardOffline(ctrl);
    return ctrl.status === 'OFFLINE' || ctrl.status === 'UNCONNECTED' || ctrl.status === 'UNREACHABLE' || ctrl.isOnline === false;
}

function ccTimeStr(ts) {
    try {
        const d = ccParseDate(ts) || new Date();
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch (e) {
        return '';
    }
}

function ccSystemBadge(typeLabel, isAlert) {
    const bg = isAlert ? 'rgba(239,68,68,0.15)' : 'rgba(6,182,212,0.15)';
    const color = isAlert ? '#ef4444' : '#06b6d4';
    const icon = isAlert ? 'fa-triangle-exclamation' : 'fa-circle-info';
    return `<span class="badge-status" style="background: ${bg}; color: ${color};"><i class="fa-solid ${icon}"></i> ${esc(typeLabel)}</span>`;
}

function ccIsGranted(log) {
    if (!log) return false;
    if (log.type === 'SWIPE_GRANTED') return true;
    if (log.type === 'SWIPE_DENIED') return false;
    return log.granted !== false;
}

var ccHistoricalLogsCache = {};

function ccGetEventLogs() {
    const targetDate = ccState.velocityDate || ccGetLocalDateStr();
    const isToday = targetDate === ccGetLocalDateStr();
    let baseLogs = [];
    if (ccHistoricalLogsCache[targetDate] && Array.isArray(ccHistoricalLogsCache[targetDate])) {
        baseLogs = ccHistoricalLogsCache[targetDate];
    } else if (typeof auditLogs !== 'undefined' && Array.isArray(auditLogs)) {
        baseLogs = auditLogs;
    }
    if (isToday && Array.isArray(ccHistoricalLogsCache[targetDate]) && typeof auditLogs !== 'undefined' && Array.isArray(auditLogs)) {
        // Merge database ground truth with fresh in-memory events from current session
        const seen = new Set(baseLogs.map(l => l.id || `${l.serialNumber}_${l.timestamp}`));
        const fresh = auditLogs.filter(l => l && !seen.has(l.id || `${l.serialNumber}_${l.timestamp}`));
        baseLogs = fresh.concat(baseLogs);
    }
    return baseLogs.filter(l => l && (CC_SWIPE_TYPES.includes(l.type) || l.type === 'SECURITY' || l.type === 'DOOR_SENSOR'));
}

function ccFetchHistoricalDayLogs(targetDate) {
    if (!targetDate) return;
    const isToday = targetDate === ccGetLocalDateStr();
    if (ccHistoricalLogsCache[targetDate] && !isToday) return;
    const fetchWithLimit = (limit) => {
        fetch('/api/history?date=' + encodeURIComponent(targetDate) + '&limit=' + limit)
            .then(r => {
                if (r.status === 400 && limit > 500) {
                    return fetchWithLimit(500);
                }
                return r.json();
            })
            .then(data => {
                if (data && data.success && Array.isArray(data.logs) && data.logs.length > 0) {
                    ccHistoricalLogsCache[targetDate] = data.logs;
                    const curTarget = ccState.velocityDate || ccGetLocalDateStr();
                    if (curTarget === targetDate) {
                        renderCcKpis();
                        renderCcTimeline();
                        renderCcDonut();
                        renderCcDoorBars();
                        renderCcHeatmap();
                        renderCcSecurityMatrix();
                        renderCcTopUsers();
                    }
                }
            })
            .catch(() => {});
    };
    fetchWithLimit(2000);
}

function ccFilteredLogs() {
    const logs = ccGetEventLogs();
    const targetDate = ccState.velocityDate || ccGetLocalDateStr();

    return logs.filter(l => {
        const d = ccParseDate(l.timestamp);
        if (d) {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            if (`${y}-${m}-${day}` !== targetDate) return false;
        } else {
            return false;
        }

        if (ccState.controllerFilter !== 'all' && Number(l.serialNumber) !== Number(ccState.controllerFilter)) {
            return false;
        }

        if (ccState.decisionFilter === 'granted') {
            return ccIsGranted(l) && CC_SWIPE_TYPES.includes(l.type);
        }
        if (ccState.decisionFilter === 'denied') {
            return (!ccIsGranted(l) && CC_SWIPE_TYPES.includes(l.type)) || l.type === 'SECURITY';
        }

        return true;
    });
}

function ccAlertLogs() {
    if (typeof auditLogs === 'undefined' || !Array.isArray(auditLogs)) return [];
    return auditLogs.filter(l => l && (l.type === 'SECURITY' || l.type === 'SWIPE_DENIED' || l.unknownCard)).slice(0, 10);
}

function ccChartsLoading() {
    return (typeof historyLoaded !== 'undefined' && !historyLoaded && ccGetEventLogs().length === 0);
}

function ccChartEmpty(msg) {
    return `<div class="cc-chart-empty"><i class="fa-solid fa-chart-line"></i><span>${esc(msg || 'No telemetry events in current window')}</span></div>`;
}

/* ========================================================================= */
/* 1. EXECUTIVE KPI METRICS RIBBON                                           */
/* ========================================================================= */
function renderCcKpis() {
    const container = document.getElementById('cc-kpi-container');
    if (!container) return;

    const filtered = ccFilteredLogs();
    const swipeLogs = filtered.filter(l => CC_SWIPE_TYPES.includes(l.type));
    const securityLogs = filtered.filter(l => l.type === 'SECURITY');

    let grantedCount = 0;
    let deniedCount = 0;
    const activeCards = new Set();

    swipeLogs.forEach(l => {
        if (ccIsGranted(l)) grantedCount++;
        else deniedCount++;
        if (l.cardNumber) activeCards.add(l.cardNumber);
    });

    const totalSwipes = swipeLogs.length;
    const grantRate = totalSwipes > 0 ? ((grantedCount / totalSwipes) * 100).toFixed(1) : '100.0';
    const totalSecurityIncidents = deniedCount + securityLogs.length + filtered.filter(l => l && l.unknownCard && l.granted).length;

    // Boards uptime
    const boards = ccScannedBoards();
    const onlineBoards = boards.filter(b => !ccIsBoardOffline(b));
    const fleetUptimePct = boards.length > 0 ? Math.round((onlineBoards.length / boards.length) * 100) : 100;

    // Peak hour calculation
    const hourlyCounts = new Array(24).fill(0);
    swipeLogs.forEach(l => {
        const d = ccParseDate(l.timestamp);
        if (d) hourlyCounts[d.getHours()]++;
    });
    let peakHour = 0;
    let peakCount = 0;
    hourlyCounts.forEach((cnt, hr) => {
        if (cnt > peakCount) {
            peakCount = cnt;
            peakHour = hr;
        }
    });
    const peakHourStr = peakCount > 0 ? `${String(peakHour).padStart(2, '0')}:00 (${peakCount} ev)` : 'Normal';

    const enrolledUserCount = (typeof users !== 'undefined' && Array.isArray(users)) ? users.length : 0;

    container.innerHTML = `
        <div class="cc-kpi-card cc-kpi-cyan">
            <div class="cc-kpi-top">
                <span class="cc-kpi-label">Ingress Access Volume</span>
                <div class="cc-kpi-icon"><i class="fa-solid fa-id-card-clip"></i></div>
            </div>
            <div class="cc-kpi-value">${totalSwipes.toLocaleString()}</div>
            <div class="cc-kpi-sub">
                <span class="cc-kpi-chip green"><i class="fa-solid fa-check"></i> ${grantedCount} Granted</span>
                <span class="cc-kpi-chip red"><i class="fa-solid fa-xmark"></i> ${deniedCount} Denied</span>
            </div>
        </div>

        <div class="cc-kpi-card cc-kpi-emerald">
            <div class="cc-kpi-top">
                <span class="cc-kpi-label">Authorization Pass Rate</span>
                <div class="cc-kpi-icon"><i class="fa-solid fa-shield-halved"></i></div>
            </div>
            <div class="cc-kpi-value">${grantRate}%</div>
            <div class="cc-kpi-sub">
                <div class="cc-kpi-bar-wrap">
                    <div class="cc-kpi-bar-fill" style="width: ${grantRate}%;"></div>
                </div>
                <span class="cc-kpi-meta">${deniedCount === 0 ? '100% Verified Entry' : `${deniedCount} Access Exceptions`}</span>
            </div>
        </div>

        <div class="cc-kpi-card cc-kpi-rose">
            <div class="cc-kpi-top">
                <span class="cc-kpi-label">Security & Denials</span>
                <div class="cc-kpi-icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
            </div>
            <div class="cc-kpi-value">${totalSecurityIncidents.toLocaleString()}</div>
            <div class="cc-kpi-sub">
                <span class="cc-kpi-chip red">${deniedCount} Denied Badges</span>
                <span class="cc-kpi-chip amber">${securityLogs.length} Alarms</span>
            </div>
        </div>

        <div class="cc-kpi-card cc-kpi-violet">
            <div class="cc-kpi-top">
                <span class="cc-kpi-label">Active Credentials</span>
                <div class="cc-kpi-icon"><i class="fa-solid fa-users-viewfinder"></i></div>
            </div>
            <div class="cc-kpi-value">${activeCards.size}</div>
            <div class="cc-kpi-sub">
                <span class="cc-kpi-meta">${enrolledUserCount > 0 ? `of ${enrolledUserCount} enrolled cardholders` : 'Live verified badges'}</span>
            </div>
        </div>

        <div class="cc-kpi-card cc-kpi-emerald">
            <div class="cc-kpi-top">
                <span class="cc-kpi-label">Fleet Availability</span>
                <div class="cc-kpi-icon"><i class="fa-solid fa-server"></i></div>
            </div>
            <div class="cc-kpi-value">${fleetUptimePct}%</div>
            <div class="cc-kpi-sub">
                <span class="cc-kpi-chip green">${onlineBoards.length}/${boards.length} Boards Online</span>
                <span class="cc-kpi-meta">UDP 60000 Link OK</span>
            </div>
        </div>

        <div class="cc-kpi-card cc-kpi-amber">
            <div class="cc-kpi-top">
                <span class="cc-kpi-label">Peak Traffic Window</span>
                <div class="cc-kpi-icon"><i class="fa-solid fa-fire-flame-curved"></i></div>
            </div>
            <div class="cc-kpi-value" style="font-size: 21px;">${peakHourStr}</div>
            <div class="cc-kpi-sub">
                <span class="cc-kpi-meta">Busiest ingress shift period</span>
            </div>
        </div>
    `;
}

/* ========================================================================= */
/* 2. CHART 1: 24-HOUR ACCESS TRAFFIC VELOCITY (SMOOTH AREA + VOLUME CURVE)  */
/* ========================================================================= */
function ccVelocityLogs() {
    const vd = ccState.velocityDate || ccGetLocalDateStr();
    const logs = ccGetEventLogs();
    return logs.filter(l => {
        const d = ccParseDate(l.timestamp);
        if (!d) return false;
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        if (`${y}-${m}-${day}` !== vd) return false;
        if (ccState.controllerFilter !== 'all' && Number(l.serialNumber) !== Number(ccState.controllerFilter)) return false;
        if (ccState.decisionFilter === 'granted') return ccIsGranted(l) && CC_SWIPE_TYPES.includes(l.type);
        if (ccState.decisionFilter === 'denied') return (!ccIsGranted(l) && CC_SWIPE_TYPES.includes(l.type)) || l.type === 'SECURITY';
        return CC_SWIPE_TYPES.includes(l.type) || l.type === 'REMOTE_OPEN';
    });
}

function renderCcTimeline() {
    const el = document.getElementById('cc-chart-timeline');
    if (!el) return;
    if (ccChartsLoading()) { el.innerHTML = ccChartEmpty('Loading telemetry events…'); return; }

    const targetDate = ccState.velocityDate || ccGetLocalDateStr();
    const isToday = targetDate === ccGetLocalDateStr();

    // 1. Calculate in-memory logs for the selected date
    const logs = ccVelocityLogs();
    const g = new Array(24).fill(0);
    const d = new Array(24).fill(0);
    logs.forEach(l => {
        const t = ccParseDate(l.timestamp);
        if (!t) return;
        if (ccIsGranted(l)) g[t.getHours()]++;
        else d[t.getHours()]++;
    });

    const localTotal = g.reduce((a, b) => a + b, 0) + d.reduce((a, b) => a + b, 0);

    // Draw immediate baseline from locally available logs if present
    if (localTotal > 0) {
        drawCcTimeline(el, g, d, targetDate);
    } else {
        el.innerHTML = ccChartEmpty('Loading full-day telemetry…');
    }

    // Always fetch full-day hourly telemetry from server (Directus database)
    renderCcTimelineServer(el, targetDate, localTotal > 0);
}

var ccHourlyCache = {};

function renderCcTimelineServer(el, targetDate, hasLocalData = false) {
    const date = targetDate || ccState.velocityDate || ccGetLocalDateStr();
    const isToday = date === ccGetLocalDateStr();
    const serial = (ccState.controllerFilter && ccState.controllerFilter !== 'all') ? String(ccState.controllerFilter) : '';
    const key = date + '|' + serial;
    const hit = ccHourlyCache[key];
    if (hit && !isToday) { drawCcTimeline(el, hit.g.slice(), hit.d.slice(), date); return; }
    if (hit && isToday) { drawCcTimeline(el, hit.g.slice(), hit.d.slice(), date); }
    else if (!hasLocalData) {
        el.innerHTML = ccChartEmpty('Loading full-day telemetry…');
    }
    let url = '/api/history/hourly?date=' + encodeURIComponent(date);
    if (serial) url += '&serial=' + encodeURIComponent(serial);
    fetch(url).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
    }).then(data => {
        const hours = (data && data.success && Array.isArray(data.hours)) ? data.hours : (data && data.data && Array.isArray(data.data.hours) ? data.data.hours : null);
        if (!hours || hours.length !== 24) throw new Error((data && data.error) || 'Bad hourly payload');
        const g = hours.map(h => Number(h.granted) || 0);
        const dd = hours.map(h => Number(h.denied) || 0);
        ccHourlyCache[key] = { g: g, d: dd };
        const currentTarget = ccState.velocityDate || ccGetLocalDateStr();
        const stillCurrent = currentTarget === date &&
            ((ccState.controllerFilter !== 'all') ? String(ccState.controllerFilter) === serial : serial === '');
        if (stillCurrent && el.isConnected) drawCcTimeline(el, g.slice(), dd.slice(), date);
    }).catch(err => {
        const currentTarget = ccState.velocityDate || ccGetLocalDateStr();
        if (currentTarget !== date || !el.isConnected) return;
        if (!hasLocalData) {
            el.innerHTML = ccChartEmpty(`No swipes recorded on ${esc(date)}`);
        }
    });
}

function drawCcTimeline(el, g, d, targetDate) {
    targetDate = targetDate || ccState.velocityDate || ccGetLocalDateStr();
    const isToday = targetDate === ccGetLocalDateStr();
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    if (ccState.decisionFilter === 'granted') { d = d.map(() => 0); }
    else if (ccState.decisionFilter === 'denied') { g = g.map(() => 0); }
    const tot = g.reduce((a, b) => a + b, 0) + d.reduce((a, b) => a + b, 0);
    if (tot === 0) {
        const dateLabel = isToday ? 'today' : `on ${esc(targetDate)}`;
        el.innerHTML = ccChartEmpty(`No swipes recorded ${dateLabel}`);
        return;
    }

    const max = Math.max(1, ...g, ...d);

    // Calculate coordinate width from container and derive proportional SVG height
    const cardEl = el ? el.closest('.cc-chart-card') : null;
    let W = 840;
    if (el && el.clientWidth > 100) {
        W = Math.round(el.clientWidth);
    } else if (cardEl && cardEl.clientWidth > 100) {
        W = Math.round(cardEl.clientWidth - 32);
    }

    // Stable coordinate height derived purely from width (~4:1 aspect ratio, bounded 180px - 225px)
    // NEVER measure card clientHeight here: height measurements create recursive feedback loops with observers
    const H = Math.max(180, Math.min(225, Math.round(W * (215 / 840))));

    const PAD_L = 36, PAD_B = 26, TOP = 16;
    const plotW = W - PAD_L - 14, plotH = H - TOP - PAD_B;
    const slot = plotW / 24;

    // Build data points for smooth curves
    const gPoints = [];
    const dPoints = [];
    let bars = '';

    for (let h = 0; h < 24; h++) {
        const x = PAD_L + h * slot + slot / 2;
        const gy = TOP + plotH - Math.round((g[h] / max) * plotH);
        const dy = TOP + plotH - Math.round((d[h] / max) * plotH);
        gPoints.push({ x, y: gy, val: g[h], hour: h });
        dPoints.push({ x, y: dy, val: d[h], hour: h });

        // Subtle background columns for volume depth
        const barW = Math.max(8, Math.round(slot * 0.55));
        const barX = x - barW / 2;
        const totH = Math.round(((g[h] + d[h]) / max) * plotH);
        if (totH > 0) {
            bars += `<rect x="${barX}" y="${TOP + plotH - totH}" width="${barW}" height="${totH}" rx="3" fill="rgba(6,182,212,0.12)" />`;
        }

        // X-axis time labels every 3 hours
        if (h % 3 === 0) {
            bars += `<text x="${x}" y="${H - 7}" font-size="9" fill="var(--text-dim)" font-family="var(--font-mono)" text-anchor="middle">${String(h).padStart(2, '0')}:00</text>`;
        }
    }

    // Spline curve generator
    function makeSpline(pts) {
        if (pts.length === 0) return '';
        let path = `M ${pts[0].x} ${pts[0].y}`;
        for (let i = 0; i < pts.length - 1; i++) {
            const p0 = pts[i];
            const p1 = pts[i + 1];
            const cpX = (p1.x - p0.x) / 2;
            path += ` C ${p0.x + cpX} ${p0.y}, ${p1.x - cpX} ${p1.y}, ${p1.x} ${p1.y}`;
        }
        return path;
    }

    const gSpline = makeSpline(gPoints);
    const dSpline = makeSpline(dPoints);

    // Closed area paths
    const gArea = `${gSpline} L ${gPoints[gPoints.length - 1].x} ${TOP + plotH} L ${gPoints[0].x} ${TOP + plotH} Z`;

    // Horizontal grid lines
    const grid = [0.25, 0.5, 0.75, 1].map(f => {
        const y = TOP + plotH * (1 - f);
        return `<line x1="${PAD_L}" y1="${y}" x2="${W - 10}" y2="${y}" stroke="var(--chart-grid-line, rgba(255,255,255,0.06))" stroke-dasharray="3,3" stroke-width="1"/>` +
            `<text x="4" y="${y + 3}" font-size="8.5" fill="var(--text-dim)" font-family="var(--font-mono)">${Math.round(max * f)}</text>`;
    }).join('');

    // Glowing node points
    const gNodes = gPoints.filter(p => p.val > 0).map(p =>
        `<circle cx="${p.x}" cy="${p.y}" r="3" fill="#10b981" stroke="#064e3b" stroke-width="1.5"/>`
    ).join('');

    const dNodes = dPoints.filter(p => p.val > 0).map(p =>
        `<circle cx="${p.x}" cy="${p.y}" r="3" fill="#ef4444" stroke="#7f1d1d" stroke-width="1.5"/>`
    ).join('');

    // Interactive tracker line and hover slots
    let hoverSlots = '';
    for (let h = 0; h < 24; h++) {
        const slotX = PAD_L + h * slot;
        const isFuture = isToday && h > currentHour;
        hoverSlots += `<rect class="cc-timeline-slot" data-hour="${h}" data-granted="${g[h]}" data-denied="${d[h]}" data-future="${isFuture ? '1' : '0'}" x="${slotX}" y="${TOP}" width="${slot}" height="${plotH}" fill="transparent" style="cursor: crosshair;"/>`;
    }

    // Current time indicator line if viewing today
    let nowLineSvg = '';
    if (isToday) {
        const nowX = PAD_L + (currentHour + currentMinute / 60) * slot;
        const badgeX = Math.min(Math.max(PAD_L + 24, nowX), PAD_L + plotW - 24);
        const timeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
        nowLineSvg = `
            <g class="cc-timeline-now-marker" style="pointer-events: none;">
                <line x1="${nowX}" y1="${TOP}" x2="${nowX}" y2="${TOP + plotH}" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="3,3" opacity="0.9"/>
                <g transform="translate(${badgeX}, ${TOP})">
                    <rect x="-25" y="-13" width="50" height="13" rx="3" fill="#0284c7" opacity="0.95"/>
                    <text x="0" y="-3" font-size="8.5" fill="#ffffff" font-family="var(--font-mono)" font-weight="700" text-anchor="middle">NOW ${timeStr}</text>
                </g>
            </g>
        `;
    }

    const defs = `
        <defs>
            <linearGradient id="cc-area-granted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#10b981" stop-opacity="0.35"/>
                <stop offset="60%" stop-color="#10b981" stop-opacity="0.10"/>
                <stop offset="100%" stop-color="#10b981" stop-opacity="0.0"/>
            </linearGradient>
            <filter id="cc-line-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#10b981" flood-opacity="0.35"/>
            </filter>
        </defs>
    `;

    const totalG = g.reduce((a, b) => a + b, 0);
    const totalD = d.reduce((a, b) => a + b, 0);

    el.innerHTML =
        `<div class="cc-timeline-chart-wrap" style="position: relative;">` +
        `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" class="cc-svg cc-timeline-svg" role="img" aria-label="Access volume timeline by hour">` +
        `${defs}${grid}${bars}` +
        `<path d="${gArea}" fill="url(#cc-area-granted)" style="pointer-events: none;"/>` +
        `<path d="${gSpline}" fill="none" stroke="#10b981" stroke-width="2.5" filter="url(#cc-line-glow)" style="pointer-events: none;"/>` +
        `<path d="${dSpline}" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="4,3" style="pointer-events: none;"/>` +
        `${gNodes}${dNodes}` +
        `${nowLineSvg}` +
        `<line id="cc-timeline-cursor" x1="-100" y1="${TOP}" x2="-100" y2="${TOP + plotH}" stroke="#06b6d4" stroke-width="1.5" stroke-dasharray="3,3" style="pointer-events: none; transition: x 0.08s ease;"/>` +
        `${hoverSlots}` +
        `</svg>` +
        `<div id="cc-timeline-floating-tooltip" class="cc-floating-tooltip" style="display: none;"></div>` +
        `</div>` +
        `<div class="cc-chart-foot">` +
        `<span class="stat-chip green" title="Total Granted: ${totalG.toLocaleString()}"><i class="fa-solid fa-circle-check"></i><b>${totalG.toLocaleString()}</b><span class="chip-text">&nbsp;Granted</span></span>` +
        `<span class="stat-chip red" title="Total Denied: ${totalD.toLocaleString()}"><i class="fa-solid fa-circle-xmark"></i><b>${totalD.toLocaleString()}</b><span class="chip-text">&nbsp;Denied</span></span>` +
        `<span class="stat-chip cyan" title="Total Swipes: ${tot.toLocaleString()}"><i class="fa-solid fa-bolt"></i><b>${tot.toLocaleString()}</b><span class="chip-text">&nbsp;Total Swipes</span></span>` +
        `<span class="stat-chip amber" title="Peak Hourly Volume: ${max}/hr"><i class="fa-solid fa-arrow-trend-up"></i><span class="chip-text">Peak Flow:&nbsp;</span><b>${max}</b><span class="chip-text">/hr</span></span>` +
        `</div>`;

    // Interactive tooltip hover binding
    const tooltipEl = el.querySelector('#cc-timeline-floating-tooltip');
    const cursorLine = el.querySelector('#cc-timeline-cursor');
    const wrapEl = el.querySelector('.cc-timeline-chart-wrap');

    el.querySelectorAll('.cc-timeline-slot').forEach(slotEl => {
        slotEl.addEventListener('mouseenter', (e) => {
            const h = Number(slotEl.dataset.hour);
            const gr = Number(slotEl.dataset.granted);
            const dn = Number(slotEl.dataset.denied);
            const isFuture = slotEl.dataset.future === '1';
            const tot = gr + dn;
            const x = Number(slotEl.getAttribute('x')) + slot / 2;

            if (cursorLine) cursorLine.setAttribute('x1', x);
            if (cursorLine) cursorLine.setAttribute('x2', x);

            if (tooltipEl && wrapEl) {
                tooltipEl.style.display = 'block';
                const futureBadge = isFuture ? '<span style="font-size:10px; color:#94a3b8; font-weight:normal; margin-left:6px;">(Upcoming)</span>' : '';
                tooltipEl.innerHTML =
                    `<div class="cc-tooltip-header"><i class="fa-regular fa-clock"></i> <b>${String(h).padStart(2, '0')}:00 - ${String(h).padStart(2, '0')}:59</b>${futureBadge}</div>` +
                    `<div class="cc-tooltip-row"><span class="green"><i class="fa-solid fa-check"></i> Granted:</span> <b>${gr}</b></div>` +
                    `<div class="cc-tooltip-row"><span class="red"><i class="fa-solid fa-xmark"></i> Denied:</span> <b>${dn}</b></div>` +
                    `<div class="cc-tooltip-row cc-tooltip-tot"><span>Total Ingress:</span> <b>${tot}</b></div>`;

                // Calculate relative position inside wrap
                const rect = wrapEl.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                tooltipEl.style.left = `${Math.min(Math.max(10, mouseX - 60), rect.width - 150)}px`;
                tooltipEl.style.top = '12px';
            }
        });
    });

    if (wrapEl) {
        wrapEl.addEventListener('mouseleave', () => {
            if (tooltipEl) tooltipEl.style.display = 'none';
            if (cursorLine) {
                cursorLine.setAttribute('x1', '-100');
                cursorLine.setAttribute('x2', '-100');
            }
        });
    }
}

/* ========================================================================= */
/* 3. CHART 2: DECISION MATRIX (PRECISION MULTI-SEGMENT DONUT)               */
/* ========================================================================= */
function renderCcDonut() {
    const el = document.getElementById('cc-chart-donut');
    if (!el) return;
    if (ccChartsLoading()) { el.innerHTML = ccChartEmpty('Loading decision metrics…'); return; }

    const filtered = ccFilteredLogs();
    const swipeLogs = filtered.filter(l => CC_SWIPE_TYPES.includes(l.type));
    const securityLogs = filtered.filter(l => l.type === 'SECURITY');

    let g = 0;
    let dn = 0;
    const cards = new Set();
    swipeLogs.forEach(l => {
        if (ccIsGranted(l)) g++;
        else dn++;
        if (l.cardNumber) cards.add(l.cardNumber);
    });

    const sec = securityLogs.length;
    const total = g + dn + sec;

    if (total === 0) { el.innerHTML = ccChartEmpty('No decision events in filter'); return; }

    const rate = (g / Math.max(1, g + dn));
    const pct = Math.round(rate * 100);

    const R = 60;
    const C = 2 * Math.PI * R;
    const gLen = (C * (g / total));
    const dnLen = (C * (dn / total));
    const secLen = (C * (sec / total));

    const gDash = `${gLen.toFixed(1)} ${(C - gLen).toFixed(1)}`;
    const dnDash = `${dnLen.toFixed(1)} ${(C - dnLen).toFixed(1)}`;
    const secDash = `${secLen.toFixed(1)} ${(C - secLen).toFixed(1)}`;

    const dnOffset = (-gLen).toFixed(1);
    const secOffset = (-(gLen + dnLen)).toFixed(1);

    const gPct = Math.round((g / total) * 100);
    const dnPct = Math.round((dn / total) * 100);
    const secPct = Math.round((sec / total) * 100);

    const isGrantedActive = ccState.decisionFilter === 'granted';
    const isDeniedActive = ccState.decisionFilter === 'denied';

    el.innerHTML =
        `<div class="cc-donut-container">` +
        `<div class="cc-donut-graphic-wrap">` +
        `<svg viewBox="0 0 170 170" class="cc-donut-svg" role="img" aria-label="Authorization pass rate ${pct}%">` +
        `<defs>` +
        `<filter id="cc-donut-glow" x="-20%" y="-20%" width="140%" height="140%">` +
        `<feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="#10b981" flood-opacity="0.35"/>` +
        `</filter>` +
        `</defs>` +
        `<circle cx="85" cy="85" r="${R}" fill="none" stroke="var(--chart-base-ring, rgba(255,255,255,0.06))" stroke-width="18"/>` +
        (gLen > 0 ? `<circle cx="85" cy="85" r="${R}" fill="none" stroke="#10b981" stroke-width="18" stroke-linecap="round" stroke-dasharray="${gDash}" stroke-dashoffset="0" transform="rotate(-90 85 85)" filter="url(#cc-donut-glow)"><title>Granted: ${g} (${gPct}%)</title></circle>` : '') +
        (dnLen > 0 ? `<circle cx="85" cy="85" r="${R}" fill="none" stroke="#ef4444" stroke-width="18" stroke-linecap="round" stroke-dasharray="${dnDash}" stroke-dashoffset="${dnOffset}" transform="rotate(-90 85 85)"><title>Denied: ${dn} (${dnPct}%)</title></circle>` : '') +
        (secLen > 0 ? `<circle cx="85" cy="85" r="${R}" fill="none" stroke="#f59e0b" stroke-width="18" stroke-linecap="round" stroke-dasharray="${secDash}" stroke-dashoffset="${secOffset}" transform="rotate(-90 85 85)"><title>Security Alerts: ${sec} (${secPct}%)</title></circle>` : '') +
        `<text x="85" y="78" text-anchor="middle" font-size="30" font-weight="800" fill="var(--text-heading, #fff)" font-family="var(--font-mono)">${pct}%</text>` +
        `<text x="85" y="96" text-anchor="middle" font-size="9" font-weight="700" fill="#10b981" letter-spacing="1.2" font-family="var(--font-mono)">PASS RATE</text>` +
        `<text x="85" y="109" text-anchor="middle" font-size="8.5" font-weight="600" fill="var(--text-dim)" font-family="var(--font-mono)">${total} EVENTS</text>` +
        `</svg>` +
        `</div>` +
        `<div class="cc-donut-simple-legends" role="list" aria-label="Decision legends">` +
        `<div class="cc-simple-legend-item ${isGrantedActive ? 'active' : ''}" data-decision="granted" role="button" tabindex="0" title="Click to filter by Granted events">` +
        `<span class="cc-simple-legend-dot" style="background: #10b981; box-shadow: 0 0 6px rgba(16,185,129,0.55);"></span>` +
        `<span class="cc-simple-legend-label">Granted</span>` +
        `<b class="cc-simple-legend-val">${g.toLocaleString()}</b>` +
        `<span class="cc-simple-legend-pct">(${gPct}%)</span>` +
        `</div>` +
        `<div class="cc-simple-legend-item ${isDeniedActive ? 'active' : ''}" data-decision="denied" role="button" tabindex="0" title="Click to filter by Denied events">` +
        `<span class="cc-simple-legend-dot" style="background: #ef4444; box-shadow: 0 0 6px rgba(239,68,68,0.55);"></span>` +
        `<span class="cc-simple-legend-label">Denied</span>` +
        `<b class="cc-simple-legend-val">${dn.toLocaleString()}</b>` +
        `<span class="cc-simple-legend-pct">(${dnPct}%)</span>` +
        `</div>` +
        `<div class="cc-simple-legend-item ${isDeniedActive ? 'active' : ''}" data-decision="denied" role="button" tabindex="0" title="Click to filter by Security alerts">` +
        `<span class="cc-simple-legend-dot" style="background: #f59e0b; box-shadow: 0 0 6px rgba(245,158,11,0.55);"></span>` +
        `<span class="cc-simple-legend-label">Alarms</span>` +
        `<b class="cc-simple-legend-val">${sec.toLocaleString()}</b>` +
        `<span class="cc-simple-legend-pct">(${secPct}%)</span>` +
        `</div>` +
        `</div>` +
        `</div>`;

    // Interactive filter toggle from legend items
    el.querySelectorAll('.cc-simple-legend-item').forEach(btn => {
        const toggleFilter = () => {
            const dec = btn.dataset.decision;
            if (!dec) return;
            ccState.decisionFilter = (ccState.decisionFilter === dec) ? 'all' : dec;
            document.querySelectorAll('.cc-decision-pill').forEach(b => {
                b.classList.toggle('active', (b.dataset.decision || 'all') === ccState.decisionFilter);
            });
            renderCommandCenter();
        };
        btn.addEventListener('click', toggleFilter);
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleFilter();
            }
        });
    });
}

/* ========================================================================= */
/* 4. CHART 3: DOOR TRAFFIC LEADERBOARD (COMPACT INLINE ROWS)                */
/* ========================================================================= */
function renderCcDoorBars() {
    const el = document.getElementById('cc-chart-doors');
    if (!el) return;
    if (ccChartsLoading()) { el.innerHTML = ccChartEmpty('Loading door traffic…'); return; }

    const logs = ccFilteredLogs().filter(l => CC_SWIPE_TYPES.includes(l.type));
    if (logs.length === 0) { el.innerHTML = ccChartEmpty('No door traffic data in filter'); return; }

    const map = {};
    let grandTotal = 0;

    logs.forEach(l => {
        const door = l.doorName || (l.doorNumber ? 'Door ' + l.doorNumber : 'Main Entrance');
        const ctrl = l.controllerName || (l.serialNumber ? 'SN:' + l.serialNumber : 'Controller');
        const key = door + '§' + ctrl;
        if (!map[key]) {
            map[key] = { door: door, ctrl: ctrl, g: 0, d: 0, total: 0 };
        }
        if (ccIsGranted(l)) map[key].g++;
        else map[key].d++;
        map[key].total++;
        grandTotal++;
    });

    const rows = Object.values(map).sort((a, b) => b.total - a.total).slice(0, 5);

    const rowsHtml = rows.map((r, i) => {
        const tot = r.total;
        const pctOfFacility = Math.round((tot / grandTotal) * 100);
        const gwPct = Math.round((r.g / tot) * 100);
        const dwPct = 100 - gwPct;

        return `
            <div class="cc-door-row-compact">
                <div class="cc-door-rank rank-${i + 1}">#${i + 1}</div>
                <div class="cc-door-title-wrap">
                    <div class="cc-door-name" title="${esc(r.door)}">${esc(r.door)}</div>
                    <div class="cc-door-ctrl" title="${esc(r.ctrl)}">${esc(r.ctrl)}</div>
                </div>
                <div class="cc-door-bar-track-compact" title="${r.g} granted (${gwPct}%), ${r.d} denied (${dwPct}%)">
                    <div class="cc-door-bar-granted" style="width: ${gwPct}%;"></div>
                    <div class="cc-door-bar-denied" style="width: ${dwPct}%;"></div>
                </div>
                <div class="cc-door-metrics-compact">
                    <span class="cc-door-count-compact"><b>${tot.toLocaleString()}</b></span>
                    <span class="cc-door-pill-stat" title="Share of facility traffic">${pctOfFacility}%</span>
                </div>
            </div>
        `;
    }).join('');

    el.innerHTML =
        `<div class="cc-door-list-wrap">${rowsHtml}</div>` +
        `<div style="display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: var(--text-dim); margin-top: 8px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.06); font-family: var(--font-mono);">` +
        `<span><i class="fa-solid fa-circle" style="color: #10b981; font-size: 7px;"></i> Granted Ratio</span>` +
        `<span><i class="fa-solid fa-circle" style="color: #ef4444; font-size: 7px;"></i> Denied Ratio</span>` +
        `<span>Top 5 of ${Object.keys(map).length} monitored doors</span>` +
        `</div>`;
}

/* ========================================================================= */
/* 5. CHART 4: 24-HOUR ACTIVITY DENSITY HEATMAP & SHIFT RHYTHM BREAKDOWN     */
/* ========================================================================= */
function renderCcHeatmap() {
    const el = document.getElementById('cc-chart-heatmap');
    if (!el) return;
    if (ccChartsLoading()) { el.innerHTML = ccChartEmpty('Loading heatmap…'); return; }

    const logs = ccFilteredLogs().filter(l => CC_SWIPE_TYPES.includes(l.type));
    if (logs.length === 0) { el.innerHTML = ccChartEmpty('No swipe density data yet'); return; }

    const buckets = new Array(24).fill(0);
    let morning = 0, afternoon = 0, night = 0;
    logs.forEach(l => {
        const t = ccParseDate(l.timestamp);
        if (t) {
            const h = t.getHours();
            buckets[h]++;
            if (h >= 6 && h < 12) morning++;
            else if (h >= 12 && h < 18) afternoon++;
            else night++;
        }
    });

    const max = Math.max(1, ...buckets);
    let peakHour = 0;
    buckets.forEach((cnt, hr) => { if (cnt === max) peakHour = hr; });

    let tilesHtml = '';
    for (let h = 0; h < 24; h++) {
        const count = buckets[h];
        const ratio = count / max;
        let heatClass = 'heat-0';
        if (ratio > 0.75) heatClass = 'heat-4';
        else if (ratio > 0.50) heatClass = 'heat-3';
        else if (ratio > 0.25) heatClass = 'heat-2';
        else if (count > 0) heatClass = 'heat-1';

        tilesHtml += `
            <div class="cc-heat-tile ${heatClass}" title="${String(h).padStart(2, '0')}:00 — ${count} access events">
                <span class="cc-heat-hour">${String(h).padStart(2, '0')}h</span>
                <span class="cc-heat-val">${count}</span>
            </div>
        `;
    }

    const totalSwipes = Math.max(1, logs.length);
    const mPct = Math.round((morning / totalSwipes) * 100);
    const aPct = Math.round((afternoon / totalSwipes) * 100);
    const nPct = Math.max(0, 100 - (mPct + aPct));

    el.innerHTML =
        `<div class="cc-heatmap-container">` +
        `<div class="cc-heatmap-grid">${tilesHtml}</div>` +
        `<div class="cc-shift-grid">` +
        `<div class="cc-shift-card">` +
        `<div class="cc-shift-card-header"><span class="cc-shift-card-title"><i class="fa-regular fa-sun" style="color: #06b6d4;"></i> Morning</span><span>06–12h</span></div>` +
        `<div class="cc-shift-card-val"><span>${morning}</span><span class="cc-shift-card-pct">${mPct}%</span></div>` +
        `<div class="cc-shift-bar-track"><div class="cc-shift-bar-fill" style="width: ${mPct}%; background: #06b6d4;"></div></div>` +
        `</div>` +
        `<div class="cc-shift-card">` +
        `<div class="cc-shift-card-header"><span class="cc-shift-card-title"><i class="fa-solid fa-sun" style="color: #10b981;"></i> Afternoon</span><span>12–18h</span></div>` +
        `<div class="cc-shift-card-val"><span>${afternoon}</span><span class="cc-shift-card-pct">${aPct}%</span></div>` +
        `<div class="cc-shift-bar-track"><div class="cc-shift-bar-fill" style="width: ${aPct}%; background: #10b981;"></div></div>` +
        `</div>` +
        `<div class="cc-shift-card">` +
        `<div class="cc-shift-card-header"><span class="cc-shift-card-title"><i class="fa-solid fa-moon" style="color: #a855f7;"></i> Night</span><span>18–06h</span></div>` +
        `<div class="cc-shift-card-val"><span>${night}</span><span class="cc-shift-card-pct">${nPct}%</span></div>` +
        `<div class="cc-shift-bar-track"><div class="cc-shift-bar-fill" style="width: ${nPct}%; background: #a855f7;"></div></div>` +
        `</div>` +
        `</div>` +
        `<div class="cc-shift-multi-bar" title="Morning ${mPct}%, Afternoon ${aPct}%, Night ${nPct}%">` +
        `<div style="width: ${mPct}%; background: #06b6d4;"></div>` +
        `<div style="width: ${aPct}%; background: #10b981;"></div>` +
        `<div style="width: ${nPct}%; background: #a855f7;"></div>` +
        `</div>` +
        `<div class="cc-heatmap-footer">` +
        `<span><i class="fa-solid fa-fire" style="color: var(--accent-warning);"></i> Peak Window: <b>${String(peakHour).padStart(2, '0')}:00 (${max} ev/h)</b></span>` +
        `<span>Total Ingress Density: <b>${logs.length.toLocaleString()}</b></span>` +
        `</div>` +
        `</div>`;
}

/* ========================================================================= */
/* 6. CHART 5: PERIMETER SECURITY ANOMALY & THREAT CLASSIFICATION AUDIT      */
/* ========================================================================= */
function renderCcSecurityMatrix() {
    const el = document.getElementById('cc-chart-security-matrix');
    if (!el) return;
    if (ccChartsLoading()) { el.innerHTML = ccChartEmpty('Loading anomaly audit…'); return; }

    const logs = ccFilteredLogs();
    const securityEvents = logs.filter(l => l.type === 'SECURITY');
    const deniedSwipes = logs.filter(l => l.type === 'SWIPE_DENIED' || (CC_SWIPE_TYPES.includes(l.type) && !ccIsGranted(l)));
    const totalSwipes = logs.filter(l => CC_SWIPE_TYPES.includes(l.type)).length;

    const categories = {
        uncredentialed: 0,
        spoof: 0,
        deniedCard: deniedSwipes.length,
        other: 0
    };

    securityEvents.forEach(l => {
        const msg = (l.message || l.detail || '').toLowerCase();
        if (msg.includes('no credential') || msg.includes('forced')) categories.uncredentialed++;
        else if (msg.includes('spoof') || msg.includes('mismatch')) categories.spoof++;
        else categories.other++;
    });

    const totalAnomalies = categories.uncredentialed + categories.spoof + categories.deniedCard + categories.other;
    const integrityPct = totalSwipes > 0
        ? Math.max(0, Math.min(100, Math.round(((totalSwipes - totalAnomalies) / totalSwipes) * 1000) / 10)).toFixed(1)
        : (totalAnomalies === 0 ? '100.0' : '92.5');

    const isSecure = totalAnomalies === 0;

    const items = [
        { label: 'Uncredentialed Forced Entry', count: categories.uncredentialed, icon: 'fa-door-open', color: '#ef4444', severity: 'CRITICAL', desc: 'Door contact broken with NO valid badge or PIN' },
        { label: 'Unauthorized Card Swipes', count: categories.deniedCard, icon: 'fa-id-card', color: '#f59e0b', severity: 'WARNING', desc: 'Attempted access with invalid privileges or expired badge' },
        { label: 'UDP Spoof / Network Alarms', count: categories.spoof, icon: 'fa-network-wired', color: '#ec4899', severity: 'HIGH RISK', desc: 'Controller IP mismatch packets intercepted by gateway' }
    ];

    const rows = items.map(item => {
        const hasThreat = item.count > 0;
        const pct = totalAnomalies > 0 ? Math.round((item.count / totalAnomalies) * 100) : 0;
        const rowClass = hasThreat ? 'cc-threat-row' : 'cc-threat-row threat-clear';
        const badgeStyle = hasThreat
            ? `background: ${item.color}22; color: ${item.color}; border: 1px solid ${item.color}44;`
            : `background: rgba(16,185,129,0.12); color: #10b981; border: 1px solid rgba(16,185,129,0.25);`;
        const badgeLabel = hasThreat ? item.severity : 'NOMINAL';
        const countDisplay = hasThreat
            ? `<span class="cc-threat-count" style="color: ${item.color};">${item.count} <small>(${pct}%)</small></span>`
            : `<span class="cc-threat-count" style="color: #10b981; font-size: 10px;">0 · CLEAR</span>`;
        const barWidth = hasThreat ? Math.max(5, pct) : 0;

        return `
            <div class="${rowClass}">
                <div class="cc-threat-header">
                    <div class="cc-threat-title">
                        <i class="fa-solid ${item.icon}" style="color: ${hasThreat ? item.color : '#10b981'};"></i>
                        <b>${esc(item.label)}</b>
                        <span class="cc-threat-badge" style="${badgeStyle}">${badgeLabel}</span>
                    </div>
                    ${countDisplay}
                </div>
                <div class="cc-threat-bar-wrap">
                    <div class="cc-threat-bar" style="width: ${barWidth}%; background: ${item.color};"></div>
                </div>
                <div class="cc-threat-desc">${esc(item.desc)}</div>
            </div>
        `;
    }).join('');

    el.innerHTML =
        `<div class="cc-threat-container">` +
        `<div class="cc-security-health-header ${isSecure ? '' : 'alert-active'}">` +
        `<div class="cc-security-health-title">` +
        `<i class="fa-solid ${isSecure ? 'fa-shield-check' : 'fa-triangle-exclamation'}" style="color: ${isSecure ? '#10b981' : '#f59e0b'};"></i>` +
        `<span>Perimeter Defense Health</span>` +
        `</div>` +
        `<div class="cc-security-health-stat" style="color: ${isSecure ? '#10b981' : '#f59e0b'};">${integrityPct}% Defense Integrity</div>` +
        `</div>` +
        `${rows}` +
        `<div class="cc-defense-posture-strip">` +
        `<span class="cc-defense-pill"><i class="fa-solid fa-circle-check"></i> Wiegand Guard</span>` +
`<span class="cc-defense-pill"><i class="fa-solid fa-circle-check"></i> Anti-Passback</span>` +
`</div>` +
        `</div>`;
}

/* ========================================================================= */
/* 7. CHART 6: TOP ACTIVE CARDHOLDERS & BADGES LEADERBOARD                   */
/* ========================================================================= */
function renderCcTopUsers() {
    const el = document.getElementById('cc-chart-top-users');
    if (!el) return;
    if (ccChartsLoading()) { el.innerHTML = ccChartEmpty('Loading user activity…'); return; }

    const logs = ccFilteredLogs().filter(l => CC_SWIPE_TYPES.includes(l.type) && l.cardNumber);
    if (logs.length === 0) { el.innerHTML = ccChartEmpty('No badge activity recorded in window'); return; }

    const userMap = {};
    logs.forEach(l => {
        const cno = l.cardNumber;
        if (!userMap[cno]) {
            userMap[cno] = {
                card: cno,
                name: l.userName || `Cardholder #${cno}`,
                granted: 0,
                denied: 0,
                topDoor: l.doorName || (l.doorNumber ? `Door ${l.doorNumber}` : 'Main Gate'),
                lastSeen: l.timestamp
            };
        }
        if (ccIsGranted(l)) userMap[cno].granted++;
        else userMap[cno].denied++;
    });

    const topList = Object.values(userMap).sort((a, b) => (b.granted + b.denied) - (a.granted + a.denied)).slice(0, 5);
    const maxUserSwipes = Math.max(1, ...topList.map(u => u.granted + u.denied));

    const listHtml = topList.map((u, idx) => {
        const tot = u.granted + u.denied;
        const barPct = Math.round((tot / maxUserSwipes) * 100);
        const statusBadge = u.denied > 0
            ? `<span class="badge-status" style="background: rgba(239,68,68,0.15); color: #ef4444;"><i class="fa-solid fa-xmark"></i> ${u.denied} Denied</span>`
            : `<span class="badge-status" style="background: rgba(16,185,129,0.15); color: #10b981;"><i class="fa-solid fa-check"></i> Clean</span>`;

        return `
            <div class="cc-topuser-row">
                <div class="cc-topuser-rank rank-${idx + 1}">#${idx + 1}</div>
                <div class="cc-topuser-info">
                    <div class="cc-topuser-name">${esc(u.name)}</div>
                    <div class="cc-topuser-card"><i class="fa-regular fa-credit-card"></i> Badge #${esc(String(u.card))} · <span style="color: var(--text-muted);">${esc(u.topDoor)}</span></div>
                    <div class="cc-topuser-bar-wrap">
                        <div class="cc-topuser-bar-fill" style="width: ${barPct}%;"></div>
                    </div>
                </div>
                <div class="cc-topuser-count">
                    <b>${tot}</b> <span style="font-size: 10px; color: var(--text-dim);">swipes</span>
                </div>
                <div class="cc-topuser-status">${statusBadge}</div>
            </div>
        `;
    }).join('');

    el.innerHTML = `<div class="cc-topuser-list">${listHtml}</div>`;
}

/* ========================================================================= */
/* 8. FLEET HEALTH & SUMMARY STRIP                                           */
/* ========================================================================= */
function renderCcFleet() {
    const summaryEl = document.getElementById('cc-fleet-summary');
    const bodyEl = document.getElementById('cc-fleet-body');
    if (!summaryEl && !bodyEl) return;

    const boards = ccScannedBoards();
    const online = boards.filter(b => !ccIsBoardOffline(b));
    const offline = boards.filter(b => ccIsBoardOffline(b));

    if (summaryEl) {
        summaryEl.innerHTML =
            `<span class="stat-chip green" style="font-size: 10px; padding: 2px 7px;"><i class="fa-solid fa-circle-check"></i> Online: <b>${online.length}</b></span>` +
            (offline.length > 0 ? `<span class="stat-chip red" style="font-size: 10px; padding: 2px 7px;"><i class="fa-solid fa-circle-xmark"></i> Offline: <b>${offline.length}</b></span>` : '') +
            `<span class="stat-chip cyan" style="font-size: 10px; padding: 2px 7px;"><i class="fa-solid fa-server"></i> Fleet: <b>${boards.length}</b></span>`;
    }
    if (!bodyEl) return;

    if (boards.length === 0) {
        bodyEl.innerHTML = '<div class="empty-state" style="padding: 24px 12px; text-align: center;"><i class="fa-solid fa-network-wired" style="font-size: 22px; opacity: 0.5;"></i><p style="font-size: 12px; color: var(--text-dim); margin: 8px 0 0;">No controllers discovered yet — click Scan Network.</p></div>';
        return;
    }

    const tiles = boards.map(ctrl => {
        const off = ccIsBoardOffline(ctrl);
        const edge = off ? '#ef4444' : '#10b981';
        const dot = `<i class="fa-solid fa-circle" style="font-size: 8px; color: ${edge};"></i>`;
        const action = off
                    ? `<button class="btn btn-outline" style="padding: 2px 8px; font-size: 10px;" data-fn="retryBoardConnection" data-a1="${ctrl.serialNumber}" data-requires="write" title="Retry connection"><i class="fa-solid fa-rotate"></i> Retry</button>`
            : `<span style="font-size: 10px; color: #10b981; font-family: var(--font-mono); font-weight: 600;"><i class="fa-solid fa-check"></i> Link OK</span>`;
        return `
            <div class="cc-fleet-compact-tile" style="border-left: 3px solid ${edge};">
                <div class="cc-fleet-tile-info">
                    <div class="cc-fleet-tile-name">${dot}<span>${esc(ctrl.name || ('SN:' + ctrl.serialNumber))}</span></div>
                    <div class="cc-fleet-tile-meta">SN:${esc(String(ctrl.serialNumber))} · ${esc(ctrl.ip || '---')}</div>
                </div>
                <div style="flex-shrink: 0;">${action}</div>
            </div>
        `;
    }).join('');

    bodyEl.innerHTML = tiles;
}

/* ========================================================================= */
/* 9. SECURITY & AUDIT ALERTS FEED                                           */
/* ========================================================================= */
function renderCcAlerts() {
    const tbody = document.getElementById('cc-alerts-body');
    if (!tbody) return;
    const alerts = ccAlertLogs();
    if (typeof historyLoaded !== 'undefined' && !historyLoaded) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 28px 12px; color: var(--text-dim);"><i class="fa-solid fa-spinner fa-spin" style="margin-right: 8px;"></i>Loading alerts…</td></tr>';
        return;
    }
    if (alerts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 28px 12px; color: var(--text-dim);"><i class="fa-solid fa-shield-check" style="color: #10b981; margin-right: 6px;"></i>No security alerts detected</td></tr>';
        return;
    }
    tbody.innerHTML = alerts.map(log => {
        const ctrl = ccScannedBoards().find(c => c.serialNumber === log.serialNumber);
        let badgeLabel = 'SECURITY ALARM';
        let badgeStyle = '';
        if (log.unknownCard) {
            badgeLabel = log.granted ? 'UNKNOWN CARD (GRANTED)' : 'UNKNOWN CARD (DENIED)';
            badgeStyle = log.granted 
                ? 'background: rgba(245,158,11,0.2); color: #f59e0b; border: 1px solid rgba(245,158,11,0.4);' 
                : 'background: rgba(239,68,68,0.15); color: #ef4444; border: 1px solid rgba(239,68,68,0.4);';
        } else if (log.type === 'SWIPE_DENIED') {
            badgeLabel = 'SWIPE DENIED';
        }

        const badgeHtml = badgeStyle 
            ? `<span class="badge-status" style="${badgeStyle}"><i class="fa-solid fa-triangle-exclamation"></i> ${esc(badgeLabel)}</span>`
            : ccSystemBadge(badgeLabel, true);

        return `<tr class="monitor-row monitor-row-system">` +
            `<td class="sticky-col" style="font-family: var(--font-mono); font-size: 12px; font-weight: 600;">${esc(ccTimeStr(log.timestamp))}</td>` +
            `<td>${badgeHtml}</td>` +
            `<td>${esc(ctrl ? ctrl.name : (log.controllerName || (log.serialNumber ? 'SN:' + log.serialNumber : 'System')))}</td>` +
            `<td style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">${esc(log.message || log.detail || 'Security event')}</td></tr>`;
    }).join('');
}

/* ========================================================================= */
/* 10. QUICK REMOTE PULSE DROPDOWN POPULATOR                                 */
/* ========================================================================= */
function renderCcPulseBoards() {
    const sel = document.getElementById('cc-pulse-board');
    if (!sel) return;
    const prev = sel.value;
    const list = (typeof controllers !== 'undefined' && Array.isArray(controllers))
        ? controllers.filter(c => typeof isActiveController === 'function' ? isActiveController(c) : !ccIsBoardOffline(c))
        : [];
    if (list.length === 0) {
        sel.innerHTML = '<option value="">No online boards</option>';
        return;
    }
    sel.innerHTML = list.map(c => {
        const label = c.name ? `${c.name} (${c.serialNumber})` : `Controller ${c.serialNumber}`;
        return `<option value="${c.serialNumber}">${esc(label)}</option>`;
    }).join('');
    if (prev && Array.from(sel.options).some(o => o.value === prev)) sel.value = prev;
    try { renderCcPulseDoors(); } catch (e) { console.error('[CC renderPulseDoors]', e); }
}

function renderCcPulseDoors() {
    const bSel = document.getElementById('cc-pulse-board');
    const dSel = document.getElementById('cc-pulse-door');
    if (!dSel) return;
    const prevDoor = dSel.value;
    const serial = bSel ? Number(bSel.value) : NaN;
    const ctrl = (serial && typeof controllers !== 'undefined' && Array.isArray(controllers))
        ? controllers.find(c => Number(c.serialNumber) === serial)
        : null;
    const doors = (ctrl && Array.isArray(ctrl.doors) && ctrl.doors.length > 0)
        ? ctrl.doors
        : [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
    dSel.innerHTML = doors.map(d => {
        const id = Number(d.id) || 1;
        const nm = (d.name && String(d.name).trim()) ? String(d.name).trim() : `Door ${id}`;
        return `<option value="${id}">${esc(nm)} (Relay ${id})</option>`;
    }).join('');
    if (prevDoor && Array.from(dSel.options).some(o => o.value === prevDoor)) dSel.value = prevDoor;
}

function ccDoPulse() {
    if (!requireUiWrite()) return;
    const bSel = document.getElementById('cc-pulse-board');
    const dSel = document.getElementById('cc-pulse-door');
    const serial = bSel ? Number(bSel.value) : NaN;
    const door = dSel ? Number(dSel.value) : 1;
    if (!serial) {
        if (typeof showToast === 'function') showToast('Select an online board first.', 'warning');
        return;
    }
    if (typeof triggerRemoteOpen === 'function') triggerRemoteOpen(serial, door || 1);
}

/* ========================================================================= */
/* 11. CONTROLS INITIALIZATION & FILTER SYNC                                 */
/* ========================================================================= */
function initCcControls() {
    if (ccState.controlsInitialized) return;
    ccState.controlsInitialized = true;

    // Time range pills
    document.querySelectorAll('.cc-range-pill').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.cc-range-pill').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            ccState.timeRange = btn.dataset.range || 'all';
            ccState.hoverHour = null;
            renderCommandCenter();
        });
    });

    // Decision filter pills
    document.querySelectorAll('.cc-decision-pill').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.cc-decision-pill').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            ccState.decisionFilter = btn.dataset.decision || 'all';
            renderCommandCenter();
        });
    });

    const velDate = document.getElementById('cc-velocity-date');
    if (velDate) {
        try { velDate.max = ccGetLocalDateStr(); } catch (e) {}
        if (ccState.velocityDate) velDate.value = ccState.velocityDate;
        updateCcDateDisplay();
        velDate.addEventListener('change', () => {
            ccState.velocityDate = velDate.value || '';
            updateCcDateDisplay();
            renderCommandCenter();
        });
    }
    const velClear = document.getElementById('cc-velocity-clear');
    if (velClear) {
        velClear.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            ccState.velocityDate = '';
            const vd = document.getElementById('cc-velocity-date');
            if (vd) vd.value = '';
            updateCcDateDisplay();
            renderCommandCenter();
        });
    }

    const dateWrap = document.getElementById('cc-date-picker-wrap');
    if (dateWrap && velDate) {
        dateWrap.addEventListener('click', (e) => {
            if (e.target.closest('#cc-velocity-clear')) return;
            try {
                if (typeof velDate.showPicker === 'function') {
                    velDate.showPicker();
                }
            } catch (err) {}
        });
    }

    // Controller filter dropdown
    const ctrlSel = document.getElementById('cc-filter-controller');
    if (ctrlSel) {
        ctrlSel.addEventListener('change', () => {
            ccState.controllerFilter = ctrlSel.value;
            renderCommandCenter();
        });
    }

    // Refresh trigger
    const refBtn = document.getElementById('cc-btn-refresh');
    if (refBtn) {
        refBtn.addEventListener('click', () => {
            if (typeof loadHistory === 'function') loadHistory();
            if (typeof loadControllers === 'function') loadControllers();
            renderCommandCenter();
            if (typeof showToast === 'function') showToast('Analytics synchronized with gateway.', 'info');
        });
    }

    // Quick Remote Pulse: refresh door names when board changes
    const pulseBoard = document.getElementById('cc-pulse-board');
    if (pulseBoard) {
        pulseBoard.addEventListener('change', () => {
            try { renderCcPulseDoors(); } catch (e) { console.error('[CC pulseDoors change]', e); }
        });
    }

    // Responsive redraw for Access Traffic Velocity chart on container width resize
    if (!window._ccTimelineRoAttached && typeof ResizeObserver !== 'undefined') {
        window._ccTimelineRoAttached = true;
        let lastW = 0;
        let ccRoTimer = null;
        const ro = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const w = Math.round(entry.contentRect.width);
                if (lastW === 0) {
                    lastW = w;
                    return;
                }
                // Only trigger if WIDTH changes significantly (>= 8px) — NEVER trigger on height changes
                if (Math.abs(w - lastW) >= 8) {
                    lastW = w;
                    clearTimeout(ccRoTimer);
                    ccRoTimer = setTimeout(() => {
                        const timelineEl = document.getElementById('cc-chart-timeline');
                        if (timelineEl && timelineEl.isConnected) {
                            renderCcTimeline();
                        }
                    }, 100);
                }
            }
        });

        const wideCard = document.querySelector('.cc-chart-card.cc-chart-wide');
        if (wideCard) ro.observe(wideCard);
    }

    if (!window._ccWindowResizeAttached) {
        window._ccWindowResizeAttached = true;
        let ccResizeTimer = null;
        window.addEventListener('resize', () => {
            clearTimeout(ccResizeTimer);
            ccResizeTimer = setTimeout(() => {
                const timelineEl = document.getElementById('cc-chart-timeline');
                if (timelineEl && timelineEl.isConnected) {
                    renderCcTimeline();
                }
            }, 120);
        });
    }
}

function updateCcDateDisplay() {
    const velDate = document.getElementById('cc-velocity-date');
    const displayEl = document.getElementById('cc-date-display');
    const clearBtn = document.getElementById('cc-velocity-clear');
    if (!displayEl) return;

    const val = (velDate ? velDate.value : '') || ccState.velocityDate || '';
    const today = new Date();
    const todayOpts = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    const todayFormatted = today.toLocaleDateString('en-US', todayOpts);

    if (!val) {
        displayEl.textContent = `Today · ${todayFormatted}`;
        displayEl.title = `Viewing today (${todayFormatted}). Click to inspect another date.`;
        if (clearBtn) clearBtn.style.display = 'none';
        return;
    }

    const [y, m, d] = val.split('-').map(Number);
    if (!y || !m || !d) {
        displayEl.textContent = val;
        if (clearBtn) clearBtn.style.display = 'inline-flex';
        return;
    }

    const dateObj = new Date(y, m - 1, d);
    const isToday = today.getFullYear() === y && today.getMonth() === (m - 1) && today.getDate() === d;
    const formatted = dateObj.toLocaleDateString('en-US', todayOpts);

    if (isToday) {
        displayEl.textContent = `Today · ${formatted}`;
        displayEl.title = `Viewing today (${formatted}). Click to inspect another date.`;
        if (clearBtn) clearBtn.style.display = 'none';
    } else {
        displayEl.textContent = formatted;
        displayEl.title = `Inspecting historical date: ${dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}. Click '×' to reset to today.`;
        if (clearBtn) clearBtn.style.display = 'inline-flex';
    }
}

function updateCcControllerDropdown() {
    const sel = document.getElementById('cc-filter-controller');
    if (!sel) return;
    const prev = sel.value;
    const boards = ccScannedBoards();
    let opts = '<option value="all">All Controllers</option>';
    boards.forEach(b => {
        opts += `<option value="${b.serialNumber}">${esc(b.name || ('SN:' + b.serialNumber))}</option>`;
    });
    sel.innerHTML = opts;
    if (prev && Array.from(sel.options).some(o => o.value === prev)) {
        sel.value = prev;
    }
}

/* ========================================================================= */
/* 12. MASTER RENDER COMMAND CENTER                                          */
/* ========================================================================= */
function renderCommandCenter() {
    try { initCcControls(); } catch (e) { console.error('[CC initControls]', e); }
    try { updateCcControllerDropdown(); } catch (e) { console.error('[CC updateDropdown]', e); }
    try { updateCcDateDisplay(); } catch (e) { console.error('[CC updateDateDisplay]', e); }
    const activeDate = ccState.velocityDate || ccGetLocalDateStr();
    try { ccFetchHistoricalDayLogs(activeDate); } catch (e) { console.error('[CC fetchDayLogs]', e); }
    try { renderCcKpis(); } catch (e) { console.error('[CC renderKpis]', e); }
    try { renderCcTimeline(); } catch (e) { console.error('[CC renderTimeline]', e); }
    try { renderCcDonut(); } catch (e) { console.error('[CC renderDonut]', e); }
    try { renderCcDoorBars(); } catch (e) { console.error('[CC renderDoorBars]', e); }
    try { renderCcHeatmap(); } catch (e) { console.error('[CC renderHeatmap]', e); }
    try { renderCcSecurityMatrix(); } catch (e) { console.error('[CC renderSecurityMatrix]', e); }
    try { renderCcTopUsers(); } catch (e) { console.error('[CC renderTopUsers]', e); }
    try { renderCcFleet(); } catch (e) { console.error('[CC renderFleet]', e); }
    try { renderCcAlerts(); } catch (e) { console.error('[CC renderAlerts]', e); }
    try { renderCcPulseBoards(); } catch (e) { console.error('[CC renderPulseBoards]', e); }
}

// Global window bindings
window.renderCommandCenter = renderCommandCenter;
window.ccDoPulse = ccDoPulse;
window.ccState = ccState;
window.updateCcDateDisplay = updateCcDateDisplay;
