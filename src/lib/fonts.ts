import localFont from "next/font/local";

// Font files can be colocated inside of `pages`
export const fontBase = localFont({
  src: "../assets/fonts/IRANSansWebFaNum-Light.woff2",
  variable: "--font-base",
});
export const fontMedium = localFont({
  src: "../assets/fonts/IRANSansWebFaNum-Medium.woff2",
  variable: "--font-medium",
});
export const fontHeading = localFont({
  src: "../assets/fonts/woff2/KalamehWebFaNum-Bold.woff2",
  variable: "--font-heading",
});
export const fontSemiHeading = localFont({
  src: "../assets/fonts/IRANSansWebFaNum-Light.woff2",
  variable: "--font-semiHeading",
});
