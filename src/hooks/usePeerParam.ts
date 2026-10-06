import { useSearchParams } from 'react-router-dom';

/** The peer shown in the detail panel, kept in the URL (?peer=0x…) so it can be linked to. */
export const usePeerParam = () => {
  const [searchParams, set_searchParams] = useSearchParams();
  const peer = searchParams.get('peer');
  const open = (address: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('peer', address);
    set_searchParams(next);
  };
  const close = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('peer');
    set_searchParams(next);
  };
  return { peer, open, close };
};
