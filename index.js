const canvasSketch = require("canvas-sketch");
const random = require("canvas-sketch-util/random");
const math = require("canvas-sketch-util/math");
let colormap = require("colormap");

const settings = {
  dimensions: [1080, 1080],
  animate: true,
};

let points = [];

const sketch = ({ context, width, height }) => {
  const nCols = 72;
  const nRows = 8;
  const nCells = nCols * nRows;

  // Dimensions
  const gridWidth = width * 0.9;
  const gridHeight = height * 0.9;
  // Margins
  const marginX = (width - gridWidth) / 2;
  const marginY = (height - gridHeight) / 2;

  const cellWidth = gridWidth / nCols;
  const cellHeight = gridHeight / nRows;

  let x = 0;
  let y = 0;
  let noise;
  let frequency = 0.002;
  let amplitude = 90;

  let colors = colormap({
    colormap: "plasma",
    nshades: amplitude,
    format: "hex",
    alpha: 1,
  });

  for (let i = 0; i < nCells; i++) {
    x = (i % nCols) * cellWidth;
    y = Math.floor(i / nCols) * cellHeight;

    noise = random.noise2D(x, y, frequency, amplitude);

    x += noise;
    y += noise;

    let lineWidth = math.mapRange(noise, -amplitude, amplitude, 0, 10);
    let colorIndex = Math.floor(math.mapRange(noise, -amplitude, amplitude, 0 , amplitude))
    let color = colors[colorIndex] || "white";
    points.push(new Point({ x, y, lineWidth, fillStyle: color }));
  }

  return ({ context, width, height, frame }) => {
    // --------------------------
    // CANVAS
    // --------------------------
    context.fillStyle = "black";
    context.fillRect(0, 0, width, height);

    // --------------------------
    // POINTS
    // --------------------------

    points.forEach((point) => {

      noise = random.noise2D(point.ix + frame * 2, point.iy, frequency, amplitude);

      point.x = point.ix + noise
      point.y = point.iy + noise
    })

    // --------------------------
    // GRID
    // --------------------------

    context.save();
    context.translate(marginX + cellWidth / 2, marginY + cellHeight / 2);
    // points.forEach((point) => point.draw(context));

    // --------------------------
    // DRAW CURVES
    // --------------------------

    context.lineWidth = 4;
    context.strokeStyle = "white";
    let lastX;
    let lastY;

    for (let i = 0; i < points.length; i++) {
      context.beginPath();

      if (i % nCols === 0) {
        context.moveTo(points[i].x, points[i].y);
        lastX = points[i].x;
        lastY = points[i].y;
      } else {
        const curr = points[i];
        const next = points[i + 1];

        const isAtEndOfRow = i % nCols === nCols - 1;

        if (next) {
          const mx = curr.x + (next.x - curr.x) * 0.2;
          const my = curr.y + (next.y - curr.y) * 7;

          context.moveTo(lastX, lastY);
          if (!isAtEndOfRow) context.quadraticCurveTo(curr.x, curr.y, mx, my);

          lastX = mx - i / points.length * 250;
          lastY = my - i / points.length * 250;
        }
      }

      context.lineWidth = points[i].lineWidth;
      context.strokeStyle = points[i].fillStyle;
      context.stroke();
    }

    context.restore();
  };
};

canvasSketch(sketch, settings);

class Point {
  constructor({ x, y, fillStyle = "white", lineWidth = 10 }) {
    this.x = x;
    this.y = y;
    this.ix = x;
    this.iy = y;
    this.radius = 15;
    this.fillStyle = fillStyle;
    this.lineWidth = lineWidth;
  }
}
