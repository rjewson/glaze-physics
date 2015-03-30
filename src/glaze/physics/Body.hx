
package glaze.physics;

import glaze.geom.Vector2;
import glaze.physics.collision.Contact;

class Body 
{

    public var position:Vector2 = new Vector2();
    public var positionCorrection:Vector2 = new Vector2();
    public var predictedPosition:Vector2 = new Vector2();

    public var velocity:Vector2 = new Vector2();
    public var maxScalarVelocity:Float = 1000;

    public var extents:Vector2 = new Vector2();

    public var forces:Vector2 = new Vector2();
    private var accumulatedForces:Vector2 = new Vector2();

    public var damping:Float = 0.98;
    public var friction:Float = 0;

    public var mass:Float = 1;
    public var invMass:Float = 1;

    public var dt:Float = 0;

    public var onGround:Bool = false;
    public var onGroundPrev:Bool = false;

    public var isStatic:Bool = false;

    public function new(w:Float,h:Float) {
        extents.setTo(w,h);
        setMass(1);
    }

    public function update(dt:Float,globalForces:Vector2) {
        this.dt = dt;
        forces.plusEquals(globalForces);
        velocity.plusEquals(forces);
        velocity.multEquals(damping);
        velocity.clamp(maxScalarVelocity);

        predictedPosition.copy(position);
        predictedPosition.plusMultEquals(velocity,dt);

        onGroundPrev = onGround;
        onGround = false;
    }

    public function respondCollision(contact:Contact) {
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

            //reflect
            //velocity.reflectEquals(contact.normal);

            //Surface is updwards?
            if (contact.normal.y < 0) {
                onGround = true;
                var tangent:Vector2 = contact.normal.rightHandNormal();
                var tv:Float = velocity.dot(tangent) * 0.1;
                velocity.x -= tangent.x * tv;
                velocity.y -= tangent.y * tv;
            }

        } 
    }

    public function updatePosition() {
        //position.x += (velocity.x*dt) + (positionCorrection.x*dt);
        //position.y += (velocity.y*dt) + (positionCorrection.y*dt);
        positionCorrection.plusEquals(velocity);
        positionCorrection.multEquals(dt);
        position.plusEquals(positionCorrection);
        positionCorrection.setTo(0,0);
        forces.setTo(0,0);
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