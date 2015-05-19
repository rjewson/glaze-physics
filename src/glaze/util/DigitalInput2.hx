package glaze.util;

import glaze.util.DigitalInputData;
import js.html.Event;
import js.html.EventTarget;
import glaze.geom.Vector2;
import js.html.KeyboardEvent;
import js.html.MouseEvent;

class DigitalInput2
{

    public var inputData : Array<DigitalInputData>;
    public var mousePosition : Vector2;
    public var mousePreviousPosition : Vector2;
    public var mouseOffset : Vector2;
    public var inputCorrection : Vector2;
    private var frameRef : Int;
    private var target : EventTarget;

    public var now:Int;

    public function new() {
        inputData = new Array<DigitalInputData>();
        for (i in 0...255) {
            inputData[i] = new DigitalInputData(this,i);
        }
        mousePosition = new Vector2();
        mousePreviousPosition = new Vector2();
        mouseOffset = new Vector2();
        frameRef = 2;       
    }
    
    public function InputTarget(target : EventTarget, inputCorrection:Vector2) : Void {
        this.target = target;
        target.addEventListener("keydown",KeyDown,false);
        target.addEventListener("keyup",KeyUp,false);

        target.addEventListener("mousedown",MouseDown,false);
        target.addEventListener("mouseup",MouseUp,false);
        target.addEventListener("mousemove",MouseMove,false);

        this.inputCorrection = inputCorrection;
    }

    public function Update(now:Float,x:Float,y:Float) : Void {
        mouseOffset.x = x;
        mouseOffset.y = y;
        this.now = Math.round(now);
    }

    inline public function GetInputData(keyCode:Int):DigitalInputData {
        return inputData[keyCode];
    }

    public function KeyDown(event : KeyboardEvent) : Void {
        inputData[event.keyCode].onDown();
        event.preventDefault();
    }

    public function KeyUp(event : KeyboardEvent) : Void {
        inputData[event.keyCode].onUp();
        event.preventDefault();
    }

    public function MouseDown(event : KeyboardEvent) : Void {
        inputData[200].onDown();
        event.preventDefault();
    }

    public function MouseUp(event : KeyboardEvent) : Void {
        inputData[200].onUp();
        event.preventDefault();
    }

    public function MouseMove(event : MouseEvent) : Void {
        mousePreviousPosition.x = mousePosition.x;
        mousePreviousPosition.y = mousePosition.y;
        mousePosition.x = event.clientX;
        mousePosition.y = event.clientY;
        event.preventDefault();
    }   

}