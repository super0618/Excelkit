import Head from 'next/head';
import { AppProps } from 'next/app';
import Script from 'next/script';
import getConfig from 'next/config';
import { FirebaseAppProvider } from 'reactfire';
import { AuthProvider } from 'hooks/useAuth';
import { TeamProvider } from 'hooks/useTeam';
import { ToastProvider } from 'hooks/useToast';
import { firebaseConfig } from 'config/firebase';
import envConfig from '@/config/environment';
import polyfills from '@/config/polyfills';
import useSilenceConsole from '@/hooks/useSilenceConsole';
import '../styles/app.scss';
import '../styles/local-app.scss';

const { publicRuntimeConfig } = getConfig();
const BASE_PATH = publicRuntimeConfig.PUBLIC_BASE_URL || '';
const IS_DEV_ENV = envConfig.isDevelopment;
const IS_STAGING_SITE = envConfig.isStaging;
const GTM_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID;
const GOOGLE_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GOOGLE_MEASUREMENT_ID;
const CONTAINER_QUERY_POLYFILL = polyfills.containerQueryPolyfillVarName;

export default function App({
  Component,
  pageProps,
  ...appProps
}: AppProps): JSX.Element {
  const { pathname } = appProps.router;
  const isWidgetBuild = pathname.search('/widget-templates') === 0;
  useSilenceConsole();

  // Invoker only providers necessary
  // for a 3rd party widget build
  if (isWidgetBuild) {
    return (
      <FirebaseAppProvider firebaseConfig={firebaseConfig}>
        {/* @ts-ignore */}
        <Component {...pageProps} />
      </FirebaseAppProvider>
    );
  }

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"
        />

        {/* Disable Indexing of Site */}
        {IS_STAGING_SITE && <meta name="robots" content="noindex,follow" />}

        {!IS_DEV_ENV && (
          <link rel="manifest" href={`${BASE_PATH}/manifest.json`} />
        )}
        <link
          rel="apple-touch-icon"
          href={`${BASE_PATH}/apple-touch-icon.png`}
        />
        <link
          rel="icon"
          type="image/png"
          href={`${BASE_PATH}/img/standalone-app/icon-72x72.png`}
        />

        <meta name="theme-color" content="#c1eaf2" />
      </Head>

      <FirebaseAppProvider firebaseConfig={firebaseConfig}>
        <AuthProvider>
          <TeamProvider>
            <ToastProvider>
              {/* @ts-ignore */}
              <Component {...pageProps} />
            </ToastProvider>
          </TeamProvider>
        </AuthProvider>
      </FirebaseAppProvider>

      {GTM_MEASUREMENT_ID && (
        <>
          <Script
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_MEASUREMENT_ID}');`,
            }}
          />
          <noscript
            dangerouslySetInnerHTML={{
              __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_MEASUREMENT_ID}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
            }}
          />
        </>
      )}

      {GOOGLE_MEASUREMENT_ID && (
        <Script
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];window.gtag = window.gtag || function gtag(){dataLayer.push(arguments);};gtag('js', new Date());gtag('config', '${GOOGLE_MEASUREMENT_ID}');`,
          }}
        />
      )}

      {/* Add Container Query Polyfill if
          unsupported and not yet requested */}
      <Script
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
if (!window['${CONTAINER_QUERY_POLYFILL}'] && 'container' in document.documentElement.style === false) {
  import('${polyfills.containerQueryPolyfillSrc}');
  window['${CONTAINER_QUERY_POLYFILL}'] = window['${CONTAINER_QUERY_POLYFILL}'] || true;
}`,
        }}
      />
    </>
  );
}
