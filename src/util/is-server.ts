export default function isServer() {
    return process.env.IS_SERVER === 'true';
}

