
package glaze.physics.collision;

import glaze.geom.Vector2;

class Ray 
{

    public var origin:Vector2 = new Vector2();
    public var target:Vector2 = new Vector2();
    public var range:Float = 0;

    public var delta:Vector2 = new Vector2();
    public var direction:Vector2 = new Vector2();

    public var position:Vector2 = new Vector2();
    public var normal:Vector2 = new Vector2();

    public var hit:Bool;

    public function new() {

    }

    public function initalize(origin:Vector2,target:Vector2,range:Float=0) {
        reset();
        this.origin.copy(origin);
        this.target.copy(target);

        delta.copy(target);
        delta.minusEquals(origin);

        direction.copy(delta);
        direction.normalize();

        if (range==0) {
            this.range = delta.length();
        } else {
            this.range = range;
        }
    }

    public function reset() {
        position.setTo(0,0);
        normal.setTo(0,0);
        hit = false;
    }

    public function report(pX:Float,pY:Float,nX:Float,nY:Float) {
        position.setTo(pX,pY);
        normal.setTo(nX,nY);
        hit = true;
    }

}