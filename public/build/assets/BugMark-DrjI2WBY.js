import{r as s,j as c}from"./app-Dfh2uIp1.js";/**
 * @license lucide-react v0.522.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=t=>t.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),y=t=>t.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,r,o)=>o?o.toUpperCase():r.toLowerCase()),l=t=>{const e=y(t);return e.charAt(0).toUpperCase()+e.slice(1)},h=(...t)=>t.filter((e,r,o)=>!!e&&e.trim()!==""&&o.indexOf(e)===r).join(" ").trim(),g=t=>{for(const e in t)if(e.startsWith("aria-")||e==="role"||e==="title")return!0};/**
 * @license lucide-react v0.522.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var f={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.522.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=s.forwardRef(({color:t="currentColor",size:e=24,strokeWidth:r=2,absoluteStrokeWidth:o,className:n="",children:a,iconNode:u,...d},p)=>s.createElement("svg",{ref:p,...f,width:e,height:e,stroke:t,strokeWidth:o?Number(r)*24/Number(e):r,className:h("lucide",n),...!a&&!g(d)&&{"aria-hidden":"true"},...d},[...u.map(([C,m])=>s.createElement(C,m)),...Array.isArray(a)?a:[a]]));/**
 * @license lucide-react v0.522.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const i=(t,e)=>{const r=s.forwardRef(({className:o,...n},a)=>s.createElement(w,{ref:a,iconNode:e,className:h(`lucide-${k(l(t))}`,`lucide-${t}`,o),...n}));return r.displayName=l(t),r};/**
 * @license lucide-react v0.522.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]],E=i("circle-check",x);/**
 * @license lucide-react v0.522.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _=[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]],G=i("shield-check",_);/**
 * @license lucide-react v0.522.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["path",{d:"M16 3.128a4 4 0 0 1 0 7.744",key:"16gr8j"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}]],M=i("users",v),B="0 4 146 66",N=[22,50,78,106],j=46,A=17,U=["M110 29.5 C112 21 116 14 122 11 C126 9 130 12 128 16 C127 18.5 124 18.5 123.5 16.5","M118 33 C122 26 128 22 134 22 C138 22 140 26 137.5 29 C136 31 133 30.5 133 28.5"];function R({className:t="h-6 w-auto text-brand-400",title:e="Heiseenbug"}){return c.jsxs("svg",{viewBox:B,className:t,fill:"none",stroke:"currentColor",strokeWidth:5,strokeLinecap:"round",role:e?"img":void 0,"aria-label":e,"aria-hidden":e?void 0:!0,children:[N.map(r=>c.jsx("circle",{cx:r,cy:j,r:A},r)),c.jsx("g",{children:U.map((r,o)=>c.jsx("path",{d:r},o))})]})}export{R as B,E as C,G as S,M as U,i as c};
