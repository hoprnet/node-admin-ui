import { useState } from 'react';
import styled from '@emotion/styled';
import { useLocation } from 'react-router-dom';
import { Drawer, IconButton, Tooltip } from '@mui/material';
import HelpIcon from '@mui/icons-material/HelpOutline';
import CloseIcon from '@mui/icons-material/Close';
import NorthEastIcon from '@mui/icons-material/NorthEast';
import FAQ from '../Faq';
import nodeFaq from '../Faq/node-faq';
import { layout, v } from '../../theme';

// FAQ sections shown per page (pages merged from several old ones combine theirs)
const faqKeysByRoute: Record<string, string[]> = {
  '/node/info': ['/node/info'],
  '/node/tickets': ['/node/tickets'],
  '/node/health': ['/node/metrics'],
  '/networking/peers': ['/networking/peers', '/networking/aliases'],
  '/networking/channels': ['/networking/channels', '/networking/channels-INCOMING'],
};

const resources = [
  { name: 'Documentation', href: 'https://docs.hoprnet.org' },
  { name: 'Staking Hub', href: 'https://hub.hoprnet.org' },
  { name: 'Telegram', href: 'https://t.me/hoprnet' },
];

const Panel = styled.div`
  width: 360px;
  max-width: 100vw;
  padding-top: ${layout.navBarHeight}px;
  box-sizing: border-box;
  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 16px 8px 20px;
    font-size: 14px;
    font-weight: 600;
  }
  .body {
    display: flex;
    flex-direction: column;
    gap: 28px;
    padding: 4px 20px 32px;
  }
  .empty {
    font-size: 13px;
    color: ${v.text3};
  }
  .section-title {
    font-size: 12px;
    font-weight: 500;
    color: ${v.text3};
    padding-bottom: 8px;
    border-bottom: 1px solid ${v.border};
  }
  .links a {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 9px 0;
    border-bottom: 1px solid ${v.border};
    font-size: 13px;
    color: ${v.text};
    svg {
      width: 14px;
      height: 14px;
      color: ${v.text3};
    }
    &:hover {
      color: ${v.accentText};
    }
  }
  kbd {
    display: inline-block;
    padding: 1px 5px;
    border: 1px solid ${v.borderStrong};
    border-radius: 4px;
    font-size: 11px;
    color: ${v.text2};
  }
  .shortcuts {
    font-size: 13px;
    color: ${v.text2};
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-top: 10px;
    div {
      display: flex;
      justify-content: space-between;
    }
  }
`;

/** On-demand help: FAQ of the current page, resources and shortcuts. */
export default function HelpPanel() {
  const [open, set_open] = useState(false);
  const pathname = useLocation().pathname;
  const faq = (faqKeysByRoute[pathname] ?? []).flatMap((key) => nodeFaq[key] ?? []);

  return (
    <>
      <Tooltip title="Help">
        <IconButton
          aria-label="Help"
          onClick={() => set_open(true)}
        >
          <HelpIcon />
        </IconButton>
      </Tooltip>
      <Drawer
        anchor="right"
        open={open}
        onClose={() => set_open(false)}
      >
        <Panel>
          <div className="head">
            Help
            <IconButton
              aria-label="Close help"
              size="small"
              onClick={() => set_open(false)}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>
          <div className="body">
            {faq.length > 0 ? (
              <FAQ
                data={faq.map((item, index) => ({ ...item, id: index }))}
                label="This page"
                variant="blue"
              />
            ) : (
              <div className="empty">No help topics for this page.</div>
            )}
            <div className="links">
              <div className="section-title">Resources</div>
              {resources.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.name}
                  <NorthEastIcon />
                </a>
              ))}
            </div>
            <div>
              <div className="section-title">Shortcuts</div>
              <div className="shortcuts">
                <div>
                  Search nodes, channels and pages
                  <span>
                    <kbd>Ctrl</kbd> <kbd>K</kbd>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Panel>
      </Drawer>
    </>
  );
}
