/**
 * MetaQuest Hub Image Display — GLB mesh viewer with optional WebXR (Quest Browser).
 * Deep-link: ?topic=&id-token= (opened from worklist MetaQuest button).
 */
import HubClient, {
  GLB_SEND,
  MESHSCENE_UPDATE,
  batchContextFiles,
  generateSubscriberName,
  getHubEventLower,
  isRunningInCloud,
  messageEventContext,
  requestEventFor,
} from '@slicer-hub/client';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const LOG = '[metaquest]';
const PRODUCT_NAME = 'SLICERLIVE-METAQUEST';
const ID_ACTOR = 'ID';

const HUB_CREDENTIALS = {
  client_id: 'client_id_3d_Slicer',
  client_secret: 'client_secret_3d_Slicer',
} as const;

const LOCAL_HUB = {
  name: 'local',
  version: '1.0',
  hub_endpoint: 'http://127.0.0.1:2018/api/hub',
  authorization_endpoint: 'http://127.0.0.1:2018/oauth/login',
  token_endpoint: 'http://127.0.0.1:2018/oauth/token',
  ...HUB_CREDENTIALS,
};

function isServedFromSlicerHubMount(location: Location = globalThis.location): boolean {
  const path = String(location?.pathname || '');
  if (!path.startsWith('/metaquest')) return false;
  if (isRunningInCloud(location)) return true;
  const port = location.port || (location.protocol === 'https:' ? '443' : '80');
  return port === '2018';
}

function resolveHubConfig(location: Location = globalThis.location) {
  if (isServedFromSlicerHubMount(location) || isRunningInCloud(location)) {
    const origin = location.origin;
    return {
      name: 'hub',
      version: '1.0',
      hub_endpoint: `${origin}/api/hub`,
      authorization_endpoint: `${origin}/oauth/login`,
      token_endpoint: `${origin}/oauth/token`,
      ...HUB_CREDENTIALS,
    };
  }
  return LOCAL_HUB;
}

function setStatus(text: string, tone: 'info' | 'error' = 'info'): void {
  const el = document.getElementById('status');
  if (!el) return;
  el.textContent = text;
  el.dataset.tone = tone;
}

type NodeState = {
  visible?: boolean;
  color?: number[];
  opacity?: number;
  matrix?: number[];
};

class MeshViewer {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  readonly controls: OrbitControls;
  readonly root = new THREE.Group();
  private loader = new GLTFLoader();
  private nodeMap = new Map<string, THREE.Object3D>();

  constructor(host: HTMLElement) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0b1020);
    this.camera = new THREE.PerspectiveCamera(50, 1, 0.01, 100);
    this.camera.position.set(0, 1.4, 1.2);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.xr.enabled = true;
    host.appendChild(this.renderer.domElement);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 1.2, 0);
    this.controls.update();
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 0.85);
    key.position.set(2, 4, 3);
    this.scene.add(key);
    this.scene.add(this.root);
    this.onResize();
    window.addEventListener('resize', () => this.onResize());
    this.renderer.setAnimationLoop(() => this.render());
  }

  onResize(): void {
    if (this.renderer.xr.isPresenting) return;
    const w = window.innerWidth;
    const h = Math.max(1, window.innerHeight);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  render(): void {
    if (!this.renderer.xr.isPresenting) this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  async loadGlb(bytes: ArrayBuffer, nodeState?: Record<string, NodeState>): Promise<void> {
    const gltf = await this.loader.parseAsync(bytes, '');
    while (this.root.children.length) {
      const child = this.root.children[0];
      this.root.remove(child);
      this.disposeObject(child);
    }
    this.nodeMap.clear();
    this.root.add(gltf.scene);
    gltf.scene.traverse((obj) => {
      const extras = (obj.userData && (obj.userData as { extras?: { nodeId?: string } }).extras) ||
        (obj.userData as { nodeId?: string });
      const nodeId =
        extras && typeof extras.nodeId === 'string'
          ? extras.nodeId
          : typeof obj.name === 'string' && obj.name
            ? obj.name
            : '';
      if (nodeId) this.nodeMap.set(nodeId, obj);
    });
    if (nodeState) this.applyNodeState(nodeState);
    this.frameRoot();
  }

  applyNodeState(nodeState: Record<string, NodeState>): void {
    for (const [nodeId, state] of Object.entries(nodeState || {})) {
      const obj = this.nodeMap.get(nodeId);
      if (!obj) continue;
      if (typeof state.visible === 'boolean') obj.visible = state.visible;
      if (Array.isArray(state.matrix) && state.matrix.length === 16) {
        obj.matrix.fromArray(state.matrix);
        obj.matrixAutoUpdate = false;
      }
      if (Array.isArray(state.color) || typeof state.opacity === 'number') {
        obj.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (!mesh.isMesh) return;
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          for (const mat of mats) {
            const m = mat as THREE.MeshStandardMaterial;
            if (Array.isArray(state.color) && m.color) {
              m.color.setRGB(state.color[0] ?? 1, state.color[1] ?? 1, state.color[2] ?? 1);
            }
            if (typeof state.opacity === 'number' && 'opacity' in m) {
              m.opacity = state.opacity;
              m.transparent = state.opacity < 0.999;
              m.needsUpdate = true;
            }
          }
        });
      }
    }
  }

  applyChanges(changes: Array<Record<string, unknown>>): void {
    for (const change of changes || []) {
      const nodeId = String(change.nodeId || '').trim();
      if (!nodeId) continue;
      const patch: NodeState = {};
      if ('visible' in change) patch.visible = Boolean(change.visible);
      if (Array.isArray(change.color)) patch.color = change.color as number[];
      if (typeof change.opacity === 'number') patch.opacity = change.opacity;
      if (Array.isArray(change.matrix)) patch.matrix = change.matrix as number[];
      this.applyNodeState({ [nodeId]: patch });
    }
  }

  frameRoot(): void {
    const box = new THREE.Box3().setFromObject(this.root);
    if (box.isEmpty()) return;
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const radius = Math.max(size.x, size.y, size.z, 0.05);
    this.controls.target.copy(center);
    this.camera.position
      .copy(center)
      .add(new THREE.Vector3(radius * 1.6, radius * 0.9, radius * 1.6));
    this.camera.near = Math.max(0.001, radius / 200);
    this.camera.far = Math.max(10, radius * 40);
    this.camera.updateProjectionMatrix();
    this.controls.update();
  }

  async enterXr(mode: 'immersive-vr' | 'immersive-ar'): Promise<boolean> {
    const xr = navigator.xr;
    if (!xr) return false;
    try {
      const session = await xr.requestSession(mode, {
        optionalFeatures: ['local-floor', 'hand-tracking'],
      });
      await this.renderer.xr.setSession(session);
      session.addEventListener('end', () => this.onResize());
      return true;
    } catch (err) {
      console.warn(LOG, 'XR session failed', err);
      return false;
    }
  }

  private disposeObject(obj: THREE.Object3D): void {
    obj.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.geometry?.dispose?.();
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const mat of mats) mat?.dispose?.();
      }
    });
  }
}

async function detectXrMode(): Promise<'immersive-ar' | 'immersive-vr' | null> {
  const xr = navigator.xr;
  if (!xr) return null;
  const ua = navigator.userAgent || '';
  if (!/OculusBrowser|Quest/i.test(ua)) return null;
  try {
    if (await xr.isSessionSupported('immersive-ar')) return 'immersive-ar';
    if (await xr.isSessionSupported('immersive-vr')) return 'immersive-vr';
  } catch {
    return null;
  }
  return null;
}

function readDeepLink(): { topic: string; token: string } {
  const params = new URLSearchParams(window.location.search);
  let topic =
    params.get('topic')?.trim() ||
    sessionStorage.getItem('metaquest.topic')?.trim() ||
    '';
  let token =
    params.get('id-token')?.trim() ||
    sessionStorage.getItem('metaquest.token')?.trim() ||
    '';
  if (topic) sessionStorage.setItem('metaquest.topic', topic);
  if (token) sessionStorage.setItem('metaquest.token', token);
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete('id-token');
    window.history.replaceState({}, '', url.toString());
  } catch {
    /* ignore */
  }
  return { topic, token };
}

async function firstGlbBytes(message: Record<string, unknown>): Promise<ArrayBuffer | null> {
  const eventObj = (message.event || message) as Record<string, unknown>;
  const files = batchContextFiles(eventObj) as Array<Record<string, unknown>>;
  for (const file of files) {
    const data = file.data;
    if (data instanceof ArrayBuffer) return data;
    if (ArrayBuffer.isView(data)) {
      return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
    }
  }
  return null;
}

async function handleMessage(
  client: HubClient,
  viewer: MeshViewer,
  subscriberName: string,
  raw: Record<string, unknown>
): Promise<void> {
  const from = String(raw['subscriber.name'] || '').trim();
  if (from && from === subscriberName) return;

  const hubEvent = getHubEventLower(raw?.event ?? raw);
  if (hubEvent === GLB_SEND) {
    const message = (await client.fetchAllPayloads(raw)) as Record<string, unknown>;
    const bytes = await firstGlbBytes(message);
    const ctx = (messageEventContext(message) ||
      ((message.event as { context?: unknown })?.context as Record<string, unknown>) ||
      {}) as Record<string, unknown>;
    if (bytes) {
      await viewer.loadGlb(bytes, (ctx.nodeState || {}) as Record<string, NodeState>);
      setStatus(
        typeof ctx.snapshotVersion === 'number'
          ? `Scene snapshot v${ctx.snapshotVersion}`
          : 'Scene loaded'
      );
    }
    return;
  }
  if (hubEvent === MESHSCENE_UPDATE) {
    const ctx = (messageEventContext(raw) ||
      ((raw.event as { context?: unknown })?.context as Record<string, unknown>) ||
      {}) as Record<string, unknown>;
    const changes = Array.isArray(ctx.changes)
      ? (ctx.changes as Array<Record<string, unknown>>)
      : [];
    viewer.applyChanges(changes);
    setStatus('Scene updated');
  }
}

async function main(): Promise<void> {
  const app = document.getElementById('app');
  if (!app) return;
  const viewer = new MeshViewer(app);
  const enterBtn = document.getElementById('enterXr') as HTMLButtonElement | null;
  const xrMode = await detectXrMode();
  if (enterBtn && xrMode) {
    enterBtn.hidden = false;
    enterBtn.disabled = false;
    enterBtn.textContent = xrMode === 'immersive-ar' ? 'View in AR' : 'View in VR';
    enterBtn.addEventListener('click', async () => {
      enterBtn.disabled = true;
      const ok = await viewer.enterXr(xrMode);
      if (!ok) setStatus('AR/VR could not start', 'error');
      enterBtn.disabled = false;
    });
  }

  const { topic, token } = readDeepLink();
  if (!topic || !token) {
    setStatus('Open MetaQuest from the worklist (needs ?topic=&id-token=)', 'error');
    return;
  }

  const hub = resolveHubConfig();
  const subscriberName = generateSubscriberName('MetaQuest');
  const client = new HubClient(
    hub,
    {
      subscriberName,
      productName: PRODUCT_NAME,
      productVersion: '0.1',
      actors: [ID_ACTOR],
      topic,
      events: [GLB_SEND, MESHSCENE_UPDATE, requestEventFor('glb')],
      lease: 7200,
      defaultTargetActor: 'ID',
    },
    {
      callbackUrl: `${globalThis.location.origin}/hubCallback`,
      preserveSessionTopicFromToken: Boolean(topic),
      autoReconnect: true,
    }
  );

  client.onMessage((message: Record<string, unknown>) => {
    void handleMessage(client, viewer, subscriberName, message);
  });

  setStatus(`Connecting to Hub topic ${topic}…`);
  client.setToken(token);
  client.setTopic(topic);
  const subStatus = await client.subscribe();
  console.info(LOG, 'subscribe status=', subStatus);
  if (String(subStatus) !== '202' && subStatus !== 202) {
    setStatus(`Hub subscribe failed: ${String(subStatus)}`, 'error');
    return;
  }
  setStatus('Connected — requesting scene…');

  try {
    await client.request({
      'subscriber.name': subscriberName,
      'subscriber.product.name': PRODUCT_NAME,
      'subscriber.actor': ID_ACTOR,
      'target.actor': ID_ACTOR,
      'target.product.name': '3DSLICER-ID',
      event: {
        'hub.event': requestEventFor('glb'),
        'hub.topic': topic,
        context: { dataType: 'glb' },
      },
    });
  } catch (err) {
    console.warn(LOG, 'glb-request failed', err);
    setStatus('Connected — waiting for GLB (request failed)');
  }
}

void main().catch((err) => {
  console.error(LOG, err);
  setStatus('MetaQuest failed to start', 'error');
});
