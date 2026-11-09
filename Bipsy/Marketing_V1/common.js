// Pieces shared by the store art and the Instagram posts. Coordinates of a crop are
// screenshot pixels (945 x 2048), so what floats out of a phone is the real app.
const SHOT_W = 945, SHOT_H = 2048;

/** A phone with a screenshot. `w` is the width of the screen in px. */
function phone(name, w, { style = '', overlay = '' } = {}) {
  const b = Math.round(w * 0.03), h = Math.round((w * SHOT_H) / SHOT_W);
  const r = Math.round(w * 0.135);
  return `<div class="ph" style="width:${w + b * 2}px;height:${h + b * 2}px;padding:${b}px;border-radius:${r + b}px;${style}">
    <i class="ph__btn" style="left:-${b * 0.3}px;top:${h * 0.2}px;height:${h * 0.05}px;width:${b * 0.35}px"></i>
    <i class="ph__btn" style="left:-${b * 0.3}px;top:${h * 0.28}px;height:${h * 0.09}px;width:${b * 0.35}px"></i>
    <i class="ph__btn" style="left:-${b * 0.3}px;top:${h * 0.39}px;height:${h * 0.09}px;width:${b * 0.35}px"></i>
    <i class="ph__btn" style="right:-${b * 0.3}px;top:${h * 0.3}px;height:${h * 0.13}px;width:${b * 0.35}px"></i>
    <div class="ph__screen" style="border-radius:${r}px"><img src="shots/${name}.png" alt="">${overlay}</div>
  </div>`;
}

/** A piece of a screenshot floating on its own, scaled by `s`. */
function crop(name, x, y, w, h, s = 1.2, { radius = 40, style = '', cls = '' } = {}) {
  return `<div class="crop ${cls}" style="width:${w * s}px;height:${h * s}px;border-radius:${radius}px;
    background-image:url(shots/${name}.png);background-size:${SHOT_W * s}px ${SHOT_H * s}px;
    background-position:${-x * s}px ${-y * s}px;${style}"></div>`;
}

/** The real push of a new booking, `NotifCopy.newBooking`, at width `w`. */
function push(w, { style = '' } = {}) {
  const k = w / 860;
  return `<div class="push" style="width:${w}px;padding:${26 * k}px ${32 * k}px;border-radius:${50 * k}px;gap:${24 * k}px;${style}">
    <img src="assets/icon-biz.webp" style="width:${92 * k}px;height:${92 * k}px;border-radius:${21 * k}px" alt="">
    <div style="flex:1;min-width:0">
      <div style="display:flex;justify-content:space-between;align-items:baseline">
        <b style="font-size:${37 * k}px">Nueva cita</b><span style="font-size:${27 * k}px;color:#7F8E89">ahora</span></div>
      <div style="font-size:${30 * k}px;color:#2E343B;margin-top:${4 * k}px;white-space:nowrap">Marina Alcaide · Tratamiento facial · hoy 09:00</div>
    </div></div>`;
}

const BASE_CSS = `
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#000}
body{font-family:'Plus Jakarta Sans',sans-serif;-webkit-font-smoothing:antialiased}
.abs{position:absolute}
.ph{position:relative;background:#101215;box-shadow:inset 0 0 0 4px rgba(255,255,255,.14),0 60px 120px rgba(0,0,0,.34),0 16px 40px rgba(0,0,0,.2)}
.ph__btn{position:absolute;background:#22262b;border-radius:6px}
.ph__screen{position:relative;width:100%;height:100%;overflow:hidden;background:#fff}
.ph__screen>img{display:block;width:100%;height:100%}
.crop{background-repeat:no-repeat;box-shadow:0 34px 80px rgba(0,0,0,.28),0 8px 22px rgba(0,0,0,.14)}
.push{display:flex;align-items:center;background:rgba(255,255,255,.98);color:#15171A;box-shadow:0 34px 80px rgba(0,0,0,.3);font-family:'Plus Jakarta Sans',sans-serif}
.title{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;letter-spacing:-.035em;line-height:.95}
.title em{font-family:'Instrument Serif',serif;font-weight:400;font-style:italic;letter-spacing:-.015em;font-size:1.13em;line-height:.8}
`;

const FONTS = 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Instrument+Serif:ital@1&family=Plus+Jakarta+Sans:ital,wght@0,500;0,600;0,700;0,800;1,500&display=block';

if (typeof module !== 'undefined') module.exports = { phone, crop, push, BASE_CSS, FONTS };
