import React, { useState, useEffect } from 'react';
import { parseEther } from 'viem';
import { SDialog, SDialogContent, SIconButton, TopBar } from '../../../future-hopr-lib-components/Modal/styled';
import { useAppDispatch, useAppSelector } from '../../../store';
import { actionsAsync } from '../../../store/slices/node/actionsAsync';
import { sendNotification } from '../../../hooks/useWatcher/notifications';
import { HOPR_TOKEN_USED } from '../../../../config';
import { utils } from '@hoprnet/hopr-sdk';
const { sdkApiError } = utils;
import {
  DialogTitle,
  DialogActions,
  CircularProgress,
  TextField,
  SelectChangeEvent,
  Select,
  MenuItem,
  Autocomplete,
  Tooltip,
  IconButton as IconButtonMui,
  InputAdornment,
  Radio,
} from '@mui/material';

// HOPR Components
import IconButton from '../../../future-hopr-lib-components/Button/IconButton';
import FundChannelIcon from '../../../future-hopr-lib-components/Icons/FundChannel';
import Button from '../../../future-hopr-lib-components/Button';

// Mui
import CloseIcon from '@mui/icons-material/Close';
import { add } from 'lodash';

type FundChannelModalModalProps = {
  address?: string;
  disabled?: boolean;
};

export const FundChannelModal = ({ ...props }: FundChannelModalModalProps) => {
  const dispatch = useAppDispatch();
  const loginData = useAppSelector((store) => store.auth.loginData);
  const [openChannelModal, set_openChannelModal] = useState(false);
  const [amount, set_amount] = useState('');
  const [address, set_address] = useState(props.address ? props.address : '');
  const canFund = !(!amount || parseFloat(amount) <= 0 || !address);

  const aliases = useAppSelector((store) => store.node.aliases);
  const myAddress = useAppSelector((store) => store.node.addresses.data.native || '');
  const sortedAliases = useAppSelector((store) => store.node.links.sortedAliases);
  const aliasTopeerAddress = useAppSelector((store) => store.node.links.aliasTopeerAddress);
  const sortedAnnouncedPeers = useAppSelector((store) => store.node.peersAnnounced.parsed.sorted);
  const peerAddressesWithAliases = useAppSelector((store) => store.node.links.peerAddressesWithAliases);
  const addressBook = [
    myAddress,
    ...sortedAliases.map((alias) => aliasTopeerAddress[alias]),
    ...sortedAnnouncedPeers.filter(
      (peerAddress) => peerAddress !== myAddress && !peerAddressesWithAliases.includes(peerAddress),
    ),
  ];

  useEffect(() => {
    window.addEventListener('keydown', handleEnter as EventListener);
    return () => {
      window.removeEventListener('keydown', handleEnter as EventListener);
    };
  }, [openChannelModal, loginData, amount, address]);

  const handleOpenChannelDialog = () => {
    (document.activeElement as HTMLInputElement).blur();
    set_openChannelModal(true);
  };

  const handleCloseModal = () => {
    set_openChannelModal(false);
    set_amount('');
    set_address(props.address ? props.address : '');
  };

  const handleAction = async () => {
    const handleFundChannel = async (weiValue: string, address: string) => {
      await dispatch(
        actionsAsync.fundChannelThunk({
          apiEndpoint: loginData.apiEndpoint!,
          apiToken: loginData.apiToken ? loginData.apiToken : '',
          amount: `${weiValue} wei wxHOPR`,
          address: address,
          timeout: 120_000, //TODO: put those values as default to HOPRd SDK, average is 50s
        }),
      )
        .unwrap()
        .then(() => {
          const msg = `Channel to ${address} is funded`;
          sendNotification({
            notificationPayload: {
              source: 'node',
              name: msg,
              url: null,
              timeout: null,
            },
            toastPayload: { message: msg },
            dispatch,
          });
        })
        .catch(async (e) => {
          const isCurrentApiEndpointTheSame = await dispatch(
            actionsAsync.isCurrentApiEndpointTheSame(loginData.apiEndpoint!),
          ).unwrap();
          if (!isCurrentApiEndpointTheSame) return;

          let errMsg = `Channel to ${address} failed to be funded`;
          if (e instanceof sdkApiError && e.hoprdErrorPayload?.status)
            errMsg = errMsg + `.\n${e.hoprdErrorPayload.status}`;
          if (e instanceof sdkApiError && e.hoprdErrorPayload?.error)
            errMsg = errMsg + `.\n${e.hoprdErrorPayload.error}`;
          console.error(errMsg, e);
          sendNotification({
            notificationPayload: {
              source: 'node',
              name: errMsg,
              url: null,
              timeout: null,
            },
            toastPayload: { message: errMsg },
            dispatch,
          });
        });
    };

    handleCloseModal();
    const parsedOutgoing = parseFloat(amount ?? '0') >= 0 ? amount ?? '0' : '0';
    const weiValue = parseEther(parsedOutgoing).toString();
    await handleFundChannel(weiValue, address);
    dispatch(
      actionsAsync.getChannelsThunk({
        apiEndpoint: loginData.apiEndpoint!,
        apiToken: loginData.apiToken ? loginData.apiToken : '',
      }),
    );
  };

  function handleEnter(event: KeyboardEvent) {
    if (openChannelModal && canFund && event.key === 'Enter') {
      console.log('FundChannelModal event');
      handleAction();
    }
  }

  return (
    <>
      <IconButton
        iconComponent={<FundChannelIcon />}
        disabled={props.disabled}
        tooltipText={
          <span>
            FUND
            <br />
            outgoing channel
          </span>
        }
        onClick={handleOpenChannelDialog}
      />
      <SDialog
        open={openChannelModal}
        onClose={handleCloseModal}
        disableScrollLock={true}
      >
        <TopBar>
          <DialogTitle>Fund outgoing channel</DialogTitle>
          <SIconButton
            aria-label="close modal"
            onClick={handleCloseModal}
          >
            <CloseIcon />
          </SIconButton>
        </TopBar>
        <SDialogContent>
          <Autocomplete
            value={address}
            onChange={(event, newValue) => {
              set_address(newValue || '');
            }}
            options={addressBook}
            getOptionLabel={(address) => (aliases[address] ? `${aliases[address]} (${address})` : address)}
            autoSelect
            renderInput={(params) => (
              <TextField
                {...params}
                label="Destination"
                placeholder="Select Destination"
                fullWidth
              />
            )}
            style={{
              flex: 1,
            }}
          />
          <TextField
            label="Amount"
            type="string"
            placeholder="Amount"
            value={amount}
            onChange={(e) => set_amount(e.target.value)}
            InputProps={{ endAdornment: <InputAdornment position="end">{HOPR_TOKEN_USED}</InputAdornment> }}
            sx={{ mt: '6px' }}
            autoFocus={address !== ''}
          />
        </SDialogContent>
        <DialogActions>
          <Button
            onClick={handleAction}
            disabled={!canFund}
            style={{
              marginRight: '16px',
              marginBottom: '6px',
              marginTop: '-6px',
            }}
          >
            Fund outgoing channel
          </Button>
        </DialogActions>
      </SDialog>
    </>
  );
};
