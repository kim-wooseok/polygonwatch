import screenfull from "https://cdn.jsdelivr.net/npm/screenfull@6.0.2/+esm";
import * as RENDERER from "./renderer.js";
import { loadTestData } from "./test.js";

function simplifyText(text) {
  if (text.length > 1000) {
    const begin = text.substring(0, 450);
    const mid = "\n\n... a long long text ...\n\n";
    const end = text.substring(text.length - 450);

    return begin + mid + end;
  }
  return text;
}

function simplifyArray(array) {
  let text = "";
  const lenth = 50;

  for (let i = 0; i < array.length && i < lenth; i += 1) {
    text += array[i];
    text += "\n";
  }

  if (array.length > lenth) {
    text += "\n... a long long text ...\n\n";

    for (let i = array.length - 50; i < array.length; i += 1) {
      text += array[i];
      text += "\n";
    }
  }

  return text;
}

function PrimitiveElements() {
  this.mode3D = $("#primitive3D").get(0);
  this.mode2D = $("#primitive2D").get(0);

  this.indices = $("#useIndices").get(0);
  this.normals = $("#useNormals").get(0);
  this.colors = $("#useColors").get(0);

  this.typePoints = $("#primitivePoints").get(0);
  this.typeLines = $("#primitiveLines").get(0);
  this.typeLineStrip = $("#primitiveLineStrip").get(0);
  this.typeTriangles = $("#primitiveTriangles").get(0);
  this.typeTriangleStrip = $("#primitiveTriangleStrip").get(0);
  this.typeTriangleFan = $("#primitiveTriangleFan").get(0);

  this.planeXY = $("#planeXY").get(0);
  this.planeYZ = $("#planeYZ").get(0);
  this.planeZX = $("#planeZX").get(0);

  this.verticesTextarea = $("#verticesTextarea").get(0);
  this.indicesTextarea = $("#indicesTextarea").get(0);
  this.normalsTextarea = $("#normalsTextarea").get(0);
  this.colorsTextarea = $("#colorsTextarea").get(0);

  this.verticesTextareaReg = $("#verticesTextareaReg").get(0);
  this.indicesTextareaReg = $("#indicesTextareaReg").get(0);
  this.normalsTextareaReg = $("#normalsTextareaReg").get(0);
  this.colorsTextareaReg = $("#colorsTextareaReg").get(0);

  this.objectTextarea = $("#objectTextarea").get(0);
}

function PrimitiveValues() {
  this.vertices = "";
  this.indices = "";
  this.normals = "";
  this.colors = "";

  this.verticesArray = {};
  this.indicesArray = {};
  this.normalsArray = {};
  this.colorsArray = {};

  this.verticesDim = 0;
  this.indicesDim = 0;

  this.clear = function _clear() {
    this.vertices = "";
    this.indices = "";
    this.normals = "";
    this.colors = "";

    this.verticesArray = {};
    this.indicesArray = {};
    this.normalsArray = {};
    this.colorsArray = {};

    this.verticesDim = 0;
    this.indicesDim = 0;
  };
}

class PrimitiveHelper {
  elements;

  values;

  constructor(_elements, _values) {
    this.elements = _elements;
    this.values = _values;
  }

  setVertices(text) {
    this.values.vertices = text;
    this.elements.verticesTextarea.value = simplifyText(text);
  }

  setIndices(text) {
    this.values.indices = text;
    this.elements.indicesTextarea.value = simplifyText(text);
  }

  setNormals(text) {
    this.values.normals = text;
    this.elements.normalsTextarea.value = simplifyText(text);
  }

  setColors(text) {
    this.values.colors = text;
    this.elements.colorsTextarea.value = simplifyText(text);
  }
}

function RegexElements() {
  this.regexSelect = $("#regexSelect").get(0);
}

function CanvasElements() {
  this.canvas = $("#gl-canvas").get(0);
  this.fullscreen = $("#svg-fullscreen").get(0);
  this.fullscreenExit = $("#svg-fullscreen-exit").get(0);
}

const primitiveElements = new PrimitiveElements();
const primitiveValues = new PrimitiveValues();
const primitiveHelper = new PrimitiveHelper(primitiveElements, primitiveValues);
const regexElements = new RegexElements();
const canvasElements = new CanvasElements();

let regexFormat;
let regexGroup;
let lastCustomFormat;
let lastCustomGroup;

const REGEX_VS =
  "(?:(?:x=|y=|z=|\\]|\\))\\s*([+-]?\\d*\\.?\\d*e?[+-]?\\d*\\d))";
const REGEX_VS_RELAXED = "(?:[=\\]\\)]\\s*([+-]?\\d*\\.?\\d*e?[+-]?\\d*\\d))";
const REGEX_NUMBER = "([+-]?\\d*\\.?\\d*e?[+-]?\\d*\\d)";

function parseValue(sourceText) {
  const re = new RegExp(regexFormat, "gm");
  const result = [];

  let matches = re.exec(sourceText);
  while (matches) {
    if (regexGroup < matches.length) {
      const value = matches[regexGroup];
      result.push(value);
    }
    matches = re.exec(sourceText);
  }

  return result;
}

function parseVertices() {
  const result = parseValue(primitiveValues.vertices);
  primitiveValues.verticesArray = result;
  primitiveElements.verticesTextareaReg.value = simplifyArray(result);
  return result;
}

function parseIndices() {
  const result = parseValue(primitiveValues.indices);
  primitiveValues.indicesArray = result;
  primitiveElements.indicesTextareaReg.value = simplifyArray(result);
  return result;
}

function parseNormals() {
  const result = parseValue(primitiveValues.normals);
  primitiveValues.normalsArray = result;
  primitiveElements.normalsTextareaReg.value = simplifyArray(result);
  return result;
}

function parseColors() {
  const result = parseValue(primitiveValues.colors);
  primitiveValues.colorsArray = result;
  primitiveElements.colorsTextareaReg.value = simplifyArray(result);
  return result;
}

function downloadCSV(v, dim, name) {
  let result = "";

  if (Array.isArray(v) === false || v.length < 1) {
    return;
  }

  result += v[0];
  for (let x = 1; x < dim; x += 1) {
    result += `, ${v[x]}`;
  }

  for (let y = dim; y < v.length; y += dim) {
    result += "\n";

    result += v[y];
    for (let x = y + 1; x < y + dim; x += 1) {
      result += `, ${v[x]}`;
    }
  }

  const blob = new Blob([result], { type: "text/csv;charset=utf-8" });
  // eslint-disable-next-line no-undef
  saveAs(blob, `${name}.csv`);
}

function setRegExp() {
  regexFormat = document.getElementById("regexFormat").value;
  regexGroup = document.getElementById("regexGroup").value;
}

$("#runButton").click(() => {
  let vertices;
  let indices;
  let normals;
  let colors;

  setRegExp();
  vertices = parseVertices();
  primitiveValues.verticesDim = 3;
  if (primitiveElements.mode2D.checked === true) {
    const vertices2D = [];
    for (let i = 0; i < vertices.length; i += 2) {
      vertices2D.push(vertices[i + 0]);
      vertices2D.push(vertices[i + 1]);
      vertices2D.push("0");
    }
    vertices = vertices2D;
    primitiveValues.verticesDim = 2;
  }

  if (primitiveElements.indices.checked === true) {
    indices = parseIndices();
  }
  if (primitiveElements.normals.checked === true) {
    normals = parseNormals();
  }
  if (primitiveElements.colors.checked === true) {
    colors = parseColors();
  }

  let primType = RENDERER.PRIMITIVE_TYPE.TRIANGLES;
  if (primitiveElements.typePoints.checked === true) {
    primType = RENDERER.PRIMITIVE_TYPE.POINTS;
    primitiveValues.indicesDim = 1;
  } else if (primitiveElements.typeLines.checked === true) {
    primType = RENDERER.PRIMITIVE_TYPE.LINES;
    primitiveValues.indicesDim = 2;
  } else if (primitiveElements.typeLineStrip.checked === true) {
    primType = RENDERER.PRIMITIVE_TYPE.LINESTRIP;
    primitiveValues.indicesDim = 2;
  } else if (primitiveElements.typeTriangles.checked === true) {
    primType = RENDERER.PRIMITIVE_TYPE.TRIANGLES;
    primitiveValues.indicesDim = 3;
  } else if (primitiveElements.typeTriangleStrip.checked === true) {
    primType = RENDERER.PRIMITIVE_TYPE.TRIANGLESTRIP;
    primitiveValues.indicesDim = 3;
  } else if (primitiveElements.typeTriangleFan.checked === true) {
    primType = RENDERER.PRIMITIVE_TYPE.TRIANGLEFAN;
    primitiveValues.indicesDim = 3;
  }

  // eslint-disable-next-line no-undef
  store.set("user", {
    dim: primitiveElements.mode2D.checked === true ? 2 : 3,
    hasIndices: primitiveElements.indices.checked === true,
    hasNormals: primitiveElements.normals.checked === true,
    hasColors: primitiveElements.colors.checked === true,
    primitiveType: primType,
    dataType: $("#regexSelect").val(),
  });

  const selected = $("#regexSelect").val();
  if (selected.startsWith("Custom")) {
    lastCustomFormat = regexFormat;
    lastCustomGroup = regexGroup;
    // eslint-disable-next-line no-undef
    store.set("user", {
      lastCustomFormat: regexFormat,
      lastCustomGroup: regexGroup,
    });
  }

  // Load
  RENDERER.loadUserMesh(vertices, indices, normals, colors, 3, primType);
  const fBoundingBoxStr = () => {
    const boundingBox = RENDERER.getBoundingBox();
    const boxCenter = RENDERER.getCenter();
    let str = `boundingBox(min(${boundingBox.min.x}, ${boundingBox.min.y}, ${boundingBox.min.z}), max(${boundingBox.max.x}, ${boundingBox.max.y}, ${boundingBox.max.z}))`;
    str += "\n";
    str += `center(${boxCenter.x}, ${boxCenter.y}, ${boxCenter.z})`;
    return str;
  };

  // After load
  primitiveElements.objectTextarea.value = fBoundingBoxStr();
});

$("#clearButton").click(() => {
  primitiveElements.verticesTextarea.value = "PASTE HERE";
  primitiveElements.verticesTextareaReg.value = "";

  primitiveElements.indicesTextarea.value = "PASTE HERE";
  primitiveElements.indicesTextareaReg.value = "";

  primitiveElements.normalsTextarea.value = "PASTE HERE";
  primitiveElements.normalsTextareaReg.value = "";

  primitiveElements.colorsTextarea.value = "PASTE HERE";
  primitiveElements.colorsTextareaReg.value = "";

  primitiveValues.clear();
});

$("#clearScene").click(() => {
  RENDERER.clearScene();
});

$("#testButton").click({ param1: primitiveHelper }, (e) => {
  loadTestData(e.data.param1);
});

$(document).ready(() => {
  $("#loadFilesButton").change((ev) => {
    RENDERER.loadCollada(ev.currentTarget.files);
  });
});

function onRegexSelectChanged() {
  const selected = $("#regexSelect").val();
  const format = document.getElementById("regexFormat");
  const group = document.getElementById("regexGroup");
  format.readOnly = true;
  group.readOnly = true;
  group.value = 1;

  if (selected.startsWith("Visual")) {
    format.value = REGEX_VS;
  } else if (selected.startsWith("Relaxed")) {
    format.value = REGEX_VS_RELAXED;
  } else if (selected.startsWith("Number")) {
    format.value = REGEX_NUMBER;
  } else if (selected.startsWith("Custom")) {
    if (lastCustomFormat !== undefined) {
      format.value = lastCustomFormat;
    } else {
      format.value = "";
    }
    if (lastCustomGroup !== undefined) {
      group.value = lastCustomGroup;
    } else {
      group.value = "";
    }
    format.readOnly = false;
    group.readOnly = false;
  }
}

$("#regexSelect").on("change", onRegexSelectChanged);

$("#primitive3D").change(() => {
  // primitiveElements.normals.disabled = false;
  // primitiveElements.typeTriangles.disabled = false;
});

$("#primitive2D").change(() => {
  // if (primitiveElements.normals.checked === true) {
  //   primitiveElements.normals.checked = false;
  // }
  // if (primitiveElements.typeTriangles.checked === true) {
  //   primitiveElements.typeLines.checked = true;
  // }
  // primitiveElements.normals.disabled = true;
  // primitiveElements.typeTriangles.disabled = true;
});

$("#planeXY").change(() => {
  RENDERER.changeBasePlane(RENDERER.PLANE.XY);
});

$("#planeYZ").change(() => {
  RENDERER.changeBasePlane(RENDERER.PLANE.YZ);
});

$("#planeZX").change(() => {
  RENDERER.changeBasePlane(RENDERER.PLANE.ZX);
});

$("#gl-gui-fullscreen").on("click", () => {
  if (screenfull.isEnabled) {
    screenfull.toggle(canvasElements.canvas);
  }
});

function textareaPasteEventListner(event) {
  const paste = (event.clipboardData || window.clipboardData).getData("text");

  const { target } = event;
  if (target === primitiveElements.verticesTextarea) {
    primitiveHelper.setVertices(paste);
  } else if (target === primitiveElements.indicesTextarea) {
    primitiveHelper.setIndices(paste);
  } else if (target === primitiveElements.normalsTextarea) {
    primitiveHelper.setNormals(paste);
  } else if (target === primitiveElements.colorsTextarea) {
    primitiveHelper.setColors(paste);
  }
  event.preventDefault();
  return true;
}

function loadCache() {
  // eslint-disable-next-line no-undef
  const userCache = store.get("user");
  if (userCache !== undefined) {
    if (userCache.dim === 2) {
      primitiveElements.mode2D.checked = true;
    } else {
      primitiveElements.mode3D.checked = true;
    }

    if (userCache.hasIndices === true) {
      primitiveElements.indices.checked = true;
    }
    if (userCache.hasNormals === true) {
      primitiveElements.normals.checked = true;
    }
    if (userCache.hasColors === true) {
      primitiveElements.colors.checked = true;
    }

    switch (userCache.primitiveType) {
      case RENDERER.PRIMITIVE_TYPE.POINTS:
        primitiveElements.typePoints.checked = true;
        break;
      case RENDERER.PRIMITIVE_TYPE.LINES:
        primitiveElements.typeLines.checked = true;
        break;
      case RENDERER.PRIMITIVE_TYPE.LINESTRIP:
        primitiveElements.typeLineStrip.checked = true;
        break;
      case RENDERER.PRIMITIVE_TYPE.TRIANGLES:
        primitiveElements.typeTriangles.checked = true;
        break;
      case RENDERER.PRIMITIVE_TYPE.TRIANGLESTRIP:
        primitiveElements.typeTriangleStrip.checked = true;
        break;
      case RENDERER.PRIMITIVE_TYPE.TRIANGLEFAN:
        primitiveElements.typeTriangleFan.checked = true;
        break;
      default:
        primitiveElements.typeTriangles.checked = true;
        break;
    }

    if (userCache.lastCustomFormat !== undefined) {
      lastCustomFormat = userCache.lastCustomFormat;
    }
    if (userCache.lastCustomGroup !== undefined) {
      lastCustomGroup = userCache.lastCustomGroup;
    }
    $("#regexSelect").val(userCache.dataType);
    if (regexElements.regexSelect.selectedIndex < 0) {
      regexElements.regexSelect.selectedIndex = 0;
    }
    onRegexSelectChanged();
  }
}

function enablePasteButton() {
  document.getElementById("verticesPaste").style.display = "initial";
  document.getElementById("indicesPaste").style.display = "initial";
  document.getElementById("normalsPaste").style.display = "initial";
  document.getElementById("colorsPaste").style.display = "initial";

  primitiveElements.verticesTextarea.readOnly = true;
  primitiveElements.indicesTextarea.readOnly = true;
  primitiveElements.normalsTextarea.readOnly = true;
  primitiveElements.colorsTextarea.readOnly = true;
}

function disablePasteButton() {
  document.getElementById("verticesPaste").style.display = "none";
  document.getElementById("indicesPaste").style.display = "none";
  document.getElementById("normalsPaste").style.display = "none";
  document.getElementById("colorsPaste").style.display = "none";

  primitiveElements.verticesTextarea.readOnly = false;
  primitiveElements.indicesTextarea.readOnly = false;
  primitiveElements.normalsTextarea.readOnly = false;
  primitiveElements.colorsTextarea.readOnly = false;
}

function primitivePaste(event) {
  let primitiveElement = null;
  let primitiveFunctionPrototype = null;

  if (event.target.id.startsWith("vertices")) {
    primitiveElement = primitiveHelper.elements.verticesTextarea;
    primitiveFunctionPrototype = PrimitiveHelper.prototype.setVertices;
  } else if (event.target.id.startsWith("indices")) {
    primitiveElement = primitiveHelper.elements.indicesTextarea;
    primitiveFunctionPrototype = PrimitiveHelper.prototype.setIndices;
  } else if (event.target.id.startsWith("normals")) {
    primitiveElement = primitiveHelper.elements.normalsTextarea;
    primitiveFunctionPrototype = PrimitiveHelper.prototype.setNormals;
  } else if (event.target.id.startsWith("colors")) {
    primitiveElement = primitiveHelper.elements.colorsTextarea;
    primitiveFunctionPrototype = PrimitiveHelper.prototype.setColors;
  }

  if (primitiveFunctionPrototype && primitiveElement) {
    primitiveElement.focus();

    navigator.clipboard
      .readText()
      .then((clipText) => {
        primitiveFunctionPrototype.call(primitiveHelper, clipText);
      })
      .catch(() => {
        disablePasteButton();
      });
  }

  event.preventDefault();
}

function primitiveSave(event) {
  let primitiveValue = null;
  let dim = 0;
  let name = "noname";

  if (event.target.id.startsWith("vertices")) {
    primitiveValue = primitiveValues.verticesArray;
    dim = primitiveValues.verticesDim;
    name = "vertices";
  } else if (event.target.id.startsWith("indices")) {
    primitiveValue = primitiveValues.indicesArray;
    dim = primitiveValues.indicesDim;
    name = "indices";
  } else if (event.target.id.startsWith("normals")) {
    primitiveValue = primitiveValues.normalsArray;
    dim = 3;
    name = "normals";
  } else if (event.target.id.startsWith("colors")) {
    primitiveValue = primitiveValues.colorsArray;
    dim = 3;
    name = "colors";
  }

  downloadCSV(primitiveValue, dim, name);

  event.preventDefault();
}

function checkClipboardPermission() {
  try {
    navigator.permissions.query({ name: "clipboard-read" }).then((result) => {
      if (result.state === "prompt") {
        navigator.clipboard.readText().then(() => {
          enablePasteButton();
        });
      } else if (result.state === "granted") {
        enablePasteButton();
      }
    });
  } catch (error) {
    disablePasteButton();
  }
}

export default function bodyInit() {
  checkClipboardPermission();

  primitiveElements.mode3D.checked = true;
  primitiveElements.typeTriangles.checked = true;
  primitiveElements.planeXY.checked = true;

  document
    .querySelector("#verticesPaste")
    .addEventListener("click", primitivePaste);
  document
    .querySelector("#indicesPaste")
    .addEventListener("click", primitivePaste);
  document
    .querySelector("#normalsPaste")
    .addEventListener("click", primitivePaste);
  document
    .querySelector("#colorsPaste")
    .addEventListener("click", primitivePaste);

  document
    .querySelector("#verticesSave")
    .addEventListener("click", primitiveSave);
  document
    .querySelector("#indicesSave")
    .addEventListener("click", primitiveSave);
  document
    .querySelector("#normalsSave")
    .addEventListener("click", primitiveSave);
  document
    .querySelector("#colorsSave")
    .addEventListener("click", primitiveSave);

  primitiveElements.verticesTextarea.addEventListener(
    "paste",
    textareaPasteEventListner
  );
  primitiveElements.indicesTextarea.addEventListener(
    "paste",
    textareaPasteEventListner
  );
  primitiveElements.normalsTextarea.addEventListener(
    "paste",
    textareaPasteEventListner
  );
  primitiveElements.colorsTextarea.addEventListener(
    "paste",
    textareaPasteEventListner
  );

  const el = document.getElementById("regexFormat");
  el.value = REGEX_VS;

  RENDERER.init();
  RENDERER.animate();

  screenfull.on("change", () => {
    if (screenfull.isFullscreen) {
      canvasElements.fullscreen.style.display = "none";
      canvasElements.fullscreenExit.style.display = "block";
    } else {
      canvasElements.fullscreen.style.display = "block";
      canvasElements.fullscreenExit.style.display = "none";
    }
    RENDERER.resetViewport();
  });

  loadCache();
}

export { bodyInit };
