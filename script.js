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
    new Howl({
        src: ['https://cp1.sednastream.com/proxy/radioone94?mp=/stream'],
        html5: true,
    }),
    new Howl({
        src: ['https://s4.radio.co/sd1d1904dc/listen'],
        html5: true,
    }),
    new Howl({
        src: ['https://cp1.sednastream.com/proxy/clubfm?mp=/stream'],
        html5: true,
    }),
    new Howl({
        src: ['https://live.topgold.al/tar'],
        html5: true,
    }),
    new Howl({
        src: ['https://live.topgold.al/topgold'],
        html5: true,
    })
];

document.querySelectorAll('.audio-player').forEach((player, index) => {
    const playPauseButton = player.querySelector('.play-pause');
    const volumeControl = player.querySelector('.volume');

    playPauseButton.addEventListener('click', () => {
        if (sounds[index].playing()) {
            sounds[index].pause();
            playPauseButton.textContent = 'Play';
        } else {
            sounds.forEach((sound, i) => {
                if (i !== index && sound.playing()) {
                    sound.pause();
                    document.querySelectorAll('.play-pause')[i].textContent = 'Play';
                }
            });
            sounds[index].play();
            playPauseButton.textContent = 'Pause';
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