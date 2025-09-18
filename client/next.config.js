/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env:{
     NEXT_PUBLIC_ZEGO_APP_ID:368426768,
     NEXT_PUBLIC_ZEGO_SERVER_ID:"f3ee4ab1660c2edb6f246fa2214b7184"
  },
  images: {
    domains: ["localhost"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

module.exports = nextConfig;
