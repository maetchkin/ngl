/**
 * @file Animation Controls
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Vector3 } from "../../lib/three.es6.js";

import { defaults } from "../utils.js";


class Animation{

    constructor( controls ){

        this.controls = controls;
        this.startTime = performance.now();

    }

    tick( /*stats*/ ){

    }

}


class SpinAnimation extends Animation{

    constructor( controls, axis, angle ){

        super( controls );

        this.axis = defaults( axis, new Vector3( 0, 1, 0 ) );
        this.angle = defaults( angle, 0.01 );

    }

    tick( stats ){

        if( !this.axis || !this.angle ) return;

        this.controls.rotate(
            this.axis, this.angle * stats.lastDuration / 16
        );

    }

}


class MoveAnimation extends Animation{

    constructor( controls, from, to, duration ){

        super( controls );

        this.from = defaults( from, new Vector3() );
        this.to = defaults( to, new Vector3() );
        this.duration = defaults( duration, 1000 );

    }

    tick( stats ){

        var elapsed = stats.currentTime - this.startTime;
        var alpha = Math.min( 1, elapsed / this.duration );

        this.controls.position.lerpVectors( this.from, this.to, alpha ).negate();

        return alpha === 1;

    }

}


class AnimationControls{

    constructor( stage ){

        this.viewer = stage.viewer;
        this.controls = stage.viewerControls;

        this.animationList = [];

    }

    add( animation ){

        this.animationList.push( animation );

    }

    remove( animation ){

        var list = this.animationList;
        var index = list.indexOf( animation );

        if( index > -1 ){
            list.splice( index, 1 );
        }

    }

    run( stats ){

        var list = this.animationList.slice();

        for( var i = 0, n = list.length; i < n; ++i ){
            var animation = list[ i ];
            var finished = animation.tick( stats );
            if( finished ) this.remove( animation );
        }

        this.viewer.requestRender();

    }

    spin( axis, angle ){

        var animation = new SpinAnimation( this.controls, axis, angle );
        this.add( animation );

        return animation;

    }

    move( to, duration ){

        var from = this.controls.position.clone().negate();
        var animation = new MoveAnimation( this.controls, from, to, duration );
        this.add( animation );

        return animation;

    }

    dispose(){

        this.animationList.length = 0;

    }

}


export default AnimationControls;
