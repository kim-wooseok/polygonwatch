import * as RENDERER from "./renderer.js";
import { loadTestData } from "./test.js";

function simplyfyText(text) {
  if (text.length > 1000) {
    const begin = text.substring(0, 450);
    const mid = "\n\n... a long long text ...\n\n";
    const end = text.substring(text.length - 450);

    return begin + mid + end;
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
}

function PrimitiveValues() {
  this.vertices = "";
  this.indices = "";
  this.normals = "";
  this.colors = "";

  this.verticesReg = "";
  this.indicesReg = "";
  this.normalsReg = "";
  this.colorsReg = "";

  this.clear = function _clear() {
    this.vertices = "";
    this.indices = "";
    this.normals = "";
    this.colors = "";

    this.verticesReg = "";
    this.indicesReg = "";
    this.normalsReg = "";
    this.colorsReg = "";
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
    this.elements.verticesTextarea.value = simplyfyText(text);
  }

  setIndices(text) {
    this.values.indices = text;
    this.elements.indicesTextarea.value = simplyfyText(text);
  }

  setNormals(text) {
    this.values.normals = text;
    this.elements.normalsTextarea.value = simplyfyText(text);
  }

  setColors(text) {
    this.values.colors = text;
    this.elements.colorsTextarea.value = simplyfyText(text);
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

let screenfullRef;
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
  primitiveElements.verticesTextareaReg.value = simplyfyText(result);
  return result;
}

function parseIndices() {
  const result = parseValue(primitiveValues.indices);
  primitiveElements.indicesTextareaReg.value = simplyfyText(result);
  return result;
}

function parseNormals() {
  const result = parseValue(primitiveValues.normals);
  primitiveElements.normalsTextareaReg.value = simplyfyText(result);
  return result;
}

function parseColors() {
  const result = parseValue(primitiveValues.colors);
  primitiveElements.colorsTextareaReg.value = simplyfyText(result);
  return result;
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
  if (primitiveElements.mode2D.checked === true) {
    const vertices2D = [];
    for (let i = 0; i < vertices.length; i += 2) {
      vertices2D.push(vertices[i + 0]);
      vertices2D.push(vertices[i + 1]);
      vertices2D.push("0");
    }
    vertices = vertices2D;
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
  } else if (primitiveElements.typeLines.checked === true) {
    primType = RENDERER.PRIMITIVE_TYPE.LINES;
  } else if (primitiveElements.typeLineStrip.checked === true) {
    primType = RENDERER.PRIMITIVE_TYPE.LINESTRIP;
  } else if (primitiveElements.typeTriangles.checked === true) {
    primType = RENDERER.PRIMITIVE_TYPE.TRIANGLES;
  } else if (primitiveElements.typeTriangleStrip.checked === true) {
    primType = RENDERER.PRIMITIVE_TYPE.TRIANGLESTRIP;
  } else if (primitiveElements.typeTriangleFan.checked === true) {
    primType = RENDERER.PRIMITIVE_TYPE.TRIANGLEFAN;
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

  RENDERER.loadUserMesh(vertices, indices, normals, colors, 3, primType);
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

$("#testButton").click(() => {
  loadTestData(primitiveElements, primitiveValues);
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
  if (screenfullRef.isEnabled) {
    screenfullRef.toggle(canvasElements.canvas);
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

    navigator.permissions.query({ name: "clipboard-read" }).then((result) => {
      if (result.state === "granted" || result.state === "prompt") {
        navigator.clipboard.readText().then((clipText) => {
          primitiveFunctionPrototype.call(primitiveHelper, clipText);
        });
      }
    });
  }

  event.preventDefault();
}

export default function bodyInit(screenfullVar) {
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

  screenfullRef = screenfullVar;
  screenfullRef.on("change", () => {
    if (screenfullRef.isFullscreen) {
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
