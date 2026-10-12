import * as x from "@thatopen/components";
import { TechnicalDrawings as ct, DxfManager as bt } from "@thatopen/components";
import * as q from "@thatopen/components-front";
import { LitElement as nt, css as it, html as ot } from "lit";
import { property as R, state as Yt } from "lit/decorators.js";
import * as I from "three";
import { CSS2DObject as Gt } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { createRef as z, ref as X } from "lit/directives/ref.js";
import * as d from "@thatopen/ui";
import { Manager as Q } from "@thatopen/ui";
import * as ft from "@thatopen/fragments";
class Ht {
  constructor(t, e) {
    this._group = new I.Group(), this._frustum = new I.Frustum(), this._frustumMat = new I.Matrix4(), this._regenerateDelay = 200, this._regenerateCounter = 0, this.material = new I.LineBasicMaterial({ color: "#2e3338" }), this.numbers = new I.Group(), this.maxRegenerateRetrys = 4, this.gridsFactor = 5, this._scaleX = 1, this._scaleY = 1, this._offsetX = 0, this._offsetY = 0, this._camera = t, this._container = e;
    const n = this.newGrid(-1), i = this.newGrid(-2);
    this.grids = { main: n, secondary: i }, this._group.add(i, n, this.numbers);
  }
  set scaleX(t) {
    this._scaleX = t, this.regenerate();
  }
  get scaleX() {
    return this._scaleX;
  }
  set scaleY(t) {
    this._scaleY = t, this.regenerate();
  }
  get scaleY() {
    return this._scaleY;
  }
  set offsetX(t) {
    this._offsetX = t, this.regenerate();
  }
  get offsetX() {
    return this._offsetX;
  }
  set offsetY(t) {
    this._offsetY = t, this.regenerate();
  }
  get offsetY() {
    return this._offsetY;
  }
  get() {
    return this._group;
  }
  dispose() {
    const { main: t, secondary: e } = this.grids;
    t.removeFromParent(), e.removeFromParent(), t.geometry.dispose(), t.material.dispose(), e.geometry.dispose(), e.material.dispose();
  }
  regenerate() {
    if (!this.isGridReady()) {
      if (this._regenerateCounter++, this._regenerateCounter > this.maxRegenerateRetrys)
        throw new Error("Grid could not be regenerated");
      setTimeout(() => this.regenerate, this._regenerateDelay);
      return;
    }
    this._regenerateCounter = 0, this._camera.updateMatrix(), this._camera.updateMatrixWorld();
    const e = this._frustumMat.multiplyMatrices(
      this._camera.projectionMatrix,
      this._camera.matrixWorldInverse
    );
    this._frustum.setFromProjectionMatrix(e);
    const { planes: n } = this._frustum, i = n[0].constant * -n[0].normal.x, o = n[1].constant * -n[1].normal.x, s = n[2].constant * -n[2].normal.y, a = n[3].constant * -n[3].normal.y, l = Math.abs(i - o), c = Math.abs(a - s), { clientWidth: m, clientHeight: u } = this._container, p = Math.max(m, u), h = Math.max(l, c) / p, _ = Math.ceil(Math.log10(l / this.scaleX)), w = Math.ceil(Math.log10(c / this.scaleY)), y = 10 ** (_ - 2) * this.scaleX, f = 10 ** (w - 2) * this.scaleY, g = y * this.gridsFactor, v = f * this.gridsFactor, $ = Math.ceil(c / v), S = Math.ceil(l / g), O = Math.ceil(c / f), F = Math.ceil(l / y), B = y * Math.ceil(o / y), L = f * Math.ceil(s / f), A = g * Math.ceil(o / g), U = v * Math.ceil(s / v), j = [...this.numbers.children];
    for (const M of j)
      M.removeFromParent();
    this.numbers.children = [];
    const C = [], k = 9 * h, D = 1e4, Z = A + this._offsetX, At = Math.round(Math.abs(Z / this.scaleX) * D) / D, zt = (S - 1) * g, Ft = Math.round(Math.abs((Z + zt) / this.scaleX) * D) / D, Bt = Math.max(At, Ft).toString().length * k;
    let st = Math.ceil(Bt / g) * g;
    for (let M = 0; M < S; M++) {
      let T = A + M * g;
      C.push(T, a, 0, T, s, 0), T = Math.round(T * D) / D, st = Math.round(st * D) / D;
      const W = T % st;
      if (!(g < 1 || v < 1) && Math.abs(W) > 0.01)
        continue;
      const lt = this.newNumber((T + this._offsetX) / this.scaleX), Xt = 12 * h;
      lt.position.set(T, s + Xt, 0);
    }
    for (let M = 0; M < $; M++) {
      const T = U + M * v;
      C.push(o, T, 0, i, T, 0);
      const W = this.newNumber(T / this.scaleY);
      let at = 12;
      W.element.textContent && (at += 4 * W.element.textContent.length);
      const lt = at * h;
      W.position.set(o + lt, T, 0);
    }
    const rt = [];
    for (let M = 0; M < F; M++) {
      const T = B + M * y;
      rt.push(T, a, 0, T, s, 0);
    }
    for (let M = 0; M < O; M++) {
      const T = L + M * f;
      rt.push(o, T, 0, i, T, 0);
    }
    const jt = new I.BufferAttribute(new Float32Array(C), 3), Nt = new I.BufferAttribute(new Float32Array(rt), 3), { main: Vt, secondary: Ut } = this.grids;
    Vt.geometry.setAttribute("position", jt), Ut.geometry.setAttribute("position", Nt);
  }
  newNumber(t) {
    const e = document.createElement("bim-label");
    e.textContent = String(Math.round(t * 100) / 100);
    const n = new Gt(e);
    return this.numbers.add(n), n;
  }
  newGrid(t) {
    const e = new I.BufferGeometry(), n = new I.LineSegments(e, this.material);
    return n.frustumCulled = !1, n.renderOrder = t, n;
  }
  isGridReady() {
    const t = this._camera.projectionMatrix.elements;
    for (let e = 0; e < t.length; e++) {
      const n = t[e];
      if (Number.isNaN(n))
        return !1;
    }
    return !0;
  }
}
var qt = Object.defineProperty, Wt = Object.getOwnPropertyDescriptor, K = (r, t, e, n) => {
  for (var i = Wt(t, e), o = r.length - 1, s; o >= 0; o--)
    (s = r[o]) && (i = s(t, e, i) || i);
  return i && qt(t, e, i), i;
};
const mt = class mt extends nt {
  constructor() {
    super(...arguments), this._grid = null, this._world = null, this.resize = () => {
      this._world && this._grid && this._grid.regenerate();
    };
  }
  set gridColor(t) {
    if (this._gridColor = t, !(t && this._grid))
      return;
    const e = Number(t.replace("#", "0x"));
    Number.isNaN(e) || this._grid.material.color.setHex(e);
  }
  get gridColor() {
    return this._gridColor;
  }
  set gridScaleX(t) {
    this._gridScaleX = t, t && this._grid && (this._grid.scaleX = t);
  }
  get gridScaleX() {
    return this._gridScaleX;
  }
  set gridScaleY(t) {
    this._gridScaleY = t, t && this._grid && (this._grid.scaleY = t);
  }
  get gridScaleY() {
    return this._gridScaleY;
  }
  get gridOffsetX() {
    var t;
    return ((t = this._grid) == null ? void 0 : t.offsetX) || 0;
  }
  set gridOffsetX(t) {
    this._grid && (this._grid.offsetX = t);
  }
  get gridOffsetY() {
    var t;
    return ((t = this._grid) == null ? void 0 : t.offsetY) || 0;
  }
  set gridOffsetY(t) {
    this._grid && (this._grid.offsetY = t);
  }
  set components(t) {
    this.dispose();
    const n = t.get(x.Worlds).create();
    this._world = n, n.scene = new x.SimpleScene(t), n.scene.setup(), n.renderer = new q.RendererWith2D(t, this);
    const i = new x.OrthoPerspectiveCamera(t);
    n.camera = i;
    const o = new Ht(i.threeOrtho, this);
    this._grid = o, n.scene.three.add(o.get()), i.controls.addEventListener(
      "update",
      () => o.regenerate()
    ), setTimeout(async () => {
      n.camera.updateAspect(), i.set("Plan"), await i.controls.setLookAt(0, 0, 100, 0, 0, 0), await i.projection.set("Orthographic"), i.controls.dollySpeed = 3, i.controls.draggingSmoothTime = 0.085, i.controls.maxZoom = 1e3, i.controls.zoom(4);
    });
  }
  get world() {
    return this._world;
  }
  dispose() {
    var t;
    (t = this.world) == null || t.dispose(), this._world = null, this._grid = null;
  }
  connectedCallback() {
    super.connectedCallback(), new ResizeObserver(this.resize).observe(this);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.dispose();
  }
  render() {
    return ot`<slot></slot>`;
  }
};
mt.styles = it`
    :host {
      position: relative;
      display: flex;
      min-width: 0px;
      height: 100%;
      background-color: var(--bim-ui_bg-base);
    }
  `;
let N = mt;
K([
  R({ type: String, attribute: "grid-color", reflect: !0 })
], N.prototype, "gridColor");
K([
  R({ type: Number, attribute: "grid-scale-x", reflect: !0 })
], N.prototype, "gridScaleX");
K([
  R({ type: Number, attribute: "grid-scale-y", reflect: !0 })
], N.prototype, "gridScaleY");
K([
  R({ type: Number, attribute: "grid-offset-x", reflect: !0 })
], N.prototype, "gridOffsetX");
K([
  R({ type: Number, attribute: "grid-offset-y", reflect: !0 })
], N.prototype, "gridOffsetY");
var Jt = Object.defineProperty, V = (r, t, e, n) => {
  for (var i = void 0, o = r.length - 1, s; o >= 0; o--)
    (s = r[o]) && (i = s(t, e, i) || i);
  return i && Jt(t, e, i), i;
};
const ut = class ut extends nt {
  constructor() {
    super(...arguments), this._defaults = {
      size: 60
    }, this._cssMatrix3D = "", this._matrix = new I.Matrix4(), this._onRightClick = new Event("rightclick"), this._onLeftClick = new Event("leftclick"), this._onTopClick = new Event("topclick"), this._onBottomClick = new Event("bottomclick"), this._onFrontClick = new Event("frontclick"), this._onBackClick = new Event("backclick"), this._camera = null, this._epsilon = (t) => Math.abs(t) < 1e-10 ? 0 : t;
  }
  set camera(t) {
    this._camera = t, this.updateOrientation();
  }
  get camera() {
    return this._camera;
  }
  updateOrientation() {
    if (!this.camera)
      return;
    this._matrix.extractRotation(this.camera.matrixWorldInverse);
    const { elements: t } = this._matrix;
    this._cssMatrix3D = `matrix3d(
      ${this._epsilon(t[0])},
      ${this._epsilon(-t[1])},
      ${this._epsilon(t[2])},
      ${this._epsilon(t[3])},
      ${this._epsilon(t[4])},
      ${this._epsilon(-t[5])},
      ${this._epsilon(t[6])},
      ${this._epsilon(t[7])},
      ${this._epsilon(t[8])},
      ${this._epsilon(-t[9])},
      ${this._epsilon(t[10])},
      ${this._epsilon(t[11])},
      ${this._epsilon(t[12])},
      ${this._epsilon(-t[13])},
      ${this._epsilon(t[14])},
      ${this._epsilon(t[15])})
    `;
  }
  render() {
    const t = this.size ?? this._defaults.size;
    return ot`
      <style>
        .face,
        .cube {
          width: ${t}px;
          height: ${t}px;
          transform: translateZ(-300px) ${this._cssMatrix3D};
        }

        .face-right {
          translate: ${t / 2}px 0 0;
        }

        .face-left {
          translate: ${-t / 2}px 0 0;
        }

        .face-top {
          translate: 0 ${t / 2}px 0;
        }

        .face-bottom {
          translate: 0 ${-t / 2}px 0;
        }

        .face-front {
          translate: 0 0 ${t / 2}px;
        }

        .face-back {
          translate: 0 0 ${-t / 2}px;
        }
      </style>
      <div class="parent">
        <div class="cube">
          <div
            class="face x-direction face-right"
            @click=${() => this.dispatchEvent(this._onRightClick)}
          >
            ${this.rightText}
          </div>
          <div
            class="face x-direction face-left"
            @click=${() => this.dispatchEvent(this._onLeftClick)}
          >
            ${this.leftText}
          </div>
          <div
            class="face y-direction face-top"
            @click=${() => this.dispatchEvent(this._onTopClick)}
          >
            ${this.topText}
          </div>
          <div
            class="face y-direction face-bottom"
            @click=${() => this.dispatchEvent(this._onBottomClick)}
          >
            ${this.bottomText}
          </div>
          <div
            class="face z-direction face-front"
            @click=${() => this.dispatchEvent(this._onFrontClick)}
          >
            ${this.frontText}
          </div>
          <div
            class="face z-direction face-back"
            @click=${() => this.dispatchEvent(this._onBackClick)}
          >
            ${this.backText}
          </div>
        </div>
      </div>
    `;
  }
};
ut.styles = it`
    :host {
      position: absolute;
      z-index: 999;
      bottom: 1rem;
      right: 1rem;
    }

    .parent {
      perspective: 400px;
    }

    .cube {
      position: relative;
      transform-style: preserve-3d;
    }

    .face {
      position: absolute;
      display: flex;
      justify-content: center;
      user-select: none;
      align-items: center;
      cursor: pointer;
      text-align: center;
      transition: all 0.2s;
      color: var(--bim-view-cube--c, white);
      font-size: var(--bim-view-cube--fz, --bim-ui_size-2xl);
    }

    .x-direction {
      // background-color: var(--bim-view-cube_x--bgc, #c93830DD);
      background-color: var(--bim-view-cube_x--bgc, #01a6bcde);
    }

    .x-direction:hover {
      background-color: var(--bim-ui_accent-base, white);
    }

    .y-direction {
      // background-color: var(--bim-view-cube_y--bgc, #54ff19DD);
      background-color: var(--bim-view-cube_y--bgc, #8d0ec8de);
    }

    .y-direction:hover {
      background-color: var(--bim-ui_accent-base, white);
    }

    .z-direction {
      // background-color: var(--bim-view-cube_z--bgc, #3041c9DD);
      background-color: var(--bim-view-cube_z--bgc, #2718afde);
    }

    .z-direction:hover {
      background-color: var(--bim-ui_accent-base, white);
    }

    .face-front {
      transform: rotateX(180deg);
    }

    .face-back {
      transform: rotateZ(180deg);
    }

    .face-top {
      transform: rotateX(90deg);
    }

    .face-bottom {
      transform: rotateX(270deg);
    }

    .face-right {
      transform: rotateY(-270deg) rotateX(180deg);
    }

    .face-left {
      transform: rotateY(-90deg) rotateX(180deg);
    }
  `;
let P = ut;
V([
  R({ type: Number, reflect: !0 })
], P.prototype, "size");
V([
  R({ type: String, attribute: "right-text", reflect: !0 })
], P.prototype, "rightText");
V([
  R({ type: String, attribute: "left-text", reflect: !0 })
], P.prototype, "leftText");
V([
  R({ type: String, attribute: "top-text", reflect: !0 })
], P.prototype, "topText");
V([
  R({ type: String, attribute: "bottom-text", reflect: !0 })
], P.prototype, "bottomText");
V([
  R({ type: String, attribute: "front-text", reflect: !0 })
], P.prototype, "frontText");
V([
  R({ type: String, attribute: "back-text", reflect: !0 })
], P.prototype, "backText");
V([
  Yt()
], P.prototype, "_cssMatrix3D");
var Kt = Object.defineProperty, Zt = (r, t, e, n) => {
  for (var i = void 0, o = r.length - 1, s; o >= 0; o--)
    (s = r[o]) && (i = s(t, e, i) || i);
  return i && Kt(t, e, i), i;
};
const pt = class pt extends nt {
  constructor() {
    super(...arguments), this.world = null, this._components = null, this._viewport = z();
  }
  set components(t) {
    var e;
    if (this._components = t, this.components) {
      const n = this.components.get(x.Worlds);
      this.world = n.create(), this.world.name = this.name;
    } else
      (e = this.world) == null || e.dispose(), this.world = null;
  }
  get components() {
    return this._components;
  }
  connectedCallback() {
    super.connectedCallback(), this.world && (this.world.enabled = !0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.world && (this.world.enabled = !1);
  }
  dispose() {
    this.components = null, this.remove();
  }
  firstUpdated() {
    const { value: t } = this._viewport;
    if (!(this.components && t && this.world))
      return;
    const e = new x.SimpleScene(this.components);
    this.world.scene = e, e.setup(), e.three.background = null;
    const n = new x.SimpleRenderer(this.components, t);
    this.world.renderer = n;
    const i = new x.OrthoPerspectiveCamera(this.components);
    this.world.camera = i;
    const o = this.components.get(x.Grids).create(this.world);
    o.material.uniforms.uColor.value = new I.Color(4342338), o.material.uniforms.uSize1.value = 2, o.material.uniforms.uSize2.value = 8;
  }
  onSlotChange() {
    const t = new Event("slotchange");
    this.dispatchEvent(t);
  }
  render() {
    return ot` <bim-viewport ${X(this._viewport)}>
      <slot @slotchange=${this.onSlotChange}></slot>
    </bim-viewport>`;
  }
};
pt.styles = it``;
let et = pt;
Zt([
  R({ type: String, reflect: !0 })
], et.prototype, "name");
const ht = class ht extends nt {
  constructor() {
    super(...arguments), this._canvasRef = z(), this._worldRef = z(), this._overlaysRef = z(), this._toolbarContainerRef = z(), this._vpToolbarRef = z(), this._paperToolbarRef = z(), this._renderer = null, this._resizeObserver = null, this._slots = /* @__PURE__ */ new Map(), this._paperLabels = /* @__PURE__ */ new Map(), this._renderPending = !1, this._pan = { x: 40, y: 40 }, this._zoom = 0.5, this._panning = !1, this._panStart = { x: 0, y: 0 }, this._panOrigin = { x: 0, y: 0 }, this._editingSlot = null, this._selectedSlot = null, this._selectedPaper = null, this._vpSection = null, this._vpNameInput = null, this._vpScaleDropdown = null, this._paperSection = null, this._paperSheetInput = null, this._paperLabelInput = null, this._paperSizeDropdown = null, this._paperOrientDropdown = null, this._dragSlot = null, this._dragType = null, this._dragStartClient = { x: 0, y: 0 }, this._dragTotalMovement = 0, this._dragOrigin = null, this._dragPaper = null, this._dragPaperStartClient = { x: 0, y: 0 }, this._dragPaperOrigin = { x: 0, y: 0 }, this._dragPaperTotalMovement = 0, this.components = null, this._onWheel = (t) => {
      t.preventDefault();
      const e = this.getBoundingClientRect(), n = t.clientX - e.left, i = t.clientY - e.top, o = Math.pow(0.999, t.deltaY), s = Math.max(0.05, Math.min(10, this._zoom * o));
      this._pan.x = n - (n - this._pan.x) * (s / this._zoom), this._pan.y = i - (i - this._pan.y) * (s / this._zoom), this._zoom = s, this._applyTransform(), this.requestRender();
    }, this._onMouseDown = (t) => {
      if (t.button === 0 && !this._editingSlot) {
        const e = t.composedPath().find(
          (n) => n instanceof Element && n.tagName === "BIM-PAPER-SPACE"
        );
        e ? (this._dragPaper = e, this._dragPaperStartClient = { x: t.clientX, y: t.clientY }, this._dragPaperOrigin = { x: e.offsetLeft, y: e.offsetTop }, this._dragPaperTotalMovement = 0) : (this._selectedSlot && this._selectSlot(null), this._selectedPaper && this._selectPaper(null));
      }
      t.button !== 1 && t.button !== 2 || (t.preventDefault(), this._panning = !0, this._panStart = { x: t.clientX, y: t.clientY }, this._panOrigin = { ...this._pan }, this.style.cursor = "grabbing");
    }, this._onMouseMove = (t) => {
      if (this._panning && (this._pan.x = this._panOrigin.x + (t.clientX - this._panStart.x), this._pan.y = this._panOrigin.y + (t.clientY - this._panStart.y), this._applyTransform(), this.requestRender()), this._dragSlot && this._dragType && this._dragOrigin) {
        const e = t.clientX - this._dragStartClient.x, n = t.clientY - this._dragStartClient.y;
        this._dragTotalMovement = Math.max(
          this._dragTotalMovement,
          Math.abs(e) + Math.abs(n)
        ), this._dragType === "move" ? this._applyMoveDrag(e, n) : this._applyResizeDrag(this._dragType, e, n), this.requestRender();
      }
      if (this._dragPaper) {
        const e = t.clientX - this._dragPaperStartClient.x, n = t.clientY - this._dragPaperStartClient.y;
        this._dragPaperTotalMovement = Math.max(
          this._dragPaperTotalMovement,
          Math.abs(e) + Math.abs(n)
        ), this._dragPaper.style.left = `${this._dragPaperOrigin.x + e / this._zoom}px`, this._dragPaper.style.top = `${this._dragPaperOrigin.y + n / this._zoom}px`, this.requestRender();
      }
    }, this._onMouseUp = (t) => {
      if (this._panning && (t.button === 1 || t.button === 2) && (this._panning = !1, this.style.cursor = "default"), this._dragSlot && t.button === 0) {
        const e = this._dragTotalMovement < 4, n = this._dragSlot;
        this._dragSlot = null, this._dragType = null, this._dragOrigin = null, e && this._handleSlotClick(n, t);
      }
      if (this._dragPaper && t.button === 0) {
        const e = this._dragPaperTotalMovement < 4, n = this._dragPaper;
        this._dragPaper = null, e && this._selectPaper(this._selectedPaper === n ? null : n);
      }
    }, this._onContextMenu = (t) => t.preventDefault();
  }
  /**
   * Registers a {@link DrawingViewport} to be rendered inside a
   * `bim-paper-space` element at the given position.
   *
   * @param paper      - The paper sheet that will display this viewport.
   * @param drawingId  - UUID of the {@link TechnicalDrawing} that owns the viewport.
   * @param viewportId - UUID of the {@link DrawingViewport} to render.
   * @param pos        - Top-left position of the viewport in mm, measured from the
   *                     drawing area origin (inside the paper margin).
   */
  addViewport(t, e, n, i) {
    var s;
    const o = {
      drawingId: e,
      viewportId: n,
      paper: t,
      x: i.x,
      y: i.y,
      borderEl: null,
      nameEl: null,
      handles: null
    };
    this._createBorderEl(o), (s = this._overlaysRef.value) == null || s.appendChild(o.borderEl), this._slots.has(t) || (this._slots.set(t, []), this._createPaperLabel(t)), this._slots.get(t).push(o), this.requestRender();
  }
  /**
   * Returns the HTML element that covers the screen area of the given viewport.
   * Useful for registering the viewport as a pointer-event source with an
   * external editor (e.g. `DrawingEditor.registerSource`).
   */
  getViewportElement(t, e) {
    var n;
    return ((n = this._findSlot(t, e)) == null ? void 0 : n.borderEl) ?? null;
  }
  /**
   * Returns the viewport placements registered on the given paper sheet as
   * plain data objects, suitable for passing directly to a DXF exporter.
   *
   * @param paper - The paper sheet to query.
   * @returns Array of `{ vp, x, y }` where `x` and `y` are mm from the
   *          top-left of the drawing area.
   */
  getSlotsForPaper(t) {
    return (this._slots.get(t) ?? []).map((e) => ({ drawingId: e.drawingId, viewportId: e.viewportId, x: e.x, y: e.y }));
  }
  /**
   * Enters edit mode for the given viewport: the board stops intercepting
   * pointer events on that slot so an external editor can take over.
   * The slot stays visually selected but drag/resize/click are suspended.
   */
  enterEditMode(t, e) {
    const n = this._findSlot(t, e);
    if (n) {
      this._editingSlot && this.exitEditMode(), this._editingSlot = n, n.borderEl.style.border = "2px dashed rgba(255,140,0,0.9)", n.borderEl.style.boxShadow = "0 0 0 1px rgba(255,140,0,0.3)", n.borderEl.style.cursor = "crosshair";
      for (const i of Object.values(n.handles))
        i.style.display = "none";
    }
  }
  /**
   * Exits edit mode, returning pointer control to the board.
   */
  exitEditMode() {
    if (!this._editingSlot)
      return;
    const t = this._editingSlot;
    if (this._editingSlot = null, this._selectedSlot === t) {
      t.borderEl.style.border = "2px solid rgba(0,136,255,1)", t.borderEl.style.boxShadow = "0 0 0 1px rgba(0,136,255,0.3)", t.borderEl.style.cursor = "move";
      for (const e of Object.values(t.handles))
        e.style.display = "block";
    } else
      t.borderEl.style.border = "1.5px solid rgba(0,136,255,0.7)", t.borderEl.style.boxShadow = "", t.borderEl.style.cursor = "pointer";
  }
  /**
   * Removes a previously registered viewport from a paper sheet.
   */
  removeViewport(t, e, n) {
    var s;
    const i = this._slots.get(t);
    if (!i)
      return;
    const o = i.findIndex((a) => a.drawingId === e && a.viewportId === n);
    o !== -1 && (i[o] === this._selectedSlot && this._selectSlot(null), i[o].borderEl.remove(), i.splice(o, 1), i.length === 0 && (this._slots.delete(t), (s = this._paperLabels.get(t)) == null || s.remove(), this._paperLabels.delete(t)), this.requestRender());
  }
  /**
   * Schedules a WebGL render pass on the next animation frame.
   * Call this whenever drawing content changes (new annotation, projection
   * update, etc.). Multiple calls within the same frame collapse into one.
   */
  requestRender() {
    this._renderPending || (this._renderPending = !0, requestAnimationFrame(() => {
      this._renderPending = !1, this._doRender();
    }));
  }
  // ── Border / handle / paper-label creation ────────────────────────────────
  _createPaperLabel(t) {
    var n;
    const e = document.createElement("bim-label");
    e.style.cssText = "position:absolute;pointer-events:none;transition:none;--bim-label--c:var(--bim-ui_bg-contrast-100);--bim-label--fz:1.5rem;", (n = this._overlaysRef.value) == null || n.appendChild(e), this._paperLabels.set(t, e);
  }
  _createBorderEl(t) {
    const e = document.createElement("div");
    e.style.cssText = "position:absolute;box-sizing:border-box;border:1.5px solid rgba(0,136,255,0.7);pointer-events:auto;cursor:pointer;";
    const n = [
      { pos: "TL", left: "0%", top: "0%", cursor: "nwse-resize" },
      { pos: "T", left: "50%", top: "0%", cursor: "ns-resize" },
      { pos: "TR", left: "100%", top: "0%", cursor: "nesw-resize" },
      { pos: "L", left: "0%", top: "50%", cursor: "ew-resize" },
      { pos: "R", left: "100%", top: "50%", cursor: "ew-resize" },
      { pos: "BL", left: "0%", top: "100%", cursor: "nesw-resize" },
      { pos: "B", left: "50%", top: "100%", cursor: "ns-resize" },
      { pos: "BR", left: "100%", top: "100%", cursor: "nwse-resize" }
    ], i = {};
    for (const s of n) {
      const a = document.createElement("div");
      a.style.cssText = `position:absolute;width:8px;height:8px;background:#fff;border:1.5px solid rgba(0,136,255,0.9);border-radius:2px;transform:translate(-50%,-50%);display:none;pointer-events:none;left:${s.left};top:${s.top};cursor:${s.cursor};`, a.addEventListener(
        "mousedown",
        (l) => this._onHandleMouseDown(t, s.pos, l)
      ), e.appendChild(a), i[s.pos] = a;
    }
    e.addEventListener(
      "mousedown",
      (s) => this._onBorderMouseDown(t, s)
    );
    const o = document.createElement("bim-label");
    o.textContent = this._nameLabel(this._resolveVp(t)), o.style.cssText = "position:absolute;top:-18px;left:0;pointer-events:none;--bim-label--c:rgba(0,136,255,0.85);", e.appendChild(o), t.borderEl = e, t.nameEl = o, t.handles = i;
  }
  // ── Selection ──────────────────────────────────────────────────────────────
  _selectSlot(t) {
    if (this._selectedSlot) {
      const e = this._selectedSlot;
      e.borderEl.style.border = "1.5px solid rgba(0,136,255,0.7)", e.borderEl.style.boxShadow = "", e.borderEl.style.cursor = "pointer";
      for (const n of Object.values(e.handles))
        n.style.display = "none", n.style.pointerEvents = "none";
      this.dispatchEvent(
        new CustomEvent("viewportdeselect", {
          detail: { paper: e.paper, drawingId: e.drawingId, viewportId: e.viewportId },
          bubbles: !0,
          composed: !0
        })
      );
    }
    if (t && this._selectPaper(null), this._selectedSlot = t, t) {
      t.borderEl.style.border = "2px solid rgba(0,136,255,1)", t.borderEl.style.boxShadow = "0 0 0 1px rgba(0,136,255,0.3)", t.borderEl.style.cursor = "move";
      for (const e of Object.values(t.handles))
        e.style.display = "block", e.style.pointerEvents = "auto";
      this._showVpToolbar(this._resolveVp(t)), this.dispatchEvent(
        new CustomEvent("viewportselect", {
          detail: { paper: t.paper, drawingId: t.drawingId, viewportId: t.viewportId },
          bubbles: !0,
          composed: !0
        })
      );
    } else
      this._hideToolbar();
  }
  _selectPaper(t) {
    if (this._selectedPaper) {
      const e = this._selectedPaper;
      e.style.outline = "", e.style.outlineOffset = "", this._selectedPaper = null, this.dispatchEvent(
        new CustomEvent("paperdeselect", {
          detail: { paper: e },
          bubbles: !0,
          composed: !0
        })
      );
    }
    t && this._selectSlot(null), this._selectedPaper = t, t ? (t.style.outline = "5px solid rgba(255,140,0,0.9)", t.style.outlineOffset = "6px", this._showPaperToolbar(t), this.dispatchEvent(
      new CustomEvent("paperselect", {
        detail: { paper: t },
        bubbles: !0,
        composed: !0
      })
    )) : this._selectedSlot || this._hideToolbar();
  }
  _showVpToolbar(t) {
    this._vpSection && (this._vpSection.label = (t == null ? void 0 : t.name) || "Viewport"), this._vpNameInput && (this._vpNameInput.value = (t == null ? void 0 : t.name) ?? ""), this._vpScaleDropdown && (this._vpScaleDropdown.value = [String((t == null ? void 0 : t.drawingScale) ?? 100)]), this._vpToolbarRef.value && (this._vpToolbarRef.value.style.display = ""), this._paperToolbarRef.value && (this._paperToolbarRef.value.style.display = "none");
    const e = this._toolbarContainerRef.value;
    e && (e.style.display = "block");
  }
  _showPaperToolbar(t) {
    this._paperSection && (this._paperSection.label = t.label || `${t.size} · ${t.orientation}`), this._paperSheetInput && (this._paperSheetInput.value = t.sheetNumber), this._paperLabelInput && (this._paperLabelInput.value = t.label), this._paperSizeDropdown && (this._paperSizeDropdown.value = [t.size]), this._paperOrientDropdown && (this._paperOrientDropdown.value = [t.orientation]), this._vpToolbarRef.value && (this._vpToolbarRef.value.style.display = "none"), this._paperToolbarRef.value && (this._paperToolbarRef.value.style.display = "");
    const e = this._toolbarContainerRef.value;
    e && (e.style.display = "block");
  }
  _hideToolbar() {
    const t = this._toolbarContainerRef.value;
    t && (t.style.display = "none");
  }
  // ── Drag start ────────────────────────────────────────────────────────────
  _onBorderMouseDown(t, e) {
    e.button === 0 && t !== this._editingSlot && (e.stopPropagation(), this._startDrag(t, "move", e));
  }
  _onHandleMouseDown(t, e, n) {
    n.button === 0 && t !== this._editingSlot && (n.stopPropagation(), this._startDrag(t, e, n));
  }
  _startDrag(t, e, n) {
    const i = this._resolveVp(t);
    i && (this._dragSlot = t, this._dragType = e, this._dragStartClient = { x: n.clientX, y: n.clientY }, this._dragTotalMovement = 0, this._dragOrigin = {
      x: t.x,
      y: t.y,
      left: i.left,
      right: i.right,
      top: i.top,
      bottom: i.bottom
    });
  }
  // ── Coordinate helpers ────────────────────────────────────────────────────
  _findSlot(t, e) {
    for (const n of this._slots.values()) {
      const i = n.find((o) => o.drawingId === t && o.viewportId === e);
      if (i)
        return i;
    }
    return null;
  }
  _resolveVp(t) {
    if (!this.components)
      return null;
    const e = this.components.get(ct).list.get(t.drawingId);
    return (e == null ? void 0 : e.viewports.get(t.viewportId)) ?? null;
  }
  _getPxPerMm(t) {
    return t.drawingAreaEl.getBoundingClientRect().width / (t.widthMm - 2 * t.margin);
  }
  // ── Drag apply ───────────────────────────────────────────────────────────
  _applyMoveDrag(t, e) {
    const n = this._dragSlot, i = this._dragOrigin, o = this._resolveVp(n);
    if (!o)
      return;
    const s = n.paper, a = this._getPxPerMm(s), c = (s.drawingSlotEl ?? s.drawingAreaEl).getBoundingClientRect(), m = c.width / a, u = c.height / a, p = (o.right - o.left) * (1e3 / o.drawingScale), b = (o.top - o.bottom) * (1e3 / o.drawingScale);
    n.x = Math.max(0, Math.min(m - p, i.x + t / a)), n.y = Math.max(0, Math.min(u - b, i.y + e / a));
  }
  _applyResizeDrag(t, e, n) {
    const i = this._dragSlot, o = this._dragOrigin, s = this._resolveVp(i);
    if (!s)
      return;
    const a = i.paper, l = this._getPxPerMm(a) * (1e3 / s.drawingScale), c = e / l, m = n / l;
    t.includes("L") && (s.left = o.left + c), t.includes("R") && (s.right = o.right + c), t.includes("T") && (s.top = o.top - m), t.includes("B") && (s.bottom = o.bottom - m);
    const u = s.drawingScale, p = this._getPxPerMm(a), h = (a.drawingSlotEl ?? a.drawingAreaEl).getBoundingClientRect(), _ = h.width / p, w = h.height / p, y = (_ - i.x) * u / 1e3, f = (w - i.y) * u / 1e3, g = 0.1;
    t.includes("L") && (s.left = Math.max(s.left, s.right - y), s.left = Math.min(s.left, s.right - g)), t.includes("R") && (s.right = Math.min(s.right, s.left + y), s.right = Math.max(s.right, s.left + g)), t.includes("T") && (s.top = Math.min(s.top, s.bottom + f), s.top = Math.max(s.top, s.bottom + g)), t.includes("B") && (s.bottom = Math.max(s.bottom, s.top - f), s.bottom = Math.min(s.bottom, s.top - g));
  }
  // ── Render ────────────────────────────────────────────────────────────────
  _nameLabel(t) {
    if (!t)
      return "";
    const e = t.name ?? "", n = `1:${t.drawingScale}`;
    return e ? `${e} - ${n}` : n;
  }
  /** Traverses the camera's parent chain to find the owning THREE.Scene. */
  _sceneOf(t) {
    let e = t.camera;
    for (; e; ) {
      if (e instanceof I.Scene)
        return e;
      e = e.parent;
    }
    return null;
  }
  _doRender() {
    const t = this._renderer;
    if (!t || this._slots.size === 0)
      return;
    const e = this.getBoundingClientRect(), n = e.width, i = e.height;
    t.setScissorTest(!1), t.setClearColor(0, 0), t.clear(), t.setScissorTest(!0);
    for (const [o, s] of this._slots) {
      const a = this._paperLabels.get(o);
      if (a) {
        const b = o.getBoundingClientRect(), h = (b.left - e.left - this._pan.x) / this._zoom, _ = (b.top - e.top - this._pan.y) / this._zoom - 42;
        a.style.left = `${h}px`, a.style.top = `${_}px`;
        const w = [o.sheetNumber, o.label].filter(Boolean);
        a.textContent = w.length ? w.join(": ") : "";
      }
      const l = o.drawingAreaEl;
      if (!l)
        continue;
      const c = l.getBoundingClientRect(), m = c.width / (o.widthMm - 2 * o.margin), u = o.drawingSlotEl ?? l, p = u !== l ? u.getBoundingClientRect() : c;
      for (const b of s) {
        const h = this._resolveVp(b), _ = h ? this._sceneOf(h) : null, w = h ? (h.right - h.left) * (1e3 / h.drawingScale) : 0, y = h ? (h.top - h.bottom) * (1e3 / h.drawingScale) : 0, f = p.left - e.left + b.x * m, g = p.top - e.top + b.y * m, v = w * m, $ = y * m, S = (f - this._pan.x) / this._zoom, O = (g - this._pan.y) / this._zoom, F = v / this._zoom, B = $ / this._zoom;
        if (b.borderEl.style.left = `${S}px`, b.borderEl.style.top = `${O}px`, b.borderEl.style.width = `${F}px`, b.borderEl.style.height = `${B}px`, b.nameEl.textContent = this._nameLabel(h), !_ || !h || f + v <= 0 || f >= n || g + $ <= 0 || g >= i)
          continue;
        const L = Math.round(f), A = Math.round(i - g - $), U = Math.round(v), j = Math.round($);
        t.setScissor(L, A, U, j), t.setViewport(L, A, U, j), t.setClearColor(16777215, 1), t.clear(), t.render(_, h.camera);
      }
    }
    t.setScissorTest(!1);
  }
  // ── Pan / zoom ────────────────────────────────────────────────────────────
  _applyTransform() {
    const t = `translate(${this._pan.x}px,${this._pan.y}px) scale(${this._zoom})`;
    this._worldRef.value && (this._worldRef.value.style.transform = t), this._overlaysRef.value && (this._overlaysRef.value.style.transform = t);
  }
  _handleSlotClick(t, e) {
    e.detail >= 2 ? this.dispatchEvent(
      new CustomEvent("viewportactivate", {
        detail: { paper: t.paper, drawingId: t.drawingId, viewportId: t.viewportId },
        bubbles: !0,
        composed: !0
      })
    ) : this._selectSlot(this._selectedSlot === t ? null : t);
  }
  // ── Lifecycle ─────────────────────────────────────────────────────────────
  connectedCallback() {
    super.connectedCallback(), this.addEventListener("wheel", this._onWheel, { passive: !1 }), this.addEventListener("mousedown", this._onMouseDown), this.addEventListener("contextmenu", this._onContextMenu), window.addEventListener("mousemove", this._onMouseMove), window.addEventListener("mouseup", this._onMouseUp);
  }
  disconnectedCallback() {
    var t, e;
    super.disconnectedCallback(), this.removeEventListener("wheel", this._onWheel), this.removeEventListener("mousedown", this._onMouseDown), this.removeEventListener("contextmenu", this._onContextMenu), window.removeEventListener("mousemove", this._onMouseMove), window.removeEventListener("mouseup", this._onMouseUp), (t = this._resizeObserver) == null || t.disconnect(), (e = this._renderer) == null || e.dispose(), this._renderer = null;
  }
  _buildVpToolbar() {
    const t = this._vpToolbarRef.value;
    if (!t)
      return;
    const e = document.createElement("bim-dropdown");
    e.label = "Scale", e.vertical = !0, e.style.width = "140px";
    for (const a of [25, 50, 100, 200, 500]) {
      const l = document.createElement("bim-option");
      l.label = `1:${a}`, l.value = String(a), e.appendChild(l);
    }
    e.addEventListener("change", () => {
      if (!this._selectedSlot)
        return;
      const a = this._resolveVp(this._selectedSlot);
      if (!a)
        return;
      const l = Number(e.value[0]);
      Number.isNaN(l) || (a.drawingScale = l, this.requestRender());
    });
    const n = document.createElement("bim-text-input");
    n.label = "Name", n.vertical = !0, n.placeholder = "Viewport name...", n.style.width = "140px", n.addEventListener("input", () => {
      if (!this._selectedSlot)
        return;
      const a = this._resolveVp(this._selectedSlot);
      a && (a.name = n.value, this._vpSection && (this._vpSection.label = n.value || "Viewport"), this.requestRender());
    });
    const i = document.createElement("bim-button");
    i.label = "Export DXF", i.icon = "mingcute:file-export-line", i.vertical = !0, i.addEventListener("click", () => {
      if (!this._selectedSlot || !this.components)
        return;
      const a = this._resolveVp(this._selectedSlot);
      if (!a)
        return;
      const c = this.components.get(ct).list.get(this._selectedSlot.drawingId);
      if (!c)
        return;
      const m = this.components.get(bt).exporter.export([
        { drawing: c, viewports: [{ viewport: a }] }
      ]);
      this.dispatchEvent(new CustomEvent("viewportdxfexport", {
        detail: { drawingId: this._selectedSlot.drawingId, viewportId: this._selectedSlot.viewportId, dxf: m },
        bubbles: !0,
        composed: !0
      }));
    });
    const o = document.createElement("bim-toolbar-section");
    o.appendChild(n), o.appendChild(e), t.appendChild(o);
    const s = document.createElement("bim-toolbar-section");
    s.label = "Export", s.appendChild(i), t.appendChild(s), this._vpSection = o, this._vpNameInput = n, this._vpScaleDropdown = e;
  }
  _buildPaperToolbar() {
    const t = this._paperToolbarRef.value;
    if (!t)
      return;
    const e = document.createElement("bim-text-input");
    e.label = "Sheet", e.vertical = !0, e.placeholder = "A-01...", e.style.width = "100px", e.addEventListener("input", () => {
      this._selectedPaper && (this._selectedPaper.sheetNumber = e.value, this.requestRender());
    });
    const n = document.createElement("bim-text-input");
    n.label = "Label", n.vertical = !0, n.placeholder = "Sheet label...", n.style.width = "160px", n.addEventListener("input", () => {
      this._selectedPaper && (this._selectedPaper.label = n.value, this._paperSection && (this._paperSection.label = n.value || `${this._selectedPaper.size} · ${this._selectedPaper.orientation}`), this.requestRender());
    });
    const i = document.createElement("bim-dropdown");
    i.label = "Size", i.vertical = !0;
    for (const c of ["A0", "A1", "A2", "A3", "A4"]) {
      const m = document.createElement("bim-option");
      m.label = c, m.value = c, i.appendChild(m);
    }
    i.addEventListener("change", () => {
      this._selectedPaper && (this._selectedPaper.size = i.value[0], this.requestRender());
    });
    const o = document.createElement("bim-dropdown");
    o.label = "Orientation", o.vertical = !0;
    for (const [c, m] of [["Landscape", "landscape"], ["Portrait", "portrait"]]) {
      const u = document.createElement("bim-option");
      u.label = c, u.value = m, o.appendChild(u);
    }
    o.addEventListener("change", () => {
      this._selectedPaper && (this._selectedPaper.orientation = o.value[0], this.requestRender());
    });
    const s = document.createElement("bim-button");
    s.label = "Export DXF", s.icon = "mingcute:file-export-line", s.vertical = !0, s.addEventListener("click", () => {
      var p;
      if (!this._selectedPaper || !this.components)
        return;
      const c = this.components.get(ct), m = /* @__PURE__ */ new Map();
      for (const { drawingId: b, viewportId: h, x: _, y: w } of this.getSlotsForPaper(this._selectedPaper)) {
        if (!m.has(b)) {
          const f = c.list.get(b);
          if (!f)
            continue;
          m.set(b, { drawing: f, viewports: [] });
        }
        const y = (p = c.list.get(b)) == null ? void 0 : p.viewports.get(h);
        y && m.get(b).viewports.push({ viewport: y, x: _, y: w });
      }
      const u = this.components.get(bt).exporter.export(
        [...m.values()],
        {
          widthMm: this._selectedPaper.widthMm,
          heightMm: this._selectedPaper.heightMm,
          margin: this._selectedPaper.margin
        }
      );
      this.dispatchEvent(new CustomEvent("paperdxfexport", {
        detail: { paper: this._selectedPaper, dxf: u },
        bubbles: !0,
        composed: !0
      }));
    });
    const a = document.createElement("bim-toolbar-section");
    a.appendChild(e), a.appendChild(n), a.appendChild(i), a.appendChild(o), t.appendChild(a);
    const l = document.createElement("bim-toolbar-section");
    l.label = "Export", l.appendChild(s), t.appendChild(l), this._paperSection = a, this._paperSheetInput = e, this._paperLabelInput = n, this._paperSizeDropdown = i, this._paperOrientDropdown = o;
  }
  firstUpdated() {
    var t;
    (t = this._toolbarContainerRef.value) == null || t.addEventListener(
      "mousedown",
      (e) => e.stopPropagation()
    ), this._buildVpToolbar(), this._buildPaperToolbar(), this._applyTransform(), this._renderer = new I.WebGLRenderer({
      canvas: this._canvasRef.value,
      antialias: !0,
      alpha: !0
    }), this._renderer.setPixelRatio(window.devicePixelRatio), this._renderer.autoClear = !1, this._renderer.setSize(this.clientWidth, this.clientHeight), this._resizeObserver = new ResizeObserver(() => {
      var e;
      (e = this._renderer) == null || e.setSize(this.clientWidth, this.clientHeight), this.requestRender();
    }), this._resizeObserver.observe(this);
  }
  render() {
    return ot`
      <div class="world" ${X(this._worldRef)}>
        <slot></slot>
      </div>
      <canvas ${X(this._canvasRef)}></canvas>
      <div class="overlays" ${X(this._overlaysRef)}></div>
      <div class="toolbar-container" ${X(this._toolbarContainerRef)}>
        <bim-toolbar style="border: 1px solid var(--bim-ui_bg-contrast-20); box-shadow: 0 2px 8px rgba(0,0,0,0.25);" ${X(this._vpToolbarRef)}></bim-toolbar>
        <bim-toolbar style="border: 1px solid var(--bim-ui_bg-contrast-20); box-shadow: 0 2px 8px rgba(0,0,0,0.25); display: none;" ${X(this._paperToolbarRef)}></bim-toolbar>
      </div>
    `;
  }
};
ht.styles = it`
    :host {
      display: block;
      position: relative;
      overflow: hidden;
      background-color: var(--bim-ui_bg-base);
      background-image:
        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
      background-size: 24px 24px;
      cursor: default;
      user-select: none;
    }

    canvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    .world,
    .overlays {
      position: absolute;
      top: 0;
      left: 0;
      transform-origin: 0 0;
    }

    .overlays {
      pointer-events: none;
    }

    .toolbar-container {
      position: absolute;
      bottom: 1rem;
      left: 50%;
      transform: translateX(-50%);
      display: none;
      z-index: 10;
    }
  `;
let dt = ht;
class un {
  /**
   * Initializes the custom elements for the BIM application.
   *
   * @remarks
   * This method should be called once during the application's initialization.
   *
   */
  static init() {
    Q.defineCustomElement("bim-view-cube", P), Q.defineCustomElement("bim-world-2d", N), Q.defineCustomElement("bim-world", et), Q.defineCustomElement("bim-sheet-board", dt);
  }
}
const G = (r, t) => {
  const e = t[r], n = (e == null ? void 0 : e.name) ?? r, i = n.trim().split(/\s+/);
  let o, s;
  return i[0] && i[0][0] && (o = i[0][0].toUpperCase(), i[0][1] && (s = i[0][1].toUpperCase())), i[1] && i[1][0] && (s = i[1][0].toUpperCase()), d.html`
    <div style="display: flex; gap: 0.25rem; overflow: hidden;">
      ${!(e != null && e.picture) && (o || s) ? d.html`
        <bim-label
          style=${d.styleMap({
    borderRadius: "999px",
    padding: "0.375rem",
    backgroundColor: "var(--bim-ui_bg-contrast-20)",
    aspectRatio: "1",
    fontSize: "0.7rem"
  })}>${o}${s}</bim-label>
        ` : null}
      <bim-label .img=${e == null ? void 0 : e.picture}>${n}</bim-label>
    </div>
  `;
}, E = {
  users: {
    "jhon.doe@example.com": {
      name: "Jhon Doe"
    }
  },
  priorities: {
    "On hold": {
      icon: "flowbite:circle-pause-outline",
      style: {
        backgroundColor: "var(--bim-ui_bg-contrast-20)",
        "--bim-icon--c": "#767676"
      }
    },
    Minor: {
      icon: "mingcute:arrows-down-fill",
      style: {
        backgroundColor: "var(--bim-ui_bg-contrast-20)",
        "--bim-icon--c": "#4CAF50"
      }
    },
    Normal: {
      icon: "fa6-solid:grip-lines",
      style: {
        backgroundColor: "var(--bim-ui_bg-contrast-20)",
        "--bim-icon--c": "#FB8C00"
      }
    },
    Major: {
      icon: "mingcute:arrows-up-fill",
      style: {
        backgroundColor: "var(--bim-ui_bg-contrast-20)",
        "--bim-icon--c": "#FF5252"
      }
    },
    Critical: {
      icon: "ph:warning",
      style: {
        backgroundColor: "var(--bim-ui_bg-contrast-20)",
        "--bim-icon--c": "#FB8C00"
      }
    }
  },
  statuses: {
    Active: {
      icon: "prime:circle-fill",
      style: {
        backgroundColor: "var(--bim-ui_bg-contrast-20)"
      }
    },
    "In Progress": {
      icon: "prime:circle-fill",
      style: {
        backgroundColor: "#fa89004d",
        "--bim-label--c": "#FB8C00",
        "--bim-icon--c": "#FB8C00"
      }
    },
    "In Review": {
      icon: "prime:circle-fill",
      style: {
        backgroundColor: "#9c6bff4d",
        "--bim-label--c": "#9D6BFF",
        "--bim-icon--c": "#9D6BFF"
      }
    },
    Done: {
      icon: "prime:circle-fill",
      style: {
        backgroundColor: "#4CAF504D",
        "--bim-label--c": "#4CAF50",
        "--bim-icon--c": "#4CAF50"
      }
    },
    Closed: {
      icon: "prime:circle-fill",
      style: {
        backgroundColor: "#414141",
        "--bim-label--c": "#727272",
        "--bim-icon--c": "#727272"
      }
    }
  },
  types: {
    Clash: {
      icon: "gg:close-r",
      style: {
        backgroundColor: "var(--bim-ui_bg-contrast-20)",
        "--bim-icon--c": "#FB8C00"
      }
    },
    Issue: {
      icon: "mdi:bug-outline",
      style: {
        backgroundColor: "var(--bim-ui_bg-contrast-20)",
        "--bim-icon--c": "#FF5252"
      }
    },
    Failure: {
      icon: "mdi:bug-outline",
      style: {
        backgroundColor: "var(--bim-ui_bg-contrast-20)",
        "--bim-icon--c": "#FF5252"
      }
    },
    Inquiry: {
      icon: "majesticons:comment-line",
      style: {
        backgroundColor: "var(--bim-ui_bg-contrast-20)",
        "--bim-icon--c": "#FF5252"
      }
    },
    Fault: {
      icon: "ph:warning",
      style: {
        backgroundColor: "var(--bim-ui_bg-contrast-20)",
        "--bim-icon--c": "#FF5252"
      }
    },
    Remark: {
      icon: "ph:note-blank-bold",
      style: {
        backgroundColor: "var(--bim-ui_bg-contrast-20)",
        "--bim-icon--c": "#FB8C00"
      }
    },
    Request: {
      icon: "mynaui:edit-one",
      style: {
        backgroundColor: "var(--bim-ui_bg-contrast-20)",
        "--bim-icon--c": "#9D6BFF"
      }
    }
  }
}, H = {
  padding: "0.25rem 0.5rem",
  borderRadius: "999px",
  "--bim-label--c": "var(--bim-ui_bg-contrast-100)"
}, Qt = {
  dueDate: (r) => {
    if (typeof r == "string" && r.trim() !== "")
      return new Date(r);
  },
  status: (r) => {
    if (Array.isArray(r) && r.length !== 0)
      return r[0];
  },
  type: (r) => {
    if (Array.isArray(r) && r.length !== 0)
      return r[0];
  },
  priority: (r) => {
    if (Array.isArray(r) && r.length !== 0)
      return r[0];
  },
  stage: (r) => {
    if (Array.isArray(r) && r.length !== 0)
      return r[0];
  },
  assignedTo: (r) => {
    if (Array.isArray(r) && r.length !== 0)
      return r[0];
  },
  labels: (r) => {
    if (Array.isArray(r))
      return new Set(r);
  }
}, yt = (r) => {
  const {
    components: t,
    topic: e,
    value: n,
    onCancel: i,
    onSubmit: o,
    styles: s
  } = r, a = o ?? (() => {
  }), l = t.get(x.BCFTopics), c = (n == null ? void 0 : n.title) ?? (e == null ? void 0 : e.title) ?? x.Topic.default.title, m = (n == null ? void 0 : n.status) ?? (e == null ? void 0 : e.status) ?? x.Topic.default.status, u = (n == null ? void 0 : n.type) ?? (e == null ? void 0 : e.type) ?? x.Topic.default.type, p = (n == null ? void 0 : n.priority) ?? (e == null ? void 0 : e.priority) ?? x.Topic.default.priority, b = (n == null ? void 0 : n.assignedTo) ?? (e == null ? void 0 : e.assignedTo) ?? x.Topic.default.assignedTo, h = (n == null ? void 0 : n.labels) ?? (e == null ? void 0 : e.labels) ?? x.Topic.default.labels, _ = (n == null ? void 0 : n.stage) ?? (e == null ? void 0 : e.stage) ?? x.Topic.default.stage, w = (n == null ? void 0 : n.description) ?? (e == null ? void 0 : e.description) ?? x.Topic.default.description, y = e != null && e.dueDate ? e.dueDate.toISOString().split("T")[0] : null, f = /* @__PURE__ */ new Set([...l.config.statuses]);
  m && f.add(m);
  const g = /* @__PURE__ */ new Set([...l.config.types]);
  u && g.add(u);
  const v = /* @__PURE__ */ new Set([...l.config.priorities]);
  p && v.add(p);
  const $ = /* @__PURE__ */ new Set([...l.config.users]);
  b && $.add(b);
  const S = /* @__PURE__ */ new Set([...l.config.labels]);
  if (h)
    for (const C of h)
      S.add(C);
  const O = /* @__PURE__ */ new Set([...l.config.stages]);
  _ && O.add(_);
  const F = z(), B = async () => {
    const { value: C } = F;
    if (!C)
      return;
    const k = d.getElementValue(
      C,
      Qt
    );
    if (e)
      e.set(k), await a(e);
    else {
      const D = l.create(k);
      await a(D);
    }
  }, L = z(), A = (C) => {
    const { value: k } = L;
    if (!k)
      return;
    const D = C.target;
    k.disabled = D.value.trim() === "";
  }, U = `btn-${d.Manager.newRandomId()}`, j = `btn-${d.Manager.newRandomId()}`;
  return d.html`
    <div ${d.ref(F)} style="display: flex; flex-direction: column; gap: 0.75rem;">
      <div style="display: flex; gap: 0.375rem">
        <bim-text-input @input=${A} vertical label="Title" name="title" .value=${c}></bim-text-input>
        ${e ? d.html`
            <bim-dropdown vertical label="Status" name="status" required>
              ${[...f].map((C) => d.html`<bim-option label=${C} .checked=${m === C}></bim-option>`)}
            </bim-dropdown>` : d.html``}
      </div>
      <div style="display: flex; gap: 0.375rem">
        <bim-dropdown vertical label="Type" name="type" required>
          ${[...g].map((C) => d.html`<bim-option label=${C} .checked=${u === C}></bim-option>`)}
        </bim-dropdown>
        <bim-dropdown vertical label="Priority" name="priority">
          ${[...v].map((C) => d.html`<bim-option label=${C} .checked=${p === C}></bim-option>`)}
        </bim-dropdown>
      </div>
      <div style="display: flex; gap: 0.375rem">
        <bim-dropdown vertical label="Labels" name="labels" multiple>
          ${[...S].map((C) => d.html`<bim-option label=${C} .checked=${h ? [...h].includes(C) : !1}></bim-option>`)}
        </bim-dropdown>
        <bim-dropdown vertical label="Assignee" name="assignedTo">
          ${[...$].map((C) => {
    const k = s != null && s.users ? s.users[C] : null, D = k ? k.name : C, Z = k == null ? void 0 : k.picture;
    return d.html`<bim-option label=${D} value=${C} .img=${Z} .checked=${b === C}></bim-option>`;
  })}
        </bim-dropdown>
      </div>
      <div style="display: flex; gap: 0.375rem">
        <bim-text-input vertical type="date" label="Due Date" name="dueDate" .value=${y}></bim-text-input> 
        <bim-dropdown vertical label="Stage" name="stage">
          ${[...O].map((C) => d.html`<bim-option label=${C} .checked=${_ === C}></bim-option>`)}
        </bim-dropdown>
      </div>
      <bim-text-input vertical label="Description" name="description" type="area" .value=${w ?? null}></bim-text-input>
      <div style="justify-content: right; display: flex; gap: 0.375rem">
        <style>
          #${j} {
            background-color: transparent;
          }

          #${j}:hover {
            --bim-label--c: #FF5252;
          }

          #${U}:hover {
            background-color: #329936;
          }
        </style>
        <bim-button id=${j} style="flex: 0" @click=${i} label="Cancel"></bim-button>
        <bim-button id=${U} style="flex: 0" @click=${B} ${d.ref(L)} label=${e ? "Update Topic" : "Add Topic"} icon=${e ? "tabler:refresh" : "mi:add"}></bim-button>
      </div>
    </div>
  `;
}, te = (r) => {
  const { components: t, modelUserData: e, worldName: n } = r, i = () => {
    if (!(t && n))
      return;
    const s = [...t.get(x.Worlds).list.values()].find((l) => "name" in l && l.name === n);
    if (!s)
      return;
    const a = document.createElement("input");
    a.type = "file", a.accept = ".ifc", a.onchange = async () => {
      if (a.files === null || a.files.length === 0)
        return;
      const l = a.files[0], c = await l.arrayBuffer(), m = new Uint8Array(c), u = l.name.replace(".ifc", ""), p = t.get(x.FragmentsManager), b = t.get(x.IfcLoader);
      b.settings.autoSetWasm = !1, b.settings.wasm = {
        path: "https://unpkg.com/web-ifc@0.0.77/",
        absolute: !1
      };
      const h = await b.load(m, !0, u, {
        userData: e
      });
      s.scene.three.add(h.object), h.useCamera(s.camera.three), p.core.update(!0);
    }, a.click();
  };
  return d.html`
    <bim-button
      data-ui-id="import-ifc"
      label="Load IFC"
      icon="mage:box-3d-fill"
      @click=${i}
    ></bim-button>
  `;
}, ee = (r) => d.Component.create(
  te,
  r
), ne = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loadIfc: ee
}, Symbol.toStringTag, { value: "Module" })), ie = (r) => {
  const { components: t, world: e } = r, n = () => {
    const i = document.createElement("input");
    i.type = "file", i.accept = ".frag", i.onchange = async () => {
      if (i.files === null || i.files.length === 0)
        return;
      const o = i.files[0], s = await o.arrayBuffer(), a = new Uint8Array(s), l = o.name.replace(".frag", ""), c = t.get(x.FragmentsManager), m = await c.core.load(a, {
        modelId: l
      });
      e && (e.scene.three.add(m.object), m.useCamera(e.camera.three), c.core.update(!0));
    }, i.click();
  };
  return d.html`
    <bim-button @click=${n}></bim-button>
  `;
}, oe = (r) => {
  const t = d.Component.create(
    ie,
    r
  ), [e] = t;
  return e.label = "Load FRAG", e.icon = "mage:box-3d-fill", t;
}, se = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loadFrag: oe
}, Symbol.toStringTag, { value: "Module" })), pn = {
  ...ne,
  ...se
}, tt = (r) => r === null ? [] : Array.isArray(r) ? r : [r], _t = (r, t) => {
  if (r.localId !== null && r.localId !== void 0 && t.push(r.localId), r.children)
    for (const e of r.children)
      _t(e, t);
}, J = (r, t, e, n = !1, i = /* @__PURE__ */ new Set()) => {
  const { localId: o, category: s, children: a } = t;
  if (s && a) {
    if (i.has(s)) {
      const c = [];
      for (const m of a) {
        const u = J(
          r,
          m,
          e,
          n,
          i
        );
        for (const p of tt(u))
          p.data.category || (p.data = { ...p.data, category: s }), c.push(p);
      }
      return c.length > 0 ? c : null;
    }
    if (n && a.length === 1) {
      const c = J(
        r,
        a[0],
        e,
        n,
        i
      );
      if (c && !Array.isArray(c))
        return c.data = { ...c.data, category: s }, c;
      if (Array.isArray(c)) {
        for (const m of c)
          m.data.category || (m.data = { ...m.data, category: s });
        return c;
      }
      return c;
    }
    const l = {
      data: {
        Name: s,
        category: s,
        modelId: r.modelId,
        children: JSON.stringify(a.map((c) => c.localId))
      }
    };
    for (const c of a) {
      const m = J(
        r,
        c,
        e,
        n,
        i
      );
      for (const u of tt(m))
        u.data.category || (u.data = { ...u.data, category: s }), l.children || (l.children = []), l.children.push(u);
    }
    return l;
  }
  if (o != null) {
    const l = e.get(o);
    if (l === void 0)
      return null;
    const c = {
      data: {
        Name: l,
        modelId: r.modelId,
        localId: o
      }
    };
    for (const m of a ?? []) {
      const u = J(
        r,
        m,
        e,
        n,
        i
      );
      for (const p of tt(u))
        c.children || (c.children = []), c.children.push(p);
    }
    return c;
  }
  return null;
}, re = async (r, t = !1, e = /* @__PURE__ */ new Set()) => {
  const n = [];
  for (const i of r) {
    const o = await i.getSpatialStructure(), s = [];
    _t(o, s);
    const a = /* @__PURE__ */ new Map();
    if (s.length > 0) {
      const u = await i.getItemsData(s, {
        attributesDefault: !1,
        attributes: ["Name"]
      });
      for (let p = 0; p < s.length; p++) {
        const b = u[p];
        if (!b)
          continue;
        const h = b.Name, _ = h && "value" in h ? h.value : void 0;
        a.set(
          s[p],
          _ == null ? "" : String(_)
        );
      }
    }
    const l = J(
      i,
      o,
      a,
      t,
      e
    ), c = tt(l);
    if (c.length === 0)
      continue;
    const m = {
      data: {
        Name: i.modelId,
        modelId: i.modelId
      },
      children: c
    };
    n.push(m);
  }
  return n;
}, vt = (r) => {
  const {
    components: t,
    models: e,
    collapseSingleChildCategories: n = !1,
    collapseCategories: i = []
  } = r, o = new Set(i), s = r.selectHighlighterName ?? "select", a = ({
    detail: m
  }) => {
    const { cell: u } = m;
    u.column === "Name" && !u.rowData.Name && (u.style.gridColumn = "1 / -1");
  }, l = (m) => {
    m.stopImmediatePropagation();
    const { row: u } = m.detail, p = t.get(q.Highlighter), b = t.get(x.FragmentsManager);
    u.onclick = async () => {
      if (!s)
        return;
      const {
        data: { modelId: h, localId: _, children: w }
      } = u;
      if (!(h && (_ !== void 0 || w)))
        return;
      const y = b.list.get(h);
      if (y) {
        if (_ !== void 0) {
          const f = await y.getItemsChildren([_]), g = f.length !== 0 ? new Set(f) : /* @__PURE__ */ new Set([_]), v = { [h]: g };
          p.highlightByID(s, v, !0);
        } else if (w) {
          const f = JSON.parse(w), g = await y.getItemsChildren(f), v = g.length !== 0 ? g : f, $ = { [h]: v };
          p.highlightByID(s, $, !0);
        }
      }
    };
  }, c = async (m) => {
    if (!m)
      return;
    const u = m;
    u.loadFunction = async () => new Promise((p) => {
      setTimeout(() => {
        p(
          re(
            e,
            n,
            o
          )
        );
      });
    }), u.loadData(!0);
  };
  return d.html`
    <bim-table @rowcreated=${l} @cellcreated=${a} ${d.ref(c)} headers-hidden>
      <bim-label slot="missing-data" style="--bim-icon--c: gold" icon="ic:round-warning">
        No models available to display the spatial structure!
      </bim-label>
    </bim-table>
  `;
}, ae = (r, t = !0) => {
  const e = d.Component.create(vt, r), [n, i] = e;
  if (n.hiddenColumns = ["modelId", "localId", "children", "category"], n.columns = ["Name"], n.headersHidden = !0, t) {
    const { components: o } = r, s = o.get(x.FragmentsManager);
    s.list.onItemSet.add(
      () => i({ models: s.list.values() })
    ), s.list.onItemDeleted.add(() => i());
  }
  return e;
}, le = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  spatialTree: ae,
  spatialTreeTemplate: vt
}, Symbol.toStringTag, { value: "Module" }));
let Y = {};
const gt = {
  _category: "Category",
  _localId: "LocalId",
  _guid: "Guid"
}, ce = (r, t, e, n, i, o) => {
  const s = {
    data: {
      type: "attribute",
      modelId: n,
      localId: i,
      Name: t in gt ? gt[t] : t,
      Value: e,
      dataType: o
    }
  };
  r.children || (r.children = []), r.children.push(s);
}, wt = (r, t, e) => {
  var c;
  r in Y || (Y[r] = /* @__PURE__ */ new Map());
  const n = Y[r], i = t._localId.value, o = (c = t[e.defaultItemNameKey]) == null ? void 0 : c.value, s = t._category.value, a = (o == null ? void 0 : o.toString().length) > 0 ? o.toString() : s ?? String(i);
  if (n.has(i))
    return {
      data: {
        modelId: r,
        localId: i,
        type: "item",
        Name: a
      }
    };
  const l = {
    data: {
      modelId: r,
      localId: i,
      type: "item",
      Name: a
    }
  };
  n.set(i, l);
  for (const m in t) {
    const u = t[m];
    if (!Array.isArray(u))
      ce(l, m, u.value, r, i, u.type);
    else {
      const p = {
        data: {
          Name: m,
          type: "relation"
        }
      };
      l.children || (l.children = []), l.children.push(p);
      for (const b of u) {
        const h = wt(r, b, e);
        p.children || (p.children = []), p.children.push(h);
      }
    }
  }
  return l;
}, de = async (r, t, e) => {
  const n = r.get(x.FragmentsManager);
  Object.keys(t).length === 0 && (Y = {});
  const i = [];
  for (const o in t) {
    const s = n.list.get(o);
    if (!s)
      continue;
    o in Y || (Y[o] = /* @__PURE__ */ new Map());
    const a = Y[o], l = t[o];
    for (const c of l) {
      let m = a.get(c);
      if (m) {
        i.push(m);
        continue;
      }
      const [u] = await s.getItemsData(
        [c],
        e.itemsDataConfig
      );
      m = wt(o, u, e), i.push(m);
    }
  }
  return i;
}, xt = (r) => {
  const t = {
    defaultItemNameKey: "Name",
    itemsDataConfig: {
      attributesDefault: !0,
      relationsDefault: { attributes: !1, relations: !1 },
      relations: {
        IsDefinedBy: { attributes: !0, relations: !0 },
        DefinesOccurrence: { attributes: !1, relations: !1 },
        ContainedInStructure: { attributes: !0, relations: !0 },
        ContainsElements: { attributes: !1, relations: !1 },
        Decomposes: { attributes: !1, relations: !1 },
        ObjectTypeOf: { attributes: !1, relations: !1 }
      }
    },
    ...r
  }, { components: e, modelIdMap: n, emptySelectionWarning: i } = r, o = Object.keys(n).reduce((l, c) => (c.includes("DELTA") || (l[c] = n[c]), l), {}), s = async (l) => {
    if (!l)
      return;
    const c = l;
    c.loadFunction = async () => de(e, o, t), await c.loadData(!0) && c.dispatchEvent(new Event("datacomputed"));
  }, a = ({
    detail: l
  }) => {
    const { cell: c } = l, { Name: m, Value: u } = c.rowData;
    m && u === void 0 && setTimeout(() => {
      c.style.gridColumn = "1 / -1";
    });
  };
  return d.html`
    <bim-table @cellcreated=${a} ${d.ref(s)}>
      ${i ? d.html`
            <bim-label slot="missing-data" style="--bim-icon--c: gold" icon="ic:round-warning">
              Select some elements to display its properties
            </bim-label>
            ` : null}
      <bim-label slot="error-loading" style="--bim-icon--c: #e72e2e" icon="bxs:error-alt">
        Something went wrong with the properties
      </bim-label>
    </bim-table>
  `;
}, me = /* @__PURE__ */ new Map(), ue = {
  METRE: "m",
  SQUARE_METRE: "m²",
  CUBIC_METRE: "m³"
}, pe = async (r, t) => {
  const n = r.get(x.FragmentsManager).list.get(t);
  if (!n)
    throw new Error(`ItemsDataUI: model ${t} not found.`);
  let i = me.get(n.modelId);
  if (!i) {
    const [o] = Object.values(await n.getItemsOfCategories([/UNITASSIGNMENT/])).flat(), [s] = await n.getItemsData([o], {
      // Units is the relation from the IfcUnitAssignment that holds the list of units in the project
      relations: { Units: { relations: !1, attributes: !0 } }
    });
    if (!Array.isArray(s.Units))
      return [];
    i = s.Units;
  }
  return i;
}, he = (r, t) => {
  const { components: e } = r;
  t.columns = [{ name: "Name", width: "12rem" }], t.visibleColumns = ["Name", "Value"], t.headersHidden = !0, t.dataTransform = {
    Value: (n, i) => {
      const { dataType: o, modelId: s } = i;
      if (!o)
        return n;
      const a = async (l) => {
        if (!(l && s))
          return;
        const c = await pe(e, s), m = o.replace("IFC", "").replace("MEASURE", "UNIT"), u = c.find((b) => b.UnitType && "value" in b.UnitType ? b.UnitType.value === m : !1);
        if (!u || !(u.Name && "value" in u.Name))
          return n;
        const p = `${n.toFixed(2)} ${ue[u.Name.value] ?? u.Name.value}`;
        l.textContent = p;
      };
      return d.html`<bim-label ${d.ref(a)}></bim-label>`;
    }
  };
}, be = (r) => {
  const t = d.Component.create(xt, r), [e] = t;
  return he(r, e), t;
}, fe = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  itemsData: be,
  itemsDataTemplate: xt
}, Symbol.toStringTag, { value: "Module" })), $t = (r) => {
  const { components: t } = r, e = r.missingDataMessage ?? "No models has been loaded yet", n = t.get(x.FragmentsManager), i = ({
    detail: s
  }) => {
    const { cell: a } = s;
    a.style.padding = "0.25rem 0";
  }, o = async (s) => {
    if (!s)
      return;
    const a = s, l = [];
    if (n.initialized)
      for (const [, c] of n.list) {
        if (!(c && !c.isDeltaModel))
          continue;
        const m = await c.getMetadata(), u = {
          data: {
            Name: c.modelId,
            modelId: c.modelId,
            metadata: JSON.stringify(m)
          }
        };
        l.push(u);
      }
    a.data = l;
  };
  return d.html`
    <bim-table ${d.ref(o)} @cellcreated=${i}>
      <bim-label slot="missing-data" style="--bim-icon--c: gold" icon="ic:round-warning">
        ${e}
      </bim-label>
    </bim-table>
  `;
}, ge = (r, t) => {
  const { components: e, actions: n, metaDataTags: i } = r, o = e.get(x.FragmentsManager), s = (n == null ? void 0 : n.dispose) ?? !0, a = (n == null ? void 0 : n.download) ?? !0, l = (n == null ? void 0 : n.visibility) ?? !0, c = i ?? [];
  t.hiddenColumns = ["modelId", "metadata"], t.headersHidden = !0, t.noIndentation = !0, t.dataTransform = {
    Name: (m, u) => {
      if (!o.initialized)
        return m;
      const { modelId: p, metadata: b } = u;
      if (!p)
        return m;
      const h = o.list.get(p);
      if (!h)
        return p;
      const _ = [];
      if (b) {
        const g = JSON.parse(b);
        for (const v of c) {
          const $ = g[v];
          if (!(typeof $ == "string" || typeof $ == "boolean" || typeof $ == "number"))
            continue;
          const S = d.html`
            <bim-label style="background-color: var(--bim-ui_main-base); padding: 0 0.25rem; color: var(--bim-ui_main-contrast); border-radius: 0.25rem;">${$}</bim-label>
            `;
          _.push(S);
        }
      }
      let w;
      if (s) {
        const g = () => o.core.disposeModel(h.modelId);
        w = d.html`<bim-button @click=${g} icon="mdi:delete"></bim-button>`;
      }
      let y;
      if (l) {
        const g = async ({ target: v }) => {
          v.loading = !0, await h.setVisible(
            void 0,
            v.hasAttribute("data-model-hidden")
          ), await o.core.update(!0), v.toggleAttribute("data-model-hidden"), v.icon = v.hasAttribute("data-model-hidden") ? "mdi:eye-off" : "mdi:eye", v.loading = !1;
        };
        y = d.html`<bim-button @click=${g} icon="mdi:eye"></bim-button>`;
      }
      let f;
      if (a) {
        const g = async () => {
          const v = await h.getBuffer(!1), $ = new File([v], `${h.modelId}.frag`), S = document.createElement("a");
          S.href = URL.createObjectURL($), S.download = $.name, S.click(), URL.revokeObjectURL(S.href);
        };
        f = d.html`<bim-button @click=${g} icon="flowbite:download-solid"></bim-button>`;
      }
      return d.html`
       <div style="display: flex; flex: 1; gap: var(--bim-ui_size-4xs); justify-content: space-between; overflow: auto;">
        <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 0 var(--bim-ui_size-4xs); flex-grow: 1; overflow: auto;">
          <div style="min-height: 1.75rem; overflow: auto; display: flex;">
            <bim-label style="white-space: normal;">${m}</bim-label>
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: var(--bim-ui_size-4xs); overflow: auto;">
            ${_}
          </div>
        </div>
        <div style="display: flex; align-self: flex-start; flex-shrink: 0;">
          ${f}
          ${y}
          ${w}
        </div>
       </div>
      `;
    }
  };
}, ye = (r, t = !0) => {
  const e = d.Component.create($t, r), [n, i] = e;
  if (ge(r, n), t) {
    const { components: o } = r, s = o.get(x.FragmentsManager), a = () => setTimeout(() => i());
    s.list.onItemSet.add(a), s.list.onItemDeleted.add(a);
  }
  return e;
}, _e = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  modelsList: ye,
  modelsListTemplate: $t
}, Symbol.toStringTag, { value: "Module" })), Ct = (r) => {
  var l;
  const { components: t } = r, e = r.missingDataMessage ?? "No viewpoints to display", n = t.get(x.Viewpoints), i = ((l = r.topic) == null ? void 0 : l.viewpoints) ?? n.list.keys(), o = [];
  for (const c of i) {
    const m = n.list.get(c);
    m && o.push(m);
  }
  const s = (c) => {
    if (!c)
      return;
    const m = c;
    m.data = o.map((u, p) => ({
      data: {
        Guid: u.guid,
        Title: u.title ?? `Viewpoint ${r.topic ? p + 1 : ""}`,
        Actions: ""
      }
    }));
  }, a = ({
    detail: c
  }) => {
    const { cell: m } = c;
    m.style.padding = "0.25rem";
  };
  return d.html`
    <bim-table ${d.ref(s)} @cellcreated=${a}>
      <bim-label slot="missing-data" icon="ph:warning-fill" style="--bim-icon--c: gold;">${e}</bim-label>
    </bim-table>
  `;
}, ve = (r, t) => {
  const { components: e, topic: n } = r;
  t.noIndentation = !0, t.headersHidden = !0, t.hiddenColumns = ["Guid"], t.columns = ["Title", { name: "Actions", width: "auto" }];
  const i = {
    selectComponents: !0,
    colorizeComponent: !0,
    resetColors: !0,
    updateCamera: !0,
    delete: !0,
    unlink: !!n,
    ...r.actions
  }, o = e.get(x.Viewpoints);
  t.dataTransform = {
    Actions: (s, a) => {
      const { Guid: l } = a;
      if (!(l && typeof l == "string"))
        return s;
      const c = o.list.get(l);
      if (!c)
        return s;
      const m = async ({ target: f }) => {
        f.loading = !0, await c.go(), f.loading = !1;
      };
      let u;
      if (i.selectComponents) {
        const f = async ({ target: g }) => {
          const v = e.get(x.FragmentsManager), $ = e.get(q.Highlighter);
          if (!$.isSetup)
            return;
          g.loading = !0;
          const S = await v.guidsToModelIdMap([
            ...c.selectionComponents
          ]);
          await $.highlightByID("select", S), g.loading = !1;
        };
        u = d.html`
          <bim-button label="Select Components" @click=${f}></bim-button>
        `;
      }
      let p;
      if (i.colorizeComponent) {
        const f = async ({ target: g }) => {
          g.loading = !0, await c.setColorizationState(!0), g.loading = !1;
        };
        p = d.html`
          <bim-button label="Colorize Components" @click=${f}></bim-button>
        `;
      }
      let b;
      if (i.resetColors) {
        const f = async ({ target: g }) => {
          g.loading = !0, await c.setColorizationState(!1), g.loading = !1;
        };
        b = d.html`
          <bim-button label="Reset Colors" @click=${f}></bim-button>
        `;
      }
      let h;
      if (i.updateCamera) {
        const f = () => c.updateCamera();
        h = d.html`
          <bim-button label="Update Camera" @click=${f}></bim-button>
        `;
      }
      let _;
      if (i.unlink) {
        const f = () => n == null ? void 0 : n.viewpoints.delete(c.guid);
        _ = d.html`
          <bim-button label="Unlink" @click=${f}></bim-button>
        `;
      }
      let w;
      if (i.delete) {
        const f = () => {
          o.list.delete(c.guid), d.ContextMenu.removeMenus();
        };
        w = d.html`
          <bim-button label="Delete" @click=${f}></bim-button>
        `;
      }
      let y;
      return Object.values(i).includes(!0) && (y = d.html`
          <bim-button icon="prime:ellipsis-v">
            <bim-context-menu>
              ${u}
              ${p}
              ${b}
              ${h}
              ${_}
              ${w}
            </bim-context-menu>
          </bim-button>
        `), d.html`
        <bim-button icon="ph:eye-fill" @click=${m}></bim-button>
        ${y}
      `;
    }
  };
}, St = (r, t = !0) => {
  const e = d.Component.create(Ct, r), [n, i] = e;
  if (ve(r, n), t) {
    const { components: o, topic: s } = r, a = o.get(x.Viewpoints);
    a.list.onItemUpdated.add(() => i()), a.list.onItemDeleted.add(() => i()), a.list.onCleared.add(() => i()), s ? (s.viewpoints.onItemAdded.add(() => i()), s.viewpoints.onItemDeleted.add(() => i()), s.viewpoints.onCleared.add(() => i())) : a.list.onItemSet.add(() => i());
  }
  return e;
}, we = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  viewpointsList: St,
  viewpointsListTemplate: Ct
}, Symbol.toStringTag, { value: "Module" })), Tt = (r) => {
  const { components: t } = r, e = r.missingDataMessage ?? "No topics to display", n = t.get(x.BCFTopics), i = r.topics ?? n.list.values(), o = (s) => {
    if (!s)
      return;
    const a = s;
    a.data = [...i].map((l) => {
      var c;
      return {
        data: {
          Guid: l.guid,
          Title: l.title,
          Status: l.status,
          Description: l.description ?? "",
          Author: l.creationAuthor,
          Assignee: l.assignedTo ?? "",
          Date: l.creationDate.toDateString(),
          DueDate: ((c = l.dueDate) == null ? void 0 : c.toDateString()) ?? "",
          Type: l.type,
          Priority: l.priority ?? "",
          Actions: ""
        }
      };
    });
  };
  return d.html`
    <bim-table no-indentation ${d.ref(o)}>
      <bim-label slot="missing-data" icon="ph:warning-fill" style="--bim-icon--c: gold;">${e}</bim-label>
    </bim-table>
  `;
}, xe = (r, t) => {
  const { dataStyles: e } = r;
  t.hiddenColumns.length === 0 && (t.hiddenColumns = ["Guid", "Actions"]), t.columns = ["Title"], t.dataTransform = {
    Priority: (n) => {
      if (typeof n != "string")
        return n;
      const o = ((e == null ? void 0 : e.priorities) ?? E.priorities)[n];
      return d.html`
            <bim-label
              .icon=${o == null ? void 0 : o.icon}
              style=${d.styleMap({ ...H, ...o == null ? void 0 : o.style })}
            >${n}
            </bim-label>
          `;
    },
    Status: (n) => {
      if (typeof n != "string")
        return n;
      const o = ((e == null ? void 0 : e.statuses) ?? E.statuses)[n];
      return d.html`
            <bim-label
              .icon=${o == null ? void 0 : o.icon}
              style=${d.styleMap({ ...H, ...o == null ? void 0 : o.style })}
            >${n}
            </bim-label>
          `;
    },
    Type: (n) => {
      if (typeof n != "string")
        return n;
      const o = ((e == null ? void 0 : e.types) ?? E.types)[n];
      return d.html`
            <bim-label
              .icon=${o == null ? void 0 : o.icon}
              style=${d.styleMap({ ...H, ...o == null ? void 0 : o.style })}
            >${n}
            </bim-label>
          `;
    },
    Author: (n) => typeof n != "string" ? n : G(n, (e == null ? void 0 : e.users) ?? E.users),
    Assignee: (n) => typeof n != "string" ? n : G(n, (e == null ? void 0 : e.users) ?? E.users)
  };
}, Mt = (r, t = !0) => {
  const e = d.Component.create(Tt, r), [n, i] = e;
  if (xe(r, n), t) {
    const { components: o, topics: s } = r, a = o.get(x.BCFTopics), l = () => i();
    if (a.list.onItemUpdated.add(l), a.list.onItemDeleted.add(l), s)
      for (const c of s)
        c.relatedTopics.onItemAdded.add(l), c.relatedTopics.onItemDeleted.add(l), c.relatedTopics.onCleared.add(l);
    else
      a.list.onItemSet.add(l);
  }
  return e;
}, $e = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  topicsList: Mt,
  topicsListTemplate: Tt
}, Symbol.toStringTag, { value: "Module" })), It = (r) => {
  const { topic: t, styles: e, viewpoint: n } = r, i = r.missingDataMessage ?? "The topic has no comments", o = (s) => {
    if (!s)
      return;
    const a = s;
    let l = t.comments.values();
    n && (l = [...t.comments.values()].filter(
      (c) => c.viewpoint === n.guid
    )), a.data = [...l].map((c) => ({
      data: {
        guid: c.guid,
        Comment: c.comment,
        author: (() => {
          const m = e;
          if (!m)
            return c.author;
          const u = m[c.author];
          return (u == null ? void 0 : u.name) ?? c.author;
        })()
      }
    }));
  };
  return d.html`
    <bim-table no-indentation ${d.ref(o)}>
      <bim-label slot="missing-data" icon="ph:warning-fill" style="--bim-icon--c: gold;">${i}</bim-label>
    </bim-table>
  `;
}, Ce = (r, t) => {
  const { topic: e, styles: n } = r, i = { delete: !0, ...r.actions };
  t.headersHidden = !0, t.hiddenColumns = ["guid", "author"], t.dataTransform = {
    Comment: (o, s) => {
      const { guid: a } = s;
      if (typeof a != "string")
        return o;
      const l = e.comments.get(a);
      if (!l)
        return o;
      const c = () => {
        e.comments.delete(a);
      };
      let m;
      if (i.delete) {
        const u = `btn-${d.Manager.newRandomId()}`;
        m = d.html`
          <div>
            <style>
              #${u} {
                background-color: transparent;
                --bim-label--c: var(--bim-ui_bg-contrast-60)
              }
  
              #${u}:hover {
                --bim-label--c: #FF5252;
              }
            </style>
            <bim-button @click=${c} id=${u} icon="majesticons:delete-bin"></bim-button>
          </div>
        `;
      }
      return d.html`
        <div style="display: flex; flex-direction: column; gap: 0.25rem; flex: 1">
          <div style="display: flex; justify-content: space-between;">
            <div style="display: flex; gap: 0.375rem;">
              ${G(l.author, n ?? E.users)}
              <bim-label style="color: var(--bim-ui_bg-contrast-40)">@ ${l.date.toDateString()}</bim-label>
            </div>
            ${m}
          </div>
          <bim-label style="margin-left: 1.7rem; white-space: normal">${l.comment}</bim-label>
        </div>
      `;
    }
  };
}, Dt = (r, t = !0) => {
  const e = d.Component.create(It, r), [n, i] = e;
  if (Ce(r, n), t) {
    const { topic: o } = r, s = () => i();
    o.comments.onItemSet.add(s), o.comments.onItemUpdated.add(s), o.comments.onItemDeleted.add(s), o.comments.onCleared.add(s);
  }
  return e;
}, Se = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  commentsList: Dt,
  commentsListTemplate: It
}, Symbol.toStringTag, { value: "Module" })), hn = {
  // ...worldsConfiguration,
  ...le,
  ...fe,
  ..._e,
  ...we,
  ...$e,
  ...Se
}, kt = (r, t) => {
  const { showInput: e, topic: n, styles: i } = r, o = {
    add: !0,
    delete: !0,
    ...r.actions
  }, s = `input-${d.Manager.newRandomId()}`, a = `btn-${d.Manager.newRandomId()}`, l = `btn-${d.Manager.newRandomId()}`, c = () => document.getElementById(a), m = () => document.getElementById(s), u = () => {
    const v = m();
    return v ? v.value.trim().length > 0 : !1;
  }, p = () => {
    t({ showInput: !0 });
  }, b = () => {
    const v = m(), $ = u();
    v && $ && (n.createComment(v.value), t({ showInput: !1 }));
  }, h = () => {
    t({ showInput: !1 });
  }, _ = () => {
    const v = c();
    if (!v)
      return;
    if (!m()) {
      v.disabled = !0;
      return;
    }
    v.disabled = !u();
  }, w = d.html`
    ${o.add ? d.html`<bim-button @click=${p} label="Add Comment" icon="majesticons:comment-line"></bim-button>` : null}
  `, y = (v) => {
    v.code === "Enter" && v.ctrlKey && b();
  }, f = d.html`
    <bim-text-input id=${s} @input=${_} @keypress=${y} type="area"></bim-text-input>

    <div style="justify-content: right; display: flex; gap: 0.375rem">
      <style>
        #${a} {
          background-color: #329936;
        }  

        #${l} {
          background-color: transparent;
        }

        #${l}:hover {
          --bim-label--c: #FF5252;
        }
      </style>

      <bim-button style="flex: 0" id=${l} @click=${h} label="Cancel"></bim-button>
      <bim-button style="flex: 0" id=${a} @click=${b} label="Accept" icon="material-symbols:check" disabled></bim-button>
    </div>
  `, [g] = Dt({
    topic: n,
    actions: o,
    styles: i ?? E.users
  });
  return d.html`
    <div style="display: flex; flex-direction: column; gap: 0.5rem">
      ${g}
      ${e ? f : w}
    </div>
  `;
}, Te = (r) => d.Component.create(kt, r), Me = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  topicComments: Te,
  topicCommentsSectionTemplate: kt
}, Symbol.toStringTag, { value: "Module" })), Et = (r, t) => {
  const { components: e, editing: n, topic: i, styles: o } = r, s = {
    update: !0,
    ...r.actions
  }, a = (o == null ? void 0 : o.priorities) ?? E.priorities, l = (o == null ? void 0 : o.statuses) ?? E.statuses, c = (o == null ? void 0 : o.types) ?? E.types;
  let m;
  i != null && i.priority && (m = a[i.priority]);
  let u;
  i != null && i.type && (u = c[i.type]);
  let p;
  i != null && i.type && (p = l[i.status]);
  let b, h;
  return n ? b = yt({
    components: e,
    topic: i,
    styles: o,
    onSubmit: () => {
      t({ editing: !1 });
    },
    onCancel: () => {
      t({ editing: !1 });
    }
  }) : h = d.html`
      <div>
        <bim-label>Title</bim-label>
        <bim-label style="--bim-label--c: var(--bim-ui_bg-contrast-100)">${i.title}</bim-label>
      </div>

      ${i.description ? d.html`
            <div>
              <bim-label>Description</bim-label>
              <bim-label style="--bim-label--c: var(--bim-ui_bg-contrast-100); white-space: normal">${i.description}</bim-label>
            </div>
          ` : null}

      <div style="display: flex; gap: 0.375rem">
        <bim-label>Status</bim-label>
        <bim-label .icon=${p == null ? void 0 : p.icon} style=${d.styleMap({ ...H, ...p == null ? void 0 : p.style })}
        >${i.status}
        </bim-label>
      </div>

      <div style="display: flex; gap: 0.375rem">
        <bim-label>Type</bim-label>
        <bim-label .icon=${u == null ? void 0 : u.icon} style=${d.styleMap({ ...H, ...u == null ? void 0 : u.style })}
        >${i.type}
        </bim-label>
      </div>

      ${i.priority ? d.html`
            <div style="display: flex; gap: 0.375rem">
              <bim-label>Priority</bim-label>
              <bim-label .icon=${m == null ? void 0 : m.icon} style=${d.styleMap({ ...H, ...m == null ? void 0 : m.style })}
              >${i.priority}
              </bim-label>
            </div>` : null}

      <div style="display: flex; gap: 0.375rem">
        <bim-label>Author</bim-label>
        ${G(i.creationAuthor, (o == null ? void 0 : o.users) ?? E.users)}
      </div>

      ${i.assignedTo ? d.html`
          <div style="display: flex; gap: 0.375rem">
            <bim-label>Assignee</bim-label>
            ${G(i.assignedTo, (o == null ? void 0 : o.users) ?? E.users)}
          </div>` : null}

      ${i.dueDate ? d.html`
          <div style="display: flex; gap: 0.375rem">
            <bim-label>Due Date</bim-label>
            <bim-label style="--bim-label--c: var(--bim-ui_bg-contrast-100)">${i.dueDate.toDateString()}</bim-label>
          </div>` : null}

      ${i.modifiedAuthor ? d.html`
          <div style="display: flex; gap: 0.375rem">
            <bim-label>Modified By</bim-label>
            ${G(i.modifiedAuthor, (o == null ? void 0 : o.users) ?? E.users)}
          </div>` : null}

      ${i.modifiedDate ? d.html`
            <div style="display: flex; gap: 0.375rem">
              <bim-label>Modified Date</bim-label>
              <bim-label style="--bim-label--c: var(--bim-ui_bg-contrast-100)">${i.modifiedDate.toDateString()}</bim-label>
            </div>` : null}

      ${i.labels.size !== 0 ? d.html`
          <div style="display: flex; gap: 0.375rem">
            <bim-label>Labels</bim-label>
            <bim-label style="white-space: normal; --bim-label--c: var(--bim-ui_bg-contrast-100)">${[...i.labels].join(", ")}</bim-label>
          </div>` : null}

      ${s.update ? d.html`
              <bim-button @click=${() => t({ editing: !0 })} label="Update Information" icon="tabler:refresh"></bim-button> 
            ` : null}
    `, d.html`
    <div style="display: flex; flex-direction: column; gap: 0.75rem;">
      ${n ? b : h}
    </div>
  `;
}, Ie = (r) => d.Component.create(Et, r), De = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  topicInformation: Ie,
  topicInformationSectionTemplate: Et
}, Symbol.toStringTag, { value: "Module" })), Rt = (r, t) => {
  const { components: e, topic: n, linking: i } = r, o = e.get(x.BCFTopics), s = {
    link: !0,
    ...r.actions
  }, [a, l] = Mt({
    components: e,
    topics: [...n.relatedTopics].map((p) => o.list.get(p)).map((p) => p)
  });
  a.headersHidden = !0, a.hiddenColumns = [
    "Guid",
    "Status",
    // "Title",
    "Description",
    "Author",
    "Assignee",
    "Date",
    "DueDate",
    "Type",
    "Priority"
  ];
  const c = () => {
    const p = (b) => {
      const h = b.target;
      h instanceof d.TextInput && (a.queryString = h.value);
    };
    return d.html`
      <bim-text-input placeholder="Search..." debounce="100" @input=${p}></bim-text-input> 
    `;
  };
  let m, u;
  if (i) {
    a.selectableRows = !0, l({
      topics: void 0
    });
    const p = a.data.filter((y) => {
      const { Guid: f } = y.data;
      return typeof f != "string" ? !1 : n.relatedTopics.has(f);
    }).map((y) => y.data);
    a.selection.add(...p);
    const b = () => {
      const y = [...a.selection].map(({ Guid: f }) => typeof f != "string" ? null : o.list.has(f) ? f : null).map((f) => f);
      n.relatedTopics.clear(), n.relatedTopics.add(...y), t({ linking: !1 });
    }, h = () => {
      t({ linking: !1 });
    }, _ = `btn-${d.Manager.newRandomId()}`, w = `btn-${d.Manager.newRandomId()}`;
    m = d.html`
      <div style="display: flex; gap: 0.25rem">
        <style>
          #${_}:hover {
            background-color: #329936;
          }  

          #${w} {
            background-color: transparent;
          }

          #${w}:hover {
            --bim-label--c: #FF5252;
          }
        </style>
        ${c()}
        <div style="display: flex; justify-content: right; gap: 0.25rem">
          <bim-button id=${w} @click=${h} style="flex: 0" label="Cancel" icon="material-symbols:close"></bim-button>
          <bim-button id=${_} @click=${b} style="flex: 0" label="Accept" icon="material-symbols:check"></bim-button>
        </div>
      </div> 
    `;
  } else {
    a.selectableRows = !1;
    const p = () => {
      t({ linking: !0 });
    };
    u = d.html`
      <div style="display: flex; justify-content: right; gap: 0.25rem">
        ${c()}
        ${s.link ? d.html`<bim-button style="flex: 0" @click=${p} icon="tabler:link"></bim-button>` : null}
      </div> 
    `;
  }
  return d.html`
    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
      ${u}
      ${m}
      ${a}
    </div> 
  `;
}, ke = (r) => d.Component.create(Rt, r), Ee = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  topicRelations: ke,
  topicRelationsSectionTemplate: Rt
}, Symbol.toStringTag, { value: "Module" })), Pt = (r, t) => {
  const { components: e, topic: n, world: i, linking: o } = r, s = {
    add: !0,
    link: !0,
    selectComponents: !0,
    colorizeComponent: !0,
    resetColors: !0,
    updateCamera: !0,
    delete: !0,
    unlink: !0,
    ...r.actions
  }, a = e.get(x.Viewpoints), [l, c] = St({
    components: e,
    topic: n,
    actions: s
  }), m = () => {
    const b = (h) => {
      const _ = h.target;
      _ instanceof d.TextInput && (l.queryString = _.value);
    };
    return d.html`
      <bim-text-input placeholder="Search..." debounce="100" @input=${b}></bim-text-input> 
    `;
  };
  let u, p;
  if (o) {
    l.selectableRows = !0, c({
      topic: void 0,
      actions: {
        delete: !1,
        updateCamera: !1,
        colorizeComponent: !1,
        resetColors: !1
      }
    });
    const b = l.data.filter((f) => {
      const { Guid: g } = f.data;
      return typeof g != "string" ? !1 : n.viewpoints.has(g);
    }).map((f) => f.data);
    l.selection.add(...b);
    const h = () => {
      const f = [...l.selection].map(({ Guid: g }) => typeof g != "string" ? null : a.list.has(g) ? g : null).map((g) => g);
      n.viewpoints.clear(), n.viewpoints.add(...f), t({ linking: !1 });
    }, _ = () => {
      t({ linking: !1 });
    }, w = `btn-${d.Manager.newRandomId()}`, y = `btn-${d.Manager.newRandomId()}`;
    u = d.html`
      <div style="display: flex; gap: 0.25rem">
        <style>
          #${w}:hover {
            background-color: #329936;
          }  

          #${y} {
            background-color: transparent;
          }

          #${y}:hover {
            --bim-label--c: #FF5252;
          }
        </style>
        ${m()}
        <div style="display: flex; justify-content: right; gap: 0.25rem">
          <bim-button id=${y} @click=${_} style="flex: 0" label="Cancel" icon="material-symbols:close"></bim-button>
          <bim-button id=${w} @click=${h} style="flex: 0" label="Accept" icon="material-symbols:check"></bim-button>
        </div>
      </div> 
    `;
  } else {
    l.selectableRows = !1, c({
      topic: n,
      actions: s
    });
    const b = () => {
      if (!(n && s.add && !o))
        return;
      const y = a.create();
      i && (y.world = i), n.viewpoints.add(y.guid);
    }, h = () => {
      t({ linking: !0 });
    }, _ = d.html`<bim-button style="flex: 0" @click=${b} .disabled=${!i} icon="mi:add"></bim-button>`, w = d.html`<bim-button style="flex: 0" @click=${h} icon="tabler:link"></bim-button>`;
    p = d.html`
      <div style="display: flex; justify-content: right; gap: 0.25rem">
        ${m()}
        <div style="display: flex; justify-content: right; gap: 0.25rem">
          ${s.add ? _ : null}
          ${s.link ? w : null}
        </div>
      </div> 
    `;
  }
  return d.html`
    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
      ${p}
      ${u}
      ${l}
    </div> 
  `;
}, Re = (r) => d.Component.create(Pt, r), Pe = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  topicViewpoints: Re,
  topicViewpointsSectionTemplate: Pt
}, Symbol.toStringTag, { value: "Module" })), bn = {
  ...Me,
  ...De,
  ...Ee,
  ...Pe
  // ...specificationInformation,
}, Oe = (r) => d.html`
    <bim-panel-section fixed label="New Topic" name="topic">
      ${yt(r)}
    </bim-panel-section>
  `, Le = (r) => d.Component.create(
  Oe,
  r
), Ae = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  topic: Le
}, Symbol.toStringTag, { value: "Module" })), fn = {
  ...Ae
};
async function ze(r, t) {
  const e = t.get(x.FragmentsManager), n = new x.DataMap();
  for (const [s, a] of e.list)
    for (const [l, c] of Object.entries(r)) {
      const m = await a.getItemsData(Array.from(c));
      for (const u of m) {
        if (!u || !("value" in u._category))
          continue;
        const p = u._category.value, b = n.get(p) ?? 0;
        n.set(p, b + 1);
      }
    }
  const i = [...n.keys()], o = [...n.values()].map((s) => ({ value: s }));
  return {
    labels: i,
    datasets: {
      Categories: o
    }
  };
}
const Fe = (r) => {
  const { type: t, modelIdMap: e, components: n, addLabels: i = !0 } = r, o = n.get(x.FragmentsManager), s = n.get(q.Highlighter), a = n.get(x.Hider), l = r.missingDataMessage ?? "No data in this chart.", c = async (m) => {
    if (!m)
      return;
    const u = m;
    if (u.loadFunction = async () => ze(e, n), await u.loadData(!0), i) {
      const p = u.querySelector(
        "[slot='labels']"
      );
      p && (p.charts = [u], p.addEventListener("label-click", async (b) => {
        const h = b, { label: _, visibility: w } = h.detail, y = [];
        for (const [f, g] of o.list) {
          const v = await g.getItemsOfCategories([new RegExp(_)]), $ = Object.values(v).flat(), S = { [f]: new Set($) };
          y.push(a.set(w, S));
        }
        y.push(o.core.update(!0)), await Promise.all(y);
      }));
    }
    u.addEventListener("sectionclick", async (p) => {
      const b = p, { label: h } = b.detail;
      for (const [_, w] of o.list) {
        const y = await w.getItemsOfCategories([
          new RegExp(h)
        ]), f = Object.values(y).flat(), g = { [_]: new Set(f) };
        s.highlightByID("select", g, !0, !0);
      }
    });
  };
  return d.html`
    <bim-chart ${d.ref(c)} type=${t ?? "bar"}>
      <bim-label slot="missing-data" icon="ph:warning-fill" style="--bim-icon--c: gold;">${l}</bim-label>
      ${i ? d.html`<bim-chart-legend slot="labels"></bim-chart-legend>` : ""}
    </bim-chart>
  `;
}, Be = (r) => d.Component.create(
  Fe,
  r
), je = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  categoriesChart: Be
}, Symbol.toStringTag, { value: "Module" })), Ot = "Passed", Lt = "Failed";
async function Ne(r) {
  const t = [], e = [], n = {};
  for (const s of r)
    for (const [a, l] of s.entries()) {
      for (const c of l.values()) {
        const { guid: m, pass: u } = c;
        m && (u ? t.push(m) : e.push(m));
      }
      n[a] = { Passed: t, Failed: e };
    }
  const i = {
    value: t.length,
    data: { guids: t, guidsMap: n }
  }, o = {
    value: e.length,
    data: { guids: e, guidsMap: n }
  };
  return {
    labels: [Ot, Lt],
    datasets: {
      "IDS Compliance": [i, o]
    }
  };
}
const Ve = (r) => {
  const { type: t, idsResult: e, components: n, addLabels: i = !0 } = r, o = n.get(x.FragmentsManager), s = n.get(q.Highlighter), a = n.get(x.Hider);
  s.styles.set(Ot, {
    color: new I.Color("green"),
    renderedFaces: ft.RenderedFaces.ONE,
    opacity: 1,
    transparent: !1
  }), s.styles.set(Lt, {
    color: new I.Color("red"),
    renderedFaces: ft.RenderedFaces.ONE,
    opacity: 1,
    transparent: !1
  });
  const l = r.missingDataMessage ?? "No data in this chart.", c = async (m) => {
    if (!m)
      return;
    const u = m;
    if (u.loadFunction = async () => {
      const p = Array.isArray(e) ? e : [e];
      return Ne(p);
    }, u.colors = ["green", "red"], await u.loadData(!0), i) {
      const p = u.querySelector(
        "[slot='labels']"
      );
      p && (p.charts = [u]), p.addEventListener(
        "label-click",
        async (b) => {
          const { label: h, data: _, visibility: w } = b.detail, y = [];
          for (const f of _) {
            const { guidsMap: g } = f;
            for (const [v, $] of Object.entries(g)) {
              const S = o.list.get(v);
              if (!S)
                continue;
              const O = $[h];
              if (!O || O.length === 0)
                continue;
              const F = (async () => {
                const B = (await S.getLocalIdsByGuids(O)).filter(
                  (A) => A !== null
                );
                if (B.length === 0)
                  return;
                const L = { [v]: new Set(B) };
                await a.set(w, L);
              })();
              y.push(F);
            }
          }
          await Promise.all(y);
        }
      );
    }
    u.addEventListener(
      "sectionclick",
      async (p) => {
        const { values: b, label: h } = p.detail;
        await s.clear();
        for (const _ of b) {
          const { data: w } = _;
          if (!w)
            continue;
          const { guids: y } = w;
          for (const [f, g] of o.list) {
            const v = (await g.getLocalIdsByGuids(y)).filter(
              (S) => S !== null
            ), $ = { [f]: new Set(v) };
            await s.highlightByID(h, $, !0, !1);
          }
        }
      }
    );
  };
  return d.html`
    <bim-chart ${d.ref(c)} type=${t ?? "bar"} colorfulBars=${t === "bar"}>
      <bim-label slot="missing-data" icon="ph:warning-fill" style="--bim-icon--c: gold;">${l}</bim-label>
      ${i ? d.html`<bim-chart-legend slot="labels"></bim-chart-legend>` : ""}
    </bim-chart>
  `;
}, Ue = (r) => d.Component.create(
  Ve,
  r
), Xe = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  idsChart: Ue
}, Symbol.toStringTag, { value: "Module" })), Ye = (r) => {
  const { charts: t } = r, e = r.missingDataMessage ?? "No charts attached", n = async (i) => {
    if (!i)
      return;
    const o = i;
    o.charts = t;
  };
  return d.html`
    <bim-chart-legend ${d.ref(n)}>
      <bim-label slot="no-chart" icon="ph:warning-fill" style="--bim-icon--c: gold;">${e}</bim-label>
    </bim-chart-legend>
  `;
}, Ge = (r) => d.Component.create(
  Ye,
  r
), He = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  labels: Ge
}, Symbol.toStringTag, { value: "Module" }));
async function qe(r, t) {
  const e = {};
  for (const o of r) {
    let s = o[t];
    s == null ? s = "Not defined" : s instanceof Date ? s = s.toLocaleDateString() : s = String(s), e[s] || (e[s] = []), e[s].push(o);
  }
  const n = Object.keys(e), i = [];
  for (const o of n) {
    const s = e[o];
    i.push({
      value: s.length,
      data: { topics: s.map(({ guid: a }) => a) }
    });
  }
  return {
    labels: n,
    datasets: {
      Topics: i
    }
  };
}
const We = (r) => {
  const { components: t, type: e, addLabels: n = !0, grouper: i = "stage" } = r, o = r.filterFunction ?? (() => !0), a = [...t.get(x.BCFTopics).list.values()].filter(o), l = r.missingDataMessage ?? "No data in this chart.", c = async (m) => {
    if (!m)
      return;
    const u = m;
    if (u.loadFunction = async () => qe(a, i), await u.loadData(!0), n) {
      const p = u.querySelector(
        "[slot='labels']"
      );
      p && (p.charts = [u]);
    }
  };
  return d.html`
    <bim-chart ${d.ref(c)} type=${e ?? "bar"}>
      <bim-label slot="missing-data" icon="ph:warning-fill" style="--bim-icon--c: gold;">${l}</bim-label>
      ${n ? d.html`<bim-chart-legend slot="labels"></bim-chart-legend>` : ""}
    </bim-chart>
  `;
}, Je = (r) => d.Component.create(
  We,
  r
), Ke = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  topicsChart: Je
}, Symbol.toStringTag, { value: "Module" }));
async function Ze(r, t, e, n) {
  const o = n.get(x.FragmentsManager).list.get(e);
  if (!o)
    return { labels: [], datasets: {} };
  const s = await o.getAttributesUniqueValues([
    {
      categories: [t],
      get: r
    }
  ]);
  if (!s)
    return { labels: [], datasets: {} };
  const a = [], l = [];
  for (const [c, m] of Object.entries(s))
    for (const { value: u, localIds: p } of Object.values(m)) {
      a.push(u);
      const b = p.length;
      l.push({
        value: b,
        data: { modelIdMap: { [e]: new Set(p) } }
      });
    }
  return {
    labels: a,
    datasets: {
      [r.toString()]: l
    }
  };
}
const Qe = (r) => {
  const {
    type: t,
    attribute: e,
    category: n,
    modelId: i,
    components: o,
    addLabels: s = !0
  } = r, a = { zoom: !0, ...r.highlight }, l = o.get(x.FragmentsManager), c = o.get(q.Highlighter), m = o.get(x.Hider), u = r.missingDataMessage ?? "No data in this chart.", p = async (b) => {
    if (!b)
      return;
    const h = b;
    if (h.loadFunction = async () => Ze(e, n, i, o), await h.loadData(!0), s) {
      const _ = h.querySelector(
        "[slot='labels']"
      );
      _ && (_.charts = [h]), _.addEventListener(
        "label-click",
        async (w) => {
          const { data: y, visibility: f } = w.detail;
          for (const g of y) {
            const { modelIdMap: v } = g;
            await m.set(f, v);
          }
          await l.core.update(!0);
        }
      );
    }
    h.addEventListener(
      "sectionclick",
      async (_) => {
        const { values: w } = _.detail, y = [];
        for (const f of w) {
          const { data: g } = f;
          if (!g)
            continue;
          const { modelIdMap: v } = g;
          y.push(
            c.highlightByID("select", v, !0, a.zoom)
          );
        }
        await Promise.all(y);
      }
    );
  };
  return d.html`
    <bim-chart ${d.ref(p)} type=${t ?? "bar"}>
      <bim-label slot="missing-data" icon="ph:warning-fill" style="--bim-icon--c: gold;">${u}</bim-label>
      ${s ? d.html`<bim-chart-legend slot="labels"></bim-chart-legend>` : ""}
    </bim-chart>
  `;
}, tn = (r) => d.Component.create(
  Qe,
  r
), en = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  attributesChart: tn
}, Symbol.toStringTag, { value: "Module" })), gn = {
  ...je,
  ...Xe,
  ...Ke,
  ...He,
  ...en
};
export {
  un as Manager,
  dt as SheetBoard,
  P as ViewCube,
  et as World,
  N as World2D,
  H as baseTopicTagStyle,
  pn as buttons,
  gn as charts,
  G as createAuthorTag,
  E as defaultTopicStyles,
  fn as forms,
  bn as sections,
  hn as tables,
  yt as topicFormTemplate
};
