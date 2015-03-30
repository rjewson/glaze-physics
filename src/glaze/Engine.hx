
package glaze;

import glaze.geom.Vector2;
import glaze.physics.collision.Map;
import glaze.physics.Body;
import glaze.physics.collision.Contact;
import glaze.geom.AABB;
import glaze.physics.collision.Intersect;

class Engine 
{

    public var dynamicBodies:Array<Body>;
    public var kinematicBodies:Array<Body>;
    public var staticBodies:Array<Body>;

    public var map:Map;

    public var contact:Contact;

    public var globalForce:Vector2;

    public function new(map:Map) {
        this.map = map;

        dynamicBodies = new Array<Body>();
        kinematicBodies = new Array<Body>();
        staticBodies = new Array<Body>();
        
        contact = new Contact();
        globalForce = new Vector2(0,10); 
    }

    public function update(delta:Float) {
        //js.Lib.debug();
        var invDelta = delta/1000;
        preUpdate(invDelta);
        collide(invDelta);
        updatePosition(invDelta);
    }

    public function preUpdate(delta:Float) {
        for (body in dynamicBodies) {
            body.update(delta,globalForce);
        }
    }

    /*
    With solid response:
    - Dynamic vs Map
    - Dynamic vs Static
    - Dynamic vs Kinematic

    Without solid response:
    - Dynamic vs Dynamic
    */

    public function collide(delta:Float) {
        var bodyCount = dynamicBodies.length;
        for (i in 0...bodyCount) {
            var bodyA = dynamicBodies[i];
            map.testCollision( bodyA );

            for (staticBody in staticBodies) {
                if (Intersect.AABBvsStaticNoPenetrationAABB(bodyA.position,bodyA.extents,staticBody.position,staticBody.extents,contact)==true) {
                    //js.Lib.debug();
                    bodyA.respondCollision(contact);
                }
            }

        }
    }

    public function updatePosition(delta:Float) {
        for (body in dynamicBodies) {
            body.updatePosition();
        }
    }

    public function addBody(body:Body) {
        if (body.isStatic)
            staticBodies.push(body)
        else
            dynamicBodies.push(body);
    }

}