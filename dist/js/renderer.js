import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.119.1/build/three.module.js";
import { BufferGeometryUtils } from "https://cdn.jsdelivr.net/npm/three@0.119.1/examples/jsm/utils/BufferGeometryUtils.js"
import { ColladaLoader } from "https://cdn.jsdelivr.net/npm/three@0.119.1/examples/jsm/loaders/ColladaLoader.js";
import { FBXLoader } from "https://cdn.jsdelivr.net/npm/three@0.119.1/examples/jsm/loaders/FBXLoader.js";
import Stats from "https://cdn.jsdelivr.net/npm/three@0.122.0/examples/jsm/libs/stats.module.js";
import * as dat from "https://cdn.jsdelivr.net/npm/dat.gui@0.7.7/build/dat.gui.module.js";
import { OrbitControls } from "./three.js/examples/jsm/controls/OrbitControls.js";
import { CenterHelper } from "./helper.js";
import * as UTIL from "./util.js";

export const PRIMITIVE_MODE = {
  D3D: 100,
  D2D: 200,
};

export const PRIMITIVE_TYPE = {
  POINTS: 1,
  LINES: 2,
  LINESTRIP: 3,
  TRIANGLES: 4,
  TRIANGLESTRIP: 5,
  TRIANGLEFAN: 6,
  ERROR: 7,
};

export const PLANE = {
  XY: "XY",
  YZ: "YZ",
  ZX: "ZX",
};

const MESH_SIDE = {
  FRONT: THREE.FrontSide,
  BACK: THREE.BackSide,
  DOUBLE: THREE.DoubleSide,
}

const MESH_MATERIAL = {
  POINTS: 0,
  LINEBASIC: 1,
  BASIC: 2,
  NORMAL: 3,
  PHONG: 4,
};

function WorldPlane(planeType) {
  this.type = planeType;
  this.normal = new THREE.Vector3(0, 0, 1);
  this.forward = new THREE.Vector3(0, 1, 0);
  this.right = new THREE.Vector3(1, 0, 0);

  switch (planeType) {
    case PLANE.XY:
      this.normal = new THREE.Vector3(0, 0, 1);
      break;
    case PLANE.YZ:
      this.normal = new THREE.Vector3(1, 0, 0);
      break;
    case PLANE.ZX:
      this.normal = new THREE.Vector3(0, 1, 0);
      break;
    default:
      this.normal = new THREE.Vector3(0, 0, 1);
      break;
  }

  switch (planeType) {
    case PLANE.XY:
      this.forward = new THREE.Vector3(0, 1, 0);
      break;
    case PLANE.YZ:
      this.forward = new THREE.Vector3(0, 0, 1);
      break;
    case PLANE.ZX:
      this.forward = new THREE.Vector3(1, 0, 0);
      break;
    default:
      this.forward = new THREE.Vector3(0, 1, 0);
      break;
  }

  switch (planeType) {
    case PLANE.XY:
      this.right = new THREE.Vector3(1, 0, 0);
      break;
    case PLANE.YZ:
      this.right = new THREE.Vector3(0, 1, 0);
      break;
    case PLANE.ZX:
      this.right = new THREE.Vector3(0, 0, 1);
      break;
    default:
      this.right = new THREE.Vector3(1, 0, 0);
      break;
  }
}

let scene;
let camera;
let controls;
let renderer;
let targetSurface;

let meshList = [];
let materialList = [];
let groupList = [];

let directionalLight;
let ambientLight;

let guiParams;
let gui;
let centerHelper;
let gridHelper;
let axisHelper;
let lookatObject;
let lookatPos;
let viewPos;

let boundingSphere;
let BasePlane = new WorldPlane(PLANE.XY);
const manager = new THREE.LoadingManager();

const stats = new Stats();

export function resetViewport() {
  const surfaceWidth = targetSurface.clientWidth;
  const surfaceHeight = targetSurface.clientHeight;

  camera.aspect = surfaceWidth / surfaceHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(surfaceWidth, surfaceHeight, true);
  renderer.setScissor(0, 0, surfaceWidth, surfaceHeight);
  renderer.getViewport(guiParams.viewport);

  guiParams.aspect = camera.aspect;
  guiParams.refresh();
}

function onWindowResize() {
  resetViewport();
}

function createDefaultBox() {
  const geometry = new THREE.BoxGeometry(0.75, 0.75, 0.75);
  geometry.computeBoundingSphere();
  geometry.computeBoundingBox();
  const material = new THREE.MeshNormalMaterial();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.scale.set(1, 1.5, 0.5);
  mesh.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 4);
  mesh.position.set(0, 0, 0.5);

  return [mesh, material];
}

function createAxes(axesScale, pos) {
  const axesHelperModel = new THREE.AxesHelper(axesScale);
  axesHelperModel.position.copy(pos);

  const axesHelperModelBlend = new THREE.AxesHelper(axesScale);
  axesHelperModelBlend.position.copy(pos);
  axesHelperModelBlend.material.opacity = 0.3;
  axesHelperModelBlend.material.transparent = true;
  axesHelperModelBlend.material.depthTest = false;

  return [axesHelperModel, axesHelperModelBlend];
}

function resetBoundingSphere(meshes) {
  const boxList = [];
  meshes.forEach((mesh) => {
    mesh.updateWorldMatrix(true, false);
    const box = new THREE.Box3();
    box.copy(mesh.geometry.boundingBox).applyMatrix4(mesh.matrixWorld);
    boxList.push(box);
  });

  const boxAll = new THREE.Box3();
  boxList.forEach((box) => {
    boxAll.union(box);
  });

  boundingSphere = new THREE.Sphere();
  boxAll.getBoundingSphere(boundingSphere);
}

function resetCamera(sphere) {
  const qtn = new THREE.Quaternion();
  qtn.setFromAxisAngle(BasePlane.normal, THREE.Math.degToRad(90 + 22.5));
  const qtr = new THREE.Quaternion();
  qtr.setFromAxisAngle(BasePlane.right, THREE.Math.degToRad(-22.5));
  const qt = qtn.multiply(qtr);

  // update camera
  lookatPos = sphere.center.clone();
  lookatObject.position.set(sphere.center);
  viewPos = lookatPos.clone();
  viewPos.add(BasePlane.forward.clone().multiplyScalar(sphere.radius * -3));

  const position = viewPos.clone();
  position.sub(lookatPos);
  position.applyQuaternion(qt);
  position.add(lookatPos);

  const up = BasePlane.normal.clone();

  camera.position.copy(position);
  camera.up.copy(up);
  camera.lookAt(lookatPos.clone());
  camera.far = Math.max(sphere.radius * 6, 2000);
  camera.updateProjectionMatrix();
  controls.target.copy(lookatPos);
  controls.update();
}

function resetHelper(sphere)
{
  const gridScale = sphere.radius * 1.5;
  gridHelper.scale.set(gridScale, gridScale, gridScale);

  axisHelper[0].position.copy(sphere.center);
  axisHelper[1].position.copy(sphere.center);
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
  meshList.forEach((_mesh) => {
    const mesh = _mesh;
    UTIL.removeFromArray(materialList, mesh.material);

    switch (mat) {
      case MESH_MATERIAL.POINTS:
        mesh.material = new THREE.PointsMaterial();
        mesh.material.size = 15; // 0.1 * boundingSphere.radius;
        mesh.material.sizeAttenuation = false;
        const sprite = new THREE.TextureLoader().load("js/three.js/examples/textures/sprites/disc.png");
        mesh.material.map = sprite;
        mesh.material.alphaTest = 0.5;
        mesh.material.transparent = true;
        mesh.material.needsUpdate = true;
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
      default:
        mesh.material = new THREE.MeshBasicMaterial();
        break;
    }

    materialList.push(mesh.material);

    if (THREE.BufferGeometry === mesh.geometry.constructor) {
      if (mesh.geometry.getAttribute("color")) {
        mesh.material.vertexColors = true;
      }
    }

    mesh.material.color = new THREE.Color(guiParams.objectColor);
    mesh.material.wireframe = guiParams.wireframe;
  });
}

function GuiParams() {
  this.resetCamera = () => {
    resetCamera(boundingSphere);
  };

  this.wireframe = false;
  this.side = MESH_SIDE.FRONT;

  this.objectColor = "#c0c0c0";
  this.meshMaterial = MESH_MATERIAL.BASIC;

  this.lightColor = "#ffffff";
  this.lightIntensity = 0.7;
  this.ambientColor = "#606060";

  // camera
  this.fov = 0;
  this.aspect = 0;
  this.near = 0;
  this.far = 0;

  // renderer
  this.viewport = new THREE.Vector4(0, 0, 0, 0);
  this.resetViewport = function _resetViewport() {
    resetViewport();
  };

  this.refresh = function _refresh() {
    function updateControllers(controllers) {
      controllers.forEach((controller) => {
        controller.updateDisplay();
      });
    }

    function reculsiveGui(rgui) {
      updateControllers(rgui.__controllers);

      Object.keys(rgui.__folders).forEach((key) => {
        const folder = rgui.__folders[key];
        reculsiveGui(folder);
      });
    }

    reculsiveGui(gui);
  };
}

function initGUI() {
  gui = new dat.GUI({ autoPlace: true });

  gui.add(guiParams, "resetCamera").name("reset camera");

  gui.add(guiParams, "wireframe").onChange((val) => {
    for (let i = 0; i < materialList.length; i += 1) {
      const mat = materialList[i];
      mat.wireframe = val;
    }
  });

  gui
    .add(guiParams, "side", MESH_SIDE)
    .name("side")
    .onChange((val) => {
      const newSide = parseInt(val, MESH_SIDE.FRONT);
      for (let i = 0; i < materialList.length; i += 1) {
        const mat = materialList[i];
        mat.side = newSide;
      }
    });

  const fMat = gui.addFolder("Materials");
  if (undefined !== fMat) {
    fMat
      .addColor(guiParams, "objectColor")
      .name("color")
      .onChange((val) => {
        for (let i = 0; i < materialList.length; i += 1) {
          const mat = materialList[i];
          mat.color = new THREE.Color(val);
        }
      });
    fMat
      .add(guiParams, "meshMaterial", MESH_MATERIAL)
      .name("mesh materials")
      .onChange((val) => {
        updateMeshMaterial(parseInt(val, 10));
      });
  }
  fMat.open();

  const fProp = gui.addFolder("Properties");
  {
    const fLight = fProp.addFolder("Light");
    fLight
      .addColor(guiParams, "lightColor")
      .name("light color")
      .onChange((val) => {
        directionalLight.color = new THREE.Color(val);
      });
    fLight
      .add(guiParams, "lightIntensity", 0.0, 2.0)
      .name("light intensity")
      .onChange((val) => {
        directionalLight.intensity = val;
      });
    fLight
      .addColor(guiParams, "ambientColor")
      .name("ambient color")
      .onChange((val) => {
        ambientLight.color = new THREE.Color(val);
      });
  }
  {
    const fCam = fProp.addFolder("Camera");
    fCam.add(guiParams, "fov", 25, 80).onChange((val) => {
      camera.fov = val;
      camera.updateProjectionMatrix();
    });
    const aspect = fCam.add(guiParams, "aspect").listen();
    aspect.domElement.style.pointerEvents = "none";
    aspect.domElement.style.opacity = 0.5;
    fCam
      .add(guiParams, "near")
      .name("near")
      .onChange((val) => {
        if (val > 0 && val < camera.far) {
          camera.near = val;
          camera.updateProjectionMatrix();
        } else {
          guiParams.near = camera.near;
          guiParams.refresh();
        }
      });
    fCam.add(guiParams, "far").onChange((val) => {
      if (val > camera.near) {
        camera.far = val;
        camera.updateProjectionMatrix();
      } else {
        guiParams.far = camera.far;
        guiParams.refresh();
      }
    });
  }
  {
    const fRenderer = fProp.addFolder("Renderer");
    fRenderer.add(guiParams.viewport, "x").onChange(() => {
      updateViewport(guiParams.viewport);
    });
    fRenderer.add(guiParams.viewport, "y").onChange(() => {
      updateViewport(guiParams.viewport);
    });
    fRenderer.add(guiParams.viewport, "width").onChange(() => {
      updateViewport(guiParams.viewport);
    });
    fRenderer.add(guiParams.viewport, "height").onChange(() => {
      updateViewport(guiParams.viewport);
    });
    fRenderer.add(guiParams, "resetViewport").name("reset viewport");
  }

  const customContainer = document.getElementById("gl-gui");
  customContainer.appendChild(gui.domElement);

  stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
  stats.dom.style.position = "absolute";
  const glContainer = document.getElementById("gl-container");
  glContainer.appendChild(stats.dom);
}

export function init() {
  targetSurface = document.getElementById("gl-canvas");
  const surfaceWidth = targetSurface.clientWidth;
  const surfaceHeight = targetSurface.clientHeight;

  // Camera
  camera = new THREE.PerspectiveCamera(
    60,
    surfaceWidth / surfaceHeight,
    0.5,
    2000
  );
  lookatObject = new THREE.Object3D();

  // Basic scene
  scene = new THREE.Scene();

  // Light
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
  window.addEventListener("resize", onWindowResize, false);

  // Control
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;

  // Group
  const group = new THREE.Group();

  // Box
  const meshAndMaeterial = createDefaultBox();
  group.add(meshAndMaeterial[0]);

  // Helper
  // grid
  gridHelper = new THREE.PolarGridHelper(2, 32, 8, 64, 0x404040, 0x808080);
  const qt = new THREE.Quaternion();
  qt.setFromAxisAngle(BasePlane.right, THREE.Math.degToRad(90));
  gridHelper.applyQuaternion(qt);

  // center
  centerHelper = new CenterHelper(controls);

  // axes
  axisHelper = createAxes(1.0, lookatObject.position);

  groupList.push(group);
  meshList.push(meshAndMaeterial[0]);
  materialList.push(meshAndMaeterial[1]);

  scene.add(gridHelper);
  scene.add(centerHelper.group);
  scene.add(axisHelper[0]);
  scene.add(axisHelper[1]);
  scene.add(group);

  // Reset
  resetBoundingSphere(meshList);
  resetCamera(boundingSphere);
  resetHelper(boundingSphere);

  // GUI
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
  gridHelper.quaternion.set(0, 0, 0, 1);

  const qt = new THREE.Quaternion();
  qt.setFromUnitVectors(gridHelper.up, BasePlane.normal);
  gridHelper.applyQuaternion(qt);

  resetCamera(boundingSphere);
}

export function animate(timestamp) {
  requestAnimationFrame(animate);

  stats.begin();
  controls.update();
  centerHelper.update();

  const lookAtVector = new THREE.Vector3(0, 0, 1);
  const euler = new THREE.Euler(
    THREE.Math.degToRad(-15),
    THREE.Math.degToRad(-30),
    0
  );
  lookAtVector.applyEuler(euler);
  lookAtVector.applyQuaternion(camera.quaternion);
  const lightPosition = lookAtVector.multiplyScalar(boundingSphere.radius * 6);
  lightPosition.add(lookatPos);
  directionalLight.position.x = lightPosition.x;
  directionalLight.position.y = lightPosition.y;
  directionalLight.position.z = lightPosition.z;
  directionalLight.target = lookatObject;

  renderer.render(scene, camera);
  stats.end();
}

export function clearScene() {
  groupList.forEach((group) => {
    scene.remove(group);
  });

  groupList = [];
  materialList = [];
  meshList = [];
}

export function loadUserMesh(
  vertices,
  indices,
  normals,
  colors,
  vertexSize,
  primitiveType
) {
  clearScene();

  // Geometry
  let geometry = new THREE.BufferGeometry();
  if (vertices) {
    const floatVertices = new Float32Array(vertices);
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(floatVertices, vertexSize)
    );
  }

  if (indices) {
    const uintIndices = new Uint16Array(indices);
    geometry.setIndex(new THREE.BufferAttribute(uintIndices, 1));
  }

  if (normals) {
    const floatNormals = new Float32Array(normals);
    geometry.setAttribute(
      "normal",
      new THREE.BufferAttribute(floatNormals, vertexSize)
    );
  } else {
    if (PRIMITIVE_TYPE.TRIANGLES === primitiveType) {
      geometry.computeVertexNormals();
    }
  }

  if (colors) {
    const floatColors = new Float32Array(colors);
    geometry.setAttribute(
      "color",
      new THREE.BufferAttribute(floatColors, vertexSize)
    );
  }

  geometry.computeBoundingSphere();
  geometry.computeBoundingBox();

  let mesh = new THREE.Mesh();
  if (PRIMITIVE_TYPE.POINTS === primitiveType) {
    mesh = new THREE.Points(geometry);
  } else if (PRIMITIVE_TYPE.LINES === primitiveType) {
    mesh = new THREE.LineSegments(geometry);
  } else if (PRIMITIVE_TYPE.LINESTRIP === primitiveType) {
    mesh = new THREE.Line(geometry);
  } else if (PRIMITIVE_TYPE.TRIANGLES === primitiveType) {
    mesh = new THREE.Mesh(geometry);
  } else if (PRIMITIVE_TYPE.TRIANGLESTRIP === primitiveType) {
    geometry = BufferGeometryUtils.toTrianglesDrawMode(geometry, THREE.TriangleStripDrawMode);
    mesh = new THREE.Mesh(geometry);
  } else if (PRIMITIVE_TYPE.TRIANGLEFAN === primitiveType) {
    geometry = BufferGeometryUtils.toTrianglesDrawMode(geometry, THREE.TriangleFanDrawMode);
    mesh = new THREE.Mesh(geometry);
  } else {
    return;
  }

  let materialType = MESH_MATERIAL.NORMAL;
  // Meterial
  if (PRIMITIVE_TYPE.POINTS === primitiveType) {
    materialType = MESH_MATERIAL.POINTS;
  } else if (PRIMITIVE_TYPE.LINES === primitiveType || PRIMITIVE_TYPE.LINESTRIP === primitiveType) {
    materialType = MESH_MATERIAL.LINEBASIC;
  } else {
    if (normals) {
      if (colors) {
        materialType = MESH_MATERIAL.PHONG;
      } else {
        materialType = MESH_MATERIAL.NORMAL;
      }
    } else {
      materialType = MESH_MATERIAL.BASIC;
    }
  }

  const group = new THREE.Group();
  group.add(mesh);

  groupList.push(group);
  meshList.push(mesh);
  materialList.push(mesh.material);

  scene.add(group);

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

  const extraFiles = {};
  let daeFile = "";
  let fbxFile = "";

  for (let i = 0; i < files.length; i += 1) {
    const file = files[i];
    extraFiles[file.name] = file;

    if (files[i].name.match(/\w*.dae\b/i)) {
      daeFile = file.name;
    }
    if (files[i].name.match(/\w*.fbx\b/i)) {
      fbxFile = file.name;
    }
  }

  manager.setURLModifier((url) => {
    let fileurl = url.replace("data:application/", "");
    // eslint-disable-next-line no-useless-escape
    fileurl = fileurl.split(/[\/\\]/);
    fileurl = fileurl[fileurl.length - 1];
    const decurl = decodeURI(fileurl);

    if (extraFiles[decurl] !== undefined) {
      const blobURL = URL.createObjectURL(extraFiles[decurl]);
      return blobURL;
    }
    return url;
  });

  // eslint-disable-next-line no-console
  console.log(daeFile);

  let modelLoader;
  let modelFile;
  if (daeFile.length > 0) {
    modelLoader = new ColladaLoader(manager);
    modelFile = daeFile;
  } else if (fbxFile.length > 0) {
    modelLoader = new FBXLoader(manager);
    modelFile = fbxFile;
  }

  if (modelFile === undefined || modelLoader === undefined) {
    return;
  }

  modelLoader.load(modelFile, (model) => {
    let modelGroup;
    if (fbxFile.length > 0) {
      modelGroup = model;
    } else {
      modelGroup = model.scene;
    }

    const modelMeshList = [];
    modelGroup.traverse((_child) => {
      const child = _child;
      if (child.isMesh) {
        if (child.material.length > 1) {
          for (let i = 0; i < child.material.length; i += 1) {
            child.material[i].side = THREE.DoubleSide;
            materialList.push(child.material[i]);
          }
        } else {
          child.material.side = THREE.DoubleSide;
          materialList.push(child.material);
        }
        child.geometry.computeBoundingSphere();
        child.geometry.computeBoundingBox();
        modelMeshList.push(child);
      }
    });

    scene.add(modelGroup);
    const group = new THREE.Group();

    groupList.push(modelGroup);
    groupList.push(group);

    scene.add(group);

    resetBoundingSphere(modelMeshList);
    resetCamera(boundingSphere);
    resetHelper(boundingSphere);
  });
}

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.target.id === "gl-canvas") {
      resetViewport();
    }
  });
});
const target = document.getElementById("gl-canvas");
observer.observe(target, {
  attributes: true,
});
