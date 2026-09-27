import { createContext, useCallback, useContext, useEffect, useState, type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from 'react';

type RouterValue = { path: string; navigate: (href: string) => void };

const RouterContext = createContext<RouterValue>({ path: '/', navigate: () => {} });

export const normalizePath = (path: string) => (path.length > 1 ? path.replace(/\/+$/, '') : path) || '/';

/**
 * A tiny history router. On the server it renders `initialPath`; in the browser it
 * follows pushState/popstate. Links are real <a href> tags, so crawlers see them.
 */
export function RouterProvider({ initialPath, children }: { initialPath: string; children: ReactNode }) {
  const [path, setPath] = useState(normalizePath(initialPath));

  useEffect(() => {
    const onPop = () => setPath(normalizePath(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((href: string) => {
    const url = new URL(href, window.location.href);
    const nextPath = normalizePath(url.pathname);
    window.history.pushState({}, '', url.pathname + url.search + url.hash);
    setPath(nextPath);
    requestAnimationFrame(() => {
      const target = url.hash ? document.getElementById(url.hash.slice(1)) : null;
      if (target) target.scrollIntoView({ behavior: 'smooth' });
      else window.scrollTo({ top: 0 });
    });
  }, []);

  return <RouterContext.Provider value={{ path, navigate }}>{children}</RouterContext.Provider>;
}

export const useRouter = () => useContext(RouterContext);

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export function Link({ href, onClick, ...props }: LinkProps) {
  const { path, navigate } = useRouter();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (props.target || !href.startsWith('/')) return;
    const url = new URL(href, window.location.href);
    // Same-page anchor: let the browser scroll natively.
    if (url.hash && normalizePath(url.pathname) === path) return;
    event.preventDefault();
    navigate(href);
  };

  const current = normalizePath(href.split('#')[0]) === path && !href.includes('#');
  return <a href={href} onClick={handleClick} aria-current={current ? 'page' : undefined} {...props} />;
}
