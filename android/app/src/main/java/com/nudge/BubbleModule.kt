package com.nudge

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class BubbleModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    init {
        companionReactContext = reactContext
    }

    companion object {
        var companionReactContext: ReactApplicationContext? = null
            private set
    }

    override fun getName(): String {
        return "Bubble"
    }

    @ReactMethod
    fun hasOverlayPermission(promise: Promise) {
        val hasPermission = Settings.canDrawOverlays(reactApplicationContext)
        promise.resolve(hasPermission)
    }

    @ReactMethod
    fun requestOverlayPermission() {
        if (!Settings.canDrawOverlays(reactApplicationContext)) {
            val intent = Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:" + reactApplicationContext.packageName)
            )
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            reactApplicationContext.startActivity(intent)
        }
    }

    @ReactMethod
    fun showBubble() {
        if (Settings.canDrawOverlays(reactApplicationContext)) {
            val serviceIntent = Intent(reactApplicationContext, BubbleService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                reactApplicationContext.startForegroundService(serviceIntent)
            } else {
                reactApplicationContext.startService(serviceIntent)
            }
        }
    }

    @ReactMethod
    fun hideBubble() {
        val serviceIntent = Intent(reactApplicationContext, BubbleService::class.java)
        reactApplicationContext.stopService(serviceIntent)
    }

    @ReactMethod
    fun updateBubbleState(showBadge: Boolean) {
        BubbleService.instance?.updateBadge(showBadge)
    }

    @ReactMethod
    fun playSuccessAnimation() {
        BubbleService.instance?.playSuccessAnimation()
    }

    @ReactMethod
    fun moveToBackground() {
        val activity = currentActivity
        activity?.moveTaskToBack(true)
    }
}
