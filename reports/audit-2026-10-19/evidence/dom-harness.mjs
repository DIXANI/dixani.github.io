import { readFileSync } from "node:fs";
import vm from "node:vm";

class FakeClassList {
  constructor() {
    this.values = new Set();
  }
  add(...names) {
    names.forEach((name) => this.values.add(name));
  }
  remove(...names) {
    names.forEach((name) => this.values.delete(name));
  }
  toggle(name, force) {
    const next = force === undefined ? !this.values.has(name) : Boolean(force);
    if (next) this.values.add(name);
    else this.values.delete(name);
    return next;
  }
  contains(name) {
    return this.values.has(name);
  }
}

class FakeElement {
  constructor(id = "") {
    this.id = id;
    this.value = "";
    this.textContent = "";
    this.innerHTML = "";
    this.hidden = false;
    this.disabled = false;
    this.checked = false;
    this.type = "";
    this.style = {};
    this.dataset = {};
    this.classList = new FakeClassList();
    this.attributes = new Map();
    this.listeners = new Map();
    this.children = [];
  }
  addEventListener(type, handler) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(handler);
  }
  dispatch(type, extra = {}) {
    const event = { target: this, currentTarget: this, preventDefault() {}, ...extra };
    for (const handler of this.listeners.get(type) || []) handler(event);
  }
  click() {
    if (typeof this.onclick === "function") this.onclick({ target: this, currentTarget: this });
    this.dispatch("click");
  }
  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }
  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }
  removeAttribute(name) {
    this.attributes.delete(name);
  }
  focus() {}
  select() {}
  scrollIntoView() {}
  append(...items) {
    this.children.push(...items);
  }
  appendChild(item) {
    this.children.push(item);
    return item;
  }
  remove() {}
  querySelectorAll() {
    return [];
  }
  querySelector() {
    return new FakeElement();
  }
  closest() {
    return null;
  }
}

export function createDom(ids = [], { autoCreate = true } = {}) {
  const elements = new Map(ids.map((id) => [id, new FakeElement(id)]));
  const get = (id) => {
    if (!autoCreate && !elements.has(id)) return null;
    if (!elements.has(id)) elements.set(id, new FakeElement(id));
    return elements.get(id);
  };

  const document = {
    getElementById: get,
    addEventListener(type, handler) {
      if (type === "DOMContentLoaded") handler();
    },
    querySelector() {
      return new FakeElement();
    },
    querySelectorAll() {
      return [];
    },
    createElement(tag) {
      return new FakeElement(tag);
    },
    body: new FakeElement("body")
  };

  return { document, get, elements };
}

export function runCalculatorScript(scriptPath, dom) {
  const source = readFileSync(scriptPath, "utf8");
  const sandbox = {
    document: dom.document,
    window: {
      print() {},
      open() { return null; }
    },
    navigator: {},
    console,
    URL: { createObjectURL: () => "blob:test", revokeObjectURL() {} },
    Blob: class Blob {},
    setTimeout,
    clearTimeout,
    confirm: () => true,
    alert: () => {}
  };
  vm.runInNewContext(source, sandbox, { filename: scriptPath });
  return sandbox;
}
