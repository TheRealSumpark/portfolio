import { Howl, Howler } from "howler";
import $ from "jquery";
/**
 * Sound
 */

// set up the site default sounds
export function initSound() {
  let soundOn = true;
  var sound = new Howl({
    src: ["sounds/blurred_oceans.mp3"],
    loop: true,
    volume: 0.5,
    html5: true,

    name: "blurred_oceans",
  });
  //sound init
  sound.play(0);
  //global mute control
  const muteAll = function (ignoreGlobalSoundState) {
    console.log("mute all ");
    $(".footer-sound .sbar").addClass("noAnim");
    clearInterval(window.muteInterval);
    var v = Howler.volume();
    window.muteInterval = setInterval(function () {
      v -= 0.1;
      Howler.volume(v);
      if (v <= 0.0) {
        Howler.volume(0.0);
        clearInterval(window.muteInterval);
      }
      //console.log("ticking");
    }, 50);

    // flag will
    if (!ignoreGlobalSoundState) {
      soundOn = false;
    }
  };

  // global unmute control
  const unMuteAll = function (ignoreGlobalSoundState) {
    console.log("unMute all ");
    $(".footer-sound .sbar").removeClass("noAnim");
    clearInterval(window.muteInterval);
    var v = Howler.volume();
    window.muteInterval = setInterval(function () {
      v += 0.1;
      Howler.volume(v);
      if (v >= 1) {
        Howler.volume(1);
        clearInterval(window.muteInterval);
      }
    }, 50);

    if (!ignoreGlobalSoundState) {
      soundOn = true;
    }
  };

  $(".footer-sound").click(function (e) {
    sound.play("blurred_oceans");

    if (soundOn) {
      $(".footer-sound .sbar").addClass("noAnim");
      soundOn = false;
      muteAll();
    } else {
      $(".footer-sound .sbar").removeClass("noAnim");
      soundOn = true;
      unMuteAll();
    }
  });
}
