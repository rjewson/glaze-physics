
package glaze.physics.collision;

import glaze.ds.Bytes2D;
import glaze.geom.Plane;
import glaze.geom.Vector2;
import glaze.physics.collision.Contact;
import glaze.physics.collision.Intersect;
import glaze.physics.collision.Ray;

class Map 
{

    public static inline var CORRECTION:Float = .0;
    public static inline var ROUNDDOWN:Float = .01;
    public static inline var ROUNDUP:Float = .5;

    public var tileSize:Float;
    public var tileHalfSize:Float;

    public var data:Bytes2D;

    public var tilePosition:Vector2 = new Vector2();
    public var tileExtents:Vector2 = new Vector2();
    public var plane:Plane = new Plane();

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

        var startX = data.Index(Math.min(body.position.x,body.predictedPosition.x) - body.aabb.extents.x - CORRECTION);
        var startY = data.Index(Math.min(body.position.y,body.predictedPosition.y) - body.aabb.extents.y - CORRECTION);

        var endX = data.Index(Math.max(body.position.x,body.predictedPosition.x) + body.aabb.extents.x + CORRECTION - ROUNDDOWN) + 1;
        var endY = data.Index(Math.max(body.position.y,body.predictedPosition.y) + body.aabb.extents.y + CORRECTION ) + 1;

        plane.setFromSegment(body.predictedPosition,body.position);

        for (x in startX...endX) {
            for (y in startY...endY) {
                var cell = data.get(x,y,0);
                if (cell>0) {
                    tilePosition.x = (x*tileSize)+tileHalfSize;
                    tilePosition.y = (y*tileSize)+tileHalfSize;
                    if (body.isBullet) {
                        if (Math.abs(plane.distancePoint(tilePosition))<40) {
                            if (Intersect.StaticAABBvsSweeptAABB(tilePosition,tileExtents,body.position,body.aabb.extents,body.delta,contact)==true) {
                                body.respondBulletCollision(contact);
                            }                            
                        }
                    } else {
                        if (Intersect.AABBvsStaticSolidAABB(body.position,body.aabb.extents,tilePosition,tileExtents,contact)==true) {
                            var nextX:Int = x + Std.int(contact.normal.x);
                            var nextY:Int = y + Std.int(contact.normal.y);
                            var nextCell = data.get(nextX,nextY,0);
                            if (nextCell==0) {
                                body.respondStaticCollision(contact);
                                if (debug!=null)
                                    debug(x,y);
                            } else {
                            }
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
        

        //if (aabb_position_A.y+aabb_extents_A.y<aabb_position_B.y+aabb_extents_B.y && aabb_position_A.x-aabb_extents_B.x > aabb_position_B.x-aabb_extents_B.x) {

         if(px>=0&&py>=0) {
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

    public function castRay(ray:Ray):Bool {

        var x = data.Index(ray.origin.x);
        var y = data.Index(ray.origin.y);
        var cX = x*tileSize;
        var cY = y*tileSize;
        var d = ray.direction;

        var stepX:Int       = 0;
        var tMaxX:Float     = 100000000;
        var tDeltaX:Float   = 0;
        if (d.x < 0) {
            stepX = -1;
            tMaxX = (cX - ray.origin.x) / d.x;
            tDeltaX = tileSize / -d.x;
        } else if (d.x > 0) {
            stepX = 1;
            tMaxX = ((cX + tileSize) - ray.origin.x) / d.x;
            tDeltaX = tileSize / d.x;
        } 

        var stepY:Int       = 0; 
        var tMaxY:Float     = 100000000;
        var tDeltaY:Float   = 0;
        if (d.y < 0) {
            stepY = -1;
            tMaxY = (cY - ray.origin.y) / d.y;
            tDeltaY = tileSize / -d.y;
        } else if (d.y > 0) {
            stepY = 1;
            tMaxY = ((cY + tileSize) - ray.origin.y) / d.y;
            tDeltaY = tileSize / d.y;
        } 

        var distX = .0;
        var distY = .0;

        var transitionEdgeNormalX = 0;
        var transitionEdgeNormalY = 0;

        while (true) {

            if (tMaxX < tMaxY) {
                distX = tMaxX * d.x;
                distY = tMaxX * d.y;
                tMaxX += tDeltaX;
                x += stepX;
            } else {
                distX = tMaxY * d.x;
                distY = tMaxY * d.y;
                tMaxY += tDeltaY;
                y += stepY;
            }

            if (distX*distX+distY*distY>ray.range*ray.range)
                return false;

            var tile = data.get(x,y,0);
            if (tile>0) {
                if (tMaxX < tMaxY) {
                    transitionEdgeNormalX = (stepX < 0) ? 1 : -1;
                    transitionEdgeNormalY = 0;
                } else {
                    transitionEdgeNormalX = 0;
                    transitionEdgeNormalY = (stepY < 0) ? 1 : -1;
                }
                ray.report(distX,distY,transitionEdgeNormalX,transitionEdgeNormalY);
                return true;
            }
        }

        return false;
    }

}