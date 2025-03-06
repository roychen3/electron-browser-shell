import { useLayoutEffect } from 'react';
import { createMemoryRouter } from 'react-router-dom';

let tempPathname = '/';

export interface ElectronRouterProps {
  router: ReturnType<typeof createMemoryRouter>;
  children: React.ReactNode;
}
export default function ElectronRouter({
  router,
  children,
}: ElectronRouterProps) {
  useLayoutEffect(() => {
    const unSubscribeRouter = router.subscribe((state) => {
      console.log('-- router.subscribe ----');
      console.log('pathname:', state.location.pathname);
      const newPathname = state.location.pathname.replace('C:/', '');
      if (tempPathname !== newPathname) {
        tempPathname = newPathname;
        const url = import.meta.env.PROD
          ? `app:///authenticator/?pathname=${newPathname}`
          : newPathname;
        window.history.pushState({}, '', url);
      }
    });

    const navigate = (url: string) => {
      console.log('url:', url);
      const uUrl = new URL(url);
      const pathname = import.meta.env.PROD
        ? uUrl.searchParams.get('pathname')
        : uUrl.pathname;
      if (tempPathname !== pathname) {
        tempPathname = pathname || '/';
        router.navigate(pathname);
      }
    };

    const unSubscribeUrl = window.electronAPI.onUpdateTabById(
      ({ newValue, oldValue }) => {
        console.log('-- onUrlUpdate ----');
        if (newValue.url !== oldValue.url) {
          console.log('---- navigate ----');
          navigate(newValue.url);
        }
      }
    );

    return () => {
      unSubscribeRouter();
      unSubscribeUrl();
    };
  }, [router]);

  return <>{children}</>;
}
