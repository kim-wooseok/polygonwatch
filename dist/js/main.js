'use strict';
import * as RENDERER from './renderer.js'
import {loadTestData} from './test.js'

class PrimitiveElements {
    constructor() {
        this.mode3D = $("#primitive3D")[0];
        this.mode2D = $("#primitive2D")[0];

        this.indices = $("#useIndices")[0];
        this.normals = $("#useNormals")[0];
        this.colors = $("#useColors")[0];

        this.typePoints = $("#primitivePoints")[0];
        this.typeLines = $("#primitiveLines")[0];
        this.typeTriangles = $("#primitiveTriangles")[0];

        this.planeXY = $("#planeXY")[0];
        this.planeYZ = $("#planeYZ")[0];
        this.planeZX = $("#planeZX")[0];
    }
}

class CanvasElements {
    constructor() {
        this.canvas = $('#gl-canvas')[0];
        this.fullscreen = $('#svg-fullscreen')[0];
        this.fullscreenExit = $('#svg-fullscreen-exit')[0];
    }
}

var primitiveElements = new PrimitiveElements();
var canvasElements = new CanvasElements();

var regexFormat, regexGroup;

var REGEX_VS = "(?:[=\\]\\),]\\s*([+-]?\\d*\\.?\\d*e?[+-]?\\d*\\d))";
var REGEX_CSV = "([+-]?\\d*\\.?\\d*e?[+-]?\\d*\\d)";

$("#runButton").click(function () {
    let vertices;
    let indices;
    let normals;
    let colors;

    setRegExp();
    vertices = parseVertices();
    if (true === primitiveElements.mode2D.checked) {
        let vertices2D = new Array();
        for (let i = 0; i < vertices.length; i += 2) {
            vertices2D.push(vertices[i+0]);
            vertices2D.push(vertices[i+1]);
            vertices2D.push("0");
        }
        vertices = vertices2D;
    }

    if (true === primitiveElements.indices.checked) {
        indices = parseIndices();
    }
    if (true === primitiveElements.normals.checked) {
        normals = parseNormals();
    }
    if (true === primitiveElements.colors.checked) {
        colors = parseColors();
    }

    let primitiveType = RENDERER.PRIMITIVE_TYPE.TRIANGLES;
    if (true === primitiveElements.typePoints.checked) {
        primitiveType = RENDERER.PRIMITIVE_TYPE.POINTS;
    }
    else if (true === primitiveElements.typeLines.checked) {
        primitiveType = RENDERER.PRIMITIVE_TYPE.LINES;
    }
    else {
        primitiveType = RENDERER.PRIMITIVE_TYPE.TRIANGLES;
    }

    RENDERER.loadUserMesh(vertices, indices, normals, colors, 3, primitiveType);
});

$("#clearButton").click(function () {
    document.getElementById("verticesTextarea").value = "";
    document.getElementById("verticesTextareaReg").value = "";

    document.getElementById("indicesTextarea").value = "";
    document.getElementById("indicesTextareaReg").value = "";

    document.getElementById("normalsTextarea").value = "";
    document.getElementById("normalsTextareaReg").value = "";

    document.getElementById("colorsTextarea").value = "";
    document.getElementById("colorsTextareaReg").value = "";
});

$("#clearScene").click(function () {
    RENDERER.clearScene();
});

$("#testButton").click(function () {
    loadTestData();
});

$(document).ready(function(){
    $("#loadFilesButton").change(function(ev){
        RENDERER.loadCollada(ev.currentTarget.files);
    });
});

$('#regexSelect').on('change', function () {
    let selected = $(this).val();

    if (selected.startsWith("Visual")) {
        let el = document.getElementById("regexFormat");
        el.value = REGEX_VS;
    }
    else if (selected.startsWith("CSV")) {
        let el = document.getElementById("regexFormat");
        el.value = REGEX_CSV;
    }
});

$('#primitive3D').change(function () {
    primitiveElements.normals.disabled = false;
    primitiveElements.typeTriangles.disabled = false;
})

$('#primitive2D').change(function () {
    if (true === primitiveElements.normals.checked)
    {
        primitiveElements.normals.checked = false;
    }
    if (true === primitiveElements.typeTriangles.checked)
    {
        primitiveElements.typeLines.checked = true;
    }
    primitiveElements.normals.disabled = true;
    primitiveElements.typeTriangles.disabled = true;
})

$('#planeXY').change(function () {
    RENDERER.changeBasePlane(RENDERER.PLANE.XY);
})

$('#planeYZ').change(function () {
    RENDERER.changeBasePlane(RENDERER.PLANE.YZ);
})

$('#planeZX').change(function () {
    RENDERER.changeBasePlane(RENDERER.PLANE.ZX);
})

$('#gl-gui-fullscreen').on('click', () => {
    if (screenfull.isEnabled) {
        screenfull.toggle(canvasElements.canvas);
    }
});

screenfull.on('change', () => {
    if (screenfull.isFullscreen) {
        canvasElements.fullscreen.style.display = "none";
        canvasElements.fullscreenExit.style.display = "block";
    } else {
        canvasElements.fullscreen.style.display = "block";
        canvasElements.fullscreenExit.style.display = "none";
    }
});

export function bodyInit() {
    primitiveElements.mode3D.checked = true;
    primitiveElements.typeTriangles.checked = true;
    primitiveElements.planeXY.checked = true;

    RENDERER.init();
    RENDERER.animate();
}

function setRegExp() {
    regexFormat = document.getElementById("regexFormat").value;
    regexGroup = document.getElementById("regexGroup").value;
}

function parseValue(id) {
    let verticesText;
    let re;
    let matches;
    let value;
    let result;

    verticesText = document.getElementById(id).value;
    re = new RegExp(regexFormat, "gm");
    result = new Array();

    matches = re.exec(verticesText);
    while (matches) {
        if (regexGroup < matches.length) {
            value = matches[regexGroup];
            result.push(value);
        }
        matches = re.exec(verticesText);
    }

    return result;
}

function parseVertices() {
    let result = parseValue("verticesTextarea");
    document.getElementById("verticesTextareaReg").value = result;
    return result;
}

function parseIndices() {
    let result = parseValue("indicesTextarea");
    document.getElementById("indicesTextareaReg").value = result;
    return result;
}

function parseNormals() {
    let result = parseValue("normalsTextarea");
    document.getElementById("normalsTextareaReg").value = result;
    return result;
}

function parseColors() {
    let result = parseValue("colorsTextarea");
    document.getElementById("colorsTextareaReg").value = result;
    return result;
}