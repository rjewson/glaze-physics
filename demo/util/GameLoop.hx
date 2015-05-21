package util;

import js.Browser;

class GameLoop 
{

    public var isRunning:Bool;
    public var animationStartTimestamp:Float;
    public var prevAnimationTime:Float;
    public var delta:Float;
    private var rafID:Int;

    public var updateFunc:Float->Int->Void;

    public inline static var MIN_DELTA:Float = (1000/60) + 1e-08;

    public function new() {
        isRunning = false;
    }

    public function update(timestamp:Float):Bool {
        delta = prevAnimationTime==0 ? MIN_DELTA : timestamp - prevAnimationTime;
        prevAnimationTime = timestamp;
        if (updateFunc!=null)
            updateFunc(Math.max(delta,MIN_DELTA),Math.floor(timestamp));
            //updateFunc(1000/60,Math.floor(timestamp));
        rafID = Browser.window.requestAnimationFrame(update);
        return false;
    }

    public function start() {
        if (isRunning==true)
            return;
        isRunning = true;
        prevAnimationTime = 0;
        rafID = Browser.window.requestAnimationFrame(update);
    }

    public function stop() {
        if (isRunning==false)
            return;
        isRunning = false;
        Browser.window.cancelAnimationFrame(rafID);
    }

}