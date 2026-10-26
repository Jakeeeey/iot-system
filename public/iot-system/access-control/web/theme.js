/**
 * ACCESS Professional Door Control Management - Theme Controller
 * Manages Light/Dark mode toggling, browser preference defaults, and persistence.
 */

(function() {
    'use strict';

    const STORAGE_KEY = 'theme';

    /**
     * Determine system theme preference from media query
     * @returns {'light' | 'dark'}
     */
    function getSystemPreference() {
        if (typeof window !== 'undefined' && window.matchMedia) {
            return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
        }
        return 'dark';
    }

    /**
     * Get active theme: manual stored preference takes precedence, otherwise system default
     * @returns {'light' | 'dark'}
     */
    function getCurrentTheme() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored === 'light' || stored === 'dark') {
                return stored;
            }
        } catch (e) {
            console.warn('[Theme] Unable to read localStorage:', e);
        }
        return getSystemPreference();
    }

    /**
     * Apply theme to DOM and update all UI toggle buttons
     * @param {'light' | 'dark'} theme
     * @param {boolean} persist
     */
    function applyTheme(theme, persist) {
        const targetTheme = (theme === 'light') ? 'light' : 'dark';
        const docEl = document.documentElement;
        const bodyEl = document.body;

        docEl.setAttribute('data-theme', targetTheme);
        docEl.classList.toggle('light-theme', targetTheme === 'light');
        docEl.classList.toggle('dark-theme', targetTheme === 'dark');
        if (bodyEl) {
            bodyEl.setAttribute('data-theme', targetTheme);
            bodyEl.classList.toggle('light-theme', targetTheme === 'light');
            bodyEl.classList.toggle('dark-theme', targetTheme === 'dark');
        }

        if (persist) {
            try {
                localStorage.setItem(STORAGE_KEY, targetTheme);
            } catch (e) {
                console.warn('[Theme] Unable to write localStorage:', e);
            }
        }

        updateToggleButtons(targetTheme);

        // Notify charts and views if loaded
        try {
            if (typeof window.renderCommandCenter === 'function') {
                const timelineEl = document.getElementById('cc-chart-timeline');
                if (timelineEl && timelineEl.isConnected) {
                    window.renderCommandCenter();
                }
            }
        } catch (err) {}
    }

    /**
     * Update state and icons of all theme toggle buttons on the page
     * @param {'light' | 'dark'} activeTheme
     */
    function updateToggleButtons(activeTheme) {
        const isLight = activeTheme === 'light';

        // Desktop top-bar toggle pill
        const btn = document.getElementById('theme-toggle-btn');
        if (btn) {
            const icon = document.getElementById('theme-toggle-icon');
            const text = document.getElementById('theme-toggle-text');
            if (icon) {
                icon.className = isLight ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
                icon.style.color = isLight ? '#f59e0b' : '#38bdf8';
            }
            if (text) {
                text.textContent = isLight ? 'Light' : 'Dark';
            }
            btn.title = isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode';
            btn.setAttribute('aria-label', isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode');
        }

        // Mobile top-bar toggle button
        const mobileBtn = document.getElementById('mobile-theme-toggle-btn');
        if (mobileBtn) {
            const mobileIcon = document.getElementById('mobile-theme-toggle-icon');
            if (mobileIcon) {
                mobileIcon.className = isLight ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
                mobileIcon.style.color = isLight ? '#f59e0b' : '#38bdf8';
            }
            mobileBtn.title = isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode';
        }
    }

    /**
     * Toggle between Light and Dark mode (persisting user choice)
     */
    function toggleTheme() {
        const currentAttr = document.documentElement.getAttribute('data-theme') || (document.documentElement.classList.contains('light-theme') ? 'light' : 'dark');
        const next = (currentAttr === 'light') ? 'dark' : 'light';
        applyTheme(next, true);
    }

    /**
     * Initialize theme listeners and apply initial state
     */
    function initTheme() {
        const initialTheme = getCurrentTheme();
        applyTheme(initialTheme, false);

        // Bind desktop button
        const btn = document.getElementById('theme-toggle-btn');
        if (btn && !btn._themeBound) {
            btn._themeBound = true;
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                toggleTheme();
            });
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleTheme();
                }
            });
        }

        // Bind mobile button
        const mobileBtn = document.getElementById('mobile-theme-toggle-btn');
        if (mobileBtn && !mobileBtn._themeBound) {
            mobileBtn._themeBound = true;
            mobileBtn.addEventListener('click', (e) => {
                e.preventDefault();
                toggleTheme();
            });
        }

        // Listen for OS system preference changes (only active when no manual localStorage override is stored)
        if (window.matchMedia && !window._themeMediaListenerBound) {
            window._themeMediaListenerBound = true;
            try {
                const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
                const handleSchemeChange = (e) => {
                    let hasManual = false;
                    try {
                        hasManual = !!localStorage.getItem(STORAGE_KEY);
                    } catch (err) {}
                    if (!hasManual) {
                        applyTheme(e.matches ? 'light' : 'dark', false);
                    }
                };
                if (typeof mediaQuery.addEventListener === 'function') {
                    mediaQuery.addEventListener('change', handleSchemeChange);
                } else if (typeof mediaQuery.addListener === 'function') {
                    mediaQuery.addListener(handleSchemeChange);
                }
            } catch (err) {
                console.warn('[Theme] Could not attach mediaQuery listener:', err);
            }
        }
    }

    // Immediate self-execution to prevent flash before paint
    try {
        const early = getCurrentTheme();
        document.documentElement.setAttribute('data-theme', early);
        document.documentElement.classList.toggle('light-theme', early === 'light');
        document.documentElement.classList.toggle('dark-theme', early === 'dark');
    } catch (e) {}

    // Expose globals for application access
    window.initTheme = initTheme;
    window.toggleTheme = toggleTheme;
    window.getCurrentTheme = getCurrentTheme;
    window.applyTheme = applyTheme;
})();
