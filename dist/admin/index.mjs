import { useRef, useEffect } from "react";
import { jsx } from "react/jsx-runtime";
import { CloudUpload } from "@strapi/icons";
const __variableDynamicImportRuntimeHelper = (glob, path, segs) => {
  const v = glob[path];
  if (v) {
    return typeof v === "function" ? v() : Promise.resolve(v);
  }
  return new Promise((_, reject) => {
    (typeof queueMicrotask === "function" ? queueMicrotask : setTimeout)(
      reject.bind(
        null,
        new Error(
          "Unknown variable dynamic import: " + path + (path.split("/").length !== segs ? ". Note that variables only represent file names one level deep." : "")
        )
      )
    );
  });
};
const PLUGIN_ID = "strapi-content-deployment";
const Initializer = ({ setPlugin }) => {
  const ref = useRef(setPlugin);
  useEffect(() => {
    ref.current(PLUGIN_ID);
  }, []);
  return null;
};
const PluginIcon = () => /* @__PURE__ */ jsx(CloudUpload, {});
const index = {
  register(app) {
    app.addMenuLink({
      to: `plugins/${PLUGIN_ID}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${PLUGIN_ID}.plugin.name`,
        defaultMessage: "Deployment"
      },
      Component: async () => {
        const { App } = await import("../_chunks/App-Dndyn2qc.mjs");
        return App;
      },
      permissions: [
        { action: "plugin::strapi-content-deployment.read", subject: null }
      ]
    });
    app.createSettingSection(
      {
        id: PLUGIN_ID,
        intlLabel: {
          id: `${PLUGIN_ID}.plugin.section`,
          defaultMessage: "Deployment Plugin"
        }
      },
      [
        {
          intlLabel: {
            id: `${PLUGIN_ID}.plugin.settings`,
            defaultMessage: "Settings"
          },
          id: "settings",
          to: `plugins/${PLUGIN_ID}/settings`,
          Component: async () => {
            const { default: Settings } = await import("../_chunks/Settings-DYj8dL9V.mjs");
            return Settings;
          },
          permissions: [
            { action: "plugin::strapi-content-deployment.settings.read", subject: null }
          ]
        }
      ]
    );
    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer,
      isReady: false,
      name: PLUGIN_ID
    });
  },
  async registerTrads({ locales }) {
    return Promise.all(
      locales.map(async (locale) => {
        try {
          const { default: data } = await __variableDynamicImportRuntimeHelper(/* @__PURE__ */ Object.assign({ "./translations/en.json": () => import("../_chunks/en-Byx4XI2L.mjs") }), `./translations/${locale}.json`, 3);
          return { data, locale };
        } catch {
          return { data: {}, locale };
        }
      })
    );
  }
};
export {
  index as default
};
