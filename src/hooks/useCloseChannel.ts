import { useAppDispatch, useAppSelector } from '../store';
import { actionsAsync } from '../store/slices/node/actionsAsync';
import { sendNotification } from './useWatcher/notifications';
import { utils as hoprdUtils } from '@hoprnet/hopr-sdk';
const { sdkApiError } = hoprdUtils;

/** Closes a channel and reports failures as notifications. */
export const useCloseChannel = () => {
  const dispatch = useAppDispatch();
  const loginData = useAppSelector((store) => store.auth.loginData);

  const refreshChannels = () => {
    if (!loginData.apiEndpoint) return;
    const payload = { apiEndpoint: loginData.apiEndpoint, apiToken: loginData.apiToken ?? '' };
    dispatch(actionsAsync.getChannelsThunk(payload));
    dispatch(actionsAsync.getBalancesThunk(payload));
  };

  const notify = (message: string) =>
    sendNotification({
      notificationPayload: { source: 'node', name: message, url: null, timeout: null },
      toastPayload: { message },
      dispatch,
    });

  return (direction: 'incoming' | 'outgoing', address: string) =>
    dispatch(
      actionsAsync.closeChannelThunk({
        apiEndpoint: loginData.apiEndpoint!,
        apiToken: loginData.apiToken ?? '',
        direction,
        address,
        timeout: direction === 'outgoing' ? 5 * 60_000 : 120_000,
      }),
    )
      .unwrap()
      .then(() => refreshChannels())
      .catch(async (e) => {
        const isCurrentApiEndpointTheSame = await dispatch(
          actionsAsync.isCurrentApiEndpointTheSame(loginData.apiEndpoint!),
        ).unwrap();
        if (!isCurrentApiEndpointTheSame) return;

        const label = direction === 'outgoing' ? `outgoing channel to ${address}` : `incoming channel from ${address}`;
        if (
          e instanceof sdkApiError &&
          e.hoprdErrorPayload?.error?.includes('channel closure time has not elapsed yet, remaining')
        ) {
          notify(`Closing of ${label} halted. C${e.hoprdErrorPayload?.error.substring(1)}`);
          return;
        }
        let errMsg = `Closing of ${label} failed`;
        if (e instanceof sdkApiError && e.hoprdErrorPayload?.status) errMsg += `.\n${e.hoprdErrorPayload.status}`;
        if (e instanceof sdkApiError && e.hoprdErrorPayload?.error) errMsg += `.\n${e.hoprdErrorPayload.error}`;
        console.error(errMsg, e);
        notify(errMsg);
      });
};
