// Reveal only after the scene reports arrival. A superseded flight may never
// reveal its page, even if its completion callback is delivered late.
export function createPageNavigation({ scene, onStart, onComplete }) {
  let navigationId = 0;
  return (route, immediate = false) => {
    const id = ++navigationId;
    onStart(route, immediate);
    scene.navigate(route, immediate, () => {
      if (id === navigationId) onComplete(route, immediate);
    });
  };
}
