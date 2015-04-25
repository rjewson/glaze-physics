
package glaze.physics;

import glaze.geom.Vector2;
import glaze.physics.collision.BFProxy;
import glaze.physics.collision.Contact;
import glaze.geom.AABB;
import glaze.geom.BFBB;

class Body 
{

    public var position:Vector2 = new Vector2();
    public var positionCorrection:Vector2 = new Vector2();
    public var predictedPosition:Vector2 = new Vector2();

    public var velocity:Vector2 = new Vector2();
    public var maxScalarVelocity:Float = 1000;

    public var aabb:AABB = new AABB();
    public var bfproxy:BFProxy = new BFProxy();

    public var forces:Vector2 = new Vector2();
    private var accumulatedForces:Vector2 = new Vector2();

    public var damping:Float = 1;

    public var mass:Float = 1;
    public var invMass:Float = 1;

    public var bullet:Bool = false;

    public var dt:Float = 0;

    public var onGround:Bool = false;
    public var onGroundPrev:Bool = false;

    public var bounceCount:Int = 4;

    public var debug:Int = 1;

    public function new(w:Float,h:Float) {
        aabb.extents.setTo(w,h);
        aabb.position = this.position;
        setMass(1);

        bfproxy.body = this;
        bfproxy.aabb = aabb;
        bfproxy.isStatic = false;
    }

    public function update(dt:Float,globalForces:Vector2,globalDamping:Float) {
        this.dt = dt;
        forces.plusEquals(globalForces);
        velocity.plusEquals(forces);
        velocity.multEquals(globalDamping*damping);
        velocity.clamp(maxScalarVelocity);

        predictedPosition.copy(position);
        predictedPosition.plusMultEquals(velocity,dt);

        forces.setTo(0,0);
        damping = 1;

        onGroundPrev = onGround;
        onGround = false;
    }

    public function respondStaticCollision(contact:Contact):Bool {
        var seperation = Math.max(contact.distance,0);
        var penetration = Math.min(contact.distance,0);
        
        positionCorrection.x -= contact.normal.x * (penetration/dt);
        positionCorrection.y -= contact.normal.y * (penetration/dt);

        var nv = velocity.dot(contact.normal) + (seperation/dt);

        if (nv<0) {
            //TODO different responses required

            //Cancel normal vel
            velocity.x -= contact.normal.x * nv;
            velocity.y -= contact.normal.y * nv;
            
            // if (debug>0) {
            //     trace(contact.normal,seperation,penetration,contact.distance);
            //     debug--;
            // }

            //Surface is updwards?
            if (contact.normal.y < 0) {
                onGround = true;
                var tangent:Vector2 = contact.normal.rightHandNormal();
                var tv:Float = velocity.dot(tangent) * 0.1;
                velocity.x -= tangent.x * tv;
                velocity.y -= tangent.y * tv;
            }

            //reflect
            // if (bounceCount>0) {
            //     //velocity.multEquals(0.95+Math.random()*0.05);
            //     //velocity.reflectEquals(contact.normal);
            //     // addForce(new Vector2(contact.normal.x*100,contact.normal.y*100));
            //     bounceCount--;
            // }

            return true;
        } 
        return false;
    }

    public function updatePosition() {
        // position.x += (velocity.x*dt) + (positionCorrection.x*dt);
        // position.y += (velocity.y*dt) + (positionCorrection.y*dt);
        positionCorrection.plusEquals(velocity);
        positionCorrection.multEquals(dt);
        position.plusEquals(positionCorrection);
        positionCorrection.setTo(0,0);
    }

    public function addForce(f:Vector2) {
        forces.plusMultEquals(f,invMass);
    }

    public function addMasslessForce(f:Vector2) {
        forces.plusEquals(f);
    }

    function setMass(mass) {
        this.mass = mass;
        this.invMass = 1/mass;
    }

}