export function triggerStarBurst(anchor: HTMLElement): void {
  const star = document.createElement('span');
  star.className = 'star-burst';
  star.style.left = `${anchor.offsetWidth / 2 - 12}px`;
  star.style.top = `${anchor.offsetHeight / 2 - 12}px`;
  anchor.style.position = 'relative';
  anchor.appendChild(star);
  star.addEventListener('animationend', () => star.remove());
}