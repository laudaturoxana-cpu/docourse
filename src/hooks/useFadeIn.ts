import { useInView } from './useInView';

export function useFadeIn() {
  const { ref, inView } = useInView({ threshold: 0.1 });

  const fadeClass = inView
    ? 'opacity-100 translate-y-0 transition-all duration-700'
    : 'opacity-0 translate-y-5';

  return { ref, fadeClass };
}
