// Funksioni për hamburger menu
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const headerLogo = document.querySelector('header .logo');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

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
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
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

const globalPlayPauseButton = document.getElementById('play-pause');
const prevButton = document.getElementById('prev');
const nextButton = document.getElementById('next');
const globalIcon = globalPlayPauseButton.querySelector('i');
const globalArtwork = document.getElementById('current-channel-artwork');

const channelButtons = document.querySelectorAll('.play-pause');
const nowPlayingLabel = document.getElementById('current-channel');

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
        navigator.mediaSession.metadata = new MediaMetadata({
            title: meta.title,
            artist: meta.frequency,
            album: 'Radio AL',
            artwork: meta.imgSrc
                ? [
                    { src: meta.imgSrc, sizes: '96x96', type: 'image/png' },
                    { src: meta.imgSrc, sizes: '192x192', type: 'image/png' },
                    { src: meta.imgSrc, sizes: '512x512', type: 'image/png' }
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
        const playing = currentSoundIndex !== -1 && sounds[currentSoundIndex].playing();
        navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
    } catch (e) {
        // ignore
    }
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
        updateGlobalArtworkAndMediaSession();
        setPlaybackStateForMediaSession();
        return;
    }

    const meta = getChannelMeta(currentSoundIndex);
    carModeTitle.textContent = meta.title.toUpperCase();
    carModeSubtitle.textContent = meta.frequency;

    if (meta.imgSrc) {
        carModeLogo.setAttribute('src', meta.imgSrc);
        carModeBg.style.backgroundImage = `url("${meta.imgSrc}")`;
    }

    setPlayIconFor(carModePlay, sounds[currentSoundIndex].playing());
    updateGlobalArtworkAndMediaSession();
    setPlaybackStateForMediaSession();
}

function openCarMode() {
    if (!carMode) return;
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

if (carModePrev) carModePrev.addEventListener('click', () => prevButton.click());
if (carModeNext) carModeNext.addEventListener('click', () => nextButton.click());
if (carModePlay) carModePlay.addEventListener('click', () => globalPlayPauseButton.click());

if (carMode) {
    carMode.addEventListener('click', (e) => {
        if (e.target === carMode) closeCarMode();
    });
}

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && carMode && carMode.classList.contains('active')) closeCarMode();
});

// Restore Live Mode on refresh
setLiveMode(getSavedLiveMode());
updateGlobalArtworkAndMediaSession();
setPlaybackStateForMediaSession();

// iOS/Android lock-screen controls (Media Session)
if ('mediaSession' in navigator) {
    try {
        navigator.mediaSession.setActionHandler('previoustrack', () => prevButton && prevButton.click());
        navigator.mediaSession.setActionHandler('nexttrack', () => nextButton && nextButton.click());
        navigator.mediaSession.setActionHandler('play', () => {
            if (currentSoundIndex !== -1 && !sounds[currentSoundIndex].playing()) {
                channelButtons[currentSoundIndex].click();
            }
        });
        navigator.mediaSession.setActionHandler('pause', () => {
            if (currentSoundIndex !== -1 && sounds[currentSoundIndex].playing()) {
                channelButtons[currentSoundIndex].click();
            }
        });
    } catch (e) {
        // ignore
    }
}

document.querySelectorAll('.audio-player').forEach((player, index) => {

    const playPauseButton = player.querySelector('.play-pause');
    const volumeControl = player.querySelector('.volume');
    const channelCard = player.closest('.channel');
    const channelImage = channelCard ? channelCard.querySelector('img') : null;
    const channelTitle = channelCard ? channelCard.querySelector('h3') : null;

    const toggleChannelPlayback = () => {

        if (currentSoundIndex === index && sounds[index].playing()) {

            sounds[index].pause();
            playPauseButton.textContent = 'Play';

            globalIcon.classList.remove('fa-pause');
            globalIcon.classList.add('fa-play');
            updateCarModeUI();
            updateGlobalArtworkAndMediaSession();
            setPlaybackStateForMediaSession();

        } else {

            if (currentSoundIndex !== -1 && sounds[currentSoundIndex].playing()) {

                sounds[currentSoundIndex].pause();
                channelButtons[currentSoundIndex].textContent = 'Play';

            }

            sounds[index].play();
            playPauseButton.textContent = 'Pause';

            currentSoundIndex = index;

            if (channelTitle && nowPlayingLabel) {
                nowPlayingLabel.textContent = channelTitle.textContent;
            }

            globalIcon.classList.remove('fa-play');
            globalIcon.classList.add('fa-pause');
            updateCarModeUI();
            updateGlobalArtworkAndMediaSession();
            setPlaybackStateForMediaSession();
        }

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

    if (currentSoundIndex > 0) {

        const newIndex = currentSoundIndex - 1;
        channelButtons[newIndex].click();

    }

});

nextButton.addEventListener('click', () => {

    if (currentSoundIndex < sounds.length - 1) {

        const newIndex = currentSoundIndex + 1;
        channelButtons[newIndex].click();

    }

});

globalPlayPauseButton.addEventListener('click', () => {

    if (currentSoundIndex !== -1) {

        channelButtons[currentSoundIndex].click();

    }

});

// Keep Car Mode UI in sync if audio ends/errors
sounds.forEach((s) => {
    s.on('end', updateCarModeUI);
    s.on('pause', updateCarModeUI);
    s.on('play', updateCarModeUI);
});