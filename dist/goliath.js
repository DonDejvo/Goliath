<<<<<<< HEAD
( () => {

    const __defProp = Object.defineProperty;
    const __defNormalProp = ( obj, key, value ) => key in obj ? __defProp( obj, key, { enumerable: true, configurable: true, writable: true, value } ) : obj[ key ] = value;
    const __export = ( target, all ) => {

        for ( const name in all )
            __defProp( target, name, { get: all[ name ], enumerable: true } );

    };
    const __publicField = ( obj, key, value ) => {

        __defNormalProp( obj, typeof key !== 'symbol' ? key + '' : key, value );

        return value;

    };

    // src/files.js
    const Files = class {

        assets = /* @__PURE__ */ new Map();
        toLoad = 0;
        loadImage( name, url ) {

            const image = new Image();

            image.src = url;
            image.crossOrigin = 'Anonymous';
            const promise = new Promise( ( resolve ) => {

                image.onload = () => {

                    resolve( image );

                };

            } );

            this.addAsync( name, promise );

            return promise;

        }

        loadAudio( name, url ) {

            const promise = fetch( url ).then( ( response ) => response.arrayBuffer() ).then( ( data ) => Gol.audio.audioContext.decodeAudioData( data ) );

            this.addAsync( name, promise );

            return promise;

        }

        addAsync( name, promise ) {

            ++this.toLoad;
            promise.then( ( asset ) => {

                this.assets.set( name, asset );
                --this.toLoad;

            } );

        }

        waitForAssetsToLoad() {

            return new Promise( ( resolve ) => {

                const wait = () => {

                    if ( this.toLoad == 0 ) {

                        resolve( this.assets );

                    } else {

                        setTimeout( () => {

                            wait();

                        }, 250 );

                    }

                };

                wait();

            } );

        }

        get( name ) {

            return this.assets.get( name );

        }

    };

    // src/screen.js
    const Screen = class {

        constructor() {

            this.create();

        }

        create() {
        }

        show() {
        }

        hide() {
        }

        resize( width, height ) {
        }

        render( delta ) {
        }

        dispose() {
        }

    };

    // src/game.js
    const Game = class {

        screen = null;
        constructor() {
        }

        preload() {
        }

        create() {
        }

        resize( width, height ) {

            if ( this.screen ) {

                this.screen.resize( width, height );

            }

        }

        render( delta ) {

            if ( this.screen ) {

                this.screen.render( delta );

            }

        }

        setScreen( screen ) {

            if ( this.screen ) {

                this.screen.hide();

            }

            this.screen = screen;
            this.screen.show();

        }

    };

    // src/math/math-utils.js
    const MathUtils = class {

        static lerp( x, a, b ) {

            return ( b - a ) * x + a;

        }

        static rand( min4, max4 ) {

            return Math.random() * ( max4 - min4 ) + min4;

        }

        static randInt( min4, max4 ) {

            return Math.floor( this.rand( min4, max4 + 1 ) );

        }

        static clamp( x, a, b ) {

            return Math.min( Math.max( x, a ), b );

        }

        static sat( x ) {

            return this.clamp( x, 0, 1 );

        }

        static shuffle( arr ) {

            for ( let i = 0; i < arr.length; ++i ) {

                const idx = this.randInt( 0, arr.length - 1 );

                [ arr[ i ], arr[ idx ] ] = [ arr[ idx ], arr[ i ] ];

            }

        }

        static choice( arr ) {

            return arr[ this.randInt( 0, arr.length - 1 ) ];

        }

        static isPowerOf2( x ) {

            return ( x & x - 1 ) == 0;

        }

    };

    // src/graphics/texture.js
    const Texture = class {

        id;
        data;
        constructor( data, params = {} ) {

            this.data = data;
            this.id = Gol.gl.createTexture();
            Gol.gl.bindTexture( Gol.gl.TEXTURE_2D, this.id );
            Gol.gl.texImage2D( Gol.gl.TEXTURE_2D, 0, Gol.gl.RGBA, Gol.gl.RGBA, Gol.gl.UNSIGNED_BYTE, data );

            if ( MathUtils.isPowerOf2( data.width ) && MathUtils.isPowerOf2( data.height ) ) {

                Gol.gl.generateMipmap( Gol.gl.TEXTURE_2D );

            }

            Gol.gl.bindTexture( Gol.gl.TEXTURE_2D, null );
            this.setFilter( params.filter || Gol.gl.LINEAR );
            this.setWrap( params.wrap || Gol.gl.CLAMP_TO_EDGE );

        }

        setFilter( filter ) {

            Gol.gl.bindTexture( Gol.gl.TEXTURE_2D, this.id );
            Gol.gl.texParameteri( Gol.gl.TEXTURE_2D, Gol.gl.TEXTURE_MIN_FILTER, filter );
            Gol.gl.texParameteri( Gol.gl.TEXTURE_2D, Gol.gl.TEXTURE_MAG_FILTER, filter == Gol.gl.NEAREST ? Gol.gl.NEAREST : Gol.gl.LINEAR );
            Gol.gl.bindTexture( Gol.gl.TEXTURE_2D, null );

        }

        setWrap( wrap ) {

            Gol.gl.bindTexture( Gol.gl.TEXTURE_2D, this.id );
            Gol.gl.texParameteri( Gol.gl.TEXTURE_2D, Gol.gl.TEXTURE_WRAP_S, wrap );
            Gol.gl.texParameteri( Gol.gl.TEXTURE_2D, Gol.gl.TEXTURE_WRAP_T, wrap );
            Gol.gl.bindTexture( Gol.gl.TEXTURE_2D, null );

        }

        bind() {

            Gol.gl.bindTexture( Gol.gl.TEXTURE_2D, this.id );

        }

        dispose() {

            Gol.gl.deleteTexture( this.id );

        }

        get width() {

            return this.data.width;

        }

        get height() {

            return this.data.height;

        }

    };

    // src/graphics/font.js
    const Font = class {

        options;
        columns = 10;
        charFrom = 32;
        charTo = 126;
        bitmap;
        texture;
        charWidth;
        charHeight;
        constructor( opts ) {

            this.options = opts;
            this.charWidth = opts.fontSize * opts.charRatio;
            this.charHeight = opts.fontSize * 1.2;
            this.bitmap = this.generateBitmap();
            this.texture = new Texture( this.bitmap, {
                filter: Gol.gl.LINEAR_MIPMAP_LINEAR
            } );

        }

        generateBitmap() {

            const bitmap = document.createElement( 'canvas' );
            const charCount = this.charTo - this.charFrom + 1;
            const rows = Math.floor( charCount / this.columns );

            bitmap.width = 2 ** Math.ceil( Math.log2( this.columns * this.charWidth ) );
            bitmap.height = 2 ** Math.ceil( Math.log2( rows * this.charHeight ) );
            const ctx = bitmap.getContext( '2d' );

            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'white';
            ctx.font = `${this.options.fontSize}px ${this.options.fontFamily}`;

            for ( let i = 0; i < charCount; ++i ) {

                const char = String.fromCharCode( i + this.charFrom );
                const x = ( i % this.columns + 0.5 ) * this.charWidth;
                const y = ( Math.floor( i / this.columns ) + 0.5 ) * this.charHeight;

                ctx.fillText( char, x, y );

            }

            return bitmap;

        }

        getCharPosition( char ) {

            if ( char < this.charFrom || char > this.charTo ) {

                return null;

            }

            const idx = char - this.charFrom;

            return [
                idx % this.columns * this.charWidth,
                Math.floor( idx / this.columns ) * this.charHeight
            ];

        }

    };

    // src/graphics/shader.js
    var _Shader = class {

        program;
        constructor( vsrc, fsrc ) {

            const vshader = this.compileShader( vsrc, Gol.gl.VERTEX_SHADER );
            const fshader = this.compileShader( fsrc, Gol.gl.FRAGMENT_SHADER );

            this.program = Gol.gl.createProgram();
            Gol.gl.attachShader( this.program, vshader );
            Gol.gl.attachShader( this.program, fshader );
            Gol.gl.linkProgram( this.program );

            if ( !Gol.gl.getProgramParameter( this.program, Gol.gl.LINK_STATUS ) ) {

                console.log( Gol.gl.getProgramInfoLog( this.program ) );
                throw new Error( 'program unable to link' );

            }

            this.attribs = {
                positions: Gol.gl.getAttribLocation( this.program, 'position' ),
                normals: Gol.gl.getAttribLocation( this.program, 'normal' ),
                colors: Gol.gl.getAttribLocation( this.program, 'color' ),
                uvs: Gol.gl.getAttribLocation( this.program, 'uv' ),
                sizes: Gol.gl.getAttribLocation( this.program, 'size' )
            };
            this.uniforms = [
                {
                    name: 'projectionMatrix',
                    type: 'mat4',
                    location: Gol.gl.getUniformLocation( this.program, 'projectionMatrix' )
                },
                {
                    name: 'modelViewMatrix',
                    type: 'mat4',
                    location: Gol.gl.getUniformLocation( this.program, 'modelViewMatrix' )
                },
                {
                    name: 'modelMatrix',
                    type: 'mat4',
                    location: Gol.gl.getUniformLocation( this.program, 'modelMatrix' )
                },
                {
                    name: 'normalMatrix',
                    type: 'mat3',
                    location: Gol.gl.getUniformLocation( this.program, 'normalMatrix' )
                },
                {
                    name: 'lightColor',
                    type: 'vec3',
                    location: Gol.gl.getUniformLocation( this.program, 'lightColor' )
                },
                {
                    name: 'lightDirection',
                    type: 'vec3',
                    location: Gol.gl.getUniformLocation( this.program, 'lightDirection' )
                },
                {
                    name: 'lightPosition',
                    type: 'vec3',
                    location: Gol.gl.getUniformLocation( this.program, 'lightPosition' )
                },
                {
                    name: 'cameraPosition',
                    type: 'vec3',
                    location: Gol.gl.getUniformLocation( this.program, 'cameraPosition' )
                },
                {
                    name: 'pointMultiplier',
                    type: 'float',
                    location: Gol.gl.getUniformLocation( this.program, 'pointMultiplier' )
                },
                {
                    name: 'ambientColor',
                    type: 'vec3',
                    location: Gol.gl.getUniformLocation( this.program, 'ambientColor' )
                },
                {
                    name: 'uvOffset',
                    type: 'vec2',
                    location: Gol.gl.getUniformLocation( this.program, 'uvOffset' )
                },
                {
                    name: 'fogColor',
                    type: 'vec3',
                    location: Gol.gl.getUniformLocation( this.program, 'fogColor' )
                },
                {
                    name: 'fogNear',
                    type: 'float',
                    location: Gol.gl.getUniformLocation( this.program, 'fogNear' )
                },
                {
                    name: 'fogFar',
                    type: 'float',
                    location: Gol.gl.getUniformLocation( this.program, 'fogFar' )
                }
            ];

        }

        activate() {

            Gol.gl.useProgram( this.program );

        }

        compileShader( src, type ) {

            const shader = Gol.gl.createShader( type );

            Gol.gl.shaderSource( shader, src );
            Gol.gl.compileShader( shader );

            if ( !Gol.gl.getShaderParameter( shader, Gol.gl.COMPILE_STATUS ) ) {

                console.log( Gol.gl.getShaderInfoLog( shader ) );
                throw new Error( 'shader unable to compile' );

            }

            return shader;

        }

        dispose() {
        }

        static create( type, opts = {} ) {

            switch ( type ) {

                case this.Type.SIMPLE: {

                    const vsrc = [ this.SIMPLE_VS ].join( '\n' );
                    const fsrc = [
                        opts.useFog === true ? '#define USE_FOG' : '',
                        this.SIMPLE_FS
                    ].join( '\n' );

                    return new _Shader( vsrc, fsrc );

                }

                case this.Type.TEXTURE: {

                    const vsrc = [ this.TEXTURE_VS ].join( '\n' );
                    const fsrc = [
                        opts.useFog === true ? '#define USE_FOG' : '',
                        this.TEXTURE_FS
                    ].join( '\n' );

                    return new _Shader( vsrc, fsrc );

                }

                case this.Type.PARTICLE: {

                    return new _Shader( this.PARTICLE_VS, this.PARTICLE_FS );

                }

                default:
                    throw new Error( 'Type not found: ' + type );

            }

        }

    };
    const Shader = _Shader;

    __publicField( Shader, 'Type', Object.freeze( {
        SIMPLE: 1,
        TEXTURE: 2,
        PARTICLE: 3
    } ) );
    __publicField( Shader, 'SIMPLE_VS', `
=======
var vt=Object.defineProperty;var ce=(r,t,e)=>t in r?vt(r,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):r[t]=e;var V=(r,t)=>{for(var e in t)vt(r,e,{get:t[e],enumerable:!0})};var U=(r,t,e)=>(ce(r,typeof t!="symbol"?t+"":t,e),e);var cr=class{assets=new Map;toLoad=0;loadImage(t,e){let i=new Image;i.src=e,i.crossOrigin="Anonymous";let n=new Promise(s=>{i.onload=()=>{s(i)}});return this.addAsync(t,n),n}loadAudio(t,e){let i=fetch(e).then(n=>n.arrayBuffer()).then(n=>M.audio.audioContext.decodeAudioData(n));return this.addAsync(t,i),i}addAsync(t,e){++this.toLoad,e.then(i=>{this.assets.set(t,i),--this.toLoad})}waitForAssetsToLoad(){return new Promise(t=>{let e=()=>{this.toLoad==0?t(this.assets):setTimeout(()=>{e()},250)};e()})}get(t){return this.assets.get(t)}};var _r=class{constructor(){this.create()}create(){}show(){}hide(){}resize(t,e){}render(t){}dispose(){}};var Yr=class{screen=null;constructor(){}preload(){}create(){}resize(t,e){this.screen&&this.screen.resize(t,e)}render(t){this.screen&&this.screen.render(t)}setScreen(t){this.screen&&this.screen.hide(),this.screen=t,this.screen.show()}};var G=class{static lerp(t,e,i){return(i-e)*t+e}static rand(t,e){return Math.random()*(e-t)+t}static randInt(t,e){return Math.floor(this.rand(t,e+1))}static clamp(t,e,i){return Math.min(Math.max(t,e),i)}static sat(t){return this.clamp(t,0,1)}static shuffle(t){for(let e=0;e<t.length;++e){let i=this.randInt(0,t.length-1);[t[e],t[i]]=[t[i],t[e]]}}static choice(t){return t[this.randInt(0,t.length-1)]}static isPowerOf2(t){return(t&t-1)==0}static max(t){return Math.max(...t)}static min(t){return Math.min(...t)}static avg(t){return t.reduce((e,i)=>e+i)/t.length}static step(t,e,i){return(i-t)/(e-t)}static radToDeg(t){return t/Math.PI*180}static degToRad(t){return def/180*Math.PI}};var Z=class{id;data;constructor(t,e={}){this.data=t,this.id=M.gl.createTexture(),M.gl.bindTexture(M.gl.TEXTURE_2D,this.id),M.gl.texImage2D(M.gl.TEXTURE_2D,0,M.gl.RGBA,M.gl.RGBA,M.gl.UNSIGNED_BYTE,t),G.isPowerOf2(t.width)&&G.isPowerOf2(t.height)&&M.gl.generateMipmap(M.gl.TEXTURE_2D),M.gl.bindTexture(M.gl.TEXTURE_2D,null),this.setFilter(e.filter||M.gl.LINEAR),this.setWrap(e.wrap||M.gl.CLAMP_TO_EDGE)}setFilter(t){M.gl.bindTexture(M.gl.TEXTURE_2D,this.id),M.gl.texParameteri(M.gl.TEXTURE_2D,M.gl.TEXTURE_MIN_FILTER,t),M.gl.texParameteri(M.gl.TEXTURE_2D,M.gl.TEXTURE_MAG_FILTER,t==M.gl.NEAREST?M.gl.NEAREST:M.gl.LINEAR),M.gl.bindTexture(M.gl.TEXTURE_2D,null)}setWrap(t){M.gl.bindTexture(M.gl.TEXTURE_2D,this.id),M.gl.texParameteri(M.gl.TEXTURE_2D,M.gl.TEXTURE_WRAP_S,t),M.gl.texParameteri(M.gl.TEXTURE_2D,M.gl.TEXTURE_WRAP_T,t),M.gl.bindTexture(M.gl.TEXTURE_2D,null)}bind(){M.gl.bindTexture(M.gl.TEXTURE_2D,this.id)}dispose(){M.gl.deleteTexture(this.id)}get width(){return this.data.width}get height(){return this.data.height}};var J=class{options;columns=10;charFrom=32;charTo=126;bitmap;texture;charWidth;charHeight;constructor(t){this.options=t,this.charWidth=t.fontSize*t.charRatio,this.charHeight=t.fontSize*1.2,this.bitmap=this.generateBitmap(),this.texture=new Z(this.bitmap,{filter:M.gl.LINEAR_MIPMAP_LINEAR})}generateBitmap(){let t=document.createElement("canvas"),e=this.charTo-this.charFrom+1,i=Math.floor(e/this.columns);t.width=2**Math.ceil(Math.log2(this.columns*this.charWidth)),t.height=2**Math.ceil(Math.log2(i*this.charHeight));let n=t.getContext("2d");n.textBaseline="middle",n.textAlign="center",n.fillStyle="white",n.font=`${this.options.fontSize}px ${this.options.fontFamily}`;for(let s=0;s<e;++s){let a=String.fromCharCode(s+this.charFrom),h=(s%this.columns+.5)*this.charWidth,o=(Math.floor(s/this.columns)+.5)*this.charHeight;n.fillText(a,h,o)}return t}getCharPosition(t){if(t<this.charFrom||t>this.charTo)return null;let e=t-this.charFrom;return[e%this.columns*this.charWidth,Math.floor(e/this.columns)*this.charHeight]}};var B=class{program;constructor(t,e){let i=this.compileShader(t,M.gl.VERTEX_SHADER),n=this.compileShader(e,M.gl.FRAGMENT_SHADER);if(this.program=M.gl.createProgram(),M.gl.attachShader(this.program,i),M.gl.attachShader(this.program,n),M.gl.linkProgram(this.program),!M.gl.getProgramParameter(this.program,M.gl.LINK_STATUS))throw console.log(M.gl.getProgramInfoLog(this.program)),new Error("program unable to link");this.attribs={positions:M.gl.getAttribLocation(this.program,"position"),normals:M.gl.getAttribLocation(this.program,"normal"),colors:M.gl.getAttribLocation(this.program,"color"),uvs:M.gl.getAttribLocation(this.program,"uv"),sizes:M.gl.getAttribLocation(this.program,"size")},this.uniforms=[{name:"projectionMatrix",type:"mat4",location:M.gl.getUniformLocation(this.program,"projectionMatrix")},{name:"modelViewMatrix",type:"mat4",location:M.gl.getUniformLocation(this.program,"modelViewMatrix")},{name:"modelMatrix",type:"mat4",location:M.gl.getUniformLocation(this.program,"modelMatrix")},{name:"normalMatrix",type:"mat3",location:M.gl.getUniformLocation(this.program,"normalMatrix")},{name:"lightColor",type:"vec3",location:M.gl.getUniformLocation(this.program,"lightColor")},{name:"lightDirection",type:"vec3",location:M.gl.getUniformLocation(this.program,"lightDirection")},{name:"lightPosition",type:"vec3",location:M.gl.getUniformLocation(this.program,"lightPosition")},{name:"cameraPosition",type:"vec3",location:M.gl.getUniformLocation(this.program,"cameraPosition")},{name:"pointMultiplier",type:"float",location:M.gl.getUniformLocation(this.program,"pointMultiplier")},{name:"ambientColor",type:"vec3",location:M.gl.getUniformLocation(this.program,"ambientColor")},{name:"uvOffset",type:"vec2",location:M.gl.getUniformLocation(this.program,"uvOffset")},{name:"fogColor",type:"vec3",location:M.gl.getUniformLocation(this.program,"fogColor")},{name:"fogNear",type:"float",location:M.gl.getUniformLocation(this.program,"fogNear")},{name:"fogFar",type:"float",location:M.gl.getUniformLocation(this.program,"fogFar")},{name:"fogTime",type:"float",location:M.gl.getUniformLocation(this.program,"fogTime")}]}activate(){M.gl.useProgram(this.program)}compileShader(t,e){let i=M.gl.createShader(e);if(M.gl.shaderSource(i,t),M.gl.compileShader(i),!M.gl.getShaderParameter(i,M.gl.COMPILE_STATUS))throw console.log(M.gl.getShaderInfoLog(i)),console.log(t),new Error("shader unable to compile");return i}dispose(){}static create(t,e={}){let i="precision mediump float;",n=p=>p.replace("{{USER}}",e.onCustomProcessPosition===void 0?"":e.onCustomProcessPosition),s=e.useFog===!0?"#define USE_FOG":"",a=Array.isArray(e.uniforms),h="",o="";a&&e.uniforms.forEach(p=>{let x=`	uniform ${p.type} ${p.name};
`;switch(p.shader){case"vert":h+=x;break;case"frag":o+=x;break}});let c,f;switch(t){case this.Type.SIMPLE:{c=[h,s,n(this.SIMPLE_VS)].join(`
`),f=[i,o,s,this.SIMPLE_FS].join(`
`);break}case this.Type.TEXTURE:{c=[h,s,n(this.TEXTURE_VS)].join(`
`),f=[i,o,s,this.TEXTURE_FS].join(`
`);break}case this.Type.PARTICLE:{c=[h,this.PARTICLE_VS].join(`
`),f=[i,o,this.PARTICLE_FS].join(`
`);break}default:throw new Error("Type not found: "+t)}let l=new B(c,f);if(a)for(let p of e.uniforms)l.uniforms.push({name:p.name,type:p.type,location:M.gl.getUniformLocation(l.program,p.name)});return l}},L=B;U(L,"Type",Object.freeze({SIMPLE:"simple",TEXTURE:"texture",PARTICLE:"particle"})),U(L,"PROC_POS_FUNC",`
    vec3 proc_pos(vec3 position) {
        {{USER}}
        return position;
    }
    `),U(L,"FOG_VERT_PARAMS",`
    #ifdef USE_FOG
    varying vec3 vWorldPosition;
    #endif
    `),U(L,"FOG_VERT",`
    #ifdef USE_FOG
    vWorldPosition = worldPosition.xyz;
    #endif
    `),U(L,"FOG_FRAG_PARAMS",`
    #ifdef USE_FOG
    varying vec3 vWorldPosition;
    uniform vec3 fogColor;
    uniform float fogNear;
    uniform float fogFar;
    uniform float fogTime;
    #endif
    `),U(L,"FOG_FRAG",`
    #ifdef USE_FOG
    vec3 fogDirection = normalize(vWorldPosition);
    float fogDepth = length(vWorldPosition);

    float fogFactor = smoothstep(fogNear, fogFar, fogDepth);
    fogFactor = clamp(fogFactor, 0.0, 1.0);

    gl_FragColor = mix( gl_FragColor, vec4(fogColor, fogAlpha), fogFactor);
    #endif
    `),U(L,"SIMPLE_VS",`
>>>>>>> 378055e7aafd91ccbdea1e168957e00facd76e27
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;

    attribute vec3 position;
    attribute vec4 color;

    varying vec4 vColor;

    ${B.FOG_VERT_PARAMS}

    ${B.PROC_POS_FUNC}

    void main(void) {
        vec4 worldPosition = modelViewMatrix * vec4(proc_pos(position), 1.0);
        gl_Position = projectionMatrix * worldPosition;
        vColor = color;
        ${B.FOG_VERT}
    }
<<<<<<< HEAD
    ` );
    __publicField( Shader, 'SIMPLE_FS', `
    precision mediump float;

=======
    `),U(L,"SIMPLE_FS",`
>>>>>>> 378055e7aafd91ccbdea1e168957e00facd76e27
    varying vec4 vColor;
    uniform vec3 ambientColor;
    uniform vec3 cameraPosition;

    ${B.FOG_FRAG_PARAMS}

    void main(void) {
        gl_FragColor = vec4(vColor.rgb * ambientColor, vColor.a);
        float fogAlpha = 1.0;
        ${B.FOG_FRAG}
    }
<<<<<<< HEAD
    ` );
    __publicField( Shader, 'TEXTURE_VS', `
=======
    `),U(L,"TEXTURE_VS",`
>>>>>>> 378055e7aafd91ccbdea1e168957e00facd76e27
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;

    attribute vec3 position;
    attribute vec4 color;
    attribute vec2 uv;

    varying vec4 vColor;
    varying vec2 vUv;
    
    ${B.FOG_VERT_PARAMS}

    ${B.PROC_POS_FUNC}

    void main(void) {
        vec4 worldPosition = modelViewMatrix * vec4(proc_pos(position), 1.0);
        gl_Position = projectionMatrix * worldPosition;
        vColor = color;
        vUv = uv;
        ${B.FOG_VERT}
    }
<<<<<<< HEAD
    ` );
    __publicField( Shader, 'TEXTURE_FS', ` 
    precision mediump float;

=======
    `),U(L,"TEXTURE_FS",` 
>>>>>>> 378055e7aafd91ccbdea1e168957e00facd76e27
    varying vec4 vColor;
    varying vec2 vUv;

    uniform sampler2D tex;
    uniform vec3 ambientColor;
    uniform vec2 uvOffset;
    uniform vec3 cameraPosition;

    ${B.FOG_FRAG_PARAMS}

    void main(void) {
        vec4 texColor = texture2D(tex, vUv + uvOffset);
        gl_FragColor = vec4(vColor.rgb * texColor.rgb * ambientColor, texColor.a * vColor.a);
        float fogAlpha = texColor.a;
        ${B.FOG_FRAG}
    }
<<<<<<< HEAD
    ` );
    __publicField( Shader, 'PARTICLE_VS', `
=======
    `),U(L,"PARTICLE_VS",`
>>>>>>> 378055e7aafd91ccbdea1e168957e00facd76e27
    attribute vec3 position;
    attribute vec4 color;
    attribute float size;
    
    uniform float pointMultiplier;
    uniform mat4 projectionMatrix;
    uniform mat4 modelViewMatrix;
    
    varying vec4 vColor;
    
    void main(void) {
        vec4 worldPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * worldPosition;
        gl_PointSize = size * pointMultiplier / gl_Position.w;
        vColor = color;
    }
<<<<<<< HEAD
    ` );
    __publicField( Shader, 'PARTICLE_FS', `
    precision mediump float;
    
=======
    `),U(L,"PARTICLE_FS",`
>>>>>>> 378055e7aafd91ccbdea1e168957e00facd76e27
    varying vec4 vColor;

    uniform sampler2D tex;
    uniform vec3 ambientColor;
    uniform vec3 cameraPosition;
    
    void main(void) {
        vec4 texColor = texture2D(tex, gl_PointCoord);
        gl_FragColor = vec4(vColor.rgb * texColor.rgb * ambientColor * texColor.a, texColor.a) * vColor.a;
    }
<<<<<<< HEAD
    ` );

    // src/graphics.js
    const Graphics = class {

        canvas;
        gl;
        frameId = null;
        width;
        height;
        delta = 0;
        fps = 60;
        lastFrameTime;
        frameStart;
        frames;
        game;
        shaders = /* @__PURE__ */ new Map();
        fonts = /* @__PURE__ */ new Map();
        constructor( game ) {

            this.game = game;
            this.canvas = this.createCanvas();
            this.canvas.width = this.width = innerWidth;
            this.canvas.height = this.height = innerHeight;
            this.gl = this.canvas.getContext( 'webgl' );

        }

        onResume() {

            this.lastFrameTime = this.frameStart = performance.now();
            this.frames = 0;
            this.RAF();

        }

        createCanvas() {

            const canvas = document.createElement( 'canvas' );

            canvas.oncontextmenu = ( ev ) => {

                ev.preventDefault();
                ev.stopPropagation();

            };

            document.body.appendChild( canvas );

            return canvas;

        }

        onResize() {

            this.canvas.width = this.width = innerWidth;
            this.canvas.height = this.height = innerHeight;
            this.game.resize( this.width, this.height );

        }

        onDrawFrame() {

            const time = performance.now();

            this.delta = ( time - this.lastFrameTime ) * 1e-3;
            this.lastFrameTime = time;
            Gol.input.update();
            this.game.render( this.delta );

            if ( time - this.frameStart >= 1e3 ) {

                this.fps = this.frames;
                this.frames = 0;
                this.frameStart = time;

            }

            ++this.frames;

        }

        RAF() {

            this.frameId = requestAnimationFrame( () => {

                this.RAF();
                this.onDrawFrame();

            } );

        }

        compileShaders() {

            this.shaders.set( 'simple', new Shader( Shader.SIMPLE_VS, Shader.SIMPLE_FS ) );
            this.shaders.set( 'texture', new Shader( Shader.TEXTURE_VS, Shader.TEXTURE_FS ) );
            this.shaders.set( 'particle', new Shader( Shader.PARTICLE_VS, Shader.PARTICLE_FS ) );

        }

        generateFonts() {

            this.fonts.set( 'Consolas', new Font( {
                fontFamily: 'Consolas',
                fontSize: 48,
                charRatio: 0.6
            } ) );

        }

        getShader( name ) {

            return this.shaders.get( name );

        }

        getFont( name ) {

            return this.fonts.get( name );

        }

    };

    // src/graphics/_index.js
    const index_exports2 = {};

    __export( index_exports2, {
        Batch: () => Batch,
        Camera: () => Camera,
        Drawable: () => Drawable,
        DrawableGroup: () => DrawableGroup,
        Font: () => Font,
        Mesh: () => Mesh,
        OrthographicCamera: () => OrthographicCamera,
        Particle: () => Particle,
        ParticleSystem: () => ParticleSystem,
        PerspectiveCamera: () => PerspectiveCamera,
        Shader: () => Shader,
        ShaderInstance: () => ShaderInstance,
        Sprite: () => Sprite,
        TextDrawable: () => TextDrawable,
        Texture: () => Texture,
        meshes: () => index_exports
    } );

    // node_modules/gl-matrix/esm/index.js
    const esm_exports = {};

    __export( esm_exports, {
        glMatrix: () => common_exports,
        mat2: () => mat2_exports,
        mat2d: () => mat2d_exports,
        mat3: () => mat3_exports,
        mat4: () => mat4_exports,
        quat: () => quat_exports,
        quat2: () => quat2_exports,
        vec2: () => vec2_exports,
        vec3: () => vec3_exports,
        vec4: () => vec4_exports
    } );

    // node_modules/gl-matrix/esm/common.js
    var common_exports = {};

    __export( common_exports, {
        ARRAY_TYPE: () => ARRAY_TYPE,
        EPSILON: () => EPSILON,
        RANDOM: () => RANDOM,
        equals: () => equals,
        setMatrixArrayType: () => setMatrixArrayType,
        toRadian: () => toRadian
    } );
    var EPSILON = 1e-6;
    var ARRAY_TYPE = typeof Float32Array !== 'undefined' ? Float32Array : Array;
    var RANDOM = Math.random;

    function setMatrixArrayType( type ) {

        ARRAY_TYPE = type;

    }

    const degree = Math.PI / 180;

    function toRadian( a ) {

        return a * degree;

    }

    function equals( a, b ) {

        return Math.abs( a - b ) <= EPSILON * Math.max( 1, Math.abs( a ), Math.abs( b ) );

    }

    if ( !Math.hypot )
        Math.hypot = function () {

            let y = 0, i = arguments.length;

            while ( i-- ) {

                y += arguments[ i ] * arguments[ i ];

            }

            return Math.sqrt( y );

        };

    // node_modules/gl-matrix/esm/mat2.js
    var mat2_exports = {};

    __export( mat2_exports, {
        LDU: () => LDU,
        add: () => add,
        adjoint: () => adjoint,
        clone: () => clone,
        copy: () => copy,
        create: () => create,
        determinant: () => determinant,
        equals: () => equals2,
        exactEquals: () => exactEquals,
        frob: () => frob,
        fromRotation: () => fromRotation,
        fromScaling: () => fromScaling,
        fromValues: () => fromValues,
        identity: () => identity,
        invert: () => invert,
        mul: () => mul,
        multiply: () => multiply,
        multiplyScalar: () => multiplyScalar,
        multiplyScalarAndAdd: () => multiplyScalarAndAdd,
        rotate: () => rotate,
        scale: () => scale,
        set: () => set,
        str: () => str,
        sub: () => sub,
        subtract: () => subtract,
        transpose: () => transpose
    } );

    function create() {

        const out = new ARRAY_TYPE( 4 );

        if ( ARRAY_TYPE != Float32Array ) {

            out[ 1 ] = 0;
            out[ 2 ] = 0;

        }

        out[ 0 ] = 1;
        out[ 3 ] = 1;

        return out;

    }

    function clone( a ) {

        const out = new ARRAY_TYPE( 4 );

        out[ 0 ] = a[ 0 ];
        out[ 1 ] = a[ 1 ];
        out[ 2 ] = a[ 2 ];
        out[ 3 ] = a[ 3 ];

        return out;

    }

    function copy( out, a ) {

        out[ 0 ] = a[ 0 ];
        out[ 1 ] = a[ 1 ];
        out[ 2 ] = a[ 2 ];
        out[ 3 ] = a[ 3 ];

        return out;

    }

    function identity( out ) {

        out[ 0 ] = 1;
        out[ 1 ] = 0;
        out[ 2 ] = 0;
        out[ 3 ] = 1;

        return out;

    }

    function fromValues( m00, m01, m10, m11 ) {

        const out = new ARRAY_TYPE( 4 );

        out[ 0 ] = m00;
        out[ 1 ] = m01;
        out[ 2 ] = m10;
        out[ 3 ] = m11;

        return out;

    }

    function set( out, m00, m01, m10, m11 ) {

        out[ 0 ] = m00;
        out[ 1 ] = m01;
        out[ 2 ] = m10;
        out[ 3 ] = m11;

        return out;

    }

    function transpose( out, a ) {

        if ( out === a ) {

            const a1 = a[ 1 ];

            out[ 1 ] = a[ 2 ];
            out[ 2 ] = a1;

        } else {

            out[ 0 ] = a[ 0 ];
            out[ 1 ] = a[ 2 ];
            out[ 2 ] = a[ 1 ];
            out[ 3 ] = a[ 3 ];

        }

        return out;

    }

    function invert( out, a ) {

        const a0 = a[ 0 ], a1 = a[ 1 ], a2 = a[ 2 ], a3 = a[ 3 ];
        let det = a0 * a3 - a2 * a1;

        if ( !det ) {

            return null;

        }

        det = 1 / det;
        out[ 0 ] = a3 * det;
        out[ 1 ] = - a1 * det;
        out[ 2 ] = - a2 * det;
        out[ 3 ] = a0 * det;

        return out;

    }

    function adjoint( out, a ) {

        const a0 = a[ 0 ];

        out[ 0 ] = a[ 3 ];
        out[ 1 ] = - a[ 1 ];
        out[ 2 ] = - a[ 2 ];
        out[ 3 ] = a0;

        return out;

    }

    function determinant( a ) {

        return a[ 0 ] * a[ 3 ] - a[ 2 ] * a[ 1 ];

    }

    function multiply( out, a, b ) {

        const a0 = a[ 0 ], a1 = a[ 1 ], a2 = a[ 2 ], a3 = a[ 3 ];
        const b0 = b[ 0 ], b1 = b[ 1 ], b2 = b[ 2 ], b3 = b[ 3 ];

        out[ 0 ] = a0 * b0 + a2 * b1;
        out[ 1 ] = a1 * b0 + a3 * b1;
        out[ 2 ] = a0 * b2 + a2 * b3;
        out[ 3 ] = a1 * b2 + a3 * b3;

        return out;

    }

    function rotate( out, a, rad ) {

        const a0 = a[ 0 ], a1 = a[ 1 ], a2 = a[ 2 ], a3 = a[ 3 ];
        const s = Math.sin( rad );
        const c = Math.cos( rad );

        out[ 0 ] = a0 * c + a2 * s;
        out[ 1 ] = a1 * c + a3 * s;
        out[ 2 ] = a0 * - s + a2 * c;
        out[ 3 ] = a1 * - s + a3 * c;

        return out;

    }

    function scale( out, a, v ) {

        const a0 = a[ 0 ], a1 = a[ 1 ], a2 = a[ 2 ], a3 = a[ 3 ];
        const v0 = v[ 0 ], v1 = v[ 1 ];

        out[ 0 ] = a0 * v0;
        out[ 1 ] = a1 * v0;
        out[ 2 ] = a2 * v1;
        out[ 3 ] = a3 * v1;

        return out;

    }

    function fromRotation( out, rad ) {

        const s = Math.sin( rad );
        const c = Math.cos( rad );

        out[ 0 ] = c;
        out[ 1 ] = s;
        out[ 2 ] = - s;
        out[ 3 ] = c;

        return out;

    }

    function fromScaling( out, v ) {

        out[ 0 ] = v[ 0 ];
        out[ 1 ] = 0;
        out[ 2 ] = 0;
        out[ 3 ] = v[ 1 ];

        return out;

    }

    function str( a ) {

        return 'mat2(' + a[ 0 ] + ', ' + a[ 1 ] + ', ' + a[ 2 ] + ', ' + a[ 3 ] + ')';

    }

    function frob( a ) {

        return Math.hypot( a[ 0 ], a[ 1 ], a[ 2 ], a[ 3 ] );

    }

    function LDU( L, D, U, a ) {

        L[ 2 ] = a[ 2 ] / a[ 0 ];
        U[ 0 ] = a[ 0 ];
        U[ 1 ] = a[ 1 ];
        U[ 3 ] = a[ 3 ] - L[ 2 ] * U[ 1 ];

        return [ L, D, U ];

    }

    function add( out, a, b ) {

        out[ 0 ] = a[ 0 ] + b[ 0 ];
        out[ 1 ] = a[ 1 ] + b[ 1 ];
        out[ 2 ] = a[ 2 ] + b[ 2 ];
        out[ 3 ] = a[ 3 ] + b[ 3 ];

        return out;

    }

    function subtract( out, a, b ) {

        out[ 0 ] = a[ 0 ] - b[ 0 ];
        out[ 1 ] = a[ 1 ] - b[ 1 ];
        out[ 2 ] = a[ 2 ] - b[ 2 ];
        out[ 3 ] = a[ 3 ] - b[ 3 ];

        return out;

    }

    function exactEquals( a, b ) {

        return a[ 0 ] === b[ 0 ] && a[ 1 ] === b[ 1 ] && a[ 2 ] === b[ 2 ] && a[ 3 ] === b[ 3 ];

    }

    function equals2( a, b ) {

        const a0 = a[ 0 ], a1 = a[ 1 ], a2 = a[ 2 ], a3 = a[ 3 ];
        const b0 = b[ 0 ], b1 = b[ 1 ], b2 = b[ 2 ], b3 = b[ 3 ];

        return Math.abs( a0 - b0 ) <= EPSILON * Math.max( 1, Math.abs( a0 ), Math.abs( b0 ) ) && Math.abs( a1 - b1 ) <= EPSILON * Math.max( 1, Math.abs( a1 ), Math.abs( b1 ) ) && Math.abs( a2 - b2 ) <= EPSILON * Math.max( 1, Math.abs( a2 ), Math.abs( b2 ) ) && Math.abs( a3 - b3 ) <= EPSILON * Math.max( 1, Math.abs( a3 ), Math.abs( b3 ) );

    }

    function multiplyScalar( out, a, b ) {

        out[ 0 ] = a[ 0 ] * b;
        out[ 1 ] = a[ 1 ] * b;
        out[ 2 ] = a[ 2 ] * b;
        out[ 3 ] = a[ 3 ] * b;

        return out;

    }

    function multiplyScalarAndAdd( out, a, b, scale10 ) {

        out[ 0 ] = a[ 0 ] + b[ 0 ] * scale10;
        out[ 1 ] = a[ 1 ] + b[ 1 ] * scale10;
        out[ 2 ] = a[ 2 ] + b[ 2 ] * scale10;
        out[ 3 ] = a[ 3 ] + b[ 3 ] * scale10;

        return out;

    }

    var mul = multiply;
    var sub = subtract;

    // node_modules/gl-matrix/esm/mat2d.js
    var mat2d_exports = {};

    __export( mat2d_exports, {
        add: () => add2,
        clone: () => clone2,
        copy: () => copy2,
        create: () => create2,
        determinant: () => determinant2,
        equals: () => equals3,
        exactEquals: () => exactEquals2,
        frob: () => frob2,
        fromRotation: () => fromRotation2,
        fromScaling: () => fromScaling2,
        fromTranslation: () => fromTranslation,
        fromValues: () => fromValues2,
        identity: () => identity2,
        invert: () => invert2,
        mul: () => mul2,
        multiply: () => multiply2,
        multiplyScalar: () => multiplyScalar2,
        multiplyScalarAndAdd: () => multiplyScalarAndAdd2,
        rotate: () => rotate2,
        scale: () => scale2,
        set: () => set2,
        str: () => str2,
        sub: () => sub2,
        subtract: () => subtract2,
        translate: () => translate
    } );

    function create2() {

        const out = new ARRAY_TYPE( 6 );

        if ( ARRAY_TYPE != Float32Array ) {

            out[ 1 ] = 0;
            out[ 2 ] = 0;
            out[ 4 ] = 0;
            out[ 5 ] = 0;

        }

        out[ 0 ] = 1;
        out[ 3 ] = 1;

        return out;

    }

    function clone2( a ) {

        const out = new ARRAY_TYPE( 6 );

        out[ 0 ] = a[ 0 ];
        out[ 1 ] = a[ 1 ];
        out[ 2 ] = a[ 2 ];
        out[ 3 ] = a[ 3 ];
        out[ 4 ] = a[ 4 ];
        out[ 5 ] = a[ 5 ];

        return out;

    }

    function copy2( out, a ) {

        out[ 0 ] = a[ 0 ];
        out[ 1 ] = a[ 1 ];
        out[ 2 ] = a[ 2 ];
        out[ 3 ] = a[ 3 ];
        out[ 4 ] = a[ 4 ];
        out[ 5 ] = a[ 5 ];

        return out;

    }

    function identity2( out ) {

        out[ 0 ] = 1;
        out[ 1 ] = 0;
        out[ 2 ] = 0;
        out[ 3 ] = 1;
        out[ 4 ] = 0;
        out[ 5 ] = 0;

        return out;

    }

    function fromValues2( a, b, c, d, tx, ty ) {

        const out = new ARRAY_TYPE( 6 );

        out[ 0 ] = a;
        out[ 1 ] = b;
        out[ 2 ] = c;
        out[ 3 ] = d;
        out[ 4 ] = tx;
        out[ 5 ] = ty;

        return out;

    }

    function set2( out, a, b, c, d, tx, ty ) {

        out[ 0 ] = a;
        out[ 1 ] = b;
        out[ 2 ] = c;
        out[ 3 ] = d;
        out[ 4 ] = tx;
        out[ 5 ] = ty;

        return out;

    }

    function invert2( out, a ) {

        const aa = a[ 0 ], ab = a[ 1 ], ac = a[ 2 ], ad = a[ 3 ];
        const atx = a[ 4 ], aty = a[ 5 ];
        let det = aa * ad - ab * ac;

        if ( !det ) {

            return null;

        }

        det = 1 / det;
        out[ 0 ] = ad * det;
        out[ 1 ] = - ab * det;
        out[ 2 ] = - ac * det;
        out[ 3 ] = aa * det;
        out[ 4 ] = ( ac * aty - ad * atx ) * det;
        out[ 5 ] = ( ab * atx - aa * aty ) * det;

        return out;

    }

    function determinant2( a ) {

        return a[ 0 ] * a[ 3 ] - a[ 1 ] * a[ 2 ];

    }

    function multiply2( out, a, b ) {

        const a0 = a[ 0 ], a1 = a[ 1 ], a2 = a[ 2 ], a3 = a[ 3 ], a4 = a[ 4 ], a5 = a[ 5 ];
        const b0 = b[ 0 ], b1 = b[ 1 ], b2 = b[ 2 ], b3 = b[ 3 ], b4 = b[ 4 ], b5 = b[ 5 ];

        out[ 0 ] = a0 * b0 + a2 * b1;
        out[ 1 ] = a1 * b0 + a3 * b1;
        out[ 2 ] = a0 * b2 + a2 * b3;
        out[ 3 ] = a1 * b2 + a3 * b3;
        out[ 4 ] = a0 * b4 + a2 * b5 + a4;
        out[ 5 ] = a1 * b4 + a3 * b5 + a5;

        return out;

    }

    function rotate2( out, a, rad ) {

        const a0 = a[ 0 ], a1 = a[ 1 ], a2 = a[ 2 ], a3 = a[ 3 ], a4 = a[ 4 ], a5 = a[ 5 ];
        const s = Math.sin( rad );
        const c = Math.cos( rad );

        out[ 0 ] = a0 * c + a2 * s;
        out[ 1 ] = a1 * c + a3 * s;
        out[ 2 ] = a0 * - s + a2 * c;
        out[ 3 ] = a1 * - s + a3 * c;
        out[ 4 ] = a4;
        out[ 5 ] = a5;

        return out;

    }

    function scale2( out, a, v ) {

        const a0 = a[ 0 ], a1 = a[ 1 ], a2 = a[ 2 ], a3 = a[ 3 ], a4 = a[ 4 ], a5 = a[ 5 ];
        const v0 = v[ 0 ], v1 = v[ 1 ];

        out[ 0 ] = a0 * v0;
        out[ 1 ] = a1 * v0;
        out[ 2 ] = a2 * v1;
        out[ 3 ] = a3 * v1;
        out[ 4 ] = a4;
        out[ 5 ] = a5;

        return out;

    }

    function translate( out, a, v ) {

        const a0 = a[ 0 ], a1 = a[ 1 ], a2 = a[ 2 ], a3 = a[ 3 ], a4 = a[ 4 ], a5 = a[ 5 ];
        const v0 = v[ 0 ], v1 = v[ 1 ];

        out[ 0 ] = a0;
        out[ 1 ] = a1;
        out[ 2 ] = a2;
        out[ 3 ] = a3;
        out[ 4 ] = a0 * v0 + a2 * v1 + a4;
        out[ 5 ] = a1 * v0 + a3 * v1 + a5;

        return out;

    }

    function fromRotation2( out, rad ) {

        const s = Math.sin( rad ), c = Math.cos( rad );

        out[ 0 ] = c;
        out[ 1 ] = s;
        out[ 2 ] = - s;
        out[ 3 ] = c;
        out[ 4 ] = 0;
        out[ 5 ] = 0;

        return out;

    }

    function fromScaling2( out, v ) {

        out[ 0 ] = v[ 0 ];
        out[ 1 ] = 0;
        out[ 2 ] = 0;
        out[ 3 ] = v[ 1 ];
        out[ 4 ] = 0;
        out[ 5 ] = 0;

        return out;

    }

    function fromTranslation( out, v ) {

        out[ 0 ] = 1;
        out[ 1 ] = 0;
        out[ 2 ] = 0;
        out[ 3 ] = 1;
        out[ 4 ] = v[ 0 ];
        out[ 5 ] = v[ 1 ];

        return out;

    }

    function str2( a ) {

        return 'mat2d(' + a[ 0 ] + ', ' + a[ 1 ] + ', ' + a[ 2 ] + ', ' + a[ 3 ] + ', ' + a[ 4 ] + ', ' + a[ 5 ] + ')';

    }

    function frob2( a ) {

        return Math.hypot( a[ 0 ], a[ 1 ], a[ 2 ], a[ 3 ], a[ 4 ], a[ 5 ], 1 );

    }

    function add2( out, a, b ) {

        out[ 0 ] = a[ 0 ] + b[ 0 ];
        out[ 1 ] = a[ 1 ] + b[ 1 ];
        out[ 2 ] = a[ 2 ] + b[ 2 ];
        out[ 3 ] = a[ 3 ] + b[ 3 ];
        out[ 4 ] = a[ 4 ] + b[ 4 ];
        out[ 5 ] = a[ 5 ] + b[ 5 ];

        return out;

    }

    function subtract2( out, a, b ) {

        out[ 0 ] = a[ 0 ] - b[ 0 ];
        out[ 1 ] = a[ 1 ] - b[ 1 ];
        out[ 2 ] = a[ 2 ] - b[ 2 ];
        out[ 3 ] = a[ 3 ] - b[ 3 ];
        out[ 4 ] = a[ 4 ] - b[ 4 ];
        out[ 5 ] = a[ 5 ] - b[ 5 ];

        return out;

    }

    function multiplyScalar2( out, a, b ) {

        out[ 0 ] = a[ 0 ] * b;
        out[ 1 ] = a[ 1 ] * b;
        out[ 2 ] = a[ 2 ] * b;
        out[ 3 ] = a[ 3 ] * b;
        out[ 4 ] = a[ 4 ] * b;
        out[ 5 ] = a[ 5 ] * b;

        return out;

    }

    function multiplyScalarAndAdd2( out, a, b, scale10 ) {

        out[ 0 ] = a[ 0 ] + b[ 0 ] * scale10;
        out[ 1 ] = a[ 1 ] + b[ 1 ] * scale10;
        out[ 2 ] = a[ 2 ] + b[ 2 ] * scale10;
        out[ 3 ] = a[ 3 ] + b[ 3 ] * scale10;
        out[ 4 ] = a[ 4 ] + b[ 4 ] * scale10;
        out[ 5 ] = a[ 5 ] + b[ 5 ] * scale10;

        return out;

    }

    function exactEquals2( a, b ) {

        return a[ 0 ] === b[ 0 ] && a[ 1 ] === b[ 1 ] && a[ 2 ] === b[ 2 ] && a[ 3 ] === b[ 3 ] && a[ 4 ] === b[ 4 ] && a[ 5 ] === b[ 5 ];

    }

    function equals3( a, b ) {

        const a0 = a[ 0 ], a1 = a[ 1 ], a2 = a[ 2 ], a3 = a[ 3 ], a4 = a[ 4 ], a5 = a[ 5 ];
        const b0 = b[ 0 ], b1 = b[ 1 ], b2 = b[ 2 ], b3 = b[ 3 ], b4 = b[ 4 ], b5 = b[ 5 ];

        return Math.abs( a0 - b0 ) <= EPSILON * Math.max( 1, Math.abs( a0 ), Math.abs( b0 ) ) && Math.abs( a1 - b1 ) <= EPSILON * Math.max( 1, Math.abs( a1 ), Math.abs( b1 ) ) && Math.abs( a2 - b2 ) <= EPSILON * Math.max( 1, Math.abs( a2 ), Math.abs( b2 ) ) && Math.abs( a3 - b3 ) <= EPSILON * Math.max( 1, Math.abs( a3 ), Math.abs( b3 ) ) && Math.abs( a4 - b4 ) <= EPSILON * Math.max( 1, Math.abs( a4 ), Math.abs( b4 ) ) && Math.abs( a5 - b5 ) <= EPSILON * Math.max( 1, Math.abs( a5 ), Math.abs( b5 ) );

    }

    var mul2 = multiply2;
    var sub2 = subtract2;

    // node_modules/gl-matrix/esm/mat3.js
    var mat3_exports = {};

    __export( mat3_exports, {
        add: () => add3,
        adjoint: () => adjoint2,
        clone: () => clone3,
        copy: () => copy3,
        create: () => create3,
        determinant: () => determinant3,
        equals: () => equals4,
        exactEquals: () => exactEquals3,
        frob: () => frob3,
        fromMat2d: () => fromMat2d,
        fromMat4: () => fromMat4,
        fromQuat: () => fromQuat,
        fromRotation: () => fromRotation3,
        fromScaling: () => fromScaling3,
        fromTranslation: () => fromTranslation2,
        fromValues: () => fromValues3,
        identity: () => identity3,
        invert: () => invert3,
        mul: () => mul3,
        multiply: () => multiply3,
        multiplyScalar: () => multiplyScalar3,
        multiplyScalarAndAdd: () => multiplyScalarAndAdd3,
        normalFromMat4: () => normalFromMat4,
        projection: () => projection,
        rotate: () => rotate3,
        scale: () => scale3,
        set: () => set3,
        str: () => str3,
        sub: () => sub3,
        subtract: () => subtract3,
        translate: () => translate2,
        transpose: () => transpose2
    } );

    function create3() {

        const out = new ARRAY_TYPE( 9 );

        if ( ARRAY_TYPE != Float32Array ) {

            out[ 1 ] = 0;
            out[ 2 ] = 0;
            out[ 3 ] = 0;
            out[ 5 ] = 0;
            out[ 6 ] = 0;
            out[ 7 ] = 0;

        }

        out[ 0 ] = 1;
        out[ 4 ] = 1;
        out[ 8 ] = 1;

        return out;

    }

    function fromMat4( out, a ) {

        out[ 0 ] = a[ 0 ];
        out[ 1 ] = a[ 1 ];
        out[ 2 ] = a[ 2 ];
        out[ 3 ] = a[ 4 ];
        out[ 4 ] = a[ 5 ];
        out[ 5 ] = a[ 6 ];
        out[ 6 ] = a[ 8 ];
        out[ 7 ] = a[ 9 ];
        out[ 8 ] = a[ 10 ];

        return out;

    }

    function clone3( a ) {

        const out = new ARRAY_TYPE( 9 );

        out[ 0 ] = a[ 0 ];
        out[ 1 ] = a[ 1 ];
        out[ 2 ] = a[ 2 ];
        out[ 3 ] = a[ 3 ];
        out[ 4 ] = a[ 4 ];
        out[ 5 ] = a[ 5 ];
        out[ 6 ] = a[ 6 ];
        out[ 7 ] = a[ 7 ];
        out[ 8 ] = a[ 8 ];

        return out;

    }

    function copy3( out, a ) {

        out[ 0 ] = a[ 0 ];
        out[ 1 ] = a[ 1 ];
        out[ 2 ] = a[ 2 ];
        out[ 3 ] = a[ 3 ];
        out[ 4 ] = a[ 4 ];
        out[ 5 ] = a[ 5 ];
        out[ 6 ] = a[ 6 ];
        out[ 7 ] = a[ 7 ];
        out[ 8 ] = a[ 8 ];

        return out;

    }

    function fromValues3( m00, m01, m02, m10, m11, m12, m20, m21, m22 ) {

        const out = new ARRAY_TYPE( 9 );

        out[ 0 ] = m00;
        out[ 1 ] = m01;
        out[ 2 ] = m02;
        out[ 3 ] = m10;
        out[ 4 ] = m11;
        out[ 5 ] = m12;
        out[ 6 ] = m20;
        out[ 7 ] = m21;
        out[ 8 ] = m22;

        return out;

    }

    function set3( out, m00, m01, m02, m10, m11, m12, m20, m21, m22 ) {

        out[ 0 ] = m00;
        out[ 1 ] = m01;
        out[ 2 ] = m02;
        out[ 3 ] = m10;
        out[ 4 ] = m11;
        out[ 5 ] = m12;
        out[ 6 ] = m20;
        out[ 7 ] = m21;
        out[ 8 ] = m22;

        return out;

    }

    function identity3( out ) {

        out[ 0 ] = 1;
        out[ 1 ] = 0;
        out[ 2 ] = 0;
        out[ 3 ] = 0;
        out[ 4 ] = 1;
        out[ 5 ] = 0;
        out[ 6 ] = 0;
        out[ 7 ] = 0;
        out[ 8 ] = 1;

        return out;

    }

    function transpose2( out, a ) {

        if ( out === a ) {

            const a01 = a[ 1 ], a02 = a[ 2 ], a12 = a[ 5 ];

            out[ 1 ] = a[ 3 ];
            out[ 2 ] = a[ 6 ];
            out[ 3 ] = a01;
            out[ 5 ] = a[ 7 ];
            out[ 6 ] = a02;
            out[ 7 ] = a12;

        } else {

            out[ 0 ] = a[ 0 ];
            out[ 1 ] = a[ 3 ];
            out[ 2 ] = a[ 6 ];
            out[ 3 ] = a[ 1 ];
            out[ 4 ] = a[ 4 ];
            out[ 5 ] = a[ 7 ];
            out[ 6 ] = a[ 2 ];
            out[ 7 ] = a[ 5 ];
            out[ 8 ] = a[ 8 ];

        }

        return out;

    }

    function invert3( out, a ) {

        const a00 = a[ 0 ], a01 = a[ 1 ], a02 = a[ 2 ];
        const a10 = a[ 3 ], a11 = a[ 4 ], a12 = a[ 5 ];
        const a20 = a[ 6 ], a21 = a[ 7 ], a22 = a[ 8 ];
        const b01 = a22 * a11 - a12 * a21;
        const b11 = - a22 * a10 + a12 * a20;
        const b21 = a21 * a10 - a11 * a20;
        let det = a00 * b01 + a01 * b11 + a02 * b21;

        if ( !det ) {

            return null;

        }

        det = 1 / det;
        out[ 0 ] = b01 * det;
        out[ 1 ] = ( - a22 * a01 + a02 * a21 ) * det;
        out[ 2 ] = ( a12 * a01 - a02 * a11 ) * det;
        out[ 3 ] = b11 * det;
        out[ 4 ] = ( a22 * a00 - a02 * a20 ) * det;
        out[ 5 ] = ( - a12 * a00 + a02 * a10 ) * det;
        out[ 6 ] = b21 * det;
        out[ 7 ] = ( - a21 * a00 + a01 * a20 ) * det;
        out[ 8 ] = ( a11 * a00 - a01 * a10 ) * det;

        return out;

    }

    function adjoint2( out, a ) {

        const a00 = a[ 0 ], a01 = a[ 1 ], a02 = a[ 2 ];
        const a10 = a[ 3 ], a11 = a[ 4 ], a12 = a[ 5 ];
        const a20 = a[ 6 ], a21 = a[ 7 ], a22 = a[ 8 ];

        out[ 0 ] = a11 * a22 - a12 * a21;
        out[ 1 ] = a02 * a21 - a01 * a22;
        out[ 2 ] = a01 * a12 - a02 * a11;
        out[ 3 ] = a12 * a20 - a10 * a22;
        out[ 4 ] = a00 * a22 - a02 * a20;
        out[ 5 ] = a02 * a10 - a00 * a12;
        out[ 6 ] = a10 * a21 - a11 * a20;
        out[ 7 ] = a01 * a20 - a00 * a21;
        out[ 8 ] = a00 * a11 - a01 * a10;

        return out;

    }

    function determinant3( a ) {

        const a00 = a[ 0 ], a01 = a[ 1 ], a02 = a[ 2 ];
        const a10 = a[ 3 ], a11 = a[ 4 ], a12 = a[ 5 ];
        const a20 = a[ 6 ], a21 = a[ 7 ], a22 = a[ 8 ];

        return a00 * ( a22 * a11 - a12 * a21 ) + a01 * ( - a22 * a10 + a12 * a20 ) + a02 * ( a21 * a10 - a11 * a20 );

    }

    function multiply3( out, a, b ) {

        const a00 = a[ 0 ], a01 = a[ 1 ], a02 = a[ 2 ];
        const a10 = a[ 3 ], a11 = a[ 4 ], a12 = a[ 5 ];
        const a20 = a[ 6 ], a21 = a[ 7 ], a22 = a[ 8 ];
        const b00 = b[ 0 ], b01 = b[ 1 ], b02 = b[ 2 ];
        const b10 = b[ 3 ], b11 = b[ 4 ], b12 = b[ 5 ];
        const b20 = b[ 6 ], b21 = b[ 7 ], b22 = b[ 8 ];

        out[ 0 ] = b00 * a00 + b01 * a10 + b02 * a20;
        out[ 1 ] = b00 * a01 + b01 * a11 + b02 * a21;
        out[ 2 ] = b00 * a02 + b01 * a12 + b02 * a22;
        out[ 3 ] = b10 * a00 + b11 * a10 + b12 * a20;
        out[ 4 ] = b10 * a01 + b11 * a11 + b12 * a21;
        out[ 5 ] = b10 * a02 + b11 * a12 + b12 * a22;
        out[ 6 ] = b20 * a00 + b21 * a10 + b22 * a20;
        out[ 7 ] = b20 * a01 + b21 * a11 + b22 * a21;
        out[ 8 ] = b20 * a02 + b21 * a12 + b22 * a22;

        return out;

    }

    function translate2( out, a, v ) {

        const a00 = a[ 0 ], a01 = a[ 1 ], a02 = a[ 2 ], a10 = a[ 3 ], a11 = a[ 4 ], a12 = a[ 5 ], a20 = a[ 6 ], a21 = a[ 7 ], a22 = a[ 8 ], x = v[ 0 ], y = v[ 1 ];

        out[ 0 ] = a00;
        out[ 1 ] = a01;
        out[ 2 ] = a02;
        out[ 3 ] = a10;
        out[ 4 ] = a11;
        out[ 5 ] = a12;
        out[ 6 ] = x * a00 + y * a10 + a20;
        out[ 7 ] = x * a01 + y * a11 + a21;
        out[ 8 ] = x * a02 + y * a12 + a22;

        return out;

    }

    function rotate3( out, a, rad ) {

        const a00 = a[ 0 ], a01 = a[ 1 ], a02 = a[ 2 ], a10 = a[ 3 ], a11 = a[ 4 ], a12 = a[ 5 ], a20 = a[ 6 ], a21 = a[ 7 ], a22 = a[ 8 ], s = Math.sin( rad ), c = Math.cos( rad );

        out[ 0 ] = c * a00 + s * a10;
        out[ 1 ] = c * a01 + s * a11;
        out[ 2 ] = c * a02 + s * a12;
        out[ 3 ] = c * a10 - s * a00;
        out[ 4 ] = c * a11 - s * a01;
        out[ 5 ] = c * a12 - s * a02;
        out[ 6 ] = a20;
        out[ 7 ] = a21;
        out[ 8 ] = a22;

        return out;

    }

    function scale3( out, a, v ) {

        const x = v[ 0 ], y = v[ 1 ];

        out[ 0 ] = x * a[ 0 ];
        out[ 1 ] = x * a[ 1 ];
        out[ 2 ] = x * a[ 2 ];
        out[ 3 ] = y * a[ 3 ];
        out[ 4 ] = y * a[ 4 ];
        out[ 5 ] = y * a[ 5 ];
        out[ 6 ] = a[ 6 ];
        out[ 7 ] = a[ 7 ];
        out[ 8 ] = a[ 8 ];

        return out;

    }

    function fromTranslation2( out, v ) {

        out[ 0 ] = 1;
        out[ 1 ] = 0;
        out[ 2 ] = 0;
        out[ 3 ] = 0;
        out[ 4 ] = 1;
        out[ 5 ] = 0;
        out[ 6 ] = v[ 0 ];
        out[ 7 ] = v[ 1 ];
        out[ 8 ] = 1;

        return out;

    }

    function fromRotation3( out, rad ) {

        const s = Math.sin( rad ), c = Math.cos( rad );

        out[ 0 ] = c;
        out[ 1 ] = s;
        out[ 2 ] = 0;
        out[ 3 ] = - s;
        out[ 4 ] = c;
        out[ 5 ] = 0;
        out[ 6 ] = 0;
        out[ 7 ] = 0;
        out[ 8 ] = 1;

        return out;

    }

    function fromScaling3( out, v ) {

        out[ 0 ] = v[ 0 ];
        out[ 1 ] = 0;
        out[ 2 ] = 0;
        out[ 3 ] = 0;
        out[ 4 ] = v[ 1 ];
        out[ 5 ] = 0;
        out[ 6 ] = 0;
        out[ 7 ] = 0;
        out[ 8 ] = 1;

        return out;

    }

    function fromMat2d( out, a ) {

        out[ 0 ] = a[ 0 ];
        out[ 1 ] = a[ 1 ];
        out[ 2 ] = 0;
        out[ 3 ] = a[ 2 ];
        out[ 4 ] = a[ 3 ];
        out[ 5 ] = 0;
        out[ 6 ] = a[ 4 ];
        out[ 7 ] = a[ 5 ];
        out[ 8 ] = 1;

        return out;

    }

    function fromQuat( out, q ) {

        const x = q[ 0 ], y = q[ 1 ], z = q[ 2 ], w = q[ 3 ];
        const x2 = x + x;
        const y2 = y + y;
        const z2 = z + z;
        const xx = x * x2;
        const yx = y * x2;
        const yy = y * y2;
        const zx = z * x2;
        const zy = z * y2;
        const zz = z * z2;
        const wx = w * x2;
        const wy = w * y2;
        const wz = w * z2;

        out[ 0 ] = 1 - yy - zz;
        out[ 3 ] = yx - wz;
        out[ 6 ] = zx + wy;
        out[ 1 ] = yx + wz;
        out[ 4 ] = 1 - xx - zz;
        out[ 7 ] = zy - wx;
        out[ 2 ] = zx - wy;
        out[ 5 ] = zy + wx;
        out[ 8 ] = 1 - xx - yy;

        return out;

    }

    function normalFromMat4( out, a ) {

        const a00 = a[ 0 ], a01 = a[ 1 ], a02 = a[ 2 ], a03 = a[ 3 ];
        const a10 = a[ 4 ], a11 = a[ 5 ], a12 = a[ 6 ], a13 = a[ 7 ];
        const a20 = a[ 8 ], a21 = a[ 9 ], a22 = a[ 10 ], a23 = a[ 11 ];
        const a30 = a[ 12 ], a31 = a[ 13 ], a32 = a[ 14 ], a33 = a[ 15 ];
        const b00 = a00 * a11 - a01 * a10;
        const b01 = a00 * a12 - a02 * a10;
        const b02 = a00 * a13 - a03 * a10;
        const b03 = a01 * a12 - a02 * a11;
        const b04 = a01 * a13 - a03 * a11;
        const b05 = a02 * a13 - a03 * a12;
        const b06 = a20 * a31 - a21 * a30;
        const b07 = a20 * a32 - a22 * a30;
        const b08 = a20 * a33 - a23 * a30;
        const b09 = a21 * a32 - a22 * a31;
        const b10 = a21 * a33 - a23 * a31;
        const b11 = a22 * a33 - a23 * a32;
        let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

        if ( !det ) {

            return null;

        }

        det = 1 / det;
        out[ 0 ] = ( a11 * b11 - a12 * b10 + a13 * b09 ) * det;
        out[ 1 ] = ( a12 * b08 - a10 * b11 - a13 * b07 ) * det;
        out[ 2 ] = ( a10 * b10 - a11 * b08 + a13 * b06 ) * det;
        out[ 3 ] = ( a02 * b10 - a01 * b11 - a03 * b09 ) * det;
        out[ 4 ] = ( a00 * b11 - a02 * b08 + a03 * b07 ) * det;
        out[ 5 ] = ( a01 * b08 - a00 * b10 - a03 * b06 ) * det;
        out[ 6 ] = ( a31 * b05 - a32 * b04 + a33 * b03 ) * det;
        out[ 7 ] = ( a32 * b02 - a30 * b05 - a33 * b01 ) * det;
        out[ 8 ] = ( a30 * b04 - a31 * b02 + a33 * b00 ) * det;

        return out;

    }

    function projection( out, width, height ) {

        out[ 0 ] = 2 / width;
        out[ 1 ] = 0;
        out[ 2 ] = 0;
        out[ 3 ] = 0;
        out[ 4 ] = - 2 / height;
        out[ 5 ] = 0;
        out[ 6 ] = - 1;
        out[ 7 ] = 1;
        out[ 8 ] = 1;

        return out;

    }

    function str3( a ) {

        return 'mat3(' + a[ 0 ] + ', ' + a[ 1 ] + ', ' + a[ 2 ] + ', ' + a[ 3 ] + ', ' + a[ 4 ] + ', ' + a[ 5 ] + ', ' + a[ 6 ] + ', ' + a[ 7 ] + ', ' + a[ 8 ] + ')';

    }

    function frob3( a ) {

        return Math.hypot( a[ 0 ], a[ 1 ], a[ 2 ], a[ 3 ], a[ 4 ], a[ 5 ], a[ 6 ], a[ 7 ], a[ 8 ] );

    }

    function add3( out, a, b ) {

        out[ 0 ] = a[ 0 ] + b[ 0 ];
        out[ 1 ] = a[ 1 ] + b[ 1 ];
        out[ 2 ] = a[ 2 ] + b[ 2 ];
        out[ 3 ] = a[ 3 ] + b[ 3 ];
        out[ 4 ] = a[ 4 ] + b[ 4 ];
        out[ 5 ] = a[ 5 ] + b[ 5 ];
        out[ 6 ] = a[ 6 ] + b[ 6 ];
        out[ 7 ] = a[ 7 ] + b[ 7 ];
        out[ 8 ] = a[ 8 ] + b[ 8 ];

        return out;

    }

    function subtract3( out, a, b ) {

        out[ 0 ] = a[ 0 ] - b[ 0 ];
        out[ 1 ] = a[ 1 ] - b[ 1 ];
        out[ 2 ] = a[ 2 ] - b[ 2 ];
        out[ 3 ] = a[ 3 ] - b[ 3 ];
        out[ 4 ] = a[ 4 ] - b[ 4 ];
        out[ 5 ] = a[ 5 ] - b[ 5 ];
        out[ 6 ] = a[ 6 ] - b[ 6 ];
        out[ 7 ] = a[ 7 ] - b[ 7 ];
        out[ 8 ] = a[ 8 ] - b[ 8 ];

        return out;

    }

    function multiplyScalar3( out, a, b ) {

        out[ 0 ] = a[ 0 ] * b;
        out[ 1 ] = a[ 1 ] * b;
        out[ 2 ] = a[ 2 ] * b;
        out[ 3 ] = a[ 3 ] * b;
        out[ 4 ] = a[ 4 ] * b;
        out[ 5 ] = a[ 5 ] * b;
        out[ 6 ] = a[ 6 ] * b;
        out[ 7 ] = a[ 7 ] * b;
        out[ 8 ] = a[ 8 ] * b;

        return out;

    }

    function multiplyScalarAndAdd3( out, a, b, scale10 ) {

        out[ 0 ] = a[ 0 ] + b[ 0 ] * scale10;
        out[ 1 ] = a[ 1 ] + b[ 1 ] * scale10;
        out[ 2 ] = a[ 2 ] + b[ 2 ] * scale10;
        out[ 3 ] = a[ 3 ] + b[ 3 ] * scale10;
        out[ 4 ] = a[ 4 ] + b[ 4 ] * scale10;
        out[ 5 ] = a[ 5 ] + b[ 5 ] * scale10;
        out[ 6 ] = a[ 6 ] + b[ 6 ] * scale10;
        out[ 7 ] = a[ 7 ] + b[ 7 ] * scale10;
        out[ 8 ] = a[ 8 ] + b[ 8 ] * scale10;

        return out;

    }

    function exactEquals3( a, b ) {

        return a[ 0 ] === b[ 0 ] && a[ 1 ] === b[ 1 ] && a[ 2 ] === b[ 2 ] && a[ 3 ] === b[ 3 ] && a[ 4 ] === b[ 4 ] && a[ 5 ] === b[ 5 ] && a[ 6 ] === b[ 6 ] && a[ 7 ] === b[ 7 ] && a[ 8 ] === b[ 8 ];

    }

    function equals4( a, b ) {

        const a0 = a[ 0 ], a1 = a[ 1 ], a2 = a[ 2 ], a3 = a[ 3 ], a4 = a[ 4 ], a5 = a[ 5 ], a6 = a[ 6 ], a7 = a[ 7 ], a8 = a[ 8 ];
        const b0 = b[ 0 ], b1 = b[ 1 ], b2 = b[ 2 ], b3 = b[ 3 ], b4 = b[ 4 ], b5 = b[ 5 ], b6 = b[ 6 ], b7 = b[ 7 ], b8 = b[ 8 ];

        return Math.abs( a0 - b0 ) <= EPSILON * Math.max( 1, Math.abs( a0 ), Math.abs( b0 ) ) && Math.abs( a1 - b1 ) <= EPSILON * Math.max( 1, Math.abs( a1 ), Math.abs( b1 ) ) && Math.abs( a2 - b2 ) <= EPSILON * Math.max( 1, Math.abs( a2 ), Math.abs( b2 ) ) && Math.abs( a3 - b3 ) <= EPSILON * Math.max( 1, Math.abs( a3 ), Math.abs( b3 ) ) && Math.abs( a4 - b4 ) <= EPSILON * Math.max( 1, Math.abs( a4 ), Math.abs( b4 ) ) && Math.abs( a5 - b5 ) <= EPSILON * Math.max( 1, Math.abs( a5 ), Math.abs( b5 ) ) && Math.abs( a6 - b6 ) <= EPSILON * Math.max( 1, Math.abs( a6 ), Math.abs( b6 ) ) && Math.abs( a7 - b7 ) <= EPSILON * Math.max( 1, Math.abs( a7 ), Math.abs( b7 ) ) && Math.abs( a8 - b8 ) <= EPSILON * Math.max( 1, Math.abs( a8 ), Math.abs( b8 ) );

    }

    var mul3 = multiply3;
    var sub3 = subtract3;

    // node_modules/gl-matrix/esm/mat4.js
    var mat4_exports = {};

    __export( mat4_exports, {
        add: () => add4,
        adjoint: () => adjoint3,
        clone: () => clone4,
        copy: () => copy4,
        create: () => create4,
        determinant: () => determinant4,
        equals: () => equals5,
        exactEquals: () => exactEquals4,
        frob: () => frob4,
        fromQuat: () => fromQuat3,
        fromQuat2: () => fromQuat2,
        fromRotation: () => fromRotation4,
        fromRotationTranslation: () => fromRotationTranslation,
        fromRotationTranslationScale: () => fromRotationTranslationScale,
        fromRotationTranslationScaleOrigin: () => fromRotationTranslationScaleOrigin,
        fromScaling: () => fromScaling4,
        fromTranslation: () => fromTranslation3,
        fromValues: () => fromValues4,
        fromXRotation: () => fromXRotation,
        fromYRotation: () => fromYRotation,
        fromZRotation: () => fromZRotation,
        frustum: () => frustum,
        getRotation: () => getRotation,
        getScaling: () => getScaling,
        getTranslation: () => getTranslation,
        identity: () => identity4,
        invert: () => invert4,
        lookAt: () => lookAt,
        mul: () => mul4,
        multiply: () => multiply4,
        multiplyScalar: () => multiplyScalar4,
        multiplyScalarAndAdd: () => multiplyScalarAndAdd4,
        ortho: () => ortho,
        orthoNO: () => orthoNO,
        orthoZO: () => orthoZO,
        perspective: () => perspective,
        perspectiveFromFieldOfView: () => perspectiveFromFieldOfView,
        perspectiveNO: () => perspectiveNO,
        perspectiveZO: () => perspectiveZO,
        rotate: () => rotate4,
        rotateX: () => rotateX,
        rotateY: () => rotateY,
        rotateZ: () => rotateZ,
        scale: () => scale4,
        set: () => set4,
        str: () => str4,
        sub: () => sub4,
        subtract: () => subtract4,
        targetTo: () => targetTo,
        translate: () => translate3,
        transpose: () => transpose3
    } );

    function create4() {

        const out = new ARRAY_TYPE( 16 );

        if ( ARRAY_TYPE != Float32Array ) {

            out[ 1 ] = 0;
            out[ 2 ] = 0;
            out[ 3 ] = 0;
            out[ 4 ] = 0;
            out[ 6 ] = 0;
            out[ 7 ] = 0;
            out[ 8 ] = 0;
            out[ 9 ] = 0;
            out[ 11 ] = 0;
            out[ 12 ] = 0;
            out[ 13 ] = 0;
            out[ 14 ] = 0;

        }

        out[ 0 ] = 1;
        out[ 5 ] = 1;
        out[ 10 ] = 1;
        out[ 15 ] = 1;

        return out;

    }

    function clone4( a ) {

        const out = new ARRAY_TYPE( 16 );

        out[ 0 ] = a[ 0 ];
        out[ 1 ] = a[ 1 ];
        out[ 2 ] = a[ 2 ];
        out[ 3 ] = a[ 3 ];
        out[ 4 ] = a[ 4 ];
        out[ 5 ] = a[ 5 ];
        out[ 6 ] = a[ 6 ];
        out[ 7 ] = a[ 7 ];
        out[ 8 ] = a[ 8 ];
        out[ 9 ] = a[ 9 ];
        out[ 10 ] = a[ 10 ];
        out[ 11 ] = a[ 11 ];
        out[ 12 ] = a[ 12 ];
        out[ 13 ] = a[ 13 ];
        out[ 14 ] = a[ 14 ];
        out[ 15 ] = a[ 15 ];

        return out;

    }

    function copy4( out, a ) {

        out[ 0 ] = a[ 0 ];
        out[ 1 ] = a[ 1 ];
        out[ 2 ] = a[ 2 ];
        out[ 3 ] = a[ 3 ];
        out[ 4 ] = a[ 4 ];
        out[ 5 ] = a[ 5 ];
        out[ 6 ] = a[ 6 ];
        out[ 7 ] = a[ 7 ];
        out[ 8 ] = a[ 8 ];
        out[ 9 ] = a[ 9 ];
        out[ 10 ] = a[ 10 ];
        out[ 11 ] = a[ 11 ];
        out[ 12 ] = a[ 12 ];
        out[ 13 ] = a[ 13 ];
        out[ 14 ] = a[ 14 ];
        out[ 15 ] = a[ 15 ];

        return out;

    }

    function fromValues4( m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33 ) {

        const out = new ARRAY_TYPE( 16 );

        out[ 0 ] = m00;
        out[ 1 ] = m01;
        out[ 2 ] = m02;
        out[ 3 ] = m03;
        out[ 4 ] = m10;
        out[ 5 ] = m11;
        out[ 6 ] = m12;
        out[ 7 ] = m13;
        out[ 8 ] = m20;
        out[ 9 ] = m21;
        out[ 10 ] = m22;
        out[ 11 ] = m23;
        out[ 12 ] = m30;
        out[ 13 ] = m31;
        out[ 14 ] = m32;
        out[ 15 ] = m33;

        return out;

    }

    function set4( out, m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33 ) {

        out[ 0 ] = m00;
        out[ 1 ] = m01;
        out[ 2 ] = m02;
        out[ 3 ] = m03;
        out[ 4 ] = m10;
        out[ 5 ] = m11;
        out[ 6 ] = m12;
        out[ 7 ] = m13;
        out[ 8 ] = m20;
        out[ 9 ] = m21;
        out[ 10 ] = m22;
        out[ 11 ] = m23;
        out[ 12 ] = m30;
        out[ 13 ] = m31;
        out[ 14 ] = m32;
        out[ 15 ] = m33;

        return out;

    }

    function identity4( out ) {

        out[ 0 ] = 1;
        out[ 1 ] = 0;
        out[ 2 ] = 0;
        out[ 3 ] = 0;
        out[ 4 ] = 0;
        out[ 5 ] = 1;
        out[ 6 ] = 0;
        out[ 7 ] = 0;
        out[ 8 ] = 0;
        out[ 9 ] = 0;
        out[ 10 ] = 1;
        out[ 11 ] = 0;
        out[ 12 ] = 0;
        out[ 13 ] = 0;
        out[ 14 ] = 0;
        out[ 15 ] = 1;

        return out;

    }

    function transpose3( out, a ) {

        if ( out === a ) {

            const a01 = a[ 1 ], a02 = a[ 2 ], a03 = a[ 3 ];
            const a12 = a[ 6 ], a13 = a[ 7 ];
            const a23 = a[ 11 ];

            out[ 1 ] = a[ 4 ];
            out[ 2 ] = a[ 8 ];
            out[ 3 ] = a[ 12 ];
            out[ 4 ] = a01;
            out[ 6 ] = a[ 9 ];
            out[ 7 ] = a[ 13 ];
            out[ 8 ] = a02;
            out[ 9 ] = a12;
            out[ 11 ] = a[ 14 ];
            out[ 12 ] = a03;
            out[ 13 ] = a13;
            out[ 14 ] = a23;

        } else {

            out[ 0 ] = a[ 0 ];
            out[ 1 ] = a[ 4 ];
            out[ 2 ] = a[ 8 ];
            out[ 3 ] = a[ 12 ];
            out[ 4 ] = a[ 1 ];
            out[ 5 ] = a[ 5 ];
            out[ 6 ] = a[ 9 ];
            out[ 7 ] = a[ 13 ];
            out[ 8 ] = a[ 2 ];
            out[ 9 ] = a[ 6 ];
            out[ 10 ] = a[ 10 ];
            out[ 11 ] = a[ 14 ];
            out[ 12 ] = a[ 3 ];
            out[ 13 ] = a[ 7 ];
            out[ 14 ] = a[ 11 ];
            out[ 15 ] = a[ 15 ];

        }

        return out;

    }

    function invert4( out, a ) {

        const a00 = a[ 0 ], a01 = a[ 1 ], a02 = a[ 2 ], a03 = a[ 3 ];
        const a10 = a[ 4 ], a11 = a[ 5 ], a12 = a[ 6 ], a13 = a[ 7 ];
        const a20 = a[ 8 ], a21 = a[ 9 ], a22 = a[ 10 ], a23 = a[ 11 ];
        const a30 = a[ 12 ], a31 = a[ 13 ], a32 = a[ 14 ], a33 = a[ 15 ];
        const b00 = a00 * a11 - a01 * a10;
        const b01 = a00 * a12 - a02 * a10;
        const b02 = a00 * a13 - a03 * a10;
        const b03 = a01 * a12 - a02 * a11;
        const b04 = a01 * a13 - a03 * a11;
        const b05 = a02 * a13 - a03 * a12;
        const b06 = a20 * a31 - a21 * a30;
        const b07 = a20 * a32 - a22 * a30;
        const b08 = a20 * a33 - a23 * a30;
        const b09 = a21 * a32 - a22 * a31;
        const b10 = a21 * a33 - a23 * a31;
        const b11 = a22 * a33 - a23 * a32;
        let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

        if ( !det ) {

            return null;

        }

        det = 1 / det;
        out[ 0 ] = ( a11 * b11 - a12 * b10 + a13 * b09 ) * det;
        out[ 1 ] = ( a02 * b10 - a01 * b11 - a03 * b09 ) * det;
        out[ 2 ] = ( a31 * b05 - a32 * b04 + a33 * b03 ) * det;
        out[ 3 ] = ( a22 * b04 - a21 * b05 - a23 * b03 ) * det;
        out[ 4 ] = ( a12 * b08 - a10 * b11 - a13 * b07 ) * det;
        out[ 5 ] = ( a00 * b11 - a02 * b08 + a03 * b07 ) * det;
        out[ 6 ] = ( a32 * b02 - a30 * b05 - a33 * b01 ) * det;
        out[ 7 ] = ( a20 * b05 - a22 * b02 + a23 * b01 ) * det;
        out[ 8 ] = ( a10 * b10 - a11 * b08 + a13 * b06 ) * det;
        out[ 9 ] = ( a01 * b08 - a00 * b10 - a03 * b06 ) * det;
        out[ 10 ] = ( a30 * b04 - a31 * b02 + a33 * b00 ) * det;
        out[ 11 ] = ( a21 * b02 - a20 * b04 - a23 * b00 ) * det;
        out[ 12 ] = ( a11 * b07 - a10 * b09 - a12 * b06 ) * det;
        out[ 13 ] = ( a00 * b09 - a01 * b07 + a02 * b06 ) * det;
        out[ 14 ] = ( a31 * b01 - a30 * b03 - a32 * b00 ) * det;
        out[ 15 ] = ( a20 * b03 - a21 * b01 + a22 * b00 ) * det;

        return out;

    }

    function adjoint3( out, a ) {

        const a00 = a[ 0 ], a01 = a[ 1 ], a02 = a[ 2 ], a03 = a[ 3 ];
        const a10 = a[ 4 ], a11 = a[ 5 ], a12 = a[ 6 ], a13 = a[ 7 ];
        const a20 = a[ 8 ], a21 = a[ 9 ], a22 = a[ 10 ], a23 = a[ 11 ];
        const a30 = a[ 12 ], a31 = a[ 13 ], a32 = a[ 14 ], a33 = a[ 15 ];

        out[ 0 ] = a11 * ( a22 * a33 - a23 * a32 ) - a21 * ( a12 * a33 - a13 * a32 ) + a31 * ( a12 * a23 - a13 * a22 );
        out[ 1 ] = - ( a01 * ( a22 * a33 - a23 * a32 ) - a21 * ( a02 * a33 - a03 * a32 ) + a31 * ( a02 * a23 - a03 * a22 ) );
        out[ 2 ] = a01 * ( a12 * a33 - a13 * a32 ) - a11 * ( a02 * a33 - a03 * a32 ) + a31 * ( a02 * a13 - a03 * a12 );
        out[ 3 ] = - ( a01 * ( a12 * a23 - a13 * a22 ) - a11 * ( a02 * a23 - a03 * a22 ) + a21 * ( a02 * a13 - a03 * a12 ) );
        out[ 4 ] = - ( a10 * ( a22 * a33 - a23 * a32 ) - a20 * ( a12 * a33 - a13 * a32 ) + a30 * ( a12 * a23 - a13 * a22 ) );
        out[ 5 ] = a00 * ( a22 * a33 - a23 * a32 ) - a20 * ( a02 * a33 - a03 * a32 ) + a30 * ( a02 * a23 - a03 * a22 );
        out[ 6 ] = - ( a00 * ( a12 * a33 - a13 * a32 ) - a10 * ( a02 * a33 - a03 * a32 ) + a30 * ( a02 * a13 - a03 * a12 ) );
        out[ 7 ] = a00 * ( a12 * a23 - a13 * a22 ) - a10 * ( a02 * a23 - a03 * a22 ) + a20 * ( a02 * a13 - a03 * a12 );
        out[ 8 ] = a10 * ( a21 * a33 - a23 * a31 ) - a20 * ( a11 * a33 - a13 * a31 ) + a30 * ( a11 * a23 - a13 * a21 );
        out[ 9 ] = - ( a00 * ( a21 * a33 - a23 * a31 ) - a20 * ( a01 * a33 - a03 * a31 ) + a30 * ( a01 * a23 - a03 * a21 ) );
        out[ 10 ] = a00 * ( a11 * a33 - a13 * a31 ) - a10 * ( a01 * a33 - a03 * a31 ) + a30 * ( a01 * a13 - a03 * a11 );
        out[ 11 ] = - ( a00 * ( a11 * a23 - a13 * a21 ) - a10 * ( a01 * a23 - a03 * a21 ) + a20 * ( a01 * a13 - a03 * a11 ) );
        out[ 12 ] = - ( a10 * ( a21 * a32 - a22 * a31 ) - a20 * ( a11 * a32 - a12 * a31 ) + a30 * ( a11 * a22 - a12 * a21 ) );
        out[ 13 ] = a00 * ( a21 * a32 - a22 * a31 ) - a20 * ( a01 * a32 - a02 * a31 ) + a30 * ( a01 * a22 - a02 * a21 );
        out[ 14 ] = - ( a00 * ( a11 * a32 - a12 * a31 ) - a10 * ( a01 * a32 - a02 * a31 ) + a30 * ( a01 * a12 - a02 * a11 ) );
        out[ 15 ] = a00 * ( a11 * a22 - a12 * a21 ) - a10 * ( a01 * a22 - a02 * a21 ) + a20 * ( a01 * a12 - a02 * a11 );

        return out;

    }

    function determinant4( a ) {

        const a00 = a[ 0 ], a01 = a[ 1 ], a02 = a[ 2 ], a03 = a[ 3 ];
        const a10 = a[ 4 ], a11 = a[ 5 ], a12 = a[ 6 ], a13 = a[ 7 ];
        const a20 = a[ 8 ], a21 = a[ 9 ], a22 = a[ 10 ], a23 = a[ 11 ];
        const a30 = a[ 12 ], a31 = a[ 13 ], a32 = a[ 14 ], a33 = a[ 15 ];
        const b00 = a00 * a11 - a01 * a10;
        const b01 = a00 * a12 - a02 * a10;
        const b02 = a00 * a13 - a03 * a10;
        const b03 = a01 * a12 - a02 * a11;
        const b04 = a01 * a13 - a03 * a11;
        const b05 = a02 * a13 - a03 * a12;
        const b06 = a20 * a31 - a21 * a30;
        const b07 = a20 * a32 - a22 * a30;
        const b08 = a20 * a33 - a23 * a30;
        const b09 = a21 * a32 - a22 * a31;
        const b10 = a21 * a33 - a23 * a31;
        const b11 = a22 * a33 - a23 * a32;

        return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    }

    function multiply4( out, a, b ) {

        const a00 = a[ 0 ], a01 = a[ 1 ], a02 = a[ 2 ], a03 = a[ 3 ];
        const a10 = a[ 4 ], a11 = a[ 5 ], a12 = a[ 6 ], a13 = a[ 7 ];
        const a20 = a[ 8 ], a21 = a[ 9 ], a22 = a[ 10 ], a23 = a[ 11 ];
        const a30 = a[ 12 ], a31 = a[ 13 ], a32 = a[ 14 ], a33 = a[ 15 ];
        let b0 = b[ 0 ], b1 = b[ 1 ], b2 = b[ 2 ], b3 = b[ 3 ];

        out[ 0 ] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[ 1 ] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[ 2 ] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[ 3 ] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
        b0 = b[ 4 ];
        b1 = b[ 5 ];
        b2 = b[ 6 ];
        b3 = b[ 7 ];
        out[ 4 ] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[ 5 ] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[ 6 ] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[ 7 ] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
        b0 = b[ 8 ];
        b1 = b[ 9 ];
        b2 = b[ 10 ];
        b3 = b[ 11 ];
        out[ 8 ] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[ 9 ] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[ 10 ] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[ 11 ] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
        b0 = b[ 12 ];
        b1 = b[ 13 ];
        b2 = b[ 14 ];
        b3 = b[ 15 ];
        out[ 12 ] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[ 13 ] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[ 14 ] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[ 15 ] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

        return out;

    }

    function translate3( out, a, v ) {

        const x = v[ 0 ], y = v[ 1 ], z = v[ 2 ];
        let a00, a01, a02, a03;
        let a10, a11, a12, a13;
        let a20, a21, a22, a23;

        if ( a === out ) {

            out[ 12 ] = a[ 0 ] * x + a[ 4 ] * y + a[ 8 ] * z + a[ 12 ];
            out[ 13 ] = a[ 1 ] * x + a[ 5 ] * y + a[ 9 ] * z + a[ 13 ];
            out[ 14 ] = a[ 2 ] * x + a[ 6 ] * y + a[ 10 ] * z + a[ 14 ];
            out[ 15 ] = a[ 3 ] * x + a[ 7 ] * y + a[ 11 ] * z + a[ 15 ];

        } else {

            a00 = a[ 0 ];
            a01 = a[ 1 ];
            a02 = a[ 2 ];
            a03 = a[ 3 ];
            a10 = a[ 4 ];
            a11 = a[ 5 ];
            a12 = a[ 6 ];
            a13 = a[ 7 ];
            a20 = a[ 8 ];
            a21 = a[ 9 ];
            a22 = a[ 10 ];
            a23 = a[ 11 ];
            out[ 0 ] = a00;
            out[ 1 ] = a01;
            out[ 2 ] = a02;
            out[ 3 ] = a03;
            out[ 4 ] = a10;
            out[ 5 ] = a11;
            out[ 6 ] = a12;
            out[ 7 ] = a13;
            out[ 8 ] = a20;
            out[ 9 ] = a21;
            out[ 10 ] = a22;
            out[ 11 ] = a23;
            out[ 12 ] = a00 * x + a10 * y + a20 * z + a[ 12 ];
            out[ 13 ] = a01 * x + a11 * y + a21 * z + a[ 13 ];
            out[ 14 ] = a02 * x + a12 * y + a22 * z + a[ 14 ];
            out[ 15 ] = a03 * x + a13 * y + a23 * z + a[ 15 ];

        }

        return out;

    }

    function scale4( out, a, v ) {

        const x = v[ 0 ], y = v[ 1 ], z = v[ 2 ];

        out[ 0 ] = a[ 0 ] * x;
        out[ 1 ] = a[ 1 ] * x;
        out[ 2 ] = a[ 2 ] * x;
        out[ 3 ] = a[ 3 ] * x;
        out[ 4 ] = a[ 4 ] * y;
        out[ 5 ] = a[ 5 ] * y;
        out[ 6 ] = a[ 6 ] * y;
        out[ 7 ] = a[ 7 ] * y;
        out[ 8 ] = a[ 8 ] * z;
        out[ 9 ] = a[ 9 ] * z;
        out[ 10 ] = a[ 10 ] * z;
        out[ 11 ] = a[ 11 ] * z;
        out[ 12 ] = a[ 12 ];
        out[ 13 ] = a[ 13 ];
        out[ 14 ] = a[ 14 ];
        out[ 15 ] = a[ 15 ];

        return out;

    }

    function rotate4( out, a, rad, axis ) {

        let x = axis[ 0 ], y = axis[ 1 ], z = axis[ 2 ];
        let len6 = Math.hypot( x, y, z );
        let s, c, t;
        let a00, a01, a02, a03;
        let a10, a11, a12, a13;
        let a20, a21, a22, a23;
        let b00, b01, b02;
        let b10, b11, b12;
        let b20, b21, b22;

        if ( len6 < EPSILON ) {

            return null;

        }

        len6 = 1 / len6;
        x *= len6;
        y *= len6;
        z *= len6;
        s = Math.sin( rad );
        c = Math.cos( rad );
        t = 1 - c;
        a00 = a[ 0 ];
        a01 = a[ 1 ];
        a02 = a[ 2 ];
        a03 = a[ 3 ];
        a10 = a[ 4 ];
        a11 = a[ 5 ];
        a12 = a[ 6 ];
        a13 = a[ 7 ];
        a20 = a[ 8 ];
        a21 = a[ 9 ];
        a22 = a[ 10 ];
        a23 = a[ 11 ];
        b00 = x * x * t + c;
        b01 = y * x * t + z * s;
        b02 = z * x * t - y * s;
        b10 = x * y * t - z * s;
        b11 = y * y * t + c;
        b12 = z * y * t + x * s;
        b20 = x * z * t + y * s;
        b21 = y * z * t - x * s;
        b22 = z * z * t + c;
        out[ 0 ] = a00 * b00 + a10 * b01 + a20 * b02;
        out[ 1 ] = a01 * b00 + a11 * b01 + a21 * b02;
        out[ 2 ] = a02 * b00 + a12 * b01 + a22 * b02;
        out[ 3 ] = a03 * b00 + a13 * b01 + a23 * b02;
        out[ 4 ] = a00 * b10 + a10 * b11 + a20 * b12;
        out[ 5 ] = a01 * b10 + a11 * b11 + a21 * b12;
        out[ 6 ] = a02 * b10 + a12 * b11 + a22 * b12;
        out[ 7 ] = a03 * b10 + a13 * b11 + a23 * b12;
        out[ 8 ] = a00 * b20 + a10 * b21 + a20 * b22;
        out[ 9 ] = a01 * b20 + a11 * b21 + a21 * b22;
        out[ 10 ] = a02 * b20 + a12 * b21 + a22 * b22;
        out[ 11 ] = a03 * b20 + a13 * b21 + a23 * b22;

        if ( a !== out ) {

            out[ 12 ] = a[ 12 ];
            out[ 13 ] = a[ 13 ];
            out[ 14 ] = a[ 14 ];
            out[ 15 ] = a[ 15 ];

        }

        return out;

    }

    function rotateX( out, a, rad ) {

        const s = Math.sin( rad );
        const c = Math.cos( rad );
        const a10 = a[ 4 ];
        const a11 = a[ 5 ];
        const a12 = a[ 6 ];
        const a13 = a[ 7 ];
        const a20 = a[ 8 ];
        const a21 = a[ 9 ];
        const a22 = a[ 10 ];
        const a23 = a[ 11 ];

        if ( a !== out ) {

            out[ 0 ] = a[ 0 ];
            out[ 1 ] = a[ 1 ];
            out[ 2 ] = a[ 2 ];
            out[ 3 ] = a[ 3 ];
            out[ 12 ] = a[ 12 ];
            out[ 13 ] = a[ 13 ];
            out[ 14 ] = a[ 14 ];
            out[ 15 ] = a[ 15 ];

        }

        out[ 4 ] = a10 * c + a20 * s;
        out[ 5 ] = a11 * c + a21 * s;
        out[ 6 ] = a12 * c + a22 * s;
        out[ 7 ] = a13 * c + a23 * s;
        out[ 8 ] = a20 * c - a10 * s;
        out[ 9 ] = a21 * c - a11 * s;
        out[ 10 ] = a22 * c - a12 * s;
        out[ 11 ] = a23 * c - a13 * s;

        return out;

    }

    function rotateY( out, a, rad ) {

        const s = Math.sin( rad );
        const c = Math.cos( rad );
        const a00 = a[ 0 ];
        const a01 = a[ 1 ];
        const a02 = a[ 2 ];
        const a03 = a[ 3 ];
        const a20 = a[ 8 ];
        const a21 = a[ 9 ];
        const a22 = a[ 10 ];
        const a23 = a[ 11 ];

        if ( a !== out ) {

            out[ 4 ] = a[ 4 ];
            out[ 5 ] = a[ 5 ];
            out[ 6 ] = a[ 6 ];
            out[ 7 ] = a[ 7 ];
            out[ 12 ] = a[ 12 ];
            out[ 13 ] = a[ 13 ];
            out[ 14 ] = a[ 14 ];
            out[ 15 ] = a[ 15 ];

        }

        out[ 0 ] = a00 * c - a20 * s;
        out[ 1 ] = a01 * c - a21 * s;
        out[ 2 ] = a02 * c - a22 * s;
        out[ 3 ] = a03 * c - a23 * s;
        out[ 8 ] = a00 * s + a20 * c;
        out[ 9 ] = a01 * s + a21 * c;
        out[ 10 ] = a02 * s + a22 * c;
        out[ 11 ] = a03 * s + a23 * c;

        return out;

    }

    function rotateZ( out, a, rad ) {

        const s = Math.sin( rad );
        const c = Math.cos( rad );
        const a00 = a[ 0 ];
        const a01 = a[ 1 ];
        const a02 = a[ 2 ];
        const a03 = a[ 3 ];
        const a10 = a[ 4 ];
        const a11 = a[ 5 ];
        const a12 = a[ 6 ];
        const a13 = a[ 7 ];

        if ( a !== out ) {

            out[ 8 ] = a[ 8 ];
            out[ 9 ] = a[ 9 ];
            out[ 10 ] = a[ 10 ];
            out[ 11 ] = a[ 11 ];
            out[ 12 ] = a[ 12 ];
            out[ 13 ] = a[ 13 ];
            out[ 14 ] = a[ 14 ];
            out[ 15 ] = a[ 15 ];

        }

        out[ 0 ] = a00 * c + a10 * s;
        out[ 1 ] = a01 * c + a11 * s;
        out[ 2 ] = a02 * c + a12 * s;
        out[ 3 ] = a03 * c + a13 * s;
        out[ 4 ] = a10 * c - a00 * s;
        out[ 5 ] = a11 * c - a01 * s;
        out[ 6 ] = a12 * c - a02 * s;
        out[ 7 ] = a13 * c - a03 * s;

        return out;

    }

    function fromTranslation3( out, v ) {

        out[ 0 ] = 1;
        out[ 1 ] = 0;
        out[ 2 ] = 0;
        out[ 3 ] = 0;
        out[ 4 ] = 0;
        out[ 5 ] = 1;
        out[ 6 ] = 0;
        out[ 7 ] = 0;
        out[ 8 ] = 0;
        out[ 9 ] = 0;
        out[ 10 ] = 1;
        out[ 11 ] = 0;
        out[ 12 ] = v[ 0 ];
        out[ 13 ] = v[ 1 ];
        out[ 14 ] = v[ 2 ];
        out[ 15 ] = 1;

        return out;

    }

    function fromScaling4( out, v ) {

        out[ 0 ] = v[ 0 ];
        out[ 1 ] = 0;
        out[ 2 ] = 0;
        out[ 3 ] = 0;
        out[ 4 ] = 0;
        out[ 5 ] = v[ 1 ];
        out[ 6 ] = 0;
        out[ 7 ] = 0;
        out[ 8 ] = 0;
        out[ 9 ] = 0;
        out[ 10 ] = v[ 2 ];
        out[ 11 ] = 0;
        out[ 12 ] = 0;
        out[ 13 ] = 0;
        out[ 14 ] = 0;
        out[ 15 ] = 1;

        return out;

    }

    function fromRotation4( out, rad, axis ) {

        let x = axis[ 0 ], y = axis[ 1 ], z = axis[ 2 ];
        let len6 = Math.hypot( x, y, z );
        let s, c, t;

        if ( len6 < EPSILON ) {

            return null;

        }

        len6 = 1 / len6;
        x *= len6;
        y *= len6;
        z *= len6;
        s = Math.sin( rad );
        c = Math.cos( rad );
        t = 1 - c;
        out[ 0 ] = x * x * t + c;
        out[ 1 ] = y * x * t + z * s;
        out[ 2 ] = z * x * t - y * s;
        out[ 3 ] = 0;
        out[ 4 ] = x * y * t - z * s;
        out[ 5 ] = y * y * t + c;
        out[ 6 ] = z * y * t + x * s;
        out[ 7 ] = 0;
        out[ 8 ] = x * z * t + y * s;
        out[ 9 ] = y * z * t - x * s;
        out[ 10 ] = z * z * t + c;
        out[ 11 ] = 0;
        out[ 12 ] = 0;
        out[ 13 ] = 0;
        out[ 14 ] = 0;
        out[ 15 ] = 1;

        return out;

    }

    function fromXRotation( out, rad ) {

        const s = Math.sin( rad );
        const c = Math.cos( rad );

        out[ 0 ] = 1;
        out[ 1 ] = 0;
        out[ 2 ] = 0;
        out[ 3 ] = 0;
        out[ 4 ] = 0;
        out[ 5 ] = c;
        out[ 6 ] = s;
        out[ 7 ] = 0;
        out[ 8 ] = 0;
        out[ 9 ] = - s;
        out[ 10 ] = c;
        out[ 11 ] = 0;
        out[ 12 ] = 0;
        out[ 13 ] = 0;
        out[ 14 ] = 0;
        out[ 15 ] = 1;

        return out;

    }

    function fromYRotation( out, rad ) {

        const s = Math.sin( rad );
        const c = Math.cos( rad );

        out[ 0 ] = c;
        out[ 1 ] = 0;
        out[ 2 ] = - s;
        out[ 3 ] = 0;
        out[ 4 ] = 0;
        out[ 5 ] = 1;
        out[ 6 ] = 0;
        out[ 7 ] = 0;
        out[ 8 ] = s;
        out[ 9 ] = 0;
        out[ 10 ] = c;
        out[ 11 ] = 0;
        out[ 12 ] = 0;
        out[ 13 ] = 0;
        out[ 14 ] = 0;
        out[ 15 ] = 1;

        return out;

    }

    function fromZRotation( out, rad ) {

        const s = Math.sin( rad );
        const c = Math.cos( rad );

        out[ 0 ] = c;
        out[ 1 ] = s;
        out[ 2 ] = 0;
        out[ 3 ] = 0;
        out[ 4 ] = - s;
        out[ 5 ] = c;
        out[ 6 ] = 0;
        out[ 7 ] = 0;
        out[ 8 ] = 0;
        out[ 9 ] = 0;
        out[ 10 ] = 1;
        out[ 11 ] = 0;
        out[ 12 ] = 0;
        out[ 13 ] = 0;
        out[ 14 ] = 0;
        out[ 15 ] = 1;

        return out;

    }

    function fromRotationTranslation( out, q, v ) {

        const x = q[ 0 ], y = q[ 1 ], z = q[ 2 ], w = q[ 3 ];
        const x2 = x + x;
        const y2 = y + y;
        const z2 = z + z;
        const xx = x * x2;
        const xy = x * y2;
        const xz = x * z2;
        const yy = y * y2;
        const yz = y * z2;
        const zz = z * z2;
        const wx = w * x2;
        const wy = w * y2;
        const wz = w * z2;

        out[ 0 ] = 1 - ( yy + zz );
        out[ 1 ] = xy + wz;
        out[ 2 ] = xz - wy;
        out[ 3 ] = 0;
        out[ 4 ] = xy - wz;
        out[ 5 ] = 1 - ( xx + zz );
        out[ 6 ] = yz + wx;
        out[ 7 ] = 0;
        out[ 8 ] = xz + wy;
        out[ 9 ] = yz - wx;
        out[ 10 ] = 1 - ( xx + yy );
        out[ 11 ] = 0;
        out[ 12 ] = v[ 0 ];
        out[ 13 ] = v[ 1 ];
        out[ 14 ] = v[ 2 ];
        out[ 15 ] = 1;

        return out;

    }

    function fromQuat2( out, a ) {

        const translation = new ARRAY_TYPE( 3 );
        const bx = - a[ 0 ], by = - a[ 1 ], bz = - a[ 2 ], bw = a[ 3 ], ax = a[ 4 ], ay = a[ 5 ], az = a[ 6 ], aw = a[ 7 ];
        const magnitude = bx * bx + by * by + bz * bz + bw * bw;

        if ( magnitude > 0 ) {

            translation[ 0 ] = ( ax * bw + aw * bx + ay * bz - az * by ) * 2 / magnitude;
            translation[ 1 ] = ( ay * bw + aw * by + az * bx - ax * bz ) * 2 / magnitude;
            translation[ 2 ] = ( az * bw + aw * bz + ax * by - ay * bx ) * 2 / magnitude;

        } else {

            translation[ 0 ] = ( ax * bw + aw * bx + ay * bz - az * by ) * 2;
            translation[ 1 ] = ( ay * bw + aw * by + az * bx - ax * bz ) * 2;
            translation[ 2 ] = ( az * bw + aw * bz + ax * by - ay * bx ) * 2;

        }

        fromRotationTranslation( out, a, translation );

        return out;

    }

    function getTranslation( out, mat ) {

        out[ 0 ] = mat[ 12 ];
        out[ 1 ] = mat[ 13 ];
        out[ 2 ] = mat[ 14 ];

        return out;

    }

    function getScaling( out, mat ) {

        const m11 = mat[ 0 ];
        const m12 = mat[ 1 ];
        const m13 = mat[ 2 ];
        const m21 = mat[ 4 ];
        const m22 = mat[ 5 ];
        const m23 = mat[ 6 ];
        const m31 = mat[ 8 ];
        const m32 = mat[ 9 ];
        const m33 = mat[ 10 ];

        out[ 0 ] = Math.hypot( m11, m12, m13 );
        out[ 1 ] = Math.hypot( m21, m22, m23 );
        out[ 2 ] = Math.hypot( m31, m32, m33 );

        return out;

    }

    function getRotation( out, mat ) {

        const scaling = new ARRAY_TYPE( 3 );

        getScaling( scaling, mat );
        const is1 = 1 / scaling[ 0 ];
        const is2 = 1 / scaling[ 1 ];
        const is3 = 1 / scaling[ 2 ];
        const sm11 = mat[ 0 ] * is1;
        const sm12 = mat[ 1 ] * is2;
        const sm13 = mat[ 2 ] * is3;
        const sm21 = mat[ 4 ] * is1;
        const sm22 = mat[ 5 ] * is2;
        const sm23 = mat[ 6 ] * is3;
        const sm31 = mat[ 8 ] * is1;
        const sm32 = mat[ 9 ] * is2;
        const sm33 = mat[ 10 ] * is3;
        const trace = sm11 + sm22 + sm33;
        let S = 0;

        if ( trace > 0 ) {

            S = Math.sqrt( trace + 1 ) * 2;
            out[ 3 ] = 0.25 * S;
            out[ 0 ] = ( sm23 - sm32 ) / S;
            out[ 1 ] = ( sm31 - sm13 ) / S;
            out[ 2 ] = ( sm12 - sm21 ) / S;

        } else if ( sm11 > sm22 && sm11 > sm33 ) {

            S = Math.sqrt( 1 + sm11 - sm22 - sm33 ) * 2;
            out[ 3 ] = ( sm23 - sm32 ) / S;
            out[ 0 ] = 0.25 * S;
            out[ 1 ] = ( sm12 + sm21 ) / S;
            out[ 2 ] = ( sm31 + sm13 ) / S;

        } else if ( sm22 > sm33 ) {

            S = Math.sqrt( 1 + sm22 - sm11 - sm33 ) * 2;
            out[ 3 ] = ( sm31 - sm13 ) / S;
            out[ 0 ] = ( sm12 + sm21 ) / S;
            out[ 1 ] = 0.25 * S;
            out[ 2 ] = ( sm23 + sm32 ) / S;

        } else {

            S = Math.sqrt( 1 + sm33 - sm11 - sm22 ) * 2;
            out[ 3 ] = ( sm12 - sm21 ) / S;
            out[ 0 ] = ( sm31 + sm13 ) / S;
            out[ 1 ] = ( sm23 + sm32 ) / S;
            out[ 2 ] = 0.25 * S;

        }

        return out;

    }

    function fromRotationTranslationScale( out, q, v, s ) {

        const x = q[ 0 ], y = q[ 1 ], z = q[ 2 ], w = q[ 3 ];
        const x2 = x + x;
        const y2 = y + y;
        const z2 = z + z;
        const xx = x * x2;
        const xy = x * y2;
        const xz = x * z2;
        const yy = y * y2;
        const yz = y * z2;
        const zz = z * z2;
        const wx = w * x2;
        const wy = w * y2;
        const wz = w * z2;
        const sx = s[ 0 ];
        const sy = s[ 1 ];
        const sz = s[ 2 ];

        out[ 0 ] = ( 1 - ( yy + zz ) ) * sx;
        out[ 1 ] = ( xy + wz ) * sx;
        out[ 2 ] = ( xz - wy ) * sx;
        out[ 3 ] = 0;
        out[ 4 ] = ( xy - wz ) * sy;
        out[ 5 ] = ( 1 - ( xx + zz ) ) * sy;
        out[ 6 ] = ( yz + wx ) * sy;
        out[ 7 ] = 0;
        out[ 8 ] = ( xz + wy ) * sz;
        out[ 9 ] = ( yz - wx ) * sz;
        out[ 10 ] = ( 1 - ( xx + yy ) ) * sz;
        out[ 11 ] = 0;
        out[ 12 ] = v[ 0 ];
        out[ 13 ] = v[ 1 ];
        out[ 14 ] = v[ 2 ];
        out[ 15 ] = 1;

        return out;

    }

    function fromRotationTranslationScaleOrigin( out, q, v, s, o ) {

        const x = q[ 0 ], y = q[ 1 ], z = q[ 2 ], w = q[ 3 ];
        const x2 = x + x;
        const y2 = y + y;
        const z2 = z + z;
        const xx = x * x2;
        const xy = x * y2;
        const xz = x * z2;
        const yy = y * y2;
        const yz = y * z2;
        const zz = z * z2;
        const wx = w * x2;
        const wy = w * y2;
        const wz = w * z2;
        const sx = s[ 0 ];
        const sy = s[ 1 ];
        const sz = s[ 2 ];
        const ox = o[ 0 ];
        const oy = o[ 1 ];
        const oz = o[ 2 ];
        const out0 = ( 1 - ( yy + zz ) ) * sx;
        const out1 = ( xy + wz ) * sx;
        const out2 = ( xz - wy ) * sx;
        const out4 = ( xy - wz ) * sy;
        const out5 = ( 1 - ( xx + zz ) ) * sy;
        const out6 = ( yz + wx ) * sy;
        const out8 = ( xz + wy ) * sz;
        const out9 = ( yz - wx ) * sz;
        const out10 = ( 1 - ( xx + yy ) ) * sz;

        out[ 0 ] = out0;
        out[ 1 ] = out1;
        out[ 2 ] = out2;
        out[ 3 ] = 0;
        out[ 4 ] = out4;
        out[ 5 ] = out5;
        out[ 6 ] = out6;
        out[ 7 ] = 0;
        out[ 8 ] = out8;
        out[ 9 ] = out9;
        out[ 10 ] = out10;
        out[ 11 ] = 0;
        out[ 12 ] = v[ 0 ] + ox - ( out0 * ox + out4 * oy + out8 * oz );
        out[ 13 ] = v[ 1 ] + oy - ( out1 * ox + out5 * oy + out9 * oz );
        out[ 14 ] = v[ 2 ] + oz - ( out2 * ox + out6 * oy + out10 * oz );
        out[ 15 ] = 1;

        return out;

    }

    function fromQuat3( out, q ) {

        const x = q[ 0 ], y = q[ 1 ], z = q[ 2 ], w = q[ 3 ];
        const x2 = x + x;
        const y2 = y + y;
        const z2 = z + z;
        const xx = x * x2;
        const yx = y * x2;
        const yy = y * y2;
        const zx = z * x2;
        const zy = z * y2;
        const zz = z * z2;
        const wx = w * x2;
        const wy = w * y2;
        const wz = w * z2;

        out[ 0 ] = 1 - yy - zz;
        out[ 1 ] = yx + wz;
        out[ 2 ] = zx - wy;
        out[ 3 ] = 0;
        out[ 4 ] = yx - wz;
        out[ 5 ] = 1 - xx - zz;
        out[ 6 ] = zy + wx;
        out[ 7 ] = 0;
        out[ 8 ] = zx + wy;
        out[ 9 ] = zy - wx;
        out[ 10 ] = 1 - xx - yy;
        out[ 11 ] = 0;
        out[ 12 ] = 0;
        out[ 13 ] = 0;
        out[ 14 ] = 0;
        out[ 15 ] = 1;

        return out;

    }

    function frustum( out, left, right, bottom, top, near, far ) {

        const rl = 1 / ( right - left );
        const tb = 1 / ( top - bottom );
        const nf = 1 / ( near - far );

        out[ 0 ] = near * 2 * rl;
        out[ 1 ] = 0;
        out[ 2 ] = 0;
        out[ 3 ] = 0;
        out[ 4 ] = 0;
        out[ 5 ] = near * 2 * tb;
        out[ 6 ] = 0;
        out[ 7 ] = 0;
        out[ 8 ] = ( right + left ) * rl;
        out[ 9 ] = ( top + bottom ) * tb;
        out[ 10 ] = ( far + near ) * nf;
        out[ 11 ] = - 1;
        out[ 12 ] = 0;
        out[ 13 ] = 0;
        out[ 14 ] = far * near * 2 * nf;
        out[ 15 ] = 0;

        return out;

    }

    function perspectiveNO( out, fovy, aspect, near, far ) {

        let f = 1 / Math.tan( fovy / 2 ), nf;

        out[ 0 ] = f / aspect;
        out[ 1 ] = 0;
        out[ 2 ] = 0;
        out[ 3 ] = 0;
        out[ 4 ] = 0;
        out[ 5 ] = f;
        out[ 6 ] = 0;
        out[ 7 ] = 0;
        out[ 8 ] = 0;
        out[ 9 ] = 0;
        out[ 11 ] = - 1;
        out[ 12 ] = 0;
        out[ 13 ] = 0;
        out[ 15 ] = 0;

        if ( far != null && far !== Infinity ) {

            nf = 1 / ( near - far );
            out[ 10 ] = ( far + near ) * nf;
            out[ 14 ] = 2 * far * near * nf;

        } else {

            out[ 10 ] = - 1;
            out[ 14 ] = - 2 * near;

        }

        return out;

    }

    var perspective = perspectiveNO;

    function perspectiveZO( out, fovy, aspect, near, far ) {

        let f = 1 / Math.tan( fovy / 2 ), nf;

        out[ 0 ] = f / aspect;
        out[ 1 ] = 0;
        out[ 2 ] = 0;
        out[ 3 ] = 0;
        out[ 4 ] = 0;
        out[ 5 ] = f;
        out[ 6 ] = 0;
        out[ 7 ] = 0;
        out[ 8 ] = 0;
        out[ 9 ] = 0;
        out[ 11 ] = - 1;
        out[ 12 ] = 0;
        out[ 13 ] = 0;
        out[ 15 ] = 0;

        if ( far != null && far !== Infinity ) {

            nf = 1 / ( near - far );
            out[ 10 ] = far * nf;
            out[ 14 ] = far * near * nf;

        } else {

            out[ 10 ] = - 1;
            out[ 14 ] = - near;

        }

        return out;

    }

    function perspectiveFromFieldOfView( out, fov, near, far ) {

        const upTan = Math.tan( fov.upDegrees * Math.PI / 180 );
        const downTan = Math.tan( fov.downDegrees * Math.PI / 180 );
        const leftTan = Math.tan( fov.leftDegrees * Math.PI / 180 );
        const rightTan = Math.tan( fov.rightDegrees * Math.PI / 180 );
        const xScale = 2 / ( leftTan + rightTan );
        const yScale = 2 / ( upTan + downTan );

        out[ 0 ] = xScale;
        out[ 1 ] = 0;
        out[ 2 ] = 0;
        out[ 3 ] = 0;
        out[ 4 ] = 0;
        out[ 5 ] = yScale;
        out[ 6 ] = 0;
        out[ 7 ] = 0;
        out[ 8 ] = - ( ( leftTan - rightTan ) * xScale * 0.5 );
        out[ 9 ] = ( upTan - downTan ) * yScale * 0.5;
        out[ 10 ] = far / ( near - far );
        out[ 11 ] = - 1;
        out[ 12 ] = 0;
        out[ 13 ] = 0;
        out[ 14 ] = far * near / ( near - far );
        out[ 15 ] = 0;

        return out;

    }

    function orthoNO( out, left, right, bottom, top, near, far ) {

        const lr = 1 / ( left - right );
        const bt = 1 / ( bottom - top );
        const nf = 1 / ( near - far );

        out[ 0 ] = - 2 * lr;
        out[ 1 ] = 0;
        out[ 2 ] = 0;
        out[ 3 ] = 0;
        out[ 4 ] = 0;
        out[ 5 ] = - 2 * bt;
        out[ 6 ] = 0;
        out[ 7 ] = 0;
        out[ 8 ] = 0;
        out[ 9 ] = 0;
        out[ 10 ] = 2 * nf;
        out[ 11 ] = 0;
        out[ 12 ] = ( left + right ) * lr;
        out[ 13 ] = ( top + bottom ) * bt;
        out[ 14 ] = ( far + near ) * nf;
        out[ 15 ] = 1;

        return out;

    }

    var ortho = orthoNO;

    function orthoZO( out, left, right, bottom, top, near, far ) {

        const lr = 1 / ( left - right );
        const bt = 1 / ( bottom - top );
        const nf = 1 / ( near - far );

        out[ 0 ] = - 2 * lr;
        out[ 1 ] = 0;
        out[ 2 ] = 0;
        out[ 3 ] = 0;
        out[ 4 ] = 0;
        out[ 5 ] = - 2 * bt;
        out[ 6 ] = 0;
        out[ 7 ] = 0;
        out[ 8 ] = 0;
        out[ 9 ] = 0;
        out[ 10 ] = nf;
        out[ 11 ] = 0;
        out[ 12 ] = ( left + right ) * lr;
        out[ 13 ] = ( top + bottom ) * bt;
        out[ 14 ] = near * nf;
        out[ 15 ] = 1;

        return out;

    }

    function lookAt( out, eye, center, up ) {

        let x0, x1, x2, y0, y1, y2, z0, z1, z2, len6;
        const eyex = eye[ 0 ];
        const eyey = eye[ 1 ];
        const eyez = eye[ 2 ];
        const upx = up[ 0 ];
        const upy = up[ 1 ];
        const upz = up[ 2 ];
        const centerx = center[ 0 ];
        const centery = center[ 1 ];
        const centerz = center[ 2 ];

        if ( Math.abs( eyex - centerx ) < EPSILON && Math.abs( eyey - centery ) < EPSILON && Math.abs( eyez - centerz ) < EPSILON ) {

            return identity4( out );

        }

        z0 = eyex - centerx;
        z1 = eyey - centery;
        z2 = eyez - centerz;
        len6 = 1 / Math.hypot( z0, z1, z2 );
        z0 *= len6;
        z1 *= len6;
        z2 *= len6;
        x0 = upy * z2 - upz * z1;
        x1 = upz * z0 - upx * z2;
        x2 = upx * z1 - upy * z0;
        len6 = Math.hypot( x0, x1, x2 );

        if ( !len6 ) {

            x0 = 0;
            x1 = 0;
            x2 = 0;

        } else {

            len6 = 1 / len6;
            x0 *= len6;
            x1 *= len6;
            x2 *= len6;

        }

        y0 = z1 * x2 - z2 * x1;
        y1 = z2 * x0 - z0 * x2;
        y2 = z0 * x1 - z1 * x0;
        len6 = Math.hypot( y0, y1, y2 );

        if ( !len6 ) {

            y0 = 0;
            y1 = 0;
            y2 = 0;

        } else {

            len6 = 1 / len6;
            y0 *= len6;
            y1 *= len6;
            y2 *= len6;

        }

        out[ 0 ] = x0;
        out[ 1 ] = y0;
        out[ 2 ] = z0;
        out[ 3 ] = 0;
        out[ 4 ] = x1;
        out[ 5 ] = y1;
        out[ 6 ] = z1;
        out[ 7 ] = 0;
        out[ 8 ] = x2;
        out[ 9 ] = y2;
        out[ 10 ] = z2;
        out[ 11 ] = 0;
        out[ 12 ] = - ( x0 * eyex + x1 * eyey + x2 * eyez );
        out[ 13 ] = - ( y0 * eyex + y1 * eyey + y2 * eyez );
        out[ 14 ] = - ( z0 * eyex + z1 * eyey + z2 * eyez );
        out[ 15 ] = 1;

        return out;

    }

    function targetTo( out, eye, target, up ) {

        const eyex = eye[ 0 ], eyey = eye[ 1 ], eyez = eye[ 2 ], upx = up[ 0 ], upy = up[ 1 ], upz = up[ 2 ];
        let z0 = eyex - target[ 0 ], z1 = eyey - target[ 1 ], z2 = eyez - target[ 2 ];
        let len6 = z0 * z0 + z1 * z1 + z2 * z2;

        if ( len6 > 0 ) {

            len6 = 1 / Math.sqrt( len6 );
            z0 *= len6;
            z1 *= len6;
            z2 *= len6;

        }

        let x0 = upy * z2 - upz * z1, x1 = upz * z0 - upx * z2, x2 = upx * z1 - upy * z0;

        len6 = x0 * x0 + x1 * x1 + x2 * x2;

        if ( len6 > 0 ) {

            len6 = 1 / Math.sqrt( len6 );
            x0 *= len6;
            x1 *= len6;
            x2 *= len6;

        }

        out[ 0 ] = x0;
        out[ 1 ] = x1;
        out[ 2 ] = x2;
        out[ 3 ] = 0;
        out[ 4 ] = z1 * x2 - z2 * x1;
        out[ 5 ] = z2 * x0 - z0 * x2;
        out[ 6 ] = z0 * x1 - z1 * x0;
        out[ 7 ] = 0;
        out[ 8 ] = z0;
        out[ 9 ] = z1;
        out[ 10 ] = z2;
        out[ 11 ] = 0;
        out[ 12 ] = eyex;
        out[ 13 ] = eyey;
        out[ 14 ] = eyez;
        out[ 15 ] = 1;

        return out;

    }

    function str4( a ) {

        return 'mat4(' + a[ 0 ] + ', ' + a[ 1 ] + ', ' + a[ 2 ] + ', ' + a[ 3 ] + ', ' + a[ 4 ] + ', ' + a[ 5 ] + ', ' + a[ 6 ] + ', ' + a[ 7 ] + ', ' + a[ 8 ] + ', ' + a[ 9 ] + ', ' + a[ 10 ] + ', ' + a[ 11 ] + ', ' + a[ 12 ] + ', ' + a[ 13 ] + ', ' + a[ 14 ] + ', ' + a[ 15 ] + ')';

    }

    function frob4( a ) {

        return Math.hypot( a[ 0 ], a[ 1 ], a[ 2 ], a[ 3 ], a[ 4 ], a[ 5 ], a[ 6 ], a[ 7 ], a[ 8 ], a[ 9 ], a[ 10 ], a[ 11 ], a[ 12 ], a[ 13 ], a[ 14 ], a[ 15 ] );

    }

    function add4( out, a, b ) {

        out[ 0 ] = a[ 0 ] + b[ 0 ];
        out[ 1 ] = a[ 1 ] + b[ 1 ];
        out[ 2 ] = a[ 2 ] + b[ 2 ];
        out[ 3 ] = a[ 3 ] + b[ 3 ];
        out[ 4 ] = a[ 4 ] + b[ 4 ];
        out[ 5 ] = a[ 5 ] + b[ 5 ];
        out[ 6 ] = a[ 6 ] + b[ 6 ];
        out[ 7 ] = a[ 7 ] + b[ 7 ];
        out[ 8 ] = a[ 8 ] + b[ 8 ];
        out[ 9 ] = a[ 9 ] + b[ 9 ];
        out[ 10 ] = a[ 10 ] + b[ 10 ];
        out[ 11 ] = a[ 11 ] + b[ 11 ];
        out[ 12 ] = a[ 12 ] + b[ 12 ];
        out[ 13 ] = a[ 13 ] + b[ 13 ];
        out[ 14 ] = a[ 14 ] + b[ 14 ];
        out[ 15 ] = a[ 15 ] + b[ 15 ];

        return out;

    }

    function subtract4( out, a, b ) {

        out[ 0 ] = a[ 0 ] - b[ 0 ];
        out[ 1 ] = a[ 1 ] - b[ 1 ];
        out[ 2 ] = a[ 2 ] - b[ 2 ];
        out[ 3 ] = a[ 3 ] - b[ 3 ];
        out[ 4 ] = a[ 4 ] - b[ 4 ];
        out[ 5 ] = a[ 5 ] - b[ 5 ];
        out[ 6 ] = a[ 6 ] - b[ 6 ];
        out[ 7 ] = a[ 7 ] - b[ 7 ];
        out[ 8 ] = a[ 8 ] - b[ 8 ];
        out[ 9 ] = a[ 9 ] - b[ 9 ];
        out[ 10 ] = a[ 10 ] - b[ 10 ];
        out[ 11 ] = a[ 11 ] - b[ 11 ];
        out[ 12 ] = a[ 12 ] - b[ 12 ];
        out[ 13 ] = a[ 13 ] - b[ 13 ];
        out[ 14 ] = a[ 14 ] - b[ 14 ];
        out[ 15 ] = a[ 15 ] - b[ 15 ];

        return out;

    }

    function multiplyScalar4( out, a, b ) {

        out[ 0 ] = a[ 0 ] * b;
        out[ 1 ] = a[ 1 ] * b;
        out[ 2 ] = a[ 2 ] * b;
        out[ 3 ] = a[ 3 ] * b;
        out[ 4 ] = a[ 4 ] * b;
        out[ 5 ] = a[ 5 ] * b;
        out[ 6 ] = a[ 6 ] * b;
        out[ 7 ] = a[ 7 ] * b;
        out[ 8 ] = a[ 8 ] * b;
        out[ 9 ] = a[ 9 ] * b;
        out[ 10 ] = a[ 10 ] * b;
        out[ 11 ] = a[ 11 ] * b;
        out[ 12 ] = a[ 12 ] * b;
        out[ 13 ] = a[ 13 ] * b;
        out[ 14 ] = a[ 14 ] * b;
        out[ 15 ] = a[ 15 ] * b;

        return out;

    }

    function multiplyScalarAndAdd4( out, a, b, scale10 ) {

        out[ 0 ] = a[ 0 ] + b[ 0 ] * scale10;
        out[ 1 ] = a[ 1 ] + b[ 1 ] * scale10;
        out[ 2 ] = a[ 2 ] + b[ 2 ] * scale10;
        out[ 3 ] = a[ 3 ] + b[ 3 ] * scale10;
        out[ 4 ] = a[ 4 ] + b[ 4 ] * scale10;
        out[ 5 ] = a[ 5 ] + b[ 5 ] * scale10;
        out[ 6 ] = a[ 6 ] + b[ 6 ] * scale10;
        out[ 7 ] = a[ 7 ] + b[ 7 ] * scale10;
        out[ 8 ] = a[ 8 ] + b[ 8 ] * scale10;
        out[ 9 ] = a[ 9 ] + b[ 9 ] * scale10;
        out[ 10 ] = a[ 10 ] + b[ 10 ] * scale10;
        out[ 11 ] = a[ 11 ] + b[ 11 ] * scale10;
        out[ 12 ] = a[ 12 ] + b[ 12 ] * scale10;
        out[ 13 ] = a[ 13 ] + b[ 13 ] * scale10;
        out[ 14 ] = a[ 14 ] + b[ 14 ] * scale10;
        out[ 15 ] = a[ 15 ] + b[ 15 ] * scale10;

        return out;

    }

    function exactEquals4( a, b ) {

        return a[ 0 ] === b[ 0 ] && a[ 1 ] === b[ 1 ] && a[ 2 ] === b[ 2 ] && a[ 3 ] === b[ 3 ] && a[ 4 ] === b[ 4 ] && a[ 5 ] === b[ 5 ] && a[ 6 ] === b[ 6 ] && a[ 7 ] === b[ 7 ] && a[ 8 ] === b[ 8 ] && a[ 9 ] === b[ 9 ] && a[ 10 ] === b[ 10 ] && a[ 11 ] === b[ 11 ] && a[ 12 ] === b[ 12 ] && a[ 13 ] === b[ 13 ] && a[ 14 ] === b[ 14 ] && a[ 15 ] === b[ 15 ];

    }

    function equals5( a, b ) {

        const a0 = a[ 0 ], a1 = a[ 1 ], a2 = a[ 2 ], a3 = a[ 3 ];
        const a4 = a[ 4 ], a5 = a[ 5 ], a6 = a[ 6 ], a7 = a[ 7 ];
        const a8 = a[ 8 ], a9 = a[ 9 ], a10 = a[ 10 ], a11 = a[ 11 ];
        const a12 = a[ 12 ], a13 = a[ 13 ], a14 = a[ 14 ], a15 = a[ 15 ];
        const b0 = b[ 0 ], b1 = b[ 1 ], b2 = b[ 2 ], b3 = b[ 3 ];
        const b4 = b[ 4 ], b5 = b[ 5 ], b6 = b[ 6 ], b7 = b[ 7 ];
        const b8 = b[ 8 ], b9 = b[ 9 ], b10 = b[ 10 ], b11 = b[ 11 ];
        const b12 = b[ 12 ], b13 = b[ 13 ], b14 = b[ 14 ], b15 = b[ 15 ];

        return Math.abs( a0 - b0 ) <= EPSILON * Math.max( 1, Math.abs( a0 ), Math.abs( b0 ) ) && Math.abs( a1 - b1 ) <= EPSILON * Math.max( 1, Math.abs( a1 ), Math.abs( b1 ) ) && Math.abs( a2 - b2 ) <= EPSILON * Math.max( 1, Math.abs( a2 ), Math.abs( b2 ) ) && Math.abs( a3 - b3 ) <= EPSILON * Math.max( 1, Math.abs( a3 ), Math.abs( b3 ) ) && Math.abs( a4 - b4 ) <= EPSILON * Math.max( 1, Math.abs( a4 ), Math.abs( b4 ) ) && Math.abs( a5 - b5 ) <= EPSILON * Math.max( 1, Math.abs( a5 ), Math.abs( b5 ) ) && Math.abs( a6 - b6 ) <= EPSILON * Math.max( 1, Math.abs( a6 ), Math.abs( b6 ) ) && Math.abs( a7 - b7 ) <= EPSILON * Math.max( 1, Math.abs( a7 ), Math.abs( b7 ) ) && Math.abs( a8 - b8 ) <= EPSILON * Math.max( 1, Math.abs( a8 ), Math.abs( b8 ) ) && Math.abs( a9 - b9 ) <= EPSILON * Math.max( 1, Math.abs( a9 ), Math.abs( b9 ) ) && Math.abs( a10 - b10 ) <= EPSILON * Math.max( 1, Math.abs( a10 ), Math.abs( b10 ) ) && Math.abs( a11 - b11 ) <= EPSILON * Math.max( 1, Math.abs( a11 ), Math.abs( b11 ) ) && Math.abs( a12 - b12 ) <= EPSILON * Math.max( 1, Math.abs( a12 ), Math.abs( b12 ) ) && Math.abs( a13 - b13 ) <= EPSILON * Math.max( 1, Math.abs( a13 ), Math.abs( b13 ) ) && Math.abs( a14 - b14 ) <= EPSILON * Math.max( 1, Math.abs( a14 ), Math.abs( b14 ) ) && Math.abs( a15 - b15 ) <= EPSILON * Math.max( 1, Math.abs( a15 ), Math.abs( b15 ) );

    }

    var mul4 = multiply4;
    var sub4 = subtract4;

    // node_modules/gl-matrix/esm/quat.js
    var quat_exports = {};

    __export( quat_exports, {
        add: () => add7,
        calculateW: () => calculateW,
        clone: () => clone7,
        conjugate: () => conjugate,
        copy: () => copy7,
        create: () => create7,
        dot: () => dot3,
        equals: () => equals8,
        exactEquals: () => exactEquals7,
        exp: () => exp,
        fromEuler: () => fromEuler,
        fromMat3: () => fromMat3,
        fromValues: () => fromValues7,
        getAngle: () => getAngle,
        getAxisAngle: () => getAxisAngle,
        identity: () => identity5,
        invert: () => invert5,
        len: () => len3,
        length: () => length3,
        lerp: () => lerp3,
        ln: () => ln,
        mul: () => mul7,
        multiply: () => multiply7,
        normalize: () => normalize3,
        pow: () => pow,
        random: () => random3,
        rotateX: () => rotateX3,
        rotateY: () => rotateY3,
        rotateZ: () => rotateZ3,
        rotationTo: () => rotationTo,
        scale: () => scale7,
        set: () => set7,
        setAxes: () => setAxes,
        setAxisAngle: () => setAxisAngle,
        slerp: () => slerp,
        sqlerp: () => sqlerp,
        sqrLen: () => sqrLen3,
        squaredLength: () => squaredLength3,
        str: () => str7
    } );

    // node_modules/gl-matrix/esm/vec3.js
    var vec3_exports = {};

    __export( vec3_exports, {
        add: () => add5,
        angle: () => angle,
        bezier: () => bezier,
        ceil: () => ceil,
        clone: () => clone5,
        copy: () => copy5,
        create: () => create5,
        cross: () => cross,
        dist: () => dist,
        distance: () => distance,
        div: () => div,
        divide: () => divide,
        dot: () => dot,
        equals: () => equals6,
        exactEquals: () => exactEquals5,
        floor: () => floor,
        forEach: () => forEach,
        fromValues: () => fromValues5,
        hermite: () => hermite,
        inverse: () => inverse,
        len: () => len,
        length: () => length,
        lerp: () => lerp,
        max: () => max,
        min: () => min,
        mul: () => mul5,
        multiply: () => multiply5,
        negate: () => negate,
        normalize: () => normalize,
        random: () => random,
        rotateX: () => rotateX2,
        rotateY: () => rotateY2,
        rotateZ: () => rotateZ2,
        round: () => round,
        scale: () => scale5,
        scaleAndAdd: () => scaleAndAdd,
        set: () => set5,
        sqrDist: () => sqrDist,
        sqrLen: () => sqrLen,
        squaredDistance: () => squaredDistance,
        squaredLength: () => squaredLength,
        str: () => str5,
        sub: () => sub5,
        subtract: () => subtract5,
        transformMat3: () => transformMat3,
        transformMat4: () => transformMat4,
        transformQuat: () => transformQuat,
        zero: () => zero
    } );

    function create5() {

        const out = new ARRAY_TYPE( 3 );

        if ( ARRAY_TYPE != Float32Array ) {

            out[ 0 ] = 0;
            out[ 1 ] = 0;
            out[ 2 ] = 0;

        }

        return out;

    }

    function clone5( a ) {

        const out = new ARRAY_TYPE( 3 );

        out[ 0 ] = a[ 0 ];
        out[ 1 ] = a[ 1 ];
        out[ 2 ] = a[ 2 ];

        return out;

    }

    function length( a ) {

        const x = a[ 0 ];
        const y = a[ 1 ];
        const z = a[ 2 ];

        return Math.hypot( x, y, z );

    }

    function fromValues5( x, y, z ) {

        const out = new ARRAY_TYPE( 3 );

        out[ 0 ] = x;
        out[ 1 ] = y;
        out[ 2 ] = z;

        return out;

    }

    function copy5( out, a ) {

        out[ 0 ] = a[ 0 ];
        out[ 1 ] = a[ 1 ];
        out[ 2 ] = a[ 2 ];

        return out;

    }

    function set5( out, x, y, z ) {

        out[ 0 ] = x;
        out[ 1 ] = y;
        out[ 2 ] = z;

        return out;

    }

    function add5( out, a, b ) {

        out[ 0 ] = a[ 0 ] + b[ 0 ];
        out[ 1 ] = a[ 1 ] + b[ 1 ];
        out[ 2 ] = a[ 2 ] + b[ 2 ];

        return out;

    }

    function subtract5( out, a, b ) {

        out[ 0 ] = a[ 0 ] - b[ 0 ];
        out[ 1 ] = a[ 1 ] - b[ 1 ];
        out[ 2 ] = a[ 2 ] - b[ 2 ];

        return out;

    }

    function multiply5( out, a, b ) {

        out[ 0 ] = a[ 0 ] * b[ 0 ];
        out[ 1 ] = a[ 1 ] * b[ 1 ];
        out[ 2 ] = a[ 2 ] * b[ 2 ];

        return out;

    }

    function divide( out, a, b ) {

        out[ 0 ] = a[ 0 ] / b[ 0 ];
        out[ 1 ] = a[ 1 ] / b[ 1 ];
        out[ 2 ] = a[ 2 ] / b[ 2 ];

        return out;

    }

    function ceil( out, a ) {

        out[ 0 ] = Math.ceil( a[ 0 ] );
        out[ 1 ] = Math.ceil( a[ 1 ] );
        out[ 2 ] = Math.ceil( a[ 2 ] );

        return out;

    }

    function floor( out, a ) {

        out[ 0 ] = Math.floor( a[ 0 ] );
        out[ 1 ] = Math.floor( a[ 1 ] );
        out[ 2 ] = Math.floor( a[ 2 ] );

        return out;

    }

    function min( out, a, b ) {

        out[ 0 ] = Math.min( a[ 0 ], b[ 0 ] );
        out[ 1 ] = Math.min( a[ 1 ], b[ 1 ] );
        out[ 2 ] = Math.min( a[ 2 ], b[ 2 ] );

        return out;

    }

    function max( out, a, b ) {

        out[ 0 ] = Math.max( a[ 0 ], b[ 0 ] );
        out[ 1 ] = Math.max( a[ 1 ], b[ 1 ] );
        out[ 2 ] = Math.max( a[ 2 ], b[ 2 ] );

        return out;

    }

    function round( out, a ) {

        out[ 0 ] = Math.round( a[ 0 ] );
        out[ 1 ] = Math.round( a[ 1 ] );
        out[ 2 ] = Math.round( a[ 2 ] );

        return out;

    }

    function scale5( out, a, b ) {

        out[ 0 ] = a[ 0 ] * b;
        out[ 1 ] = a[ 1 ] * b;
        out[ 2 ] = a[ 2 ] * b;

        return out;

    }

    function scaleAndAdd( out, a, b, scale10 ) {

        out[ 0 ] = a[ 0 ] + b[ 0 ] * scale10;
        out[ 1 ] = a[ 1 ] + b[ 1 ] * scale10;
        out[ 2 ] = a[ 2 ] + b[ 2 ] * scale10;

        return out;

    }

    function distance( a, b ) {

        const x = b[ 0 ] - a[ 0 ];
        const y = b[ 1 ] - a[ 1 ];
        const z = b[ 2 ] - a[ 2 ];

        return Math.hypot( x, y, z );

    }

    function squaredDistance( a, b ) {

        const x = b[ 0 ] - a[ 0 ];
        const y = b[ 1 ] - a[ 1 ];
        const z = b[ 2 ] - a[ 2 ];

        return x * x + y * y + z * z;

    }

    function squaredLength( a ) {

        const x = a[ 0 ];
        const y = a[ 1 ];
        const z = a[ 2 ];

        return x * x + y * y + z * z;

    }

    function negate( out, a ) {

        out[ 0 ] = - a[ 0 ];
        out[ 1 ] = - a[ 1 ];
        out[ 2 ] = - a[ 2 ];

        return out;

    }

    function inverse( out, a ) {

        out[ 0 ] = 1 / a[ 0 ];
        out[ 1 ] = 1 / a[ 1 ];
        out[ 2 ] = 1 / a[ 2 ];

        return out;

    }

    function normalize( out, a ) {

        const x = a[ 0 ];
        const y = a[ 1 ];
        const z = a[ 2 ];
        let len6 = x * x + y * y + z * z;

        if ( len6 > 0 ) {

            len6 = 1 / Math.sqrt( len6 );

        }

        out[ 0 ] = a[ 0 ] * len6;
        out[ 1 ] = a[ 1 ] * len6;
        out[ 2 ] = a[ 2 ] * len6;

        return out;

    }

    function dot( a, b ) {

        return a[ 0 ] * b[ 0 ] + a[ 1 ] * b[ 1 ] + a[ 2 ] * b[ 2 ];

    }

    function cross( out, a, b ) {

        const ax = a[ 0 ], ay = a[ 1 ], az = a[ 2 ];
        const bx = b[ 0 ], by = b[ 1 ], bz = b[ 2 ];

        out[ 0 ] = ay * bz - az * by;
        out[ 1 ] = az * bx - ax * bz;
        out[ 2 ] = ax * by - ay * bx;

        return out;

    }

    function lerp( out, a, b, t ) {

        const ax = a[ 0 ];
        const ay = a[ 1 ];
        const az = a[ 2 ];

        out[ 0 ] = ax + t * ( b[ 0 ] - ax );
        out[ 1 ] = ay + t * ( b[ 1 ] - ay );
        out[ 2 ] = az + t * ( b[ 2 ] - az );

        return out;

    }

    function hermite( out, a, b, c, d, t ) {

        const factorTimes2 = t * t;
        const factor1 = factorTimes2 * ( 2 * t - 3 ) + 1;
        const factor2 = factorTimes2 * ( t - 2 ) + t;
        const factor3 = factorTimes2 * ( t - 1 );
        const factor4 = factorTimes2 * ( 3 - 2 * t );

        out[ 0 ] = a[ 0 ] * factor1 + b[ 0 ] * factor2 + c[ 0 ] * factor3 + d[ 0 ] * factor4;
        out[ 1 ] = a[ 1 ] * factor1 + b[ 1 ] * factor2 + c[ 1 ] * factor3 + d[ 1 ] * factor4;
        out[ 2 ] = a[ 2 ] * factor1 + b[ 2 ] * factor2 + c[ 2 ] * factor3 + d[ 2 ] * factor4;

        return out;

    }

    function bezier( out, a, b, c, d, t ) {

        const inverseFactor = 1 - t;
        const inverseFactorTimesTwo = inverseFactor * inverseFactor;
        const factorTimes2 = t * t;
        const factor1 = inverseFactorTimesTwo * inverseFactor;
        const factor2 = 3 * t * inverseFactorTimesTwo;
        const factor3 = 3 * factorTimes2 * inverseFactor;
        const factor4 = factorTimes2 * t;

        out[ 0 ] = a[ 0 ] * factor1 + b[ 0 ] * factor2 + c[ 0 ] * factor3 + d[ 0 ] * factor4;
        out[ 1 ] = a[ 1 ] * factor1 + b[ 1 ] * factor2 + c[ 1 ] * factor3 + d[ 1 ] * factor4;
        out[ 2 ] = a[ 2 ] * factor1 + b[ 2 ] * factor2 + c[ 2 ] * factor3 + d[ 2 ] * factor4;

        return out;

    }

    function random( out, scale10 ) {

        scale10 = scale10 || 1;
        const r = RANDOM() * 2 * Math.PI;
        const z = RANDOM() * 2 - 1;
        const zScale = Math.sqrt( 1 - z * z ) * scale10;

        out[ 0 ] = Math.cos( r ) * zScale;
        out[ 1 ] = Math.sin( r ) * zScale;
        out[ 2 ] = z * scale10;

        return out;

    }

    function transformMat4( out, a, m ) {

        const x = a[ 0 ], y = a[ 1 ], z = a[ 2 ];
        let w = m[ 3 ] * x + m[ 7 ] * y + m[ 11 ] * z + m[ 15 ];

        w = w || 1;
        out[ 0 ] = ( m[ 0 ] * x + m[ 4 ] * y + m[ 8 ] * z + m[ 12 ] ) / w;
        out[ 1 ] = ( m[ 1 ] * x + m[ 5 ] * y + m[ 9 ] * z + m[ 13 ] ) / w;
        out[ 2 ] = ( m[ 2 ] * x + m[ 6 ] * y + m[ 10 ] * z + m[ 14 ] ) / w;

        return out;

    }

    function transformMat3( out, a, m ) {

        const x = a[ 0 ], y = a[ 1 ], z = a[ 2 ];

        out[ 0 ] = x * m[ 0 ] + y * m[ 3 ] + z * m[ 6 ];
        out[ 1 ] = x * m[ 1 ] + y * m[ 4 ] + z * m[ 7 ];
        out[ 2 ] = x * m[ 2 ] + y * m[ 5 ] + z * m[ 8 ];

        return out;

    }

    function transformQuat( out, a, q ) {

        const qx = q[ 0 ], qy = q[ 1 ], qz = q[ 2 ], qw = q[ 3 ];
        const x = a[ 0 ], y = a[ 1 ], z = a[ 2 ];
        let uvx = qy * z - qz * y, uvy = qz * x - qx * z, uvz = qx * y - qy * x;
        let uuvx = qy * uvz - qz * uvy, uuvy = qz * uvx - qx * uvz, uuvz = qx * uvy - qy * uvx;
        const w2 = qw * 2;

        uvx *= w2;
        uvy *= w2;
        uvz *= w2;
        uuvx *= 2;
        uuvy *= 2;
        uuvz *= 2;
        out[ 0 ] = x + uvx + uuvx;
        out[ 1 ] = y + uvy + uuvy;
        out[ 2 ] = z + uvz + uuvz;

        return out;

    }

    function rotateX2( out, a, b, rad ) {

        const p = [], r = [];

        p[ 0 ] = a[ 0 ] - b[ 0 ];
        p[ 1 ] = a[ 1 ] - b[ 1 ];
        p[ 2 ] = a[ 2 ] - b[ 2 ];
        r[ 0 ] = p[ 0 ];
        r[ 1 ] = p[ 1 ] * Math.cos( rad ) - p[ 2 ] * Math.sin( rad );
        r[ 2 ] = p[ 1 ] * Math.sin( rad ) + p[ 2 ] * Math.cos( rad );
        out[ 0 ] = r[ 0 ] + b[ 0 ];
        out[ 1 ] = r[ 1 ] + b[ 1 ];
        out[ 2 ] = r[ 2 ] + b[ 2 ];

        return out;

    }

    function rotateY2( out, a, b, rad ) {

        const p = [], r = [];

        p[ 0 ] = a[ 0 ] - b[ 0 ];
        p[ 1 ] = a[ 1 ] - b[ 1 ];
        p[ 2 ] = a[ 2 ] - b[ 2 ];
        r[ 0 ] = p[ 2 ] * Math.sin( rad ) + p[ 0 ] * Math.cos( rad );
        r[ 1 ] = p[ 1 ];
        r[ 2 ] = p[ 2 ] * Math.cos( rad ) - p[ 0 ] * Math.sin( rad );
        out[ 0 ] = r[ 0 ] + b[ 0 ];
        out[ 1 ] = r[ 1 ] + b[ 1 ];
        out[ 2 ] = r[ 2 ] + b[ 2 ];

        return out;

    }

    function rotateZ2( out, a, b, rad ) {

        const p = [], r = [];

        p[ 0 ] = a[ 0 ] - b[ 0 ];
        p[ 1 ] = a[ 1 ] - b[ 1 ];
        p[ 2 ] = a[ 2 ] - b[ 2 ];
        r[ 0 ] = p[ 0 ] * Math.cos( rad ) - p[ 1 ] * Math.sin( rad );
        r[ 1 ] = p[ 0 ] * Math.sin( rad ) + p[ 1 ] * Math.cos( rad );
        r[ 2 ] = p[ 2 ];
        out[ 0 ] = r[ 0 ] + b[ 0 ];
        out[ 1 ] = r[ 1 ] + b[ 1 ];
        out[ 2 ] = r[ 2 ] + b[ 2 ];

        return out;

    }

    function angle( a, b ) {

        const ax = a[ 0 ], ay = a[ 1 ], az = a[ 2 ], bx = b[ 0 ], by = b[ 1 ], bz = b[ 2 ], mag1 = Math.sqrt( ax * ax + ay * ay + az * az ), mag2 = Math.sqrt( bx * bx + by * by + bz * bz ), mag = mag1 * mag2, cosine = mag && dot( a, b ) / mag;

        return Math.acos( Math.min( Math.max( cosine, - 1 ), 1 ) );

    }

    function zero( out ) {

        out[ 0 ] = 0;
        out[ 1 ] = 0;
        out[ 2 ] = 0;

        return out;

    }

    function str5( a ) {

        return 'vec3(' + a[ 0 ] + ', ' + a[ 1 ] + ', ' + a[ 2 ] + ')';

    }

    function exactEquals5( a, b ) {

        return a[ 0 ] === b[ 0 ] && a[ 1 ] === b[ 1 ] && a[ 2 ] === b[ 2 ];

    }

    function equals6( a, b ) {

        const a0 = a[ 0 ], a1 = a[ 1 ], a2 = a[ 2 ];
        const b0 = b[ 0 ], b1 = b[ 1 ], b2 = b[ 2 ];

        return Math.abs( a0 - b0 ) <= EPSILON * Math.max( 1, Math.abs( a0 ), Math.abs( b0 ) ) && Math.abs( a1 - b1 ) <= EPSILON * Math.max( 1, Math.abs( a1 ), Math.abs( b1 ) ) && Math.abs( a2 - b2 ) <= EPSILON * Math.max( 1, Math.abs( a2 ), Math.abs( b2 ) );

    }

    var sub5 = subtract5;
    var mul5 = multiply5;
    var div = divide;
    var dist = distance;
    var sqrDist = squaredDistance;
    var len = length;
    var sqrLen = squaredLength;
    var forEach = function () {

        const vec = create5();

        return function ( a, stride, offset, count2, fn, arg ) {

            let i, l;

            if ( !stride ) {

                stride = 3;

            }

            if ( !offset ) {

                offset = 0;

            }

            if ( count2 ) {

                l = Math.min( count2 * stride + offset, a.length );

            } else {

                l = a.length;

            }

            for ( i = offset; i < l; i += stride ) {

                vec[ 0 ] = a[ i ];
                vec[ 1 ] = a[ i + 1 ];
                vec[ 2 ] = a[ i + 2 ];
                fn( vec, vec, arg );
                a[ i ] = vec[ 0 ];
                a[ i + 1 ] = vec[ 1 ];
                a[ i + 2 ] = vec[ 2 ];

            }

            return a;

        };

    }();

    // node_modules/gl-matrix/esm/vec4.js
    var vec4_exports = {};

    __export( vec4_exports, {
        add: () => add6,
        ceil: () => ceil2,
        clone: () => clone6,
        copy: () => copy6,
        create: () => create6,
        cross: () => cross2,
        dist: () => dist2,
        distance: () => distance2,
        div: () => div2,
        divide: () => divide2,
        dot: () => dot2,
        equals: () => equals7,
        exactEquals: () => exactEquals6,
        floor: () => floor2,
        forEach: () => forEach2,
        fromValues: () => fromValues6,
        inverse: () => inverse2,
        len: () => len2,
        length: () => length2,
        lerp: () => lerp2,
        max: () => max2,
        min: () => min2,
        mul: () => mul6,
        multiply: () => multiply6,
        negate: () => negate2,
        normalize: () => normalize2,
        random: () => random2,
        round: () => round2,
        scale: () => scale6,
        scaleAndAdd: () => scaleAndAdd2,
        set: () => set6,
        sqrDist: () => sqrDist2,
        sqrLen: () => sqrLen2,
        squaredDistance: () => squaredDistance2,
        squaredLength: () => squaredLength2,
        str: () => str6,
        sub: () => sub6,
        subtract: () => subtract6,
        transformMat4: () => transformMat42,
        transformQuat: () => transformQuat2,
        zero: () => zero2
    } );

    function create6() {

        const out = new ARRAY_TYPE( 4 );

        if ( ARRAY_TYPE != Float32Array ) {

            out[ 0 ] = 0;
            out[ 1 ] = 0;
            out[ 2 ] = 0;
            out[ 3 ] = 0;

        }

        return out;

    }

    function clone6( a ) {

        const out = new ARRAY_TYPE( 4 );

        out[ 0 ] = a[ 0 ];
        out[ 1 ] = a[ 1 ];
        out[ 2 ] = a[ 2 ];
        out[ 3 ] = a[ 3 ];

        return out;

    }

    function fromValues6( x, y, z, w ) {

        const out = new ARRAY_TYPE( 4 );

        out[ 0 ] = x;
        out[ 1 ] = y;
        out[ 2 ] = z;
        out[ 3 ] = w;

        return out;

    }

    function copy6( out, a ) {

        out[ 0 ] = a[ 0 ];
        out[ 1 ] = a[ 1 ];
        out[ 2 ] = a[ 2 ];
        out[ 3 ] = a[ 3 ];

        return out;

    }

    function set6( out, x, y, z, w ) {

        out[ 0 ] = x;
        out[ 1 ] = y;
        out[ 2 ] = z;
        out[ 3 ] = w;

        return out;

    }

    function add6( out, a, b ) {

        out[ 0 ] = a[ 0 ] + b[ 0 ];
        out[ 1 ] = a[ 1 ] + b[ 1 ];
        out[ 2 ] = a[ 2 ] + b[ 2 ];
        out[ 3 ] = a[ 3 ] + b[ 3 ];

        return out;

    }

    function subtract6( out, a, b ) {

        out[ 0 ] = a[ 0 ] - b[ 0 ];
        out[ 1 ] = a[ 1 ] - b[ 1 ];
        out[ 2 ] = a[ 2 ] - b[ 2 ];
        out[ 3 ] = a[ 3 ] - b[ 3 ];

        return out;

    }

    function multiply6( out, a, b ) {

        out[ 0 ] = a[ 0 ] * b[ 0 ];
        out[ 1 ] = a[ 1 ] * b[ 1 ];
        out[ 2 ] = a[ 2 ] * b[ 2 ];
        out[ 3 ] = a[ 3 ] * b[ 3 ];

        return out;

    }

    function divide2( out, a, b ) {

        out[ 0 ] = a[ 0 ] / b[ 0 ];
        out[ 1 ] = a[ 1 ] / b[ 1 ];
        out[ 2 ] = a[ 2 ] / b[ 2 ];
        out[ 3 ] = a[ 3 ] / b[ 3 ];

        return out;

    }

    function ceil2( out, a ) {

        out[ 0 ] = Math.ceil( a[ 0 ] );
        out[ 1 ] = Math.ceil( a[ 1 ] );
        out[ 2 ] = Math.ceil( a[ 2 ] );
        out[ 3 ] = Math.ceil( a[ 3 ] );

        return out;

    }

    function floor2( out, a ) {

        out[ 0 ] = Math.floor( a[ 0 ] );
        out[ 1 ] = Math.floor( a[ 1 ] );
        out[ 2 ] = Math.floor( a[ 2 ] );
        out[ 3 ] = Math.floor( a[ 3 ] );

        return out;

    }

    function min2( out, a, b ) {

        out[ 0 ] = Math.min( a[ 0 ], b[ 0 ] );
        out[ 1 ] = Math.min( a[ 1 ], b[ 1 ] );
        out[ 2 ] = Math.min( a[ 2 ], b[ 2 ] );
        out[ 3 ] = Math.min( a[ 3 ], b[ 3 ] );

        return out;

    }

    function max2( out, a, b ) {

        out[ 0 ] = Math.max( a[ 0 ], b[ 0 ] );
        out[ 1 ] = Math.max( a[ 1 ], b[ 1 ] );
        out[ 2 ] = Math.max( a[ 2 ], b[ 2 ] );
        out[ 3 ] = Math.max( a[ 3 ], b[ 3 ] );

        return out;

    }

    function round2( out, a ) {

        out[ 0 ] = Math.round( a[ 0 ] );
        out[ 1 ] = Math.round( a[ 1 ] );
        out[ 2 ] = Math.round( a[ 2 ] );
        out[ 3 ] = Math.round( a[ 3 ] );

        return out;

    }

    function scale6( out, a, b ) {

        out[ 0 ] = a[ 0 ] * b;
        out[ 1 ] = a[ 1 ] * b;
        out[ 2 ] = a[ 2 ] * b;
        out[ 3 ] = a[ 3 ] * b;

        return out;

    }

    function scaleAndAdd2( out, a, b, scale10 ) {

        out[ 0 ] = a[ 0 ] + b[ 0 ] * scale10;
        out[ 1 ] = a[ 1 ] + b[ 1 ] * scale10;
        out[ 2 ] = a[ 2 ] + b[ 2 ] * scale10;
        out[ 3 ] = a[ 3 ] + b[ 3 ] * scale10;

        return out;

    }

    function distance2( a, b ) {

        const x = b[ 0 ] - a[ 0 ];
        const y = b[ 1 ] - a[ 1 ];
        const z = b[ 2 ] - a[ 2 ];
        const w = b[ 3 ] - a[ 3 ];

        return Math.hypot( x, y, z, w );

    }

    function squaredDistance2( a, b ) {

        const x = b[ 0 ] - a[ 0 ];
        const y = b[ 1 ] - a[ 1 ];
        const z = b[ 2 ] - a[ 2 ];
        const w = b[ 3 ] - a[ 3 ];

        return x * x + y * y + z * z + w * w;

    }

    function length2( a ) {

        const x = a[ 0 ];
        const y = a[ 1 ];
        const z = a[ 2 ];
        const w = a[ 3 ];

        return Math.hypot( x, y, z, w );

    }

    function squaredLength2( a ) {

        const x = a[ 0 ];
        const y = a[ 1 ];
        const z = a[ 2 ];
        const w = a[ 3 ];

        return x * x + y * y + z * z + w * w;

    }

    function negate2( out, a ) {

        out[ 0 ] = - a[ 0 ];
        out[ 1 ] = - a[ 1 ];
        out[ 2 ] = - a[ 2 ];
        out[ 3 ] = - a[ 3 ];

        return out;

    }

    function inverse2( out, a ) {

        out[ 0 ] = 1 / a[ 0 ];
        out[ 1 ] = 1 / a[ 1 ];
        out[ 2 ] = 1 / a[ 2 ];
        out[ 3 ] = 1 / a[ 3 ];

        return out;

    }

    function normalize2( out, a ) {

        const x = a[ 0 ];
        const y = a[ 1 ];
        const z = a[ 2 ];
        const w = a[ 3 ];
        let len6 = x * x + y * y + z * z + w * w;

        if ( len6 > 0 ) {

            len6 = 1 / Math.sqrt( len6 );

        }

        out[ 0 ] = x * len6;
        out[ 1 ] = y * len6;
        out[ 2 ] = z * len6;
        out[ 3 ] = w * len6;

        return out;

    }

    function dot2( a, b ) {

        return a[ 0 ] * b[ 0 ] + a[ 1 ] * b[ 1 ] + a[ 2 ] * b[ 2 ] + a[ 3 ] * b[ 3 ];

    }

    function cross2( out, u, v, w ) {

        const A = v[ 0 ] * w[ 1 ] - v[ 1 ] * w[ 0 ], B = v[ 0 ] * w[ 2 ] - v[ 2 ] * w[ 0 ], C = v[ 0 ] * w[ 3 ] - v[ 3 ] * w[ 0 ], D = v[ 1 ] * w[ 2 ] - v[ 2 ] * w[ 1 ], E = v[ 1 ] * w[ 3 ] - v[ 3 ] * w[ 1 ], F = v[ 2 ] * w[ 3 ] - v[ 3 ] * w[ 2 ];
        const G = u[ 0 ];
        const H = u[ 1 ];
        const I = u[ 2 ];
        const J = u[ 3 ];

        out[ 0 ] = H * F - I * E + J * D;
        out[ 1 ] = - ( G * F ) + I * C - J * B;
        out[ 2 ] = G * E - H * C + J * A;
        out[ 3 ] = - ( G * D ) + H * B - I * A;

        return out;

    }

    function lerp2( out, a, b, t ) {

        const ax = a[ 0 ];
        const ay = a[ 1 ];
        const az = a[ 2 ];
        const aw = a[ 3 ];

        out[ 0 ] = ax + t * ( b[ 0 ] - ax );
        out[ 1 ] = ay + t * ( b[ 1 ] - ay );
        out[ 2 ] = az + t * ( b[ 2 ] - az );
        out[ 3 ] = aw + t * ( b[ 3 ] - aw );

        return out;

    }

    function random2( out, scale10 ) {

        scale10 = scale10 || 1;
        let v1, v2, v3, v4;
        let s1, s2;

        do {

            v1 = RANDOM() * 2 - 1;
            v2 = RANDOM() * 2 - 1;
            s1 = v1 * v1 + v2 * v2;

        } while ( s1 >= 1 );

        do {

            v3 = RANDOM() * 2 - 1;
            v4 = RANDOM() * 2 - 1;
            s2 = v3 * v3 + v4 * v4;

        } while ( s2 >= 1 );

        const d = Math.sqrt( ( 1 - s1 ) / s2 );

        out[ 0 ] = scale10 * v1;
        out[ 1 ] = scale10 * v2;
        out[ 2 ] = scale10 * v3 * d;
        out[ 3 ] = scale10 * v4 * d;

        return out;

    }

    function transformMat42( out, a, m ) {

        const x = a[ 0 ], y = a[ 1 ], z = a[ 2 ], w = a[ 3 ];

        out[ 0 ] = m[ 0 ] * x + m[ 4 ] * y + m[ 8 ] * z + m[ 12 ] * w;
        out[ 1 ] = m[ 1 ] * x + m[ 5 ] * y + m[ 9 ] * z + m[ 13 ] * w;
        out[ 2 ] = m[ 2 ] * x + m[ 6 ] * y + m[ 10 ] * z + m[ 14 ] * w;
        out[ 3 ] = m[ 3 ] * x + m[ 7 ] * y + m[ 11 ] * z + m[ 15 ] * w;

        return out;

    }

    function transformQuat2( out, a, q ) {

        const x = a[ 0 ], y = a[ 1 ], z = a[ 2 ];
        const qx = q[ 0 ], qy = q[ 1 ], qz = q[ 2 ], qw = q[ 3 ];
        const ix = qw * x + qy * z - qz * y;
        const iy = qw * y + qz * x - qx * z;
        const iz = qw * z + qx * y - qy * x;
        const iw = - qx * x - qy * y - qz * z;

        out[ 0 ] = ix * qw + iw * - qx + iy * - qz - iz * - qy;
        out[ 1 ] = iy * qw + iw * - qy + iz * - qx - ix * - qz;
        out[ 2 ] = iz * qw + iw * - qz + ix * - qy - iy * - qx;
        out[ 3 ] = a[ 3 ];

        return out;

    }

    function zero2( out ) {

        out[ 0 ] = 0;
        out[ 1 ] = 0;
        out[ 2 ] = 0;
        out[ 3 ] = 0;

        return out;

    }

    function str6( a ) {

        return 'vec4(' + a[ 0 ] + ', ' + a[ 1 ] + ', ' + a[ 2 ] + ', ' + a[ 3 ] + ')';

    }

    function exactEquals6( a, b ) {

        return a[ 0 ] === b[ 0 ] && a[ 1 ] === b[ 1 ] && a[ 2 ] === b[ 2 ] && a[ 3 ] === b[ 3 ];

    }

    function equals7( a, b ) {

        const a0 = a[ 0 ], a1 = a[ 1 ], a2 = a[ 2 ], a3 = a[ 3 ];
        const b0 = b[ 0 ], b1 = b[ 1 ], b2 = b[ 2 ], b3 = b[ 3 ];

        return Math.abs( a0 - b0 ) <= EPSILON * Math.max( 1, Math.abs( a0 ), Math.abs( b0 ) ) && Math.abs( a1 - b1 ) <= EPSILON * Math.max( 1, Math.abs( a1 ), Math.abs( b1 ) ) && Math.abs( a2 - b2 ) <= EPSILON * Math.max( 1, Math.abs( a2 ), Math.abs( b2 ) ) && Math.abs( a3 - b3 ) <= EPSILON * Math.max( 1, Math.abs( a3 ), Math.abs( b3 ) );

    }

    var sub6 = subtract6;
    var mul6 = multiply6;
    var div2 = divide2;
    var dist2 = distance2;
    var sqrDist2 = squaredDistance2;
    var len2 = length2;
    var sqrLen2 = squaredLength2;
    var forEach2 = function () {

        const vec = create6();

        return function ( a, stride, offset, count2, fn, arg ) {

            let i, l;

            if ( !stride ) {

                stride = 4;

            }

            if ( !offset ) {

                offset = 0;

            }

            if ( count2 ) {

                l = Math.min( count2 * stride + offset, a.length );

            } else {

                l = a.length;

            }

            for ( i = offset; i < l; i += stride ) {

                vec[ 0 ] = a[ i ];
                vec[ 1 ] = a[ i + 1 ];
                vec[ 2 ] = a[ i + 2 ];
                vec[ 3 ] = a[ i + 3 ];
                fn( vec, vec, arg );
                a[ i ] = vec[ 0 ];
                a[ i + 1 ] = vec[ 1 ];
                a[ i + 2 ] = vec[ 2 ];
                a[ i + 3 ] = vec[ 3 ];

            }

            return a;

        };

    }();

    // node_modules/gl-matrix/esm/quat.js
    function create7() {

        const out = new ARRAY_TYPE( 4 );

        if ( ARRAY_TYPE != Float32Array ) {

            out[ 0 ] = 0;
            out[ 1 ] = 0;
            out[ 2 ] = 0;

        }

        out[ 3 ] = 1;

        return out;

    }

    function identity5( out ) {

        out[ 0 ] = 0;
        out[ 1 ] = 0;
        out[ 2 ] = 0;
        out[ 3 ] = 1;

        return out;

    }

    function setAxisAngle( out, axis, rad ) {

        rad = rad * 0.5;
        const s = Math.sin( rad );

        out[ 0 ] = s * axis[ 0 ];
        out[ 1 ] = s * axis[ 1 ];
        out[ 2 ] = s * axis[ 2 ];
        out[ 3 ] = Math.cos( rad );

        return out;

    }

    function getAxisAngle( out_axis, q ) {

        const rad = Math.acos( q[ 3 ] ) * 2;
        const s = Math.sin( rad / 2 );

        if ( s > EPSILON ) {

            out_axis[ 0 ] = q[ 0 ] / s;
            out_axis[ 1 ] = q[ 1 ] / s;
            out_axis[ 2 ] = q[ 2 ] / s;

        } else {

            out_axis[ 0 ] = 1;
            out_axis[ 1 ] = 0;
            out_axis[ 2 ] = 0;

        }

        return rad;

    }

    function getAngle( a, b ) {

        const dotproduct = dot3( a, b );

        return Math.acos( 2 * dotproduct * dotproduct - 1 );

    }

    function multiply7( out, a, b ) {

        const ax = a[ 0 ], ay = a[ 1 ], az = a[ 2 ], aw = a[ 3 ];
        const bx = b[ 0 ], by = b[ 1 ], bz = b[ 2 ], bw = b[ 3 ];

        out[ 0 ] = ax * bw + aw * bx + ay * bz - az * by;
        out[ 1 ] = ay * bw + aw * by + az * bx - ax * bz;
        out[ 2 ] = az * bw + aw * bz + ax * by - ay * bx;
        out[ 3 ] = aw * bw - ax * bx - ay * by - az * bz;

        return out;

    }

    function rotateX3( out, a, rad ) {

        rad *= 0.5;
        const ax = a[ 0 ], ay = a[ 1 ], az = a[ 2 ], aw = a[ 3 ];
        const bx = Math.sin( rad ), bw = Math.cos( rad );

        out[ 0 ] = ax * bw + aw * bx;
        out[ 1 ] = ay * bw + az * bx;
        out[ 2 ] = az * bw - ay * bx;
        out[ 3 ] = aw * bw - ax * bx;

        return out;

    }

    function rotateY3( out, a, rad ) {

        rad *= 0.5;
        const ax = a[ 0 ], ay = a[ 1 ], az = a[ 2 ], aw = a[ 3 ];
        const by = Math.sin( rad ), bw = Math.cos( rad );

        out[ 0 ] = ax * bw - az * by;
        out[ 1 ] = ay * bw + aw * by;
        out[ 2 ] = az * bw + ax * by;
        out[ 3 ] = aw * bw - ay * by;

        return out;

    }

    function rotateZ3( out, a, rad ) {

        rad *= 0.5;
        const ax = a[ 0 ], ay = a[ 1 ], az = a[ 2 ], aw = a[ 3 ];
        const bz = Math.sin( rad ), bw = Math.cos( rad );

        out[ 0 ] = ax * bw + ay * bz;
        out[ 1 ] = ay * bw - ax * bz;
        out[ 2 ] = az * bw + aw * bz;
        out[ 3 ] = aw * bw - az * bz;

        return out;

    }

    function calculateW( out, a ) {

        const x = a[ 0 ], y = a[ 1 ], z = a[ 2 ];

        out[ 0 ] = x;
        out[ 1 ] = y;
        out[ 2 ] = z;
        out[ 3 ] = Math.sqrt( Math.abs( 1 - x * x - y * y - z * z ) );

        return out;

    }

    function exp( out, a ) {

        const x = a[ 0 ], y = a[ 1 ], z = a[ 2 ], w = a[ 3 ];
        const r = Math.sqrt( x * x + y * y + z * z );
        const et = Math.exp( w );
        const s = r > 0 ? et * Math.sin( r ) / r : 0;

        out[ 0 ] = x * s;
        out[ 1 ] = y * s;
        out[ 2 ] = z * s;
        out[ 3 ] = et * Math.cos( r );

        return out;

    }

    function ln( out, a ) {

        const x = a[ 0 ], y = a[ 1 ], z = a[ 2 ], w = a[ 3 ];
        const r = Math.sqrt( x * x + y * y + z * z );
        const t = r > 0 ? Math.atan2( r, w ) / r : 0;

        out[ 0 ] = x * t;
        out[ 1 ] = y * t;
        out[ 2 ] = z * t;
        out[ 3 ] = 0.5 * Math.log( x * x + y * y + z * z + w * w );

        return out;

    }

    function pow( out, a, b ) {

        ln( out, a );
        scale7( out, out, b );
        exp( out, out );

        return out;

    }

    function slerp( out, a, b, t ) {

        const ax = a[ 0 ], ay = a[ 1 ], az = a[ 2 ], aw = a[ 3 ];
        let bx = b[ 0 ], by = b[ 1 ], bz = b[ 2 ], bw = b[ 3 ];
        let omega, cosom, sinom, scale0, scale1;

        cosom = ax * bx + ay * by + az * bz + aw * bw;

        if ( cosom < 0 ) {

            cosom = - cosom;
            bx = - bx;
            by = - by;
            bz = - bz;
            bw = - bw;

        }

        if ( 1 - cosom > EPSILON ) {

            omega = Math.acos( cosom );
            sinom = Math.sin( omega );
            scale0 = Math.sin( ( 1 - t ) * omega ) / sinom;
            scale1 = Math.sin( t * omega ) / sinom;

        } else {

            scale0 = 1 - t;
            scale1 = t;

        }

        out[ 0 ] = scale0 * ax + scale1 * bx;
        out[ 1 ] = scale0 * ay + scale1 * by;
        out[ 2 ] = scale0 * az + scale1 * bz;
        out[ 3 ] = scale0 * aw + scale1 * bw;

        return out;

    }

    function random3( out ) {

        const u1 = RANDOM();
        const u2 = RANDOM();
        const u3 = RANDOM();
        const sqrt1MinusU1 = Math.sqrt( 1 - u1 );
        const sqrtU1 = Math.sqrt( u1 );

        out[ 0 ] = sqrt1MinusU1 * Math.sin( 2 * Math.PI * u2 );
        out[ 1 ] = sqrt1MinusU1 * Math.cos( 2 * Math.PI * u2 );
        out[ 2 ] = sqrtU1 * Math.sin( 2 * Math.PI * u3 );
        out[ 3 ] = sqrtU1 * Math.cos( 2 * Math.PI * u3 );

        return out;

    }

    function invert5( out, a ) {

        const a0 = a[ 0 ], a1 = a[ 1 ], a2 = a[ 2 ], a3 = a[ 3 ];
        const dot6 = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3;
        const invDot = dot6 ? 1 / dot6 : 0;

        out[ 0 ] = - a0 * invDot;
        out[ 1 ] = - a1 * invDot;
        out[ 2 ] = - a2 * invDot;
        out[ 3 ] = a3 * invDot;

        return out;

    }

    function conjugate( out, a ) {

        out[ 0 ] = - a[ 0 ];
        out[ 1 ] = - a[ 1 ];
        out[ 2 ] = - a[ 2 ];
        out[ 3 ] = a[ 3 ];

        return out;

    }

    function fromMat3( out, m ) {

        const fTrace = m[ 0 ] + m[ 4 ] + m[ 8 ];
        let fRoot;

        if ( fTrace > 0 ) {

            fRoot = Math.sqrt( fTrace + 1 );
            out[ 3 ] = 0.5 * fRoot;
            fRoot = 0.5 / fRoot;
            out[ 0 ] = ( m[ 5 ] - m[ 7 ] ) * fRoot;
            out[ 1 ] = ( m[ 6 ] - m[ 2 ] ) * fRoot;
            out[ 2 ] = ( m[ 1 ] - m[ 3 ] ) * fRoot;

        } else {

            let i = 0;

            if ( m[ 4 ] > m[ 0 ] )
                i = 1;
            if ( m[ 8 ] > m[ i * 3 + i ] )
                i = 2;
            const j = ( i + 1 ) % 3;
            const k = ( i + 2 ) % 3;

            fRoot = Math.sqrt( m[ i * 3 + i ] - m[ j * 3 + j ] - m[ k * 3 + k ] + 1 );
            out[ i ] = 0.5 * fRoot;
            fRoot = 0.5 / fRoot;
            out[ 3 ] = ( m[ j * 3 + k ] - m[ k * 3 + j ] ) * fRoot;
            out[ j ] = ( m[ j * 3 + i ] + m[ i * 3 + j ] ) * fRoot;
            out[ k ] = ( m[ k * 3 + i ] + m[ i * 3 + k ] ) * fRoot;

        }

        return out;

    }

    function fromEuler( out, x, y, z ) {

        const halfToRad = 0.5 * Math.PI / 180;

        x *= halfToRad;
        y *= halfToRad;
        z *= halfToRad;
        const sx = Math.sin( x );
        const cx = Math.cos( x );
        const sy = Math.sin( y );
        const cy = Math.cos( y );
        const sz = Math.sin( z );
        const cz = Math.cos( z );

        out[ 0 ] = sx * cy * cz - cx * sy * sz;
        out[ 1 ] = cx * sy * cz + sx * cy * sz;
        out[ 2 ] = cx * cy * sz - sx * sy * cz;
        out[ 3 ] = cx * cy * cz + sx * sy * sz;

        return out;

    }

    function str7( a ) {

        return 'quat(' + a[ 0 ] + ', ' + a[ 1 ] + ', ' + a[ 2 ] + ', ' + a[ 3 ] + ')';

    }

    var clone7 = clone6;
    var fromValues7 = fromValues6;
    var copy7 = copy6;
    var set7 = set6;
    var add7 = add6;
    var mul7 = multiply7;
    var scale7 = scale6;
    var dot3 = dot2;
    var lerp3 = lerp2;
    var length3 = length2;
    var len3 = length3;
    var squaredLength3 = squaredLength2;
    var sqrLen3 = squaredLength3;
    var normalize3 = normalize2;
    var exactEquals7 = exactEquals6;
    var equals8 = equals7;
    var rotationTo = function () {

        const tmpvec3 = create5();
        const xUnitVec3 = fromValues5( 1, 0, 0 );
        const yUnitVec3 = fromValues5( 0, 1, 0 );

        return function ( out, a, b ) {

            const dot6 = dot( a, b );

            if ( dot6 < - 0.999999 ) {

                cross( tmpvec3, xUnitVec3, a );
                if ( len( tmpvec3 ) < 1e-6 )
                    cross( tmpvec3, yUnitVec3, a );
                normalize( tmpvec3, tmpvec3 );
                setAxisAngle( out, tmpvec3, Math.PI );

                return out;

            } else if ( dot6 > 0.999999 ) {

                out[ 0 ] = 0;
                out[ 1 ] = 0;
                out[ 2 ] = 0;
                out[ 3 ] = 1;

                return out;

            } else {

                cross( tmpvec3, a, b );
                out[ 0 ] = tmpvec3[ 0 ];
                out[ 1 ] = tmpvec3[ 1 ];
                out[ 2 ] = tmpvec3[ 2 ];
                out[ 3 ] = 1 + dot6;

                return normalize3( out, out );

            }

        };

    }();
    var sqlerp = function () {

        const temp1 = create7();
        const temp2 = create7();

        return function ( out, a, b, c, d, t ) {

            slerp( temp1, a, d, t );
            slerp( temp2, b, c, t );
            slerp( out, temp1, temp2, 2 * t * ( 1 - t ) );

            return out;

        };

    }();
    var setAxes = function () {

        const matr = create3();

        return function ( out, view, right, up ) {

            matr[ 0 ] = right[ 0 ];
            matr[ 3 ] = right[ 1 ];
            matr[ 6 ] = right[ 2 ];
            matr[ 1 ] = up[ 0 ];
            matr[ 4 ] = up[ 1 ];
            matr[ 7 ] = up[ 2 ];
            matr[ 2 ] = - view[ 0 ];
            matr[ 5 ] = - view[ 1 ];
            matr[ 8 ] = - view[ 2 ];

            return normalize3( out, fromMat3( out, matr ) );

        };

    }();

    // node_modules/gl-matrix/esm/quat2.js
    var quat2_exports = {};

    __export( quat2_exports, {
        add: () => add8,
        clone: () => clone8,
        conjugate: () => conjugate2,
        copy: () => copy8,
        create: () => create8,
        dot: () => dot4,
        equals: () => equals9,
        exactEquals: () => exactEquals8,
        fromMat4: () => fromMat42,
        fromRotation: () => fromRotation5,
        fromRotationTranslation: () => fromRotationTranslation2,
        fromRotationTranslationValues: () => fromRotationTranslationValues,
        fromTranslation: () => fromTranslation4,
        fromValues: () => fromValues8,
        getDual: () => getDual,
        getReal: () => getReal,
        getTranslation: () => getTranslation2,
        identity: () => identity6,
        invert: () => invert6,
        len: () => len4,
        length: () => length4,
        lerp: () => lerp4,
        mul: () => mul8,
        multiply: () => multiply8,
        normalize: () => normalize4,
        rotateAroundAxis: () => rotateAroundAxis,
        rotateByQuatAppend: () => rotateByQuatAppend,
        rotateByQuatPrepend: () => rotateByQuatPrepend,
        rotateX: () => rotateX4,
        rotateY: () => rotateY4,
        rotateZ: () => rotateZ4,
        scale: () => scale8,
        set: () => set8,
        setDual: () => setDual,
        setReal: () => setReal,
        sqrLen: () => sqrLen4,
        squaredLength: () => squaredLength4,
        str: () => str8,
        translate: () => translate4
    } );

    function create8() {

        const dq = new ARRAY_TYPE( 8 );

        if ( ARRAY_TYPE != Float32Array ) {

            dq[ 0 ] = 0;
            dq[ 1 ] = 0;
            dq[ 2 ] = 0;
            dq[ 4 ] = 0;
            dq[ 5 ] = 0;
            dq[ 6 ] = 0;
            dq[ 7 ] = 0;

        }

        dq[ 3 ] = 1;

        return dq;

    }

    function clone8( a ) {

        const dq = new ARRAY_TYPE( 8 );

        dq[ 0 ] = a[ 0 ];
        dq[ 1 ] = a[ 1 ];
        dq[ 2 ] = a[ 2 ];
        dq[ 3 ] = a[ 3 ];
        dq[ 4 ] = a[ 4 ];
        dq[ 5 ] = a[ 5 ];
        dq[ 6 ] = a[ 6 ];
        dq[ 7 ] = a[ 7 ];

        return dq;

    }

    function fromValues8( x1, y1, z1, w1, x2, y2, z2, w2 ) {

        const dq = new ARRAY_TYPE( 8 );

        dq[ 0 ] = x1;
        dq[ 1 ] = y1;
        dq[ 2 ] = z1;
        dq[ 3 ] = w1;
        dq[ 4 ] = x2;
        dq[ 5 ] = y2;
        dq[ 6 ] = z2;
        dq[ 7 ] = w2;

        return dq;

    }

    function fromRotationTranslationValues( x1, y1, z1, w1, x2, y2, z2 ) {

        const dq = new ARRAY_TYPE( 8 );

        dq[ 0 ] = x1;
        dq[ 1 ] = y1;
        dq[ 2 ] = z1;
        dq[ 3 ] = w1;
        const ax = x2 * 0.5, ay = y2 * 0.5, az = z2 * 0.5;

        dq[ 4 ] = ax * w1 + ay * z1 - az * y1;
        dq[ 5 ] = ay * w1 + az * x1 - ax * z1;
        dq[ 6 ] = az * w1 + ax * y1 - ay * x1;
        dq[ 7 ] = - ax * x1 - ay * y1 - az * z1;

        return dq;

    }

    function fromRotationTranslation2( out, q, t ) {

        const ax = t[ 0 ] * 0.5, ay = t[ 1 ] * 0.5, az = t[ 2 ] * 0.5, bx = q[ 0 ], by = q[ 1 ], bz = q[ 2 ], bw = q[ 3 ];

        out[ 0 ] = bx;
        out[ 1 ] = by;
        out[ 2 ] = bz;
        out[ 3 ] = bw;
        out[ 4 ] = ax * bw + ay * bz - az * by;
        out[ 5 ] = ay * bw + az * bx - ax * bz;
        out[ 6 ] = az * bw + ax * by - ay * bx;
        out[ 7 ] = - ax * bx - ay * by - az * bz;

        return out;

    }

    function fromTranslation4( out, t ) {

        out[ 0 ] = 0;
        out[ 1 ] = 0;
        out[ 2 ] = 0;
        out[ 3 ] = 1;
        out[ 4 ] = t[ 0 ] * 0.5;
        out[ 5 ] = t[ 1 ] * 0.5;
        out[ 6 ] = t[ 2 ] * 0.5;
        out[ 7 ] = 0;

        return out;

    }

    function fromRotation5( out, q ) {

        out[ 0 ] = q[ 0 ];
        out[ 1 ] = q[ 1 ];
        out[ 2 ] = q[ 2 ];
        out[ 3 ] = q[ 3 ];
        out[ 4 ] = 0;
        out[ 5 ] = 0;
        out[ 6 ] = 0;
        out[ 7 ] = 0;

        return out;

    }

    function fromMat42( out, a ) {

        const outer = create7();

        getRotation( outer, a );
        const t = new ARRAY_TYPE( 3 );

        getTranslation( t, a );
        fromRotationTranslation2( out, outer, t );

        return out;

    }

    function copy8( out, a ) {

        out[ 0 ] = a[ 0 ];
        out[ 1 ] = a[ 1 ];
        out[ 2 ] = a[ 2 ];
        out[ 3 ] = a[ 3 ];
        out[ 4 ] = a[ 4 ];
        out[ 5 ] = a[ 5 ];
        out[ 6 ] = a[ 6 ];
        out[ 7 ] = a[ 7 ];

        return out;

    }

    function identity6( out ) {

        out[ 0 ] = 0;
        out[ 1 ] = 0;
        out[ 2 ] = 0;
        out[ 3 ] = 1;
        out[ 4 ] = 0;
        out[ 5 ] = 0;
        out[ 6 ] = 0;
        out[ 7 ] = 0;

        return out;

    }

    function set8( out, x1, y1, z1, w1, x2, y2, z2, w2 ) {

        out[ 0 ] = x1;
        out[ 1 ] = y1;
        out[ 2 ] = z1;
        out[ 3 ] = w1;
        out[ 4 ] = x2;
        out[ 5 ] = y2;
        out[ 6 ] = z2;
        out[ 7 ] = w2;

        return out;

    }

    var getReal = copy7;

    function getDual( out, a ) {

        out[ 0 ] = a[ 4 ];
        out[ 1 ] = a[ 5 ];
        out[ 2 ] = a[ 6 ];
        out[ 3 ] = a[ 7 ];

        return out;

    }

    var setReal = copy7;

    function setDual( out, q ) {

        out[ 4 ] = q[ 0 ];
        out[ 5 ] = q[ 1 ];
        out[ 6 ] = q[ 2 ];
        out[ 7 ] = q[ 3 ];

        return out;

    }

    function getTranslation2( out, a ) {

        const ax = a[ 4 ], ay = a[ 5 ], az = a[ 6 ], aw = a[ 7 ], bx = - a[ 0 ], by = - a[ 1 ], bz = - a[ 2 ], bw = a[ 3 ];

        out[ 0 ] = ( ax * bw + aw * bx + ay * bz - az * by ) * 2;
        out[ 1 ] = ( ay * bw + aw * by + az * bx - ax * bz ) * 2;
        out[ 2 ] = ( az * bw + aw * bz + ax * by - ay * bx ) * 2;

        return out;

    }

    function translate4( out, a, v ) {

        const ax1 = a[ 0 ], ay1 = a[ 1 ], az1 = a[ 2 ], aw1 = a[ 3 ], bx1 = v[ 0 ] * 0.5, by1 = v[ 1 ] * 0.5, bz1 = v[ 2 ] * 0.5, ax2 = a[ 4 ], ay2 = a[ 5 ], az2 = a[ 6 ], aw2 = a[ 7 ];

        out[ 0 ] = ax1;
        out[ 1 ] = ay1;
        out[ 2 ] = az1;
        out[ 3 ] = aw1;
        out[ 4 ] = aw1 * bx1 + ay1 * bz1 - az1 * by1 + ax2;
        out[ 5 ] = aw1 * by1 + az1 * bx1 - ax1 * bz1 + ay2;
        out[ 6 ] = aw1 * bz1 + ax1 * by1 - ay1 * bx1 + az2;
        out[ 7 ] = - ax1 * bx1 - ay1 * by1 - az1 * bz1 + aw2;

        return out;

    }

    function rotateX4( out, a, rad ) {

        let bx = - a[ 0 ], by = - a[ 1 ], bz = - a[ 2 ], bw = a[ 3 ], ax = a[ 4 ], ay = a[ 5 ], az = a[ 6 ], aw = a[ 7 ], ax1 = ax * bw + aw * bx + ay * bz - az * by, ay1 = ay * bw + aw * by + az * bx - ax * bz, az1 = az * bw + aw * bz + ax * by - ay * bx, aw1 = aw * bw - ax * bx - ay * by - az * bz;

        rotateX3( out, a, rad );
        bx = out[ 0 ];
        by = out[ 1 ];
        bz = out[ 2 ];
        bw = out[ 3 ];
        out[ 4 ] = ax1 * bw + aw1 * bx + ay1 * bz - az1 * by;
        out[ 5 ] = ay1 * bw + aw1 * by + az1 * bx - ax1 * bz;
        out[ 6 ] = az1 * bw + aw1 * bz + ax1 * by - ay1 * bx;
        out[ 7 ] = aw1 * bw - ax1 * bx - ay1 * by - az1 * bz;

        return out;

    }

    function rotateY4( out, a, rad ) {

        let bx = - a[ 0 ], by = - a[ 1 ], bz = - a[ 2 ], bw = a[ 3 ], ax = a[ 4 ], ay = a[ 5 ], az = a[ 6 ], aw = a[ 7 ], ax1 = ax * bw + aw * bx + ay * bz - az * by, ay1 = ay * bw + aw * by + az * bx - ax * bz, az1 = az * bw + aw * bz + ax * by - ay * bx, aw1 = aw * bw - ax * bx - ay * by - az * bz;

        rotateY3( out, a, rad );
        bx = out[ 0 ];
        by = out[ 1 ];
        bz = out[ 2 ];
        bw = out[ 3 ];
        out[ 4 ] = ax1 * bw + aw1 * bx + ay1 * bz - az1 * by;
        out[ 5 ] = ay1 * bw + aw1 * by + az1 * bx - ax1 * bz;
        out[ 6 ] = az1 * bw + aw1 * bz + ax1 * by - ay1 * bx;
        out[ 7 ] = aw1 * bw - ax1 * bx - ay1 * by - az1 * bz;

        return out;

    }

    function rotateZ4( out, a, rad ) {

        let bx = - a[ 0 ], by = - a[ 1 ], bz = - a[ 2 ], bw = a[ 3 ], ax = a[ 4 ], ay = a[ 5 ], az = a[ 6 ], aw = a[ 7 ], ax1 = ax * bw + aw * bx + ay * bz - az * by, ay1 = ay * bw + aw * by + az * bx - ax * bz, az1 = az * bw + aw * bz + ax * by - ay * bx, aw1 = aw * bw - ax * bx - ay * by - az * bz;

        rotateZ3( out, a, rad );
        bx = out[ 0 ];
        by = out[ 1 ];
        bz = out[ 2 ];
        bw = out[ 3 ];
        out[ 4 ] = ax1 * bw + aw1 * bx + ay1 * bz - az1 * by;
        out[ 5 ] = ay1 * bw + aw1 * by + az1 * bx - ax1 * bz;
        out[ 6 ] = az1 * bw + aw1 * bz + ax1 * by - ay1 * bx;
        out[ 7 ] = aw1 * bw - ax1 * bx - ay1 * by - az1 * bz;

        return out;

    }

    function rotateByQuatAppend( out, a, q ) {

        let qx = q[ 0 ], qy = q[ 1 ], qz = q[ 2 ], qw = q[ 3 ], ax = a[ 0 ], ay = a[ 1 ], az = a[ 2 ], aw = a[ 3 ];

        out[ 0 ] = ax * qw + aw * qx + ay * qz - az * qy;
        out[ 1 ] = ay * qw + aw * qy + az * qx - ax * qz;
        out[ 2 ] = az * qw + aw * qz + ax * qy - ay * qx;
        out[ 3 ] = aw * qw - ax * qx - ay * qy - az * qz;
        ax = a[ 4 ];
        ay = a[ 5 ];
        az = a[ 6 ];
        aw = a[ 7 ];
        out[ 4 ] = ax * qw + aw * qx + ay * qz - az * qy;
        out[ 5 ] = ay * qw + aw * qy + az * qx - ax * qz;
        out[ 6 ] = az * qw + aw * qz + ax * qy - ay * qx;
        out[ 7 ] = aw * qw - ax * qx - ay * qy - az * qz;

        return out;

    }

    function rotateByQuatPrepend( out, q, a ) {

        let qx = q[ 0 ], qy = q[ 1 ], qz = q[ 2 ], qw = q[ 3 ], bx = a[ 0 ], by = a[ 1 ], bz = a[ 2 ], bw = a[ 3 ];

        out[ 0 ] = qx * bw + qw * bx + qy * bz - qz * by;
        out[ 1 ] = qy * bw + qw * by + qz * bx - qx * bz;
        out[ 2 ] = qz * bw + qw * bz + qx * by - qy * bx;
        out[ 3 ] = qw * bw - qx * bx - qy * by - qz * bz;
        bx = a[ 4 ];
        by = a[ 5 ];
        bz = a[ 6 ];
        bw = a[ 7 ];
        out[ 4 ] = qx * bw + qw * bx + qy * bz - qz * by;
        out[ 5 ] = qy * bw + qw * by + qz * bx - qx * bz;
        out[ 6 ] = qz * bw + qw * bz + qx * by - qy * bx;
        out[ 7 ] = qw * bw - qx * bx - qy * by - qz * bz;

        return out;

    }

    function rotateAroundAxis( out, a, axis, rad ) {

        if ( Math.abs( rad ) < EPSILON ) {

            return copy8( out, a );

        }

        const axisLength = Math.hypot( axis[ 0 ], axis[ 1 ], axis[ 2 ] );

        rad = rad * 0.5;
        const s = Math.sin( rad );
        const bx = s * axis[ 0 ] / axisLength;
        const by = s * axis[ 1 ] / axisLength;
        const bz = s * axis[ 2 ] / axisLength;
        const bw = Math.cos( rad );
        const ax1 = a[ 0 ], ay1 = a[ 1 ], az1 = a[ 2 ], aw1 = a[ 3 ];

        out[ 0 ] = ax1 * bw + aw1 * bx + ay1 * bz - az1 * by;
        out[ 1 ] = ay1 * bw + aw1 * by + az1 * bx - ax1 * bz;
        out[ 2 ] = az1 * bw + aw1 * bz + ax1 * by - ay1 * bx;
        out[ 3 ] = aw1 * bw - ax1 * bx - ay1 * by - az1 * bz;
        const ax = a[ 4 ], ay = a[ 5 ], az = a[ 6 ], aw = a[ 7 ];

        out[ 4 ] = ax * bw + aw * bx + ay * bz - az * by;
        out[ 5 ] = ay * bw + aw * by + az * bx - ax * bz;
        out[ 6 ] = az * bw + aw * bz + ax * by - ay * bx;
        out[ 7 ] = aw * bw - ax * bx - ay * by - az * bz;

        return out;

    }

    function add8( out, a, b ) {

        out[ 0 ] = a[ 0 ] + b[ 0 ];
        out[ 1 ] = a[ 1 ] + b[ 1 ];
        out[ 2 ] = a[ 2 ] + b[ 2 ];
        out[ 3 ] = a[ 3 ] + b[ 3 ];
        out[ 4 ] = a[ 4 ] + b[ 4 ];
        out[ 5 ] = a[ 5 ] + b[ 5 ];
        out[ 6 ] = a[ 6 ] + b[ 6 ];
        out[ 7 ] = a[ 7 ] + b[ 7 ];

        return out;

    }

    function multiply8( out, a, b ) {

        const ax0 = a[ 0 ], ay0 = a[ 1 ], az0 = a[ 2 ], aw0 = a[ 3 ], bx1 = b[ 4 ], by1 = b[ 5 ], bz1 = b[ 6 ], bw1 = b[ 7 ], ax1 = a[ 4 ], ay1 = a[ 5 ], az1 = a[ 6 ], aw1 = a[ 7 ], bx0 = b[ 0 ], by0 = b[ 1 ], bz0 = b[ 2 ], bw0 = b[ 3 ];

        out[ 0 ] = ax0 * bw0 + aw0 * bx0 + ay0 * bz0 - az0 * by0;
        out[ 1 ] = ay0 * bw0 + aw0 * by0 + az0 * bx0 - ax0 * bz0;
        out[ 2 ] = az0 * bw0 + aw0 * bz0 + ax0 * by0 - ay0 * bx0;
        out[ 3 ] = aw0 * bw0 - ax0 * bx0 - ay0 * by0 - az0 * bz0;
        out[ 4 ] = ax0 * bw1 + aw0 * bx1 + ay0 * bz1 - az0 * by1 + ax1 * bw0 + aw1 * bx0 + ay1 * bz0 - az1 * by0;
        out[ 5 ] = ay0 * bw1 + aw0 * by1 + az0 * bx1 - ax0 * bz1 + ay1 * bw0 + aw1 * by0 + az1 * bx0 - ax1 * bz0;
        out[ 6 ] = az0 * bw1 + aw0 * bz1 + ax0 * by1 - ay0 * bx1 + az1 * bw0 + aw1 * bz0 + ax1 * by0 - ay1 * bx0;
        out[ 7 ] = aw0 * bw1 - ax0 * bx1 - ay0 * by1 - az0 * bz1 + aw1 * bw0 - ax1 * bx0 - ay1 * by0 - az1 * bz0;

        return out;

    }

    var mul8 = multiply8;

    function scale8( out, a, b ) {

        out[ 0 ] = a[ 0 ] * b;
        out[ 1 ] = a[ 1 ] * b;
        out[ 2 ] = a[ 2 ] * b;
        out[ 3 ] = a[ 3 ] * b;
        out[ 4 ] = a[ 4 ] * b;
        out[ 5 ] = a[ 5 ] * b;
        out[ 6 ] = a[ 6 ] * b;
        out[ 7 ] = a[ 7 ] * b;

        return out;

    }

    var dot4 = dot3;

    function lerp4( out, a, b, t ) {

        const mt = 1 - t;

        if ( dot4( a, b ) < 0 )
            t = - t;
        out[ 0 ] = a[ 0 ] * mt + b[ 0 ] * t;
        out[ 1 ] = a[ 1 ] * mt + b[ 1 ] * t;
        out[ 2 ] = a[ 2 ] * mt + b[ 2 ] * t;
        out[ 3 ] = a[ 3 ] * mt + b[ 3 ] * t;
        out[ 4 ] = a[ 4 ] * mt + b[ 4 ] * t;
        out[ 5 ] = a[ 5 ] * mt + b[ 5 ] * t;
        out[ 6 ] = a[ 6 ] * mt + b[ 6 ] * t;
        out[ 7 ] = a[ 7 ] * mt + b[ 7 ] * t;

        return out;

    }

    function invert6( out, a ) {

        const sqlen = squaredLength4( a );

        out[ 0 ] = - a[ 0 ] / sqlen;
        out[ 1 ] = - a[ 1 ] / sqlen;
        out[ 2 ] = - a[ 2 ] / sqlen;
        out[ 3 ] = a[ 3 ] / sqlen;
        out[ 4 ] = - a[ 4 ] / sqlen;
        out[ 5 ] = - a[ 5 ] / sqlen;
        out[ 6 ] = - a[ 6 ] / sqlen;
        out[ 7 ] = a[ 7 ] / sqlen;

        return out;

    }

    function conjugate2( out, a ) {

        out[ 0 ] = - a[ 0 ];
        out[ 1 ] = - a[ 1 ];
        out[ 2 ] = - a[ 2 ];
        out[ 3 ] = a[ 3 ];
        out[ 4 ] = - a[ 4 ];
        out[ 5 ] = - a[ 5 ];
        out[ 6 ] = - a[ 6 ];
        out[ 7 ] = a[ 7 ];

        return out;

    }

    var length4 = length3;
    var len4 = length4;
    var squaredLength4 = squaredLength3;
    var sqrLen4 = squaredLength4;

    function normalize4( out, a ) {

        let magnitude = squaredLength4( a );

        if ( magnitude > 0 ) {

            magnitude = Math.sqrt( magnitude );
            const a0 = a[ 0 ] / magnitude;
            const a1 = a[ 1 ] / magnitude;
            const a2 = a[ 2 ] / magnitude;
            const a3 = a[ 3 ] / magnitude;
            const b0 = a[ 4 ];
            const b1 = a[ 5 ];
            const b2 = a[ 6 ];
            const b3 = a[ 7 ];
            const a_dot_b = a0 * b0 + a1 * b1 + a2 * b2 + a3 * b3;

            out[ 0 ] = a0;
            out[ 1 ] = a1;
            out[ 2 ] = a2;
            out[ 3 ] = a3;
            out[ 4 ] = ( b0 - a0 * a_dot_b ) / magnitude;
            out[ 5 ] = ( b1 - a1 * a_dot_b ) / magnitude;
            out[ 6 ] = ( b2 - a2 * a_dot_b ) / magnitude;
            out[ 7 ] = ( b3 - a3 * a_dot_b ) / magnitude;

        }

        return out;

    }

    function str8( a ) {

        return 'quat2(' + a[ 0 ] + ', ' + a[ 1 ] + ', ' + a[ 2 ] + ', ' + a[ 3 ] + ', ' + a[ 4 ] + ', ' + a[ 5 ] + ', ' + a[ 6 ] + ', ' + a[ 7 ] + ')';

    }

    function exactEquals8( a, b ) {

        return a[ 0 ] === b[ 0 ] && a[ 1 ] === b[ 1 ] && a[ 2 ] === b[ 2 ] && a[ 3 ] === b[ 3 ] && a[ 4 ] === b[ 4 ] && a[ 5 ] === b[ 5 ] && a[ 6 ] === b[ 6 ] && a[ 7 ] === b[ 7 ];

    }

    function equals9( a, b ) {

        const a0 = a[ 0 ], a1 = a[ 1 ], a2 = a[ 2 ], a3 = a[ 3 ], a4 = a[ 4 ], a5 = a[ 5 ], a6 = a[ 6 ], a7 = a[ 7 ];
        const b0 = b[ 0 ], b1 = b[ 1 ], b2 = b[ 2 ], b3 = b[ 3 ], b4 = b[ 4 ], b5 = b[ 5 ], b6 = b[ 6 ], b7 = b[ 7 ];

        return Math.abs( a0 - b0 ) <= EPSILON * Math.max( 1, Math.abs( a0 ), Math.abs( b0 ) ) && Math.abs( a1 - b1 ) <= EPSILON * Math.max( 1, Math.abs( a1 ), Math.abs( b1 ) ) && Math.abs( a2 - b2 ) <= EPSILON * Math.max( 1, Math.abs( a2 ), Math.abs( b2 ) ) && Math.abs( a3 - b3 ) <= EPSILON * Math.max( 1, Math.abs( a3 ), Math.abs( b3 ) ) && Math.abs( a4 - b4 ) <= EPSILON * Math.max( 1, Math.abs( a4 ), Math.abs( b4 ) ) && Math.abs( a5 - b5 ) <= EPSILON * Math.max( 1, Math.abs( a5 ), Math.abs( b5 ) ) && Math.abs( a6 - b6 ) <= EPSILON * Math.max( 1, Math.abs( a6 ), Math.abs( b6 ) ) && Math.abs( a7 - b7 ) <= EPSILON * Math.max( 1, Math.abs( a7 ), Math.abs( b7 ) );

    }

    // node_modules/gl-matrix/esm/vec2.js
    var vec2_exports = {};

    __export( vec2_exports, {
        add: () => add9,
        angle: () => angle2,
        ceil: () => ceil3,
        clone: () => clone9,
        copy: () => copy9,
        create: () => create9,
        cross: () => cross3,
        dist: () => dist3,
        distance: () => distance3,
        div: () => div3,
        divide: () => divide3,
        dot: () => dot5,
        equals: () => equals10,
        exactEquals: () => exactEquals9,
        floor: () => floor3,
        forEach: () => forEach3,
        fromValues: () => fromValues9,
        inverse: () => inverse3,
        len: () => len5,
        length: () => length5,
        lerp: () => lerp5,
        max: () => max3,
        min: () => min3,
        mul: () => mul9,
        multiply: () => multiply9,
        negate: () => negate3,
        normalize: () => normalize5,
        random: () => random4,
        rotate: () => rotate5,
        round: () => round3,
        scale: () => scale9,
        scaleAndAdd: () => scaleAndAdd3,
        set: () => set9,
        sqrDist: () => sqrDist3,
        sqrLen: () => sqrLen5,
        squaredDistance: () => squaredDistance3,
        squaredLength: () => squaredLength5,
        str: () => str9,
        sub: () => sub7,
        subtract: () => subtract7,
        transformMat2: () => transformMat2,
        transformMat2d: () => transformMat2d,
        transformMat3: () => transformMat32,
        transformMat4: () => transformMat43,
        zero: () => zero3
    } );

    function create9() {

        const out = new ARRAY_TYPE( 2 );

        if ( ARRAY_TYPE != Float32Array ) {

            out[ 0 ] = 0;
            out[ 1 ] = 0;

        }

        return out;

    }

    function clone9( a ) {

        const out = new ARRAY_TYPE( 2 );

        out[ 0 ] = a[ 0 ];
        out[ 1 ] = a[ 1 ];

        return out;

    }

    function fromValues9( x, y ) {

        const out = new ARRAY_TYPE( 2 );

        out[ 0 ] = x;
        out[ 1 ] = y;

        return out;

    }

    function copy9( out, a ) {

        out[ 0 ] = a[ 0 ];
        out[ 1 ] = a[ 1 ];

        return out;

    }

    function set9( out, x, y ) {

        out[ 0 ] = x;
        out[ 1 ] = y;

        return out;

    }

    function add9( out, a, b ) {

        out[ 0 ] = a[ 0 ] + b[ 0 ];
        out[ 1 ] = a[ 1 ] + b[ 1 ];

        return out;

    }

    function subtract7( out, a, b ) {

        out[ 0 ] = a[ 0 ] - b[ 0 ];
        out[ 1 ] = a[ 1 ] - b[ 1 ];

        return out;

    }

    function multiply9( out, a, b ) {

        out[ 0 ] = a[ 0 ] * b[ 0 ];
        out[ 1 ] = a[ 1 ] * b[ 1 ];

        return out;

    }

    function divide3( out, a, b ) {

        out[ 0 ] = a[ 0 ] / b[ 0 ];
        out[ 1 ] = a[ 1 ] / b[ 1 ];

        return out;

    }

    function ceil3( out, a ) {

        out[ 0 ] = Math.ceil( a[ 0 ] );
        out[ 1 ] = Math.ceil( a[ 1 ] );

        return out;

    }

    function floor3( out, a ) {

        out[ 0 ] = Math.floor( a[ 0 ] );
        out[ 1 ] = Math.floor( a[ 1 ] );

        return out;

    }

    function min3( out, a, b ) {

        out[ 0 ] = Math.min( a[ 0 ], b[ 0 ] );
        out[ 1 ] = Math.min( a[ 1 ], b[ 1 ] );

        return out;

    }

    function max3( out, a, b ) {

        out[ 0 ] = Math.max( a[ 0 ], b[ 0 ] );
        out[ 1 ] = Math.max( a[ 1 ], b[ 1 ] );

        return out;

    }

    function round3( out, a ) {

        out[ 0 ] = Math.round( a[ 0 ] );
        out[ 1 ] = Math.round( a[ 1 ] );

        return out;

    }

    function scale9( out, a, b ) {

        out[ 0 ] = a[ 0 ] * b;
        out[ 1 ] = a[ 1 ] * b;

        return out;

    }

    function scaleAndAdd3( out, a, b, scale10 ) {

        out[ 0 ] = a[ 0 ] + b[ 0 ] * scale10;
        out[ 1 ] = a[ 1 ] + b[ 1 ] * scale10;

        return out;

    }

    function distance3( a, b ) {

        const x = b[ 0 ] - a[ 0 ], y = b[ 1 ] - a[ 1 ];

        return Math.hypot( x, y );

    }

    function squaredDistance3( a, b ) {

        const x = b[ 0 ] - a[ 0 ], y = b[ 1 ] - a[ 1 ];

        return x * x + y * y;

    }

    function length5( a ) {

        const x = a[ 0 ], y = a[ 1 ];

        return Math.hypot( x, y );

    }

    function squaredLength5( a ) {

        const x = a[ 0 ], y = a[ 1 ];

        return x * x + y * y;

    }

    function negate3( out, a ) {

        out[ 0 ] = - a[ 0 ];
        out[ 1 ] = - a[ 1 ];

        return out;

    }

    function inverse3( out, a ) {

        out[ 0 ] = 1 / a[ 0 ];
        out[ 1 ] = 1 / a[ 1 ];

        return out;

    }

    function normalize5( out, a ) {

        const x = a[ 0 ], y = a[ 1 ];
        let len6 = x * x + y * y;

        if ( len6 > 0 ) {

            len6 = 1 / Math.sqrt( len6 );

        }

        out[ 0 ] = a[ 0 ] * len6;
        out[ 1 ] = a[ 1 ] * len6;

        return out;

    }

    function dot5( a, b ) {

        return a[ 0 ] * b[ 0 ] + a[ 1 ] * b[ 1 ];

    }

    function cross3( out, a, b ) {

        const z = a[ 0 ] * b[ 1 ] - a[ 1 ] * b[ 0 ];

        out[ 0 ] = out[ 1 ] = 0;
        out[ 2 ] = z;

        return out;

    }

    function lerp5( out, a, b, t ) {

        const ax = a[ 0 ], ay = a[ 1 ];

        out[ 0 ] = ax + t * ( b[ 0 ] - ax );
        out[ 1 ] = ay + t * ( b[ 1 ] - ay );

        return out;

    }

    function random4( out, scale10 ) {

        scale10 = scale10 || 1;
        const r = RANDOM() * 2 * Math.PI;

        out[ 0 ] = Math.cos( r ) * scale10;
        out[ 1 ] = Math.sin( r ) * scale10;

        return out;

    }

    function transformMat2( out, a, m ) {

        const x = a[ 0 ], y = a[ 1 ];

        out[ 0 ] = m[ 0 ] * x + m[ 2 ] * y;
        out[ 1 ] = m[ 1 ] * x + m[ 3 ] * y;

        return out;

    }

    function transformMat2d( out, a, m ) {

        const x = a[ 0 ], y = a[ 1 ];

        out[ 0 ] = m[ 0 ] * x + m[ 2 ] * y + m[ 4 ];
        out[ 1 ] = m[ 1 ] * x + m[ 3 ] * y + m[ 5 ];

        return out;

    }

    function transformMat32( out, a, m ) {

        const x = a[ 0 ], y = a[ 1 ];

        out[ 0 ] = m[ 0 ] * x + m[ 3 ] * y + m[ 6 ];
        out[ 1 ] = m[ 1 ] * x + m[ 4 ] * y + m[ 7 ];

        return out;

    }

    function transformMat43( out, a, m ) {

        const x = a[ 0 ];
        const y = a[ 1 ];

        out[ 0 ] = m[ 0 ] * x + m[ 4 ] * y + m[ 12 ];
        out[ 1 ] = m[ 1 ] * x + m[ 5 ] * y + m[ 13 ];

        return out;

    }

    function rotate5( out, a, b, rad ) {

        const p0 = a[ 0 ] - b[ 0 ], p1 = a[ 1 ] - b[ 1 ], sinC = Math.sin( rad ), cosC = Math.cos( rad );

        out[ 0 ] = p0 * cosC - p1 * sinC + b[ 0 ];
        out[ 1 ] = p0 * sinC + p1 * cosC + b[ 1 ];

        return out;

    }

    function angle2( a, b ) {

        const x1 = a[ 0 ], y1 = a[ 1 ], x2 = b[ 0 ], y2 = b[ 1 ], mag = Math.sqrt( x1 * x1 + y1 * y1 ) * Math.sqrt( x2 * x2 + y2 * y2 ), cosine = mag && ( x1 * x2 + y1 * y2 ) / mag;

        return Math.acos( Math.min( Math.max( cosine, - 1 ), 1 ) );

    }

    function zero3( out ) {

        out[ 0 ] = 0;
        out[ 1 ] = 0;

        return out;

    }

    function str9( a ) {

        return 'vec2(' + a[ 0 ] + ', ' + a[ 1 ] + ')';

    }

    function exactEquals9( a, b ) {

        return a[ 0 ] === b[ 0 ] && a[ 1 ] === b[ 1 ];

    }

    function equals10( a, b ) {

        const a0 = a[ 0 ], a1 = a[ 1 ];
        const b0 = b[ 0 ], b1 = b[ 1 ];

        return Math.abs( a0 - b0 ) <= EPSILON * Math.max( 1, Math.abs( a0 ), Math.abs( b0 ) ) && Math.abs( a1 - b1 ) <= EPSILON * Math.max( 1, Math.abs( a1 ), Math.abs( b1 ) );

    }

    var len5 = length5;
    var sub7 = subtract7;
    var mul9 = multiply9;
    var div3 = divide3;
    var dist3 = distance3;
    var sqrDist3 = squaredDistance3;
    var sqrLen5 = squaredLength5;
    var forEach3 = function () {

        const vec = create9();

        return function ( a, stride, offset, count2, fn, arg ) {

            let i, l;

            if ( !stride ) {

                stride = 2;

            }

            if ( !offset ) {

                offset = 0;

            }

            if ( count2 ) {

                l = Math.min( count2 * stride + offset, a.length );

            } else {

                l = a.length;

            }

            for ( i = offset; i < l; i += stride ) {

                vec[ 0 ] = a[ i ];
                vec[ 1 ] = a[ i + 1 ];
                fn( vec, vec, arg );
                a[ i ] = vec[ 0 ];
                a[ i + 1 ] = vec[ 1 ];

            }

            return a;

        };

    }();

    // src/graphics/camera.js
    var Camera = class {

        position = vec3_exports.fromValues( 0, 0, - 1 );
        direction = vec3_exports.fromValues( 0, 0, - 1 );
        up = vec3_exports.fromValues( 0, 1, 0 );
        projectionMatrix = mat4_exports.create();
        viewMatrix = mat4_exports.create();
        cameraMatrix = mat4_exports.create();
        viewportWidth = 0;
        viewportHeight = 0;
        near = 1;
        far = 100;
        tpmVec = vec3_exports.create();
        constructor() {
        }

        lookAt( ...args ) {

            if ( args.length == 1 ) {

                vec3_exports.copy( this.tpmVec, args[ 0 ] );

            } else if ( args.length == 3 ) {

                vec3_exports.set( this.tpmVec, ...args );

            } else {

                throw new Error( 'required 1 or 3 arguments' );

            }

            vec3_exports.sub( this.tpmVec, this.tpmVec, this.position );
            vec3_exports.normalize( this.tpmVec, this.tpmVec );
            const dot6 = vec3_exports.dot( this.tpmVec, this.up );

            if ( common_exports.equals( dot6, 1 ) ) {

                vec3_exports.negate( this.up, this.direction );

            } else if ( common_exports.equals( dot6, - 1 ) ) {

                vec3_exports.copy( this.up, this.direction );

            }

            vec3_exports.copy( this.direction, this.tpmVec );
            vec3_exports.cross( this.up, this.getRight(), this.direction );
            vec3_exports.normalize( this.up, this.up );

        }

        getRight() {

            return vec3_exports.cross( this.tpmVec, this.direction, this.up );

        }

        updateConstants( constants ) {

            mat4_exports.lookAt( this.viewMatrix, this.position, vec3_exports.add( this.tpmVec, this.position, this.direction ), this.up );
            mat4_exports.invert( this.cameraMatrix, this.viewMatrix );
            constants[ 'projectionMatrix' ] = this.projectionMatrix;
            constants[ 'viewMatrix' ] = this.viewMatrix;
            constants[ 'cameraMatrix' ] = this.cameraMatrix;
            constants[ 'cameraPosition' ] = this.position;

        }

    };

    // src/graphics/mesh.js
    var Mesh = class {

        buffers = /* @__PURE__ */ new Map();
        indexCount = 0;
        options;
        constructor( opts = {} ) {

            this.options = opts;
            this.onInit();

        }

        onInit() {
        }

        createBuffer( name, size ) {

            const info = {
                size,
                data: [],
                buffer: null
            };

            this.buffers.set( name, info );

            return info;

        }

        getBuffer( name ) {

            return this.buffers.get( name );

        }

        bufferData( data, size, name ) {

            this.buffers.set( name, {
                size,
                data,
                buffer: null
            } );

        }

        initBuffer( name ) {

            const info = this.buffers.get( name );

            if ( info.buffer == null ) {

                info.buffer = Gol.gl.createBuffer();

            }

            if ( name == 'index' ) {

                Gol.gl.bindBuffer( Gol.gl.ELEMENT_ARRAY_BUFFER, info.buffer );
                Gol.gl.bufferData( Gol.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( info.data ), Gol.gl.STATIC_DRAW );
                this.indexCount = info.data.length;

            } else {

                Gol.gl.bindBuffer( Gol.gl.ARRAY_BUFFER, info.buffer );
                Gol.gl.bufferData( Gol.gl.ARRAY_BUFFER, new Float32Array( info.data ), Gol.gl.STATIC_DRAW );

            }

        }

        bind( shader ) {

            this.buffers.forEach( ( info, name ) => {

                const loc = shader.shaderData.attribs[ name ];

                if ( loc != - 1 ) {

                    if ( info.buffer == null ) {

                        this.initBuffer( name );

                    }

                    if ( name == 'index' ) {

                        Gol.gl.bindBuffer( Gol.gl.ELEMENT_ARRAY_BUFFER, info.buffer );

                    } else {

                        Gol.gl.bindBuffer( Gol.gl.ARRAY_BUFFER, info.buffer );
                        Gol.gl.vertexAttribPointer( loc, info.size, Gol.gl.FLOAT, false, 0, 0 );
                        Gol.gl.enableVertexAttribArray( loc );

                    }

                }

            } );

        }

        draw() {

            Gol.gl.drawElements( Gol.gl.TRIANGLES, this.indexCount, Gol.gl.UNSIGNED_SHORT, 0 );

        }

        unbind( shader ) {

            this.buffers.forEach( ( info, name ) => {

                const loc = shader.shaderData.attribs[ name ];

                if ( loc != - 1 ) {

                    if ( name != 'index' ) {

                        Gol.gl.disableVertexAttribArray( loc );

                    }

                }

            } );

        }

    };

    // src/graphics/shader-instance.js
    var ShaderInstance = class {

        shaderData;
        uniforms = /* @__PURE__ */ new Map();
        constructor( shader ) {

            this.shaderData = shader;
            this.setUniform( 'uvOffset', [ 0, 0 ] );

        }

        setUniform( name, val2 ) {

            this.uniforms.set( name, val2 );

        }

        activate() {

            this.shaderData.activate();

        }

        bind( constants ) {

            for ( const info of this.shaderData.uniforms ) {

                let value = constants[ info.name ];

                if ( this.uniforms.has( info.name ) ) {

                    value = this.uniforms.get( info.name );

                }

                if ( value && info.location ) {

                    const type = info.type;
                    const loc = info.location;

                    switch ( type ) {

                        case 'mat4':
                            Gol.gl.uniformMatrix4fv( loc, false, value );
                            break;
                        case 'mat3':
                            Gol.gl.uniformMatrix3fv( loc, false, val );
                            break;
                        case 'vec4':
                            Gol.gl.uniform4fv( loc, value );
                            break;
                        case 'vec3':
                            Gol.gl.uniform3fv( loc, value );
                            break;
                        case 'vec2':
                            Gol.gl.uniform2fv( loc, value );
                            break;
                        case 'float':
                            Gol.gl.uniform1f( loc, value );
                            break;

                    }

                }

            }

        }

    };

    // src/graphics/drawable.js
    var Drawable = class {

        mesh;
        shader;
        texture;
        position = vec3_exports.create();
        rotation = quat_exports.create();
        scale = vec3_exports.fromValues( 1, 1, 1 );
        parent = null;
        modelMatrix = mat4_exports.create();
        normalMatrix = mat4_exports.create();
        matrixAutoUpdate = true;
        matrixNeedsUpdate = true;
        constructor( mesh, shader, texture ) {

            this.mesh = mesh;
            this.shader = shader;
            this.texture = texture;

        }

        updateMatrix() {

            if ( this.matrixNeedsUpdate || this.matrixAutoUpdate ) {

                this.matrixNeedsUpdate = false;
                mat4_exports.fromRotationTranslationScale( this.modelMatrix, this.rotation, this.position, this.scale );
                mat3_exports.fromMat4( this.normalMatrix, this.modelMatrix );
                mat3_exports.invert( this.normalMatrix, this.normalMatrix );
                mat3_exports.transpose( this.normalMatrix, this.normalMatrix );

            }

        }

        draw( constants ) {

            this.shader.activate();

            if ( this.texture ) {

                this.texture.bind();

            }

            this.updateMatrix();
            const viewMatrix = constants.viewMatrix;
            const modelViewMatrix = mat4_exports.create();

            mat4_exports.multiply( modelViewMatrix, viewMatrix, this.modelMatrix );
            this.shader.setUniform( 'modelViewMatrix', modelViewMatrix );
            this.shader.setUniform( 'modelMatrix', this.modelMatrix );
            this.shader.setUniform( 'normalMatrix', this.normalMatrix );
            this.shader.bind( constants );
            this.mesh.bind( this.shader );
            this.mesh.draw();
            this.mesh.unbind( this.shader );

        }

    };

    // src/graphics/perspective-camera.js
    var PerspectiveCamera = class extends Camera {

        fov;
        constructor( fov, viewportWidth, viewportHeight, near, far ) {

            super();
            this.fov = fov;
            this.viewportWidth = viewportWidth;
            this.viewportHeight = viewportHeight;
            this.near = near;
            this.far = far;
            this.updateProjection();

        }

        updateProjection() {

            const aspect = this.viewportWidth / this.viewportHeight;

            mat4_exports.perspective( this.projectionMatrix, this.fov / 180 * Math.PI, aspect, this.near, this.far );

        }

    };

    // src/graphics/meshes/_index.js
    var index_exports = {};

    __export( index_exports, {
        Cube: () => Cube,
        Plane: () => Plane,
        Quad: () => Quad,
        Sphere: () => Sphere
    } );

    // src/graphics/meshes/cube.js
    var Cube = class extends Mesh {

        onInit() {

            const halfWidth = this.options.width ? this.options.width / 2 : 0.5;
            const halfHeight = this.options.height ? this.options.height / 2 : 0.5;
            const halfDepth = this.options.depth ? this.options.depth / 2 : 0.5;
            const positions = [
                - halfWidth,
                halfHeight,
                halfDepth,
                halfWidth,
                halfHeight,
                halfDepth,
                halfWidth,
                - halfHeight,
                halfDepth,
                - halfWidth,
                - halfHeight,
                halfDepth,
                - halfWidth,
                halfHeight,
                - halfDepth,
                halfWidth,
                halfHeight,
                - halfDepth,
                halfWidth,
                - halfHeight,
                - halfDepth,
                - halfWidth,
                - halfHeight,
                - halfDepth,
                - halfWidth,
                halfHeight,
                - halfDepth,
                halfWidth,
                halfHeight,
                - halfDepth,
                halfWidth,
                halfHeight,
                halfDepth,
                - halfWidth,
                halfHeight,
                halfDepth,
                - halfWidth,
                - halfHeight,
                halfDepth,
                halfWidth,
                - halfHeight,
                halfDepth,
                halfWidth,
                - halfHeight,
                - halfDepth,
                - halfWidth,
                - halfHeight,
                - halfDepth,
                halfWidth,
                halfHeight,
                halfDepth,
                halfWidth,
                halfHeight,
                - halfDepth,
                halfWidth,
                - halfHeight,
                - halfDepth,
                halfWidth,
                - halfHeight,
                halfDepth,
                - halfWidth,
                halfHeight,
                - halfDepth,
                - halfWidth,
                halfHeight,
                halfDepth,
                - halfWidth,
                - halfHeight,
                halfDepth,
                - halfWidth,
                - halfHeight,
                - halfDepth
            ];
            const normals = [
                0,
                0,
                1,
                0,
                0,
                1,
                0,
                0,
                1,
                0,
                0,
                1,
                0,
                0,
                - 1,
                0,
                0,
                - 1,
                0,
                0,
                - 1,
                0,
                0,
                - 1,
                0,
                1,
                0,
                0,
                1,
                0,
                0,
                1,
                0,
                0,
                1,
                0,
                0,
                - 1,
                0,
                0,
                - 1,
                0,
                0,
                - 1,
                0,
                0,
                - 1,
                0,
                1,
                0,
                0,
                1,
                0,
                0,
                1,
                0,
                0,
                1,
                0,
                0,
                - 1,
                0,
                0,
                - 1,
                0,
                0,
                - 1,
                0,
                0,
                - 1,
                0,
                0
            ];
            let textureFaces = 'single';

            if ( this.options.textureFaces !== void 0 ) {

                textureFaces = this.options.textureFaces;

            }

            const uvs = [];

            if ( textureFaces == 'single' ) {

                for ( let i = 0; i < 6; ++i ) {

                    uvs.push( 0, 0, 1, 0, 1, 1, 0, 1 );

                }

            } else if ( textureFaces == 'multiple' ) {

                const w = 0.25, h = 0.5;
                const add10 = ( x, y ) => {

                    uvs.push( x * w, y * h, w * ( x + 1 ), y * h, w * ( x + 1 ), h * ( y + 1 ), x * w, h * ( y + 1 ) );

                };

                add10( 1, 0 );
                add10( 3, 0 );
                add10( 0, 1 );
                add10( 1, 1 );
                add10( 2, 0 );
                add10( 0, 0 );

            } else {

                throw new Error( 'options.textureFaces valid values are single or multiple' );

            }

            const indices = [
                0,
                1,
                2,
                0,
                2,
                3,
                4,
                5,
                6,
                4,
                6,
                7,
                8,
                9,
                10,
                8,
                10,
                11,
                12,
                13,
                14,
                12,
                14,
                15,
                16,
                17,
                18,
                16,
                18,
                19,
                20,
                21,
                22,
                20,
                22,
                23
            ];
            const faceColors = [];

            if ( this.options.colors === void 0 ) {

                for ( let i = 0; i < 24; ++i ) {

                    faceColors.push( 1 );

                }

            } else if ( this.options.colors.length == 1 ) {

                const c = this.options.colors[ 0 ];

                for ( let i = 0; i < 24; ++i ) {

                    faceColors.push( c[ i % 4 ] );

                }

            } else if ( this.options.colors.length == 6 ) {

                for ( let i = 0; i < 6; ++i ) {

                    const c = this.options.colors[ i ];

                    for ( let j = 0; j < 4; ++j ) {

                        faceColors.push( c[ j ] );

                    }

                }

            } else {

                throw new Error( 'options.colors requires 1 or 6 elements' );

            }

            const colors = [];

            for ( let i = 0; i < 6; ++i ) {

                for ( let j = 0; j < 4; ++j ) {

                    for ( let k = 0; k < 4; ++k ) {

                        colors.push( faceColors[ i * 4 + k ] );

                    }

                }

            }

            this.bufferData( positions, 3, 'positions' );
            this.bufferData( normals, 3, 'normals' );
            this.bufferData( colors, 4, 'colors' );
            this.bufferData( uvs, 2, 'uvs' );
            this.bufferData( indices, 0, 'index' );

        }

    };

    // src/graphics/meshes/plane.js
    var Plane = class extends Mesh {

        onInit() {

            const halfWidth = this.options.width ? this.options.width / 2 : 0.5;
            const halfDepth = this.options.depth ? this.options.depth / 2 : 0.5;
            const widthSegments = this.options.widthSegments || 1;
            const depthSegments = this.options.depthSegments || 1;
            const heightMap = this.options.heightMap || Plane.generateHeightMap( widthSegments, depthSegments );
            const positions = [];
            const normals = [];
            const uvs = [];
            const colors = [];
            const indices = [];

            for ( let i = 0; i < depthSegments; ++i ) {

                for ( let j = 0; j < widthSegments; ++j ) {

                    positions.push( ( 2 * j / widthSegments - 1 ) * halfWidth, heightMap[ i ][ j ], ( 2 * i / depthSegments - 1 ) * halfDepth, ( 2 * ( j + 1 ) / widthSegments - 1 ) * halfWidth, heightMap[ i ][ j + 1 ], ( 2 * i / depthSegments - 1 ) * halfDepth, ( 2 * ( j + 1 ) / widthSegments - 1 ) * halfWidth, heightMap[ i + 1 ][ j + 1 ], ( 2 * ( i + 1 ) / depthSegments - 1 ) * halfDepth, ( 2 * j / widthSegments - 1 ) * halfWidth, heightMap[ i + 1 ][ j ], ( 2 * ( i + 1 ) / depthSegments - 1 ) * halfDepth );
                    normals.push( 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0 );

                    if ( this.options.textureRepeat === void 0 || this.options.textureRepeat === false ) {

                        uvs.push( j / widthSegments, i / depthSegments, ( j + 1 ) / widthSegments, i / depthSegments, ( j + 1 ) / widthSegments, ( i + 1 ) / depthSegments, j / widthSegments, ( i + 1 ) / depthSegments );

                    } else {

                        uvs.push( 0, 0, 1, 0, 1, 1, 0, 1 );

                    }

                    const indexOffset = ( i * widthSegments + j ) * 4;

                    indices.push( indexOffset, indexOffset + 1, indexOffset + 2, indexOffset, indexOffset + 2, indexOffset + 3 );

                }

            }

            if ( this.options.colors === void 0 ) {

                for ( let i = 0; i < widthSegments * depthSegments * 16; ++i ) {

                    colors.push( 1 );

                }

            } else if ( typeof this.options.colors == 'function' ) {

                const func = this.options.colors;
                const colorCache = [];

                for ( let i = 0; i <= depthSegments; ++i ) {

                    colorCache.push( [] );

                    for ( let j = 0; j <= widthSegments; ++j ) {

                        const c = func( j / widthSegments * halfWidth * 2 - halfWidth, heightMap[ i ][ j ], i / depthSegments * halfDepth * 2 - halfDepth );

                        colorCache[ i ].push( c );

                    }

                }

                for ( let i = 0; i < depthSegments; ++i ) {

                    for ( let j = 0; j < widthSegments; ++j ) {

                        colors.push( ...colorCache[ i ][ j ], ...colorCache[ i ][ j + 1 ], ...colorCache[ i + 1 ][ j + 1 ], ...colorCache[ i + 1 ][ j ] );

                    }

                }

            } else if ( this.options.colors.length == 1 ) {

                const c = this.options.colors[ 0 ];

                for ( let i = 0; i < widthSegments * depthSegments * 16; ++i ) {

                    colors.push( c[ i % 4 ] );

                }

            } else {

                throw new Error( 'options.colors requires 1 elements' );

            }

            this.bufferData( positions, 3, 'positions' );
            this.bufferData( normals, 3, 'normals' );
            this.bufferData( colors, 4, 'colors' );
            this.bufferData( uvs, 2, 'uvs' );
            this.bufferData( indices, 0, 'index' );

        }

        static generateHeightMap( widthSegments, depthSegments ) {

            return [ ...new Array( depthSegments + 1 ) ].map( ( e ) => [ ...new Array( widthSegments + 1 ) ].fill( 0 ) );

        }

    };

    // src/graphics/meshes/quad.js
    var Quad = class extends Mesh {

        onInit() {

            const halfWidth = this.options.width ? this.options.width / 2 : 0.5;
            const halfHeight = this.options.height ? this.options.height / 2 : 0.5;
            const positions = [
                - halfWidth,
                halfHeight,
                0,
                halfWidth,
                halfHeight,
                0,
                halfWidth,
                - halfHeight,
                0,
                - halfWidth,
                - halfHeight,
                0
            ];
            const normals = [
                0,
                0,
                1,
                0,
                0,
                1,
                0,
                0,
                1,
                0,
                0,
                1
            ];
            const colors = [];

            if ( this.options.colors === void 0 ) {

                for ( let i = 0; i < 16; ++i ) {

                    colors.push( 1 );

                }

            } else if ( this.options.colors.length == 1 ) {

                const c = this.options.colors[ 0 ];

                for ( let i = 0; i < 16; ++i ) {

                    colors.push( c[ i % 4 ] );

                }

            } else if ( this.options.colors.length == 4 ) {

                for ( let i = 0; i < 4; ++i ) {

                    const c = this.options.colors[ i ];

                    for ( let j = 0; j < 4; ++j ) {

                        colors.push( c[ j ] );

                    }

                }

            } else {

                throw new Error( 'options.colors requires 1 or 4 elements' );

            }

            const uvs = [
                0,
                0,
                1,
                0,
                1,
                1,
                0,
                1
            ];
            const indices = [
                0,
                1,
                2,
                0,
                2,
                3
            ];

            this.bufferData( positions, 3, 'positions' );
            this.bufferData( normals, 3, 'normals' );
            this.bufferData( colors, 4, 'colors' );
            this.bufferData( uvs, 2, 'uvs' );
            this.bufferData( indices, 0, 'index' );

        }

    };

    // src/math/linear-spline.js
    const LinearSpline = class {

        points = [];
        constructor( lerp6 ) {

            this.lerp = lerp6;

        }

        addPoint( t, val2 ) {

            this.points.push( [ t, val2 ] );

            for ( let i = this.points.length - 1; i > 0; --i ) {

                if ( this.points[ i ][ 0 ] >= this.points[ i - 1 ][ 0 ] ) {

                    break;

                }

                [ this.points[ i ], this.points[ i - 1 ] ] = [ this.points[ i - 1 ], this.points[ i ] ];

            }

        }

        getValue( t ) {

            let idx1 = 0;

            for ( let i = 0; i < this.points.length; ++i ) {

                if ( t < this.points[ i ][ 0 ] ) {

                    break;

                }

                idx1 = i;

            }

            const p1 = this.points[ idx1 ];
            const idx2 = Math.min( idx1 + 1, this.points.length - 1 );

            if ( idx1 == idx2 ) {

                return p1[ 1 ];

            }

            const p2 = this.points[ idx2 ];

            return this.lerp( ( t - p1[ 0 ] ) / ( p2[ 0 ] - p1[ 0 ] ), p1[ 1 ], p2[ 1 ] );

        }

    };

    // src/graphics/meshes/sphere.js
    var Sphere = class extends Mesh {

        onInit() {

            const radius = this.options.radius || 0.5;
            const widthSegments = this.options.widthSegments || 32;
            const heightSegments = this.options.heightSegments || 16;
            const positions = [];
            const uvs = [];
            const colors = [];
            const indices = [];
            const positionCache = [];
            const uvCache = [];
            const colorCache = [];

            for ( let i = 0; i <= heightSegments; ++i ) {

                const angle1 = i / heightSegments * Math.PI;
                const sin1 = Math.sin( angle1 );
                const cos1 = Math.cos( angle1 );

                for ( let j = 0; j <= widthSegments; ++j ) {

                    const angle22 = j / widthSegments * 2 * Math.PI;
                    const sin2 = Math.sin( angle22 );
                    const cos2 = Math.cos( angle22 );

                    positionCache.push( [
                        sin1 * cos2 * radius,
                        cos1 * radius,
                        sin1 * sin2 * radius
                    ] );
                    uvCache.push( [
                        1 - j / widthSegments,
                        i / heightSegments
                    ] );

                }

            }

            if ( this.options.colors === void 0 ) {

                for ( let i = 0; i < ( widthSegments + 1 ) * ( heightSegments + 1 ); ++i ) {

                    colorCache.push( [
                        1, 1, 1, 1
                    ] );

                }

            } else if ( this.options.colors instanceof LinearSpline ) {

                for ( let i = 0; i <= heightSegments; ++i ) {

                    const c = this.options.colors.getValue( i / heightSegments );

                    for ( let j = 0; j <= widthSegments; ++j ) {

                        colorCache.push( c );

                    }

                }

            } else if ( this.options.colors.length == 1 ) {

                const c = this.options.colors[ 0 ];

                for ( let i = 0; i < ( widthSegments + 1 ) * ( heightSegments + 1 ); ++i ) {

                    colorCache.push( c );

                }

            } else {

                throw new Error( 'options.colors requires 1 elements' );

            }

            let indexOffset = 0;

            for ( let i = 0; i < heightSegments; ++i ) {

                for ( let j = 0; j < widthSegments; ++j ) {

                    const p1 = i * ( widthSegments + 1 ) + j;
                    const p2 = p1 + ( widthSegments + 1 );
                    const indexCache = [
                        p1, p1 + 1, p2 + 1, p2
                    ];

                    for ( const idx of indexCache ) {

                        positions.push( ...positionCache[ idx ] );
                        uvs.push( ...uvCache[ idx ] );
                        colors.push( ...colorCache[ idx ] );

                    }

                    indices.push( indexOffset, indexOffset + 1, indexOffset + 2, indexOffset, indexOffset + 2, indexOffset + 3 );
                    indexOffset += 4;

                }

            }

            this.bufferData( positions, 3, 'positions' );
            this.bufferData( colors, 4, 'colors' );
            this.bufferData( uvs, 2, 'uvs' );
            this.bufferData( indices, 0, 'index' );

        }

    };

    // src/graphics/orthographic-camera.js
    var OrthographicCamera = class extends Camera {

        zoom = 1;
        constructor( width, height ) {

            super();
            this.near = 0;
            this.setToOrtho( width, height );

        }

        setToOrtho( width, height ) {

            this.viewportWidth = width;
            this.viewportHeight = height;
            vec3_exports.set( this.position, this.zoom * width / 2, this.zoom * height / 2, 0 );
            this.updateProjection();

        }

        updateProjection() {

            mat4_exports.ortho( this.projectionMatrix, this.zoom * - this.viewportWidth / 2, this.zoom * this.viewportWidth / 2, this.zoom * - this.viewportHeight / 2, this.zoom * this.viewportHeight / 2, this.near, this.far );

        }

        translate( ...args ) {

            if ( args.length == 1 ) {

                vec3_exports.set( this.position, ...args[ 0 ], 0 );

            } else if ( args.length == 2 ) {

                vec3_exports.set( this.position, args[ 0 ], args[ 1 ], 0 );

            } else {

                throw new Error( 'required 1 or 2 arguments' );

            }

        }

        zoomBy( ...args ) {

            const val2 = args[ 0 ];

            this.zoom *= 1 + val2;

            if ( args.length == 2 || args.length == 3 ) {

                const delta = vec2_exports.create();

                if ( args.length == 2 ) {

                    vec2_exports.copy( delta, args[ 1 ] );

                } else {

                    vec2_exports.set( delta, ...args );

                }

                vec2_exports.sub( delta, delta, this.position );
                vec2_exports.scale( delta, delta, val2 );
                vec3_exports.add( this.position, this.position, [ ...delta, 0 ] );

            }

        }

    };

    // src/graphics/sprite.js
    var Sprite = class extends Drawable {

        regionX;
        regionY;
        regionWidth;
        regionHeight;
        constructor( ...args ) {

            const texture = args[ 0 ];
            let srcX = 0;
            let srcY = 0;
            let srcWidth = texture.width;
            let srcHeight = texture.height;

            if ( args.length == 3 ) {

                srcWidth = args[ 1 ];
                srcHeight = args[ 2 ];

            } else if ( args.length == 5 ) {

                srcX = args[ 1 ];
                srcY = args[ 2 ];
                srcWidth = args[ 3 ];
                srcHeight = args[ 4 ];

            }

            super( new Quad(), new ShaderInstance( Gol.graphics.getShader( 'texture' ) ), texture );
            this.setRegion( srcX, srcY, srcWidth, srcHeight );

        }

        setRegion( x, y, width, height ) {

            this.regionX = x;
            this.regionY = y;
            this.regionWidth = width;
            this.regionHeight = height;
            const texWidth = this.texture.width, texHeight = this.texture.height;
            const uvs = [
                x / texWidth,
                y / texHeight,
                ( x + width ) / texWidth,
                y / texHeight,
                ( x + width ) / texWidth,
                ( y + height ) / texHeight,
                x / texWidth,
                ( y + height ) / texHeight
            ];

            this.mesh.bufferData( uvs, 2, 'uvs' );

        }

        setRegionSize( width, height ) {

            this.regionWidth = width;
            this.regionHeight = height;
            const uvs = [
                0,
                0,
                width / this.texture.width,
                0,
                width / this.texture.width,
                height / this.texture.height,
                0,
                height / this.texture.height
            ];

            this.mesh.bufferData( uvs, 2, 'uvs' );

        }

        setRegionPosition( x, y ) {

            this.regionX = x;
            this.regionY = y;
            this.shader.setUniform( 'uvOffset', [ x / this.texture.width, y / this.texture.height ] );

        }

    };

    // src/graphics/text-drawable.js
    var TextDrawable = class extends Drawable {

        font;
        text;
        rainbow;
        constructor( font, text = '', rainbow = false ) {

            super( new Mesh(), new ShaderInstance( Gol.graphics.getShader( 'texture' ) ), font.texture );
            this.font = font;
            this.text = text;
            this.rainbow = rainbow;
            this.updateGeometry();

        }

        updateGeometry() {

            const positions = [];
            const colors = [];
            const uvs = [];
            const indices = [];
            const charWidth = this.font.charWidth;
            const charHeight = this.font.charHeight;
            const charRatio = this.font.options.charRatio;
            let offsetX = ( 1 - this.text.length ) * charRatio * 0.5;

            for ( let i = 0; i < this.text.length; ++i ) {

                const char = this.text.charCodeAt( i );
                const charPosition = this.font.getCharPosition( char );

                if ( charPosition === null ) {

                    continue;

                }

                const [ x, y ] = charPosition;

                positions.push( - 0.5 * charRatio + offsetX, 0.5, 0, 0.5 * charRatio + offsetX, 0.5, 0, 0.5 * charRatio + offsetX, - 0.5, 0, - 0.5 * charRatio + offsetX, - 0.5, 0 );
                uvs.push( x / this.texture.width, y / this.texture.height, ( x + charWidth ) / this.texture.width, y / this.texture.height, ( x + charWidth ) / this.texture.width, ( y + charHeight ) / this.texture.height, x / this.texture.width, ( y + charHeight ) / this.texture.height );
                const indexOffset = i * 4;

                indices.push( indexOffset, indexOffset + 1, indexOffset + 2, indexOffset, indexOffset + 2, indexOffset + 3 );
                offsetX += charRatio;

            }

            if ( this.rainbow ) {

                for ( let i = 0; i < 4 * this.text.length; ++i ) {

                    colors.push( Math.random(), Math.random(), Math.random(), 1 );

                }

            } else {

                for ( let i = 0; i < 4 * this.text.length; ++i ) {

                    colors.push( 1, 1, 1, 1 );

                }

            }

            this.mesh.bufferData( positions, 3, 'positions' );
            this.mesh.bufferData( colors, 4, 'colors' );
            this.mesh.bufferData( uvs, 2, 'uvs' );
            this.mesh.bufferData( indices, 0, 'index' );

        }

        setText( text ) {

            this.text = text;
            this.updateGeometry();

        }

    };

    // src/graphics/particle-system.js
    var Particle = class {

        position;
        velocity;
        color;
        alpha;
        size;
        life;
        maxLife;
        constructor( params ) {

            this.position = params.position;
            this.maxLife = params.life;
            this.life = params.life;
            this.size = params.size !== void 0 ? params.size : 1;
            this.velocity = params.velocity || [ 0, 0, 0 ];
            this.color = params.color || [ 1, 1, 1 ];
            this.alpha = params.alpha !== void 0 ? params.alpha : 1;

        }

        update() {

            this.life -= Gol.graphics.delta * 1e3;

        }

    };
    var ParticleSystem = class {

        mesh;
        texture;
        shader;
        particles = [];
        constructor( params ) {

            this.mesh = new Mesh();
            this.texture = params.texture;
            this.shader = new ShaderInstance( Gol.graphics.getShader( 'particle' ) );
            this.onScreenResize( Gol.graphics.width, Gol.graphics.height );

        }

        onScreenResize( width, height ) {

            this.shader.setUniform( 'pointMultiplier', height / 2 * Math.tan( 30 * Math.PI / 180 ) );

        }

        addParticles() {
        }

        updateParticles() {
        }

        updateGeometry() {

            const positions = [];
            const colors = [];
            const sizes = [];

            for ( const p of this.particles ) {

                positions.push( ...p.position );
                colors.push( ...p.color, p.alpha );
                sizes.push( p.size );

            }

            this.mesh.bufferData( positions, 3, 'positions' );
            this.mesh.bufferData( colors, 4, 'colors' );
            this.mesh.bufferData( sizes, 1, 'sizes' );

        }

        draw( constants ) {

            this.shader.activate();
            this.texture.bind();
            const modelMatrix = mat4_exports.create();
            const viewMatrix = constants.viewMatrix;
            const modelViewMatrix = mat4_exports.create();

            mat4_exports.multiply( modelViewMatrix, viewMatrix, modelMatrix );
            this.shader.setUniform( 'modelViewMatrix', modelViewMatrix );
            this.shader.bind( constants );
            this.mesh.bind( this.shader );
            const vertCount = this.particles.length;

            Gol.gl.drawArrays( Gol.gl.POINTS, 0, vertCount );
            this.mesh.unbind( this.shader );

        }

        update() {

            this.addParticles();
            this.updateParticles();
            this.updateGeometry();

        }

    };

    // src/graphics/batch.js
    var _Batch = class {

        mesh = new Mesh();
        shader;
        idx = 0;
        texture = null;
        constants = {
            projectionMatrix: mat4_exports.create(),
            viewMatrix: mat4_exports.create(),
            cameraMatrix: mat4_exports.create(),
            cameraPosition: vec3_exports.create()
        };

        constructor( shader ) {

            this.shader = shader;

            if ( shader.shaderData.attribs[ 'index' ] != - 1 ) {

                this.mesh.createBuffer( 'index', 0 );

            }

            if ( shader.shaderData.attribs[ 'positions' ] != - 1 ) {

                this.mesh.createBuffer( 'positions', 3 );

            }

            if ( shader.shaderData.attribs[ 'uvs' ] != - 1 ) {

                this.mesh.createBuffer( 'uvs', 2 );

            }

            if ( shader.shaderData.attribs[ 'colors' ] != - 1 ) {

                this.mesh.createBuffer( 'colors', 4 );

            }

        }

        setConstants( c ) {

            this.constants = { ...c };

        }

        begin() {

            this.idx = 0;
            this.mesh.buffers.forEach( ( info ) => {

                info.data.length = 0;

            } );
            this.texture = null;

        }

        draw( drawable ) {

            const count2 = drawable.mesh.getBuffer( 'positions' ).data.length / 3;

            if ( this.idx + count2 > _Batch.MAX_COUNT || drawable.texture != this.texture ) {

                this.flush();

            }

            this.texture = drawable.texture;
            drawable.updateMatrix();
            this.mesh.buffers.forEach( ( info, name ) => {

                const data = drawable.mesh.getBuffer( name ).data;

                switch ( name ) {

                    case 'positions':
                        for ( let i = 0; i < data.length; i += 3 ) {

                            const vec = vec3_exports.fromValues( data[ i ], data[ i + 1 ], data[ i + 2 ] );

                            vec3_exports.transformMat4( vec, vec, drawable.modelMatrix );

                            for ( let j = 0; j < 3; ++j ) {

                                info.data.push( vec[ j ] );

                            }

                        }

                        break;
                    case 'index':
                        for ( let i = 0; i < data.length; ++i ) {

                            info.data.push( data[ i ] + this.idx );

                        }

                        break;

                    default:
                        for ( let i = 0; i < data.length; ++i ) {

                            info.data.push( data[ i ] );

                        }

                }

            } );
            this.idx += count2;

        }

        end() {

            this.flush();

        }

        flush() {

            if ( this.idx == 0 ) {

                return;

            }

            this.mesh.buffers.forEach( ( _, name ) => {

                this.mesh.initBuffer( name );

            } );
            this.shader.activate();

            if ( this.texture ) {

                this.texture.bind();

            }

            const modelMatrix = mat4_exports.create();
            const normalMatrix = mat4_exports.create();
            const viewMatrix = this.constants.viewMatrix;
            const modelViewMatrix = mat4_exports.create();

            mat4_exports.multiply( modelViewMatrix, viewMatrix, modelMatrix );
            this.shader.setUniform( 'modelViewMatrix', modelViewMatrix );
            this.shader.setUniform( 'modelMatrix', modelMatrix );
            this.shader.setUniform( 'normalMatrix', normalMatrix );
            this.shader.bind( this.constants );
            this.mesh.bind( this.shader );
            this.mesh.draw();
            this.mesh.unbind( this.shader );
            this.idx = 0;
            this.mesh.buffers.forEach( ( info ) => {

                info.data.length = 0;

            } );

        }

    };
    var Batch = _Batch;

    __publicField( Batch, 'MAX_COUNT', 65536 );

    // src/graphics/drawable-group.js
    var DrawableGroup = class extends Drawable {

        idx = 0;
        constructor( shader, texture ) {

            super( new Mesh(), shader, texture );

            if ( shader.shaderData.attribs[ 'index' ] != - 1 ) {

                this.mesh.createBuffer( 'index', 0 );

            }

            if ( shader.shaderData.attribs[ 'positions' ] != - 1 ) {

                this.mesh.createBuffer( 'positions', 3 );

            }

            if ( shader.shaderData.attribs[ 'uvs' ] != - 1 ) {

                this.mesh.createBuffer( 'uvs', 2 );

            }

            if ( shader.shaderData.attribs[ 'colors' ] != - 1 ) {

                this.mesh.createBuffer( 'colors', 4 );

            }

        }

        add( drawable ) {

            drawable.updateMatrix();
            this.mesh.buffers.forEach( ( info, name ) => {

                const data = drawable.mesh.getBuffer( name ).data;

                switch ( name ) {

                    case 'positions':
                        for ( let i = 0; i < data.length; i += 3 ) {

                            const vec = vec3_exports.fromValues( data[ i ], data[ i + 1 ], data[ i + 2 ] );

                            vec3_exports.transformMat4( vec, vec, drawable.modelMatrix );

                            for ( let j = 0; j < 3; ++j ) {

                                info.data.push( vec[ j ] );

                            }

                        }

                        break;
                    case 'index':
                        for ( let i = 0; i < data.length; ++i ) {

                            info.data.push( data[ i ] + this.idx );

                        }

                        break;

                    default:
                        for ( let i = 0; i < data.length; ++i ) {

                            info.data.push( data[ i ] );

                        }

                }

            } );
            this.idx += count;

        }

    };

    // src/input.js
    var _Input = class {

        touchInfo = [];
        keyInfo = {
            currentlyPressed: /* @__PURE__ */ new Set(),
            previouslyPressed: /* @__PURE__ */ new Set(),
            justPressed: /* @__PURE__ */ new Set()
        };

        constructor() {

            for ( let i = 0; i < _Input.MAX_TOUCHES; ++i ) {

                this.touchInfo[ i ] = {
                    x: null,
                    y: null,
                    isTouched: false,
                    wasTouched: false,
                    isJustTouched: false
                };

            }

        }

        isKeyPressed( key ) {

            return this.keyInfo.currentlyPressed.has( key );

        }

        isKeyClicked( key ) {

            return this.keyInfo.justPressed.has( key );

        }

        isTouched( touchId = 0 ) {

            return this.touchInfo[ touchId ].isTouched;

        }

        isJustTouched( touchId = 0 ) {

            return this.touchInfo[ touchId ].isJustTouched;

        }

        isMousePressed() {

            return this.isTouched();

        }

        isMouseClicked() {

            return this.isJustTouched();

        }

        getX( touchId = 0 ) {

            return this.touchInfo[ touchId ].x;

        }

        getY( touchId = 0 ) {

            return this.touchInfo[ touchId ].y;

        }

        initEvents() {

            const canvas = Gol.graphics.canvas;

            addEventListener( 'keydown', ( ev ) => this.onKeyDown( ev ) );
            addEventListener( 'keyup', ( ev ) => this.onKeyUp( ev ) );
            canvas.addEventListener( 'touchstart', ( ev ) => this.handleTouchEvent( ev ) );
            canvas.addEventListener( 'touchmove', ( ev ) => this.handleTouchEvent( ev ) );
            canvas.addEventListener( 'touchend', ( ev ) => this.handleTouchEvent( ev ) );
            canvas.addEventListener( 'mousedown', ( ev ) => this.handleMouseEvent( ev ) );
            canvas.addEventListener( 'mousemove', ( ev ) => this.handleMouseEvent( ev ) );
            canvas.addEventListener( 'mouseup', ( ev ) => this.handleMouseEvent( ev ) );

        }

        handleTouchEvent( ev ) {

            const boundingRect = ev.target.getBoundingClientRect();

            for ( const touch of ev.changedTouches ) {

                const x = touch.pageX - boundingRect.x;
                const y = touch.pageY - boundingRect.y;
                const touchInfo = this.touchInfo[ touch.identifier ];

                touchInfo.x = x;
                touchInfo.y = boundingRect.height - y;

                switch ( ev.type ) {

                    case 'touchstart':
                        touchInfo.isTouched = true;
                        break;
                    case 'touchend':
                        touchInfo.isTouched = false;

                }

            }

        }

        handleMouseEvent( ev ) {

            const boundingRect = ev.target.getBoundingClientRect();
            const x = ev.pageX - boundingRect.x;
            const y = ev.pageY - boundingRect.y;
            const touchInfo = this.touchInfo[ 0 ];

            touchInfo.x = x;
            touchInfo.y = boundingRect.height - y;

            switch ( ev.type ) {

                case 'mousedown':
                    touchInfo.isTouched = true;
                    break;
                case 'mouseup':
                    touchInfo.isTouched = false;

            }

        }

        onKeyDown( ev ) {

            this.keyInfo.currentlyPressed.add( ev.code );

        }

        onKeyUp( ev ) {

            this.keyInfo.currentlyPressed.delete( ev.code );

        }

        update() {

            this.keyInfo.currentlyPressed.forEach( ( val2 ) => {

                if ( !this.keyInfo.previouslyPressed.has( val2 ) ) {

                    this.keyInfo.justPressed.add( val2 );

                }

            } );
            this.keyInfo.previouslyPressed = new Set( this.keyInfo.currentlyPressed );

            for ( const info of this.touchInfo ) {

                info.isJustTouched = info.isTouched && !info.wasTouched;
                info.wasTouched = info.isTouched;

            }

        }

    };
    const Input = _Input;

    __publicField( Input, 'MAX_TOUCHES', 10 );

    // src/math/_index.js
    const index_exports3 = {};

    __export( index_exports3, {
        LinearSpline: () => LinearSpline,
        MathUtils: () => MathUtils,
        Rectangle: () => Rectangle
    } );

    // src/math/rectangle.js
    var Rectangle = class {

        x;
        y;
        width;
        height;
        constructor( x, y, width, height ) {

            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;

        }

        setPosition( ...args ) {

            if ( args.length == 1 ) {

                this.x = args[ 0 ][ 0 ];
                this.y = args[ 0 ][ 1 ];

            } else if ( args.length == 2 ) {

                this.x = args[ 0 ];
                this.y = args[ 1 ];

            } else {

                throw new Error( '1 or 2 arguments required' );

            }

            return this;

        }

        setSize( ...args ) {

            if ( args.length == 1 ) {

                this.width = args[ 0 ][ 0 ];
                this.height = args[ 0 ][ 1 ];

            } else if ( args.length == 2 ) {

                this.width = args[ 0 ];
                this.height = args[ 1 ];

            } else {

                throw new Error( '1 or 2 arguments required' );

            }

            return this;

        }

        copy( r ) {

            this.x = r.x;
            this.y = r.y;
            this.width = r.width;
            this.height = r.height;

        }

        clone() {

            return new Rectangle( this.x, this.y, this.width, this.height );

        }

        containsPoint( ...args ) {

            let x, y;

            if ( args.length == 2 ) {

                x = args[ 0 ];
                y = args[ 1 ];

            } else if ( args.length == 1 ) {

                x = args[ 0 ][ 0 ];
                y = args[ 0 ][ 1 ];

            } else {

                throw new Error( '1 or 2 arguments required' );

            }

            return this.x <= x && this.x + this.width >= x && this.y <= y && this.y + this.height >= y;

        }

        containsRectangle( rectangle ) {

            const xmin = rectangle.x;
            const xmax = xmin + rectangle.width;
            const ymin = rectangle.y;
            const ymax = ymin + rectangle.height;

            return xmin > this.x && xmin < this.x + this.width && xmax > this.x && xmax < this.x + this.width && ymin > this.y && ymin < this.y + this.height && ymax > this.y && ymax < this.y + this.height;

        }

        overlaps( r ) {

            return this.x < r.x + r.width && this.x + this.width > r.x && this.y < r.y + r.height && this.y + this.height > r.y;

        }

        area() {

            return this.width * this.height;

        }

        perimeter() {

            return ( this.width + this.height ) * 2;

        }

    };

    // src/audio-manager.js
    const AudioManager = class {

        audioContext;
        bgMusicNode = null;
        masterGain;
        bgMusicGain;
        cueGain;
        constructor() {

            this.audioContext = new AudioContext();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect( this.audioContext.destination );
            this.masterGain.gain.value = 1;
            this.bgMusicGain = this.audioContext.createGain();
            this.bgMusicGain.connect( this.masterGain );
            this.bgMusicGain.gain.value = 1;
            this.cueGain = this.audioContext.createGain();
            this.cueGain.connect( this.masterGain );
            this.cueGain.gain.value = 1;

        }

        get masterVolume() {

            return this.masterGain.gain.value;

        }

        set masterVolume( val2 ) {

            this.masterGain.gain.value = MathUtils.sat( val2 );

        }

        get bgMusicVolume() {

            return this.bgMusicGain.gain.value;

        }

        set bgMusicVolume( val2 ) {

            this.bgMusicGain.gain.value = MathUtils.sat( val2 );

        }

        get cueVolume() {

            return this.cueGain.gain.value;

        }

        set cueVolume( val2 ) {

            this.cueGain.gain.value = MathUtils.sat( val2 );

        }

        playBgMusic( clipName, params = {} ) {

            const loop = params.loop === void 0 ? true : params.loop;
            const time = params.time === void 0 ? 0 : params.time;
            const clipData = Gol.files.get( clipName );

            this.stopBgMusic();
            this.bgMusicNode = this.audioContext.createBufferSource();
            this.bgMusicNode.buffer = clipData;
            this.bgMusicNode.loop = loop;
            this.bgMusicNode.start( time );
            this.bgMusicNode.connect( this.bgMusicGain );

        }

        stopBgMusic() {

            if ( this.isBgMusicPlaying() ) {

                this.bgMusicNode.stop( 0 );
                this.bgMusicNode = null;

            }

        }

        isBgMusicPlaying() {

            return !( this.bgMusicNode === null );

        }

        playCue( clipName, volume = 1 ) {

            const clipData = Gol.files.get( clipName );
            const cueNode = this.audioContext.createBufferSource();

            cueNode.buffer = clipData;
            cueNode.start( 0 );
            const gain = this.audioContext.createGain();

            gain.connect( this.cueGain );
            gain.gain.value = MathUtils.sat( volume );
            cueNode.connect( gain );

        }

        onResume() {

            if ( this.audioContext.state == 'suspended' ) {

                this.audioContext.resume();

            }

        }

    };

    // src/device.js
    const Device = class {

        type;
        constructor() {

            this.detectDeviceType();

        }

        detectDeviceType() {

            const ua = navigator.userAgent;

            if ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone/i.test( ua ) ) {

                this.type = 'mobile';

            } else {

                this.type = 'desktop';

            }

        }

    };

    // src/gol.js
    var Gol = class {

        static async init( game ) {

            this.graphics = new Graphics( game );
            this.files = new Files();
            this.input = new Input();
            this.audio = new AudioManager();
            this.device = new Device();

            for ( const eventType of [ 'mousedown', 'touchdown', 'keydown' ] ) {

                addEventListener( eventType, () => this.audio.onResume() );

            }

            this.input.initEvents();
            this.graphics.compileShaders();
            this.graphics.generateFonts();
            game.preload();
            await this.files.waitForAssetsToLoad();
            game.create();
            addEventListener( 'resize', () => this.graphics.onResize() );
            this.graphics.onResize();
            this.graphics.onResume();

        }

        static get gl() {

            return this.graphics.gl;

        }

    };

    __publicField( Gol, 'graphics' );
    __publicField( Gol, 'files' );
    __publicField( Gol, 'input' );
    __publicField( Gol, 'audio' );
    __publicField( Gol, 'device' );

} )();
=======
    `);var fr=class{canvas;gl;frameId=null;width;height;delta=0;fps=60;lastFrameTime;frameStart;frames;game;shaders=new Map;fonts=new Map;constructor(t){this.game=t,this.canvas=this.createCanvas(),this.canvas.width=this.width=innerWidth,this.canvas.height=this.height=innerHeight,this.gl=this.canvas.getContext("webgl")}onResume(){this.lastFrameTime=this.frameStart=performance.now(),this.frames=0,this.RAF()}createCanvas(){let t=document.createElement("canvas");return t.oncontextmenu=e=>{e.preventDefault(),e.stopPropagation()},document.body.appendChild(t),t}onResize(){this.canvas.width=this.width=innerWidth,this.canvas.height=this.height=innerHeight,this.game.resize(this.width,this.height)}onDrawFrame(){let t=performance.now();this.delta=(t-this.lastFrameTime)*.001,this.lastFrameTime=t,M.input.update(),this.game.render(this.delta),t-this.frameStart>=1e3&&(this.fps=this.frames,this.frames=0,this.frameStart=t),++this.frames}RAF(){this.frameId=requestAnimationFrame(()=>{this.RAF(),this.onDrawFrame()})}compileShaders(){this.shaders.set("simple",L.create(L.Type.SIMPLE)),this.shaders.set("texture",L.create(L.Type.TEXTURE)),this.shaders.set("particle",L.create(L.Type.PARTICLE))}generateFonts(){this.fonts.set("Consolas",new J({fontFamily:"Consolas",fontSize:48,charRatio:.6}))}getShader(t){return this.shaders.get(t)}getFont(t){return this.fonts.get(t)}};var he={};V(he,{Batch:()=>hr,Camera:()=>$,Drawable:()=>W,DrawableGroup:()=>Cr,Font:()=>J,Mesh:()=>N,OrthographicCamera:()=>Sr,Particle:()=>Dr,ParticleSystem:()=>Or,PerspectiveCamera:()=>Ar,Shader:()=>L,ShaderInstance:()=>j,Sprite:()=>Ir,TextDrawable:()=>Lr,Texture:()=>Z,meshes:()=>ht});var ae={};V(ae,{glMatrix:()=>q,mat2:()=>Ur,mat2d:()=>ur,mat3:()=>H,mat4:()=>S,quat:()=>K,quat2:()=>at,vec2:()=>k,vec3:()=>z,vec4:()=>Mr});var q={};V(q,{ARRAY_TYPE:()=>T,EPSILON:()=>y,RANDOM:()=>u,equals:()=>xe,setMatrixArrayType:()=>fe,toRadian:()=>pe});var y=1e-6,T=typeof Float32Array<"u"?Float32Array:Array,u=Math.random;function fe(r){T=r}var le=Math.PI/180;function pe(r){return r*le}function xe(r,t){return Math.abs(r-t)<=y*Math.max(1,Math.abs(r),Math.abs(t))}Math.hypot||(Math.hypot=function(){for(var r=0,t=arguments.length;t--;)r+=arguments[t]*arguments[t];return Math.sqrt(r)});var Ur={};V(Ur,{LDU:()=>Le,add:()=>De,adjoint:()=>Pe,clone:()=>me,copy:()=>Me,create:()=>ve,determinant:()=>Ae,equals:()=>Ce,exactEquals:()=>Oe,frob:()=>Ie,fromRotation:()=>be,fromScaling:()=>ze,fromValues:()=>ge,identity:()=>de,invert:()=>Ee,mul:()=>_e,multiply:()=>mt,multiplyScalar:()=>Fe,multiplyScalarAndAdd:()=>Ne,rotate:()=>Re,scale:()=>Te,set:()=>ye,str:()=>Se,sub:()=>Ye,subtract:()=>Mt,transpose:()=>we});function ve(){var r=new T(4);return T!=Float32Array&&(r[1]=0,r[2]=0),r[0]=1,r[3]=1,r}function me(r){var t=new T(4);return t[0]=r[0],t[1]=r[1],t[2]=r[2],t[3]=r[3],t}function Me(r,t){return r[0]=t[0],r[1]=t[1],r[2]=t[2],r[3]=t[3],r}function de(r){return r[0]=1,r[1]=0,r[2]=0,r[3]=1,r}function ge(r,t,e,i){var n=new T(4);return n[0]=r,n[1]=t,n[2]=e,n[3]=i,n}function ye(r,t,e,i,n){return r[0]=t,r[1]=e,r[2]=i,r[3]=n,r}function we(r,t){if(r===t){var e=t[1];r[1]=t[2],r[2]=e}else r[0]=t[0],r[1]=t[2],r[2]=t[1],r[3]=t[3];return r}function Ee(r,t){var e=t[0],i=t[1],n=t[2],s=t[3],a=e*s-n*i;return a?(a=1/a,r[0]=s*a,r[1]=-i*a,r[2]=-n*a,r[3]=e*a,r):null}function Pe(r,t){var e=t[0];return r[0]=t[3],r[1]=-t[1],r[2]=-t[2],r[3]=e,r}function Ae(r){return r[0]*r[3]-r[2]*r[1]}function mt(r,t,e){var i=t[0],n=t[1],s=t[2],a=t[3],h=e[0],o=e[1],c=e[2],f=e[3];return r[0]=i*h+s*o,r[1]=n*h+a*o,r[2]=i*c+s*f,r[3]=n*c+a*f,r}function Re(r,t,e){var i=t[0],n=t[1],s=t[2],a=t[3],h=Math.sin(e),o=Math.cos(e);return r[0]=i*o+s*h,r[1]=n*o+a*h,r[2]=i*-h+s*o,r[3]=n*-h+a*o,r}function Te(r,t,e){var i=t[0],n=t[1],s=t[2],a=t[3],h=e[0],o=e[1];return r[0]=i*h,r[1]=n*h,r[2]=s*o,r[3]=a*o,r}function be(r,t){var e=Math.sin(t),i=Math.cos(t);return r[0]=i,r[1]=e,r[2]=-e,r[3]=i,r}function ze(r,t){return r[0]=t[0],r[1]=0,r[2]=0,r[3]=t[1],r}function Se(r){return"mat2("+r[0]+", "+r[1]+", "+r[2]+", "+r[3]+")"}function Ie(r){return Math.hypot(r[0],r[1],r[2],r[3])}function Le(r,t,e,i){return r[2]=i[2]/i[0],e[0]=i[0],e[1]=i[1],e[3]=i[3]-r[2]*e[1],[r,t,e]}function De(r,t,e){return r[0]=t[0]+e[0],r[1]=t[1]+e[1],r[2]=t[2]+e[2],r[3]=t[3]+e[3],r}function Mt(r,t,e){return r[0]=t[0]-e[0],r[1]=t[1]-e[1],r[2]=t[2]-e[2],r[3]=t[3]-e[3],r}function Oe(r,t){return r[0]===t[0]&&r[1]===t[1]&&r[2]===t[2]&&r[3]===t[3]}function Ce(r,t){var e=r[0],i=r[1],n=r[2],s=r[3],a=t[0],h=t[1],o=t[2],c=t[3];return Math.abs(e-a)<=y*Math.max(1,Math.abs(e),Math.abs(a))&&Math.abs(i-h)<=y*Math.max(1,Math.abs(i),Math.abs(h))&&Math.abs(n-o)<=y*Math.max(1,Math.abs(n),Math.abs(o))&&Math.abs(s-c)<=y*Math.max(1,Math.abs(s),Math.abs(c))}function Fe(r,t,e){return r[0]=t[0]*e,r[1]=t[1]*e,r[2]=t[2]*e,r[3]=t[3]*e,r}function Ne(r,t,e,i){return r[0]=t[0]+e[0]*i,r[1]=t[1]+e[1]*i,r[2]=t[2]+e[2]*i,r[3]=t[3]+e[3]*i,r}var _e=mt,Ye=Mt;var ur={};V(ur,{add:()=>ri,clone:()=>ue,copy:()=>qe,create:()=>Ue,determinant:()=>je,equals:()=>ni,exactEquals:()=>ii,frob:()=>Ke,fromRotation:()=>$e,fromScaling:()=>Qe,fromTranslation:()=>Ze,fromValues:()=>Ge,identity:()=>Ve,invert:()=>Xe,mul:()=>si,multiply:()=>dt,multiplyScalar:()=>ti,multiplyScalarAndAdd:()=>ei,rotate:()=>We,scale:()=>ke,set:()=>Be,str:()=>Je,sub:()=>ai,subtract:()=>gt,translate:()=>He});function Ue(){var r=new T(6);return T!=Float32Array&&(r[1]=0,r[2]=0,r[4]=0,r[5]=0),r[0]=1,r[3]=1,r}function ue(r){var t=new T(6);return t[0]=r[0],t[1]=r[1],t[2]=r[2],t[3]=r[3],t[4]=r[4],t[5]=r[5],t}function qe(r,t){return r[0]=t[0],r[1]=t[1],r[2]=t[2],r[3]=t[3],r[4]=t[4],r[5]=t[5],r}function Ve(r){return r[0]=1,r[1]=0,r[2]=0,r[3]=1,r[4]=0,r[5]=0,r}function Ge(r,t,e,i,n,s){var a=new T(6);return a[0]=r,a[1]=t,a[2]=e,a[3]=i,a[4]=n,a[5]=s,a}function Be(r,t,e,i,n,s,a){return r[0]=t,r[1]=e,r[2]=i,r[3]=n,r[4]=s,r[5]=a,r}function Xe(r,t){var e=t[0],i=t[1],n=t[2],s=t[3],a=t[4],h=t[5],o=e*s-i*n;return o?(o=1/o,r[0]=s*o,r[1]=-i*o,r[2]=-n*o,r[3]=e*o,r[4]=(n*h-s*a)*o,r[5]=(i*a-e*h)*o,r):null}function je(r){return r[0]*r[3]-r[1]*r[2]}function dt(r,t,e){var i=t[0],n=t[1],s=t[2],a=t[3],h=t[4],o=t[5],c=e[0],f=e[1],l=e[2],p=e[3],x=e[4],v=e[5];return r[0]=i*c+s*f,r[1]=n*c+a*f,r[2]=i*l+s*p,r[3]=n*l+a*p,r[4]=i*x+s*v+h,r[5]=n*x+a*v+o,r}function We(r,t,e){var i=t[0],n=t[1],s=t[2],a=t[3],h=t[4],o=t[5],c=Math.sin(e),f=Math.cos(e);return r[0]=i*f+s*c,r[1]=n*f+a*c,r[2]=i*-c+s*f,r[3]=n*-c+a*f,r[4]=h,r[5]=o,r}function ke(r,t,e){var i=t[0],n=t[1],s=t[2],a=t[3],h=t[4],o=t[5],c=e[0],f=e[1];return r[0]=i*c,r[1]=n*c,r[2]=s*f,r[3]=a*f,r[4]=h,r[5]=o,r}function He(r,t,e){var i=t[0],n=t[1],s=t[2],a=t[3],h=t[4],o=t[5],c=e[0],f=e[1];return r[0]=i,r[1]=n,r[2]=s,r[3]=a,r[4]=i*c+s*f+h,r[5]=n*c+a*f+o,r}function $e(r,t){var e=Math.sin(t),i=Math.cos(t);return r[0]=i,r[1]=e,r[2]=-e,r[3]=i,r[4]=0,r[5]=0,r}function Qe(r,t){return r[0]=t[0],r[1]=0,r[2]=0,r[3]=t[1],r[4]=0,r[5]=0,r}function Ze(r,t){return r[0]=1,r[1]=0,r[2]=0,r[3]=1,r[4]=t[0],r[5]=t[1],r}function Je(r){return"mat2d("+r[0]+", "+r[1]+", "+r[2]+", "+r[3]+", "+r[4]+", "+r[5]+")"}function Ke(r){return Math.hypot(r[0],r[1],r[2],r[3],r[4],r[5],1)}function ri(r,t,e){return r[0]=t[0]+e[0],r[1]=t[1]+e[1],r[2]=t[2]+e[2],r[3]=t[3]+e[3],r[4]=t[4]+e[4],r[5]=t[5]+e[5],r}function gt(r,t,e){return r[0]=t[0]-e[0],r[1]=t[1]-e[1],r[2]=t[2]-e[2],r[3]=t[3]-e[3],r[4]=t[4]-e[4],r[5]=t[5]-e[5],r}function ti(r,t,e){return r[0]=t[0]*e,r[1]=t[1]*e,r[2]=t[2]*e,r[3]=t[3]*e,r[4]=t[4]*e,r[5]=t[5]*e,r}function ei(r,t,e,i){return r[0]=t[0]+e[0]*i,r[1]=t[1]+e[1]*i,r[2]=t[2]+e[2]*i,r[3]=t[3]+e[3]*i,r[4]=t[4]+e[4]*i,r[5]=t[5]+e[5]*i,r}function ii(r,t){return r[0]===t[0]&&r[1]===t[1]&&r[2]===t[2]&&r[3]===t[3]&&r[4]===t[4]&&r[5]===t[5]}function ni(r,t){var e=r[0],i=r[1],n=r[2],s=r[3],a=r[4],h=r[5],o=t[0],c=t[1],f=t[2],l=t[3],p=t[4],x=t[5];return Math.abs(e-o)<=y*Math.max(1,Math.abs(e),Math.abs(o))&&Math.abs(i-c)<=y*Math.max(1,Math.abs(i),Math.abs(c))&&Math.abs(n-f)<=y*Math.max(1,Math.abs(n),Math.abs(f))&&Math.abs(s-l)<=y*Math.max(1,Math.abs(s),Math.abs(l))&&Math.abs(a-p)<=y*Math.max(1,Math.abs(a),Math.abs(p))&&Math.abs(h-x)<=y*Math.max(1,Math.abs(h),Math.abs(x))}var si=dt,ai=gt;var H={};V(H,{add:()=>Ii,adjoint:()=>mi,clone:()=>oi,copy:()=>ci,create:()=>qr,determinant:()=>Mi,equals:()=>Ci,exactEquals:()=>Oi,frob:()=>Si,fromMat2d:()=>Ai,fromMat4:()=>hi,fromQuat:()=>Ri,fromRotation:()=>Ei,fromScaling:()=>Pi,fromTranslation:()=>wi,fromValues:()=>fi,identity:()=>pi,invert:()=>vi,mul:()=>Fi,multiply:()=>yt,multiplyScalar:()=>Li,multiplyScalarAndAdd:()=>Di,normalFromMat4:()=>Ti,projection:()=>bi,rotate:()=>gi,scale:()=>yi,set:()=>li,str:()=>zi,sub:()=>Ni,subtract:()=>wt,translate:()=>di,transpose:()=>xi});function qr(){var r=new T(9);return T!=Float32Array&&(r[1]=0,r[2]=0,r[3]=0,r[5]=0,r[6]=0,r[7]=0),r[0]=1,r[4]=1,r[8]=1,r}function hi(r,t){return r[0]=t[0],r[1]=t[1],r[2]=t[2],r[3]=t[4],r[4]=t[5],r[5]=t[6],r[6]=t[8],r[7]=t[9],r[8]=t[10],r}function oi(r){var t=new T(9);return t[0]=r[0],t[1]=r[1],t[2]=r[2],t[3]=r[3],t[4]=r[4],t[5]=r[5],t[6]=r[6],t[7]=r[7],t[8]=r[8],t}function ci(r,t){return r[0]=t[0],r[1]=t[1],r[2]=t[2],r[3]=t[3],r[4]=t[4],r[5]=t[5],r[6]=t[6],r[7]=t[7],r[8]=t[8],r}function fi(r,t,e,i,n,s,a,h,o){var c=new T(9);return c[0]=r,c[1]=t,c[2]=e,c[3]=i,c[4]=n,c[5]=s,c[6]=a,c[7]=h,c[8]=o,c}function li(r,t,e,i,n,s,a,h,o,c){return r[0]=t,r[1]=e,r[2]=i,r[3]=n,r[4]=s,r[5]=a,r[6]=h,r[7]=o,r[8]=c,r}function pi(r){return r[0]=1,r[1]=0,r[2]=0,r[3]=0,r[4]=1,r[5]=0,r[6]=0,r[7]=0,r[8]=1,r}function xi(r,t){if(r===t){var e=t[1],i=t[2],n=t[5];r[1]=t[3],r[2]=t[6],r[3]=e,r[5]=t[7],r[6]=i,r[7]=n}else r[0]=t[0],r[1]=t[3],r[2]=t[6],r[3]=t[1],r[4]=t[4],r[5]=t[7],r[6]=t[2],r[7]=t[5],r[8]=t[8];return r}function vi(r,t){var e=t[0],i=t[1],n=t[2],s=t[3],a=t[4],h=t[5],o=t[6],c=t[7],f=t[8],l=f*a-h*c,p=-f*s+h*o,x=c*s-a*o,v=e*l+i*p+n*x;return v?(v=1/v,r[0]=l*v,r[1]=(-f*i+n*c)*v,r[2]=(h*i-n*a)*v,r[3]=p*v,r[4]=(f*e-n*o)*v,r[5]=(-h*e+n*s)*v,r[6]=x*v,r[7]=(-c*e+i*o)*v,r[8]=(a*e-i*s)*v,r):null}function mi(r,t){var e=t[0],i=t[1],n=t[2],s=t[3],a=t[4],h=t[5],o=t[6],c=t[7],f=t[8];return r[0]=a*f-h*c,r[1]=n*c-i*f,r[2]=i*h-n*a,r[3]=h*o-s*f,r[4]=e*f-n*o,r[5]=n*s-e*h,r[6]=s*c-a*o,r[7]=i*o-e*c,r[8]=e*a-i*s,r}function Mi(r){var t=r[0],e=r[1],i=r[2],n=r[3],s=r[4],a=r[5],h=r[6],o=r[7],c=r[8];return t*(c*s-a*o)+e*(-c*n+a*h)+i*(o*n-s*h)}function yt(r,t,e){var i=t[0],n=t[1],s=t[2],a=t[3],h=t[4],o=t[5],c=t[6],f=t[7],l=t[8],p=e[0],x=e[1],v=e[2],d=e[3],m=e[4],g=e[5],w=e[6],E=e[7],P=e[8];return r[0]=p*i+x*a+v*c,r[1]=p*n+x*h+v*f,r[2]=p*s+x*o+v*l,r[3]=d*i+m*a+g*c,r[4]=d*n+m*h+g*f,r[5]=d*s+m*o+g*l,r[6]=w*i+E*a+P*c,r[7]=w*n+E*h+P*f,r[8]=w*s+E*o+P*l,r}function di(r,t,e){var i=t[0],n=t[1],s=t[2],a=t[3],h=t[4],o=t[5],c=t[6],f=t[7],l=t[8],p=e[0],x=e[1];return r[0]=i,r[1]=n,r[2]=s,r[3]=a,r[4]=h,r[5]=o,r[6]=p*i+x*a+c,r[7]=p*n+x*h+f,r[8]=p*s+x*o+l,r}function gi(r,t,e){var i=t[0],n=t[1],s=t[2],a=t[3],h=t[4],o=t[5],c=t[6],f=t[7],l=t[8],p=Math.sin(e),x=Math.cos(e);return r[0]=x*i+p*a,r[1]=x*n+p*h,r[2]=x*s+p*o,r[3]=x*a-p*i,r[4]=x*h-p*n,r[5]=x*o-p*s,r[6]=c,r[7]=f,r[8]=l,r}function yi(r,t,e){var i=e[0],n=e[1];return r[0]=i*t[0],r[1]=i*t[1],r[2]=i*t[2],r[3]=n*t[3],r[4]=n*t[4],r[5]=n*t[5],r[6]=t[6],r[7]=t[7],r[8]=t[8],r}function wi(r,t){return r[0]=1,r[1]=0,r[2]=0,r[3]=0,r[4]=1,r[5]=0,r[6]=t[0],r[7]=t[1],r[8]=1,r}function Ei(r,t){var e=Math.sin(t),i=Math.cos(t);return r[0]=i,r[1]=e,r[2]=0,r[3]=-e,r[4]=i,r[5]=0,r[6]=0,r[7]=0,r[8]=1,r}function Pi(r,t){return r[0]=t[0],r[1]=0,r[2]=0,r[3]=0,r[4]=t[1],r[5]=0,r[6]=0,r[7]=0,r[8]=1,r}function Ai(r,t){return r[0]=t[0],r[1]=t[1],r[2]=0,r[3]=t[2],r[4]=t[3],r[5]=0,r[6]=t[4],r[7]=t[5],r[8]=1,r}function Ri(r,t){var e=t[0],i=t[1],n=t[2],s=t[3],a=e+e,h=i+i,o=n+n,c=e*a,f=i*a,l=i*h,p=n*a,x=n*h,v=n*o,d=s*a,m=s*h,g=s*o;return r[0]=1-l-v,r[3]=f-g,r[6]=p+m,r[1]=f+g,r[4]=1-c-v,r[7]=x-d,r[2]=p-m,r[5]=x+d,r[8]=1-c-l,r}function Ti(r,t){var e=t[0],i=t[1],n=t[2],s=t[3],a=t[4],h=t[5],o=t[6],c=t[7],f=t[8],l=t[9],p=t[10],x=t[11],v=t[12],d=t[13],m=t[14],g=t[15],w=e*h-i*a,E=e*o-n*a,P=e*c-s*a,R=i*o-n*h,A=i*c-s*h,F=n*c-s*o,D=f*d-l*v,O=f*m-p*v,I=f*g-x*v,_=l*m-p*d,C=l*g-x*d,Y=p*g-x*m,b=w*Y-E*C+P*_+R*I-A*O+F*D;return b?(b=1/b,r[0]=(h*Y-o*C+c*_)*b,r[1]=(o*I-a*Y-c*O)*b,r[2]=(a*C-h*I+c*D)*b,r[3]=(n*C-i*Y-s*_)*b,r[4]=(e*Y-n*I+s*O)*b,r[5]=(i*I-e*C-s*D)*b,r[6]=(d*F-m*A+g*R)*b,r[7]=(m*P-v*F-g*E)*b,r[8]=(v*A-d*P+g*w)*b,r):null}function bi(r,t,e){return r[0]=2/t,r[1]=0,r[2]=0,r[3]=0,r[4]=-2/e,r[5]=0,r[6]=-1,r[7]=1,r[8]=1,r}function zi(r){return"mat3("+r[0]+", "+r[1]+", "+r[2]+", "+r[3]+", "+r[4]+", "+r[5]+", "+r[6]+", "+r[7]+", "+r[8]+")"}function Si(r){return Math.hypot(r[0],r[1],r[2],r[3],r[4],r[5],r[6],r[7],r[8])}function Ii(r,t,e){return r[0]=t[0]+e[0],r[1]=t[1]+e[1],r[2]=t[2]+e[2],r[3]=t[3]+e[3],r[4]=t[4]+e[4],r[5]=t[5]+e[5],r[6]=t[6]+e[6],r[7]=t[7]+e[7],r[8]=t[8]+e[8],r}function wt(r,t,e){return r[0]=t[0]-e[0],r[1]=t[1]-e[1],r[2]=t[2]-e[2],r[3]=t[3]-e[3],r[4]=t[4]-e[4],r[5]=t[5]-e[5],r[6]=t[6]-e[6],r[7]=t[7]-e[7],r[8]=t[8]-e[8],r}function Li(r,t,e){return r[0]=t[0]*e,r[1]=t[1]*e,r[2]=t[2]*e,r[3]=t[3]*e,r[4]=t[4]*e,r[5]=t[5]*e,r[6]=t[6]*e,r[7]=t[7]*e,r[8]=t[8]*e,r}function Di(r,t,e,i){return r[0]=t[0]+e[0]*i,r[1]=t[1]+e[1]*i,r[2]=t[2]+e[2]*i,r[3]=t[3]+e[3]*i,r[4]=t[4]+e[4]*i,r[5]=t[5]+e[5]*i,r[6]=t[6]+e[6]*i,r[7]=t[7]+e[7]*i,r[8]=t[8]+e[8]*i,r}function Oi(r,t){return r[0]===t[0]&&r[1]===t[1]&&r[2]===t[2]&&r[3]===t[3]&&r[4]===t[4]&&r[5]===t[5]&&r[6]===t[6]&&r[7]===t[7]&&r[8]===t[8]}function Ci(r,t){var e=r[0],i=r[1],n=r[2],s=r[3],a=r[4],h=r[5],o=r[6],c=r[7],f=r[8],l=t[0],p=t[1],x=t[2],v=t[3],d=t[4],m=t[5],g=t[6],w=t[7],E=t[8];return Math.abs(e-l)<=y*Math.max(1,Math.abs(e),Math.abs(l))&&Math.abs(i-p)<=y*Math.max(1,Math.abs(i),Math.abs(p))&&Math.abs(n-x)<=y*Math.max(1,Math.abs(n),Math.abs(x))&&Math.abs(s-v)<=y*Math.max(1,Math.abs(s),Math.abs(v))&&Math.abs(a-d)<=y*Math.max(1,Math.abs(a),Math.abs(d))&&Math.abs(h-m)<=y*Math.max(1,Math.abs(h),Math.abs(m))&&Math.abs(o-g)<=y*Math.max(1,Math.abs(o),Math.abs(g))&&Math.abs(c-w)<=y*Math.max(1,Math.abs(c),Math.abs(w))&&Math.abs(f-E)<=y*Math.max(1,Math.abs(f),Math.abs(E))}var Fi=yt,Ni=wt;var S={};V(S,{add:()=>gn,adjoint:()=>Bi,clone:()=>Yi,copy:()=>Ui,create:()=>_i,determinant:()=>Xi,equals:()=>Pn,exactEquals:()=>En,frob:()=>dn,fromQuat:()=>hn,fromQuat2:()=>nn,fromRotation:()=>Ki,fromRotationTranslation:()=>At,fromRotationTranslationScale:()=>sn,fromRotationTranslationScaleOrigin:()=>an,fromScaling:()=>Ji,fromTranslation:()=>Zi,fromValues:()=>ui,fromXRotation:()=>rn,fromYRotation:()=>tn,fromZRotation:()=>en,frustum:()=>on,getRotation:()=>Gr,getScaling:()=>Rt,getTranslation:()=>Vr,identity:()=>Et,invert:()=>Gi,lookAt:()=>vn,mul:()=>An,multiply:()=>Pt,multiplyScalar:()=>yn,multiplyScalarAndAdd:()=>wn,ortho:()=>pn,orthoNO:()=>bt,orthoZO:()=>xn,perspective:()=>cn,perspectiveFromFieldOfView:()=>ln,perspectiveNO:()=>Tt,perspectiveZO:()=>fn,rotate:()=>ki,rotateX:()=>Hi,rotateY:()=>$i,rotateZ:()=>Qi,scale:()=>Wi,set:()=>qi,str:()=>Mn,sub:()=>Rn,subtract:()=>zt,targetTo:()=>mn,translate:()=>ji,transpose:()=>Vi});function _i(){var r=new T(16);return T!=Float32Array&&(r[1]=0,r[2]=0,r[3]=0,r[4]=0,r[6]=0,r[7]=0,r[8]=0,r[9]=0,r[11]=0,r[12]=0,r[13]=0,r[14]=0),r[0]=1,r[5]=1,r[10]=1,r[15]=1,r}function Yi(r){var t=new T(16);return t[0]=r[0],t[1]=r[1],t[2]=r[2],t[3]=r[3],t[4]=r[4],t[5]=r[5],t[6]=r[6],t[7]=r[7],t[8]=r[8],t[9]=r[9],t[10]=r[10],t[11]=r[11],t[12]=r[12],t[13]=r[13],t[14]=r[14],t[15]=r[15],t}function Ui(r,t){return r[0]=t[0],r[1]=t[1],r[2]=t[2],r[3]=t[3],r[4]=t[4],r[5]=t[5],r[6]=t[6],r[7]=t[7],r[8]=t[8],r[9]=t[9],r[10]=t[10],r[11]=t[11],r[12]=t[12],r[13]=t[13],r[14]=t[14],r[15]=t[15],r}function ui(r,t,e,i,n,s,a,h,o,c,f,l,p,x,v,d){var m=new T(16);return m[0]=r,m[1]=t,m[2]=e,m[3]=i,m[4]=n,m[5]=s,m[6]=a,m[7]=h,m[8]=o,m[9]=c,m[10]=f,m[11]=l,m[12]=p,m[13]=x,m[14]=v,m[15]=d,m}function qi(r,t,e,i,n,s,a,h,o,c,f,l,p,x,v,d,m){return r[0]=t,r[1]=e,r[2]=i,r[3]=n,r[4]=s,r[5]=a,r[6]=h,r[7]=o,r[8]=c,r[9]=f,r[10]=l,r[11]=p,r[12]=x,r[13]=v,r[14]=d,r[15]=m,r}function Et(r){return r[0]=1,r[1]=0,r[2]=0,r[3]=0,r[4]=0,r[5]=1,r[6]=0,r[7]=0,r[8]=0,r[9]=0,r[10]=1,r[11]=0,r[12]=0,r[13]=0,r[14]=0,r[15]=1,r}function Vi(r,t){if(r===t){var e=t[1],i=t[2],n=t[3],s=t[6],a=t[7],h=t[11];r[1]=t[4],r[2]=t[8],r[3]=t[12],r[4]=e,r[6]=t[9],r[7]=t[13],r[8]=i,r[9]=s,r[11]=t[14],r[12]=n,r[13]=a,r[14]=h}else r[0]=t[0],r[1]=t[4],r[2]=t[8],r[3]=t[12],r[4]=t[1],r[5]=t[5],r[6]=t[9],r[7]=t[13],r[8]=t[2],r[9]=t[6],r[10]=t[10],r[11]=t[14],r[12]=t[3],r[13]=t[7],r[14]=t[11],r[15]=t[15];return r}function Gi(r,t){var e=t[0],i=t[1],n=t[2],s=t[3],a=t[4],h=t[5],o=t[6],c=t[7],f=t[8],l=t[9],p=t[10],x=t[11],v=t[12],d=t[13],m=t[14],g=t[15],w=e*h-i*a,E=e*o-n*a,P=e*c-s*a,R=i*o-n*h,A=i*c-s*h,F=n*c-s*o,D=f*d-l*v,O=f*m-p*v,I=f*g-x*v,_=l*m-p*d,C=l*g-x*d,Y=p*g-x*m,b=w*Y-E*C+P*_+R*I-A*O+F*D;return b?(b=1/b,r[0]=(h*Y-o*C+c*_)*b,r[1]=(n*C-i*Y-s*_)*b,r[2]=(d*F-m*A+g*R)*b,r[3]=(p*A-l*F-x*R)*b,r[4]=(o*I-a*Y-c*O)*b,r[5]=(e*Y-n*I+s*O)*b,r[6]=(m*P-v*F-g*E)*b,r[7]=(f*F-p*P+x*E)*b,r[8]=(a*C-h*I+c*D)*b,r[9]=(i*I-e*C-s*D)*b,r[10]=(v*A-d*P+g*w)*b,r[11]=(l*P-f*A-x*w)*b,r[12]=(h*O-a*_-o*D)*b,r[13]=(e*_-i*O+n*D)*b,r[14]=(d*E-v*R-m*w)*b,r[15]=(f*R-l*E+p*w)*b,r):null}function Bi(r,t){var e=t[0],i=t[1],n=t[2],s=t[3],a=t[4],h=t[5],o=t[6],c=t[7],f=t[8],l=t[9],p=t[10],x=t[11],v=t[12],d=t[13],m=t[14],g=t[15];return r[0]=h*(p*g-x*m)-l*(o*g-c*m)+d*(o*x-c*p),r[1]=-(i*(p*g-x*m)-l*(n*g-s*m)+d*(n*x-s*p)),r[2]=i*(o*g-c*m)-h*(n*g-s*m)+d*(n*c-s*o),r[3]=-(i*(o*x-c*p)-h*(n*x-s*p)+l*(n*c-s*o)),r[4]=-(a*(p*g-x*m)-f*(o*g-c*m)+v*(o*x-c*p)),r[5]=e*(p*g-x*m)-f*(n*g-s*m)+v*(n*x-s*p),r[6]=-(e*(o*g-c*m)-a*(n*g-s*m)+v*(n*c-s*o)),r[7]=e*(o*x-c*p)-a*(n*x-s*p)+f*(n*c-s*o),r[8]=a*(l*g-x*d)-f*(h*g-c*d)+v*(h*x-c*l),r[9]=-(e*(l*g-x*d)-f*(i*g-s*d)+v*(i*x-s*l)),r[10]=e*(h*g-c*d)-a*(i*g-s*d)+v*(i*c-s*h),r[11]=-(e*(h*x-c*l)-a*(i*x-s*l)+f*(i*c-s*h)),r[12]=-(a*(l*m-p*d)-f*(h*m-o*d)+v*(h*p-o*l)),r[13]=e*(l*m-p*d)-f*(i*m-n*d)+v*(i*p-n*l),r[14]=-(e*(h*m-o*d)-a*(i*m-n*d)+v*(i*o-n*h)),r[15]=e*(h*p-o*l)-a*(i*p-n*l)+f*(i*o-n*h),r}function Xi(r){var t=r[0],e=r[1],i=r[2],n=r[3],s=r[4],a=r[5],h=r[6],o=r[7],c=r[8],f=r[9],l=r[10],p=r[11],x=r[12],v=r[13],d=r[14],m=r[15],g=t*a-e*s,w=t*h-i*s,E=t*o-n*s,P=e*h-i*a,R=e*o-n*a,A=i*o-n*h,F=c*v-f*x,D=c*d-l*x,O=c*m-p*x,I=f*d-l*v,_=f*m-p*v,C=l*m-p*d;return g*C-w*_+E*I+P*O-R*D+A*F}function Pt(r,t,e){var i=t[0],n=t[1],s=t[2],a=t[3],h=t[4],o=t[5],c=t[6],f=t[7],l=t[8],p=t[9],x=t[10],v=t[11],d=t[12],m=t[13],g=t[14],w=t[15],E=e[0],P=e[1],R=e[2],A=e[3];return r[0]=E*i+P*h+R*l+A*d,r[1]=E*n+P*o+R*p+A*m,r[2]=E*s+P*c+R*x+A*g,r[3]=E*a+P*f+R*v+A*w,E=e[4],P=e[5],R=e[6],A=e[7],r[4]=E*i+P*h+R*l+A*d,r[5]=E*n+P*o+R*p+A*m,r[6]=E*s+P*c+R*x+A*g,r[7]=E*a+P*f+R*v+A*w,E=e[8],P=e[9],R=e[10],A=e[11],r[8]=E*i+P*h+R*l+A*d,r[9]=E*n+P*o+R*p+A*m,r[10]=E*s+P*c+R*x+A*g,r[11]=E*a+P*f+R*v+A*w,E=e[12],P=e[13],R=e[14],A=e[15],r[12]=E*i+P*h+R*l+A*d,r[13]=E*n+P*o+R*p+A*m,r[14]=E*s+P*c+R*x+A*g,r[15]=E*a+P*f+R*v+A*w,r}function ji(r,t,e){var i=e[0],n=e[1],s=e[2],a,h,o,c,f,l,p,x,v,d,m,g;return t===r?(r[12]=t[0]*i+t[4]*n+t[8]*s+t[12],r[13]=t[1]*i+t[5]*n+t[9]*s+t[13],r[14]=t[2]*i+t[6]*n+t[10]*s+t[14],r[15]=t[3]*i+t[7]*n+t[11]*s+t[15]):(a=t[0],h=t[1],o=t[2],c=t[3],f=t[4],l=t[5],p=t[6],x=t[7],v=t[8],d=t[9],m=t[10],g=t[11],r[0]=a,r[1]=h,r[2]=o,r[3]=c,r[4]=f,r[5]=l,r[6]=p,r[7]=x,r[8]=v,r[9]=d,r[10]=m,r[11]=g,r[12]=a*i+f*n+v*s+t[12],r[13]=h*i+l*n+d*s+t[13],r[14]=o*i+p*n+m*s+t[14],r[15]=c*i+x*n+g*s+t[15]),r}function Wi(r,t,e){var i=e[0],n=e[1],s=e[2];return r[0]=t[0]*i,r[1]=t[1]*i,r[2]=t[2]*i,r[3]=t[3]*i,r[4]=t[4]*n,r[5]=t[5]*n,r[6]=t[6]*n,r[7]=t[7]*n,r[8]=t[8]*s,r[9]=t[9]*s,r[10]=t[10]*s,r[11]=t[11]*s,r[12]=t[12],r[13]=t[13],r[14]=t[14],r[15]=t[15],r}function ki(r,t,e,i){var n=i[0],s=i[1],a=i[2],h=Math.hypot(n,s,a),o,c,f,l,p,x,v,d,m,g,w,E,P,R,A,F,D,O,I,_,C,Y,b,X;return h<y?null:(h=1/h,n*=h,s*=h,a*=h,o=Math.sin(e),c=Math.cos(e),f=1-c,l=t[0],p=t[1],x=t[2],v=t[3],d=t[4],m=t[5],g=t[6],w=t[7],E=t[8],P=t[9],R=t[10],A=t[11],F=n*n*f+c,D=s*n*f+a*o,O=a*n*f-s*o,I=n*s*f-a*o,_=s*s*f+c,C=a*s*f+n*o,Y=n*a*f+s*o,b=s*a*f-n*o,X=a*a*f+c,r[0]=l*F+d*D+E*O,r[1]=p*F+m*D+P*O,r[2]=x*F+g*D+R*O,r[3]=v*F+w*D+A*O,r[4]=l*I+d*_+E*C,r[5]=p*I+m*_+P*C,r[6]=x*I+g*_+R*C,r[7]=v*I+w*_+A*C,r[8]=l*Y+d*b+E*X,r[9]=p*Y+m*b+P*X,r[10]=x*Y+g*b+R*X,r[11]=v*Y+w*b+A*X,t!==r&&(r[12]=t[12],r[13]=t[13],r[14]=t[14],r[15]=t[15]),r)}function Hi(r,t,e){var i=Math.sin(e),n=Math.cos(e),s=t[4],a=t[5],h=t[6],o=t[7],c=t[8],f=t[9],l=t[10],p=t[11];return t!==r&&(r[0]=t[0],r[1]=t[1],r[2]=t[2],r[3]=t[3],r[12]=t[12],r[13]=t[13],r[14]=t[14],r[15]=t[15]),r[4]=s*n+c*i,r[5]=a*n+f*i,r[6]=h*n+l*i,r[7]=o*n+p*i,r[8]=c*n-s*i,r[9]=f*n-a*i,r[10]=l*n-h*i,r[11]=p*n-o*i,r}function $i(r,t,e){var i=Math.sin(e),n=Math.cos(e),s=t[0],a=t[1],h=t[2],o=t[3],c=t[8],f=t[9],l=t[10],p=t[11];return t!==r&&(r[4]=t[4],r[5]=t[5],r[6]=t[6],r[7]=t[7],r[12]=t[12],r[13]=t[13],r[14]=t[14],r[15]=t[15]),r[0]=s*n-c*i,r[1]=a*n-f*i,r[2]=h*n-l*i,r[3]=o*n-p*i,r[8]=s*i+c*n,r[9]=a*i+f*n,r[10]=h*i+l*n,r[11]=o*i+p*n,r}function Qi(r,t,e){var i=Math.sin(e),n=Math.cos(e),s=t[0],a=t[1],h=t[2],o=t[3],c=t[4],f=t[5],l=t[6],p=t[7];return t!==r&&(r[8]=t[8],r[9]=t[9],r[10]=t[10],r[11]=t[11],r[12]=t[12],r[13]=t[13],r[14]=t[14],r[15]=t[15]),r[0]=s*n+c*i,r[1]=a*n+f*i,r[2]=h*n+l*i,r[3]=o*n+p*i,r[4]=c*n-s*i,r[5]=f*n-a*i,r[6]=l*n-h*i,r[7]=p*n-o*i,r}function Zi(r,t){return r[0]=1,r[1]=0,r[2]=0,r[3]=0,r[4]=0,r[5]=1,r[6]=0,r[7]=0,r[8]=0,r[9]=0,r[10]=1,r[11]=0,r[12]=t[0],r[13]=t[1],r[14]=t[2],r[15]=1,r}function Ji(r,t){return r[0]=t[0],r[1]=0,r[2]=0,r[3]=0,r[4]=0,r[5]=t[1],r[6]=0,r[7]=0,r[8]=0,r[9]=0,r[10]=t[2],r[11]=0,r[12]=0,r[13]=0,r[14]=0,r[15]=1,r}function Ki(r,t,e){var i=e[0],n=e[1],s=e[2],a=Math.hypot(i,n,s),h,o,c;return a<y?null:(a=1/a,i*=a,n*=a,s*=a,h=Math.sin(t),o=Math.cos(t),c=1-o,r[0]=i*i*c+o,r[1]=n*i*c+s*h,r[2]=s*i*c-n*h,r[3]=0,r[4]=i*n*c-s*h,r[5]=n*n*c+o,r[6]=s*n*c+i*h,r[7]=0,r[8]=i*s*c+n*h,r[9]=n*s*c-i*h,r[10]=s*s*c+o,r[11]=0,r[12]=0,r[13]=0,r[14]=0,r[15]=1,r)}function rn(r,t){var e=Math.sin(t),i=Math.cos(t);return r[0]=1,r[1]=0,r[2]=0,r[3]=0,r[4]=0,r[5]=i,r[6]=e,r[7]=0,r[8]=0,r[9]=-e,r[10]=i,r[11]=0,r[12]=0,r[13]=0,r[14]=0,r[15]=1,r}function tn(r,t){var e=Math.sin(t),i=Math.cos(t);return r[0]=i,r[1]=0,r[2]=-e,r[3]=0,r[4]=0,r[5]=1,r[6]=0,r[7]=0,r[8]=e,r[9]=0,r[10]=i,r[11]=0,r[12]=0,r[13]=0,r[14]=0,r[15]=1,r}function en(r,t){var e=Math.sin(t),i=Math.cos(t);return r[0]=i,r[1]=e,r[2]=0,r[3]=0,r[4]=-e,r[5]=i,r[6]=0,r[7]=0,r[8]=0,r[9]=0,r[10]=1,r[11]=0,r[12]=0,r[13]=0,r[14]=0,r[15]=1,r}function At(r,t,e){var i=t[0],n=t[1],s=t[2],a=t[3],h=i+i,o=n+n,c=s+s,f=i*h,l=i*o,p=i*c,x=n*o,v=n*c,d=s*c,m=a*h,g=a*o,w=a*c;return r[0]=1-(x+d),r[1]=l+w,r[2]=p-g,r[3]=0,r[4]=l-w,r[5]=1-(f+d),r[6]=v+m,r[7]=0,r[8]=p+g,r[9]=v-m,r[10]=1-(f+x),r[11]=0,r[12]=e[0],r[13]=e[1],r[14]=e[2],r[15]=1,r}function nn(r,t){var e=new T(3),i=-t[0],n=-t[1],s=-t[2],a=t[3],h=t[4],o=t[5],c=t[6],f=t[7],l=i*i+n*n+s*s+a*a;return l>0?(e[0]=(h*a+f*i+o*s-c*n)*2/l,e[1]=(o*a+f*n+c*i-h*s)*2/l,e[2]=(c*a+f*s+h*n-o*i)*2/l):(e[0]=(h*a+f*i+o*s-c*n)*2,e[1]=(o*a+f*n+c*i-h*s)*2,e[2]=(c*a+f*s+h*n-o*i)*2),At(r,t,e),r}function Vr(r,t){return r[0]=t[12],r[1]=t[13],r[2]=t[14],r}function Rt(r,t){var e=t[0],i=t[1],n=t[2],s=t[4],a=t[5],h=t[6],o=t[8],c=t[9],f=t[10];return r[0]=Math.hypot(e,i,n),r[1]=Math.hypot(s,a,h),r[2]=Math.hypot(o,c,f),r}function Gr(r,t){var e=new T(3);Rt(e,t);var i=1/e[0],n=1/e[1],s=1/e[2],a=t[0]*i,h=t[1]*n,o=t[2]*s,c=t[4]*i,f=t[5]*n,l=t[6]*s,p=t[8]*i,x=t[9]*n,v=t[10]*s,d=a+f+v,m=0;return d>0?(m=Math.sqrt(d+1)*2,r[3]=.25*m,r[0]=(l-x)/m,r[1]=(p-o)/m,r[2]=(h-c)/m):a>f&&a>v?(m=Math.sqrt(1+a-f-v)*2,r[3]=(l-x)/m,r[0]=.25*m,r[1]=(h+c)/m,r[2]=(p+o)/m):f>v?(m=Math.sqrt(1+f-a-v)*2,r[3]=(p-o)/m,r[0]=(h+c)/m,r[1]=.25*m,r[2]=(l+x)/m):(m=Math.sqrt(1+v-a-f)*2,r[3]=(h-c)/m,r[0]=(p+o)/m,r[1]=(l+x)/m,r[2]=.25*m),r}function sn(r,t,e,i){var n=t[0],s=t[1],a=t[2],h=t[3],o=n+n,c=s+s,f=a+a,l=n*o,p=n*c,x=n*f,v=s*c,d=s*f,m=a*f,g=h*o,w=h*c,E=h*f,P=i[0],R=i[1],A=i[2];return r[0]=(1-(v+m))*P,r[1]=(p+E)*P,r[2]=(x-w)*P,r[3]=0,r[4]=(p-E)*R,r[5]=(1-(l+m))*R,r[6]=(d+g)*R,r[7]=0,r[8]=(x+w)*A,r[9]=(d-g)*A,r[10]=(1-(l+v))*A,r[11]=0,r[12]=e[0],r[13]=e[1],r[14]=e[2],r[15]=1,r}function an(r,t,e,i,n){var s=t[0],a=t[1],h=t[2],o=t[3],c=s+s,f=a+a,l=h+h,p=s*c,x=s*f,v=s*l,d=a*f,m=a*l,g=h*l,w=o*c,E=o*f,P=o*l,R=i[0],A=i[1],F=i[2],D=n[0],O=n[1],I=n[2],_=(1-(d+g))*R,C=(x+P)*R,Y=(v-E)*R,b=(x-P)*A,X=(1-(p+g))*A,ir=(m+w)*A,nr=(v+E)*F,pt=(m-w)*F,xt=(1-(p+d))*F;return r[0]=_,r[1]=C,r[2]=Y,r[3]=0,r[4]=b,r[5]=X,r[6]=ir,r[7]=0,r[8]=nr,r[9]=pt,r[10]=xt,r[11]=0,r[12]=e[0]+D-(_*D+b*O+nr*I),r[13]=e[1]+O-(C*D+X*O+pt*I),r[14]=e[2]+I-(Y*D+ir*O+xt*I),r[15]=1,r}function hn(r,t){var e=t[0],i=t[1],n=t[2],s=t[3],a=e+e,h=i+i,o=n+n,c=e*a,f=i*a,l=i*h,p=n*a,x=n*h,v=n*o,d=s*a,m=s*h,g=s*o;return r[0]=1-l-v,r[1]=f+g,r[2]=p-m,r[3]=0,r[4]=f-g,r[5]=1-c-v,r[6]=x+d,r[7]=0,r[8]=p+m,r[9]=x-d,r[10]=1-c-l,r[11]=0,r[12]=0,r[13]=0,r[14]=0,r[15]=1,r}function on(r,t,e,i,n,s,a){var h=1/(e-t),o=1/(n-i),c=1/(s-a);return r[0]=s*2*h,r[1]=0,r[2]=0,r[3]=0,r[4]=0,r[5]=s*2*o,r[6]=0,r[7]=0,r[8]=(e+t)*h,r[9]=(n+i)*o,r[10]=(a+s)*c,r[11]=-1,r[12]=0,r[13]=0,r[14]=a*s*2*c,r[15]=0,r}function Tt(r,t,e,i,n){var s=1/Math.tan(t/2),a;return r[0]=s/e,r[1]=0,r[2]=0,r[3]=0,r[4]=0,r[5]=s,r[6]=0,r[7]=0,r[8]=0,r[9]=0,r[11]=-1,r[12]=0,r[13]=0,r[15]=0,n!=null&&n!==1/0?(a=1/(i-n),r[10]=(n+i)*a,r[14]=2*n*i*a):(r[10]=-1,r[14]=-2*i),r}var cn=Tt;function fn(r,t,e,i,n){var s=1/Math.tan(t/2),a;return r[0]=s/e,r[1]=0,r[2]=0,r[3]=0,r[4]=0,r[5]=s,r[6]=0,r[7]=0,r[8]=0,r[9]=0,r[11]=-1,r[12]=0,r[13]=0,r[15]=0,n!=null&&n!==1/0?(a=1/(i-n),r[10]=n*a,r[14]=n*i*a):(r[10]=-1,r[14]=-i),r}function ln(r,t,e,i){var n=Math.tan(t.upDegrees*Math.PI/180),s=Math.tan(t.downDegrees*Math.PI/180),a=Math.tan(t.leftDegrees*Math.PI/180),h=Math.tan(t.rightDegrees*Math.PI/180),o=2/(a+h),c=2/(n+s);return r[0]=o,r[1]=0,r[2]=0,r[3]=0,r[4]=0,r[5]=c,r[6]=0,r[7]=0,r[8]=-((a-h)*o*.5),r[9]=(n-s)*c*.5,r[10]=i/(e-i),r[11]=-1,r[12]=0,r[13]=0,r[14]=i*e/(e-i),r[15]=0,r}function bt(r,t,e,i,n,s,a){var h=1/(t-e),o=1/(i-n),c=1/(s-a);return r[0]=-2*h,r[1]=0,r[2]=0,r[3]=0,r[4]=0,r[5]=-2*o,r[6]=0,r[7]=0,r[8]=0,r[9]=0,r[10]=2*c,r[11]=0,r[12]=(t+e)*h,r[13]=(n+i)*o,r[14]=(a+s)*c,r[15]=1,r}var pn=bt;function xn(r,t,e,i,n,s,a){var h=1/(t-e),o=1/(i-n),c=1/(s-a);return r[0]=-2*h,r[1]=0,r[2]=0,r[3]=0,r[4]=0,r[5]=-2*o,r[6]=0,r[7]=0,r[8]=0,r[9]=0,r[10]=c,r[11]=0,r[12]=(t+e)*h,r[13]=(n+i)*o,r[14]=s*c,r[15]=1,r}function vn(r,t,e,i){var n,s,a,h,o,c,f,l,p,x,v=t[0],d=t[1],m=t[2],g=i[0],w=i[1],E=i[2],P=e[0],R=e[1],A=e[2];return Math.abs(v-P)<y&&Math.abs(d-R)<y&&Math.abs(m-A)<y?Et(r):(f=v-P,l=d-R,p=m-A,x=1/Math.hypot(f,l,p),f*=x,l*=x,p*=x,n=w*p-E*l,s=E*f-g*p,a=g*l-w*f,x=Math.hypot(n,s,a),x?(x=1/x,n*=x,s*=x,a*=x):(n=0,s=0,a=0),h=l*a-p*s,o=p*n-f*a,c=f*s-l*n,x=Math.hypot(h,o,c),x?(x=1/x,h*=x,o*=x,c*=x):(h=0,o=0,c=0),r[0]=n,r[1]=h,r[2]=f,r[3]=0,r[4]=s,r[5]=o,r[6]=l,r[7]=0,r[8]=a,r[9]=c,r[10]=p,r[11]=0,r[12]=-(n*v+s*d+a*m),r[13]=-(h*v+o*d+c*m),r[14]=-(f*v+l*d+p*m),r[15]=1,r)}function mn(r,t,e,i){var n=t[0],s=t[1],a=t[2],h=i[0],o=i[1],c=i[2],f=n-e[0],l=s-e[1],p=a-e[2],x=f*f+l*l+p*p;x>0&&(x=1/Math.sqrt(x),f*=x,l*=x,p*=x);var v=o*p-c*l,d=c*f-h*p,m=h*l-o*f;return x=v*v+d*d+m*m,x>0&&(x=1/Math.sqrt(x),v*=x,d*=x,m*=x),r[0]=v,r[1]=d,r[2]=m,r[3]=0,r[4]=l*m-p*d,r[5]=p*v-f*m,r[6]=f*d-l*v,r[7]=0,r[8]=f,r[9]=l,r[10]=p,r[11]=0,r[12]=n,r[13]=s,r[14]=a,r[15]=1,r}function Mn(r){return"mat4("+r[0]+", "+r[1]+", "+r[2]+", "+r[3]+", "+r[4]+", "+r[5]+", "+r[6]+", "+r[7]+", "+r[8]+", "+r[9]+", "+r[10]+", "+r[11]+", "+r[12]+", "+r[13]+", "+r[14]+", "+r[15]+")"}function dn(r){return Math.hypot(r[0],r[1],r[2],r[3],r[4],r[5],r[6],r[7],r[8],r[9],r[10],r[11],r[12],r[13],r[14],r[15])}function gn(r,t,e){return r[0]=t[0]+e[0],r[1]=t[1]+e[1],r[2]=t[2]+e[2],r[3]=t[3]+e[3],r[4]=t[4]+e[4],r[5]=t[5]+e[5],r[6]=t[6]+e[6],r[7]=t[7]+e[7],r[8]=t[8]+e[8],r[9]=t[9]+e[9],r[10]=t[10]+e[10],r[11]=t[11]+e[11],r[12]=t[12]+e[12],r[13]=t[13]+e[13],r[14]=t[14]+e[14],r[15]=t[15]+e[15],r}function zt(r,t,e){return r[0]=t[0]-e[0],r[1]=t[1]-e[1],r[2]=t[2]-e[2],r[3]=t[3]-e[3],r[4]=t[4]-e[4],r[5]=t[5]-e[5],r[6]=t[6]-e[6],r[7]=t[7]-e[7],r[8]=t[8]-e[8],r[9]=t[9]-e[9],r[10]=t[10]-e[10],r[11]=t[11]-e[11],r[12]=t[12]-e[12],r[13]=t[13]-e[13],r[14]=t[14]-e[14],r[15]=t[15]-e[15],r}function yn(r,t,e){return r[0]=t[0]*e,r[1]=t[1]*e,r[2]=t[2]*e,r[3]=t[3]*e,r[4]=t[4]*e,r[5]=t[5]*e,r[6]=t[6]*e,r[7]=t[7]*e,r[8]=t[8]*e,r[9]=t[9]*e,r[10]=t[10]*e,r[11]=t[11]*e,r[12]=t[12]*e,r[13]=t[13]*e,r[14]=t[14]*e,r[15]=t[15]*e,r}function wn(r,t,e,i){return r[0]=t[0]+e[0]*i,r[1]=t[1]+e[1]*i,r[2]=t[2]+e[2]*i,r[3]=t[3]+e[3]*i,r[4]=t[4]+e[4]*i,r[5]=t[5]+e[5]*i,r[6]=t[6]+e[6]*i,r[7]=t[7]+e[7]*i,r[8]=t[8]+e[8]*i,r[9]=t[9]+e[9]*i,r[10]=t[10]+e[10]*i,r[11]=t[11]+e[11]*i,r[12]=t[12]+e[12]*i,r[13]=t[13]+e[13]*i,r[14]=t[14]+e[14]*i,r[15]=t[15]+e[15]*i,r}function En(r,t){return r[0]===t[0]&&r[1]===t[1]&&r[2]===t[2]&&r[3]===t[3]&&r[4]===t[4]&&r[5]===t[5]&&r[6]===t[6]&&r[7]===t[7]&&r[8]===t[8]&&r[9]===t[9]&&r[10]===t[10]&&r[11]===t[11]&&r[12]===t[12]&&r[13]===t[13]&&r[14]===t[14]&&r[15]===t[15]}function Pn(r,t){var e=r[0],i=r[1],n=r[2],s=r[3],a=r[4],h=r[5],o=r[6],c=r[7],f=r[8],l=r[9],p=r[10],x=r[11],v=r[12],d=r[13],m=r[14],g=r[15],w=t[0],E=t[1],P=t[2],R=t[3],A=t[4],F=t[5],D=t[6],O=t[7],I=t[8],_=t[9],C=t[10],Y=t[11],b=t[12],X=t[13],ir=t[14],nr=t[15];return Math.abs(e-w)<=y*Math.max(1,Math.abs(e),Math.abs(w))&&Math.abs(i-E)<=y*Math.max(1,Math.abs(i),Math.abs(E))&&Math.abs(n-P)<=y*Math.max(1,Math.abs(n),Math.abs(P))&&Math.abs(s-R)<=y*Math.max(1,Math.abs(s),Math.abs(R))&&Math.abs(a-A)<=y*Math.max(1,Math.abs(a),Math.abs(A))&&Math.abs(h-F)<=y*Math.max(1,Math.abs(h),Math.abs(F))&&Math.abs(o-D)<=y*Math.max(1,Math.abs(o),Math.abs(D))&&Math.abs(c-O)<=y*Math.max(1,Math.abs(c),Math.abs(O))&&Math.abs(f-I)<=y*Math.max(1,Math.abs(f),Math.abs(I))&&Math.abs(l-_)<=y*Math.max(1,Math.abs(l),Math.abs(_))&&Math.abs(p-C)<=y*Math.max(1,Math.abs(p),Math.abs(C))&&Math.abs(x-Y)<=y*Math.max(1,Math.abs(x),Math.abs(Y))&&Math.abs(v-b)<=y*Math.max(1,Math.abs(v),Math.abs(b))&&Math.abs(d-X)<=y*Math.max(1,Math.abs(d),Math.abs(X))&&Math.abs(m-ir)<=y*Math.max(1,Math.abs(m),Math.abs(ir))&&Math.abs(g-nr)<=y*Math.max(1,Math.abs(g),Math.abs(nr))}var An=Pt,Rn=zt;var K={};V(K,{add:()=>Vs,calculateW:()=>Ds,clone:()=>Us,conjugate:()=>Ns,copy:()=>gr,create:()=>ar,dot:()=>yr,equals:()=>ks,exactEquals:()=>Ws,exp:()=>Bt,fromEuler:()=>_s,fromMat3:()=>jt,fromValues:()=>us,getAngle:()=>Ls,getAxisAngle:()=>Is,identity:()=>Ss,invert:()=>Fs,len:()=>Xs,length:()=>wr,lerp:()=>Bs,ln:()=>Xt,mul:()=>Gs,multiply:()=>Gt,normalize:()=>st,pow:()=>Os,random:()=>Cs,rotateX:()=>et,rotateY:()=>it,rotateZ:()=>nt,rotationTo:()=>Hs,scale:()=>Wt,set:()=>qs,setAxes:()=>Qs,setAxisAngle:()=>Vt,slerp:()=>dr,sqlerp:()=>$s,sqrLen:()=>js,squaredLength:()=>Er,str:()=>Ys});var z={};V(z,{add:()=>Sn,angle:()=>Hn,bezier:()=>qn,ceil:()=>In,clone:()=>Tn,copy:()=>bn,create:()=>lr,cross:()=>sr,dist:()=>es,distance:()=>Ot,div:()=>ts,divide:()=>Dt,dot:()=>xr,equals:()=>Jn,exactEquals:()=>Zn,floor:()=>Ln,forEach:()=>ss,fromValues:()=>pr,hermite:()=>un,inverse:()=>Yn,len:()=>Xr,length:()=>St,lerp:()=>Un,max:()=>On,min:()=>Dn,mul:()=>rs,multiply:()=>Lt,negate:()=>_n,normalize:()=>Br,random:()=>Vn,rotateX:()=>jn,rotateY:()=>Wn,rotateZ:()=>kn,round:()=>Cn,scale:()=>Fn,scaleAndAdd:()=>Nn,set:()=>zn,sqrDist:()=>is,sqrLen:()=>ns,squaredDistance:()=>Ct,squaredLength:()=>Ft,str:()=>Qn,sub:()=>Kn,subtract:()=>It,transformMat3:()=>Bn,transformMat4:()=>Gn,transformQuat:()=>Xn,zero:()=>$n});function lr(){var r=new T(3);return T!=Float32Array&&(r[0]=0,r[1]=0,r[2]=0),r}function Tn(r){var t=new T(3);return t[0]=r[0],t[1]=r[1],t[2]=r[2],t}function St(r){var t=r[0],e=r[1],i=r[2];return Math.hypot(t,e,i)}function pr(r,t,e){var i=new T(3);return i[0]=r,i[1]=t,i[2]=e,i}function bn(r,t){return r[0]=t[0],r[1]=t[1],r[2]=t[2],r}function zn(r,t,e,i){return r[0]=t,r[1]=e,r[2]=i,r}function Sn(r,t,e){return r[0]=t[0]+e[0],r[1]=t[1]+e[1],r[2]=t[2]+e[2],r}function It(r,t,e){return r[0]=t[0]-e[0],r[1]=t[1]-e[1],r[2]=t[2]-e[2],r}function Lt(r,t,e){return r[0]=t[0]*e[0],r[1]=t[1]*e[1],r[2]=t[2]*e[2],r}function Dt(r,t,e){return r[0]=t[0]/e[0],r[1]=t[1]/e[1],r[2]=t[2]/e[2],r}function In(r,t){return r[0]=Math.ceil(t[0]),r[1]=Math.ceil(t[1]),r[2]=Math.ceil(t[2]),r}function Ln(r,t){return r[0]=Math.floor(t[0]),r[1]=Math.floor(t[1]),r[2]=Math.floor(t[2]),r}function Dn(r,t,e){return r[0]=Math.min(t[0],e[0]),r[1]=Math.min(t[1],e[1]),r[2]=Math.min(t[2],e[2]),r}function On(r,t,e){return r[0]=Math.max(t[0],e[0]),r[1]=Math.max(t[1],e[1]),r[2]=Math.max(t[2],e[2]),r}function Cn(r,t){return r[0]=Math.round(t[0]),r[1]=Math.round(t[1]),r[2]=Math.round(t[2]),r}function Fn(r,t,e){return r[0]=t[0]*e,r[1]=t[1]*e,r[2]=t[2]*e,r}function Nn(r,t,e,i){return r[0]=t[0]+e[0]*i,r[1]=t[1]+e[1]*i,r[2]=t[2]+e[2]*i,r}function Ot(r,t){var e=t[0]-r[0],i=t[1]-r[1],n=t[2]-r[2];return Math.hypot(e,i,n)}function Ct(r,t){var e=t[0]-r[0],i=t[1]-r[1],n=t[2]-r[2];return e*e+i*i+n*n}function Ft(r){var t=r[0],e=r[1],i=r[2];return t*t+e*e+i*i}function _n(r,t){return r[0]=-t[0],r[1]=-t[1],r[2]=-t[2],r}function Yn(r,t){return r[0]=1/t[0],r[1]=1/t[1],r[2]=1/t[2],r}function Br(r,t){var e=t[0],i=t[1],n=t[2],s=e*e+i*i+n*n;return s>0&&(s=1/Math.sqrt(s)),r[0]=t[0]*s,r[1]=t[1]*s,r[2]=t[2]*s,r}function xr(r,t){return r[0]*t[0]+r[1]*t[1]+r[2]*t[2]}function sr(r,t,e){var i=t[0],n=t[1],s=t[2],a=e[0],h=e[1],o=e[2];return r[0]=n*o-s*h,r[1]=s*a-i*o,r[2]=i*h-n*a,r}function Un(r,t,e,i){var n=t[0],s=t[1],a=t[2];return r[0]=n+i*(e[0]-n),r[1]=s+i*(e[1]-s),r[2]=a+i*(e[2]-a),r}function un(r,t,e,i,n,s){var a=s*s,h=a*(2*s-3)+1,o=a*(s-2)+s,c=a*(s-1),f=a*(3-2*s);return r[0]=t[0]*h+e[0]*o+i[0]*c+n[0]*f,r[1]=t[1]*h+e[1]*o+i[1]*c+n[1]*f,r[2]=t[2]*h+e[2]*o+i[2]*c+n[2]*f,r}function qn(r,t,e,i,n,s){var a=1-s,h=a*a,o=s*s,c=h*a,f=3*s*h,l=3*o*a,p=o*s;return r[0]=t[0]*c+e[0]*f+i[0]*l+n[0]*p,r[1]=t[1]*c+e[1]*f+i[1]*l+n[1]*p,r[2]=t[2]*c+e[2]*f+i[2]*l+n[2]*p,r}function Vn(r,t){t=t||1;var e=u()*2*Math.PI,i=u()*2-1,n=Math.sqrt(1-i*i)*t;return r[0]=Math.cos(e)*n,r[1]=Math.sin(e)*n,r[2]=i*t,r}function Gn(r,t,e){var i=t[0],n=t[1],s=t[2],a=e[3]*i+e[7]*n+e[11]*s+e[15];return a=a||1,r[0]=(e[0]*i+e[4]*n+e[8]*s+e[12])/a,r[1]=(e[1]*i+e[5]*n+e[9]*s+e[13])/a,r[2]=(e[2]*i+e[6]*n+e[10]*s+e[14])/a,r}function Bn(r,t,e){var i=t[0],n=t[1],s=t[2];return r[0]=i*e[0]+n*e[3]+s*e[6],r[1]=i*e[1]+n*e[4]+s*e[7],r[2]=i*e[2]+n*e[5]+s*e[8],r}function Xn(r,t,e){var i=e[0],n=e[1],s=e[2],a=e[3],h=t[0],o=t[1],c=t[2],f=n*c-s*o,l=s*h-i*c,p=i*o-n*h,x=n*p-s*l,v=s*f-i*p,d=i*l-n*f,m=a*2;return f*=m,l*=m,p*=m,x*=2,v*=2,d*=2,r[0]=h+f+x,r[1]=o+l+v,r[2]=c+p+d,r}function jn(r,t,e,i){var n=[],s=[];return n[0]=t[0]-e[0],n[1]=t[1]-e[1],n[2]=t[2]-e[2],s[0]=n[0],s[1]=n[1]*Math.cos(i)-n[2]*Math.sin(i),s[2]=n[1]*Math.sin(i)+n[2]*Math.cos(i),r[0]=s[0]+e[0],r[1]=s[1]+e[1],r[2]=s[2]+e[2],r}function Wn(r,t,e,i){var n=[],s=[];return n[0]=t[0]-e[0],n[1]=t[1]-e[1],n[2]=t[2]-e[2],s[0]=n[2]*Math.sin(i)+n[0]*Math.cos(i),s[1]=n[1],s[2]=n[2]*Math.cos(i)-n[0]*Math.sin(i),r[0]=s[0]+e[0],r[1]=s[1]+e[1],r[2]=s[2]+e[2],r}function kn(r,t,e,i){var n=[],s=[];return n[0]=t[0]-e[0],n[1]=t[1]-e[1],n[2]=t[2]-e[2],s[0]=n[0]*Math.cos(i)-n[1]*Math.sin(i),s[1]=n[0]*Math.sin(i)+n[1]*Math.cos(i),s[2]=n[2],r[0]=s[0]+e[0],r[1]=s[1]+e[1],r[2]=s[2]+e[2],r}function Hn(r,t){var e=r[0],i=r[1],n=r[2],s=t[0],a=t[1],h=t[2],o=Math.sqrt(e*e+i*i+n*n),c=Math.sqrt(s*s+a*a+h*h),f=o*c,l=f&&xr(r,t)/f;return Math.acos(Math.min(Math.max(l,-1),1))}function $n(r){return r[0]=0,r[1]=0,r[2]=0,r}function Qn(r){return"vec3("+r[0]+", "+r[1]+", "+r[2]+")"}function Zn(r,t){return r[0]===t[0]&&r[1]===t[1]&&r[2]===t[2]}function Jn(r,t){var e=r[0],i=r[1],n=r[2],s=t[0],a=t[1],h=t[2];return Math.abs(e-s)<=y*Math.max(1,Math.abs(e),Math.abs(s))&&Math.abs(i-a)<=y*Math.max(1,Math.abs(i),Math.abs(a))&&Math.abs(n-h)<=y*Math.max(1,Math.abs(n),Math.abs(h))}var Kn=It,rs=Lt,ts=Dt,es=Ot,is=Ct,Xr=St,ns=Ft,ss=function(){var r=lr();return function(t,e,i,n,s,a){var h,o;for(e||(e=3),i||(i=0),n?o=Math.min(n*e+i,t.length):o=t.length,h=i;h<o;h+=e)r[0]=t[h],r[1]=t[h+1],r[2]=t[h+2],s(r,r,a),t[h]=r[0],t[h+1]=r[1],t[h+2]=r[2];return t}}();var Mr={};V(Mr,{add:()=>$r,ceil:()=>as,clone:()=>jr,copy:()=>kr,create:()=>Nt,cross:()=>vs,dist:()=>As,distance:()=>ut,div:()=>Ps,divide:()=>Ut,dot:()=>Jr,equals:()=>tt,exactEquals:()=>rt,floor:()=>hs,forEach:()=>zs,fromValues:()=>Wr,inverse:()=>xs,len:()=>Ts,length:()=>vr,lerp:()=>Kr,max:()=>cs,min:()=>os,mul:()=>Es,multiply:()=>Yt,negate:()=>ps,normalize:()=>Zr,random:()=>ms,round:()=>fs,scale:()=>Qr,scaleAndAdd:()=>ls,set:()=>Hr,sqrDist:()=>Rs,sqrLen:()=>bs,squaredDistance:()=>qt,squaredLength:()=>mr,str:()=>ys,sub:()=>ws,subtract:()=>_t,transformMat4:()=>Ms,transformQuat:()=>ds,zero:()=>gs});function Nt(){var r=new T(4);return T!=Float32Array&&(r[0]=0,r[1]=0,r[2]=0,r[3]=0),r}function jr(r){var t=new T(4);return t[0]=r[0],t[1]=r[1],t[2]=r[2],t[3]=r[3],t}function Wr(r,t,e,i){var n=new T(4);return n[0]=r,n[1]=t,n[2]=e,n[3]=i,n}function kr(r,t){return r[0]=t[0],r[1]=t[1],r[2]=t[2],r[3]=t[3],r}function Hr(r,t,e,i,n){return r[0]=t,r[1]=e,r[2]=i,r[3]=n,r}function $r(r,t,e){return r[0]=t[0]+e[0],r[1]=t[1]+e[1],r[2]=t[2]+e[2],r[3]=t[3]+e[3],r}function _t(r,t,e){return r[0]=t[0]-e[0],r[1]=t[1]-e[1],r[2]=t[2]-e[2],r[3]=t[3]-e[3],r}function Yt(r,t,e){return r[0]=t[0]*e[0],r[1]=t[1]*e[1],r[2]=t[2]*e[2],r[3]=t[3]*e[3],r}function Ut(r,t,e){return r[0]=t[0]/e[0],r[1]=t[1]/e[1],r[2]=t[2]/e[2],r[3]=t[3]/e[3],r}function as(r,t){return r[0]=Math.ceil(t[0]),r[1]=Math.ceil(t[1]),r[2]=Math.ceil(t[2]),r[3]=Math.ceil(t[3]),r}function hs(r,t){return r[0]=Math.floor(t[0]),r[1]=Math.floor(t[1]),r[2]=Math.floor(t[2]),r[3]=Math.floor(t[3]),r}function os(r,t,e){return r[0]=Math.min(t[0],e[0]),r[1]=Math.min(t[1],e[1]),r[2]=Math.min(t[2],e[2]),r[3]=Math.min(t[3],e[3]),r}function cs(r,t,e){return r[0]=Math.max(t[0],e[0]),r[1]=Math.max(t[1],e[1]),r[2]=Math.max(t[2],e[2]),r[3]=Math.max(t[3],e[3]),r}function fs(r,t){return r[0]=Math.round(t[0]),r[1]=Math.round(t[1]),r[2]=Math.round(t[2]),r[3]=Math.round(t[3]),r}function Qr(r,t,e){return r[0]=t[0]*e,r[1]=t[1]*e,r[2]=t[2]*e,r[3]=t[3]*e,r}function ls(r,t,e,i){return r[0]=t[0]+e[0]*i,r[1]=t[1]+e[1]*i,r[2]=t[2]+e[2]*i,r[3]=t[3]+e[3]*i,r}function ut(r,t){var e=t[0]-r[0],i=t[1]-r[1],n=t[2]-r[2],s=t[3]-r[3];return Math.hypot(e,i,n,s)}function qt(r,t){var e=t[0]-r[0],i=t[1]-r[1],n=t[2]-r[2],s=t[3]-r[3];return e*e+i*i+n*n+s*s}function vr(r){var t=r[0],e=r[1],i=r[2],n=r[3];return Math.hypot(t,e,i,n)}function mr(r){var t=r[0],e=r[1],i=r[2],n=r[3];return t*t+e*e+i*i+n*n}function ps(r,t){return r[0]=-t[0],r[1]=-t[1],r[2]=-t[2],r[3]=-t[3],r}function xs(r,t){return r[0]=1/t[0],r[1]=1/t[1],r[2]=1/t[2],r[3]=1/t[3],r}function Zr(r,t){var e=t[0],i=t[1],n=t[2],s=t[3],a=e*e+i*i+n*n+s*s;return a>0&&(a=1/Math.sqrt(a)),r[0]=e*a,r[1]=i*a,r[2]=n*a,r[3]=s*a,r}function Jr(r,t){return r[0]*t[0]+r[1]*t[1]+r[2]*t[2]+r[3]*t[3]}function vs(r,t,e,i){var n=e[0]*i[1]-e[1]*i[0],s=e[0]*i[2]-e[2]*i[0],a=e[0]*i[3]-e[3]*i[0],h=e[1]*i[2]-e[2]*i[1],o=e[1]*i[3]-e[3]*i[1],c=e[2]*i[3]-e[3]*i[2],f=t[0],l=t[1],p=t[2],x=t[3];return r[0]=l*c-p*o+x*h,r[1]=-(f*c)+p*a-x*s,r[2]=f*o-l*a+x*n,r[3]=-(f*h)+l*s-p*n,r}function Kr(r,t,e,i){var n=t[0],s=t[1],a=t[2],h=t[3];return r[0]=n+i*(e[0]-n),r[1]=s+i*(e[1]-s),r[2]=a+i*(e[2]-a),r[3]=h+i*(e[3]-h),r}function ms(r,t){t=t||1;var e,i,n,s,a,h;do e=u()*2-1,i=u()*2-1,a=e*e+i*i;while(a>=1);do n=u()*2-1,s=u()*2-1,h=n*n+s*s;while(h>=1);var o=Math.sqrt((1-a)/h);return r[0]=t*e,r[1]=t*i,r[2]=t*n*o,r[3]=t*s*o,r}function Ms(r,t,e){var i=t[0],n=t[1],s=t[2],a=t[3];return r[0]=e[0]*i+e[4]*n+e[8]*s+e[12]*a,r[1]=e[1]*i+e[5]*n+e[9]*s+e[13]*a,r[2]=e[2]*i+e[6]*n+e[10]*s+e[14]*a,r[3]=e[3]*i+e[7]*n+e[11]*s+e[15]*a,r}function ds(r,t,e){var i=t[0],n=t[1],s=t[2],a=e[0],h=e[1],o=e[2],c=e[3],f=c*i+h*s-o*n,l=c*n+o*i-a*s,p=c*s+a*n-h*i,x=-a*i-h*n-o*s;return r[0]=f*c+x*-a+l*-o-p*-h,r[1]=l*c+x*-h+p*-a-f*-o,r[2]=p*c+x*-o+f*-h-l*-a,r[3]=t[3],r}function gs(r){return r[0]=0,r[1]=0,r[2]=0,r[3]=0,r}function ys(r){return"vec4("+r[0]+", "+r[1]+", "+r[2]+", "+r[3]+")"}function rt(r,t){return r[0]===t[0]&&r[1]===t[1]&&r[2]===t[2]&&r[3]===t[3]}function tt(r,t){var e=r[0],i=r[1],n=r[2],s=r[3],a=t[0],h=t[1],o=t[2],c=t[3];return Math.abs(e-a)<=y*Math.max(1,Math.abs(e),Math.abs(a))&&Math.abs(i-h)<=y*Math.max(1,Math.abs(i),Math.abs(h))&&Math.abs(n-o)<=y*Math.max(1,Math.abs(n),Math.abs(o))&&Math.abs(s-c)<=y*Math.max(1,Math.abs(s),Math.abs(c))}var ws=_t,Es=Yt,Ps=Ut,As=ut,Rs=qt,Ts=vr,bs=mr,zs=function(){var r=Nt();return function(t,e,i,n,s,a){var h,o;for(e||(e=4),i||(i=0),n?o=Math.min(n*e+i,t.length):o=t.length,h=i;h<o;h+=e)r[0]=t[h],r[1]=t[h+1],r[2]=t[h+2],r[3]=t[h+3],s(r,r,a),t[h]=r[0],t[h+1]=r[1],t[h+2]=r[2],t[h+3]=r[3];return t}}();function ar(){var r=new T(4);return T!=Float32Array&&(r[0]=0,r[1]=0,r[2]=0),r[3]=1,r}function Ss(r){return r[0]=0,r[1]=0,r[2]=0,r[3]=1,r}function Vt(r,t,e){e=e*.5;var i=Math.sin(e);return r[0]=i*t[0],r[1]=i*t[1],r[2]=i*t[2],r[3]=Math.cos(e),r}function Is(r,t){var e=Math.acos(t[3])*2,i=Math.sin(e/2);return i>y?(r[0]=t[0]/i,r[1]=t[1]/i,r[2]=t[2]/i):(r[0]=1,r[1]=0,r[2]=0),e}function Ls(r,t){var e=yr(r,t);return Math.acos(2*e*e-1)}function Gt(r,t,e){var i=t[0],n=t[1],s=t[2],a=t[3],h=e[0],o=e[1],c=e[2],f=e[3];return r[0]=i*f+a*h+n*c-s*o,r[1]=n*f+a*o+s*h-i*c,r[2]=s*f+a*c+i*o-n*h,r[3]=a*f-i*h-n*o-s*c,r}function et(r,t,e){e*=.5;var i=t[0],n=t[1],s=t[2],a=t[3],h=Math.sin(e),o=Math.cos(e);return r[0]=i*o+a*h,r[1]=n*o+s*h,r[2]=s*o-n*h,r[3]=a*o-i*h,r}function it(r,t,e){e*=.5;var i=t[0],n=t[1],s=t[2],a=t[3],h=Math.sin(e),o=Math.cos(e);return r[0]=i*o-s*h,r[1]=n*o+a*h,r[2]=s*o+i*h,r[3]=a*o-n*h,r}function nt(r,t,e){e*=.5;var i=t[0],n=t[1],s=t[2],a=t[3],h=Math.sin(e),o=Math.cos(e);return r[0]=i*o+n*h,r[1]=n*o-i*h,r[2]=s*o+a*h,r[3]=a*o-s*h,r}function Ds(r,t){var e=t[0],i=t[1],n=t[2];return r[0]=e,r[1]=i,r[2]=n,r[3]=Math.sqrt(Math.abs(1-e*e-i*i-n*n)),r}function Bt(r,t){var e=t[0],i=t[1],n=t[2],s=t[3],a=Math.sqrt(e*e+i*i+n*n),h=Math.exp(s),o=a>0?h*Math.sin(a)/a:0;return r[0]=e*o,r[1]=i*o,r[2]=n*o,r[3]=h*Math.cos(a),r}function Xt(r,t){var e=t[0],i=t[1],n=t[2],s=t[3],a=Math.sqrt(e*e+i*i+n*n),h=a>0?Math.atan2(a,s)/a:0;return r[0]=e*h,r[1]=i*h,r[2]=n*h,r[3]=.5*Math.log(e*e+i*i+n*n+s*s),r}function Os(r,t,e){return Xt(r,t),Wt(r,r,e),Bt(r,r),r}function dr(r,t,e,i){var n=t[0],s=t[1],a=t[2],h=t[3],o=e[0],c=e[1],f=e[2],l=e[3],p,x,v,d,m;return x=n*o+s*c+a*f+h*l,x<0&&(x=-x,o=-o,c=-c,f=-f,l=-l),1-x>y?(p=Math.acos(x),v=Math.sin(p),d=Math.sin((1-i)*p)/v,m=Math.sin(i*p)/v):(d=1-i,m=i),r[0]=d*n+m*o,r[1]=d*s+m*c,r[2]=d*a+m*f,r[3]=d*h+m*l,r}function Cs(r){var t=u(),e=u(),i=u(),n=Math.sqrt(1-t),s=Math.sqrt(t);return r[0]=n*Math.sin(2*Math.PI*e),r[1]=n*Math.cos(2*Math.PI*e),r[2]=s*Math.sin(2*Math.PI*i),r[3]=s*Math.cos(2*Math.PI*i),r}function Fs(r,t){var e=t[0],i=t[1],n=t[2],s=t[3],a=e*e+i*i+n*n+s*s,h=a?1/a:0;return r[0]=-e*h,r[1]=-i*h,r[2]=-n*h,r[3]=s*h,r}function Ns(r,t){return r[0]=-t[0],r[1]=-t[1],r[2]=-t[2],r[3]=t[3],r}function jt(r,t){var e=t[0]+t[4]+t[8],i;if(e>0)i=Math.sqrt(e+1),r[3]=.5*i,i=.5/i,r[0]=(t[5]-t[7])*i,r[1]=(t[6]-t[2])*i,r[2]=(t[1]-t[3])*i;else{var n=0;t[4]>t[0]&&(n=1),t[8]>t[n*3+n]&&(n=2);var s=(n+1)%3,a=(n+2)%3;i=Math.sqrt(t[n*3+n]-t[s*3+s]-t[a*3+a]+1),r[n]=.5*i,i=.5/i,r[3]=(t[s*3+a]-t[a*3+s])*i,r[s]=(t[s*3+n]+t[n*3+s])*i,r[a]=(t[a*3+n]+t[n*3+a])*i}return r}function _s(r,t,e,i){var n=.5*Math.PI/180;t*=n,e*=n,i*=n;var s=Math.sin(t),a=Math.cos(t),h=Math.sin(e),o=Math.cos(e),c=Math.sin(i),f=Math.cos(i);return r[0]=s*o*f-a*h*c,r[1]=a*h*f+s*o*c,r[2]=a*o*c-s*h*f,r[3]=a*o*f+s*h*c,r}function Ys(r){return"quat("+r[0]+", "+r[1]+", "+r[2]+", "+r[3]+")"}var Us=jr,us=Wr,gr=kr,qs=Hr,Vs=$r,Gs=Gt,Wt=Qr,yr=Jr,Bs=Kr,wr=vr,Xs=wr,Er=mr,js=Er,st=Zr,Ws=rt,ks=tt,Hs=function(){var r=lr(),t=pr(1,0,0),e=pr(0,1,0);return function(i,n,s){var a=xr(n,s);return a<-.999999?(sr(r,t,n),Xr(r)<1e-6&&sr(r,e,n),Br(r,r),Vt(i,r,Math.PI),i):a>.999999?(i[0]=0,i[1]=0,i[2]=0,i[3]=1,i):(sr(r,n,s),i[0]=r[0],i[1]=r[1],i[2]=r[2],i[3]=1+a,st(i,i))}}(),$s=function(){var r=ar(),t=ar();return function(e,i,n,s,a,h){return dr(r,i,a,h),dr(t,n,s,h),dr(e,r,t,2*h*(1-h)),e}}(),Qs=function(){var r=qr();return function(t,e,i,n){return r[0]=i[0],r[3]=i[1],r[6]=i[2],r[1]=n[0],r[4]=n[1],r[7]=n[2],r[2]=-e[0],r[5]=-e[1],r[8]=-e[2],st(t,jt(t,r))}}();var at={};V(at,{add:()=>ga,clone:()=>Js,conjugate:()=>Aa,copy:()=>Ht,create:()=>Zs,dot:()=>Qt,equals:()=>Ia,exactEquals:()=>Sa,fromMat4:()=>ia,fromRotation:()=>ea,fromRotationTranslation:()=>kt,fromRotationTranslationValues:()=>ra,fromTranslation:()=>ta,fromValues:()=>Ks,getDual:()=>ha,getReal:()=>aa,getTranslation:()=>fa,identity:()=>na,invert:()=>Pa,len:()=>Ra,length:()=>Zt,lerp:()=>Ea,mul:()=>ya,multiply:()=>$t,normalize:()=>ba,rotateAroundAxis:()=>da,rotateByQuatAppend:()=>ma,rotateByQuatPrepend:()=>Ma,rotateX:()=>pa,rotateY:()=>xa,rotateZ:()=>va,scale:()=>wa,set:()=>sa,setDual:()=>ca,setReal:()=>oa,sqrLen:()=>Ta,squaredLength:()=>Pr,str:()=>za,translate:()=>la});function Zs(){var r=new T(8);return T!=Float32Array&&(r[0]=0,r[1]=0,r[2]=0,r[4]=0,r[5]=0,r[6]=0,r[7]=0),r[3]=1,r}function Js(r){var t=new T(8);return t[0]=r[0],t[1]=r[1],t[2]=r[2],t[3]=r[3],t[4]=r[4],t[5]=r[5],t[6]=r[6],t[7]=r[7],t}function Ks(r,t,e,i,n,s,a,h){var o=new T(8);return o[0]=r,o[1]=t,o[2]=e,o[3]=i,o[4]=n,o[5]=s,o[6]=a,o[7]=h,o}function ra(r,t,e,i,n,s,a){var h=new T(8);h[0]=r,h[1]=t,h[2]=e,h[3]=i;var o=n*.5,c=s*.5,f=a*.5;return h[4]=o*i+c*e-f*t,h[5]=c*i+f*r-o*e,h[6]=f*i+o*t-c*r,h[7]=-o*r-c*t-f*e,h}function kt(r,t,e){var i=e[0]*.5,n=e[1]*.5,s=e[2]*.5,a=t[0],h=t[1],o=t[2],c=t[3];return r[0]=a,r[1]=h,r[2]=o,r[3]=c,r[4]=i*c+n*o-s*h,r[5]=n*c+s*a-i*o,r[6]=s*c+i*h-n*a,r[7]=-i*a-n*h-s*o,r}function ta(r,t){return r[0]=0,r[1]=0,r[2]=0,r[3]=1,r[4]=t[0]*.5,r[5]=t[1]*.5,r[6]=t[2]*.5,r[7]=0,r}function ea(r,t){return r[0]=t[0],r[1]=t[1],r[2]=t[2],r[3]=t[3],r[4]=0,r[5]=0,r[6]=0,r[7]=0,r}function ia(r,t){var e=ar();Gr(e,t);var i=new T(3);return Vr(i,t),kt(r,e,i),r}function Ht(r,t){return r[0]=t[0],r[1]=t[1],r[2]=t[2],r[3]=t[3],r[4]=t[4],r[5]=t[5],r[6]=t[6],r[7]=t[7],r}function na(r){return r[0]=0,r[1]=0,r[2]=0,r[3]=1,r[4]=0,r[5]=0,r[6]=0,r[7]=0,r}function sa(r,t,e,i,n,s,a,h,o){return r[0]=t,r[1]=e,r[2]=i,r[3]=n,r[4]=s,r[5]=a,r[6]=h,r[7]=o,r}var aa=gr;function ha(r,t){return r[0]=t[4],r[1]=t[5],r[2]=t[6],r[3]=t[7],r}var oa=gr;function ca(r,t){return r[4]=t[0],r[5]=t[1],r[6]=t[2],r[7]=t[3],r}function fa(r,t){var e=t[4],i=t[5],n=t[6],s=t[7],a=-t[0],h=-t[1],o=-t[2],c=t[3];return r[0]=(e*c+s*a+i*o-n*h)*2,r[1]=(i*c+s*h+n*a-e*o)*2,r[2]=(n*c+s*o+e*h-i*a)*2,r}function la(r,t,e){var i=t[0],n=t[1],s=t[2],a=t[3],h=e[0]*.5,o=e[1]*.5,c=e[2]*.5,f=t[4],l=t[5],p=t[6],x=t[7];return r[0]=i,r[1]=n,r[2]=s,r[3]=a,r[4]=a*h+n*c-s*o+f,r[5]=a*o+s*h-i*c+l,r[6]=a*c+i*o-n*h+p,r[7]=-i*h-n*o-s*c+x,r}function pa(r,t,e){var i=-t[0],n=-t[1],s=-t[2],a=t[3],h=t[4],o=t[5],c=t[6],f=t[7],l=h*a+f*i+o*s-c*n,p=o*a+f*n+c*i-h*s,x=c*a+f*s+h*n-o*i,v=f*a-h*i-o*n-c*s;return et(r,t,e),i=r[0],n=r[1],s=r[2],a=r[3],r[4]=l*a+v*i+p*s-x*n,r[5]=p*a+v*n+x*i-l*s,r[6]=x*a+v*s+l*n-p*i,r[7]=v*a-l*i-p*n-x*s,r}function xa(r,t,e){var i=-t[0],n=-t[1],s=-t[2],a=t[3],h=t[4],o=t[5],c=t[6],f=t[7],l=h*a+f*i+o*s-c*n,p=o*a+f*n+c*i-h*s,x=c*a+f*s+h*n-o*i,v=f*a-h*i-o*n-c*s;return it(r,t,e),i=r[0],n=r[1],s=r[2],a=r[3],r[4]=l*a+v*i+p*s-x*n,r[5]=p*a+v*n+x*i-l*s,r[6]=x*a+v*s+l*n-p*i,r[7]=v*a-l*i-p*n-x*s,r}function va(r,t,e){var i=-t[0],n=-t[1],s=-t[2],a=t[3],h=t[4],o=t[5],c=t[6],f=t[7],l=h*a+f*i+o*s-c*n,p=o*a+f*n+c*i-h*s,x=c*a+f*s+h*n-o*i,v=f*a-h*i-o*n-c*s;return nt(r,t,e),i=r[0],n=r[1],s=r[2],a=r[3],r[4]=l*a+v*i+p*s-x*n,r[5]=p*a+v*n+x*i-l*s,r[6]=x*a+v*s+l*n-p*i,r[7]=v*a-l*i-p*n-x*s,r}function ma(r,t,e){var i=e[0],n=e[1],s=e[2],a=e[3],h=t[0],o=t[1],c=t[2],f=t[3];return r[0]=h*a+f*i+o*s-c*n,r[1]=o*a+f*n+c*i-h*s,r[2]=c*a+f*s+h*n-o*i,r[3]=f*a-h*i-o*n-c*s,h=t[4],o=t[5],c=t[6],f=t[7],r[4]=h*a+f*i+o*s-c*n,r[5]=o*a+f*n+c*i-h*s,r[6]=c*a+f*s+h*n-o*i,r[7]=f*a-h*i-o*n-c*s,r}function Ma(r,t,e){var i=t[0],n=t[1],s=t[2],a=t[3],h=e[0],o=e[1],c=e[2],f=e[3];return r[0]=i*f+a*h+n*c-s*o,r[1]=n*f+a*o+s*h-i*c,r[2]=s*f+a*c+i*o-n*h,r[3]=a*f-i*h-n*o-s*c,h=e[4],o=e[5],c=e[6],f=e[7],r[4]=i*f+a*h+n*c-s*o,r[5]=n*f+a*o+s*h-i*c,r[6]=s*f+a*c+i*o-n*h,r[7]=a*f-i*h-n*o-s*c,r}function da(r,t,e,i){if(Math.abs(i)<y)return Ht(r,t);var n=Math.hypot(e[0],e[1],e[2]);i=i*.5;var s=Math.sin(i),a=s*e[0]/n,h=s*e[1]/n,o=s*e[2]/n,c=Math.cos(i),f=t[0],l=t[1],p=t[2],x=t[3];r[0]=f*c+x*a+l*o-p*h,r[1]=l*c+x*h+p*a-f*o,r[2]=p*c+x*o+f*h-l*a,r[3]=x*c-f*a-l*h-p*o;var v=t[4],d=t[5],m=t[6],g=t[7];return r[4]=v*c+g*a+d*o-m*h,r[5]=d*c+g*h+m*a-v*o,r[6]=m*c+g*o+v*h-d*a,r[7]=g*c-v*a-d*h-m*o,r}function ga(r,t,e){return r[0]=t[0]+e[0],r[1]=t[1]+e[1],r[2]=t[2]+e[2],r[3]=t[3]+e[3],r[4]=t[4]+e[4],r[5]=t[5]+e[5],r[6]=t[6]+e[6],r[7]=t[7]+e[7],r}function $t(r,t,e){var i=t[0],n=t[1],s=t[2],a=t[3],h=e[4],o=e[5],c=e[6],f=e[7],l=t[4],p=t[5],x=t[6],v=t[7],d=e[0],m=e[1],g=e[2],w=e[3];return r[0]=i*w+a*d+n*g-s*m,r[1]=n*w+a*m+s*d-i*g,r[2]=s*w+a*g+i*m-n*d,r[3]=a*w-i*d-n*m-s*g,r[4]=i*f+a*h+n*c-s*o+l*w+v*d+p*g-x*m,r[5]=n*f+a*o+s*h-i*c+p*w+v*m+x*d-l*g,r[6]=s*f+a*c+i*o-n*h+x*w+v*g+l*m-p*d,r[7]=a*f-i*h-n*o-s*c+v*w-l*d-p*m-x*g,r}var ya=$t;function wa(r,t,e){return r[0]=t[0]*e,r[1]=t[1]*e,r[2]=t[2]*e,r[3]=t[3]*e,r[4]=t[4]*e,r[5]=t[5]*e,r[6]=t[6]*e,r[7]=t[7]*e,r}var Qt=yr;function Ea(r,t,e,i){var n=1-i;return Qt(t,e)<0&&(i=-i),r[0]=t[0]*n+e[0]*i,r[1]=t[1]*n+e[1]*i,r[2]=t[2]*n+e[2]*i,r[3]=t[3]*n+e[3]*i,r[4]=t[4]*n+e[4]*i,r[5]=t[5]*n+e[5]*i,r[6]=t[6]*n+e[6]*i,r[7]=t[7]*n+e[7]*i,r}function Pa(r,t){var e=Pr(t);return r[0]=-t[0]/e,r[1]=-t[1]/e,r[2]=-t[2]/e,r[3]=t[3]/e,r[4]=-t[4]/e,r[5]=-t[5]/e,r[6]=-t[6]/e,r[7]=t[7]/e,r}function Aa(r,t){return r[0]=-t[0],r[1]=-t[1],r[2]=-t[2],r[3]=t[3],r[4]=-t[4],r[5]=-t[5],r[6]=-t[6],r[7]=t[7],r}var Zt=wr,Ra=Zt,Pr=Er,Ta=Pr;function ba(r,t){var e=Pr(t);if(e>0){e=Math.sqrt(e);var i=t[0]/e,n=t[1]/e,s=t[2]/e,a=t[3]/e,h=t[4],o=t[5],c=t[6],f=t[7],l=i*h+n*o+s*c+a*f;r[0]=i,r[1]=n,r[2]=s,r[3]=a,r[4]=(h-i*l)/e,r[5]=(o-n*l)/e,r[6]=(c-s*l)/e,r[7]=(f-a*l)/e}return r}function za(r){return"quat2("+r[0]+", "+r[1]+", "+r[2]+", "+r[3]+", "+r[4]+", "+r[5]+", "+r[6]+", "+r[7]+")"}function Sa(r,t){return r[0]===t[0]&&r[1]===t[1]&&r[2]===t[2]&&r[3]===t[3]&&r[4]===t[4]&&r[5]===t[5]&&r[6]===t[6]&&r[7]===t[7]}function Ia(r,t){var e=r[0],i=r[1],n=r[2],s=r[3],a=r[4],h=r[5],o=r[6],c=r[7],f=t[0],l=t[1],p=t[2],x=t[3],v=t[4],d=t[5],m=t[6],g=t[7];return Math.abs(e-f)<=y*Math.max(1,Math.abs(e),Math.abs(f))&&Math.abs(i-l)<=y*Math.max(1,Math.abs(i),Math.abs(l))&&Math.abs(n-p)<=y*Math.max(1,Math.abs(n),Math.abs(p))&&Math.abs(s-x)<=y*Math.max(1,Math.abs(s),Math.abs(x))&&Math.abs(a-v)<=y*Math.max(1,Math.abs(a),Math.abs(v))&&Math.abs(h-d)<=y*Math.max(1,Math.abs(h),Math.abs(d))&&Math.abs(o-m)<=y*Math.max(1,Math.abs(o),Math.abs(m))&&Math.abs(c-g)<=y*Math.max(1,Math.abs(c),Math.abs(g))}var k={};V(k,{add:()=>Fa,angle:()=>r1,ceil:()=>Na,clone:()=>La,copy:()=>Oa,create:()=>Jt,cross:()=>Wa,dist:()=>c1,distance:()=>ee,div:()=>o1,divide:()=>te,dot:()=>ja,equals:()=>n1,exactEquals:()=>i1,floor:()=>_a,forEach:()=>p1,fromValues:()=>Da,inverse:()=>Ba,len:()=>s1,length:()=>ne,lerp:()=>ka,max:()=>Ua,min:()=>Ya,mul:()=>h1,multiply:()=>re,negate:()=>Ga,normalize:()=>Xa,random:()=>Ha,rotate:()=>Ka,round:()=>ua,scale:()=>qa,scaleAndAdd:()=>Va,set:()=>Ca,sqrDist:()=>f1,sqrLen:()=>l1,squaredDistance:()=>ie,squaredLength:()=>se,str:()=>e1,sub:()=>a1,subtract:()=>Kt,transformMat2:()=>$a,transformMat2d:()=>Qa,transformMat3:()=>Za,transformMat4:()=>Ja,zero:()=>t1});function Jt(){var r=new T(2);return T!=Float32Array&&(r[0]=0,r[1]=0),r}function La(r){var t=new T(2);return t[0]=r[0],t[1]=r[1],t}function Da(r,t){var e=new T(2);return e[0]=r,e[1]=t,e}function Oa(r,t){return r[0]=t[0],r[1]=t[1],r}function Ca(r,t,e){return r[0]=t,r[1]=e,r}function Fa(r,t,e){return r[0]=t[0]+e[0],r[1]=t[1]+e[1],r}function Kt(r,t,e){return r[0]=t[0]-e[0],r[1]=t[1]-e[1],r}function re(r,t,e){return r[0]=t[0]*e[0],r[1]=t[1]*e[1],r}function te(r,t,e){return r[0]=t[0]/e[0],r[1]=t[1]/e[1],r}function Na(r,t){return r[0]=Math.ceil(t[0]),r[1]=Math.ceil(t[1]),r}function _a(r,t){return r[0]=Math.floor(t[0]),r[1]=Math.floor(t[1]),r}function Ya(r,t,e){return r[0]=Math.min(t[0],e[0]),r[1]=Math.min(t[1],e[1]),r}function Ua(r,t,e){return r[0]=Math.max(t[0],e[0]),r[1]=Math.max(t[1],e[1]),r}function ua(r,t){return r[0]=Math.round(t[0]),r[1]=Math.round(t[1]),r}function qa(r,t,e){return r[0]=t[0]*e,r[1]=t[1]*e,r}function Va(r,t,e,i){return r[0]=t[0]+e[0]*i,r[1]=t[1]+e[1]*i,r}function ee(r,t){var e=t[0]-r[0],i=t[1]-r[1];return Math.hypot(e,i)}function ie(r,t){var e=t[0]-r[0],i=t[1]-r[1];return e*e+i*i}function ne(r){var t=r[0],e=r[1];return Math.hypot(t,e)}function se(r){var t=r[0],e=r[1];return t*t+e*e}function Ga(r,t){return r[0]=-t[0],r[1]=-t[1],r}function Ba(r,t){return r[0]=1/t[0],r[1]=1/t[1],r}function Xa(r,t){var e=t[0],i=t[1],n=e*e+i*i;return n>0&&(n=1/Math.sqrt(n)),r[0]=t[0]*n,r[1]=t[1]*n,r}function ja(r,t){return r[0]*t[0]+r[1]*t[1]}function Wa(r,t,e){var i=t[0]*e[1]-t[1]*e[0];return r[0]=r[1]=0,r[2]=i,r}function ka(r,t,e,i){var n=t[0],s=t[1];return r[0]=n+i*(e[0]-n),r[1]=s+i*(e[1]-s),r}function Ha(r,t){t=t||1;var e=u()*2*Math.PI;return r[0]=Math.cos(e)*t,r[1]=Math.sin(e)*t,r}function $a(r,t,e){var i=t[0],n=t[1];return r[0]=e[0]*i+e[2]*n,r[1]=e[1]*i+e[3]*n,r}function Qa(r,t,e){var i=t[0],n=t[1];return r[0]=e[0]*i+e[2]*n+e[4],r[1]=e[1]*i+e[3]*n+e[5],r}function Za(r,t,e){var i=t[0],n=t[1];return r[0]=e[0]*i+e[3]*n+e[6],r[1]=e[1]*i+e[4]*n+e[7],r}function Ja(r,t,e){var i=t[0],n=t[1];return r[0]=e[0]*i+e[4]*n+e[12],r[1]=e[1]*i+e[5]*n+e[13],r}function Ka(r,t,e,i){var n=t[0]-e[0],s=t[1]-e[1],a=Math.sin(i),h=Math.cos(i);return r[0]=n*h-s*a+e[0],r[1]=n*a+s*h+e[1],r}function r1(r,t){var e=r[0],i=r[1],n=t[0],s=t[1],a=Math.sqrt(e*e+i*i)*Math.sqrt(n*n+s*s),h=a&&(e*n+i*s)/a;return Math.acos(Math.min(Math.max(h,-1),1))}function t1(r){return r[0]=0,r[1]=0,r}function e1(r){return"vec2("+r[0]+", "+r[1]+")"}function i1(r,t){return r[0]===t[0]&&r[1]===t[1]}function n1(r,t){var e=r[0],i=r[1],n=t[0],s=t[1];return Math.abs(e-n)<=y*Math.max(1,Math.abs(e),Math.abs(n))&&Math.abs(i-s)<=y*Math.max(1,Math.abs(i),Math.abs(s))}var s1=ne,a1=Kt,h1=re,o1=te,c1=ee,f1=ie,l1=se,p1=function(){var r=Jt();return function(t,e,i,n,s,a){var h,o;for(e||(e=2),i||(i=0),n?o=Math.min(n*e+i,t.length):o=t.length,h=i;h<o;h+=e)r[0]=t[h],r[1]=t[h+1],s(r,r,a),t[h]=r[0],t[h+1]=r[1];return t}}();var $=class{position=z.fromValues(0,0,-1);direction=z.fromValues(0,0,-1);up=z.fromValues(0,1,0);projectionMatrix=S.create();viewMatrix=S.create();cameraMatrix=S.create();viewportWidth=0;viewportHeight=0;near=1;far=100;tpmVec=z.create();constructor(){}lookAt(...t){if(t.length==1)z.copy(this.tpmVec,t[0]);else if(t.length==3)z.set(this.tpmVec,...t);else throw new Error("required 1 or 3 arguments");z.sub(this.tpmVec,this.tpmVec,this.position),z.normalize(this.tpmVec,this.tpmVec);let e=z.dot(this.tpmVec,this.up);q.equals(e,1)?z.negate(this.up,this.direction):q.equals(e,-1)&&z.copy(this.up,this.direction),z.copy(this.direction,this.tpmVec),z.cross(this.up,this.getRight(),this.direction),z.normalize(this.up,this.up)}getRight(){return z.cross(this.tpmVec,this.direction,this.up)}updateConstants(t){S.lookAt(this.viewMatrix,this.position,z.add(this.tpmVec,this.position,this.direction),this.up),S.invert(this.cameraMatrix,this.viewMatrix),t.projectionMatrix=this.projectionMatrix,t.viewMatrix=this.viewMatrix,t.cameraMatrix=this.cameraMatrix,t.cameraPosition=this.position}};var N=class{buffers=new Map;indexCount=0;options;constructor(t={}){this.options=t,this.onInit()}onInit(){}createBuffer(t,e){let i={size:e,data:[],buffer:null};return this.buffers.set(t,i),i}getBuffer(t){return this.buffers.get(t)}bufferData(t,e,i){this.buffers.set(i,{size:e,data:t,buffer:null})}initBuffer(t){let e=this.buffers.get(t);e.buffer==null&&(e.buffer=M.gl.createBuffer()),t=="index"?(M.gl.bindBuffer(M.gl.ELEMENT_ARRAY_BUFFER,e.buffer),M.gl.bufferData(M.gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(e.data),M.gl.STATIC_DRAW),this.indexCount=e.data.length):(M.gl.bindBuffer(M.gl.ARRAY_BUFFER,e.buffer),M.gl.bufferData(M.gl.ARRAY_BUFFER,new Float32Array(e.data),M.gl.STATIC_DRAW))}bind(t){this.buffers.forEach((e,i)=>{let n=t.shaderData.attribs[i];n!=-1&&(e.buffer==null&&this.initBuffer(i),i=="index"?M.gl.bindBuffer(M.gl.ELEMENT_ARRAY_BUFFER,e.buffer):(M.gl.bindBuffer(M.gl.ARRAY_BUFFER,e.buffer),M.gl.vertexAttribPointer(n,e.size,M.gl.FLOAT,!1,0,0),M.gl.enableVertexAttribArray(n)))})}draw(){M.gl.drawElements(M.gl.TRIANGLES,this.indexCount,M.gl.UNSIGNED_SHORT,0)}unbind(t){this.buffers.forEach((e,i)=>{let n=t.shaderData.attribs[i];n!=-1&&i!="index"&&M.gl.disableVertexAttribArray(n)})}};var j=class{shaderData;uniforms=new Map;constructor(t){this.shaderData=t,this.setUniform("uvOffset",[0,0])}setUniform(t,e){this.uniforms.set(t,e)}activate(){this.shaderData.activate()}bind(t){for(let e of this.shaderData.uniforms){let i=t[e.name];if(this.uniforms.has(e.name)&&(i=this.uniforms.get(e.name)),i&&e.location){let n=e.type,s=e.location;switch(n){case"mat4":M.gl.uniformMatrix4fv(s,!1,i);break;case"mat3":M.gl.uniformMatrix3fv(s,!1,val);break;case"vec4":M.gl.uniform4fv(s,i);break;case"vec3":M.gl.uniform3fv(s,i);break;case"vec2":M.gl.uniform2fv(s,i);break;case"float":M.gl.uniform1f(s,i);break}}}}};var W=class{mesh;shader;texture;position=z.create();rotation=K.create();scale=z.fromValues(1,1,1);parent=null;modelMatrix=S.create();normalMatrix=S.create();matrixAutoUpdate=!0;matrixNeedsUpdate=!0;constructor(t,e,i){this.mesh=t,this.shader=e,this.texture=i}setShader(t){this.shader=t}updateMatrix(){(this.matrixNeedsUpdate||this.matrixAutoUpdate)&&(this.matrixNeedsUpdate=!1,S.fromRotationTranslationScale(this.modelMatrix,this.rotation,this.position,this.scale),H.fromMat4(this.normalMatrix,this.modelMatrix),H.invert(this.normalMatrix,this.normalMatrix),H.transpose(this.normalMatrix,this.normalMatrix))}draw(t){this.shader.activate(),this.texture&&this.texture.bind(),this.updateMatrix();let e=t.viewMatrix,i=S.create();S.multiply(i,e,this.modelMatrix),this.shader.setUniform("modelViewMatrix",i),this.shader.setUniform("modelMatrix",this.modelMatrix),this.shader.setUniform("normalMatrix",this.normalMatrix),this.shader.bind(t),this.mesh.bind(this.shader),this.mesh.draw(),this.mesh.unbind(this.shader)}};var Ar=class extends ${fov;constructor(t,e,i,n,s){super(),this.fov=t,this.viewportWidth=e,this.viewportHeight=i,this.near=n,this.far=s,this.updateProjection()}updateProjection(){let t=this.viewportWidth/this.viewportHeight;S.perspective(this.projectionMatrix,this.fov/180*Math.PI,t,this.near,this.far)}};var ht={};V(ht,{Cone:()=>br,Cube:()=>Rr,Ellipse:()=>zr,Plane:()=>rr,Quad:()=>tr,Sphere:()=>Tr});var Rr=class extends N{onInit(){this.options.width===void 0&&(this.options.width=1),this.options.height===void 0&&(this.options.height=1),this.options.depth===void 0&&(this.options.depth=1);let t=this.options.width/2,e=this.options.height/2,i=this.options.depth/2,n=[-t,e,i,t,e,i,t,-e,i,-t,-e,i,t,e,-i,-t,e,-i,-t,-e,-i,t,-e,-i,-t,e,-i,t,e,-i,t,e,i,-t,e,i,-t,-e,i,t,-e,i,t,-e,-i,-t,-e,-i,t,e,i,t,e,-i,t,-e,-i,t,-e,i,-t,e,-i,-t,e,i,-t,-e,i,-t,-e,-i],s=[0,0,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0],a="single";this.options.textureFaces!==void 0&&(a=this.options.textureFaces);let h=[];if(a=="single")for(let l=0;l<6;++l)h.push(0,0,1,0,1,1,0,1);else if(a=="multiple"){let x=.001;this.options.textureError!==void 0&&(x=this.options.textureError);let v=(d,m)=>{let g=d*.25+x,w=(d+1)*.25-x,E=m*.5+x,P=(m+1)*.5-x;h.push(g,E,w,E,w,P,g,P)};v(1,0),v(3,0),v(0,1),v(1,1),v(2,0),v(0,0)}else if(this.options.textureFaces=="skybox"){let x=.001;this.options.textureError!==void 0&&(x=this.options.textureError);let v=(d,m)=>{let g=d*.25+x,w=(d+1)*.25-x,E=m*.5+x,P=(m+1)*.5-x;h.push(w,E,g,E,g,P,w,P)};v(1,0),v(3,0),v(0,1),v(1,1),v(0,0),v(2,0)}else throw new Error("options.textureFaces valid values are single, multiple or skybox");let o=[0,1,2,0,2,3,4,5,6,4,6,7,8,9,10,8,10,11,12,13,14,12,14,15,16,17,18,16,18,19,20,21,22,20,22,23],c=[];if(this.options.colors===void 0)for(let l=0;l<6;++l)c.push([1,1,1,1]);else if(this.options.colors.length==1){let l=this.options.colors[0];for(let p=0;p<6;++p)c.push(l)}else if(this.options.colors.length==6)for(let l=0;l<6;++l){let p=this.options.colors[l];c.push(p)}else throw new Error("options.colors requires 1 or 6 elements");let f=[];for(let l=0;l<6;++l)for(let p=0;p<4;++p)f.push(...c[l]);this.bufferData(n,3,"positions"),this.bufferData(s,3,"normals"),this.bufferData(f,4,"colors"),this.bufferData(h,2,"uvs"),this.bufferData(o,0,"index")}};var rr=class extends N{onInit(){this.options.width===void 0&&(this.options.width=1),this.options.depth===void 0&&(this.options.depth=1);let t=this.options.width/2,e=this.options.depth/2,i=this.options.widthSegments||1,n=this.options.depthSegments||1,s=this.options.heightMap||rr.generateHeightMap(i,n),a=[],h=[],o=[],c=[],f=[];for(let l=0;l<n;++l)for(let p=0;p<i;++p){a.push((2*p/i-1)*t,s[l][p],(2*l/n-1)*e,(2*(p+1)/i-1)*t,s[l][p+1],(2*l/n-1)*e,(2*(p+1)/i-1)*t,s[l+1][p+1],(2*(l+1)/n-1)*e,(2*p/i-1)*t,s[l+1][p],(2*(l+1)/n-1)*e),h.push(0,1,0,0,1,0,0,1,0,0,1,0),this.options.textureRepeat===void 0||this.options.textureRepeat===!1?o.push(p/i,l/n,(p+1)/i,l/n,(p+1)/i,(l+1)/n,p/i,(l+1)/n):o.push(0,0,1,0,1,1,0,1);let x=(l*i+p)*4;f.push(x,x+1,x+2,x,x+2,x+3)}if(this.options.colors===void 0)for(let l=0;l<i*n*16;++l)c.push(1);else if(typeof this.options.colors=="function"){let l=this.options.colors,p=[];for(let x=0;x<=n;++x){p.push([]);for(let v=0;v<=i;++v){let d=l(v/i*t*2-t,s[x][v],x/n*e*2-e);p[x].push(d)}}for(let x=0;x<n;++x)for(let v=0;v<i;++v)c.push(...p[x][v],...p[x][v+1],...p[x+1][v+1],...p[x+1][v])}else if(this.options.colors.length==1){let l=this.options.colors[0];for(let p=0;p<i*n*16;++p)c.push(l[p%4])}else throw new Error("options.colors requires 1 elements");this.bufferData(a,3,"positions"),this.bufferData(h,3,"normals"),this.bufferData(c,4,"colors"),this.bufferData(o,2,"uvs"),this.bufferData(f,0,"index")}static generateHeightMap(t,e){return[...new Array(e+1)].map(i=>[...new Array(t+1)].fill(0))}};var tr=class extends N{onInit(){this.options.width===void 0&&(this.options.width=1),this.options.height===void 0&&(this.options.height=1);let t=this.options.width/2,e=this.options.height/2,i=[-t,e,0,t,e,0,t,-e,0,-t,-e,0],n=[0,0,1,0,0,1,0,0,1,0,0,1],s=[];if(this.options.colors===void 0)for(let o=0;o<16;++o)s.push(1);else if(this.options.colors.length==1){let o=this.options.colors[0];for(let c=0;c<16;++c)s.push(o[c%4])}else if(this.options.colors.length==4)for(let o=0;o<4;++o){let c=this.options.colors[o];for(let f=0;f<4;++f)s.push(c[f])}else throw new Error("options.colors requires 1 or 4 elements");let a=[0,0,1,0,1,1,0,1],h=[0,1,2,0,2,3];this.bufferData(i,3,"positions"),this.bufferData(n,3,"normals"),this.bufferData(s,4,"colors"),this.bufferData(a,2,"uvs"),this.bufferData(h,0,"index")}};var Q=class{points=[];constructor(t){this.lerp=t}addPoint(t,e){this.points.push([t,e]);for(let i=this.points.length-1;i>0&&!(this.points[i][0]>=this.points[i-1][0]);--i)[this.points[i],this.points[i-1]]=[this.points[i-1],this.points[i]]}getValue(t){let e=0;for(let a=0;a<this.points.length&&!(t<this.points[a][0]);++a)e=a;let i=this.points[e],n=Math.min(e+1,this.points.length-1);if(e==n)return i[1];let s=this.points[n];return this.lerp((t-i[0])/(s[0]-i[0]),i[1],s[1])}};var Tr=class extends N{onInit(){this.options.radius===void 0&&(this.options.radius=.5);let t=this.options.radius,e=this.options.widthSegments||32,i=this.options.heightSegments||16,n=this.options.textureInvert===!0,s=[],a=[],h=[],o=[],c=[],f=[],l=[];for(let x=0;x<=i;++x){let v=x/i*Math.PI,d=Math.sin(v),m=Math.cos(v);for(let g=0;g<=e;++g){let w=g/e*2*Math.PI,E=Math.sin(w),P=Math.cos(w);c.push([d*P*t,m*t,d*E*t]),f.push([1-g/e,x/i])}}if(n)for(let x=0;x<f.length;x+=2)f[x]=1-f[x];if(this.options.colors===void 0)for(let x=0;x<(e+1)*(i+1);++x)l.push([1,1,1,1]);else if(this.options.colors instanceof Q)for(let x=0;x<=i;++x){let v=this.options.colors.getValue(x/i);for(let d=0;d<=e;++d)l.push(v)}else if(this.options.colors.length==1){let x=this.options.colors[0];for(let v=0;v<(e+1)*(i+1);++v)l.push(x)}else throw new Error("options.colors requires 1 elements");let p=0;for(let x=0;x<i;++x)for(let v=0;v<e;++v){let d=x*(e+1)+v,m=d+(e+1),g=[d,d+1,m+1,m];for(let w of g)s.push(...c[w]),a.push(...f[w]),h.push(...l[w]);o.push(p,p+1,p+2,p,p+2,p+3),p+=4}this.bufferData(s,3,"positions"),this.bufferData(h,4,"colors"),this.bufferData(a,2,"uvs"),this.bufferData(o,0,"index")}};var br=class extends N{onInit(){this.options.radius===void 0&&(this.options.radius=.5);let t=this.options.radius;this.options.height===void 0&&(this.options.height=1);let e=this.options.height/2,i=this.options.widthSegments||32,n=[],s=[],a=[],h=[],o=[];h.push([0,e,0]);for(let f=0;f<=i;++f){let l=f/i*2*Math.PI,p=Math.sin(l),x=Math.cos(l);h.push([x*t,-e,p*t])}if(this.options.colors===void 0)for(let f=0;f<=i;++f)o.push([1,1,1,1]);else if(this.options.colors instanceof Q)for(let f=0;f<=i;++f){let l=this.options.colors.getValue(f/i);o.push(l)}else if(this.options.colors.length==1){let f=this.options.colors[0];for(let l=0;l<=i;++l)o.push(f)}else throw new Error("");let c=0;for(let f=1;f<=i;++f){let l=[0,f,f+1];for(let p of l)n.push(...h[p]),s.push(...o[f]);a.push(c,c+1,c+2),c+=3,f!=0&&f!=i&&a.push(1,c+1,(c+4)%(i*3))}this.bufferData(n,3,"positions"),this.bufferData(s,4,"colors"),this.bufferData(a,0,"index")}};var zr=class extends N{onInit(){this.options.width===void 0&&(this.options.width=1),this.options.height===void 0&&(this.options.height=1);let t=this.options.segments||32,e=this.options.width/2,i=this.options.height/2,n=[],s=[],a=[],h=[];for(let c=0;c<=t;++c){let f=c/t*2*Math.PI,l=Math.sin(f),p=Math.cos(f);n.push(p*e,l*i,0),s.push(0,0,1),a.push((p+1)*.5,(l+1)*.5),c!=0&&c!=t&&h.push(0,c,c+1)}let o=[];if(this.options.colors===void 0)for(let c=0;c<=t;++c)o.push(1,1,1,1);else if(this.options.colors.length==1){let c=this.options.colors[0];for(let f=0;f<=t;++f)o.push(...c)}else throw new Error("options.colors requires 1 elements");this.bufferData(n,3,"positions"),this.bufferData(s,3,"normals"),this.bufferData(o,4,"colors"),this.bufferData(a,2,"uvs"),this.bufferData(h,0,"index")}};var Sr=class extends ${zoom=1;constructor(t,e){super(),this.near=0,this.setToOrtho(t,e)}setToOrtho(t,e){this.viewportWidth=t,this.viewportHeight=e,z.set(this.position,this.zoom*t/2,this.zoom*e/2,0),this.updateProjection()}updateProjection(){S.ortho(this.projectionMatrix,this.zoom*-this.viewportWidth/2,this.zoom*this.viewportWidth/2,this.zoom*-this.viewportHeight/2,this.zoom*this.viewportHeight/2,this.near,this.far)}translate(...t){if(t.length==1)z.set(this.position,...t[0],0);else if(t.length==2)z.set(this.position,t[0],t[1],0);else throw new Error("required 1 or 2 arguments")}zoomBy(...t){let e=t[0];if(this.zoom*=1+e,t.length==2||t.length==3){let i=k.create();t.length==2?k.copy(i,t[1]):k.set(i,...t),k.sub(i,i,this.position),k.scale(i,i,e),z.add(this.position,this.position,[...i,0])}}};var Ir=class extends W{regionX;regionY;regionWidth;regionHeight;constructor(...t){let e=t[0],i=0,n=0,s=e.width,a=e.height;t.length==3?(s=t[1],a=t[2]):t.length==5&&(i=t[1],n=t[2],s=t[3],a=t[4]),super(new tr,new j(M.graphics.getShader("texture")),e),this.setRegion(i,n,s,a)}setRegion(t,e,i,n){this.regionX=t,this.regionY=e,this.regionWidth=i,this.regionHeight=n;let s=this.texture.width,a=this.texture.height,h=[t/s,e/a,(t+i)/s,e/a,(t+i)/s,(e+n)/a,t/s,(e+n)/a];this.mesh.bufferData(h,2,"uvs")}setRegionSize(t,e){this.regionWidth=t,this.regionHeight=e;let i=[0,0,t/this.texture.width,0,t/this.texture.width,e/this.texture.height,0,e/this.texture.height];this.mesh.bufferData(i,2,"uvs")}setRegionPosition(t,e){this.regionX=t,this.regionY=e,this.shader.setUniform("uvOffset",[t/this.texture.width,e/this.texture.height])}};var Lr=class extends W{font;text;rainbow;constructor(t,e={}){super(new N,new j(M.graphics.getShader("texture")),t.texture),this.font=t,this.text=e.text||"",this.rainbow=e.rainbow||!1,this.align=e.align||"left",this.updateGeometry()}updateGeometry(){let t=[],e=[],i=[],n=[],s=this.font.charWidth,a=this.font.charHeight,h=this.font.options.charRatio,o;switch(this.align){case"center":o=(1-this.text.length)*h*.5;break;case"left":o=h*.5;break;case"right":o=(.5-this.text.length)*h;break;default:o=h*.5}for(let c=0;c<this.text.length;++c){let f=this.text.charCodeAt(c),l=this.font.getCharPosition(f);if(l===null)continue;let[p,x]=l;t.push(-.5*h+o,.5,0,.5*h+o,.5,0,.5*h+o,-.5,0,-.5*h+o,-.5,0),i.push(p/this.texture.width,x/this.texture.height,(p+s)/this.texture.width,x/this.texture.height,(p+s)/this.texture.width,(x+a)/this.texture.height,p/this.texture.width,(x+a)/this.texture.height);let v=c*4;n.push(v,v+1,v+2,v,v+2,v+3),o+=h}if(this.rainbow)for(let c=0;c<4*this.text.length;++c)e.push(Math.random(),Math.random(),Math.random(),1);else for(let c=0;c<4*this.text.length;++c)e.push(1,1,1,1);this.mesh.bufferData(t,3,"positions"),this.mesh.bufferData(e,4,"colors"),this.mesh.bufferData(i,2,"uvs"),this.mesh.bufferData(n,0,"index")}setText(t){this.text=t,this.updateGeometry()}};var Dr=class{position;velocity;color;alpha;size;life;maxLife;constructor(t){this.position=t.position,this.maxLife=t.life,this.life=t.life,this.size=t.size!==void 0?t.size:1,this.baseSize=this.size,this.velocity=t.velocity||[0,0,0],this.color=t.color||[1,1,1],this.alpha=t.alpha!==void 0?t.alpha:1}update(){this.life-=M.graphics.delta*1e3}},Or=class{mesh;texture;shader;particles=[];constructor(t){this.mesh=new N,this.texture=t.texture,this.shader=new j(L.create(L.Type.PARTICLE,t.shaderOptions||{})),this.onScreenResize(M.graphics.width,M.graphics.height)}onScreenResize(t,e){this.shader.setUniform("pointMultiplier",e/2*Math.tan(30*Math.PI/180))}resize(t){this.onScreenResize(0,t)}addParticles(){}updateParticles(){}updateGeometry(){let t=[],e=[],i=[];for(let n of this.particles)t.push(...n.position),e.push(...n.color,n.alpha),i.push(n.size);this.mesh.bufferData(t,3,"positions"),this.mesh.bufferData(e,4,"colors"),this.mesh.bufferData(i,1,"sizes")}draw(t){this.shader.activate(),this.texture.bind();let e=S.create(),i=t.viewMatrix,n=S.create();S.multiply(n,i,e),this.shader.setUniform("modelViewMatrix",n),this.shader.bind(t),this.mesh.bind(this.shader);let s=this.particles.length;M.gl.drawArrays(M.gl.POINTS,0,s),this.mesh.unbind(this.shader)}update(){this.addParticles(),this.updateParticles(),this.updateGeometry()}};var ot=class{mesh=new N;shader;idx=0;texture=null;onCustomProcessPosition=null;constants={projectionMatrix:S.create(),viewMatrix:S.create(),cameraMatrix:S.create(),cameraPosition:z.create()};constructor(t){this.shader=t,t.shaderData.attribs.index!=-1&&this.mesh.createBuffer("index",0),t.shaderData.attribs.positions!=-1&&this.mesh.createBuffer("positions",3),t.shaderData.attribs.uvs!=-1&&this.mesh.createBuffer("uvs",2),t.shaderData.attribs.colors!=-1&&this.mesh.createBuffer("colors",4)}setConstants(t){this.constants={...t}}begin(){this.idx=0,this.mesh.buffers.forEach(t=>{t.data.length=0}),this.texture=null}draw(t){let e=t.mesh.getBuffer("positions").data.length/3;(this.idx+e>ot.MAX_COUNT||t.texture!=this.texture)&&this.flush(),this.texture=t.texture,t.updateMatrix(),this.mesh.buffers.forEach((i,n)=>{let s=t.mesh.getBuffer(n).data;switch(n){case"positions":for(let a=0;a<s.length;a+=3){let h=z.fromValues(s[a],s[a+1],s[a+2]);this.onCustomProcessPosition&&this.onCustomProcessPosition(h,t),z.transformMat4(h,h,t.modelMatrix);for(let o=0;o<3;++o)i.data.push(h[o])}break;case"index":for(let a=0;a<s.length;++a)i.data.push(s[a]+this.idx);break;default:for(let a=0;a<s.length;++a)i.data.push(s[a])}}),this.idx+=e}end(){this.flush()}flush(){if(this.idx==0)return;this.mesh.buffers.forEach((s,a)=>{this.mesh.initBuffer(a)}),this.shader.activate(),this.texture&&this.texture.bind();let t=S.create(),e=S.create(),i=this.constants.viewMatrix,n=S.create();S.multiply(n,i,t),this.shader.setUniform("modelViewMatrix",n),this.shader.setUniform("modelMatrix",t),this.shader.setUniform("normalMatrix",e),this.shader.bind(this.constants),this.mesh.bind(this.shader),this.mesh.draw(),this.mesh.unbind(this.shader),this.idx=0,this.mesh.buffers.forEach(s=>{s.data.length=0})}},hr=ot;U(hr,"MAX_COUNT",65536);var Cr=class extends W{idx=0;constructor(t,e){super(new N,t,e),t.shaderData.attribs.index!=-1&&this.mesh.createBuffer("index",0),t.shaderData.attribs.positions!=-1&&this.mesh.createBuffer("positions",3),t.shaderData.attribs.uvs!=-1&&this.mesh.createBuffer("uvs",2),t.shaderData.attribs.colors!=-1&&this.mesh.createBuffer("colors",4)}add(t){t.updateMatrix();let e=t.mesh.getBuffer("positions").data.length/3;this.mesh.buffers.forEach((i,n)=>{let s=t.mesh.getBuffer(n).data;switch(n){case"positions":for(let a=0;a<s.length;a+=3){let h=z.fromValues(s[a],s[a+1],s[a+2]);z.transformMat4(h,h,t.modelMatrix);for(let o=0;o<3;++o)i.data.push(h[o])}break;case"index":for(let a=0;a<s.length;++a)i.data.push(s[a]+this.idx);break;default:for(let a=0;a<s.length;++a)i.data.push(s[a])}}),this.idx+=e}};var lt=class{touchInfo=[];keyInfo=new ft;constructor(){for(let t=0;t<lt.MAX_TOUCHES;++t)this.touchInfo[t]=new ct}isKeyPressed(t){return this.keyInfo.currentlyPressed.has(t)}isKeyClicked(t){return this.keyInfo.justPressed.has(t)}isTouched(t=0){return this.touchInfo[t].isTouched}isJustTouched(t=0){return this.touchInfo[t].isJustTouched}isMousePressed(){return this.isTouched()}isMouseClicked(){return this.isJustTouched()}getX(t=0){return this.touchInfo[t].x}getY(t=0){return this.touchInfo[t].y}getDeltaX(t=0){return this.touchInfo[t].deltaX}getDeltaY(t=0){return this.touchInfo[t].deltaY}initEvents(t){addEventListener("keydown",e=>this.onKeyDown(e)),addEventListener("keyup",e=>this.onKeyUp(e)),M.device.type=="mobile"?(t.addEventListener("touchstart",e=>this.handleTouchEvent(e)),t.addEventListener("touchmove",e=>this.handleTouchEvent(e)),t.addEventListener("touchend",e=>this.handleTouchEvent(e))):(t.addEventListener("mousedown",e=>this.handleMouseEvent(e)),t.addEventListener("mousemove",e=>this.handleMouseEvent(e)),t.addEventListener("mouseup",e=>this.handleMouseEvent(e)))}handleTouchEvent(t){t.cancelable&&t.preventDefault();let e=t.target.getBoundingClientRect();for(let i of t.changedTouches){let n=i.pageX-e.x,s=i.pageY-e.y,a=this.touchInfo.find(h=>h.id===i.identifier);if(!(!a&&(a=this.touchInfo.find(h=>!h.isTouched),a.id=i.identifier,!a)))switch(a.x=n,a.y=e.height-s,t.type){case"touchstart":a.isTouched=!0;break;case"touchend":a.isTouched=!1,a.id=null}}}handleMouseEvent(t){t.cancelable&&t.preventDefault();let e=t.target.getBoundingClientRect(),i=t.pageX-e.x,n=t.pageY-e.y,s=this.touchInfo[0];switch(s.x=i,s.y=e.height-n,t.type){case"mousedown":s.isTouched=!0;break;case"mouseup":s.isTouched=!1}}onKeyDown(t){t.cancelable&&t.preventDefault(),this.keyInfo.currentlyPressed.add(t.code)}onKeyUp(t){t.cancelable&&t.preventDefault(),this.keyInfo.currentlyPressed.delete(t.code)}update(){this.keyInfo.update();for(let t of this.touchInfo)t.update()}},or=lt;U(or,"MAX_TOUCHES",10);var ct=class{id=null;x=0;y=0;prevX=0;prevY=0;deltaX=0;deltaY=0;isTouched=!1;wasTouched=!1;isJustTouched=!1;update(){this.isJustTouched=this.isTouched&&!this.wasTouched,this.wasTouched=this.isTouched,this.isJustTouched&&(this.prevX=this.x,this.prevY=this.y),this.deltaX=this.x-this.prevX,this.deltaY=this.y-this.prevY,this.prevX=this.x,this.prevY=this.y}},ft=class{currentlyPressed=new Set;previouslyPressed=new Set;justPressed=new Set;update(){this.currentlyPressed.forEach(t=>{this.previouslyPressed.has(t)||this.justPressed.add(t)}),this.previouslyPressed=new Set(this.currentlyPressed)}};var oe={};V(oe,{LinearSpline:()=>Q,MathUtils:()=>G,Rectangle:()=>er});var er=class{x;y;width;height;constructor(t,e,i,n){this.x=t,this.y=e,this.width=i,this.height=n}setPosition(...t){if(t.length==1)this.x=t[0][0],this.y=t[0][1];else if(t.length==2)this.x=t[0],this.y=t[1];else throw new Error("1 or 2 arguments required");return this}setSize(...t){if(t.length==1)this.width=t[0][0],this.height=t[0][1];else if(t.length==2)this.width=t[0],this.height=t[1];else throw new Error("1 or 2 arguments required");return this}copy(t){this.x=t.x,this.y=t.y,this.width=t.width,this.height=t.height}clone(){return new er(this.x,this.y,this.width,this.height)}containsPoint(...t){let e,i;if(t.length==2)e=t[0],i=t[1];else if(t.length==1)e=t[0][0],i=t[0][1];else throw new Error("1 or 2 arguments required");return this.x<=e&&this.x+this.width>=e&&this.y<=i&&this.y+this.height>=i}containsRectangle(t){let e=t.x,i=e+t.width,n=t.y,s=n+t.height;return e>this.x&&e<this.x+this.width&&i>this.x&&i<this.x+this.width&&n>this.y&&n<this.y+this.height&&s>this.y&&s<this.y+this.height}overlaps(t){return this.x<t.x+t.width&&this.x+this.width>t.x&&this.y<t.y+t.height&&this.y+this.height>t.y}area(){return this.width*this.height}perimeter(){return(this.width+this.height)*2}};var Fr=class{audioContext;bgMusicNode=null;masterGain;bgMusicGain;cueGain;analyser;dataArray;constructor(){this.audioContext=new AudioContext,this.masterGain=this.audioContext.createGain(),this.masterGain.connect(this.audioContext.destination),this.masterGain.gain.value=1,this.bgMusicGain=this.audioContext.createGain(),this.bgMusicGain.connect(this.masterGain),this.bgMusicGain.gain.value=1,this.cueGain=this.audioContext.createGain(),this.cueGain.connect(this.masterGain),this.cueGain.gain.value=1,this.analyser=this.audioContext.createAnalyser(),this.analyser.connect(this.audioContext.destination),this.dataArray=new Uint8Array(this.analyser.frequencyBinCount)}get masterVolume(){return this.masterGain.gain.value}set masterVolume(t){this.masterGain.gain.value=G.sat(t)}get bgMusicVolume(){return this.bgMusicGain.gain.value}set bgMusicVolume(t){this.bgMusicGain.gain.value=G.sat(t)}get cueVolume(){return this.cueGain.gain.value}set cueVolume(t){this.cueGain.gain.value=G.sat(t)}setFrequencyDataSize(t){if(!G.isPowerOf2(t)&&t<16)throw new Error("size must be power of 2 and equal or bigger than 16");this.analyser.fftSize=t*2,this.dataArray=new Uint8Array(this.analyser.frequencyBinCount)}getFrequencyData(){return this.analyser.getByteFrequencyData(this.dataArray),this.dataArray}playBgMusic(t,e={}){let i=e.loop===void 0?!0:e.loop,n=e.time===void 0?0:e.time,s=M.files.get(t);this.stopBgMusic(),this.bgMusicNode=this.audioContext.createBufferSource(),this.bgMusicNode.buffer=s,this.bgMusicNode.loop=i,this.bgMusicNode.start(n),this.bgMusicNode.connect(this.bgMusicGain),this.bgMusicNode.connect(this.analyser)}stopBgMusic(){this.isBgMusicPlaying()&&(this.bgMusicNode.stop(0),this.bgMusicNode=null)}isBgMusicPlaying(){return this.bgMusicNode!==null}playCue(t,e=1){let i=M.files.get(t),n=this.audioContext.createBufferSource();n.buffer=i,n.start(0);let s=this.audioContext.createGain();s.connect(this.cueGain),s.gain.value=G.sat(e),n.connect(s)}onResume(){this.audioContext.state=="suspended"&&this.audioContext.resume()}};var Nr=class{type;isIOS;constructor(){this.detectDeviceType()}detectDeviceType(){let t=navigator.userAgent;/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone/i.test(t)?this.type="mobile":this.type="desktop",this.isIOS=/iPhone|iPad|iPod/i.test(t)}};var M=class{static async init(t){this.graphics=new fr(t),this.files=new cr,this.input=new or,this.audio=new Fr,this.device=new Nr;for(let e of["mousedown","touchdown","keydown"])addEventListener(e,()=>this.audio.onResume());this.input.initEvents(this.graphics.canvas),this.graphics.compileShaders(),this.graphics.generateFonts(),t.preload(),await this.files.waitForAssetsToLoad(),t.create(),addEventListener("resize",()=>this.graphics.onResize()),this.graphics.onResize(),this.graphics.onResume()}static get gl(){return this.graphics.gl}};U(M,"graphics"),U(M,"files"),U(M,"input"),U(M,"audio"),U(M,"device");export{Yr as Game,M as Gol,_r as Screen,ae as glMatrix,he as graphics,oe as math};
>>>>>>> 378055e7aafd91ccbdea1e168957e00facd76e27
//# sourceMappingURL=goliath.js.map
