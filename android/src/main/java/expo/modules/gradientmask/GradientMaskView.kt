package expo.modules.gradientmask

import android.content.Context
import android.graphics.*
import android.view.View
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView

/**
 * GradientMaskView - 原生漸層透明遮罩
 *
 * 使用 Bitmap 作為 mask，配合 setLayerType + PorterDuff.Mode.DST_IN
 *
 * 顏色語意（與 iOS CAGradientLayer mask 一致）：
 * - 顏色的 alpha 值決定該區域內容的可見度
 * - alpha = 0 → 內容透明（看到背景）
 * - alpha = 255 → 內容不透明（看到內容）
 *
 * maskOpacity 控制漸層 mask 效果的顯示程度：
 * - maskOpacity = 0 → 無漸層效果，內容完全可見（全部 alpha=255）
 * - maskOpacity = 1 → 完整漸層效果（使用原始 alpha）
 */
class GradientMaskView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {

    // Gradient mask 的參數
    private var colors: IntArray? = null
    private var locations: FloatArray? = null
    private var direction: String = "top"

    // maskOpacity: 0 = 無漸層效果, 1 = 完整漸層效果
    private var maskOpacity: Float = 1f

    // Mask bitmap 和相關的 Paint
    private var maskBitmap: Bitmap? = null
    private var maskBitmapInvalidated = true
    private val paint = Paint(Paint.ANTI_ALIAS_FLAG)
    private val porterDuffXferMode = PorterDuffXfermode(PorterDuff.Mode.DST_IN)

    init {
        // 確保背景是透明的
        setBackgroundColor(Color.TRANSPARENT)
        // 始終使用 SOFTWARE 模式，避免動態切換層模式造成的黑色閃爍
        setLayerType(View.LAYER_TYPE_SOFTWARE, null)

        android.util.Log.d("GradientMask", "=== GradientMaskView init ===")
    }

    // MARK: - Props setters

    fun setColors(colorArray: List<Int>?) {
        colors = colorArray?.toIntArray()
        maskBitmapInvalidated = true
        invalidate()
    }

    fun setLocations(locationArray: List<Double>?) {
        locations = locationArray?.map { it.toFloat() }?.toFloatArray()
        maskBitmapInvalidated = true
        invalidate()
    }

    fun setDirection(dir: String) {
        direction = dir
        maskBitmapInvalidated = true
        invalidate()
    }

    fun setMaskOpacity(opacity: Double) {
        maskOpacity = opacity.toFloat().coerceIn(0f, 1f)
        maskBitmapInvalidated = true
        invalidate()
    }

    // MARK: - Layout

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        if (w > 0 && h > 0) {
            updateMaskBitmap()
            maskBitmapInvalidated = false
        }
    }

    override fun onLayout(changed: Boolean, l: Int, t: Int, r: Int, b: Int) {
        super.onLayout(changed, l, t, r, b)
        if (changed) {
            maskBitmapInvalidated = true
        }
    }

    // MARK: - Drawing

    override fun dispatchDraw(canvas: Canvas) {
        // 檢查尺寸是否有效
        if (width <= 0 || height <= 0) {
            super.dispatchDraw(canvas)
            return
        }

        // 如果 mask bitmap 需要更新，重新創建
        if (maskBitmapInvalidated) {
            updateMaskBitmap()
            maskBitmapInvalidated = false
        }

        val bitmap = maskBitmap
        // 如果沒有 mask bitmap 或 maskOpacity=0，直接繪製子元件（無 mask 效果）
        if (bitmap == null || maskOpacity <= 0f) {
            super.dispatchDraw(canvas)
            return
        }

        // 使用 saveLayer 創建離屏緩衝區
        val saveCount = canvas.saveLayer(
            0f, 0f,
            width.toFloat(), height.toFloat(),
            null
        )

        try {
            // 先繪製所有子元件到離屏緩衝區
            super.dispatchDraw(canvas)

            // 應用 mask（使用 DST_IN 模式）
            paint.xfermode = porterDuffXferMode
            canvas.drawBitmap(bitmap, 0f, 0f, paint)
            paint.xfermode = null
        } finally {
            canvas.restoreToCount(saveCount)
        }
    }

    private fun updateMaskBitmap() {
        if (width <= 0 || height <= 0) return

        // 回收舊的 bitmap
        maskBitmap?.recycle()

        // 創建新的 mask bitmap
        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val bitmapCanvas = Canvas(bitmap)

        val currentColors = colors
        val currentLocations = locations

        // 如果沒有 colors/locations，創建全白 mask（內容完全可見）
        if (currentColors == null || currentLocations == null ||
            currentColors.size != currentLocations.size ||
            currentColors.isEmpty()) {
            bitmapCanvas.drawColor(Color.WHITE)
            maskBitmap = bitmap
            return
        }

        // 計算 effective colors（根據 maskOpacity 混合）
        val effectiveColors = IntArray(currentColors.size) { i ->
            val originalColor = currentColors[i]
            val originalAlpha = Color.alpha(originalColor)
            // 當 maskOpacity = 0，alpha = 255（完全不透明，內容完全可見）
            // 當 maskOpacity = 1，alpha = originalAlpha
            val blendedAlpha = (255 + (originalAlpha - 255) * maskOpacity).toInt()
            Color.argb(blendedAlpha, 255, 255, 255)
        }

        // 建立 gradient shader
        val (startX, startY, endX, endY) = getGradientCoordinates()
        val shader = LinearGradient(
            startX, startY, endX, endY,
            effectiveColors,
            currentLocations,
            Shader.TileMode.CLAMP
        )

        // 繪製漸層到 bitmap
        val gradientPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            this.shader = shader
        }
        bitmapCanvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), gradientPaint)

        maskBitmap = bitmap
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        maskBitmap?.recycle()
        maskBitmap = null
    }

    private fun getGradientCoordinates(): List<Float> {
        return when (direction) {
            "top" -> listOf(0f, 0f, 0f, height.toFloat())
            "bottom" -> listOf(0f, height.toFloat(), 0f, 0f)
            "left" -> listOf(0f, 0f, width.toFloat(), 0f)
            "right" -> listOf(width.toFloat(), 0f, 0f, 0f)
            else -> listOf(0f, 0f, 0f, height.toFloat())
        }
    }
}
