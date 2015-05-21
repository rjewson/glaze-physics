
package glaze.geom;

import glaze.geom.Vector2;

class AABB2
{

    public var l:Float = Math.POSITIVE_INFINITY;
    public var t:Float = Math.POSITIVE_INFINITY;
    public var r:Float = Math.NEGATIVE_INFINITY;
    public var b:Float = Math.NEGATIVE_INFINITY;

    @:isVar public var width(get, never):Float;
    @:isVar public var height(get, never):Float;

    public function new(t=.0,r=.0,b=.0,l=.0) {
        this.t = t;
        this.r = r;
        this.b = b;
        this.l = l;        
    }

    public function setToSweeptAABB(aabb:AABB,preditcedPosition:Vector2) {
        l = aabb.position.x-aabb.extents.x;
        r = aabb.position.x+aabb.extents.x;
        t = aabb.position.y-aabb.extents.y;
        b = aabb.position.y+aabb.extents.y;
    }

    inline public function fromAABB(aabb:AABB) {


    }

    public function clone():AABB2 {
        return new AABB2(t,r,b,l);
    }

    public inline function reset() {
        t = l = Math.POSITIVE_INFINITY;
        r = b = Math.NEGATIVE_INFINITY;
    }

    public inline function get_width():Float {  
        return r-l;
    }

    public inline function get_height():Float {  
        return b-t;
    }

    public inline function intersect(aabb:AABB):Bool {
        if (l > aabb.r)
            return false;
        else if (r < aabb.l)
            return false;
        else if (t > aabb.b)
            return false;
        else if (b < aabb.t)
            return false;
        else return true;
    }

    public inline function addAABB(aabb:AABB) {
        if (aabb.t<t) t=aabb.t;
        if (aabb.r>r) r=aabb.r;
        if (aabb.b>b) b=aabb.b;
        if (aabb.l<l) l=aabb.l;
    }

    public inline function addPoint(x:Float,y:Float) {
        if (x<l) l=x;
        if (x>r) r=x;
        if (y<t) t=y;
        if (y>b) b=y;
    }

    public function expand(i:Float) {
        l+=i;
        r-=i;
        t+=i;
        b-=i;
    }
}