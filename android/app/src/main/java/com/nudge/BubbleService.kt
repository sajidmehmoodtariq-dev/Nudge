package com.nudge

import android.animation.PropertyValuesHolder
import android.animation.ValueAnimator
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.content.res.Configuration
import android.graphics.PixelFormat
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.util.TypedValue
import android.view.*
import android.view.animation.OvershootInterpolator
import android.widget.FrameLayout
import android.widget.ImageView
import androidx.core.app.NotificationCompat
import com.facebook.react.modules.core.DeviceEventManagerModule
import kotlin.math.abs

class BubbleService : Service() {

    companion object {
        var instance: BubbleService? = null
            private set
    }

    private lateinit var windowManager: WindowManager
    private lateinit var bubbleRoot: FrameLayout
    private lateinit var bubbleIcon: ImageView
    private lateinit var bubbleBadge: View
    private lateinit var layoutParams: WindowManager.LayoutParams
    private lateinit var prefs: SharedPreferences

    private val handler = Handler(Looper.getMainLooper())

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        instance = this
        prefs = getSharedPreferences("BubblePrefs", Context.MODE_PRIVATE)
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager

        startForegroundServiceNotification()
        setupBubbleView()
    }

    private fun startForegroundServiceNotification() {
        val channelId = "NudgeBubbleServiceChannel"
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "Floating Bubble Service",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }

        val notification: Notification = NotificationCompat.Builder(this, channelId)
            .setContentTitle("Nudge")
            .setContentText("Floating bubble is active")
            .setSmallIcon(R.drawable.ic_n_icon)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()

        startForeground(1, notification)
    }

    private fun setupBubbleView() {
        val inflater = LayoutInflater.from(this)
        bubbleRoot = inflater.inflate(R.layout.bubble_layout, null) as FrameLayout
        bubbleIcon = bubbleRoot.findViewById(R.id.bubble_icon)
        bubbleBadge = bubbleRoot.findViewById(R.id.bubble_badge)

        val sizePx = TypedValue.applyDimension(
            TypedValue.COMPLEX_UNIT_DIP,
            56f,
            resources.displayMetrics
        ).toInt()
        
        val marginPx = TypedValue.applyDimension(
            TypedValue.COMPLEX_UNIT_DIP,
            16f,
            resources.displayMetrics
        ).toInt()

        layoutParams = WindowManager.LayoutParams(
            sizePx,
            sizePx,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
            else
                WindowManager.LayoutParams.TYPE_PHONE,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        )

        layoutParams.gravity = Gravity.TOP or Gravity.START
        
        // Convert bottom/end logic to top/start coordinates
        val displayMetrics = resources.displayMetrics
        val screenWidth = displayMetrics.widthPixels
        val screenHeight = displayMetrics.heightPixels

        val defaultX = screenWidth - sizePx - marginPx
        val defaultY = screenHeight - sizePx - marginPx

        val lastX = prefs.getInt("bubble_x", defaultX)
        val lastY = prefs.getInt("bubble_y", defaultY)
        layoutParams.x = clampX(lastX)
        layoutParams.y = clampY(lastY)

        windowManager.addView(bubbleRoot, layoutParams)

        setupDragListener()
    }

    private fun clampX(x: Int): Int {
        val screenWidth = resources.displayMetrics.widthPixels
        val max = screenWidth - layoutParams.width
        return Math.max(0, Math.min(x, max))
    }

    private fun clampY(y: Int): Int {
        val screenHeight = resources.displayMetrics.heightPixels
        val max = screenHeight - layoutParams.height
        return Math.max(0, Math.min(y, max))
    }

    private fun setupDragListener() {
        val touchSlop = 15f

        bubbleIcon.setOnTouchListener(object : View.OnTouchListener {
            private var initialX = 0
            private var initialY = 0
            private var initialTouchX = 0f
            private var initialTouchY = 0f
            private var isMoved = false

            override fun onTouch(v: View, event: MotionEvent): Boolean {
                when (event.action) {
                    MotionEvent.ACTION_DOWN -> {
                        initialX = layoutParams.x
                        initialY = layoutParams.y
                        initialTouchX = event.rawX
                        initialTouchY = event.rawY
                        isMoved = false
                        return true
                    }
                    MotionEvent.ACTION_MOVE -> {
                        val deltaX = abs(event.rawX - initialTouchX)
                        val deltaY = abs(event.rawY - initialTouchY)
                        
                        if (deltaX > touchSlop || deltaY > touchSlop) {
                            isMoved = true
                        }

                        if (isMoved) {
                            layoutParams.x = initialX + (event.rawX - initialTouchX).toInt()
                            layoutParams.y = initialY + (event.rawY - initialTouchY).toInt()
                            windowManager.updateViewLayout(bubbleRoot, layoutParams)
                        }
                        return true
                    }
                    MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                        if (isMoved) {
                            // Run spring bounce animation to nearest edge or clamp
                            animateToClampedPosition(layoutParams.x, layoutParams.y)
                        } else if (event.action == MotionEvent.ACTION_UP) {
                            // It was a tap!
                            emitTapEvent()
                        }
                        return true
                    }
                }
                return false
            }
        })
    }

    private fun animateToClampedPosition(currentX: Int, currentY: Int) {
        val targetX = clampX(currentX)
        val targetY = clampY(currentY)

        val pvhX = PropertyValuesHolder.ofInt("x", currentX, targetX)
        val pvhY = PropertyValuesHolder.ofInt("y", currentY, targetY)

        val animator = ValueAnimator.ofPropertyValuesHolder(pvhX, pvhY)
        animator.duration = 300
        animator.interpolator = OvershootInterpolator(1.2f)
        animator.addUpdateListener { anim ->
            layoutParams.x = anim.getAnimatedValue("x") as Int
            layoutParams.y = anim.getAnimatedValue("y") as Int
            windowManager.updateViewLayout(bubbleRoot, layoutParams)
        }
        animator.start()

        // Save position
        prefs.edit()
            .putInt("bubble_x", targetX)
            .putInt("bubble_y", targetY)
            .apply()
    }

    private fun emitTapEvent() {
        // ALWAYS bring the app to the foreground first
        val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
        if (launchIntent != null) {
            launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
            startActivity(launchIntent)
        }

        // Then emit the event so React Native renders the Bottom Sheet
        val reactContext = BubbleModule.companionReactContext
        if (reactContext != null && reactContext.hasActiveReactInstance()) {
            reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("onBubbleTap", null)
        }
    }

    override fun onConfigurationChanged(newConfig: Configuration) {
        super.onConfigurationChanged(newConfig)
        if (::bubbleRoot.isInitialized) {
            // Re-clamp position if screen size changed (e.g., rotation, split screen)
            animateToClampedPosition(layoutParams.x, layoutParams.y)
        }
    }

    fun updateBadge(show: Boolean) {
        if (::bubbleBadge.isInitialized) {
            Handler(Looper.getMainLooper()).post {
                bubbleBadge.visibility = if (show) View.VISIBLE else View.GONE
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        instance = null
        if (::bubbleRoot.isInitialized) {
            windowManager.removeView(bubbleRoot)
        }
    }
}
