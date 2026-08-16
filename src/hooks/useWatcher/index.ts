import { useEffect } from 'react';
import { parseEther } from 'viem';
import { useAppDispatch, useAppSelector } from '../../store';
import { appActions } from '../../store/slices/app';
import { observeNodeBalances } from './balances';
import { observeNodeInfo } from './info';
import { sendNotification } from '../../hooks/useWatcher/notifications';
import { nodeActions, nodeActionsAsync } from '../../store/slices/node';
import { blokliActions } from '../../store/slices/blokli';
import { fetchBlokliData } from '../../store/slices/blokli/fetchBlokliData';
import { selectBlokliUrl } from '../../store/selectors/blokli';
import { checkHowChannelsHaveChanged } from './channels';
import { isAddress } from 'viem';

export const useWatcher = ({ intervalDuration = 60_000 }: { intervalDuration?: number }) => {
  const dispatch = useAppDispatch();
  const { apiEndpoint, apiToken } = useAppSelector((store) => store.auth.loginData);
  const isNodeReady = useAppSelector((store) => store.node.nodeIsReady.data);
  const messages = useAppSelector((store) => store.node.messages.data);
  const channelsParsed = useAppSelector((store) => store.node.channels.parsed);
  const firstChannelsCallWasSuccesfull = useAppSelector((store) => !!store.node.channels.data);
  const connected = useAppSelector((store) => store.auth.status.connected);
  const peerAddress = useAppSelector((store) => store.node.addresses.data.native);

  // inputs of the alias merge
  const aliasMergeMode = useAppSelector((store) => store.app.configuration.aliases.mergeMode);
  const savedNodes = useAppSelector((store) => store.auth.nodes);
  const hoprNetworkName = useAppSelector((store) => store.node.info.data?.hoprNetworkName);

  // inputs of the blokli queries
  const blokliUrl = useAppSelector(selectBlokliUrl);
  const hoprNodeSafe = useAppSelector((store) => store.node.info.data?.hoprNodeSafe);

  // flags to activate notifications
  const activeChannels = useAppSelector((store) => store.app.configuration.notifications.channels);
  const activeMessage = useAppSelector((store) => store.app.configuration.notifications.message);
  const activeNodeBalances = useAppSelector((store) => store.app.configuration.notifications.nodeBalances);
  const activeNodeInfo = useAppSelector((store) => store.app.configuration.notifications.nodeInfo);
  // redux previous states, this can be updated from anywhere in the app
  const prevApiEndpoint = useAppSelector((store) => store.app.previousStates.prevApiEndpoint);
  const prevOutgoingChannels = useAppSelector((store) => store.app.previousStates.prevOutgoingChannels);
  const prevIncomingChannels = useAppSelector((store) => store.app.previousStates.prevIncomingChannels);
  const prevNodeBalances = useAppSelector((store) => store.app.previousStates.prevNodeBalances);
  const prevNodeInfo = useAppSelector((store) => store.app.previousStates.prevNodeInfo);

  // The snapshots above only mean anything for the node they were taken from.
  const snapshotMatchesNode = prevApiEndpoint === apiEndpoint;

  // ==================================================================================
  // The previousStates snapshots belong to a single node. Whenever the connected
  // node changes, drop them and stamp the new one in the same batch.
  useEffect(() => {
    if (!connected || !apiEndpoint) return;
    if (prevApiEndpoint === apiEndpoint) return;
    dispatch(appActions.resetNodeState());
    dispatch(appActions.setPrevApiEndpoint(apiEndpoint));
  }, [connected, apiEndpoint, prevApiEndpoint]);

  // ==================================================================================
  // node watchers
  useEffect(() => {
    if (!connected) return;

    const watchIsNodeReadyInterval = setInterval(() => {
      if (!apiEndpoint || isNodeReady) return;
      return dispatch(
        nodeActionsAsync.isNodeReadyThunk({
          apiEndpoint,
          apiToken: apiToken ? apiToken : '',
        }),
      );
    }, intervalDuration);

    const watchChannelsInterval = setInterval(() => {
      if (!apiEndpoint || !activeChannels) return;
      return dispatch(
        nodeActionsAsync.getChannelsThunk({
          apiEndpoint,
          apiToken: apiToken ? apiToken : '',
        }),
      );
    }, intervalDuration);

    const watchNodeInfoInterval = setInterval(() => {
      observeNodeInfo({
        apiEndpoint,
        apiToken,
        dispatch,
        active: activeNodeInfo,
        previousState: snapshotMatchesNode ? prevNodeInfo : null,
        updatePreviousData: (newNodeInfo) => {
          dispatch(appActions.setPrevNodeInfo(newNodeInfo));
        },
      });
    }, intervalDuration);

    const watchNodeBalancesInterval = setInterval(() => {
      observeNodeBalances({
        apiEndpoint,
        apiToken,
        active: activeNodeBalances,
        minimumNodeBalances: {
          hopr: '0',
          native: '0.003',
          safeHopr: '0',
          safeNative: '0',
          safeHoprAllowance: '0',
        },
        previousState: snapshotMatchesNode ? prevNodeBalances : null,
        updatePreviousData: (newNodeBalances) => {
          dispatch(appActions.setPrevNodeBalances(newNodeBalances));
        },
        dispatch,
      });
    }, intervalDuration);

    const watchMetricsInterval = setInterval(() => {
      if (!apiEndpoint) return;
      return dispatch(
        nodeActionsAsync.getPrometheusMetricsThunk({
          apiEndpoint,
          apiToken: apiToken ? apiToken : '',
        }),
      );
    }, intervalDuration);

    const watchSessionsInterval = setInterval(() => {
      if (!apiEndpoint) return;
      return dispatch(
        nodeActionsAsync.getSessionsThunk({
          apiEndpoint,
          apiToken: apiToken ? apiToken : '',
        }),
      );
    }, 20_000);

    return () => {
      clearInterval(watchIsNodeReadyInterval);
      clearInterval(watchChannelsInterval);
      clearInterval(watchMetricsInterval);
      clearInterval(watchNodeInfoInterval);
      clearInterval(watchNodeBalancesInterval);
      clearInterval(watchSessionsInterval);
    };
  }, [
    connected,
    apiEndpoint,
    apiToken,
    isNodeReady,
    prevApiEndpoint,
    prevNodeBalances,
    prevNodeInfo,
    prevOutgoingChannels,
  ]);

  // Messages
  // useEffect(() => {
  //   if (!connected) return;
  //   if (messages && messages.length > 0) {
  //     messages.forEach((msgReceived, index) => {
  //       const hasToNotify = !msgReceived.notified;
  //       if (hasToNotify) {
  //         if (activeMessage) {
  //           const notification = `Message received: ${msgReceived.body}`;
  //           sendNotification({
  //             notificationPayload: {
  //               source: 'node',
  //               name: notification,
  //               url: null,
  //               timeout: null,
  //             },
  //             toastPayload: { message: notification },
  //             dispatch,
  //           });
  //         }
  //         dispatch(nodeActions.setMessageNotified(index));
  //       }
  //     });
  //   }
  // }, [connected, activeMessage, messages]);

  // Channels
  useEffect(() => {
    if (!connected) return;
    if (!isNodeReady) return;
    if (!activeChannels) return;
    if (!firstChannelsCallWasSuccesfull) return;

    if ((prevOutgoingChannels === null && prevIncomingChannels === null) || !snapshotMatchesNode) {
      const channelsOutgoingIds = Object.keys(channelsParsed.outgoing);
      if (
        channelsOutgoingIds.length !== 0 && //true
        Object.keys(channelsParsed.outgoing[channelsOutgoingIds[0]]).includes('status') // If the channels are populated more than with tickets data
      ) {
        dispatch(appActions.setPrevOutgoingChannels(channelsParsed.outgoing));
      } else {
        dispatch(appActions.setPrevOutgoingChannels({}));
      }

      const channelsIncomingIds = Object.keys(channelsParsed.incoming);
      if (channelsIncomingIds.length !== 0) {
        dispatch(appActions.setPrevIncomingChannels(channelsParsed.incoming));
      } else {
        dispatch(appActions.setPrevIncomingChannels({}));
      }

      return;
    }

    if (!prevOutgoingChannels || !prevIncomingChannels) return;

    const changesOutgoing = checkHowChannelsHaveChanged(prevOutgoingChannels, channelsParsed.outgoing);
    if (changesOutgoing.length !== 0) {
      for (let i = 0; i < changesOutgoing.length; i++) {
        let notificationText: null | string = null;
        if (changesOutgoing[i].status === 'Open') {
          notificationText = `Channel to ${changesOutgoing[i].peerAddress} opened.`;
        } else if (changesOutgoing[i].status === 'PendingToClose') {
          notificationText = `Channel to ${changesOutgoing[i].peerAddress} is pending to close.`;
        } else if (changesOutgoing[i].status === 'Closed') {
          notificationText = `Channel to ${changesOutgoing[i].peerAddress} closed.`;
        }
        if (notificationText) {
          sendNotification({
            notificationPayload: {
              source: 'node',
              name: notificationText,
              url: null,
              timeout: null,
            },
            toastPayload: { message: notificationText },
            dispatch,
          });
        }
      }
      dispatch(appActions.setPrevOutgoingChannels(channelsParsed.outgoing));
    }

    const changesIncoming = checkHowChannelsHaveChanged(prevIncomingChannels, channelsParsed.incoming);
    if (changesIncoming.length !== 0) {
      for (let i = 0; i < changesIncoming.length; i++) {
        let notificationText: null | string = null;
        if (changesIncoming[i].status === 'Open') {
          notificationText = `Channel from ${changesIncoming[i].peerAddress} opened.`;
        } else if (changesIncoming[i].status === 'PendingToClose') {
          notificationText = `Channel from ${changesIncoming[i].peerAddress} is pending to close.`;
        } else if (changesIncoming[i].status === 'Closed') {
          notificationText = `Channel from ${changesIncoming[i].peerAddress} closed.`;
        }
        if (notificationText) {
          sendNotification({
            notificationPayload: {
              source: 'node',
              name: notificationText,
              url: null,
              timeout: null,
            },
            toastPayload: { message: notificationText },
            dispatch,
          });
        }
      }
      dispatch(appActions.setPrevIncomingChannels(channelsParsed.incoming));
    }
  }, [
    connected,
    isNodeReady,
    activeChannels,
    firstChannelsCallWasSuccesfull,
    channelsParsed,
    apiEndpoint,
    prevApiEndpoint,
    prevOutgoingChannels,
    prevIncomingChannels,
  ]);

  // Aliases
  // Recompute whenever anything the merge depends on changes: the connected node,
  // the merge mode, the saved node list (names, networks) or our own network name.
  useEffect(() => {
    dispatch(nodeActions.refreshAliases(peerAddress));
  }, [peerAddress, aliasMergeMode, savedNodes, hoprNetworkName]);

  // Blokli url saved for this node
  useEffect(() => {
    dispatch(blokliActions.loadUrlFromLocalStorage(peerAddress));
  }, [peerAddress]);

  // Blokli data. The url, the node address and the safe all arrive asynchronously
  // after a node switch, so this keys on all 3 rather than firing once, then keeps
  // the figures fresh alongside the balances and channels above.
  useEffect(() => {
    const fetch = () =>
      fetchBlokliData({
        blokliUrl,
        nodeAddress: peerAddress,
        safeAddress: hoprNodeSafe,
        dispatch,
      });
    fetch();
    const watchBlokliInterval = setInterval(fetch, intervalDuration);
    return () => {
      clearInterval(watchBlokliInterval);
    };
  }, [blokliUrl, peerAddress, hoprNodeSafe, intervalDuration]);
};
