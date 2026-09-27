import { useEffect, useRef } from 'react';
import { Layout } from '@/components/Layout';
import { RouterProvider, useRouter } from '@/router';
import { findRoute } from '@/routes';
import { applyHead } from '@/seo';

function CurrentPage() {
  const { path } = useRouter();
  const route = findRoute(path);
  const firstRender = useRef(true);

  useEffect(() => {
    // The prerendered HTML already carries the right <head> on first load.
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    applyHead(route);
  }, [route]);

  const { Component } = route;
  return <Component />;
}

export default function App({ url }: { url: string }) {
  return (
    <RouterProvider initialPath={url}>
      <Layout>
        <CurrentPage />
      </Layout>
    </RouterProvider>
  );
}
