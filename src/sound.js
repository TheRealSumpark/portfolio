import { Howl } from 'howler';

// Audio starts only after an explicit click. The UI follows actual playback.
export function initSound() {
  const button = document.querySelector('#sound-toggle');
  const label = document.querySelector('#sound-label');
  let sound;
  const update = playing => {
    button.setAttribute('aria-pressed', String(playing));
    button.setAttribute('aria-label', playing ? 'Pause ambient sound' : 'Play ambient sound');
    label.textContent = playing ? 'Sound on' : 'Sound off';
  };
  const fail = () => {
    update(false);
    label.textContent = 'Try sound again';
    if (sound) sound.unload();
    sound = null;
  };
  button.addEventListener('click', () => {
    if (!sound) {
      sound = new Howl({
        src: ['sounds/blurred_oceans.mp3'], loop: true, volume: 0.35,
        html5: true, preload: false,
        onplay: () => update(true), onpause: () => update(false),
        onstop: () => update(false), onloaderror: fail, onplayerror: fail,
      });
    }
    if (sound.playing()) sound.pause();
    else sound.play();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && sound && sound.playing()) sound.pause();
  });
}
