// Decaying camera shake, as a CSS translate value.
export const shake = (frame: number, start: number, duration: number, amp: number) => {
  const t = frame - start;
  if (t < 0 || t > duration) return "0px 0px";
  const k = amp * (1 - t / duration);
  return `${Math.sin(t * 2.7) * k}px ${Math.cos(t * 3.3) * k}px`;
};

// Radial burst of light rays behind a hero element.
export const raysBackground = (color: string) =>
  `repeating-conic-gradient(from 0deg at 50% 50%, ${color} 0deg 7deg, transparent 7deg 20deg)`;
