var n=Object.defineProperty;var m=(e,t,s)=>t in e?n(e,t,{enumerable:!0,configurable:!0,writable:!0,value:s}):e[t]=s;var h=(e,t,s)=>(m(e,typeof t!="symbol"?t+"":t,s),s);var r=class{constructor(){i.init(this)}create(){}resize(t,s){}render(t){}};var a=class{canvas;gl;frameId=null;width;height;delta=0;fps=60;lastFrameTime;frameStart;frames;game;constructor(t){this.game=t,this.canvas=this.createCanvas(),this.gl=this.canvas.getContext("webgl"),addEventListener("resize",()=>this.onResize()),this.onResize()}onResume(){this.lastFrameTime=this.frameStart=performance.now(),this.frames=0,this.RAF()}createCanvas(){let t=document.createElement("canvas");return document.body.appendChild(t),t}onResize(){this.canvas.width=this.width=innerWidth,this.canvas.height=this.height=innerHeight}onDrawFrame(){let t=performance.now();this.delta=(t-this.lastFrameTime)*.001,this.lastFrameTime=t,this.game.render(this.delta),t-this.frameStart>1e3&&(this.fps=this.frames,this.frames=0,this.frameStart=t),this.frames++}RAF(){this.frameId=requestAnimationFrame(()=>{this.RAF(),this.onDrawFrame()})}};var i=class{static init(t){this.graphics=new a(t),this.graphics.onResume()}static get gl(){return this.graphics.gl}};h(i,"graphics");export{r as Game,i as Gol};
//# sourceMappingURL=goliath.js.map
