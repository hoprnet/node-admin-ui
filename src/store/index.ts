import { configureStore, Middleware } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import authSlice from './slices/auth';
import nodeSlice from './slices/node';
import appSlice from './slices/app';
import blokliSlice from './slices/blokli';
import { trackAbortable } from './abortRegistry';
//import { websocketMiddleware } from './slices/node/websocketMiddleware';

const abortTrackingMiddleware: Middleware = () => (next) => (action) => {
  const result = next(action);
  if (
    result &&
    typeof result === 'object' &&
    typeof (result as { abort?: unknown }).abort === 'function' &&
    typeof (result as { then?: unknown }).then === 'function'
  ) {
    trackAbortable(result as { abort: () => void } & PromiseLike<unknown>);
  }
  return result;
};

const store = configureStore({
  reducer: {
    auth: authSlice,
    node: nodeSlice,
    app: appSlice,
    blokli: blokliSlice,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(abortTrackingMiddleware),
  devTools: import.meta.env.PROD ? false : { maxAge: 5000 },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// // Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
