/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',  // Static export for Electron
    images: {
        unoptimized: true, // Necessary for static export
    },
    trailingSlash: true, // Makes routes have trailing slashes
    reactStrictMode: true,
}

module.exports = nextConfig; 