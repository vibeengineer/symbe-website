import gsap from "gsap";

export { gsap };

export type ManagedEventListener = {
  target: EventTarget;
  type: string;
  listener: EventListenerOrEventListenerObject;
  options?: AddEventListenerOptions | boolean;
};

export function addManagedEventListener(
  listeners: ManagedEventListener[],
  target: EventTarget,
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: AddEventListenerOptions | boolean,
) {
  target.addEventListener(type, listener, options);
  listeners.push({ target, type, listener, options });
}

export function removeAllManagedEventListeners(
  listeners: ManagedEventListener[],
) {
  for (const { target, type, listener, options } of listeners) {
    target.removeEventListener(type, listener, options);
  }
  listeners.length = 0; // Clear the array
}
