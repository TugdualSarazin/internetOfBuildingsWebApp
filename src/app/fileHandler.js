export function getAllSettingsFiles() {
    var files = [];
    var req = require.context('./../data/settings/', true, /\.json$/);
    req.keys().forEach((filename) => {
        files.push(req(filename));
    });
    return files;
}

export function importAllImages(r) {
    let images = {};
    r.keys().map((item, index) => { images[item.replace('./', '')] = r(item); });
    return images;
}


