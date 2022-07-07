import { Gol } from '../gol.js';
import { Drawable } from './drawable.js';
import { Font } from './font.js';
import { Mesh } from './mesh.js';
import { ShaderInstance } from './shader-instance.js';

class TextDrawable extends Drawable {

    /**
     *
     * @type {Font}
     */
    font;

    /**
     *
     * @type {string}
     */
    text;

    rainbow;

    constructor( font, text = '', rainbow = false ) {

        super(
            new Mesh(),
            new ShaderInstance( Gol.graphics.getShader( 'texture' ) ),
            font.texture
        );

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

            positions.push(
                - 0.5 * charRatio + offsetX, 0.5, 0,
                0.5 * charRatio + offsetX, 0.5, 0,
                0.5 * charRatio + offsetX, - 0.5, 0,
                - 0.5 * charRatio + offsetX, - 0.5, 0
            );

            uvs.push(
                x / this.texture.width, y / this.texture.height,
                ( x + charWidth ) / this.texture.width, y / this.texture.height,
                ( x + charWidth ) / this.texture.width, ( y + charHeight ) / this.texture.height,
                x / this.texture.width, ( y + charHeight ) / this.texture.height
            );

            const indexOffset = i * 4;

            indices.push(
                indexOffset, indexOffset + 1, indexOffset + 2,
                indexOffset, indexOffset + 2, indexOffset + 3
            );

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

}

export {
    TextDrawable
};
