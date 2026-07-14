// Funksioni për hamburger menu
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navBackdrop = document.getElementById('nav-backdrop');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const headerLogo = document.querySelector('header .logo');

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

// Always start closed (prevents stuck blur overlay)
setMobileMenuOpen(false);

if (hamburger) {
    hamburger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const willOpen = !navMenu.classList.contains('active');
        setMobileMenuOpen(willOpen);
    });
}

if (navBackdrop) {
    navBackdrop.addEventListener('click', () => setMobileMenuOpen(false));
}

// Dark mode toggle (persisted)
const DARK_MODE_STORAGE_KEY = 'radioal_dark_mode';

function applyDarkMode(isDark) {
    document.body.classList.toggle('dark', isDark);
    if (darkModeToggle) {
        const icon = darkModeToggle.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-moon', !isDark);
            icon.classList.toggle('fa-sun', isDark);
        }
        darkModeToggle.setAttribute('aria-label', isDark ? 'Light Mode' : 'Dark Mode');
        darkModeToggle.setAttribute('title', isDark ? 'Light Mode' : 'Dark Mode');
    }
}

try {
    const saved = localStorage.getItem(DARK_MODE_STORAGE_KEY);
    if (saved === null) {
        applyDarkMode(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    } else {
        applyDarkMode(saved === '1');
    }
} catch (e) {
    // ignore storage errors
}

if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
        const isDark = !document.body.classList.contains('dark');
        applyDarkMode(isDark);
        try {
            localStorage.setItem(DARK_MODE_STORAGE_KEY, isDark ? '1' : '0');
        } catch (e) {
            // ignore storage errors
        }
    });
}

// Mbyll menunë kur klikohet një lidhje
document.querySelectorAll('.nav-menu ul li a').forEach(link => {
    link.addEventListener('click', () => setMobileMenuOpen(false));
});

// Funksioni për player-at audio
const sounds = [
    new Howl({ src: ['https://cp1.sednastream.com/proxy/radioone94?mp=/stream'], html5: true }),
    new Howl({ src: ['https://s4.radio.co/sd1d1904dc/listen'], html5: true }),
    new Howl({ src: ['https://cp1.sednastream.com/proxy/clubfm?mp=/stream'], html5: true }),
    new Howl({ src: ['https://live.topgold.al/tar'], html5: true }),
    new Howl({ src: ['https://live.topgold.al/topgold'], html5: true }),

    new Howl({ src: ['https://live.top-media.al/mmr'], html5: true }),
    new Howl({ src: ['https://cp1.sednastream.com/proxy/radiotravel?mp=/stream'], html5: true }),
    new Howl({ src: ['https://eu8.fastcast4u.com/proxy/chillradio?mp=/1'], html5: true }),
    new Howl({ src: ['https://antena.albaniadigitalradio.al/loveradio'], html5: true })
];

let currentSoundIndex = -1;
let lastKnownPlaying = false;
let playbackGeneration = 0;
let isSwitchingChannel = false;

function stopAllSounds(exceptIndex = -1) {
    sounds.forEach((sound, index) => {
        if (index === exceptIndex) return;
        try {
            // stop() even if not yet "playing" — kritike kur next klikohet shpejt
            sound.stop();
        } catch (e) {
            // ignore
        }
    });
}

const globalPlayPauseButton = document.getElementById('play-pause');
const prevButton = document.getElementById('prev');
const nextButton = document.getElementById('next');
const globalIcon = globalPlayPauseButton.querySelector('i');
const globalArtwork = document.getElementById('current-channel-artwork');
const audioPlayerBar = document.getElementById('audio-player');

const channelButtons = document.querySelectorAll('.play-pause');
const nowPlayingLabel = document.getElementById('current-channel');
const nowPlayingSub = document.getElementById('current-channel-sub');

// Spotify expanded Now Playing
const spotifyNow = document.getElementById('spotify-now');
const spotifyBarExpand = document.getElementById('spotify-bar-expand');
const spotifyNowClose = document.getElementById('spotify-now-close');
const spotifyNowCar = document.getElementById('spotify-now-car');
const spotifyNowBg = document.getElementById('spotify-now-bg');
const spotifyNowArt = document.getElementById('spotify-now-art');
const spotifyNowTitle = document.getElementById('spotify-now-title');
const spotifyNowSub = document.getElementById('spotify-now-sub');
const spotifyNowStation = document.getElementById('spotify-now-station');
const spotifyNowPrev = document.getElementById('spotify-now-prev');
const spotifyNowPlay = document.getElementById('spotify-now-play');
const spotifyNowNext = document.getElementById('spotify-now-next');

// Car Mode elements
const carModeToggle = document.getElementById('car-mode-toggle');
const carMode = document.getElementById('car-mode');
const carModeBack = document.getElementById('car-mode-back');
const carModePrev = document.getElementById('car-mode-prev');
const carModePlay = document.getElementById('car-mode-play');
const carModeNext = document.getElementById('car-mode-next');
const carModeTitle = document.getElementById('car-mode-title');
const carModeSubtitle = document.getElementById('car-mode-subtitle');
const carModeLogo = document.getElementById('car-mode-logo');
const carModeBg = document.getElementById('car-mode-bg');
const twitchLive = document.getElementById('twitch-live');
const twitchEmbed = document.getElementById('twitch-embed');
const twitchCar = document.getElementById('twitch-car');
const twitchEmbedCar = document.getElementById('twitch-embed-car');
const adminLiveToggle = document.getElementById('admin-live-toggle');

const channelCards = Array.from(document.querySelectorAll('.channel'));

// Twitch Live Mode (no database)
const TWITCH_CHANNEL = 'theulfpra';
const TWITCH_LIVE_STORAGE_KEY = 'radioal_twitch_live';
let twitchIframeNormal = null;
let twitchIframeCar = null;

function buildTwitchIframe() {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('allow', 'autoplay; fullscreen');
    iframe.style.width = '100%';
    iframe.style.height = '100%';

    const parent = encodeURIComponent(window.location.hostname || 'localhost');
    iframe.src = `https://player.twitch.tv/?channel=${encodeURIComponent(TWITCH_CHANNEL)}&parent=${parent}&muted=true`;
    return iframe;
}

function ensureTwitchEmbeds() {
    if (twitchEmbed && !twitchIframeNormal) {
        twitchIframeNormal = buildTwitchIframe();
        twitchEmbed.appendChild(twitchIframeNormal);
    }
    if (twitchEmbedCar && !twitchIframeCar) {
        twitchIframeCar = buildTwitchIframe();
        twitchEmbedCar.appendChild(twitchIframeCar);
    }
}

function setLiveMode(isEnabled) {
    document.body.classList.toggle('live-mode', isEnabled);

    if (twitchLive) {
        twitchLive.classList.toggle('active', isEnabled);
        twitchLive.setAttribute('aria-hidden', isEnabled ? 'false' : 'true');
    }

    if (carModeLogo) {
        carModeLogo.style.display = isEnabled ? 'none' : '';
    }
    if (twitchCar) {
        twitchCar.classList.toggle('active', isEnabled && carMode && carMode.classList.contains('active'));
        twitchCar.setAttribute('aria-hidden', (isEnabled && carMode && carMode.classList.contains('active')) ? 'false' : 'true');
    }

    if (isEnabled) ensureTwitchEmbeds();

    try {
        localStorage.setItem(TWITCH_LIVE_STORAGE_KEY, isEnabled ? '1' : '0');
    } catch (e) {
        // ignore storage errors
    }
}

function getSavedLiveMode() {
    try {
        return localStorage.getItem(TWITCH_LIVE_STORAGE_KEY) === '1';
    } catch (e) {
        return false;
    }
}

function toggleLiveMode() {
    setLiveMode(!document.body.classList.contains('live-mode'));
}

// Secret triggers:
// - Invisible button bottom-right
// - Multi-click on header logo
if (adminLiveToggle) adminLiveToggle.addEventListener('click', toggleLiveMode);

let logoTapCount = 0;
let logoTapTimer = null;
if (headerLogo) {
    headerLogo.addEventListener('click', () => {
        logoTapCount += 1;
        if (logoTapTimer) window.clearTimeout(logoTapTimer);
        logoTapTimer = window.setTimeout(() => {
            logoTapCount = 0;
        }, 1200);
        if (logoTapCount >= 7) {
            logoTapCount = 0;
            toggleLiveMode();
        }
    });
}

function getChannelMeta(index) {
    const card = channelCards[index];
    const title = card ? (card.querySelector('h3')?.textContent || 'RADIOAL') : 'RADIOAL';
    const imgSrc = card ? (card.querySelector('img')?.getAttribute('src') || '') : '';
    const frequency = card ? (card.getAttribute('data-frequency') || '') : '';
    return {
        title,
        imgSrc,
        frequency: frequency || 'Live Radio'
    };
}

function updateGlobalArtworkAndMediaSession() {
    const meta = currentSoundIndex === -1 ? { title: 'RADIO AL', frequency: 'Live Radio', imgSrc: 'Radio.png' } : getChannelMeta(currentSoundIndex);

    if (globalArtwork && meta.imgSrc) {
        globalArtwork.setAttribute('src', meta.imgSrc);
        globalArtwork.setAttribute('alt', meta.title);
    }

    if (carMode && carModeLogo && carModeBg) {
        if (currentSoundIndex === -1) {
            carModeLogo.setAttribute('src', 'Radio.png');
            carModeBg.style.backgroundImage = 'url("Radio.png")';
        }
    }

    if (!('mediaSession' in navigator)) return;
    try {
        const absoluteArtwork = meta.imgSrc ? new URL(meta.imgSrc, window.location.href).href : '';
        const ext = absoluteArtwork.split('?')[0].split('#')[0].split('.').pop()?.toLowerCase();
        const mime =
            ext === 'png' ? 'image/png' :
            ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' :
            ext === 'webp' ? 'image/webp' :
            '';

        navigator.mediaSession.metadata = new MediaMetadata({
            title: meta.title,
            artist: meta.frequency,
            album: 'Radio AL',
            artwork: absoluteArtwork
                ? [
                    { src: absoluteArtwork, sizes: '96x96', type: mime },
                    { src: absoluteArtwork, sizes: '192x192', type: mime },
                    { src: absoluteArtwork, sizes: '512x512', type: mime }
                ]
                : []
        });
    } catch (e) {
        // ignore metadata errors
    }
}

function setPlaybackStateForMediaSession() {
    if (!('mediaSession' in navigator)) return;
    try {
        const playing = currentSoundIndex !== -1 && lastKnownPlaying;
        navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
    } catch (e) {
        // ignore
    }
}

function registerMediaSessionHandlers() {
    if (!('mediaSession' in navigator)) return;
    try {
        navigator.mediaSession.setActionHandler('previoustrack', () => prevChannel());
        navigator.mediaSession.setActionHandler('nexttrack', () => nextChannel());
        navigator.mediaSession.setActionHandler('play', () => {
            if (currentSoundIndex === -1) {
                playChannel(0);
            } else if (!sounds[currentSoundIndex].playing()) {
                sounds[currentSoundIndex].play();
                syncUIAfterPlaybackChange();
            }
        });
        navigator.mediaSession.setActionHandler('pause', () => {
            if (currentSoundIndex !== -1 && sounds[currentSoundIndex].playing()) {
                sounds[currentSoundIndex].pause();
                syncUIAfterPlaybackChange();
            }
        });
    } catch (e) {
        // ignore
    }
}

function updateSpotifyNowUI() {
    const meta = currentSoundIndex === -1
        ? { title: 'RADIO AL', frequency: 'Live Radio', imgSrc: 'Radio.png' }
        : getChannelMeta(currentSoundIndex);

    if (nowPlayingLabel) nowPlayingLabel.textContent = currentSoundIndex === -1 ? 'Zgjidhni një kanal' : meta.title;
    if (nowPlayingSub) nowPlayingSub.textContent = meta.frequency;

    if (spotifyNowTitle) spotifyNowTitle.textContent = meta.title;
    if (spotifyNowSub) spotifyNowSub.textContent = meta.frequency;
    if (spotifyNowStation) spotifyNowStation.textContent = meta.title.toUpperCase();

    if (spotifyNowArt && meta.imgSrc) spotifyNowArt.setAttribute('src', meta.imgSrc);
    if (spotifyNowBg && meta.imgSrc) spotifyNowBg.style.backgroundImage = `url("${meta.imgSrc}")`;

    setPlayIconFor(spotifyNowPlay, lastKnownPlaying);

    if (audioPlayerBar) {
        audioPlayerBar.classList.toggle('is-playing', currentSoundIndex !== -1 && lastKnownPlaying);
    }
}

function openSpotifyNow() {
    if (!spotifyNow) return;
    updateSpotifyNowUI();
    spotifyNow.classList.add('active');
    spotifyNow.setAttribute('aria-hidden', 'false');
    document.body.classList.add('spotify-expanded');
    document.body.style.overflow = 'hidden';
}

function closeSpotifyNow() {
    if (!spotifyNow) return;
    spotifyNow.classList.remove('active');
    spotifyNow.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('spotify-expanded');
    if (!(carMode && carMode.classList.contains('active'))) {
        document.body.style.overflow = '';
    }
}

function syncUIAfterPlaybackChange() {
    // global icon
    const playing = currentSoundIndex !== -1 && lastKnownPlaying;
    globalIcon.classList.toggle('fa-play', !playing);
    globalIcon.classList.toggle('fa-pause', playing);

    // per-channel buttons text
    channelButtons.forEach((btn, idx) => {
        btn.textContent = (idx === currentSoundIndex && playing) ? 'Pause' : 'Play';
    });

    updateSpotifyNowUI();
    updateCarModeUI();
    updateGlobalArtworkAndMediaSession();
    setPlaybackStateForMediaSession();
    syncListeningClock(playing);
}

/* ================= Personal greeting + listen stats ================= */
const NICKNAME_KEY = 'radioal_nickname';
const NICKNAME_SKIP_KEY = 'radioal_nickname_skip';
const LISTEN_KEY = 'radioal_listen_today';

const heroGreeting = document.getElementById('hero-greeting');
const heroSub = document.getElementById('hero-sub');
const heroListenText = document.getElementById('hero-listen-text');
const heroSuggestBtn = document.getElementById('hero-suggest');
const heroSuggestKicker = document.getElementById('hero-suggest-kicker');
const heroSuggestName = document.getElementById('hero-suggest-name');
const heroSuggestArt = document.getElementById('hero-suggest-art');
const heroNameEdit = document.getElementById('hero-name-edit');
const nicknameModal = document.getElementById('nickname-modal');
const nicknameInput = document.getElementById('nickname-input');
const nicknameSave = document.getElementById('nickname-save');
const nicknameSkip = document.getElementById('nickname-skip');

let suggestedChannelIndex = 7;
let listenStartedAt = null;
let listenFlushTimer = null;

function pad2(n) {
    return String(n).padStart(2, '0');
}

function todayDateKey() {
    const d = new Date();
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function loadNickname() {
    try {
        return (localStorage.getItem(NICKNAME_KEY) || '').trim();
    } catch (e) {
        return '';
    }
}

function saveNickname(name) {
    try {
        const clean = String(name || '').trim().replace(/\s+/g, ' ').slice(0, 20);
        if (clean) localStorage.setItem(NICKNAME_KEY, clean);
        else localStorage.removeItem(NICKNAME_KEY);
        return clean;
    } catch (e) {
        return String(name || '').trim().slice(0, 20);
    }
}

function wasNicknameSkipped() {
    try {
        return localStorage.getItem(NICKNAME_SKIP_KEY) === '1';
    } catch (e) {
        return false;
    }
}

function setNicknameSkipped() {
    try {
        localStorage.setItem(NICKNAME_SKIP_KEY, '1');
    } catch (e) {
        // ignore
    }
}

function loadListenStats() {
    const today = todayDateKey();
    try {
        const raw = JSON.parse(localStorage.getItem(LISTEN_KEY) || 'null');
        if (!raw || raw.date !== today) return { date: today, ms: 0 };
        return { date: today, ms: Math.max(0, Number(raw.ms) || 0) };
    } catch (e) {
        return { date: today, ms: 0 };
    }
}

function saveListenStats(stats) {
    try {
        localStorage.setItem(LISTEN_KEY, JSON.stringify(stats));
    } catch (e) {
        // ignore
    }
}

function flushListeningTime() {
    if (listenStartedAt == null) return;
    const delta = Date.now() - listenStartedAt;
    listenStartedAt = Date.now();
    if (delta <= 0) return;
    const stats = loadListenStats();
    stats.ms += delta;
    saveListenStats(stats);
    updateListenUi(stats);
}

function syncListeningClock(playing) {
    if (playing) {
        if (listenStartedAt == null) listenStartedAt = Date.now();
        if (!listenFlushTimer) {
            listenFlushTimer = setInterval(() => {
                flushListeningTime();
            }, 15000);
        }
    } else {
        flushListeningTime();
        listenStartedAt = null;
        if (listenFlushTimer) {
            clearInterval(listenFlushTimer);
            listenFlushTimer = null;
        }
    }
}

function formatListenMinutes(ms) {
    const mins = Math.floor(ms / 60000);
    if (mins < 1) return 'Sot ke dëgjuar pak sekonda';
    if (mins === 1) return 'Sot ke dëgjuar 1 min';
    return `Sot ke dëgjuar ${mins} min`;
}

function updateListenUi(stats) {
    if (!heroListenText) return;
    const s = stats || loadListenStats();
    heroListenText.textContent = formatListenMinutes(s.ms);
}

function getDaypart() {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) {
        return {
            hello: 'Mirëmëngjes',
            kicker: 'Për mëngjesin',
            blurb: 'Fillim i butë — lajme & muzikë',
            index: 1 // Klan Kosova
        };
    }
    if (h >= 12 && h < 17) {
        return {
            hello: 'Mirëdita',
            kicker: 'Për pasditen',
            blurb: 'Energji për orët e ditës',
            index: 2 // Club FM
        };
    }
    if (h >= 17 && h < 21) {
        return {
            hello: 'Mirëmbrëma',
            kicker: 'Për mbrëmjen',
            blurb: 'Udhëtim & ritëm i qetë',
            index: 6 // Radio Travel
        };
    }
    // Pas 21:00 — ende “Mirëmbrëma” (jo “Natën e mirë”, që tingëllon si lamtumirë)
    return {
        hello: 'Mirëmbrëma',
        kicker: 'Për natën',
        blurb: 'Chill deri vonë',
        index: 7 // Chill Radio
    };
}

function refreshPersonalGreeting() {
    const name = loadNickname();
    const part = getDaypart();
    suggestedChannelIndex = ((part.index % sounds.length) + sounds.length) % sounds.length;
    const meta = getChannelMeta(suggestedChannelIndex);

    if (heroGreeting) {
        heroGreeting.textContent = name ? `${part.hello}, ${name}` : `${part.hello} — Radio AL`;
    }
    if (heroSub) {
        heroSub.textContent = name
            ? `Mirë se erdhe. ${part.blurb}.`
            : `${part.blurb} · radioja jote lokale.`;
    }
    if (heroSuggestKicker) heroSuggestKicker.textContent = part.kicker;
    if (heroSuggestName) heroSuggestName.textContent = meta.title;
    if (heroSuggestArt && meta.imgSrc) {
        heroSuggestArt.src = meta.imgSrc;
        heroSuggestArt.alt = meta.title;
    }
    if (heroSuggestBtn) {
        heroSuggestBtn.setAttribute(
            'aria-label',
            `Luaj sugjerimin: ${meta.title}`
        );
    }
    updateListenUi();
}

function openNicknameModal(prefill) {
    if (!nicknameModal) return;
    if (nicknameInput) nicknameInput.value = prefill != null ? prefill : loadNickname();
    nicknameModal.classList.add('active');
    nicknameModal.setAttribute('aria-hidden', 'false');
    setTimeout(() => nicknameInput?.focus(), 40);
}

function closeNicknameModal() {
    if (!nicknameModal) return;
    nicknameModal.classList.remove('active');
    nicknameModal.setAttribute('aria-hidden', 'true');
}

function commitNicknameFromForm() {
    const name = saveNickname(nicknameInput ? nicknameInput.value : '');
    if (name) {
        try { localStorage.removeItem(NICKNAME_SKIP_KEY); } catch (e) { /* ignore */ }
    }
    closeNicknameModal();
    refreshPersonalGreeting();
}

if (heroSuggestBtn) {
    heroSuggestBtn.addEventListener('click', () => {
        playChannel(suggestedChannelIndex);
    });
}

if (heroNameEdit) {
    heroNameEdit.addEventListener('click', () => openNicknameModal());
}

if (nicknameSave) {
    nicknameSave.addEventListener('click', commitNicknameFromForm);
}

if (nicknameSkip) {
    nicknameSkip.addEventListener('click', () => {
        setNicknameSkipped();
        closeNicknameModal();
        refreshPersonalGreeting();
    });
}

if (nicknameInput) {
    nicknameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            commitNicknameFromForm();
        }
    });
}

if (nicknameModal) {
    nicknameModal.addEventListener('click', (e) => {
        if (e.target === nicknameModal) {
            setNicknameSkipped();
            closeNicknameModal();
        }
    });
}

document.addEventListener('visibilitychange', () => {
    flushListeningTime();
    if (document.visibilityState === 'visible') {
        if (lastKnownPlaying && listenStartedAt == null) listenStartedAt = Date.now();
        updateListenUi();
    }
});

window.addEventListener('pagehide', flushListeningTime);

refreshPersonalGreeting();
if (!loadNickname() && !wasNicknameSkipped()) {
    setTimeout(() => openNicknameModal(''), 700);
}
setInterval(refreshPersonalGreeting, 60 * 1000);

/* ================= Station intros ================= */
const stationIntro = document.getElementById('station-intro');
const stationIntroArt = document.getElementById('station-intro-art');
const stationIntroTitle = document.getElementById('station-intro-title');
const stationIntroFreq = document.getElementById('station-intro-freq');
let stationIntroTimer = null;
let introAudioCtx = null;

function playIntroJingle() {
    try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        if (!introAudioCtx) introAudioCtx = new AC();
        if (introAudioCtx.state === 'suspended') introAudioCtx.resume();

        const now = introAudioCtx.currentTime;
        const master = introAudioCtx.createGain();
        master.gain.setValueAtTime(0.0001, now);
        master.gain.exponentialRampToValueAtTime(0.12, now + 0.04);
        master.gain.exponentialRampToValueAtTime(0.0001, now + 1.15);
        master.connect(introAudioCtx.destination);

        [523.25, 659.25, 783.99].forEach((freq, i) => {
            const osc = introAudioCtx.createOscillator();
            const g = introAudioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);
            g.gain.setValueAtTime(0.0001, now);
            g.gain.exponentialRampToValueAtTime(0.25, now + 0.03 + i * 0.08);
            g.gain.exponentialRampToValueAtTime(0.0001, now + 0.45 + i * 0.12);
            osc.connect(g);
            g.connect(master);
            osc.start(now + i * 0.1);
            osc.stop(now + 1.2);
        });
    } catch (e) {
        // ignore — visual intro still works
    }
}

function showStationIntro(index) {
    if (!stationIntro) return;
    const meta = getChannelMeta(index);
    if (stationIntroArt && meta.imgSrc) stationIntroArt.src = meta.imgSrc;
    if (stationIntroTitle) stationIntroTitle.textContent = meta.title;
    if (stationIntroFreq) stationIntroFreq.textContent = meta.frequency;

    stationIntro.classList.remove('active');
    // restart CSS animations
    void stationIntro.offsetWidth;
    stationIntro.classList.add('active');
    stationIntro.setAttribute('aria-hidden', 'false');
    playIntroJingle();

    if (stationIntroTimer) clearTimeout(stationIntroTimer);
    stationIntroTimer = setTimeout(() => {
        stationIntro.classList.remove('active');
        stationIntro.setAttribute('aria-hidden', 'true');
        stationIntroTimer = null;
    }, 1600);
}

function playChannel(index) {
    const clamped = ((index % sounds.length) + sounds.length) % sounds.length;
    const changed = currentSoundIndex !== clamped;
    const generation = ++playbackGeneration;

    isSwitchingChannel = true;

    // Ndalo të gjitha stream-et (jo vetëm atë aktual) që të mos luajnë 2 njëherësh
    stopAllSounds();

    currentSoundIndex = clamped;
    lastKnownPlaying = true;

    if (changed) {
        showStationIntro(clamped);
    }

    // Nëse next u shtyp përsëri para se të nisë ky, mos e vazhdo
    if (generation !== playbackGeneration) {
        isSwitchingChannel = false;
        return;
    }

    sounds[currentSoundIndex].play();
    isSwitchingChannel = false;

    // iOS tends to require handlers set after playback begins
    registerMediaSessionHandlers();
    syncUIAfterPlaybackChange();
}

function toggleCurrent() {
    if (currentSoundIndex === -1) {
        playChannel(0);
        return;
    }
    if (lastKnownPlaying) {
        lastKnownPlaying = false;
        try {
            sounds[currentSoundIndex].pause();
        } catch (e) {
            // ignore
        }
    } else {
        const generation = ++playbackGeneration;
        stopAllSounds(currentSoundIndex);
        lastKnownPlaying = true;
        if (generation !== playbackGeneration) return;
        sounds[currentSoundIndex].play();
    }
    registerMediaSessionHandlers();
    syncUIAfterPlaybackChange();
}

function nextChannel() {
    if (sounds.length === 0) return;
    const nextIdx = currentSoundIndex === -1 ? 0 : currentSoundIndex + 1;
    playChannel(nextIdx);
}

function prevChannel() {
    if (sounds.length === 0) return;
    const prevIdx = currentSoundIndex === -1 ? 0 : currentSoundIndex - 1;
    playChannel(prevIdx);
}

function setPlayIconFor(buttonEl, isPlaying) {
    const icon = buttonEl ? buttonEl.querySelector('i') : null;
    if (!icon) return;
    icon.classList.toggle('fa-play', !isPlaying);
    icon.classList.toggle('fa-pause', isPlaying);
}

function updateCarModeUI() {
    if (!carMode || !carModeTitle || !carModeSubtitle || !carModeLogo || !carModeBg) return;

    if (currentSoundIndex === -1) {
        carModeTitle.textContent = 'RADIOAL';
        carModeSubtitle.textContent = 'Zgjidhni një kanal';
        carModeLogo.setAttribute('src', 'Radio.png');
        carModeBg.style.backgroundImage = 'url("Radio.png")';
        setPlayIconFor(carModePlay, false);
        return;
    }

    const meta = getChannelMeta(currentSoundIndex);
    carModeTitle.textContent = meta.title.toUpperCase();
    carModeSubtitle.textContent = meta.frequency;

    if (meta.imgSrc) {
        carModeLogo.setAttribute('src', meta.imgSrc);
        carModeBg.style.backgroundImage = `url("${meta.imgSrc}")`;
    }

    setPlayIconFor(carModePlay, lastKnownPlaying);
}

function openCarMode() {
    if (!carMode) return;
    closeSpotifyNow();
    carMode.classList.add('active');
    carMode.setAttribute('aria-hidden', 'false');
    updateCarModeUI();
    if (document.body.classList.contains('live-mode') && twitchCar) {
        ensureTwitchEmbeds();
        twitchCar.classList.add('active');
        twitchCar.setAttribute('aria-hidden', 'false');
        if (carModeLogo) carModeLogo.style.display = 'none';
    }
    document.body.style.overflow = 'hidden';
}

function closeCarMode() {
    if (!carMode) return;
    carMode.classList.remove('active');
    carMode.setAttribute('aria-hidden', 'true');
    if (twitchCar) {
        twitchCar.classList.remove('active');
        twitchCar.setAttribute('aria-hidden', 'true');
    }
    if (carModeLogo) carModeLogo.style.display = '';
    document.body.style.overflow = '';
}

if (carModeToggle) carModeToggle.addEventListener('click', openCarMode);
if (carModeBack) carModeBack.addEventListener('click', closeCarMode);

if (carModePrev) carModePrev.addEventListener('click', () => prevChannel());
if (carModeNext) carModeNext.addEventListener('click', () => nextChannel());
if (carModePlay) carModePlay.addEventListener('click', () => toggleCurrent());

if (carMode) {
    carMode.addEventListener('click', (e) => {
        if (e.target === carMode) closeCarMode();
    });
}

if (spotifyBarExpand) spotifyBarExpand.addEventListener('click', openSpotifyNow);
if (spotifyNowClose) spotifyNowClose.addEventListener('click', closeSpotifyNow);
if (spotifyNowPrev) spotifyNowPrev.addEventListener('click', () => prevChannel());
if (spotifyNowNext) spotifyNowNext.addEventListener('click', () => nextChannel());
if (spotifyNowPlay) spotifyNowPlay.addEventListener('click', () => toggleCurrent());
if (spotifyNowCar) {
    spotifyNowCar.addEventListener('click', () => {
        closeSpotifyNow();
        openCarMode();
    });
}

window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (navMenu && navMenu.classList.contains('active')) {
        setMobileMenuOpen(false);
        return;
    }
    if (spotifyNow && spotifyNow.classList.contains('active')) {
        closeSpotifyNow();
        return;
    }
    if (carMode && carMode.classList.contains('active')) closeCarMode();
});

// Restore Live Mode on refresh
setLiveMode(getSavedLiveMode());
updateSpotifyNowUI();
updateGlobalArtworkAndMediaSession();
setPlaybackStateForMediaSession();
registerMediaSessionHandlers();

document.querySelectorAll('.audio-player').forEach((player, index) => {

    const playPauseButton = player.querySelector('.play-pause');
    const volumeControl = player.querySelector('.volume');
    const channelCard = player.closest('.channel');
    const channelImage = channelCard ? channelCard.querySelector('img') : null;
    const channelTitle = channelCard ? channelCard.querySelector('h3') : null;

    const toggleChannelPlayback = () => {
        if (currentSoundIndex === index) {
            toggleCurrent();
            return;
        }
        playChannel(index);
    };

    playPauseButton.addEventListener('click', toggleChannelPlayback);

    if (channelImage) {
        channelImage.style.cursor = 'pointer';
        channelImage.addEventListener('click', toggleChannelPlayback);
    }

    if (volumeControl) {
        volumeControl.addEventListener('input', () => {
            sounds[index].volume(volumeControl.value);
        });
    }

});

// Fshij loader-in kur faqja të ngarkohet
window.addEventListener('load', function() {

    document.querySelector('.loader').style.display = 'none';

});

// Kontrolli i audio player-it global

prevButton.addEventListener('click', () => {
    prevChannel();

});

nextButton.addEventListener('click', () => {
    nextChannel();

});

globalPlayPauseButton.addEventListener('click', () => {
    toggleCurrent();

});

// Keep UI in sync — only for the active channel (avoid races on fast next/prev)
sounds.forEach((sound, index) => {
    sound.on('end', () => {
        if (isSwitchingChannel || index !== currentSoundIndex) return;
        lastKnownPlaying = false;
        syncUIAfterPlaybackChange();
    });
    sound.on('pause', () => {
        if (isSwitchingChannel || index !== currentSoundIndex) return;
        lastKnownPlaying = false;
        syncUIAfterPlaybackChange();
    });
    sound.on('play', () => {
        // Stream i vjetër që nisi vonë: ndaloje menjëherë
        if (index !== currentSoundIndex) {
            try {
                sound.stop();
            } catch (e) {
                // ignore
            }
            return;
        }
        lastKnownPlaying = true;
        registerMediaSessionHandlers();
        syncUIAfterPlaybackChange();
    });
});

/* ================= PWA install + Service Worker ================= */
const PWA_DISMISS_KEY = 'radioal_pwa_install_dismissed';
let deferredInstallPrompt = null;

const pwaInstall = document.getElementById('pwa-install');
const pwaInstallBtn = document.getElementById('pwa-install-btn');
const pwaInstallDismiss = document.getElementById('pwa-install-dismiss');
const pwaInstallFooterBtn = document.getElementById('pwa-install-footer-btn');
const pwaInstallHint = document.getElementById('pwa-install-hint');

function isStandalonePwa() {
    return window.matchMedia('(display-mode: standalone)').matches
        || window.navigator.standalone === true;
}

function wasInstallDismissed() {
    try {
        return localStorage.getItem(PWA_DISMISS_KEY) === '1';
    } catch (e) {
        return false;
    }
}

function showPwaInstall({ iosTip = false } = {}) {
    if (isStandalonePwa() || wasInstallDismissed()) return;

    if (pwaInstallHint) {
        pwaInstallHint.textContent = iosTip
            ? 'Në Safari: Share → Add to Home Screen'
            : 'Instaloje për hapje të shpejtë, si app.';
    }

    if (pwaInstallBtn) {
        pwaInstallBtn.hidden = iosTip;
    }

    if (pwaInstall) {
        pwaInstall.hidden = false;
        pwaInstall.removeAttribute('hidden');
    }

    if (pwaInstallFooterBtn && !iosTip) {
        pwaInstallFooterBtn.hidden = false;
        pwaInstallFooterBtn.removeAttribute('hidden');
    }
}

function hidePwaInstall(permanently = false) {
    if (pwaInstall) {
        pwaInstall.hidden = true;
        pwaInstall.setAttribute('hidden', '');
    }
    if (pwaInstallFooterBtn) {
        pwaInstallFooterBtn.hidden = true;
        pwaInstallFooterBtn.setAttribute('hidden', '');
    }
    if (permanently) {
        try {
            localStorage.setItem(PWA_DISMISS_KEY, '1');
        } catch (e) {
            // ignore
        }
    }
}

async function triggerPwaInstall() {
    if (!deferredInstallPrompt) {
        // iOS / browser without prompt — show tip
        showPwaInstall({ iosTip: true });
        return;
    }

    deferredInstallPrompt.prompt();
    try {
        const choice = await deferredInstallPrompt.userChoice;
        if (choice && choice.outcome === 'accepted') {
            hidePwaInstall(true);
        }
    } catch (e) {
        // ignore
    }
    deferredInstallPrompt = null;
}

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    showPwaInstall({ iosTip: false });
});

window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    hidePwaInstall(true);
});

if (pwaInstallBtn) pwaInstallBtn.addEventListener('click', triggerPwaInstall);
if (pwaInstallFooterBtn) pwaInstallFooterBtn.addEventListener('click', triggerPwaInstall);
if (pwaInstallDismiss) {
    pwaInstallDismiss.addEventListener('click', () => hidePwaInstall(true));
}

// iOS tip (no beforeinstallprompt)
(function initIosInstallTip() {
    if (isStandalonePwa() || wasInstallDismissed()) return;
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (isIos) {
        // Small delay so it doesn't fight the first paint
        window.setTimeout(() => showPwaInstall({ iosTip: true }), 1800);
    }
})();

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js?v=11').then((reg) => {
            reg.update().catch(() => {});
        }).catch(() => {
            // ignore registration errors in local/file contexts
        });
    });
}

/* ================= Wake-up alarm ================= */
const ALARM_STORAGE_KEY = 'radioal_wakeup_alarm';
const ALARM_GRACE_MS = 15 * 60 * 1000; // fire if opened within 15 min after alarm

const alarmToggleBtn = document.getElementById('alarm-toggle');
const alarmModal = document.getElementById('alarm-modal');
const alarmClose = document.getElementById('alarm-close');
const alarmTimeInput = document.getElementById('alarm-time');
const alarmChannelSelect = document.getElementById('alarm-channel');
const alarmChannelPicker = document.getElementById('alarm-channel-picker');
const alarmHourWheel = document.getElementById('alarm-hour-wheel');
const alarmMinuteWheel = document.getElementById('alarm-minute-wheel');
const alarmEnabledInput = document.getElementById('alarm-enabled');
const alarmStatus = document.getElementById('alarm-status');
const alarmSaveBtn = document.getElementById('alarm-save');
const alarmTestBtn = document.getElementById('alarm-test');
const alarmToast = document.getElementById('alarm-toast');
const alarmToastText = document.getElementById('alarm-toast-text');

let alarmTimerId = null;
let alarmCheckId = null;
let alarmWheelsReady = false;
const ALARM_WHEEL_ITEM_H = 44;

function defaultAlarmSettings() {
    return {
        enabled: false,
        time: '07:30',
        channelIndex: 0,
        lastFiredDate: ''
    };
}

function loadAlarmSettings() {
    try {
        const raw = localStorage.getItem(ALARM_STORAGE_KEY);
        if (!raw) return defaultAlarmSettings();
        return { ...defaultAlarmSettings(), ...JSON.parse(raw) };
    } catch (e) {
        return defaultAlarmSettings();
    }
}

function saveAlarmSettings(settings) {
    try {
        localStorage.setItem(ALARM_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
        // ignore
    }
}

function todayKey(date = new Date()) {
    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0')
    ].join('-');
}

function parseAlarmTime(timeStr) {
    const [h, m] = (timeStr || '07:30').split(':').map((n) => parseInt(n, 10));
    return {
        hour: Number.isFinite(h) ? h : 7,
        minute: Number.isFinite(m) ? m : 30
    };
}

function nextAlarmDate(settings, from = new Date()) {
    const { hour, minute } = parseAlarmTime(settings.time);
    const next = new Date(from);
    next.setSeconds(0, 0);
    next.setHours(hour, minute, 0, 0);
    if (next.getTime() <= from.getTime()) {
        next.setDate(next.getDate() + 1);
    }
    return next;
}

function padAlarmUnit(n) {
    return String(n).padStart(2, '0');
}

function buildAlarmWheelColumn(col, count) {
    if (!col) return;
    col.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'alarm-wheel-item';
        item.dataset.value = String(i);
        item.setAttribute('role', 'option');
        item.textContent = padAlarmUnit(i);
        item.addEventListener('click', () => {
            scrollAlarmWheelTo(col, i, true);
            syncAlarmTimeFromWheels();
        });
        col.appendChild(item);
    }
}

function getAlarmWheelIndex(col) {
    if (!col) return 0;
    const raw = Math.round(col.scrollTop / ALARM_WHEEL_ITEM_H);
    const max = Math.max(0, col.querySelectorAll('.alarm-wheel-item').length - 1);
    return Math.min(Math.max(0, raw), max);
}

function scrollAlarmWheelTo(col, index, smooth = false) {
    if (!col) return;
    const max = Math.max(0, col.querySelectorAll('.alarm-wheel-item').length - 1);
    const i = Math.min(Math.max(0, index | 0), max);
    col.scrollTo({
        top: i * ALARM_WHEEL_ITEM_H,
        behavior: smooth ? 'smooth' : 'auto'
    });
    paintAlarmWheel(col);
}

function paintAlarmWheel(col) {
    if (!col) return;
    const selected = getAlarmWheelIndex(col);
    col.querySelectorAll('.alarm-wheel-item').forEach((item, i) => {
        item.classList.toggle('is-selected', i === selected);
        item.classList.toggle('is-near', Math.abs(i - selected) === 1);
        item.setAttribute('aria-selected', i === selected ? 'true' : 'false');
    });
}

function syncAlarmTimeFromWheels() {
    const h = getAlarmWheelIndex(alarmHourWheel);
    const m = getAlarmWheelIndex(alarmMinuteWheel);
    if (alarmTimeInput) alarmTimeInput.value = `${padAlarmUnit(h)}:${padAlarmUnit(m)}`;
    paintAlarmWheel(alarmHourWheel);
    paintAlarmWheel(alarmMinuteWheel);
}

function bindAlarmWheel(col) {
    if (!col) return;
    let snapTimer = null;
    col.addEventListener('scroll', () => {
        paintAlarmWheel(col);
        if (snapTimer) clearTimeout(snapTimer);
        snapTimer = setTimeout(() => {
            const i = getAlarmWheelIndex(col);
            scrollAlarmWheelTo(col, i, true);
            syncAlarmTimeFromWheels();
        }, 80);
    }, { passive: true });
}

function initAlarmWheels() {
    if (alarmWheelsReady) return;
    buildAlarmWheelColumn(alarmHourWheel, 24);
    buildAlarmWheelColumn(alarmMinuteWheel, 60);
    bindAlarmWheel(alarmHourWheel);
    bindAlarmWheel(alarmMinuteWheel);
    alarmWheelsReady = true;
}

function setAlarmWheelsFromTime(timeStr) {
    initAlarmWheels();
    const { hour, minute } = parseAlarmTime(timeStr || '07:30');
    // Wait a frame so layout/padding is ready before snap-scrolling
    requestAnimationFrame(() => {
        scrollAlarmWheelTo(alarmHourWheel, hour, false);
        scrollAlarmWheelTo(alarmMinuteWheel, minute, false);
        syncAlarmTimeFromWheels();
    });
}

function populateAlarmChannelSelect() {
    if (!alarmChannelPicker) return;
    alarmChannelPicker.innerHTML = '';
    channelCards.forEach((card, index) => {
        const meta = getChannelMeta(index);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'alarm-channel-option';
        btn.dataset.index = String(index);
        btn.setAttribute('role', 'option');
        btn.setAttribute('aria-label', meta.title);

        const img = document.createElement('img');
        img.src = meta.imgSrc || 'Radio.png';
        img.alt = '';
        img.loading = 'lazy';

        const span = document.createElement('span');
        span.textContent = meta.title;

        btn.appendChild(img);
        btn.appendChild(span);
        btn.addEventListener('click', () => {
            selectAlarmChannel(index);
        });
        alarmChannelPicker.appendChild(btn);
    });
}

function selectAlarmChannel(index) {
    const max = Math.max(0, channelCards.length - 1);
    const idx = Math.min(Math.max(0, index | 0), max);
    if (alarmChannelSelect) alarmChannelSelect.value = String(idx);
    if (!alarmChannelPicker) return;
    alarmChannelPicker.querySelectorAll('.alarm-channel-option').forEach((btn) => {
        const on = btn.dataset.index === String(idx);
        btn.classList.toggle('is-selected', on);
        btn.setAttribute('aria-selected', on ? 'true' : 'false');
    });
}

function formatAlarmStatus(settings) {
    if (!settings.enabled) return 'Alarmi është fikur.';
    const channelName = getChannelMeta(settings.channelIndex).title;
    const next = nextAlarmDate(settings);
    const when = next.toLocaleString('sq-AL', {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });
    return `Aktiv: ${channelName} · ${settings.time} (tjetri: ${when})`;
}

function syncAlarmUiFromSettings(settings) {
    if (alarmTimeInput) alarmTimeInput.value = settings.time || '07:30';
    if (alarmEnabledInput) alarmEnabledInput.checked = !!settings.enabled;
    selectAlarmChannel(settings.channelIndex | 0);
    if (alarmModal && alarmModal.classList.contains('active')) {
        setAlarmWheelsFromTime(settings.time || '07:30');
    }
    if (alarmStatus) alarmStatus.textContent = formatAlarmStatus(settings);
    if (alarmToggleBtn) alarmToggleBtn.classList.toggle('is-armed', !!settings.enabled);
}

function showAlarmToast(text) {
    if (!alarmToast) return;
    if (alarmToastText) alarmToastText.textContent = text;
    alarmToast.hidden = false;
    alarmToast.removeAttribute('hidden');
    window.setTimeout(() => {
        alarmToast.hidden = true;
        alarmToast.setAttribute('hidden', '');
    }, 7000);
}

async function ensureNotificationPermission() {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    try {
        const result = await Notification.requestPermission();
        return result === 'granted';
    } catch (e) {
        return false;
    }
}

function notifyAlarm(channelName) {
    const title = 'Radio AL — Mirëmëngjes!';
    const body = `Po luhet ${channelName}`;
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    try {
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then((reg) => {
                reg.showNotification(title, {
                    body,
                    icon: 'icon-192x192.png',
                    badge: 'icon-192x192.png',
                    tag: 'radioal-wakeup',
                    renotify: true
                });
            }).catch(() => {
                new Notification(title, { body, icon: 'icon-192x192.png' });
            });
        } else {
            new Notification(title, { body, icon: 'icon-192x192.png' });
        }
    } catch (e) {
        // ignore
    }
}

function fireWakeupAlarm(settings, { force = false } = {}) {
    const channelIndex = Math.min(
        Math.max(0, settings.channelIndex | 0),
        Math.max(0, sounds.length - 1)
    );
    const meta = getChannelMeta(channelIndex);
    const day = todayKey();

    if (!force && settings.lastFiredDate === day) return false;

    settings.lastFiredDate = day;
    saveAlarmSettings(settings);
    syncAlarmUiFromSettings(settings);

    playChannel(channelIndex);
    notifyAlarm(meta.title);
    showAlarmToast(`Po fillon ${meta.title}`);

    // Try to bring tab to front when possible
    try {
        window.focus();
    } catch (e) {
        // ignore
    }

    scheduleWakeupAlarm();
    return true;
}

function clearAlarmTimers() {
    if (alarmTimerId) {
        window.clearTimeout(alarmTimerId);
        alarmTimerId = null;
    }
    if (alarmCheckId) {
        window.clearInterval(alarmCheckId);
        alarmCheckId = null;
    }
}

function maybeCatchUpAlarm(settings) {
    if (!settings.enabled) return false;
    const { hour, minute } = parseAlarmTime(settings.time);
    const now = new Date();
    const alarmToday = new Date(now);
    alarmToday.setSeconds(0, 0);
    alarmToday.setHours(hour, minute, 0, 0);

    const delta = now.getTime() - alarmToday.getTime();
    if (delta >= 0 && delta <= ALARM_GRACE_MS && settings.lastFiredDate !== todayKey(now)) {
        return fireWakeupAlarm(settings);
    }
    return false;
}

function scheduleWakeupAlarm() {
    clearAlarmTimers();
    const settings = loadAlarmSettings();
    syncAlarmUiFromSettings(settings);
    if (!settings.enabled) return;

    const next = nextAlarmDate(settings);
    const delay = Math.max(1000, next.getTime() - Date.now());

    alarmTimerId = window.setTimeout(() => {
        const latest = loadAlarmSettings();
        if (!latest.enabled) return;
        fireWakeupAlarm(latest);
    }, delay);

    // Backup ticker (browser may throttle long timeouts in background)
    alarmCheckId = window.setInterval(() => {
        const latest = loadAlarmSettings();
        if (!latest.enabled) return;
        maybeCatchUpAlarm(latest);
    }, 30000);
}

function openAlarmModal() {
    if (!alarmModal) return;
    initAlarmWheels();
    populateAlarmChannelSelect();
    const settings = loadAlarmSettings();
    alarmModal.classList.add('active');
    alarmModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    syncAlarmUiFromSettings(settings);
    setAlarmWheelsFromTime(settings.time || '07:30');
}

function closeAlarmModal() {
    if (!alarmModal) return;
    alarmModal.classList.remove('active');
    alarmModal.setAttribute('aria-hidden', 'true');
    if (!(carMode && carMode.classList.contains('active'))
        && !(spotifyNow && spotifyNow.classList.contains('active'))) {
        document.body.style.overflow = '';
    }
}

function readAlarmFormSettings() {
    const settings = loadAlarmSettings();
    syncAlarmTimeFromWheels();
    settings.time = alarmTimeInput?.value || '07:30';
    settings.enabled = !!alarmEnabledInput?.checked;
    settings.channelIndex = parseInt(alarmChannelSelect?.value || '0', 10) || 0;
    return settings;
}

if (alarmToggleBtn) {
    alarmToggleBtn.addEventListener('click', openAlarmModal);
}
if (alarmClose) alarmClose.addEventListener('click', closeAlarmModal);
if (alarmModal) {
    alarmModal.addEventListener('click', (e) => {
        if (e.target === alarmModal) closeAlarmModal();
    });
}

if (alarmSaveBtn) {
    alarmSaveBtn.addEventListener('click', async () => {
        const settings = readAlarmFormSettings();
        if (settings.enabled) {
            const ok = await ensureNotificationPermission();
            if (!ok && alarmStatus) {
                alarmStatus.textContent = 'Alarmi u ruajt, por njoftimet janë të bllokuara. Autplay do të ndodhë kur hapet faqja.';
            }
        }
        saveAlarmSettings(settings);
        scheduleWakeupAlarm();
        syncAlarmUiFromSettings(settings);
        if (settings.enabled && alarmStatus && Notification.permission === 'granted') {
            alarmStatus.textContent = formatAlarmStatus(settings);
        }
        closeAlarmModal();
        showAlarmToast(settings.enabled
            ? `Alarmi u aktivizua për ${settings.time}`
            : 'Alarmi u fik.');
    });
}

if (alarmTestBtn) {
    alarmTestBtn.addEventListener('click', async () => {
        await ensureNotificationPermission();
        const settings = readAlarmFormSettings();
        fireWakeupAlarm(settings, { force: true });
    });
}

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        maybeCatchUpAlarm(loadAlarmSettings());
    }
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nicknameModal && nicknameModal.classList.contains('active')) {
        setNicknameSkipped();
        closeNicknameModal();
        return;
    }
    if (e.key === 'Escape' && alarmModal && alarmModal.classList.contains('active')) {
        closeAlarmModal();
    }
});

populateAlarmChannelSelect();
scheduleWakeupAlarm();
// If user opens the app around alarm time, start radio automatically
maybeCatchUpAlarm(loadAlarmSettings());