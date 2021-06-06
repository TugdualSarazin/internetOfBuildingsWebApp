//----------------------------------------------------------------------------------
// UTILITIY FUNCTIONS
//----------------------------------------------------------------------------------

/**
 * Remove all items from a category
 * @param {HTMLElement} category 
 */
export function clearList(category) {
    if (category) {
        while (category.firstChild) {
            category.removeChild(category.firstChild);
        }
    }
}

/**
 * Download file
 * @param {String} filename 
 * @param {String} text 
 * @param {String} hreftype 
 */
function download(filename, text, hreftype) {
    var element = document.createElement('a');
    //element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('href', hreftype + text);
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

/**
 * Request confirmation before leaving the page
 */
// window.onbeforeunload = function(){
//     console.log("do sth before leaving page");     
//     return 'Are you sure you want to leave?';
// };