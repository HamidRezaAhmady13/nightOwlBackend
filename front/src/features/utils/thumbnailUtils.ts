export function findSeekBar(selector: string): Promise<HTMLElement> {
  return new Promise((resolve) => {
    const tryFind = () => {
      const el = document.querySelector(selector) as HTMLElement | null;
      if (el) resolve(el);
      else setTimeout(tryFind, 300);
    };
    tryFind();
  });
}
