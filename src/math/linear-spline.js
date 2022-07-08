
class LinearSpline {

    points = [];

    constructor( lerp ) {

        this.lerp = lerp;

    }

    addPoint( t, val ) {

        this.points.push( [ t, val ] );

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

        return this.lerp( ( t - p1[ 0 ] ) / ( p2[ 0 ] - p1[ 0 ] ),
            p1[ 1 ],
            p2[ 1 ] );

    }

}

export {
    LinearSpline
};
