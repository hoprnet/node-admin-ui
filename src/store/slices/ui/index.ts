import { PayloadAction, createSlice, isAnyOf } from '@reduxjs/toolkit';
import { actionsAsync as nodeActionsAsync } from '../node/actionsAsync';
import { loadStateFromLocalStorage, saveStateToLocalStorage } from '../../../utils/localStorage';
import { extractSeries, MetricSample, METRICS_HISTORY_MAX_MS } from '../../../utils/prometheus';

/*
 * UI state that is not node data: freshness of the polled data, the per-node
 * read-only flag and an in-browser history of a few node metrics.
 */

type InitialState = {
  sync: {
    lastSuccessAt: number | null;
    lastErrorAt: number | null;
    // failed polls in a row; reset by any successful one
    consecutiveErrors: number;
    paused: boolean;
  };
  // apiEndpoint -> read-only
  readOnly: Record<string, boolean>;
  metricsHistory: MetricSample[];
};

const READ_ONLY_KEY = 'app/readOnly';

export const initialState: InitialState = {
  sync: { lastSuccessAt: null, lastErrorAt: null, consecutiveErrors: 0, paused: false },
  readOnly: (loadStateFromLocalStorage(READ_ONLY_KEY) as Record<string, boolean> | null) ?? {},
  metricsHistory: [],
};

// Read-only polls; their outcome drives the freshness indicator.
const polls = [
  nodeActionsAsync.getInfoThunk,
  nodeActionsAsync.getBalancesThunk,
  nodeActionsAsync.getChannelsThunk,
  nodeActionsAsync.getConnectedPeersThunk,
  nodeActionsAsync.getAnnouncedPeersThunk,
  nodeActionsAsync.getTicketStatisticsThunk,
  nodeActionsAsync.getPrometheusMetricsThunk,
  nodeActionsAsync.getSessionsThunk,
] as const;

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    resetSync: (state) => {
      state.sync = { ...initialState.sync, paused: state.sync.paused };
      state.metricsHistory = [];
    },
    setPaused: (state, action: PayloadAction<boolean>) => {
      state.sync.paused = action.payload;
    },
    setReadOnly: (state, action: PayloadAction<{ apiEndpoint: string; readOnly: boolean }>) => {
      state.readOnly[action.payload.apiEndpoint] = action.payload.readOnly;
      saveStateToLocalStorage(READ_ONLY_KEY, state.readOnly);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(nodeActionsAsync.getPrometheusMetricsThunk.fulfilled, (state, action) => {
      if (!action.payload) return;
      const now = Date.now();
      state.metricsHistory.push({ timestamp: now, values: extractSeries(action.payload) });
      while (state.metricsHistory.length > 0 && now - state.metricsHistory[0].timestamp > METRICS_HISTORY_MAX_MS) {
        state.metricsHistory.shift();
      }
    });
    // switching or disconnecting node: the freshness and history belong to the old node
    builder.addMatcher(
      (action): action is PayloadAction<undefined> => action.type === 'node/resetState',
      (state) => {
        state.sync = { ...initialState.sync, paused: state.sync.paused };
        state.metricsHistory = [];
      },
    );
    // The thunks resolve with `undefined` (instead of rejecting) on network
    // errors, so an empty payload counts as a failed poll too.
    builder.addMatcher(isAnyOf(...polls.map((thunk) => thunk.fulfilled)), (state, action) => {
      if (action.payload === undefined) {
        state.sync.lastErrorAt = Date.now();
        state.sync.consecutiveErrors += 1;
        return;
      }
      state.sync.lastSuccessAt = Date.now();
      state.sync.consecutiveErrors = 0;
    });
    builder.addMatcher(isAnyOf(...polls.map((thunk) => thunk.rejected)), (state, action) => {
      // aborted on node switch / logout: not a failure of the node
      if (action.meta.aborted) return;
      state.sync.lastErrorAt = Date.now();
      state.sync.consecutiveErrors += 1;
    });
  },
});

export const uiActions = uiSlice.actions;
export default uiSlice.reducer;
