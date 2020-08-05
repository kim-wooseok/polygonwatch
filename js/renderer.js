'use strict';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.119.1/build/three.module.js'
import * as dat from 'https://cdn.jsdelivr.net/npm/dat.gui@0.7.7/build/dat.gui.module.js'
import { TrackballControls } from 'https://cdn.jsdelivr.net/npm/three@0.119.1/examples/jsm/controls/TrackballControls.js'

export const PRIMITIVE = class {
    static get POINTS() {return 1;}
    static get LINES() {return 2;}
    static get TRIANGLES() {return 3;}
};

const MESH_MATERIAL = {
    POINTS: 0,
    LINEBASIC: 1,
    BASIC: 2,
    NORMAL: 3,
    PHONG: 4,
}

var GuiParams = function () {
    this.wireframe = false;
    this.resetCamera = function () {
        resetCamera();
    };
    this.objectColor = '#aaccee';
    this.meshMaterial = MESH_MATERIAL.BASIC;

    // camera
    this.fov = 0;
    this.aspect = 0;
    this.near = 0;
    this.far = 0;

    // renderer
    this.viewport = new THREE.Vector4(0, 0, 0, 0);
    this.resetViewport = function () {
        resetViewport();
    }

    this.refresh = function () {
        function updateControllers(controllers) {
            for (let i in controllers) {
                controllers[i].updateDisplay();
            }
        }

        function reculsiveGui(_gui) {
            updateControllers(_gui.__controllers);
            for (let k of Object.keys(_gui.__folders)) {
                let f = _gui.__folders[k];
                reculsiveGui(f);
            }
        }

        reculsiveGui(gui);
    }
};

var guiParams;
var camera, scene, renderer;
var geometry, material, mesh;
var directionalLight, ambientLight;
//var directionalLightHelper;
var targetSurface;
var gui, controls;
var polarGridHelper, axesHelperModel, axesHelperModelBlend;
var lookatPos, viewPos;

export function init() {
    targetSurface = document.getElementById('gl-canvas');
    let surfaceWidth = targetSurface.clientWidth;
    let surfaceHeight = targetSurface.clientHeight;

    camera = new THREE.PerspectiveCamera(60, surfaceWidth / surfaceHeight, 0.5, 2000);
    //camera.position.y = 1;
    camera.position.y = -4;
    camera.up.set(0, 0, 1);
    lookatPos = new THREE.Vector3(0, 0, 0);
    viewPos = camera.position.clone();

    scene = new THREE.Scene();

    geometry = new THREE.BoxGeometry(0.75, 0.75, 0.75);
    geometry.computeBoundingSphere();
    material = new THREE.MeshNormalMaterial();
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    polarGridHelper = new THREE.PolarGridHelper(1, 16, 8, 64, 0x444444, 0x888888);
    polarGridHelper.rotateX(THREE.Math.degToRad(90));
    scene.add(polarGridHelper)

    axesHelperModel = new THREE.AxesHelper(1);
    axesHelperModelBlend = new THREE.AxesHelper(1);
    axesHelperModelBlend.material.opacity = 0.3;
    axesHelperModelBlend.material.transparent = true;
    axesHelperModelBlend.material.depthTest = false;

    scene.add(axesHelperModel);
    scene.add(axesHelperModelBlend);

    directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.target = axesHelperModel;
    scene.add(directionalLight);
    //directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 1);  
    //scene.add(directionalLightHelper);
    ambientLight = new THREE.AmbientLight(0x606060);
    scene.add(ambientLight)

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(surfaceWidth, surfaceHeight);
    renderer.setClearColor(new THREE.Color(0x101020), 1.0);
    renderer.setScissor(0, 0, surfaceWidth, surfaceHeight);
    renderer.setScissorTest(true);

    targetSurface.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize, false);    

    controls = new TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 4.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.target.set(0, 0, 0);
    controls.update();

    guiParams = new GuiParams();
    guiParams.meshMaterial = MESH_MATERIAL.NORMAL;
    guiParams.fov = camera.fov;
    guiParams.aspect = camera.aspect;
    guiParams.near = camera.near;
    guiParams.far = camera.far;
    renderer.getViewport(guiParams.viewport);

    initGUI();
}

function initGUI() {
    gui = new dat.GUI({ autoPlace: true });
    gui.add(guiParams, 'wireframe').onChange(function (val) {
        material.wireframe = val;
    });

    gui.addColor(guiParams, 'objectColor').name('color').onChange(function (val) {
        material.color = new THREE.Color(val);
    });

    gui.add(guiParams, 'resetCamera').name('reset camera');

    let fMat = gui.addFolder('Materials');
    fMat.add(guiParams, 'meshMaterial', MESH_MATERIAL).name('mesh materials').onChange(function (val) {
        updateMeshMaterial(parseInt(val));
    });
    fMat.open();

    let fProp = gui.addFolder('Properties');
    {
        let fCam = fProp.addFolder('Camera');
        fCam.add(guiParams, 'fov', 25, 80).onChange(function (val) {
            camera.fov = val;
            camera.updateProjectionMatrix();
        });
        let aspect = fCam.add(guiParams, 'aspect').listen();
        aspect.domElement.style.pointerEvents = "none"
        aspect.domElement.style.opacity = 0.5;
        fCam.add(guiParams, 'near').name('near').onChange(function (val) {
            if (0 < val && val < camera.far) {
                camera.near = val;
                camera.updateProjectionMatrix();
            }
            else {
                guiParams.near = camera.near;
                guiParams.refresh();
            }
        });
        fCam.add(guiParams, 'far').onChange(function (val) {
            if (val > camera.near) {
                camera.far = val;
                camera.updateProjectionMatrix();
            }
            else {
                guiParams.far = camera.far;
                guiParams.refresh();
            }
        });
    }
    {
        let fRenderer = fProp.addFolder('Renderer');
        fRenderer.add(guiParams.viewport, 'x').onChange(function () {
            updateViewport(guiParams.viewport);
        });
        fRenderer.add(guiParams.viewport, 'y').onChange(function () {
            updateViewport(guiParams.viewport);
        });
        fRenderer.add(guiParams.viewport, 'width').onChange(function () {
            updateViewport(guiParams.viewport);
        });
        fRenderer.add(guiParams.viewport, 'height').onChange(function () {
            updateViewport(guiParams.viewport);
        });
        fRenderer.add(guiParams, 'resetViewport').name('reset viewport');
    }

    let customContainer = document.getElementById('gl-gui');
    customContainer.appendChild(gui.domElement);
}

function onWindowResize() {
    resetViewport();
}

export function animate() {
    requestAnimationFrame(animate);
    controls.update();

    let lookAtVector = new THREE.Vector3(0, 0, 1);
    let euler = new THREE.Euler(THREE.Math.degToRad(-15), THREE.Math.degToRad(-30), 0);
    lookAtVector.applyEuler(euler);
    lookAtVector.applyQuaternion(camera.quaternion);
    let lightPosition = lookAtVector.multiplyScalar(geometry.boundingSphere.radius * 6);
    lightPosition.add(lookatPos);
    directionalLight.position.x = lightPosition.x;
    directionalLight.position.y = lightPosition.y;
    directionalLight.position.z = lightPosition.z;
    directionalLight.target = axesHelperModel;

    //directionalLightHelper.update();

    renderer.render(scene, camera);
}

function resetViewport() {
    let surfaceWidth = targetSurface.clientWidth;
    let surfaceHeight = targetSurface.clientHeight;

    camera.aspect = surfaceWidth / surfaceHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(surfaceWidth, surfaceHeight, true);
    renderer.setScissor(0, 0, surfaceWidth, surfaceHeight);
    renderer.getViewport(guiParams.viewport);

    guiParams.aspect = camera.aspect;
    guiParams.refresh(); 

    controls.handleResize();
}

function updateViewport(vp) {
    renderer.setViewport(vp);
    renderer.setScissor(vp);

    camera.aspect = vp.width / vp.height;
    camera.updateProjectionMatrix();

    guiParams.aspect = camera.aspect;
    guiParams.refresh();
}

function updateMeshMaterial(mat) {
    switch (mat) {
        case MESH_MATERIAL.POINTS:
            material = new THREE.PointsMaterial();
            material.size = 0.1 * geometry.boundingSphere.radius;
            //material.sizeAttenuation = false;
            break;
        case MESH_MATERIAL.LINEBASIC:
            material = new THREE.LineBasicMaterial();
            break;
        case MESH_MATERIAL.BASIC:
            material = new THREE.MeshBasicMaterial();
            break;
        case MESH_MATERIAL.NORMAL:
            material = new THREE.MeshNormalMaterial();
            break;
        case MESH_MATERIAL.PHONG:
            material = new THREE.MeshPhongMaterial();
            break;
    }

    if (THREE.BufferGeometry === geometry.constructor) {
        if (geometry.getAttribute('color')) {
            material.vertexColors = true;
        }
    }

    material.color = new THREE.Color(guiParams.objectColor);
    material.wireframe = guiParams.wireframe;
    mesh.material = material;
}

function resetCamera() {
    // 
    let eulerZ = new THREE.Euler(0, 0, THREE.Math.degToRad(-22.5));

    // update camera
    lookatPos = geometry.boundingSphere.center.clone();
    viewPos = lookatPos.clone();
    viewPos.y -= geometry.boundingSphere.radius * 6;

    let position = viewPos.clone();
    position.sub(lookatPos);
    position.applyEuler(eulerZ);
    position.add(lookatPos);

    let up = new THREE.Vector3(0, 0, 1);
    up.applyEuler(eulerZ);

    camera.position.x = position.x;
    camera.position.y = position.y;
    camera.position.z = position.z;
    camera.up.x = up.x;
    camera.up.y = up.y;
    camera.up.z = up.z;
    camera.lookAt(lookatPos.clone());
    controls.target.set(lookatPos.x, lookatPos.y, lookatPos.z);
    controls.update();
}

function updateHelper() {
    axesHelperModel.position.set(lookatPos.x, lookatPos.y, lookatPos.z);
    axesHelperModelBlend.position.set(lookatPos.x, lookatPos.y, lookatPos.z);
    let axesScale = geometry.boundingSphere.radius;
    axesHelperModel.scale.set(axesScale, axesScale, axesScale);
    axesHelperModelBlend.scale.set(axesScale, axesScale, axesScale);
    let gridScale = geometry.boundingSphere.radius * 2;
    polarGridHelper.scale.set(gridScale, gridScale, gridScale);
}

export function genMesh(vertices, indices, normals, colors, vertexSize, primitiveType) {
    scene.remove(mesh);

    // Geometry
    geometry = new THREE.BufferGeometry();
    if (vertices) {
        let floatVertices = new Float32Array(vertices);
        geometry.setAttribute('position', new THREE.BufferAttribute(floatVertices, vertexSize));
    }

    if (indices) {
        let uintIndices = new Uint16Array(indices);
        geometry.setIndex(new THREE.BufferAttribute(uintIndices, 1));
    }

    if (normals) {
        let floatNormals = new Float32Array(normals);
        geometry.setAttribute('normal', new THREE.BufferAttribute(floatNormals, vertexSize));
    }
    else {
        if (PRIMITIVE.TRIANGLES == primitiveType) {
            geometry.computeVertexNormals();
        }
    }

    if (colors) {
        let floatColors = new Float32Array(colors);
        geometry.setAttribute('color', new THREE.BufferAttribute(floatColors, vertexSize));
    }

    geometry.computeBoundingSphere();

    if (PRIMITIVE.POINTS === primitiveType) {
        mesh = new THREE.Points(geometry);
    }
    else if (PRIMITIVE.LINES === primitiveType) {
        mesh = new THREE.LineSegments(geometry);
    }
    else {
        mesh = new THREE.Mesh(geometry);
    }

    let materialType = MESH_MATERIAL.NORMAL;
    // Meterial
    if (PRIMITIVE.POINTS === primitiveType) {
        materialType = MESH_MATERIAL.POINTS;
    }
    else if (PRIMITIVE.LINES === primitiveType) {
        materialType = MESH_MATERIAL.LINEBASIC;
    }
    else {
        if (normals) {
            if (colors) {
                materialType = MESH_MATERIAL.PHONG;
            }
            else {
                materialType = MESH_MATERIAL.NORMAL;
            }
        }
        else {
            materialType = MESH_MATERIAL.BASIC;
        }
    }

    updateMeshMaterial(materialType);
    scene.add(mesh);

    directionalLight.target = mesh;
    //directionalLight.position.y = lookatPos.y + geometry.boundingSphere.radius * 6;

    resetCamera();

    updateHelper();

    // udpate gui
    guiParams.meshMaterial = materialType;
    guiParams.refresh();
}

var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        if ('gl-canvas' === mutation.target.id) {
            resetViewport();
        }
    });
});
var target = document.getElementById('gl-canvas');
observer.observe(target, {
    attributes: true
});