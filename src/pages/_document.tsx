import Document, { Html, Head, Main, NextScript } from 'next/document';
import googleFonts from '@/config/googleFonts';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link href={googleFonts.url} rel="stylesheet"></link>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
