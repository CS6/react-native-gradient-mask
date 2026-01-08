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
 *
 * 效能優化：
 * - 基礎漸層 bitmap (baseMaskBitmap) 只在 colors/locations/direction/size 變化時重建
 * - maskOpacity 變化時只使用 ColorMatrix 調整 alpha，不重建 bitmap
 */
class GradientMaskView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {

    // Gradient mask 的參數
    private var colors: IntArray? = null
    private var locations: FloatArray? = null
    private var direction: String = "top"

    // maskOpacity: 0 = 無漸層效果, 1 = 完整漸層效果
    private var maskOpacity: Float = 1f

    // 基礎漸層 bitmap（完整漸層效果，maskOpacity=1 時使用的原始漸層）
    private var baseMaskBitmap: Bitmap? = null
    // 是否需要重建基礎 bitmap（只有 colors/locations/direction/size 變化時才需要）
    private var baseBitmapInvalidated = true

    // 繪製用的 Paint
    private val paint = Paint(Paint.ANTI_ALIAS_FLAG)
    private val porterDuffXferMode = PorterDuffXfermode(PorterDuff.Mode.DST_IN)

    // 用於調整 mask alpha 的 ColorMatrix
    private val colorMatrix = ColorMatrix()
    private val colorMatrixFilter = ColorMatrixColorFilter(colorMatrix)

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
        baseBitmapInvalidated = true
        invalidate()
    }

    fun setLocations(locationArray: List<Double>?) {
        locations = locationArray?.map { it.toFloat() }?.toFloatArray()
        baseBitmapInvalidated = true
        invalidate()
    }

    fun setDirection(dir: String) {
        direction = dir
        baseBitmapInvalidated = true
        invalidate()
    }

    fun setMaskOpacity(opacity: Double) {
        val newOpacity = opacity.toFloat().coerceIn(0f, 1f)
        if (newOpacity != maskOpacity) {
            maskOpacity = newOpacity
            // 只需要 invalidate，不需要重建 bitmap
            // dispatchDraw 時會使用 ColorMatrix 來調整 alpha
            invalidate()
        }
    }

    // MARK: - Layout

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        if (w > 0 && h > 0) {
            updateBaseMaskBitmap()
            baseBitmapInvalidated = false
        }
    }

    override fun onLayout(changed: Boolean, l: Int, t: Int, r: Int, b: Int) {
        super.onLayout(changed, l, t, r, b)
        if (changed) {
            baseBitmapInvalidated = true
        }
    }

    // MARK: - Drawing

    override fun dispatchDraw(canvas: Canvas) {
        // 檢查尺寸是否有效
        if (width <= 0 || height <= 0) {
            super.dispatchDraw(canvas)
            return
        }

        // 如果基礎 bitmap 需要更新，重新創建
        if (baseBitmapInvalidated) {
            updateBaseMaskBitmap()
            baseBitmapInvalidated = false
        }

        val bitmap = baseMaskBitmap
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
            // 使用 ColorMatrix 來調整 alpha，實現 maskOpacity 效果
            // 這樣就不需要每次 maskOpacity 變化都重建 bitmap
            paint.xfermode = porterDuffXferMode
            paint.colorFilter = if (maskOpacity < 1f) {
                // 使用 ColorMatrix 來混合原始 alpha 和完全不透明
                // maskOpacity = 0 → 所有像素的 alpha 變為 255（完全可見）
                // maskOpacity = 1 → 使用原始 alpha
                //
                // ColorMatrix 的 alpha 行：[0, 0, 0, scale, translate]
                // 結果 alpha = originalAlpha * scale + translate
                //
                // 我們想要：resultAlpha = 255 + (originalAlpha - 255) * maskOpacity
                //         = 255 * (1 - maskOpacity) + originalAlpha * maskOpacity
                // 所以：scale = maskOpacity, translate = 255 * (1 - maskOpacity)
                colorMatrix.set(floatArrayOf(
                    1f, 0f, 0f, 0f, 0f,           // R
                    0f, 1f, 0f, 0f, 0f,           // G
                    0f, 0f, 1f, 0f, 0f,           // B
                    0f, 0f, 0f, maskOpacity, 255f * (1f - maskOpacity)  // A
                ))
                ColorMatrixColorFilter(colorMatrix)
            } else {
                null
            }
            canvas.drawBitmap(bitmap, 0f, 0f, paint)
            paint.xfermode = null
            paint.colorFilter = null
        } finally {
            canvas.restoreToCount(saveCount)
        }
    }

    /**
     * 更新基礎漸層 bitmap
     * 這個 bitmap 包含原始漸層效果（maskOpacity = 1 時的效果）
     * maskOpacity 的調整在 dispatchDraw 時透過 ColorMatrix 實現
     */
    private fun updateBaseMaskBitmap() {
        if (width <= 0 || height <= 0) return

        // 回收舊的 bitmap
        baseMaskBitmap?.recycle()

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
            baseMaskBitmap = bitmap
            return
        }

        // 轉換顏色為白色 + 原始 alpha（mask 只需要 alpha 通道）
        val maskColors = IntArray(currentColors.size) { i ->
            val originalColor = currentColors[i]
            val originalAlpha = Color.alpha(originalColor)
            Color.argb(originalAlpha, 255, 255, 255)
        }

        // 建立 gradient shader
        val (startX, startY, endX, endY) = getGradientCoordinates()
        val shader = LinearGradient(
            startX, startY, endX, endY,
            maskColors,
            currentLocations,
            Shader.TileMode.CLAMP
        )

        // 繪製漸層到 bitmap
        val gradientPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            this.shader = shader
        }
        bitmapCanvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), gradientPaint)

        baseMaskBitmap = bitmap
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        baseMaskBitmap?.recycle()
        baseMaskBitmap = null
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
