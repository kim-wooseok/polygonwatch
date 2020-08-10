'use strict';
import * as RENDERER from './renderer.js'
import {loadTestData} from './test.js'

var SETTING = {
    primitiveType: RENDERER.PRIMITIVE.TRIANGLES,
    planeType: RENDERER.PLANE.XY
};

var regexFormat, regexGroup;

var REGEX_VS = "(?:[=\\]]\\s*([+-]?\\d*\\.?\\d*e?[+-]?\\d*\\d))";
var REGEX_CSV = "([+-]?\\d*\\.?\\d*e?[+-]?\\d*\\d)";

$("#runButton").click(function () {
    let vertices;
    let indices;
    let normals;
    let colors;
    let useIndices = document.getElementById("useIndices").checked;
    let useNormals = document.getElementById("useNormals").checked;
    let useColors = document.getElementById("useColors").checked;

    setRegExp();
    vertices = parseVertices();
    if (true === useIndices) {
        indices = parseIndices();
    }
    if (true === useNormals) {
        normals = parseNormals();
    }
    if (true === useColors) {
        colors = parseColors();
    }

    RENDERER.loadUserMesh(vertices, indices, normals, colors, 3, SETTING.primitiveType);
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

$('#primitivePoints').change(function () {
    SETTING.primitiveType = RENDERER.PRIMITIVE.POINTS;
})

$('#primitiveLines').change(function () {
    SETTING.primitiveType = RENDERER.PRIMITIVE.LINES;
})

$('#primitiveTriangles').change(function () {
    SETTING.primitiveType = RENDERER.PRIMITIVE.TRIANGLES;
})

$('#planeXY').change(function () {
    SETTING.planeType = RENDERER.PLANE.XY;
    RENDERER.changeBasePlane(SETTING.planeType);
})

$('#planeYZ').change(function () {
    SETTING.planeType = RENDERER.PLANE.YZ;
    RENDERER.changeBasePlane(SETTING.planeType);
})

$('#planeZX').change(function () {
    SETTING.planeType = RENDERER.PLANE.ZX;
    RENDERER.changeBasePlane(SETTING.planeType);
})

export function bodyInit() {
    RENDERER.init();
    RENDERER.animate();

    document.getElementById("primitiveTriangles").checked = true;
    SETTING.primitiveType = RENDERER.PRIMITIVE.TRIANGLES;

    document.getElementById("planeXY").checked = true;
    SETTING.primitiveType = RENDERER.PRIMITIVE.TRIANGLES;
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