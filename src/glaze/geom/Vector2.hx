
package glaze.geom;

class Vector2 
{

    public var x:Float;
    public var y:Float;

    inline public static var ZERO_TOLERANCE = 1e-08;

    public function new(x:Float=.0,y:Float=.0) {
        this.x = x;
        this.y = y;
    }    

    inline public function setTo(x:Float,y:Float) {
        this.x = x;
        this.y = y;
    }

    inline public function copy(v:Vector2) {
        this.x = v.x; 
        this.y = v.y; 
    }

    public function clone():Vector2 {
        return new Vector2(x,y);
    }

    public function normalize():Float {
        var t = Math.sqrt(x * x + y * y) + ZERO_TOLERANCE;
        x /= t;
        y /= t;
        return t;
    }

    public function length():Float {
        return Math.sqrt(x * x + y * y);
    }

    public function clamp(max:Float) {
        var l = length();
        if (l > max) {
            multEquals(max / l);
        }
    }

    public function plusEquals(v:Vector2):Void {
        this.x += v.x;
        this.y += v.y;
    }

    public function minusEquals(v:Vector2):Void {
        this.x -= v.x;
        this.y -= v.y;
    }

    public function multEquals(s:Float):Void {
        this.x*=s;
        this.y*=s;
    }

    public function plusMultEquals(v:Vector2,s:Float):Void {
        this.x += v.x*s;
        this.y += v.y*s;
    }

    public function dot(v:Vector2):Float {
        return x * v.x + y * v.y;
    }

    public function cross(v:Vector2):Float {
        return x * v.y - y * v.x;
    }

    public function leftHandNormal():Vector2 {
        return new Vector2(this.y, -this.x);
    }

    public function rightHandNormal():Vector2 {
        return new Vector2(-this.y, this.x);
    }

    public function reflectEquals(normal:Vector2) {
        var d = dot(normal);
        this.x -= 2*d*normal.x;
        this.y -= 2*d*normal.y;
    }

}