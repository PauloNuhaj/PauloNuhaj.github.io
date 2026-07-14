const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navBackdrop = document.getElementById('nav-backdrop');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const DARK_MODE_STORAGE_KEY = 'radioal_dark_mode';

function setMobileMenuOpen(isOpen) {
    if (!hamburger || !navMenu) return;
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    navMenu.classList.toggle('active', isOpen);
    navMenu.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    document.body.classList.toggle('menu-open', isOpen);
    if (navBackdrop) {
        navBackdrop.classList.toggle('active', isOpen);
        if (isOpen) {
            navBackdrop.hidden = false;
            navBackdrop.removeAttribute('hidden');
        } else {
            navBackdrop.classList.remove('active');
            navBackdrop.hidden = true;
            navBackdrop.setAttribute('hidden', '');
        }
    }
}

setMobileMenuOpen(false);

if (hamburger && navMenu) {
    hamburger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        setMobileMenuOpen(!navMenu.classList.contains('active'));
    });
}

if (navBackdrop) {
    navBackdrop.addEventListener('click', () => setMobileMenuOpen(false));
}

document.querySelectorAll('.nav-menu ul li a').forEach((link) => {
    link.addEventListener('click', () => setMobileMenuOpen(false));
});

function applyDarkMode(isDark) {
    document.body.classList.toggle('dark', isDark);
    if (!darkModeToggle) return;
    const icon = darkModeToggle.querySelector('i');
    if (icon) {
        icon.classList.toggle('fa-moon', !isDark);
        icon.classList.toggle('fa-sun', isDark);
    }
    darkModeToggle.setAttribute('aria-label', isDark ? 'Light Mode' : 'Dark Mode');
    darkModeToggle.setAttribute('title', isDark ? 'Light Mode' : 'Dark Mode');
}

try {
    const saved = localStorage.getItem(DARK_MODE_STORAGE_KEY);
    if (saved === null) {
        applyDarkMode(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    } else {
        applyDarkMode(saved === '1');
    }
} catch (e) {
    // ignore
}

if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
        const isDark = !document.body.classList.contains('dark');
        applyDarkMode(isDark);
        try {
            localStorage.setItem(DARK_MODE_STORAGE_KEY, isDark ? '1' : '0');
        } catch (e) {
            // ignore
        }
    });
}

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu && navMenu.classList.contains('active')) {
        setMobileMenuOpen(false);
    }
});

/* ================= Easter egg: interactive vintage dial ================= */
(function initVintageDialEasterEgg() {
    const radio = document.getElementById('vintage-radio');
    const tuneKnob = document.getElementById('vr-knob-tune');
    const fxKnob = document.getElementById('vr-knob-fx');
    const freqValue = document.getElementById('vr-freq-value');
    const needle = document.getElementById('vr-needle');
    const badge = document.getElementById('vr-badge');
    const stationHint = document.getElementById('vr-station-hint');
    const meters = radio ? radio.querySelectorAll('.vr-meter i') : [];

    if (!radio || !tuneKnob || !fxKnob) return;

    const STATIONS = [
        { mhz: 88.5, name: 'Soft Morning Drift' },
        { mhz: 91.1, name: 'Tirana Night Signal' },
        { mhz: 94.0, name: 'Radio One Echo' },
        { mhz: 96.3, name: 'Adriatic Wave' },
        { mhz: 99.7, name: 'Coastal Chrome FM' },
        { mhz: 103.2, name: 'Gold Frequency' },
        { mhz: 106.8, name: 'Skyline Static' }
    ];

    let tuneAngle = 40;
    let fxAngle = -20;

    function clamp(n, min, max) {
        return Math.min(max, Math.max(min, n));
    }

    function angleFromEvent(el, clientX, clientY) {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        return Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI);
    }

    function mhzFromTune(angle) {
        const t = ((angle % 360) + 360) % 360 / 360;
        return 88 + t * 20; // 88 → 108
    }

    function nearestStation(mhz) {
        let best = STATIONS[0];
        let bestDiff = Infinity;
        STATIONS.forEach((s) => {
            const d = Math.abs(s.mhz - mhz);
            if (d < bestDiff) {
                best = s;
                bestDiff = d;
            }
        });
        return { station: best, locked: bestDiff < 0.35 };
    }

    function applyDialState() {
        const mhz = mhzFromTune(tuneAngle);
        const { station, locked } = nearestStation(mhz);
        const fx = ((fxAngle % 360) + 360) % 360;

        tuneKnob.style.setProperty('--rot', `${tuneAngle}deg`);
        fxKnob.style.setProperty('--rot', `${fxAngle}deg`);

        if (freqValue) freqValue.textContent = mhz.toFixed(1);

        if (needle) {
            const pct = ((mhz - 88) / 20) * 78 + 8;
            needle.style.setProperty('--needle', `${clamp(pct, 8, 90)}%`);
        }

        // Effect zones by gold knob
        radio.classList.toggle('is-hot', fx > 40 && fx < 160);
        radio.classList.toggle('is-night', fx >= 160 && fx < 280);

        const energy = 0.35 + (fx / 360) * 0.65;
        meters.forEach((m, i) => {
            const h = 30 + Math.sin((mhz + fx) * 0.2 + i) * 20 * energy + Math.random() * 18 * energy;
            m.style.height = `${clamp(h, 18, 100)}%`;
            m.style.animation = 'none';
        });

        if (badge) {
            badge.textContent = locked ? `LOCKED · ${station.mhz.toFixed(1)}` : 'TUNING…';
        }
        if (stationHint) {
            stationHint.textContent = locked
                ? `✦ ${station.name}`
                : 'Between stations — keep turning…';
            stationHint.style.opacity = locked ? '1' : '0.7';
        }

        // Subtle page ambient hue shift
        document.body.style.setProperty(
            '--dial-glow',
            radio.classList.contains('is-night')
                ? 'rgba(120, 160, 255, 0.16)'
                : radio.classList.contains('is-hot')
                    ? 'rgba(255, 176, 32, 0.18)'
                    : 'rgba(41, 229, 198, 0.12)'
        );
    }

    function bindKnob(el, getAngle, setAngle) {
        let dragging = false;
        let lastPointerAngle = 0;

        const onPointerDown = (e) => {
            dragging = true;
            el.classList.add('is-dragging');
            el.setPointerCapture?.(e.pointerId);
            lastPointerAngle = angleFromEvent(el, e.clientX, e.clientY);
            e.preventDefault();
        };

        const onPointerMove = (e) => {
            if (!dragging) return;
            const a = angleFromEvent(el, e.clientX, e.clientY);
            let delta = a - lastPointerAngle;
            if (delta > 180) delta -= 360;
            if (delta < -180) delta += 360;
            setAngle(getAngle() + delta);
            lastPointerAngle = a;
            applyDialState();
        };

        const onPointerUp = (e) => {
            dragging = false;
            el.classList.remove('is-dragging');
            try {
                el.releasePointerCapture?.(e.pointerId);
            } catch (_) {
                // ignore
            }
        };

        el.addEventListener('pointerdown', onPointerDown);
        el.addEventListener('pointermove', onPointerMove);
        el.addEventListener('pointerup', onPointerUp);
        el.addEventListener('pointercancel', onPointerUp);
    }

    bindKnob(tuneKnob, () => tuneAngle, (v) => { tuneAngle = v; });
    bindKnob(fxKnob, () => fxAngle, (v) => { fxAngle = v; });
    applyDialState();
})();
