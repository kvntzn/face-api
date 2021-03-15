const save = require("./utils/saveFile");
const path = require("path");

const tf = require("@tensorflow/tfjs-node");

const canvas = require("canvas");

const faceapi = require("@vladmandic/face-api/dist/face-api.node.js");
const modelPathRoot = "./models";

let optionsSSDMobileNet;

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

async function image(file) {
  const decoded = tf.node.decodeImage(file);
  const casted = decoded.toFloat();
  const result = casted.expandDims(0);
  decoded.dispose();
  casted.dispose();
  return result;
}

async function detect(tensor) {
  const result = await faceapi.detectAllFaces(tensor, optionsSSDMobileNet);
  return result;
}

async function main(file, filename) {
  console.log("FaceAPI single-process test");

  await faceapi.tf.setBackend("tensorflow");
  await faceapi.tf.enableProdMode();
  await faceapi.tf.ENV.set("DEBUG", false);
  await faceapi.tf.ready();

  console.log(
    `Version: TensorFlow/JS ${faceapi.tf?.version_core} FaceAPI ${
      faceapi.version.faceapi
    } Backend: ${faceapi.tf?.getBackend()}`
  );

  console.log("Loading FaceAPI models");
  const modelPath = path.join(__dirname, modelPathRoot);
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
  optionsSSDMobileNet = new faceapi.SsdMobilenetv1Options({
    minConfidence: 0.5,
  });

  const tensor = await image(file);
  const result = await detect(tensor);
  console.log("Detected faces:", result.length);

  const canvasImg = await canvas.loadImage(file);
  const out = await faceapi.createCanvasFromMedia(canvasImg);
  faceapi.draw.drawDetections(out, result);
  save.saveFile(filename, out.toBuffer("image/jpeg"));
  console.log(`done, saved results to ${filename}`);

  tensor.dispose();

  return result;
}

module.exports = {
  detect: main,
};
