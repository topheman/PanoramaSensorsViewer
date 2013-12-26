require.config({
    baseUrl: "./js",
    // paths are analogous to old-school <script> tags, in order to reference js scripts
    paths: {
        //if you let the PanaramaManager require the google API for you, please specify the place of the async plugin (you can use your own if you already have it
        async: 'topheman-panorama/require.plugins/async'
    },
    // configure dependencies and export value aliases for old-school js scripts
    shim: {
    }
});