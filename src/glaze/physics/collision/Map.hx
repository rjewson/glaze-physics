
package glaze.physics.collision;

import glaze.ds.Bytes2D;
import glaze.geom.Vector2;
import glaze.physics.collision.Contact;
import glaze.physics.collision.Intersect;
import glaze.physics.collision.Ray;

class Map 
{

    public static inline var CORRECTION:Float = .0;
    public static inline var ROUNDUP:Float = .5;

    public var tileSize:Float;
    public var tileHalfSize:Float;

    public var data:Bytes2D;

    public var startX:Int;
    public var endX:Int;
    public var startY:Int;
    public var endY:Int;

    public var tilePosition:Vector2 = new Vector2();
    public var tileExtents:Vector2 = new Vector2();

    public var contact:Contact;

    public var debug:Int->Int->Void;

    public function new(data:Bytes2D) {
        this.data = data;
        tileSize = data.cellSize;
        tileHalfSize = tileSize/2;
        tileExtents.setTo(tileHalfSize,tileHalfSize);
        contact = new Contact();
    }

    public function testCollision(body:Body) {

        startX = data.Index(Math.min(body.position.x,body.predictedPosition.x) - body.aabb.extents.x - CORRECTION);
        startY = data.Index(Math.min(body.position.y,body.predictedPosition.y) - body.aabb.extents.y - CORRECTION);

        endX = data.Index(Math.max(body.position.x,body.predictedPosition.x) + body.aabb.extents.x + CORRECTION + ROUNDUP) + 1;
        endY = data.Index(Math.max(body.position.y,body.predictedPosition.y) + body.aabb.extents.y + CORRECTION + ROUNDUP) + 1;

        for (x in startX...endX) {
            for (y in startY...endY) {
                tilePosition.x = (x*tileSize)+tileHalfSize;
                tilePosition.y = (y*tileSize)+tileHalfSize;
                var cell = data.get(x,y,0);
                if (cell>0) {
                    if (Intersect.AABBvsStaticNoPenetrationAABB(body.position,body.aabb.extents,tilePosition,tileExtents,contact)==true) {
                        var nextX:Int = x + Std.int(contact.normal.x);
                        var nextY:Int = y + Std.int(contact.normal.y);
                        var nextCell = data.get(nextX,nextY,0);
                        if (nextCell==0) {
                            body.respondStaticCollision(contact);
                            if (debug!=null)
                                debug(x,y);
                        }
                    }
                }
            }
        }
    }

    public function AABBvsStaticTileAABBSlope(aabb_position_A:Vector2,aabb_extents_A:Vector2,aabb_position_B:Vector2,aabb_extents_B:Vector2,contact:Contact):Bool {
    
        var slope = new Vector2(1/1.4142135623730951,-1/1.4142135623730951);

        var dx = aabb_position_B.x - aabb_position_A.x;
        var px = (aabb_extents_B.x + aabb_extents_A.x) - Math.abs(dx);

        var dy = aabb_position_B.y - aabb_position_A.y;
        var py = (aabb_extents_B.y + aabb_extents_A.y) - Math.abs(dy);

        if (px<py) {
            //right-left
            contact.normal.x = dx<0 ? 1 : -1;
            contact.normal.y = 0;
        } else {
            //down-up
            contact.normal.x = 0;
            contact.normal.y = dy<0 ? 1 : -1;
        }
        

        if (aabb_position_A.y+aabb_extents_A.y<aabb_position_B.y+aabb_extents_B.y && aabb_position_A.x-aabb_extents_B.x > aabb_position_B.x-aabb_extents_B.x) {

        // if(px>=0&&py>=0) {
            trace('a');
            contact.normal.x =  1/1.4142135623730951;
            contact.normal.y = -1/1.4142135623730951;
            var cornerTile = new Vector2(aabb_position_B.x-aabb_extents_B.x, aabb_position_B.y-aabb_extents_B.y );
            var d = contact.normal.dot(cornerTile);
            var cornerBody = new Vector2(aabb_position_A.x-aabb_extents_A.x, aabb_position_A.y+aabb_extents_A.y );
            
            contact.distance = (contact.normal.dot(cornerBody) - d)/contact.normal.dot(contact.normal);
            //trace(dist);
            return true;
        } else {
            trace('b');
            var pcx = ((contact.normal.x * (aabb_extents_A.x+aabb_extents_B.x) ) + aabb_position_B.x);
            var pcy = (contact.normal.y * (aabb_extents_A.y+aabb_extents_B.y) ) + aabb_position_B.y;

            var pdx = aabb_position_A.x - pcx;
            var pdy = aabb_position_A.y - pcy;

            contact.distance = pdx*contact.normal.x + pdy*contact.normal.y;

            return true;
        }

    }

    /*
    public function AABBvsStaticTileAABBSlope(aabb_position_A:Vector2,aabb_extents_A:Vector2,aabb_position_B:Vector2,aabb_extents_B:Vector2,contact:Contact):Bool {
        var sign = new Vector2(1,-1);
        var angle = 0;
        var slope = new Vector2(1/1.4142135623730951,-1/1.4142135623730951);

        var dx = aabb_position_B.x - aabb_position_A.x;
        var px = (aabb_extents_B.x + aabb_extents_A.x) - Math.abs(dx);

        var dy = aabb_position_B.y - aabb_position_A.y;
        var py = (aabb_extents_B.y + aabb_extents_A.y) - Math.abs(dy);

        if (px<py) {
            contact.normal.x = dx<0 ? 1 : -1;
            contact.normal.y = 0;
        } else {
            contact.normal.x = 0;
            contact.normal.y = dy<0 ? 1 : -1;
        }
        // var o:Vector2D = obj.pos.minus(sign.times(obj.halfWidth));
        var o = new Vector2();
        o.x = aabb_position_A.x-sign.x*aabb_extents_A.x;
        o.y = aabb_position_A.y-sign.y*aabb_extents_A.y;
        // o.minusEquals(tilePos);
        o.x -= aabb_position_B.x;
        o.y -= aabb_position_B.y;
        // var dp:Number = o.dot(slope);
        var dp = o.dot(slope);
        //trace(dp);
        if(dp < 0){
            trace(dp);
        //     var temp_slope:Vector2D = slope.clone();
        var tempSlope = slope.clone();
        //     temp_slope.multEquals(-1*dp);
        tempSlope.multEquals(-dp);
        //     var lenN:Number = temp_slope.magnitude();
        var lenN = Math.sqrt(tempSlope.x*tempSlope.x+tempSlope.y*tempSlope.y);
        //     var lenP:Number = p.magnitude();
        var lenP = Math.sqrt(px*px+py*py);
        // trace(lenP,lenN);
        if(lenP < lenN) {
            var pcx = ((contact.normal.x * (aabb_extents_A.x+aabb_extents_B.x) ) + aabb_position_B.x);
            var pcy = (contact.normal.y * (aabb_extents_A.y+aabb_extents_B.y) ) + aabb_position_B.y;

            var pdx = aabb_position_A.x - pcx;
            var pdy = aabb_position_A.y - pcy;

            contact.distance = pdx*contact.normal.x + pdy*contact.normal.y;
            return true;
        } else {
                trace("slope");
                contact.normal.x = slope.x;
                contact.normal.y = slope.y;
                contact.distance = 0;

        //         obj.ReportCollisionVsWorld( temp_slope, slope );
        //         return COL_OTHER;
        return true;
            }
        }

        // return COL_NONE;
        return false;
    }
*/
    // var planeN:Vector2 = delta.m_MajorAxis.NegTo();
    // var planeCentre:Vector2 = planeN.Mul( aabbHalfExtents ).AddTo(aabbCentre);

    // // distance point from plane
    // var planeDelta:Vector2 = point.Sub( planeCentre );
    // var dist:Number = planeDelta.Dot( planeN );

    public function castRay(ray:Ray):Bool {
        var x = data.Index(ray.origin.x);
        var y = data.Index(ray.origin.y);
        var cX = x*tileSize;
        var cY = y*tileSize;
        var d = ray.direction;

        var stepX:Int ,tMaxX:Float, tDeltaX:Float;
        if (d.x < 0) {
            stepX = -1;
            tMaxX = (cX - ray.origin.x) / d.x;
            tDeltaX = tileSize / -d.x;
        } else if (0 < d.x) {
            stepX = 1;
            tMaxX = ((cX + tileSize) - ray.origin.x) / d.x;
            tDeltaX = tileSize / d.x;
        } else {
            stepX = 0;
            tMaxX = 100000000;
            tDeltaX = 0;
        }
        var stepY:Int, tMaxY:Float, tDeltaY:Float;
        if (d.y < 0) {
            stepY = -1;
            tMaxY = (cY - ray.origin.y) / d.y;
            tDeltaY = tileSize / -d.y;
        } else if (0 < d.y) {
            stepY = 1;
            tMaxY = ((cY + tileSize) - ray.origin.y) / d.y;
            tDeltaY = tileSize / d.y;
        } else {
            stepY = 0;
            tMaxY = 100000000;
            tDeltaY = 0;
        }

        var pX = ray.origin.x;
        var pY = ray.origin.y;

        var transitionEdgeNormalX = 0;
        var transitionEdgeNormalY = 0;

        while (true) {
            if (tMaxX < tMaxY) {
                transitionEdgeNormalX = (stepX < 0) ? 1 : -1;
                transitionEdgeNormalY = 0;
                pX = ray.origin.x + (tMaxX * d.x);
                pY = ray.origin.y + (tMaxX * d.y);
                tMaxX += tDeltaX;
                x += stepX;
            } else {
                transitionEdgeNormalX = 0;
                transitionEdgeNormalY = (stepY < 0) ? 1 : 0;
                pX = ray.origin.x + (tMaxY * d.x);
                pY = ray.origin.y + (tMaxY * d.y);
                tMaxY += tDeltaY;
                y += stepY;
            }

            var distX = pX - ray.origin.x;
            var distY = pY - ray.origin.y;
            var currentLen = distX * distX + distY * distY;
            if (currentLen >= ray.range*ray.range)
                return false;

            var tile = data.get(x,y,0);

            if (tile>0) {
                ray.report(pX,pY,transitionEdgeNormalX,transitionEdgeNormalY);
                return true;
            }
        }

        return false;
    }

}