import { getTranslation } from './utils/getTranslation';
import { PLUGIN_ID } from './pluginId';
import { Initializer } from './components/Initializer';
import { PluginIcon } from './components/PluginIcon';

export default {
  register(app) {
    // Main menu link
    app.addMenuLink({
      to: `plugins/${PLUGIN_ID}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${PLUGIN_ID}.plugin.name`,
        defaultMessage: 'Deployment',
      },
      Component: async () => {
        const { App } = await import('./pages/App');
        return App;
      },
    });

    // Settings menu link
    app.createSettingSection(
      {
        id: PLUGIN_ID,
        intlLabel: {
          id: `${PLUGIN_ID}.plugin.section`,
          defaultMessage: 'Deployment Plugin',
        },
      },
      [
        {
          intlLabel: {
            id: `${PLUGIN_ID}.plugin.settings`,
            defaultMessage: 'Settings',
          },
          id: 'settings',
          to: `plugins/${PLUGIN_ID}/settings`,
          Component: async () => {
            const { default: Settings } = await import('./pages/Settings');
            return Settings;
          },
        },
      ]
    );

    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer,
      isReady: false,
      name: PLUGIN_ID,
    });
  },

  async registerTrads({ locales }) {
    return Promise.all(
      locales.map(async (locale) => {
        try {
          const { default: data } = await import(`./translations/${locale}.json`);

          return { data, locale };
        } catch {
          return { data: {}, locale };
        }
      })
    );
  },
};
