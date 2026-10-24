import * as THREE from './vendor/three.module.min.js';

const COLORS = {
  pink: 0xf3b9d0,
  pale: 0xffe2e9,
  ground: 0xdda7bd,
  forest: 0x174d46,
  mint: 0x85cbb6,
  cream: 0xfff4df,
  road: 0x625d68,
  lane: 0xffe0a5,
  water: 0x719aad,
  dark: 0x302b38,
  alert: 0xc84263,
  block: 0xd8a0b9
};
const sceneName = new URLSearchParams(location.search).get('scene') || 'hero';
const scene = new THREE.Scene();
scene.background = new THREE.Color(COLORS.pink);
const camera = new THREE.OrthographicCamera(-8,8,6,-6,0.1,100);
const renderer = new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(1);
renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);
scene.add(new THREE.AmbientLight(0xffffff,2.05));
const sun = new THREE.DirectionalLight(0xffffff,2.4);
sun.position.set(-4,11,9);
sun.castShadow = true;
sun.shadow.mapSize.set(2048,2048);
sun.shadow.camera.left = -20; sun.shadow.camera.right = 20;
sun.shadow.camera.top = 20; sun.shadow.camera.bottom = -20;
scene.add(sun);

const mat = (color,extra={}) => new THREE.MeshStandardMaterial({color,roughness:1,metalness:0,flatShading:true,...extra});
function box(parent,w,h,d,color,x=0,y=0,z=0){
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color));
  mesh.position.set(x,y,z); mesh.castShadow=true; mesh.receiveShadow=true; parent.add(mesh); return mesh;
}
function ball(parent,r,color,x,y,z,detail=0){
  const mesh=new THREE.Mesh(new THREE.IcosahedronGeometry(r,detail),mat(color));
  mesh.position.set(x,y,z); mesh.castShadow=true; parent.add(mesh); return mesh;
}
function tube(parent,coords,color,r=.065){
  const curve=new THREE.CatmullRomCurve3(coords.map(v=>new THREE.Vector3(...v)),false,'centripetal');
  const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,Math.max(20,coords.length*12),r,6,false),new THREE.MeshBasicMaterial({color}));
  parent.add(mesh); return mesh;
}
function truck(parent,{scale=1,cargo=COLORS.cream,cab=COLORS.forest}={}){
  const g=new THREE.Group(); g.scale.setScalar(scale); parent.add(g);
  box(g,3.7,.24,1.72,COLORS.dark,0,.68,0);
  box(g,2.4,1.5,1.64,cargo,-.64,1.52,0);
  box(g,1.16,1.33,1.62,cab,1.28,1.39,0);
  box(g,.07,.56,1.18,COLORS.water,1.88,1.6,0);
  box(g,.1,.44,.58,COLORS.water,1.37,1.61,.84);
  box(g,.1,.44,.58,COLORS.water,1.37,1.61,-.84);
  box(g,.14,.18,1.73,COLORS.cream,1.91,.87,0);
  for(const x of [-1.35,1.15])for(const z of [-.87,.87]){
    const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.4,.4,.18,10),mat(COLORS.dark));
    wheel.rotation.x=Math.PI/2; wheel.position.set(x,.42,z); wheel.castShadow=true; g.add(wheel);
    const hub=new THREE.Mesh(new THREE.CylinderGeometry(.17,.17,.19,8),mat(COLORS.mint));
    hub.rotation.x=Math.PI/2;hub.position.set(x,.42,z+(z>0?.095:-.095));g.add(hub);
  }
  return g;
}
function ground(size=26,color=COLORS.ground){
  const p=box(scene,size,.12,size,color,0,-.09,0);p.receiveShadow=true;return p;
}
function road(parent,x,z,w,d,y=.02){
  const r=box(parent,w,.025,d,COLORS.road,x,y,z);r.receiveShadow=true;
  if(w>d)for(let dx=-w/2+.7;dx<w/2;dx+=1.15)box(parent,.55,.012,.035,COLORS.lane,x+dx,y+.022,z);
  else for(let dz=-d/2+.7;dz<d/2;dz+=1.15)box(parent,.035,.012,.55,COLORS.lane,x,y+.022,z+dz);
  return r;
}
function building(parent,x,z,w,h,d,color=COLORS.block){
  box(parent,w,h,d,color,x,h/2+.03,z);
  box(parent,w+.1,.11,d+.1,COLORS.pale,x,h+.1,z);
}
function tree(parent,x,z,s=1){
  box(parent,.15*s,.65*s,.15*s,COLORS.forest,x,.35*s,z);
  ball(parent,.52*s,COLORS.forest,x,.94*s,z);
}
function pin(parent,x,z,color=COLORS.alert){
  const g=new THREE.Group();g.position.set(x,0,z);parent.add(g);
  box(g,.065,1.05,.065,color,0,.58,0);
  ball(g,.31,color,0,1.19,0,1);
  return g;
}
function cityMap({simple=false}={}){
  ground(30);
  const plate=box(scene,13.9,.18,10.2,COLORS.pale,0,.02,0);plate.receiveShadow=true;
  for(const z of [-3.3,0,3.3])road(scene,0,z,13.9,.66,.15);
  for(const x of [-5.1,-1.7,1.7,5.1])road(scene,x,0,.66,10.2,.15);
  const data=[
    [-3.4,-1.7,1.2,1.3,1.3],[-.05,-1.7,1.6,.8,1.4],[3.45,-1.7,1.25,1.75,1.15],
    [-3.35,1.7,1.5,1.8,1.2],[.05,1.7,1.2,1.4,1.2],[3.45,1.7,1.4,1.05,1.3],
    [-3.5,4.2,1.2,.7,.6],[.05,4.2,1.3,1.2,.7],[3.4,4.2,1.4,.9,.7]
  ];
  data.forEach((v,i)=>building(scene,...v,i%3===1?0xe7c5d0:COLORS.block));
  [[-5.9,-4.4],[-2.5,-4.3],[2.5,-4.3],[5.9,1.2],[-5.9,1.1],[5.9,4.3]].forEach(v=>tree(scene,...v,.55));
  if(!simple){
    tube(scene,[[-5.1,.17,3.3],[-1.7,.17,3.3],[-1.7,.17,0],[1.7,.17,0],[5.1,.17,0],[5.1,.17,-3.3]],COLORS.forest,.09);
  }
}
function setCamera(pos,target=[0,0,0],size=12){
  const aspect=innerWidth/innerHeight;
  camera.left=-size*aspect/2;camera.right=size*aspect/2;
  camera.top=size/2;camera.bottom=-size/2;
  camera.position.set(...pos);camera.lookAt(...target);camera.updateProjectionMatrix();
}

if(sceneName==='hero'){
  ground();
  road(scene,0,0,20,3.8);
  const t=truck(scene,{scale:1.35});t.position.set(.2,.02,.15);
  for(const [x,z,s] of [[-6.1,-3.6,1.1],[-4.8,3.5,.75],[5.7,-3.5,.95],[6.3,3.3,.7]])tree(scene,x,z,s);
  pin(scene,-5.4,0,COLORS.forest);
  setCamera([7.8,6.6,9.7],[0,.8,0],8.6);
}
if(sceneName==='fleet'){
  cityMap();
  const a=truck(scene,{scale:.43,cargo:COLORS.cream});a.position.set(-4.6,.11,3.3);
  const b=truck(scene,{scale:.43,cargo:COLORS.mint});b.position.set(1.2,.11,0);
  const c=truck(scene,{scale:.43,cargo:0xffdca0});c.position.set(5.1,.11,-2.7);c.rotation.y=Math.PI/2;
  pin(scene,-5.1,3.3,COLORS.forest); pin(scene,5.1,-3.3,COLORS.forest);
  setCamera([8,15,12],[0,.4,0],12.6);
}
if(sceneName==='rain'){
  scene.background=new THREE.Color(0xdbafc9);
  ground(26,0xd5aac4);
  road(scene,0,0,20,4.2);
  const t=truck(scene,{scale:1.25,cargo:0xf9e1db,cab:0x245860});t.position.set(.3,.02,.15);
  for(const [x,y,z,r] of [[-2.9,5.1,-2.7,1.1],[-1.6,5.4,-2.7,1.3],[-.15,5.2,-2.4,1.05],[1.9,5.1,-2.9,1.3],[3.4,5.3,-2.6,1.1]])ball(scene,r,0x8e849c,x,y,z,0);
  const pts=[];let seed=34;const rand=()=>((seed=seed*16807%2147483647)/2147483647);
  for(let i=0;i<220;i++){const x=(rand()-.5)*12,z=(rand()-.5)*7,y=.5+rand()*5.1;pts.push(x,y,z,x-.12,y-.55,z)}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));
  scene.add(new THREE.LineSegments(geo,new THREE.LineBasicMaterial({color:0xc9ebf0,transparent:true,opacity:.85})));
  for(const [x,z] of [[-5,-1.65],[-2,-1.7],[1,-1.7],[4,-1.7]])box(scene,1.4,.017,.32,0x8aaeba,x,.045,z);
  setCamera([7.5,5.8,9.5],[0,1.4,0],8.8);
}
if(sceneName==='deviation'){
  cityMap({simple:true});
  tube(scene,[[-5.1,.21,3.3],[-1.7,.21,3.3],[-1.7,.21,0],[1.7,.21,0],[5.1,.21,0],[5.1,.21,-3.3]],COLORS.forest,.09);
  tube(scene,[[-5.1,.25,3.3],[-1.7,.25,3.3],[-1.7,.25,0],[1.7,.25,0],[1.7,.25,-3.3],[5.1,.25,-3.3]],COLORS.alert,.085);
  const t=truck(scene,{scale:.54,cargo:0xffe0a5,cab:COLORS.alert});t.position.set(2.4,.13,-3.3);
  pin(scene,2.4,-3.3,COLORS.alert);
  setCamera([8,15,12],[0,.4,0],12.6);
}
if(sceneName==='evidence'){
  ground();
  road(scene,0,0,20,4);
  const t=truck(scene,{scale:1.15,cargo:COLORS.cream});t.position.set(-1,.02,.2);
  // A stopped truck, roadside cones, and a location marker illustrate a driver report.
  for(const x of [3.0,4.1,5.2]){
    const cone=new THREE.Mesh(new THREE.ConeGeometry(.28,.65,5),mat(0xd36457));
    cone.position.set(x,.35,1.5);cone.castShadow=true;scene.add(cone);
  }
  pin(scene,3.6,-.8,COLORS.alert);
  setCamera([7.7,6.8,9.5],[0,1,0],9.2);
}
if(sceneName==='costs'){
  ground();
  road(scene,0,0,20,4);
  const t=truck(scene,{scale:1.02,cargo:COLORS.mint});t.position.set(-2,.02,.15);
  // Simple low-poly toll gantry and fuel pump.
  box(scene,.23,3,.23,COLORS.forest,3.6,1.5,-2.1);
  box(scene,.23,3,.23,COLORS.forest,3.6,1.5,2.1);
  box(scene,.3,.3,4.65,COLORS.forest,3.6,3,0);
  box(scene,1.15,1.9,.8,COLORS.cream,5.4,.95,-3.2);
  box(scene,.8,.46,.07,COLORS.water,5.4,1.35,-2.75);
  box(scene,.1,.85,.1,COLORS.dark,6.12,.85,-2.65);
  setCamera([7.7,6.8,9.5],[.6,1,0],9.5);
}
if(sceneName==='safety'){
  ground();
  road(scene,0,0,20,4);
  const t=truck(scene,{scale:1.15,cargo:COLORS.cream});t.position.set(0,.05,0);t.rotation.x=.17;
  const sensor=box(scene,.72,.17,.48,COLORS.alert,-.5,2.52,.1);
  sensor.rotation.x=.17;
  for(const [x,z] of [[-5,-3],[5,3]])tree(scene,x,z,.8);
  setCamera([7.7,6.6,9.6],[0,1.2,0],8.8);
}
if(sceneName==='safety-side'){
  ground();
  road(scene,0,0,20,4);
  const t=truck(scene,{scale:1.15,cargo:COLORS.cream,cab:COLORS.forest});
  t.rotation.x=Math.PI/2;
  t.position.set(0,1.05,0);
  pin(scene,3.9,-1.5,COLORS.alert);
  for(const [x,z] of [[-5,-3],[5,3]])tree(scene,x,z,.8);
  setCamera([7.7,6.6,9.6],[0,1.1,0],8.8);
}

renderer.render(scene,camera);
window.__RENDER_DONE__=true;
