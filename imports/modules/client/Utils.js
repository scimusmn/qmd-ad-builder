

/*
 *
 * Use bilinear interpolation to calcualte
 * a given point's normalized position inside
 * four points of a quadrilateral.
 *
 * p = point to map {x,y}
 * a,b,c,d = quadrilateral corner points
 * returns an {x,y} point with values between 0 and 1.
 *
 * If point falls outside quadrilateral, {x:-1,y:-1} is returned.
 *
 * Math transposed to JS from http://iquilezles.org/www/articles/ibilinear/ibilinear.htm
 *
 */
const mapPointFromQuad = (p,  a,  b,  c,  d) => {

  const e = pointSubtract(b, a);
  const f = pointSubtract(d, a);
  const g = pointAdd(pointSubtract(a, b), pointSubtract(c, d));
  const h = pointSubtract(p, a);

  const k2 = pointCross(g, f);
  const k1 = pointCross(e, f) + pointCross(h, g);
  const k0 = pointCross(h, e);

  let w = k1 * k1 - 4.0 * k0 * k2;
  if (w < 0.0) return {x:-1.0, y:-1.0};
  w = Math.sqrt(w);

  let v1 = (-k1 - w) / (2.0 * k2);
  let u1 = (h.x - f.x * v1) / (e.x + g.x * v1);

  let v2 = (-k1 + w) / (2.0 * k2);
  let u2 = (h.x - f.x * v2) / (e.x + g.x * v2);

  let u = u1;
  let v = v1;

  if (v < 0.0 || v > 1.0 || u < 0.0 || u > 1.0) {
    u = u2;   v = v2;
  }

  if (v < 0.0 || v > 1.0 || u < 0.0 || u > 1.0) {
    u = -1.0; v = -1.0;
  }

  return {x:u, y:v};

};

const pointSubtract = (a, b) => {
  return {x:(a.x - b.x), y:(a.y - b.y)};
};

const pointAdd = (a, b) => {
  return {x:(a.x + b.x), y:(a.y + b.y)};
};

const pointCross = (a, b) => {
  return a.x * b.y - a.y * b.x;
};

const distCalc = (x1, y1, x2, y2) => {

  const a = x1 - x2;
  const b = y1 - y2;

  return Math.sqrt(a * a + b * b);

};

const Utils = {

  mapPointFromQuad,
  pointSubtract,
  pointAdd,
  pointCross,
  distCalc,

};

export default Utils;
