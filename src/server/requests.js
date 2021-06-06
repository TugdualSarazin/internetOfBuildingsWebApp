const { Readable } = require('stream');


// --------------------------------------------------------------------------------------GET

/**
 * GET ONE FILE
 * @param {drive} drive An authorized OAuth2 client.
 * @param {string} fileId ID of the file in Google Drive
 */
async function getFile(drive, fileId, res) {
    drive.files.get({
        fileId,
        alt: 'media'
    },
        { responseType: 'stream' })
        .then(response => {

            response.data
                .on('data', chunk => {
                    res.write(chunk);
                })
                .on('end', () => {
                    res.end();
                })
                .on('error', err => {
                    res.sendStatus(404);
                })
        });
}

/**
 * GET MULTIPLE FILES
 * @param {drive} drive An authorized OAuth2 client.
 * @param {Array} fileIds array of IDs of the files in Google Drive
 */
async function getMultipleFiles(drive, fileIds){
    let files = [];

    for(fileId of fileIds){
        files.push(await getFile(drive, fileId));
    }

    return files;
}

/**
 * LIST FOLDER CONTENTS
 * @param {drive} drive An authorized OAuth2 client.
 * @param {string} folderId the id of the selected folder in Drive
 * @param {string} q query parameters. More info here https://developers.google.com/drive/api/v3/search-files
 * @param {Int16Array} pageSize the number of items that the array can have
 */
async function listFolderContents(drive, q, pageSize=100, fields = "*") {

    let folders = await drive.files.list({
        ...(pageSize && {pageSize}),
        fields: `nextPageToken, files(${fields})`,
        ...(q && {q})
    });

    return folders.data.files;
}

/**
 * GET ALL FILES CONTAINED IN A FOLDER
 * @param {drive} drive An authorized OAuth2 client.
 * @param {string} folderId the id of the selected folder in Drive
 */
async function getAllFolderContents(drive, folderId){
    const fileList = await listFolderContents(drive, `'${folderId}' in parents`);
    const fileIds = fileList.map(file => file.id);

    return await getMultipleFiles(drive, fileIds);
}


module.exports = {getFile, getMultipleFiles, listFolderContents, getAllFolderContents};