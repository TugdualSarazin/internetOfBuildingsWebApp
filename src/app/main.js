//----------------------------------------------------------------------------------
// MAIN UI INTERACTIONS HANDLER
//----------------------------------------------------------------------------------

//***---- IMPORTS ----***//
import * as Map from "./map.js";
import * as UT from "./utilities.js";
import { importAllImages } from "./fileHandler.js"


//#region VARIABLES

//***---- Action buttons ----***//
export const dataLayersBtn = document.querySelector("#buttonLayerPanel");
export const challengeBtn = document.querySelector("#buttonChallenge");
export const methodologyBtn = document.querySelector("#buttonMethodology");
export const proposalBtn = document.querySelector("#buttonProposal");
export const menuBtn = document.querySelector("#menu-button");
//***---- Datalayers ----***//
const dataLayerPanel = document.getElementById("dataLayers");
const legend = document.getElementById("legend");
const temp = document.getElementById("data-layer-template");
const legendTemp = document.querySelector("#legend-template");
export let selectedLayer;
const driveImages = importAllImages(require.context('./../images/driveImages', false, /\.(png|jpe?g|svg)$/));
console.log(driveImages)

//#endregion

//#region ACTION BUTTONS
//*** event listerners ***///
dataLayersBtn.addEventListener("click", function () {
  dataLayerPanel.classList.toggle("hidden");
});

methodologyBtn.addEventListener("click", function () {
  closeAllOverlays()
  document.querySelector("#methodology").classList.remove("hidden");
});

challengeBtn.addEventListener("click", function () {
  closeAllOverlays()
  document.querySelector("#challenge").classList.remove("hidden");
});

proposalBtn.addEventListener("click", function () {
  closeAllOverlays()
  document.querySelector("#proposal").classList.remove("hidden");
});

menuBtn.addEventListener("click", function () {
  var x = document.querySelector(".left-side-container");
  if (x.style.visibility === "hidden") {
    x.style.visibility = "visible";
  } else {
    x.style.visibility = "hidden";
  }
})
//#endregion

//#region DATA LAYERS
/**
 * Spawn UI toggles based on a template
 * @param {Object} data 
 */
export function populateLayers(data) {
  data.forEach(cluster => {
    cluster.uuid = uuidv4();
    addClusterToDropdown(cluster);
    const clusterGroup = document.createElement('ul');
    clusterGroup.id = cluster.uuid;
    clusterGroup.classList.add('cluster');
    clusterGroup.classList.add('hidden');
    dataLayerPanel.appendChild(clusterGroup)
    cluster.layers.forEach((layer, i) => {
      layer.uuid = uuidv4();
      if (layer.sublayers) {
        let parentLayer = createParentLayer(layer, clusterGroup)
        layer.sublayers.forEach(sublayer => {
          sublayer.uuid = uuidv4()
          addLayerToInterface(sublayer, parentLayer);
        })
      }
      else addLayerToInterface(layer, clusterGroup);
    });
  })
}

/**
 * Add the cluster as an option to the dropdown List
 * @param {String} clusterName 
 * @param {String} uuid 
 */
function addClusterToDropdown(clusterData) {
  const cluster = document.createElement('a');
  cluster.innerText = clusterData.group;
  cluster.style.width = document.querySelector('.dropbtn').clientWidth - 33 + "px"
  document.querySelector('.dropdown-content').appendChild(cluster);
  cluster.addEventListener("click", () => {
    closeAllLayers();
    closeAllOverlays()
    UT.clearList(legend);
    [...dataLayerPanel.querySelectorAll(".cluster")].map(x => x.classList.add("hidden"))
    document.getElementById(clusterData.uuid).classList.remove("hidden");
    document.querySelector('.dropbtn').innerHTML = `${clusterData.group}  <i class="fa fa-caret-down"></i>`;
    generateOverlays(clusterData)
  })
}

/**
 * Generate layer in the first level of hierarchy
 * @param {Object} datalayer 
 * @param {HTMLElement} parent 
 * @returns {HTMLElement} parent of sublayers
 */
function createParentLayer(datalayer, parent) {
  const clone = temp.content.cloneNode(true);
  clone.id = datalayer.name + "-template";
  const toggle = clone.querySelector("#layer-id");
  toggle.id = datalayer.uuid;

  let label = clone.getElementById("label");
  label.htmlFor = datalayer.uuid;
  label.textContent = datalayer.name.replace(/_/g, " ");
  label.setAttribute("title", datalayer.description);

  let link = clone.querySelector("#layer-link");
  if (datalayer.source && datalayer.source!="N/A") link.href = datalayer.source;
  else link.classList.add("hidden")

  let sublayersParent = document.createElement("ul")
  sublayersParent.classList.add("sublayers")
  sublayersParent.classList.add("hidden")

  let item = clone.querySelector("li")
  item.appendChild(sublayersParent)

  parent.appendChild(clone);

  toggle.addEventListener("click", () => {
    if (toggle.checked) sublayersParent.classList.remove("hidden")
    else sublayersParent.classList.add("hidden")
  })

  return sublayersParent;
}
/**
 * Generate layer in the second level of hierarchy
 * @param {Object} datalayer 
 * @param {HTMLElement} parent 
 */
function addLayerToInterface(datalayer, parent) {
  const clone = temp.content.cloneNode(true);
  clone.id = datalayer.name + "-template";
  const toggle = clone.querySelector("#layer-id");
  toggle.classList.add("map-layer")
  toggle.id = datalayer.uuid;

  let label = clone.getElementById("label");
  label.htmlFor = datalayer.uuid;
  label.textContent = datalayer.name.replace(/_/g, " ");
  label.setAttribute("title", datalayer.description);
  let link = clone.querySelector("#layer-link");

  if (datalayer.source && datalayer.source!="N/A")  link.href = datalayer.source;
  else link.classList.add("hidden")
  parent.appendChild(clone);

  toggle.addEventListener("click", function () {
    closeAllLayers()
    if (toggle.getAttribute("initialise") == "false") {
      if (datalayer.type == "raster") {
        Map.addRasterLayer(datalayer);
      } else if (datalayer.type == "point") {
        Map.addPointLayer(datalayer);
      } else if (datalayer.type == "polygon") {
        Map.addVectorLayer(datalayer);
      } else if (datalayer.type == "lineString") {
        Map.addLineLayer(datalayer);
      }
      toggle.setAttribute("initialise", "true");

    }

    if (toggle.getAttribute("state") == "on") {
      Map.closeLayer(toggle.id);
      toggle.setAttribute("state", "off");
      UT.clearList(legend);
    } else {

      if (selectedLayer != "") {
        // legend.classList.add("hidden");
      }

      Map.openLayer(toggle.id);

      selectedLayer = toggle.id;

      toggle.setAttribute("state", "on");
      //setup legend
      createLegend(datalayer);
    }
  });
}

/**
 * Turn off all active layers
 */
export function closeAllLayers() {
  //get only sublayers
  let layers = [...document.querySelectorAll(".map-layer")];
  for (let layer of layers) {

    if (layer && layer.checked) {
      layer.click();
      // layer.setAttribute("initialise", "false");
    }
  }
}
//#endregion

//#region LEGEND
/**
 * Generate a legend for the selected layer
 * @param {Object} layer 
 */
function createLegend(layer) {
  UT.clearList(legend);
  let legendClone = legendTemp.content.cloneNode(true);
  //add icon
  if (layer.icon) legendClone.querySelector("#icon").src = `images/${layer.icon}`;
  else legendClone.querySelector("#icon").classList.add("hidden")
  //title
  legendClone.querySelector("#layer-name").innerText = layer.name;
  //description
  legendClone.querySelector("#layer-description").innerText = layer.description;
  //units
  legendClone.querySelector("#units").innerText = layer.units;
  if (layer.units == "N/A") legendClone.querySelector("#units").classList.add("hidden") //hide if not applicable
  //colours - gradient
  let colourString = "";
  layer.legend.forEach((colour, i) => {
    if (i > 0 && layer.interpolation) colourString += `${layer.legend[i - 1].color} ${parseFloat(layer.legend[i - 1].stop)}%, ${colour.color} ${parseFloat(colour.stop)}%, `
    else colourString += `${colour.color} ${colour.stop}%, `
  });
  legendClone.querySelector(".gradient").style.background = `linear-gradient(to right, ${colourString.slice(0, -2)})`;
  console.log(`linear-gradient(to right, ${colourString.slice(0, -2)})`)
  //legend values
  //** TO DO: handle discrete values */
  legendClone.querySelector("#min").innerText = layer.legend[0].stop;
  legendClone.querySelector("#max").innerText = layer.legend[layer.legend.length - 1].stop;

  legend.appendChild(legendClone)
}
//#endregion

//#region OVERLAYS
/**
 * Populate overlay data for cluster
 * @param {Object} cluster 
 */
function generateOverlays(cluster) {
  const overlays = [...document.querySelectorAll('.overlay')]
  for (let overlay of overlays) {
    //set text
    overlay.querySelector('#overlay-description').innerText = cluster[overlay.id].description;
    //set image
    const imageContainer = overlay.querySelector('.image-container');
    imageContainer.style.backgroundImage = `url(images/${cluster[overlay.id].image})`
    imageContainer.style.backgroundPosition = 'center'
    imageContainer.style.backgroundSize = 'contain'
    imageContainer.style.backgroundRepeat = 'no-repeat'
  }
}

/**
 * Turn off all overlays
 */
function closeAllOverlays() {
  const overlays = [...document.querySelectorAll('.overlay')]
  overlays.map(x => x.classList.add('hidden'))
}
/**
 * Close overlay button setup
 */
setupCloseButtons()
function setupCloseButtons() {
  const xbtns = [...document.querySelectorAll('#close-overlay')]
  xbtns.map(x => {
    x.addEventListener("click", () => {
      x.parentElement.classList.add('hidden')
    })
  })
}
//#endregion