// Funksioni për hamburger menu
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

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

const channelCards = Array.from(document.querySelectorAll('.channel'));

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
        carModeLogo.removeAttribute('src');
        carModeBg.style.backgroundImage = 'none';
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

    setPlayIconFor(carModePlay, sounds[currentSoundIndex].playing());
}

function openCarMode() {
    if (!carMode) return;
    carMode.classList.add('active');
    carMode.setAttribute('aria-hidden', 'false');
    updateCarModeUI();
    document.body.style.overflow = 'hidden';
}

function closeCarMode() {
    if (!carMode) return;
    carMode.classList.remove('active');
    carMode.setAttribute('aria-hidden', 'true');
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

// Butoni Scroll-to-Top
window.addEventListener('scroll', function() {

    const scrollToTopButton = document.getElementById('scrollToTop');

    if (window.scrollY > 300) {
        scrollToTopButton.style.display = 'block';
    } else {
        scrollToTopButton.style.display = 'none';
    }

});

document.getElementById('scrollToTop').addEventListener('click', function() {

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });

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