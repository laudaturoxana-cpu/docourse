import { useEffect, useState } from "react";

export function useCountUp(target: number, duration = 1400, trigger = true) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!trigger) return;
    if (target === 0) return;

    const startTime = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [target, trigger, duration]);

  return value;
}
