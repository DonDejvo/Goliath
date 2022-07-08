import { Gol, Game, Screen, graphics, glMatrix, math } from '../../dist/goliath.js';
const { Drawable, ShaderInstance, Texture, PerspectiveCamera, Sprite, OrthographicCamera, Mesh, Batch, Shader, TextDrawable } = graphics;
const { Cube, Sphere, Quad } = graphics.meshes;
const { vec2, vec3, vec4 } = glMatrix;
const { MathUtils, LinearSpline } = math;

class MainScreen extends Screen {

    show() {

        this.enemiesTexture = new Texture( Gol.files.get( 'enemies' ), {
            filter: Gol.gl.NEAREST
        } );

        this.mainCamera = new OrthographicCamera( 480, 360 );

        this.batAnim = [
            [
                0.05, 16.05, 15.90, 15.90
            ],
            [
                16.05, 16.05, 15.90, 15.90
            ],
            [
                32.05, 16.05, 15.90, 15.90
            ],
        ];
        this.batAnimFrameTime = 100;
        this.stateTime = 0;

        this.sprites = [];

        for ( let i = 0; i < 100; ++i ) {

            const sprite = new Sprite( this.enemiesTexture, ...this.batAnim[ 0 ] );

            sprite.scale[ 0 ] = this.enemiesTexture.width;
            sprite.scale[ 1 ] = this.enemiesTexture.height;
            sprite.position[ 0 ] = MathUtils.rand( 0, 480 );
            sprite.position[ 1 ] = MathUtils.rand( 0, 360 );

            this.sprites.push( sprite );

        }

        this.textFps = new TextDrawable( Gol.graphics.getFont( 'Consolas' ) );
        this.textFps.position[ 0 ] = 240;
        this.textFps.position[ 1 ] = 180;
        this.textFps.scale[ 0 ] = 24;
        this.textFps.scale[ 1 ] = 24;

        this.spriteBatch = new Batch( new ShaderInstance( Gol.graphics.getShader( 'texture' ) ) );

    }

    render() {

        this.stateTime += Gol.graphics.delta * 1000;

        Gol.gl.clearColor( 0.2, 0.2, 0.2, 1.0 );
        Gol.gl.clear( Gol.gl.COLOR_BUFFER_BIT );

        Gol.gl.enable( Gol.gl.BLEND );
        Gol.gl.blendFunc( Gol.gl.SRC_ALPHA, Gol.gl.ONE_MINUS_SRC_ALPHA );

        const constants = {
            ambientColor: [ 1, 1, 1 ]
        };

        this.mainCamera.updateConstants( constants );

        this.spriteBatch.setConstants( constants );
        this.spriteBatch.begin();

        for ( const sprite of this.sprites ) {

            const idx = Math.floor( this.stateTime / this.batAnimFrameTime ) % this.batAnim.length;

            sprite.setRegion( ...this.batAnim[ idx ] );
            //sprite.draw(constants);
            this.spriteBatch.draw( sprite );

        }

        this.spriteBatch.end();

        this.textFps.setText( 'FPS: ' + Gol.graphics.fps );
        this.textFps.draw( constants );

    }

    dispose() {

        this.enemiesTexture.dispose();

    }

}

class SpriteAnimationDemo extends Game {

    preload() {

        Gol.files.loadImage( 'enemies', 'assets/enemies.png' );

    }

    create() {

        this.setScreen( new MainScreen() );

    }

}

addEventListener( 'DOMContentLoaded', () => Gol.init( new SpriteAnimationDemo() ) );
