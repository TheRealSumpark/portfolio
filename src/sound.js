import { Howl, Howler } from "howler";
import $ from "jquery";
/**
 * Sound
 */

// set up the site default sounds
export function initSound() {
  let soundOn = true;
  var sound = new Howl({
    src: ["sounds/max_cooper_order_from_chaos.mp3"],
    loop: true,
    volume: 0.5,
    html5: true,

    name: "max_cooper_order_from_chaos",
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

    //_this.analyser.minDecibels = -100;

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
      //console.log("ticking");
    }, 50);

    //_this.analyser.minDecibels = -60;

    // flag will
    if (!ignoreGlobalSoundState) {
      soundOn = true;
    }
  };

  $(".footer-sound").click(function (e) {
    sound.play("max_cooper_order_from_chaos");

    //_this.audio.playFromTo("click",0,1);
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
