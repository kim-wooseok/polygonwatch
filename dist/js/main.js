import * as RENDERER from "./renderer.js";
import { loadTestData } from "./test.js";

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
}

function CanvasElements() {
  this.canvas = $("#gl-canvas").get(0);
  this.fullscreen = $("#svg-fullscreen").get(0);
  this.fullscreenExit = $("#svg-fullscreen-exit").get(0);
}

const primitiveElements = new PrimitiveElements();
const canvasElements = new CanvasElements();

let screenfullRef;
let regexFormat;
let regexGroup;

const REGEX_VS = "(?:[=\\]\\),]\\s*([+-]?\\d*\\.?\\d*e?[+-]?\\d*\\d))";
const REGEX_CSV = "([+-]?\\d*\\.?\\d*e?[+-]?\\d*\\d)";

function parseValue(id) {
  const verticesText = document.getElementById(id).value;
  const re = new RegExp(regexFormat, "gm");
  const result = [];

  let matches = re.exec(verticesText);
  while (matches) {
    if (regexGroup < matches.length) {
      const value = matches[regexGroup];
      result.push(value);
    }
    matches = re.exec(verticesText);
  }

  return result;
}

function parseVertices() {
  const result = parseValue("verticesTextarea");
  document.getElementById("verticesTextareaReg").value = result;
  return result;
}

function parseIndices() {
  const result = parseValue("indicesTextarea");
  document.getElementById("indicesTextareaReg").value = result;
  return result;
}

function parseNormals() {
  const result = parseValue("normalsTextarea");
  document.getElementById("normalsTextareaReg").value = result;
  return result;
}

function parseColors() {
  const result = parseValue("colorsTextarea");
  document.getElementById("colorsTextareaReg").value = result;
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

  let primitiveType = RENDERER.PRIMITIVE_TYPE.TRIANGLES;
  if (primitiveElements.typePoints.checked === true) {
    primitiveType = RENDERER.PRIMITIVE_TYPE.POINTS;
  } else if (primitiveElements.typeLines.checked === true) {
    primitiveType = RENDERER.PRIMITIVE_TYPE.LINES;
  } else if (primitiveElements.typeLineStrip.checked === true) {
    primitiveType = RENDERER.PRIMITIVE_TYPE.LINESTRIP;
  } else if(primitiveElements.typeTriangles.checked === true) {
    primitiveType = RENDERER.PRIMITIVE_TYPE.TRIANGLES;
  } else if(primitiveElements.typeTriangleStrip.checked === true) {
    primitiveType = RENDERER.PRIMITIVE_TYPE.TRIANGLESTRIP;
  }else if(primitiveElements.typeTriangleFan.checked === true) {
    primitiveType = RENDERER.PRIMITIVE_TYPE.TRIANGLEFAN;
  }

  store.set('user', {
    dim : primitiveElements.mode2D.checked === true ? 2 : 3,
    hasIndices : primitiveElements.indices.checked === true,
    hasNormals : primitiveElements.normals.checked === true,
    hasColors : primitiveElements.colors.checked === true,
    primitiveType: primitiveType,
    dataType: $("#regexSelect").val(),
  });

  RENDERER.loadUserMesh(vertices, indices, normals, colors, 3, primitiveType);
});

$("#clearButton").click(() => {
  document.getElementById("verticesTextarea").value = "";
  document.getElementById("verticesTextareaReg").value = "";

  document.getElementById("indicesTextarea").value = "";
  document.getElementById("indicesTextareaReg").value = "";

  document.getElementById("normalsTextarea").value = "";
  document.getElementById("normalsTextareaReg").value = "";

  document.getElementById("colorsTextarea").value = "";
  document.getElementById("colorsTextareaReg").value = "";
});

$("#clearScene").click(() => {
  RENDERER.clearScene();
});

$("#testButton").click(() => {
  loadTestData();
});

$(document).ready(() => {
  $("#loadFilesButton").change((ev) => {
    RENDERER.loadCollada(ev.currentTarget.files);
  });
});

function onRegexSelectChanged() {
  const selected = $("#regexSelect").val();

  if (selected.startsWith("Visual")) {
    const el = document.getElementById("regexFormat");
    el.value = REGEX_VS;
  } else if (selected.startsWith("CSV")) {
    const el = document.getElementById("regexFormat");
    el.value = REGEX_CSV;
  }
}

$("#regexSelect").on("change", onRegexSelectChanged);

$("#primitive3D").change(() => {
  //primitiveElements.normals.disabled = false;
  //primitiveElements.typeTriangles.disabled = false;
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

function loadCache()
{
  const userCache = store.get('user');
  if (userCache != undefined)
  {
    if (2 === userCache.dim) {
      primitiveElements.mode2D.checked = true;
    } else {
      primitiveElements.mode3D.checked = true;
    }

    if (true === userCache.hasIndices) {
      primitiveElements.indices.checked = true;
    }
    if (true === userCache.hasNormals) {
      primitiveElements.normals.checked = true;
    }
    if (true === userCache.hasColors) {
      primitiveElements.colors.checked = true;
    }

    switch(userCache.primitiveType) {
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

    $("#regexSelect").val(userCache.dataType);
    onRegexSelectChanged();
  }  
}

export default function bodyInit(screenfullVar) {
  primitiveElements.mode3D.checked = true;
  primitiveElements.typeTriangles.checked = true;
  primitiveElements.planeXY.checked = true;

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
