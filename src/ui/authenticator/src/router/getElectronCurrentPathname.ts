export const getElectronCurrentPathname = async () => {
  const tabId = window.electronAPI.getOwnTabId();
  const tab = await window.electronAPI.getTabById(tabId || '');
  const uUrl = new URL(tab?.url || '');
  const pathname = import.meta.env.PROD
    ? uUrl.searchParams.get('pathname')
    : uUrl.pathname;
  return pathname;
};
