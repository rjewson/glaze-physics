
package glaze.util;

import glaze.geom.Vector2;
import glaze.physics.Body;

class CharacterController 
{

    private var body:Body;
    private var input:DigitalInput;

    private var controlForce:Vector2 = new Vector2();

    private var jumpUnit:Vector2 = new Vector2();

    private static inline var WALK_FORCE:Float = 20;
    private static inline var JUMP_FORCE:Float = 800;

    public function new(input:DigitalInput,body:Body) {
        this.input = input;
        this.body = body;
    }

    public function update() {

        controlForce.setTo(.0,.0);

        var left = input.PressedDuration(65);   //a
        var right = input.PressedDuration(68);  //d
        var up = input.JustPressed(87);         //w
        var down = input.PressedDuration(83);   //s

        //Just jumped?
        if (up) {

        }

        //Just landed?
        if (body.onGround&&!body.onGroundPrev) {

        }

        if (body.onGround) {
            if (left>0)     controlForce.x -= WALK_FORCE;
            if (right>0)    controlForce.x += WALK_FORCE;
            if (up)         controlForce.y -= JUMP_FORCE;
        } else {

        }

        body.addForce(controlForce);

    }

}