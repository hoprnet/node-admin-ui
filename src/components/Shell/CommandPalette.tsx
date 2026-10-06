import { useEffect, useMemo, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { Dialog } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowIcon from '@mui/icons-material/SubdirectoryArrowLeft';
import { useAppSelector } from '../../store';
import { applicationMap } from '../../applicationMap';
import { shortAddress } from '../../utils/format';
import { generateBase64Jazz } from '../../utils/functions';
import { v } from '../../theme';

type Item = {
  id: string;
  group: 'Pages' | 'Peers' | 'Channels';
  label: string;
  detail?: string;
  address?: string;
  to: string;
  keywords: string;
};

const Trigger = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  width: 240px;
  padding: 0 8px 0 10px;
  border: 1px solid ${v.border};
  border-radius: 6px;
  background: ${v.surface2};
  color: ${v.text3};
  font-size: 13px;
  cursor: pointer;
  svg {
    width: 16px;
    height: 16px;
  }
  .label {
    flex-grow: 1;
    text-align: left;
  }
  kbd {
    font-family: var(--font-sans);
    font-size: 11px;
    padding: 1px 5px;
    border: 1px solid ${v.borderStrong};
    border-radius: 4px;
    color: ${v.text3};
  }
  &:hover {
    border-color: ${v.borderStrong};
    color: ${v.text2};
  }
  @media (max-width: 1100px) {
    width: 32px;
    padding: 0;
    justify-content: center;
    .label,
    kbd {
      display: none;
    }
  }
`;

const Palette = styled.div`
  display: flex;
  flex-direction: column;
  max-height: min(520px, 70vh);
  .input {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 16px;
    height: 52px;
    border-bottom: 1px solid ${v.border};
    color: ${v.text3};
    input {
      flex-grow: 1;
      border: 0;
      outline: 0;
      background: transparent;
      font-size: 15px;
      color: ${v.text};
    }
  }
  .results {
    overflow-y: auto;
    padding: 6px;
  }
  .group {
    padding: 10px 10px 4px;
    font-size: 11.5px;
    font-weight: 500;
    color: ${v.text3};
  }
  .item {
    display: flex;
    align-items: center;
    gap: 10px;
    height: 38px;
    padding: 0 10px;
    border-radius: 6px;
    font-size: 13.5px;
    color: ${v.text};
    cursor: pointer;
    img {
      width: 18px;
      height: 18px;
      border-radius: 50%;
    }
    .detail {
      margin-left: auto;
      font-family: var(--font-mono);
      font-size: 12px;
      color: ${v.text3};
    }
    .enter {
      display: none;
      width: 14px;
      height: 14px;
      color: ${v.text3};
    }
    &.active {
      background: ${v.accentSoft};
      .enter {
        display: block;
      }
    }
  }
  .empty {
    padding: 28px 16px;
    text-align: center;
    font-size: 13px;
    color: ${v.text3};
  }
`;

/** Ctrl/Cmd + K: jump to a page, a peer or a channel by alias or address. */
export default function CommandPalette() {
  const navigate = useNavigate();
  const [open, set_open] = useState(false);
  const [query, set_query] = useState('');
  const [active, set_active] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const connected = useAppSelector((store) => store.auth.status.connected);
  const peers = useAppSelector((store) => store.node.peersConnected.data);
  const aliases = useAppSelector((store) => store.node.aliases);
  const channels = useAppSelector((store) => store.node.channels.data);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        set_open((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) {
      set_query('');
      set_active(0);
    }
  }, [open]);

  const items = useMemo<Item[]>(() => {
    const result: Item[] = [];
    applicationMap.forEach((group) =>
      group.items.forEach((item) => {
        if (!item.element || item.inDrawer === false || !item.name) return;
        result.push({
          id: `page-${group.path}-${item.path}`,
          group: 'Pages',
          label: item.name,
          to: `/${group.path}/${item.path}`,
          keywords: `${item.name} ${group.groupName}`.toLowerCase(),
        });
      }),
    );
    if (!connected) return result;
    const peerAddresses = new Set<string>([
      ...(peers ?? []).map((peer) => peer.address),
      ...Object.keys(aliases ?? {}),
    ]);
    peerAddresses.forEach((address) => {
      const alias = aliases?.[address];
      result.push({
        id: `peer-${address}`,
        group: 'Peers',
        label: alias ?? shortAddress(address, 6),
        detail: alias ? shortAddress(address) : undefined,
        address,
        to: `/networking/peers?peer=${address}`,
        keywords: `${alias ?? ''} ${address}`.toLowerCase(),
      });
    });
    (['outgoing', 'incoming'] as const).forEach((direction) =>
      (channels?.[direction] ?? []).forEach((channel) => {
        const alias = aliases?.[channel.peerAddress];
        result.push({
          id: `channel-${channel.id}`,
          group: 'Channels',
          label: `${direction === 'outgoing' ? 'To' : 'From'} ${alias ?? shortAddress(channel.peerAddress, 6)}`,
          detail: channel.status,
          address: channel.peerAddress,
          to: `/networking/channels?direction=${direction === 'outgoing' ? 'out' : 'in'}&peer=${channel.peerAddress}`,
          keywords: `${direction} channel ${alias ?? ''} ${channel.peerAddress} ${channel.id}`.toLowerCase(),
        });
      }),
    );
    return result;
  }, [connected, peers, aliases, channels]);

  const filtered = useMemo(() => {
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const matches = terms.length ? items.filter((item) => terms.every((term) => item.keywords.includes(term))) : items;
    // without a query, only pages; the lists of peers and channels are long
    return (terms.length ? matches : matches.filter((item) => item.group === 'Pages')).slice(0, 50);
  }, [items, query]);

  const choose = (item: Item | undefined) => {
    if (!item) return;
    set_open(false);
    navigate(item.to);
  };

  useEffect(() => {
    listRef.current?.querySelector('.item.active')?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  let lastGroup: string | null = null;

  return (
    <>
      <Trigger
        onClick={() => set_open(true)}
        aria-label="Search"
      >
        <SearchIcon />
        <span className="label">Search…</span>
        <kbd>Ctrl K</kbd>
      </Trigger>
      <Dialog
        open={open}
        onClose={() => set_open(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { alignSelf: 'flex-start', mt: '12vh' } }}
      >
        <Palette
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              set_active((a) => Math.min(a + 1, filtered.length - 1));
            } else if (event.key === 'ArrowUp') {
              event.preventDefault();
              set_active((a) => Math.max(a - 1, 0));
            } else if (event.key === 'Enter') {
              event.preventDefault();
              choose(filtered[active]);
            }
          }}
        >
          <div className="input">
            <SearchIcon />
            <input
              autoFocus
              placeholder="Search pages, peers, channels by alias or address"
              value={query}
              onChange={(event) => {
                set_query(event.target.value);
                set_active(0);
              }}
            />
          </div>
          <div
            className="results"
            ref={listRef}
          >
            {filtered.length === 0 && <div className="empty">No results</div>}
            {filtered.map((item, index) => {
              const showGroup = item.group !== lastGroup;
              lastGroup = item.group;
              return (
                <div key={item.id}>
                  {showGroup && <div className="group">{item.group}</div>}
                  <div
                    className={`item ${index === active ? 'active' : ''}`}
                    onMouseMove={() => set_active(index)}
                    onClick={() => choose(item)}
                  >
                    {item.address && (
                      <img
                        src={generateBase64Jazz(item.address) ?? ''}
                        alt=""
                      />
                    )}
                    {item.label}
                    {item.detail && <span className="detail">{item.detail}</span>}
                    <ArrowIcon className="enter" />
                  </div>
                </div>
              );
            })}
          </div>
        </Palette>
      </Dialog>
    </>
  );
}
