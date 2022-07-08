
class MathUtils {

    static lerp( x, a, b ) {

        return ( b - a ) * x + a;

    }

    static rand( min, max ) {

        return Math.random() * ( max - min ) + min;

    }

    static randInt( min, max ) {

        return Math.floor( this.rand( min, max + 1 ) );

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

}

export {
    MathUtils
};
