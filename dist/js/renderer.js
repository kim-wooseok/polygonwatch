'use strict';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.119.1/build/three.module.js'
import { ColladaLoader } from 'https://cdn.jsdelivr.net/npm/three@0.119.1/examples/jsm/loaders/ColladaLoader.js'
import { FBXLoader } from 'https://cdn.jsdelivr.net/npm/three@0.119.1/examples/jsm/loaders/FBXLoader.js'
import * as dat from 'https://cdn.jsdelivr.net/npm/dat.gui@0.7.7/build/dat.gui.module.js'
import { TrackballControls } from 'https://cdn.jsdelivr.net/npm/three@0.119.1/examples/jsm/controls/TrackballControls.js'
import * as UTIL from './util.js'

export const PRIMITIVE = class {
    static get POINTS() { return 1; }
    static get LINES() { return 2; }
    static get TRIANGLES() { return 3; }
};

export const PLANE = class {
    static get XY() { return 10; }
    static get YZ() { return 20; }
    static get ZX() { return 30; }
};

class WorldPlane{
    constructor(planeType) {
        this.planeType = planeType;
    }

    get type() {
        return this.planeType;
    }

    get normal() {
        let axis;
        switch(this.planeType) {
        case PLANE.XY:
            axis = new THREE.Vector3(0, 0, 1);
            break;
        case PLANE.YZ:
            axis = new THREE.Vector3(1, 0, 0);
            break;            
        case PLANE.ZX:
            axis = new THREE.Vector3(0, 1, 0);
            break;
        default:
            axis = new THREE.Vector3(0, 0, 1);
            break;
        }
        return axis;
    }

    get forward() {
        let axis;
        switch(this.planeType) {
        case PLANE.XY:
            axis = new THREE.Vector3(0, 1, 0);
            break;
        case PLANE.YZ:
            axis = new THREE.Vector3(0, 0, 1);
            break;    
        case PLANE.ZX:
            axis = new THREE.Vector3(1, 0, 0);
            break;
        default:
            axis = new THREE.Vector3(0, 1, 0);
            break;
        }
        return axis;    
    }

    get right() {
        let axis;
        switch(this.planeType) {
        case PLANE.XY:
            axis = new THREE.Vector3(1, 0, 0);
            break;
        case PLANE.YZ:
            axis = new THREE.Vector3(0, 1, 0);
            break;    
        case PLANE.ZX:
            axis = new THREE.Vector3(0, 0, 1);
            break;
        default:
            axis = new THREE.Vector3(1, 0, 0);
            break;
        }
        return axis;  
    }
}

var BasePlane = new WorldPlane(PLANE.XY);

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
        resetCamera(boundingSphere);
    };
    this.objectColor = '#c0c0c0';
    this.meshMaterial = MESH_MATERIAL.BASIC;

    this.lightColor = '#ffffff';
    this.lightIntensity = 0.7;
    this.ambientColor = '#606060';

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
//var geometry, material, mesh;

var meshList = new Array();
var materialList = new Array();
var groupList = new Array();

var directionalLight, ambientLight;
var targetSurface;
var gui, controls;
var polarGridHelper;
var lookatObject, lookatPos, viewPos;
var boundingSphere;
const manager = new THREE.LoadingManager();

export function init() {
    targetSurface = document.getElementById('gl-canvas');
    let surfaceWidth = targetSurface.clientWidth;
    let surfaceHeight = targetSurface.clientHeight;

    // Camera
    camera = new THREE.PerspectiveCamera(60, surfaceWidth / surfaceHeight, 0.5, 2000);
    lookatObject = new THREE.Object3D();

    // Basic scene
    scene = new THREE.Scene();

    polarGridHelper = new THREE.PolarGridHelper(1, 16, 8, 64, 0x404040, 0x808080);

    let qt = new THREE.Quaternion();
    qt.setFromAxisAngle(BasePlane.right, THREE.Math.degToRad(90));
    polarGridHelper.applyQuaternion(qt); 
    scene.add(polarGridHelper)

    directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.target = lookatObject;
    scene.add(directionalLight);
    ambientLight = new THREE.AmbientLight(0x606060);
    scene.add(ambientLight);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(surfaceWidth, surfaceHeight);
    renderer.setClearColor(new THREE.Color(0x303030), 1.0);
    renderer.setScissor(0, 0, surfaceWidth, surfaceHeight);
    renderer.setScissorTest(true);    

    // Window event listener
    targetSurface.appendChild(renderer.domElement);
    window.addEventListener('resize', onWindowResize, false);

    controls = new TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 4.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;

    createDefaultBox();
    resetBoundingSphere(meshList);
    resetCamera(boundingSphere);
    resetHelper(boundingSphere);

    guiParams = new GuiParams();
    guiParams.lightColor = directionalLight.color.getHex();
    guiParams.lightIntensity = directionalLight.intensity;
    guiParams.ambient = ambientLight.color.getHex();
    guiParams.meshMaterial = MESH_MATERIAL.NORMAL;
    guiParams.fov = camera.fov;
    guiParams.aspect = camera.aspect;
    guiParams.near = camera.near;
    guiParams.far = camera.far;
    renderer.getViewport(guiParams.viewport);

    initGUI();
}

export function changeBasePlane(planeType) {
    BasePlane = new WorldPlane(planeType);
    polarGridHelper.quaternion.set(0,0,0,1);

    let qt = new THREE.Quaternion();
    qt.setFromUnitVectors(polarGridHelper.up, BasePlane.normal);
    polarGridHelper.applyQuaternion(qt); 
}

function createDefaultBox() {
    let group = new THREE.Group();

    let geometry = new THREE.BoxGeometry(0.75, 0.75, 0.75);
    geometry.computeBoundingSphere();
    let material = new THREE.MeshNormalMaterial();
    let mesh = new THREE.Mesh(geometry, material);

    // axes
    let axes = createAxes(geometry.boundingSphere.radius, geometry.boundingSphere.center);

    // group
    group.add(mesh);
    group.add(axes[0]);
    group.add(axes[1]);

    scene.add(group);

    // add to global container
    groupList.push(group);
    materialList.push(material);
    meshList.push(mesh);
}

function createAxes(axesScale, pos) {
    let axesHelperModel = new THREE.AxesHelper(axesScale);
    axesHelperModel.position.set(pos.x, pos.y, pos.z);

    let axesHelperModelBlend = new THREE.AxesHelper(axesScale);
    axesHelperModelBlend.position.set(pos.x, pos.y, pos.z);
    axesHelperModelBlend.material.opacity = 0.3;
    axesHelperModelBlend.material.transparent = true;
    axesHelperModelBlend.material.depthTest = false;

    return [axesHelperModel, axesHelperModelBlend];
}

function initGUI() {
    gui = new dat.GUI({ autoPlace: true });
    gui.add(guiParams, 'wireframe').onChange(function (val) {
        materialList.forEach(function (mat) {
            mat.wireframe = val;
        });
    });

    gui.addColor(guiParams, 'objectColor').name('color').onChange(function (val) {
        materialList.forEach(function (mat) {
            mat.color = new THREE.Color(val);
        });
    });

    gui.add(guiParams, 'resetCamera').name('reset camera');

    let fMat = gui.addFolder('Materials');
    fMat.add(guiParams, 'meshMaterial', MESH_MATERIAL).name('mesh materials').onChange(function (val) {
        updateMeshMaterial(parseInt(val));
    });
    fMat.open();

    let fProp = gui.addFolder('Properties');
    {
        let fLight = fProp.addFolder('Light');
        fLight.addColor(guiParams, 'lightColor').name('light color').onChange(function(val){
            directionalLight.color = new THREE.Color(val);
        });
        fLight.add(guiParams, 'lightIntensity', 0.0, 2.0).name('light intensity').onChange(function(val){
            directionalLight.intensity = val;
        });        
        fLight.addColor(guiParams, 'ambientColor').name('ambient color').onChange(function(val){
            ambientLight.color = new THREE.Color(val);
        });        
    }
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
    let lightPosition = lookAtVector.multiplyScalar(boundingSphere.radius * 6);
    lightPosition.add(lookatPos);
    directionalLight.position.x = lightPosition.x;
    directionalLight.position.y = lightPosition.y;
    directionalLight.position.z = lightPosition.z;
    directionalLight.target = lookatObject;

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

    meshList.forEach(function(mesh) {
        UTIL.removeFromArray(materialList, mesh.material);

        switch (mat) {
            case MESH_MATERIAL.POINTS:
                mesh.material = new THREE.PointsMaterial();
                mesh.material.size = 0.1 * boundingSphere.radius;
                //material.sizeAttenuation = false;
                break;
            case MESH_MATERIAL.LINEBASIC:
                mesh.material = new THREE.LineBasicMaterial();
                break;
            case MESH_MATERIAL.BASIC:
                mesh.material = new THREE.MeshBasicMaterial();
                break;
            case MESH_MATERIAL.NORMAL:
                mesh.material = new THREE.MeshNormalMaterial();
                break;
            case MESH_MATERIAL.PHONG:
                mesh.material = new THREE.MeshPhongMaterial();
                break;
        }

        materialList.push(mesh.material);

        if (THREE.BufferGeometry === mesh.geometry.constructor) {
            if (mesh.geometry.getAttribute('color')) {
                mesh.material.vertexColors = true;
            }
        }

        mesh.material.color = new THREE.Color(guiParams.objectColor);
        mesh.material.wireframe = guiParams.wireframe;
    });
}

export function clearScene() {
    groupList.forEach(function (group) {
        scene.remove(group);
    });

    groupList = [];
    materialList = [];
    meshList = [];
}

function resetBoundingSphere(meshList) {
    boundingSphere = new THREE.Sphere();

    meshList.forEach(function(mesh) {
        let scale = (mesh.scale.x + mesh.scale.y + mesh.scale.z) / 3;
        let center = mesh.geometry.boundingSphere.center.clone().multiply(mesh.scale);
        let radius = mesh.geometry.boundingSphere.radius * scale; 

        if (boundingSphere.isEmpty()) {
            boundingSphere.set(center, radius);        
        }
        else {
            let d = boundingSphere.center.distanceTo(center);

            if (d + radius <= boundingSphere.radius) {
                // do nothing.                
            } else {    
                let r = Math.max(boundingSphere.radius, radius);
                let newcenter = boundingSphere.center.clone().add(center).multiplyScalar(0.5);
                let newradius = d / 2 + r; 
                boundingSphere.set(newcenter, newradius);
            }
        }
    });
}

function resetCamera(sphere) {
    let qtn = new THREE.Quaternion();
    qtn.setFromAxisAngle(BasePlane.normal, THREE.Math.degToRad(90 + 22.5));
    let qtr = new THREE.Quaternion();
    qtr.setFromAxisAngle(BasePlane.right, THREE.Math.degToRad(-22.5));
    let qt = qtn.multiply(qtr);

    // update camera
    lookatPos = sphere.center.clone();
    lookatObject.position.set(sphere.center);
    viewPos = lookatPos.clone();
    viewPos.add(BasePlane.forward.clone().multiplyScalar(sphere.radius * -3));

    let position = viewPos.clone();
    position.sub(lookatPos);
    position.applyQuaternion(qt);
    position.add(lookatPos);

    let up = BasePlane.normal.clone();
    //up.applyQuaternion(qt);

    camera.position.x = position.x;
    camera.position.y = position.y;
    camera.position.z = position.z;
    camera.up.x = up.x;
    camera.up.y = up.y;
    camera.up.z = up.z;
    camera.lookAt(lookatPos.clone());
    camera.far = Math.max(sphere.radius * 6, 2000);
    camera.updateProjectionMatrix();
    controls.target.set(lookatPos.x, lookatPos.y, lookatPos.z);
    controls.update();
}

function resetHelper(sphere) {
    let gridScale = sphere.radius * 1.5;
    polarGridHelper.scale.set(gridScale, gridScale, gridScale);
}

export function loadUserMesh(vertices, indices, normals, colors, vertexSize, primitiveType) {
    clearScene();

    // Geometry
    let geometry = new THREE.BufferGeometry();
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

    let mesh = new THREE.Mesh();
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

    // axes
    let axes = createAxes(geometry.boundingSphere.radius, geometry.boundingSphere.center);

    let group = new THREE.Group();
    group.add(mesh);
    group.add(axes[0]);
    group.add(axes[1]);
    scene.add(group);

    // add to global container
    groupList.push(group);
    materialList.push(mesh.material);
    meshList.push(mesh);

    updateMeshMaterial(materialType);

    resetBoundingSphere(meshList);
    resetCamera(boundingSphere);
    resetHelper(boundingSphere);

    // udpate gui
    guiParams.meshMaterial = materialType;
    guiParams.refresh();
}

export function loadCollada(files) {
    clearScene();

    let extraFiles = {};
    let daeFile = "";
    let fbxFile = "";

    for (var i = 0; i < files.length; i++) {
        let file = files[i];
        extraFiles[file.name] = file;   
        //console.log("load file: " + file.name);
        if (files[i].name.match(/\w*.dae\b/i)) {
            daeFile = file.name;
        }
        if (files[i].name.match(/\w*.fbx\b/i)) {
            fbxFile = file.name;
        }        
    }

    manager.setURLModifier(function (url) {
        
        let fileurl = url.replace('data:application/', '');
        fileurl = fileurl.split(/[\/\\]/);
        fileurl = fileurl[fileurl.length - 1];
        let decurl = decodeURI(fileurl);

        //console.log("modifier: " + fileurl + ", " + decurl);

        if (extraFiles[decurl] !== undefined) {
            const blobURL = URL.createObjectURL(extraFiles[decurl]);
            return blobURL;
        }
        return url;
    });

    console.log(daeFile);

    let modelLoader;
    let modelFile;
    if (daeFile.length > 0) {
        modelLoader = new ColladaLoader(manager);
        modelFile = daeFile;

    } else if(fbxFile.length > 0) {
        modelLoader = new FBXLoader(manager);
        modelFile = fbxFile;
    }

    if (modelFile === undefined || modelLoader === undefined) {
        return;
    }

    modelLoader.load(modelFile, function (model) {

        let modelGroup;
        if (fbxFile.length > 0) {
            modelGroup = model;
        }
        else {
            modelGroup = model.scene;
        }
        
        let modelMeshList = new Array();
        modelGroup.traverse(function (child) {
            if (child.isMesh) {
                if (child.material.length > 1) {
                    for (var i = 0; i < child.material.length; i++) {
                        child.material[i].side = THREE.DoubleSide;
                        materialList.push(child.material[i]);
                    }
                }
                else {
                    child.material.side = THREE.DoubleSide;
                    materialList.push(child.material);
                }
                child.geometry.computeBoundingSphere();
                modelMeshList.push(child);
            }
        });

        scene.add(modelGroup);
        groupList.push(modelGroup);

        resetBoundingSphere(modelMeshList);
        resetCamera(boundingSphere);
        resetHelper(boundingSphere);

        // axes
        let axes = createAxes(boundingSphere.radius, boundingSphere.center);
        let group = new THREE.Group();
        group.add(axes[0]);
        group.add(axes[1]);
        scene.add(group);
        groupList.push(group);
    });    
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