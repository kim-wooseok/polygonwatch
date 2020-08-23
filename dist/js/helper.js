import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.119.1/build/three.module.js";

export default class CenterHelper {
  constructor(targetControl) {
    this.targetControl = targetControl;

    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xb0b0b0 });
    material.opacity = 0.5;
    material.transparent = true;
    material.depthTest = true;
    material.depthWrite = false;
    this.sphere = new THREE.Mesh(geometry, material);

    const geometryDot = new THREE.SphereGeometry(0.4, 32, 32);
    const materialDot = new THREE.MeshBasicMaterial({ color: 0xd0d0d0 });
    materialDot.opacity = 0.75;
    materialDot.transparent = true;
    materialDot.depthTest = false;
    materialDot.depthWrite = false;
    this.dot = new THREE.Mesh(geometryDot, materialDot);

    this._group = new THREE.Group();
    this._group.add(this.sphere);
    this._group.add(this.dot);
  }

  get group() {
    return this._group;
  }

  update() {
    const sScale = 0.05;

    this.sphere.position.copy(this.targetControl.target);
    this.dot.position.copy(this.targetControl.target);
    const camPos = this.targetControl.object.position;
    const distance = this.targetControl.target.distanceTo(camPos);

    const f = this.targetControl.object.fov / 90;
    const s = distance * sScale * f;

    this.sphere.scale.set(s, s, s);
    this.dot.scale.set(s, s, s);
  }
}

export { CenterHelper };
