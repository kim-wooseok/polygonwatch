import * as RENDERER from './renderer.js'

var SETTING = {
    primitiveType: RENDERER.PRIMITIVE.triangles
};

var regexFormat, regexGroup;

var REGEX_VS = "(?:[=\\]]\\s*([+-]?\\d*\\.?\\d*e?[+-]?\\d*\\d))";
var REGEX_CSV = "([+-]?\\d*\\.?\\d*e?[+-]?\\d*\\d)";

$("#runButton").click(function () {
    var vertices;
    var indices;
    var normals;
    var colors;
    var useIndices = document.getElementById("useIndices").checked;
    var useNormals = document.getElementById("useNormals").checked;
    var useColors = document.getElementById("useColors").checked;

    var vertexSize = SETTING.primitiveType;

    setRegExp();
    vertices = parseVertices();
    if (true === useIndices) {
        indices = parseIndices();
    }
    if (true == useNormals) {
        normals = parseNormals();
    }
    if (true == useColors) {
        colors = parseColors();
    }

    RENDERER.genMesh(vertices, indices, normals, colors, 3, SETTING.primitiveType);
});

$("#testButton").click(function () {
    loadTestData();
});

$('#regexSelect').on('change', function () {
    var selected = $(this).val();

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
    //alert($(this).prop('checked'))
    SETTING.primitiveType = RENDERER.PRIMITIVE.points;
})

$('#primitiveLines').change(function () {
    //alert($(this).prop('checked'))
    SETTING.primitiveType = RENDERER.PRIMITIVE.lines;
})

$('#primitiveTriangles').change(function () {
    //alert($(this).prop('checked'))
    SETTING.primitiveType = RENDERER.PRIMITIVE.triangles;
})

export function bodyInit() {
    RENDERER.init();
    RENDERER.animate();

    document.getElementById("primitiveTriangles").checked = true;
    SETTING.primitiveType = RENDERER.PRIMITIVE.triangles;
}

function setRegExp() {
    regexFormat = document.getElementById("regexFormat").value;
    regexGroup = document.getElementById("regexGroup").value;
}

function parseValue(id) {
    var verticesText;
    var re;
    var matches;
    var value;
    var result;

    verticesText = document.getElementById(id).value;
    re = new RegExp(regexFormat, "gm");
    result = new Array();

    while (matches = re.exec(verticesText)) {
        if (regexGroup < matches.length) {
            value = matches[regexGroup];
            result.push(value);
        }
    }

    return result;
}

function parseVertices() {
    var result = parseValue("verticesTextarea");
    document.getElementById("verticesTextareaReg").value = result;
    return result;
}

function parseIndices() {
    var result = parseValue("indicesTextarea");
    document.getElementById("indicesTextareaReg").value = result;
    return result;
}

function parseNormals() {
    var result = parseValue("normalsTextarea");
    document.getElementById("normalsTextareaReg").value = result;
    return result;
}

function parseColors() {
    var result = parseValue("colorsTextarea");
    document.getElementById("colorsTextareaReg").value = result;
    return result;
}