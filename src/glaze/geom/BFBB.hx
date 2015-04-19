
package glaze.geom;

import glaze.geom.Vector2;

class BFBB
{

    public var l:Float = Math.POSITIVE_INFINITY;
    public var t:Float = Math.POSITIVE_INFINITY;
    public var r:Float = Math.NEGATIVE_INFINITY;
    public var b:Float = Math.NEGATIVE_INFINITY;

    public function new() {
        
    }

    public function setToSweeptAABB(aabb:AABB,preditcedPosition:Vector2) {
        l = aabb.position.x-aabb.extents.x;
        r = aabb.position.x+aabb.extents.x;
        t = aabb.position.y-aabb.extents.y;
        b = aabb.position.y+aabb.extents.y;
    }

    public function expandToAABB(aabb:AABB) {

    } 

}