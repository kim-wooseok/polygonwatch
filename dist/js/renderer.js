import * as THREE from "three";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import { ColladaLoader } from "three/addons/loaders/ColladaLoader.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import Stats from "three/addons/libs/stats.module.js";
import * as dat from "https://cdn.jsdelivr.net/npm/dat.gui@0.7.9/build/dat.gui.module.js";
import { CenterHelper } from "./helper.js";
import * as UTIL from "./util.js";
import * as SceneUtil from "./sceneUtil.js";

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
};

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
let normalsHelperList = [];
let materialList = [];
let groupList = [];
let animationList = null;
let animationMixer = null;

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
let boundingBox;
const boundingBoxCenter = new THREE.Vector3();

// for reset
const fov0 = 60.0;
let fovNew = fov0;
let boundingSphere0;
const distanceScalar0 = 3.0;

let BasePlane = new WorldPlane(PLANE.XY);
const manager = new THREE.LoadingManager();
const clock = new THREE.Clock();

const stats = new Stats();

// getter
export function getBoundingBox() {
  return boundingBox;
}

export function getCenter() {
  return boundingBoxCenter;
}

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

function getBoundingSphere(meshes) {
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

  const sphere = new THREE.Sphere();
  boxAll.getBoundingSphere(sphere);
  return sphere;
}

function initCamera(sphere) {
  const rotateFromNormal = 90 + 22.5;
  const rotateFromRight = -22.5;
  const qtn = new THREE.Quaternion();
  qtn.setFromAxisAngle(
    BasePlane.normal,
    THREE.MathUtils.degToRad(rotateFromNormal)
  );
  const qtr = new THREE.Quaternion();
  qtr.setFromAxisAngle(
    BasePlane.right,
    THREE.MathUtils.degToRad(rotateFromRight)
  );
  const qt = qtn.multiply(qtr);

  // update camera
  lookatPos = sphere.center.clone();
  lookatObject.position.set(sphere.center);
  viewPos = lookatPos.clone();
  viewPos.add(
    BasePlane.forward
      .clone()
      .multiplyScalar(sphere.radius * -1.0 * distanceScalar0)
  );

  const position = viewPos.clone();
  position.sub(lookatPos);
  position.applyQuaternion(qt);
  position.add(lookatPos);

  const up = BasePlane.normal.clone();

  camera.position.copy(position);
  camera.up.copy(up);
  camera.lookAt(lookatPos.clone());
  camera.far = Math.min(Math.max(sphere.radius * 20, 1000), 100000);
  camera.near = camera.far / 10000.0;
  camera.updateProjectionMatrix();

  // Control
  if (controls !== undefined) {
    controls.dispose();
  }
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.target.copy(lookatPos);

  controls.target0 = lookatPos.clone();
  controls.position0 = position.clone();

  controls.update();

  // center
  centerHelper = new CenterHelper(controls, sphere.radius);
}

function resetCamera() {
  controls.reset();
}

function setControlDistance(distance) {
  const offset = controls.object.position
    .clone()
    .sub(controls.target)
    .normalize()
    .multiplyScalar(distance);
  const pos = controls.target.clone().add(offset);
  controls.object.position.copy(pos);
}

function initHelper(sphere) {
  const gridScale = sphere.radius * 1.5;
  const gridCenter = new THREE.Vector3(sphere.center.x, sphere.center.y, 0);

  gridHelper.position.copy(gridCenter);
  gridHelper.scale.set(gridScale, gridScale, gridScale);

  const axisScale = sphere.radius * 0.5;
  axisHelper[0].position.copy(sphere.center);
  axisHelper[1].position.copy(sphere.center);
  axisHelper[0].scale.set(axisScale, axisScale, axisScale);
  axisHelper[1].scale.set(axisScale, axisScale, axisScale);
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
      case MESH_MATERIAL.POINTS: {
        const sprite = new THREE.TextureLoader().load(
          "js/three.js/examples/textures/sprites/disc.png"
        );

        mesh.material = new THREE.PointsMaterial();
        mesh.material.size = 15; // 0.1 * boundingSphere.radius;
        mesh.material.sizeAttenuation = false;
        mesh.material.map = sprite;
        mesh.material.alphaTest = 0.5;
        mesh.material.transparent = true;
        mesh.material.needsUpdate = true;
        break;
      }
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
    mesh.material.side = guiParams.side;
  });
}

function preDraw() {
  if (camera.fov !== fovNew) {
    const halfFov0 = THREE.MathUtils.degToRad(camera.fov / 2.0);
    const halfFov1 = THREE.MathUtils.degToRad(fovNew / 2.0);
    const distance0 = controls.getDistance();
    const distance1 = (distance0 * Math.tan(halfFov0)) / Math.tan(halfFov1);

    setControlDistance(distance1);

    camera.fov = fovNew;
    camera.updateProjectionMatrix();
  }
}

function GuiParams() {
  this.resetCamera = () => {
    resetCamera();
  };

  this.wireframe = false;
  this.side = MESH_SIDE.FRONT;

  this.objectColor = "#c0c0c0";
  this.meshMaterial = MESH_MATERIAL.BASIC;

  // animations
  this.selectedClip = -1;
  this.clipList = { "----------": -1 };
  this.fClips = null;

  // light
  this.lightColor = "#ffffff";
  this.lightIntensity = 0.7;
  this.ambientColor = "#606060";

  // camera
  this.fov = 0;
  this.distance = 0;
  this.aspect = 0;
  this.near = 0;
  this.far = 0;

  // helpers
  this.normal = false;
  this.normalSize = 1.0;

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

  gui.fClips = gui.addFolder("Animations");
  gui.clips = null;
  gui.updateClips = function _updateClips() {
    if (gui.clips !== null) {
      gui.fClips.remove(gui.clips);
    }
    gui.clips = gui.fClips
      .add(guiParams, "selectedClip", guiParams.clipList)
      .listen()
      .name("animation clips")
      .onChange((val) => {
        // eslint-disable-next-line no-console
        console.log(`animation: ${val}`);
        if (val >= 0) {
          animationMixer.clipAction(animationList[val]).play();
        } else {
          animationMixer.stopAllAction();
        }
      });
  };
  gui.updateClips();
  gui.fClips.open();

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

    fCam.add(guiParams, "fov", 10, 120).onFinishChange((val) => {
      fovNew = val;
    });
    const distance = fCam
      .add(guiParams, "distance")
      .listen()
      .step(0.01)
      .onChange((val) => {
        const newValue = val < 0.1 ? 0.1 : val;
        setControlDistance(newValue);
      });
    distance.domElement.style.pointerEvents = "none";
    distance.domElement.style.opacity = 0.7;
    const aspect = fCam.add(guiParams, "aspect").listen();
    aspect.domElement.style.pointerEvents = "none";
    aspect.domElement.style.opacity = 0.7;
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
    const fHelper = fProp.addFolder("Helper");
    fHelper.add(guiParams, "normal").onChange((val) => {
      for (let i = 0; i < normalsHelperList.length; i += 1) {
        const normalsHelper = normalsHelperList[i];
        normalsHelper.visible = val;
      }
    });
    fHelper
      .add(guiParams, "normalSize")
      .step(0.1)
      .onChange((val) => {
        for (let i = 0; i < normalsHelperList.length; i += 1) {
          const normalsHelper = normalsHelperList[i];
          normalsHelper.size = val;
          normalsHelper.update();
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

  stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
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
    0.1,
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

  scene.background = new THREE.Color(0x606060);
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  scene.environment = pmremGenerator.fromScene(
    new RoomEnvironment(),
    0.04
  ).texture;

  // Window event listener
  targetSurface.appendChild(renderer.domElement);
  window.addEventListener("resize", onWindowResize, false);

  // Group
  const group = new THREE.Group();

  // Box
  const meshAndMaeterial = createDefaultBox();
  group.add(meshAndMaeterial[0]);

  // Helper
  // grid
  gridHelper = new THREE.PolarGridHelper(2, 32, 8, 64, 0x404040, 0x808080);
  const qt = new THREE.Quaternion();
  qt.setFromAxisAngle(BasePlane.right, THREE.MathUtils.degToRad(90));
  gridHelper.applyQuaternion(qt);

  // axes
  axisHelper = createAxes(1.0, lookatObject.position);

  groupList.push(group);
  meshList.push(meshAndMaeterial[0]);
  materialList.push(meshAndMaeterial[1]);

  // Init
  boundingSphere0 = getBoundingSphere(meshList);
  initCamera(boundingSphere0);
  initHelper(boundingSphere0);

  // Scene
  scene.add(gridHelper);
  scene.add(centerHelper.group);
  scene.add(axisHelper[0]);
  scene.add(axisHelper[1]);
  scene.add(group);

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

  // Helper
  // normal
  const normalsHelper = SceneUtil.createNormalsHelper(
    meshAndMaeterial[0],
    guiParams.normal,
    guiParams.normalSize
  );
  group.add(normalsHelper);
  normalsHelperList.push(normalsHelper);

  initGUI();
}

export function changeBasePlane(planeType) {
  BasePlane = new WorldPlane(planeType);
  gridHelper.quaternion.set(0, 0, 0, 1);

  const qt = new THREE.Quaternion();
  qt.setFromUnitVectors(gridHelper.up, BasePlane.normal);
  gridHelper.applyQuaternion(qt);

  initCamera(boundingSphere0);
}

export function animate() {
  requestAnimationFrame(animate);

  stats.begin();
  {
    preDraw();

    const delta = clock.getDelta();

    if (animationMixer !== null) {
      animationMixer.update(delta);
    }
    controls.update();
    centerHelper.update();

    const lookAtVector = new THREE.Vector3(0, 0, 1);
    const euler = new THREE.Euler(
      THREE.MathUtils.degToRad(-15),
      THREE.MathUtils.degToRad(-30),
      0
    );
    lookAtVector.applyEuler(euler);
    lookAtVector.applyQuaternion(camera.quaternion);
    const lightPosition = lookAtVector.multiplyScalar(
      boundingSphere0.radius * 6
    );
    lightPosition.add(lookatPos);
    directionalLight.position.x = lightPosition.x;
    directionalLight.position.y = lightPosition.y;
    directionalLight.position.z = lightPosition.z;
    directionalLight.target = lookatObject;

    // GUI
    const newDistance = controls.getDistance();
    if (newDistance !== guiParams.distance) {
      guiParams.distance = newDistance;
    }

    // Render
    renderer.render(scene, camera);
  }

  stats.end();
}

export function clearScene() {
  groupList.forEach((group) => {
    scene.remove(group);
  });

  groupList = [];
  materialList = [];
  meshList = [];
  normalsHelperList = [];
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
  boundingBox = geometry.boundingBox;
  boundingBox.getCenter(boundingBoxCenter);

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
    geometry = BufferGeometryUtils.toTrianglesDrawMode(
      geometry,
      THREE.TriangleStripDrawMode
    );
    mesh = new THREE.Mesh(geometry);
  } else if (PRIMITIVE_TYPE.TRIANGLEFAN === primitiveType) {
    geometry = BufferGeometryUtils.toTrianglesDrawMode(
      geometry,
      THREE.TriangleFanDrawMode
    );
    mesh = new THREE.Mesh(geometry);
  } else {
    return;
  }

  let materialType = MESH_MATERIAL.NORMAL;
  // Meterial
  if (PRIMITIVE_TYPE.POINTS === primitiveType) {
    materialType = MESH_MATERIAL.POINTS;
  } else if (
    PRIMITIVE_TYPE.LINES === primitiveType ||
    PRIMITIVE_TYPE.LINESTRIP === primitiveType
  ) {
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

  updateMeshMaterial(materialType);

  // Init
  boundingSphere0 = getBoundingSphere(meshList);
  initCamera(boundingSphere0);
  initHelper(boundingSphere0);

  // Helper
  if (
    PRIMITIVE_TYPE.TRIANGLES === primitiveType ||
    PRIMITIVE_TYPE.TRIANGLESTRIP === primitiveType ||
    PRIMITIVE_TYPE.TRIANGLEFAN === primitiveType
  ) {
    const normalsHelper = SceneUtil.createNormalsHelper(
      mesh,
      guiParams.normal,
      guiParams.normalSize
    );
    group.add(normalsHelper);
    normalsHelperList.push(normalsHelper);
  }

  // Scene
  scene.add(group);

  // udpate gui
  guiParams.near = camera.near;
  guiParams.far = camera.far;
  guiParams.meshMaterial = materialType;
  guiParams.refresh();
}

export function loadModeling(files) {
  clearScene();

  const extraFiles = {};
  let daeFile = "";
  let fbxFile = "";
  let gltfFile = "";

  for (let i = 0; i < files.length; i += 1) {
    const file = files[i];
    extraFiles[file.name] = file;

    if (files[i].name.match(/\w*.dae\b/i)) {
      daeFile = file.name;
    }
    if (files[i].name.match(/\w*.fbx\b/i)) {
      fbxFile = file.name;
    }
    if (files[i].name.match(/\w*.glb\b/i)) {
      gltfFile = file.name;
    }
    if (files[i].name.match(/\w*.gltf\b/i)) {
      gltfFile = file.name;
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

  let modelLoader;
  let modelFile;
  if (daeFile.length > 0) {
    modelLoader = new ColladaLoader(manager);
    modelFile = daeFile;
  } else if (fbxFile.length > 0) {
    modelLoader = new FBXLoader(manager);
    modelFile = fbxFile;
  } else if (gltfFile.length > 0) {
    modelLoader = new GLTFLoader(manager);

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(
      "https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/libs/draco/gltf/"
    );
    modelLoader.setDRACOLoader(dracoLoader);

    modelFile = gltfFile;
  }

  // eslint-disable-next-line no-console
  console.log(modelFile);

  if (modelFile === undefined || modelLoader === undefined) {
    return;
  }

  modelLoader.load(modelFile, (modelObject) => {
    let model;
    if (fbxFile.length > 0) {
      model = modelObject;
    } else {
      model = modelObject.scene;
    }

    // mesh
    const modelMeshList = [];
    model.traverse((_child) => {
      const child = _child;
      if (child.isMesh) {
        if (child.material.length > 1) {
          for (let i = 0; i < child.material.length; i += 1) {
            materialList.push(child.material[i]);
          }
        } else {
          materialList.push(child.material);
        }
        child.geometry.computeBoundingSphere();
        child.geometry.computeBoundingBox();
        modelMeshList.push(child);
      }
    });

    // animation
    animationList = modelObject.animations;
    guiParams.clipList = { "----------": -1 };
    for (let i = 0; i < animationList.length; i += 1) {
      guiParams.clipList[animationList[i].name] = i;
    }
    gui.updateClips();
    guiParams.selectedClip = -1;
    if (animationList.length > 0) {
      animationMixer = new THREE.AnimationMixer(model);
    } else {
      animationMixer = null;
    }

    // scene
    scene.add(model);
    const group = new THREE.Group();

    groupList.push(model);
    groupList.push(group);

    // Init
    boundingSphere0 = getBoundingSphere(modelMeshList);
    initCamera(boundingSphere0);
    initHelper(boundingSphere0);

    // helper
    modelMeshList.forEach((mesh) => {
      const normalsHelper = SceneUtil.createNormalsHelper(
        mesh,
        guiParams.normal,
        guiParams.normalSize
      );
      group.add(normalsHelper);
      normalsHelperList.push(normalsHelper);
    });

    // Scene
    scene.add(group);
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
