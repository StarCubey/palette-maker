export interface Rgb {
  r: number,
  g: number,
  b: number,
}

export interface Hsv {
  h: number,
  s: number,
  v: number,
}

export interface Hsl {
  h: number,
  s: number,
  l: number,
}

export interface Oklrch {
  h: number,
  c: number,
  l: number,
}

interface Oklab {
  l: number,
  a: number,
  b: number,
}

interface LinRgb {
  r: number,
  g: number,
  b: number,
}

const ColorConverter = {
  hexToRgb(hex: string): Rgb {
    let match = hex.match(/^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);

    if(match === null) match = ["#000000", "00", "00", "00"];

    return {
      r: parseInt(match[1], 16),
      g: parseInt(match[2], 16),
      b: parseInt(match[3], 16),
    }
  },

  rgbToHex(color: Rgb): string {
    let r = Math.max(0, Math.min(255, Math.round(color.r)));
    let g = Math.max(0, Math.min(255, Math.round(color.g)));
    let b = Math.max(0, Math.min(255, Math.round(color.b)));

    return "#" +
      r.toString(16).padStart(2, "0") +
      g.toString(16).padStart(2, "0") +
      b.toString(16).padStart(2, "0");
  },


  hsvToRgb(color: Hsv): Rgb {
    if(color.h < 0) return {r: 0, g: 0, b: 0};

    let c = color.v * color.s;
    let x = c * (1 - Math.abs(color.h / 60 % 2 - 1))
    let m = color.v - c;
    if(color.h < 60) return {
      r: (m + c) * 255,
      g: (m + x) * 255,
      b: m * 255
    };
    else if(color.h < 120) return  {
      r: (m + x) * 255,
      g: (m + c) * 255,
      b: m * 255
    };
    else if(color.h < 180) return {
      r: m * 255,
      g: (m + c) * 255,
      b: (m + x) * 255
    };
    else if(color.h < 240) return {
      r: m * 255,
      g: (m + x) * 255,
      b: (m + c) * 255
    };
    else if(color.h < 300) return {
      r: (m + x) * 255,
      g: m * 255,
      b: (m + c) * 255
    };
    else return {
      r: (m + c) * 255,
      g: m * 255,
      b: (m + x) * 255
    };
  },

  rgbToHsv(color: Rgb): Hsv {
    let v = Math.max(color.r, color.g, color.b);
    let min = Math.min(color.r, color.g, color.b);
    let c = v - min;
    let s = v === 0 ? 0 : c / v;
  
    let h;
    if(s === 0) h = 0;
    else if(v === color.r) h = (color.g - color.b) / c * 60 % 360;
    else if(v === color.g) h = (color.b - color.r) / c * 60 + 120;
    else if(v === color.b) h = (color.r - color.g) / c * 60 + 240;
    else h = 0;

    return {h: (h + 360) % 360, s: s, v: v / 255};
  },

  hslToRgb(color: Hsl): Rgb {
    if(color.h < 0) return {r: 0, g: 0, b: 0};

    let c = (1 - Math.abs(2 * color.l - 1)) * color.s;
    let x = c * (1 - Math.abs(color.h / 60 % 2 - 1));
    let m = color.l - c / 2;

    if(color.h < 60) return {
      r: (m + c) * 255,
      g: (m + x) * 255,
      b: m * 255
    };
    else if(color.h < 120) return  {
      r: (m + x) * 255,
      g: (m + c) * 255,
      b: m * 255
    };
    else if(color.h < 180) return {
      r: m * 255,
      g: (m + c) * 255,
      b: (m + x) * 255
    };
    else if(color.h < 240) return {
      r: m * 255,
      g: (m + x) * 255,
      b: (m + c) * 255
    };
    else if(color.h < 300) return {
      r: (m + x) * 255,
      g: m * 255,
      b: (m + c) * 255
    };
    else return {
      r: (m + c) * 255,
      g: m * 255,
      b: (m + x) * 255
    };
  },

  rgbToHsl(color: Rgb): Hsl {
    let max = Math.max(color.r, color.g, color.b);
    let min = Math.min(color.r, color.g, color.b);
    let delta = max - min;
    let l = (max + min) / 2;
    let s = delta === 0 ? 0 : delta / (255 - Math.abs(2 * l - 255));

    let h;
    if(s === 0) h = 0;
    else if(max === color.r) h = (color.g - color.b) / delta * 60 % 360;
    else if(max === color.g) h = (color.b - color.r) / delta * 60 + 120;
    else if(max === color.b) h = (color.r - color.g) / delta * 60 + 240;
    else h = 0;

    return {h: (h + 360) % 360, s: s, l: l / 255};
  },

  oklrchToRgb(color: Oklrch): Rgb {
    let l = lrToL(color.l)
    let a_ = color.c * Math.cos(color.h / 180 * Math.PI);
    let b_ = color.c * Math.sin(color.h / 180 * Math.PI);

    let {r, g, b} = oklabToLinRgb({l, a: a_, b: b_});

    r = r <= 0.0031308 ? 12.92 * r : 1.055 * Math.pow(r, 1 / 2.4) - 0.055;
    g = g <= 0.0031308 ? 12.92 * g : 1.055 * Math.pow(g, 1 / 2.4) - 0.055;
    b = b <= 0.0031308 ? 12.92 * b : 1.055 * Math.pow(b, 1 / 2.4) - 0.055;

    return {r: r * 255, g: g * 255, b: b * 255};
  },

  rgbToOklrch(color: Rgb): Oklrch {
    let r = color.r / 255;
    let g = color.g / 255;
    let b = color.b / 255;
  
    r = r <= 0.04045 ? r / 12.92 : Math.pow(((r + 0.055) / 1.055), 2.4);
    g = g <= 0.04045 ? g / 12.92 : Math.pow(((g + 0.055) / 1.055), 2.4);
    b = b <= 0.04045 ? b / 12.92 : Math.pow(((b + 0.055) / 1.055), 2.4);


    let {l, a: a_, b: b_} = linRgbToOklab({r, g, b});

    let c = Math.sqrt(Math.pow(a_, 2) + Math.pow(b_, 2));
    let h = (Math.atan2(b_, a_) / Math.PI / 2 + 1) % 1 * 360;

    return {l: lToLr(l), c, h};
  },

  oklrchMaxChroma(lr: number, h: number) {
    let l = lrToL(lr);
    let a = Math.cos(h / 180 * Math.PI);
    let b = Math.sin(h / 180 * Math.PI);
    let cusp = okFindCusp(a, b);

    return okGamutIntersection(a, b, cusp, l, 1, l);
  },
};

function lrToL(lr: number): number {
  let k1 = 0.206;
  let k2 = 0.03;
  let k3 = (1 + k1) / (1 + k2);

  return lr * (lr + k1) / k3 / (lr + k2);
}

function lToLr(l: number): number {
  let k1 = 0.206;
  let k2 = 0.03;
  let k3 = (1 + k1) / (1 + k2);

  return (k3 * l - k1 + Math.sqrt(Math.pow(k3 * l - k1, 2) + 4 * k2 * k3 * l)) / 2;
}

function oklabToLinRgb(color: Oklab): LinRgb {
  let l_ = color.l + color.a * 0.3963377774 + color.b * 0.2158037573;
  let m_ = color.l - color.a * 0.1055613458 - color.b * 0.0638541728;
  let s_ = color.l - color.a * 0.0894841775 - color.b * 1.2914855480;

  l_ = l_ * l_ * l_;
  m_ = m_ * m_ * m_;
  s_ = s_ * s_ * s_;

  return {
    r: l_ * 4.0767416621 - m_ * 3.3077115913 + s_ * 0.2309699292,
    g:-l_ * 1.2684380046 + m_ * 2.6097574011 - s_ * 0.3413193965,
    b:-l_ * 0.0041960863 - m_ * 0.7034186147 + s_ * 1.7076147010,
  };
}

function linRgbToOklab(color: LinRgb): Oklab {
  let l = color.r * 0.4122214708 + color.g * 0.5363325363 + color.b * 0.0514459929;
  let m = color.r * 0.2119034982 + color.g * 0.6806995451 + color.b * 0.1073969566;
  let s = color.r * 0.0883024619 + color.g * 0.2817188376 + color.b * 0.6299787005;

  l = Math.cbrt(l);
  m = Math.cbrt(m);
  s = Math.cbrt(s);

  let lum = l * 0.2104542553 + m * 0.7936177850 - s * 0.0040720468;
  let a__ = l * 1.9779984951 - m * 2.4285922050 + s * 0.4505937099;
  let b__ = l * 0.0259040371 + m * 0.7827717662 - s * 0.8086757660;

  return {l: lum, a: a__, b: b__};
}

// Finds intersection of the line defined by
// l = l0 * (1 - t) + t * l1
// c = t * c1
// a and b must be normalized so a^2 + b^2 = 1
function okGamutIntersection(
  a: number,
  b: number,
  cusp: {l: number, c: number},
  l1: number,
  c1: number,
  l0: number
) {
  if((l1 - l0) * cusp.c - (cusp.l - l0) * c1 <= 0) {
    return cusp.c * l0 / (c1 * cusp.l + cusp.c * (l0 - l1));
  } else {
    let t = cusp.c * (l0 - 1) / (c1 * (cusp.l - 1) + cusp.c * (l0 - l1));

    let dl = l1 - l0;
    let dc = c1;

    let k_l = a * 0.3963377774 + b * 0.2158037573;
    let k_m =-a * 0.1055613458 - b * 0.0638541728;
    let k_s =-a * 0.0894841775 - b * 1.2914855480;

    let l_dt = dl + dc * k_l;
    let m_dt = dl + dc * k_m;
    let s_dt = dl + dc * k_s;

    //One step of Halley's method.
    for(let i = 0; i < 1; i++)
    {
      let lum = l0 * (1 - t) + t * l1;
      let chr = t * c1;

      let l_ = lum + chr * k_l;
      let m_ = lum + chr * k_m;
      let s_ = lum + chr * k_s;

      let l = l_ * l_ * l_;
      let m = m_ * m_ * m_;
      let s = s_ * s_ * s_;

      let ldt = 3 * l_dt * l_ * l_;
      let mdt = 3 * m_dt * m_ * m_;
      let sdt = 3 * s_dt * s_ * s_;

      let ldt2 = 6 * l_dt * l_dt * l_;
      let mdt2 = 6 * m_dt * m_dt * m_;
      let sdt2 = 6 * s_dt * s_dt * s_;

      let r  = l    * 4.0767416621 - m    * 3.3077115913 + s    * 0.2309699292 - 1;
      let r1 = ldt  * 4.0767416621 - mdt  * 3.3077115913 + sdt  * 0.2309699292;
      let r2 = ldt2 * 4.0767416621 - mdt2 * 3.3077115913 + sdt2 * 0.2309699292;

      let u_r = r1 / (r1 * r1 - 0.5 * r * r2);
      let t_r = -r * u_r;

      let g  = -l    * 1.2684380046 + m    * 2.6097574011 - s    * 0.3413193965 - 1;
      let g1 = -ldt  * 1.2684380046 + mdt  * 2.6097574011 - sdt  * 0.3413193965;
      let g2 = -ldt2 * 1.2684380046 + mdt2 * 2.6097574011 - sdt2 * 0.3413193965;

      let u_g = g1 / (g1 * g1 - 0.5 * g * g2);
      let t_g = -g * u_g;

      let b  = -l    * 0.0041960863 - m    * 0.7034186147 + s    * 1.7076147010 - 1;
      let b1 = -ldt  * 0.0041960863 - mdt  * 0.7034186147 + sdt  * 1.7076147010;
      let b2 = -ldt2 * 0.0041960863 - mdt2 * 0.7034186147 + sdt2 * 1.7076147010;

      let u_b = b1 / (b1 * b1 - 0.5 * b * b2);
      let t_b = -b * u_b;

      t_r = u_r >= 0 ? t_r : Number.MAX_VALUE;
      t_g = u_g >= 0 ? t_g : Number.MAX_VALUE;
      t_b = u_b >= 0 ? t_b : Number.MAX_VALUE;

      t += Math.min(t_r, t_g, t_b);
    }

    return t;
  }
}

// The l value is L, not Lr.
function okFindCusp(a: number, b: number): {l: number, c: number} {
  let s_cusp = okMaxSaturation(a, b);

  let rgb = oklabToLinRgb({l: 1, a: s_cusp * a, b: s_cusp * b});
  let l_cusp = Math.cbrt(1 / Math.max(rgb.r, rgb.g, rgb.b));
  return {l: l_cusp, c: l_cusp * s_cusp};
}

function okMaxSaturation(a: number, b: number): number {
  let k0, k1, k2, k3, k4, wl, wm, ws;

  if(a * -1.88170328 - b * 0.80936493 > 1) {
    k0 = 1.19086277;
    k1 = 1.76576728;
    k2 = 0.59662641;
    k3 = 0.75515197;
    k4 = 0.56771245;
    wl = 4.0767416621;
    wm = -3.3077115913;
    ws = 0.2309699292;
  } else if (a * 1.81444104 - b * 1.19445276 > 1) {
    k0 = 0.73956515;
    k1 = -0.45954404;
    k2 = 0.08285427;
    k3 = 0.12541070;
    k4 = 0.14503204;
    wl = -1.2684380046;
    wm = 2.6097574011;
    ws = -0.3413193965;
  } else {
    k0 = 1.35733652;
    k1 = -0.00915799;
    k2 = -1.15130210;
    k3 = -0.50559606;
    k4 = 0.00692167;
    wl = -0.0041960863;
    wm = -0.7034186147;
    ws = 1.7076147010;
  }

  let sat = k0 + k1 * a + k2 * b + k3 * a * a + k4 * a * b;

  let k_l = a * 0.3963377774 + b * 0.2158037573;
  let k_m =-a * 0.1055613458 - b * 0.0638541728;
  let k_s =-a * 0.0894841775 - b * 1.2914855480;

  //One step of Halley's method
  {
    let l_ = 1 + sat * k_l;
    let m_ = 1 + sat * k_m;
    let s_ = 1 + sat * k_s;

    let l = l_ * l_ * l_;
    let m = m_ * m_ * m_;
    let s = s_ * s_ * s_;

    let l_ds = 3 * k_l * l_ * l_;
    let m_ds = 3 * k_m * m_ * m_;
    let s_ds = 3 * k_s * s_ * s_;

    let l_ds2 = 6 * k_l * k_l * l_;
    let m_ds2 = 6 * k_m * k_m * m_;
    let s_ds2 = 6 * k_s * k_s * s_;

    let f  = wl * l     + wm * m     + ws * s;
    let f1 = wl * l_ds  + wm * m_ds  + ws * s_ds;
    let f2 = wl * l_ds2 + wm * m_ds2 + ws * s_ds2;

    sat = sat - f * f1 / (f1 * f1 - 0.5 * f * f2);
  }

  return sat;
}

export default ColorConverter;
