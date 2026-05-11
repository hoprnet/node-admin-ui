import { createBrowserRouter, Navigate, RouteObject } from 'react-router-dom';
import { environment } from '../config';

import NodeLandingPage from './pages/node/landingPage';
import TermsOfService from './pages/TermsOfService';
import PrivacyNotice from './pages/PrivacyNotice';

import LayoutEnhanced from './LayoutEnhanced';
import { applicationMap } from './applicationMap';

const routes = [
  {
    path: '/',
    element: <LayoutEnhanced />,
    children: [] as RouteObject[],
  },
  {
    path: '*',
    element: (
      <Navigate
        to="/"
        replace
      />
    ),
    children: [] as RouteObject[],
  },
];

applicationMap.forEach((groups) => {
  groups.items.forEach((item) => {
    if (environment === 'node') {
      routes[0].children.push({
        path: '/',
        element: <NodeLandingPage />,
      });
    }
    if (item.path && item.element) {
      routes[0].children.push({
        path: item.overwritePath ? item.overwritePath : groups.path + '/' + item.path,
        element: item.element,
      });
    }
  });
});

routes[0].children.push({
  path: '/tos',
  element: <TermsOfService />,
});
routes[0].children.push({
  path: '/privacy-notice',
  element: <PrivacyNotice />,
});

const router = createBrowserRouter(routes);

export default router;
