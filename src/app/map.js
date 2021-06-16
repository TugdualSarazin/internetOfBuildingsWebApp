//----------------------------------------------------------------------------------
// MAP HANDLER
//----------------------------------------------------------------------------------

//***---- IMPORTS ----***//
import { populateLayers } from './main.js';
import * as FileHandler from './fileHandler.js'
//import GeoIndex from './../data/sampleFile.json'

//#region VARIABLES
const accessToken = process.env.ACCESS_TOKEN;
const masterToken = process.env.MASTER_TOKEN;
const mapboxUser = process.env.USER;

const coordinates = document.getElementById("coordinates");
//export const geocoderBar = document.querySelector("#geocoder");
export let uiJsondata='' ; 

let loadedMap = true;

let x = 0;
let y = 0;

const buildings = {
    "name": "3D_Buildings", 
    "mapID": "mapbox.mapbox-streets-v8",
    "mapboxSrc": ["building"],   
    "type": "polygon",
    "representation": "3D",         
    "interpolation": false, 
    "paint": {
        "property": "height", 
        "stops": [
            [
                100,
                '#4a4a4a' 
            ],
        ],
        "extrusion-height": "height",           
        "extrusion-opacity": 1
    },
    "uuid":uuidv4()
}
//#endregion

//#region MAP INIT
const defaultStyle = 'mapbox://styles/internetofbuildings2021/ckpedknie05ji18o0vu8z2tna'; //mapbox://styles/internetofbuildings2021/ckp8ftgd94x4f18pvy1vm1rof';

mapboxgl.accessToken = accessToken;
var map = new mapboxgl.Map({
    container: 'map', // Container ID
    style: defaultStyle,
    // Map style to use
    center: [2.20432, 41.40028], // Starting position [lng, lat]
    zoom: 15, // Starting zoom level
    preserveDrawingBuffer: true,
    language: 'en-EN',
    attributionControl: false    
});

//---------------- Geocoder  ---------------//
// var geocoder = new MapboxGeocoder({ // Initialize the geocoder
//     accessToken: mapboxgl.accessToken, // Set the access token
//     mapboxgl: mapboxgl, // Set the mapbox-gl instance
//     marker: false, // Do not use the default marker style
//     placeholder: 'Search for a place', // Placeholder text for the search bar
//     language: 'en',
//     limit: 5,
//     zoom: 15

// });

// Add the geocoder to the map
//map.addControl(geocoder);
map.addControl(new mapboxgl.ScaleControl(), 'bottom-right');
// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());
map.addControl(new mapboxgl.AttributionControl({
    compact: true
}));
// document.getElementById('geocoder').appendChild(geocoder.onAdd(map));

// After the map style has loaded on the page,
// add a source layer and default styling for a single point
map.on('load', function () {
    resizeMap();

    map.addSource('single-point', {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: []
        }
    });

    // Listen for the `result` event from the Geocoder
    // `result` event is triggered when a user makes a selection
    // geocoder.on('result', function (ev) {
    //     map.getSource('single-point').setData(ev.result.geometry);
    // });

    //---------------- Set map language
    map.setLayoutProperty('country-label', 'text-field', [
        'get',
        'name_en'
    ]);
    map.setLayoutProperty('state-label', 'text-field', [
        'get',
        'name_en'
    ]);

    //add 3d buildings
    addVectorLayer(buildings, 'visible')
});

map.on('mousemove', function (e) {
    if (loadedMap == false) {
        map.scrollZoom.disable();
        map.dragPan.disable();
    }
});

//---------------- Draw ---------------//
var draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
        polygon: true,
        trash: false
    }
});


//---------------- Get Mouse Coordinates ---------------//
document.onmousemove = function (e) {
    e = e || window.event;
    x = e.clientX;
    y = e.clientY;
};
//#endregion

//#region MAP LAYERS 
//---------------- Functions to add layers  ---------------//
/**
 * Read all settings files
 */
export function initialiseGeodataUIJson() {
    uiJsondata = FileHandler.getAllSettingsFiles();
    populateLayers(uiJsondata);
}
/**
 * Add a raster layer on map
 * @param {Object} datalayer 
 * @param {String} visibility 
 */
export function addRasterLayer(datalayer, visibility = 'none') {   
    const labelLayerId = getTopLevelLayers();
   
    map.addLayer({
        "id": datalayer.uuid,
        "source": {
            "type": "raster",
            "url": "mapbox://" + datalayer.mapID
        },
        "type": "raster",
        'layout': {
            'visibility': visibility
        },
    }, labelLayerId);
}
/**
 * Add a point layer on map
 * @param {Object} datalayer 
 * @param {String} visibility 
 */
export function addPointLayer(datalayer, visibility = 'none') {
    const labelLayerId = getTopLevelLayers();
    switch (datalayer.type) {
        case 'point':
            let colours = ['match', ['get', datalayer.paint.property]]
            for (let stop of datalayer.paint.stops) {
                colours.push(stop[0])
                colours.push(stop[1])
            }
            colours.push('#ccc')/* other */

            map.addLayer({
                "id": datalayer.uuid,
                "source": {
                    "type": "vector",
                    "url": "mapbox://" + datalayer.mapID
                },
                "type": "circle",
                'source-layer': datalayer.mapboxSrc[0],
                'layout': {
                    'visibility': visibility
                },
                'paint': {
                    'circle-radius': {
                        'base': 1.75,
                        'stops': [
                            [6, 2],
                            [8, 10],
                            [22, 180]
                        ]
                    },
                    'circle-color': colours
                }
            }, labelLayerId);

            if (datalayer.interactable && datalayer.interactable.status)  displayPopupOnClick(datalayer);
            break;

        case 'heatmap':
            map.addLayer({
                id: datalayer.uuid,
                type: 'heatmap',
                source: {
                    "type": "vector",
                    "url": "mapbox://" + datalayer.mapID
                },
                'source-layer': datalayer.mapboxSrc[0],

                "paint": {
                    'heatmap-color': datalayer.paint.colours,
                    // Adjust the heatmap radius by zoom level
                    'heatmap-radius': datalayer.paint.radius
                },
                'layout': {
                    'visibility': visibility
                }
            }, labelLayerId);


            break;

        default:
            break;
    }
}
/**
 * Add a polygon layer on map
 * @param {Object} datalayer 
 * @param {String} visibility 
 */
export function addVectorLayer(datalayer, visibility = "none") {
    const labelLayerId = getTopLevelLayers();

    switch (datalayer.representation) {
        case '2D':
            //set opacity
            let paint2d = {
                'fill-opacity': (datalayer.paint.opacity) ? datalayer.paint.opacity : 1
            }
            //set up paint based on interpolation
            if (datalayer.interpolation) {
                paint2d['fill-color'] = [
                    "interpolate",
                    ["linear"],
                    ["get", datalayer.paint.property]
                ]
                for (let stop of datalayer.paint.stops) {
                    paint2d["fill-color"].push(stop[0])
                    paint2d["fill-color"].push(["to-color", stop[1]])
                }
            }
            else {
                paint2d['fill-color'] = [
                    'match',
                    ['get', datalayer.paint.property]
                ]
                for (let stop of datalayer.paint.stops) {
                    paint2d["fill-color"].push(stop[0])
                    paint2d["fill-color"].push(stop[1])
                }
                paint2d["fill-color"].push('#ccc')/* other */
            }
            map.addLayer(
                {
                    'id': datalayer.uuid,
                    // 'source': 'composite',
                    'source': {
                        "type": "vector",
                        "url": "mapbox://" + datalayer.mapID
                    },
                    'source-layer': datalayer.mapboxSrc[0],
                    'type': 'fill',
                    'layout': {
                        'visibility': visibility
                    },
                    'paint': paint2d
                },
                labelLayerId
            );
           
            break;
        case '3D':
            let paint = {
                "fill-extrusion-height": ["get", datalayer.paint["extrusion-height"]],
                "fill-extrusion-base": ["interpolate",
                    ["linear"],
                    ["zoom"],
                    8,
                    0,
                    10.05,
                    1
                ],
                "fill-extrusion-opacity": datalayer.paint["extrusion-opacity"]
            }

            //set up paint based on interpolation
            if (datalayer.interpolation) {
                paint["fill-extrusion-color"] = [
                    "interpolate",
                    ["linear"],
                    ["get", datalayer.paint.property]
                ];
                for (let stop of datalayer.paint.stops) {
                    paint["fill-extrusion-color"].push(stop[0])
                    paint["fill-extrusion-color"].push(["to-color", stop[1]])
                }
            }
            else {
                paint["fill-extrusion-color"] = {
                    "property": datalayer.paint.property,
                    "stops": []
                }
                for (let stop of datalayer.paint.stops) {
                    paint["fill-extrusion-color"].stops.push([stop[0], stop[1]])
                }
            }

            map.addLayer(
                {
                    'id': datalayer.uuid,
                    // 'source': 'composite',
                    'source': {
                        "type": "vector",
                        "url": "mapbox://" + datalayer.mapID
                    },
                    'source-layer': datalayer.mapboxSrc[0],
                    'filter': ['==', 'extrude', 'true'],
                    'type': 'fill-extrusion',
                    'layout': {
                        'visibility': visibility
                    },
                    'paint': paint
                },
                labelLayerId // Insert the layer beneath any symbol layer.
            );
            break;



        default:
            break;
    }

    if (datalayer.interactable && datalayer.interactable.status) displayPopupOnClick(datalayer);
}
/**
 * Add a lineString layer on map
 * @param {Object} datalayer 
 * @param {String} visibility 
 */
export function addLineLayer(datalayer, visibility = "none") {
    const labelLayerId = getTopLevelLayers();
    let paint = {
        'line-width': 3,
        'line-color': []
    }
    if (datalayer.interpolation) {
        paint['line-color'] = [
            "interpolate",
            ["linear"],
            ['get', datalayer.paint.property]]

        for (let stop of datalayer.paint.stops) {
            paint["line-color"].push(stop[0])
            paint["line-color"].push(["to-color", stop[1]])
        }
    } else {
        paint['line-color'] = [
            'match',
            ['get', datalayer.paint.property]
        ]
        for (let stop of datalayer.paint.stops) {
            paint["line-color"].push(stop[0])
            paint["line-color"].push(stop[1])
        }
        paint["line-color"].push('#ccc')/* other */
    }
    

    map.addLayer({
        'id': datalayer.uuid,
        'type': 'line',
        "source": {
            "type": "vector",
            "url": "mapbox://" + datalayer.mapID
        },
        'source-layer': datalayer.mapboxSrc[0],
        'layout': {
            "visibility": visibility,
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': paint,
    }, labelLayerId);

}

/**
 *  Open Data layer
 * @param {String} selectedLayer 
 */
export function openLayer(selectedLayer) {
    map.setLayoutProperty(selectedLayer, 'visibility', 'visible');
    let layer = uiJsondata.find(x => x.uuid == selectedLayer)
    if (layer) zoomToLayer(layer);
}

/**
 * Close Data layer 
 * @param {String} selectedLayer 
 */
export function closeLayer(selectedLayer) {
    map.setLayoutProperty(selectedLayer, 'visibility', 'none');
}

function getTopLevelLayers(){
    const layers = map.getStyle().layers;
    let labelLayerIds;
    for(let layer of layers){
        if ((layer.type === 'symbol' && layer.layout['text-field']) || layer.id==buildings.uuid){
            labelLayerIds=layer.id
            break
        }
    }   
    return labelLayerIds
}

//#endregion

//#region MAP UTILITIES
function reLoadMap() {
    //------ geocoder source anchor ------//
    map.addSource('single-point', {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: []
        }
    });
}

/**
 * Resize Map
 */
function resizeMap() {
    //-- resize map to fix mapbox bug --//
    // let mapCanvas = document.getElementsByClassName('mapboxgl-canvas')[0];
    // mapCanvas.style.width = '100%';
    map.resize();
}

/**
 * Get element under cursor
 * @returns {HTMLElement} element at mouse position
 */
function elementAtMousePosition() {
    return document.elementFromPoint(x, y);
}

/**
 * Zoom to layer
 * @param {Object} datalayer 
 */
function zoomToLayer(datalayer) {
    switch (datalayer.scale) {
        case "detailed":
            map.flyTo({
                zoom: 16,
                speed: 0.4
            })
            break;
        case "large":
            map.flyTo({
                zoom: 12,
                speed: 0.4
            })
            break;

        default:
            break;
    }
}
/**
 * Spawn a confirm popup
 * @param {String} message 
 * @returns 
 */
function confirmPopup(message) {
    var txt;
    if (confirm(message)) {
        txt = "ok";
    } else {
        txt = "cancel";
    }
    return txt;
}
//#endregion

//#region MAP INTERACTIVITY
/**
 * Display a popup on click
 * @param {Object} layer 
 */
function displayPopupOnClick(layer) {
    map.on('click', layer.uuid, function (e) {
        var coordinates = e.features[0].geometry.coordinates.slice();
        //var description = e.features[0].properties.country;
        let features = map.queryRenderedFeatures(e.point);
        //console.log(features);
        let displayinfoText = document.createElement("div");
        for (let key in features[0].properties) {
            let line = document.createElement("p");            
            line.innerText = key + " : " + features[0].properties[key];
            displayinfoText.appendChild(line);
        }

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        let popup = new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            // .setHTML(JSON.stringify(features, null, 2))
            .setHTML(layer.interactable.text)
            .addTo(map);
        popup._content.appendChild(displayinfoText);
    });

    // Change the cursor to a pointer when the mouse is over the places layer.
    map.on('mouseenter', layer.uuid, function () {
        map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', layer.uuid, function () {
        map.getCanvas().style.cursor = '';
    });
}
//#endregion



