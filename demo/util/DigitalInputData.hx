
package util;

class DigitalInputData 
{

    public var code:Int = 0;
    private var digitalInput:DigitalInput2;

    public var down:Bool;

    public var lastDown:Int = 0;
    public var lastUp:Int = 0;

    public function new(digitalInput:DigitalInput2,code:Int)
    {
        this.digitalInput = digitalInput;
        this.code = code;
    }

    public function onDown() {
        down = true;
        lastDown = digitalInput.now;
        trace("down "+code+" "+lastDown);
    }

    public function onUp() {
        down = false;
        lastUp = digitalInput.now;
        trace("up "+code);
    }

    //Down

    public function justDown():Bool {
        trace(lastDown,digitalInput.now);
        return lastDown == digitalInput.now;
    }

    public function isDown():Bool {
        return down;
    }

    public function downDuration():Int {
        return down ? digitalInput.now - lastDown : 0;
    }

    //Up

    public function justUp():Bool {
        return lastUp == digitalInput.now;
    }

    public function isUp():Bool {
        return !down;
    }

    public function upDuration():Int {
        return !down ? digitalInput.now - lastUp : 0;
    }


}