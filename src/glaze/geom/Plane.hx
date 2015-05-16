
package glaze.geom;

import glaze.geom.Vector2;

class Plane 
{

    public var n:Vector2 = new Vector2();
    public var d:Float = 0;

    public function new() {
        
    }

    public function set(n:Vector2,q:Vector2) {
        this.n.copy(n);
        d = this.n.dot(q);
    }

    public function setFromSegment(s:Vector2,e:Vector2) {
        n.copy(s);
        n.minusEquals(e);
        n.normalize();
        n.leftHandNormalEquals();
        d = n.dot(s);
    }

    public function distancePoint(q:Vector2):Float {
        return n.dot(q) - d;
    }

}