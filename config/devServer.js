module.exports = {
    port: 4444,
    host: '0.0.0.0',
    // historyApiFallback: { disableDotRule: true },
    compress: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
    watchOptions: {
        aggregateTimeout: 300,
        poll: 1000,
        ignored: /node_modules/
    }
}
