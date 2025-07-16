import { Page } from '@strapi/strapi/admin';
import { Routes, Route } from 'react-router-dom';

import { HomePage } from './HomePage';
import Deployment from './Deployment';
import Settings from './Settings';

const App = () => {
  return (
    <Routes>
      <Route index element={<Deployment />} />
      <Route path="settings" element={<Settings />} />
      <Route path="*" element={<Page.Error />} />
    </Routes>
  );
};

export { App };
