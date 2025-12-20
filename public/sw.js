if (!self.define) {
  let e,
    s = {};
  const i = (i, a) => (
    (i = new URL(i + '.js', a).href),
    s[i] ||
      new Promise((s) => {
        if ('document' in self) {
          const e = document.createElement('script');
          (e.src = i), (e.onload = s), document.head.appendChild(e);
        } else (e = i), importScripts(i), s();
      }).then(() => {
        let e = s[i];
        if (!e) throw new Error(`Module ${i} didn’t register its module`);
        return e;
      })
  );
  self.define = (a, n) => {
    const c = e || ('document' in self ? document.currentScript.src : '') || location.href;
    if (s[c]) return;
    let t = {};
    const f = (e) => i(e, c),
      r = { module: { uri: c }, exports: t, require: f };
    s[c] = Promise.all(a.map((e) => r[e] || f(e))).then((e) => (n(...e), t));
  };
}
define(['./workbox-4754cb34'], function (e) {
  'use strict';
  importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        { url: '/_next/app-build-manifest.json', revision: '65fd617bec552bb330304fdd2dd264d0' },
        { url: '/_next/static/chunks/112-7782874232b620d6.js', revision: 'kELkUXzQCIfvQfeE_98iB' },
        { url: '/_next/static/chunks/123.af1122a4bc2e2883.js', revision: 'af1122a4bc2e2883' },
        { url: '/_next/static/chunks/128-9564fa935745ace7.js', revision: 'kELkUXzQCIfvQfeE_98iB' },
        { url: '/_next/static/chunks/129-f9a1094abe97e113.js', revision: 'kELkUXzQCIfvQfeE_98iB' },
        { url: '/_next/static/chunks/1329d575-edcb33f2134cf344.js', revision: 'kELkUXzQCIfvQfeE_98iB' },
        { url: '/_next/static/chunks/173-bb0be0800399200c.js', revision: 'kELkUXzQCIfvQfeE_98iB' },
        { url: '/_next/static/chunks/357-160ea2ea796a972e.js', revision: 'kELkUXzQCIfvQfeE_98iB' },
        { url: '/_next/static/chunks/37-bb3eb94b923fa031.js', revision: 'kELkUXzQCIfvQfeE_98iB' },
        { url: '/_next/static/chunks/428.de9c6446201d01ea.js', revision: 'de9c6446201d01ea' },
        { url: '/_next/static/chunks/45e90bda-3b2ffd72a31d6c84.js', revision: 'kELkUXzQCIfvQfeE_98iB' },
        { url: '/_next/static/chunks/484-1c29db37d48f39b0.js', revision: 'kELkUXzQCIfvQfeE_98iB' },
        { url: '/_next/static/chunks/4bd1b696-4d88b174d8f05842.js', revision: 'kELkUXzQCIfvQfeE_98iB' },
        { url: '/_next/static/chunks/519-b2f863cc0f8cbf0c.js', revision: 'kELkUXzQCIfvQfeE_98iB' },
        { url: '/_next/static/chunks/575-fcb2ae3fda174ca0.js', revision: 'kELkUXzQCIfvQfeE_98iB' },
        { url: '/_next/static/chunks/666-ac6c602824ec1468.js', revision: 'kELkUXzQCIfvQfeE_98iB' },
        { url: '/_next/static/chunks/684-5ce15db55a7ed8e0.js', revision: 'kELkUXzQCIfvQfeE_98iB' },
        { url: '/_next/static/chunks/737-6dd3d7b84b6178cd.js', revision: 'kELkUXzQCIfvQfeE_98iB' },
        { url: '/_next/static/chunks/9.ec8aa45714b50d21.js', revision: 'ec8aa45714b50d21' },
        { url: '/_next/static/chunks/964-59db6628af0194a5.js', revision: 'kELkUXzQCIfvQfeE_98iB' },
        { url: '/_next/static/chunks/app/_not-found/page-e00655ef4ca2f9a0.js', revision: 'kELkUXzQCIfvQfeE_98iB' },
        { url: '/_next/static/chunks/app/api/diagnose/route-6b50c1d008a77472.js', revision: 'kELkUXzQCIfvQfeE_98iB' },
        { url: '/_next/static/chunks/app/billing/page-34c5c269f96a3990.js', revision: 'kELkUXzQCIfvQfeE_98iB' },
        { url: '/_next/static/chunks/app/diagnosis/page-0702443cbf2cc67d.js', revision: 'kELkUXzQCIfvQfeE_98iB' },
        { url: '/_next/static/chunks/app/layout-4526f07ff770bbe6.js', revision: 'kELkUXzQCIfvQfeE_98iB' },
        { url: '/_next/static/chunks/app/page-611504afbf97f5e8.js', revision: 'kELkUXzQCIfvQfeE_98iB' },
        { url: '/_next/static/chunks/app/profiles/page-0e7709030a07b8e1.js', revision: 'kELkUXzQCIfvQfeE_98iB' },
        { url: '/_next/static/chunks/b536a0f1-30987831789c58d1.js', revision: 'kELkUXzQCIfvQfeE_98iB' },
        { url: '/_next/static/chunks/bc9e92e6-e378eb50d98fa0f5.js', revision: 'kELkUXzQCIfvQfeE_98iB' },
        { url: '/_next/static/chunks/bd904a5c-89b5b18766bdaebf.js', revision: 'kELkUXzQCIfvQfeE_98iB' },
        { url: '/_next/static/chunks/framework-17e4362dfeb1e631.js', revision: 'kELkUXzQCIfvQfeE_98iB' },
        { url: '/_next/static/chunks/main-app-9f4f66c0efa5e0b9.js', revision: 'kELkUXzQCIfvQfeE_98iB' },
        { url: '/_next/static/chunks/main-e5c73848aa198b30.js', revision: 'kELkUXzQCIfvQfeE_98iB' },
        { url: '/_next/static/chunks/pages/_app-da15c11dea942c36.js', revision: 'kELkUXzQCIfvQfeE_98iB' },
        { url: '/_next/static/chunks/pages/_error-cc3f077a18ea1793.js', revision: 'kELkUXzQCIfvQfeE_98iB' },
        { url: '/_next/static/chunks/polyfills-42372ed130431b0a.js', revision: '846118c33b2c0e922d7b3a7676f81f6f' },
        { url: '/_next/static/chunks/webpack-4515b355f6cd26f6.js', revision: 'kELkUXzQCIfvQfeE_98iB' },
        { url: '/_next/static/css/081a0afca5a9bd20.css', revision: '081a0afca5a9bd20' },
        { url: '/_next/static/css/384f91f4889626f9.css', revision: '384f91f4889626f9' },
        { url: '/_next/static/kELkUXzQCIfvQfeE_98iB/_buildManifest.js', revision: 'd48022bb25b6858539e5d1f8ccd656e8' },
        { url: '/_next/static/kELkUXzQCIfvQfeE_98iB/_ssgManifest.js', revision: 'b6652df95db52feb4daf4eca35380933' },
        { url: '/_next/static/media/19cfc7226ec3afaa-s.woff2', revision: '9dda5cfc9a46f256d0e131bb535e46f8' },
        { url: '/_next/static/media/21350d82a1f187e9-s.woff2', revision: '4e2553027f1d60eff32898367dd4d541' },
        { url: '/_next/static/media/8e9860b6e62d6359-s.woff2', revision: '01ba6c2a184b8cba08b0d57167664d75' },
        { url: '/_next/static/media/ba9851c3c22cd980-s.woff2', revision: '9e494903d6b0ffec1a1e14d34427d44d' },
        { url: '/_next/static/media/c5fe6dc8356a8c31-s.woff2', revision: '027a89e9ab733a145db70f09b8a18b42' },
        { url: '/_next/static/media/df0a9ae256c0569c-s.woff2', revision: 'd54db44de5ccb18886ece2fda72bdfe0' },
        { url: '/_next/static/media/e4af272ccee01ff0-s.p.woff2', revision: '65850a373e258f1c897a2b3d75eb74de' },
        { url: '/ai.webp', revision: '5e3e6457bc791a328b0d2876781932f0' },
        { url: '/apple-touch-icon.webp', revision: 'f281b2cfceaf76c747bc3ba68faa8972' },
        { url: '/doc.webp', revision: '5f5842162a7702a0e581d298ca95551d' },
        { url: '/favicon-16x16.webp', revision: 'f8d945469a8b9fa6cecd99d37b0b9a8c' },
        { url: '/favicon-32x32.webp', revision: '499626ee4fbb5061c106618deea8fa8a' },
        { url: '/icon-192x192.png', revision: 'fb3fa8a55c842b83efa15c749f0ee82f' },
        { url: '/icon-512x512.png', revision: 'f9d2cd939ce05e583b4c129829e57681' },
        { url: '/images/age_icons/adolescent.webp', revision: '8fef3721a54196461a323b40bdd96545' },
        { url: '/images/age_icons/infant.webp', revision: '367edf2fcd50f14a95dd5f9b5d97a2a8' },
        { url: '/images/age_icons/middleageadult.webp', revision: '9535fe792881e165e07e4d5aba22cc73' },
        { url: '/images/age_icons/olderadult.webp', revision: '9ab8e6aa507e211d8c97ad4bfd3387d3' },
        { url: '/images/age_icons/preschooler.webp', revision: '277f96c4db4694434e4603265386ac63' },
        { url: '/images/age_icons/schoolage.webp', revision: 'f3399484474b7674b1c08994ada89e9a' },
        { url: '/images/age_icons/toddler.webp', revision: 'b674def53bd4d27a3c3bb85269dc44c7' },
        { url: '/images/age_icons/youngadult.webp', revision: 'f6a3184c5c31ec4fe44b972d09876853' },
        { url: '/manifest.json', revision: 'b90f895fc8c0b8855a892fa59d8b5d7c' },
        { url: '/models/README.md', revision: 'f5b96bf2b36b4850c03d961609591365' },
        { url: '/models/app_icon.glb', revision: 'd63705ee2d2f2bc7d066a58e254c7d45' },
        { url: '/models/female_anatomy.glb', revision: 'a52dd7cf9b0d722be4cc40c68ccdc619' },
        { url: '/models/female_walking.glb', revision: 'c51d2c409ebc1ff453deb4620ddc6a64' },
        { url: '/models/male_anatomy.glb', revision: '78443f3bb1898b4e9048ea4a032c699c' },
        { url: '/models/male_walking.glb', revision: 'd7260c2c39345214c652e8f9d5a54e5e' },
      ],
      { ignoreURLParametersMatching: [] }
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      '/',
      new e.NetworkFirst({
        cacheName: 'start-url',
        plugins: [
          {
            cacheWillUpdate: async ({ request: e, response: s, event: i, state: a }) =>
              s && 'opaqueredirect' === s.type
                ? new Response(s.body, { status: 200, statusText: 'OK', headers: s.headers })
                : s,
          },
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      new e.CacheFirst({
        cacheName: 'google-fonts-webfonts',
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      new e.StaleWhileRevalidate({
        cacheName: 'google-fonts-stylesheets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-font-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-image-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-image',
        plugins: [new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:mp3|wav|ogg)$/i,
      new e.CacheFirst({
        cacheName: 'static-audio-assets',
        plugins: [new e.RangeRequestsPlugin(), new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:mp4)$/i,
      new e.CacheFirst({
        cacheName: 'static-video-assets',
        plugins: [new e.RangeRequestsPlugin(), new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:js)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-js-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:css|less)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-style-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-data',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:json|xml|csv)$/i,
      new e.NetworkFirst({
        cacheName: 'static-data-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        const s = e.pathname;
        return !s.startsWith('/api/auth/') && !!s.startsWith('/api/');
      },
      new e.NetworkFirst({
        cacheName: 'apis',
        networkTimeoutSeconds: 10,
        plugins: [new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        return !e.pathname.startsWith('/api/');
      },
      new e.NetworkFirst({
        cacheName: 'others',
        networkTimeoutSeconds: 10,
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ url: e }) => !(self.origin === e.origin),
      new e.NetworkFirst({
        cacheName: 'cross-origin',
        networkTimeoutSeconds: 10,
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 })],
      }),
      'GET'
    );
});
