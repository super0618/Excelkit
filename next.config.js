const { withSentryConfig } = require('@sentry/nextjs'); // eslint-disable-line
const EmbeddablesCompilerPlugin = require('./embeddables/webpackCompilerPlugin'); // eslint-disable-line

const PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || '';

// For all available options, see:
// https://github.com/getsentry/sentry-webpack-plugin#options.
const SENTRY_OPTIONS = {
  silent: true, // suppress all logs
};

module.exports = (nextConfig) => {
  // Configure base url for embeddable
  const publicRuntimeConfig = nextConfig.publicRuntimeConfig || {
    PUBLIC_BASE_URL: '',
  };
  publicRuntimeConfig.PUBLIC_BASE_URL = PUBLIC_BASE_URL || '';

  const configuration = {
    ...nextConfig,
    publicRuntimeConfig,
    reactStrictMode: true,
    webpack: (webpackConfig, options) => {
      const { isServer, webpack } = options;

      if (typeof nextConfig.webpack === 'function') {
        webpackConfig = nextConfig.webpack(webpackConfig, options);
      }

      // Fix issue with Univer Sheets deps
      // https://stackoverflow.com/questions/67478532/module-not-found-cant-resolve-fs-nextjs/67478653#answer-67478653
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        fs: false,
      };

      // TODO deprecate
      webpackConfig.module.rules.push({
        test: /\.md$/,
        loader: 'frontmatter-markdown-loader',
      });

      // Do build widgets only during frontend build. NextJS does two builds, one for frontend, one for backend.
      if (isServer) {
        return webpackConfig;
      }

      return {
        ...webpackConfig,
        plugins: [
          ...webpackConfig.plugins,
          new EmbeddablesCompilerPlugin(
            publicRuntimeConfig,
            webpackConfig,
            webpack
          ),
        ],
      };
    },
  };

  return withSentryConfig(configuration, SENTRY_OPTIONS);
};
