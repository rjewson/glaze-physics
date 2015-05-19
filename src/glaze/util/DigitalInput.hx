package glaze.util;

import js.html.Event;
import js.html.EventTarget;
import glaze.geom.Vector2;
import js.html.KeyboardEvent;
import js.html.MouseEvent;

class DigitalInput 
{

    public var keyMap : Array<Int>;
    public var mousePosition : Vector2;
    public var mousePreviousPosition : Vector2;
    public var mouseOffset : Vector2;
    public var inputCorrection : Vector2;
    private var frameRef : Int;
    private var target : EventTarget;

    public function new() {
        keyMap = new Array<Int>();
        for (i in 0...255) {
            keyMap[i] = 0;
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
        //target.addEventListener("touchstart",MouseDown,false);

        target.addEventListener("mouseup",MouseUp,false);
        target.addEventListener("mousemove",MouseMove,false);
        // target.addEventListener(MouseEvent.RIGHT_MOUSE_DOWN, RightMouseDown, false, 0, true);
        // target.addEventListener(MouseEvent.RIGHT_MOUSE_UP, RightMouseUp, false, 0, true);
        this.inputCorrection = inputCorrection;
    }

    public function Update(x:Float,y:Float) : Void {
        mouseOffset.x = x;
        mouseOffset.y = y;
        frameRef++;
        // mousePreviousPosition.x = mousePosition.x;
        // mousePreviousPosition.y = mousePosition.y;
        // mousePosition.x = target.mouseX + screenOffset.x;
        // mousePosition.y = target.mouseY + screenOffset.y;
    }

    public function KeyDown(event : KeyboardEvent) : Void {
        if (keyMap[event.keyCode] == 0) {           
            keyMap[event.keyCode] = frameRef;
        }
        event.preventDefault();
    }

    public function KeyUp(event : KeyboardEvent) : Void {
        keyMap[event.keyCode] = 0;
        event.preventDefault();
    }

    public function MouseDown(event : KeyboardEvent) : Void {
        keyMap[200] = frameRef;
        event.preventDefault();
    }

    public function MouseUp(event : KeyboardEvent) : Void {
        keyMap[200] = 0;
        event.preventDefault();
    }

    public function MouseMove(event : MouseEvent) : Void {
        mousePreviousPosition.x = mousePosition.x;
        mousePreviousPosition.y = mousePosition.y;
        mousePosition.x = event.clientX - inputCorrection.x;
        mousePosition.y = event.clientY - inputCorrection.y;
        event.preventDefault();
    }

    // public function RightMouseDown(event : MouseEvent) : Void {
    //     keyMap[201] = frameRef;
    // }

    // public function RightMouseUp(event : MouseEvent) : Void {
    //     keyMap[201] = 0;
    // }
    
    inline public function Pressed(keyCode : Int) : Bool {
        return (keyMap[keyCode] > 0);
    }

    inline public function JustPressed(keyCode : Int) : Bool {
        return (keyMap[keyCode] == frameRef-1);
    }
    
    inline public function PressedDuration(keyCode : Int) : Int {
        var duration = keyMap[keyCode];
        return (duration > 0) ? (frameRef - duration) : -1;
    }
    
    inline public function Released(keyCode : Int) : Bool {
        return (keyMap[keyCode] == 0);
    }

}