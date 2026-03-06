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

document.querySelectorAll('.audio-player').forEach((player, index) => {

    const playPauseButton = player.querySelector('.play-pause');
    const volumeControl = player.querySelector('.volume');

    playPauseButton.addEventListener('click', () => {

        if (currentSoundIndex === index && sounds[index].playing()) {

            sounds[index].pause();
            playPauseButton.textContent = 'Play';

            globalIcon.classList.remove('fa-pause');
            globalIcon.classList.add('fa-play');

        } else {

            if (currentSoundIndex !== -1 && sounds[currentSoundIndex].playing()) {

                sounds[currentSoundIndex].pause();
                channelButtons[currentSoundIndex].textContent = 'Play';

            }

            sounds[index].play();
            playPauseButton.textContent = 'Pause';

            currentSoundIndex = index;

            globalIcon.classList.remove('fa-play');
            globalIcon.classList.add('fa-pause');
        }

    });

    volumeControl.addEventListener('input', () => {
        sounds[index].volume(volumeControl.value);
    });

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