import { VertexNormalsHelper } from "three/addons/helpers/VertexNormalsHelper.js";

export default function createNormalsHelper(mesh, visible, size) {
  const normalsHelper = new VertexNormalsHelper(mesh, 1.0, 0xffff00);
  normalsHelper.visible = visible;
  normalsHelper.size = size;
  return normalsHelper;
}

export { createNormalsHelper };
