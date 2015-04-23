
package glaze.geom;

import glaze.geom.Vector2;
import glaze.physics.collision.Contact;

class AABB
{

    public var position:Vector2 = new Vector2();
    public var extents:Vector2  = new Vector2();

    @:isVar public var l(get, never):Float;
    @:isVar public var t(get, never):Float;
    @:isVar public var r(get, never):Float;
    @:isVar public var b(get, never):Float;

    public function new() {
    }

    inline function get_l():Float { return this.position.x-this.extents.x;}
    inline function get_t():Float { return this.position.y-this.extents.y;}
    inline function get_r():Float { return this.position.x+this.extents.x;}
    inline function get_b():Float { return this.position.y+this.extents.y;}

    public function overlapArea(aabb:AABB):Float {
        var _l = Math.max(this.l,aabb.l);
        var _r = Math.min(this.r,aabb.r);
        var _t = Math.max(this.t,aabb.t);
        var _b = Math.min(this.b,aabb.b);
        return (_r-_l) * (_b-_t);
    }

}