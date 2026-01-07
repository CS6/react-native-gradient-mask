package expo.modules.gradientmask

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class GradientMaskModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("GradientMask")

        // View definition
        View(GradientMaskView::class) {
            // colors: List of processed colors (from processColor in JS)
            Prop("colors") { view: GradientMaskView, colors: List<Int>? ->
                view.setColors(colors)
            }

            // locations: Array of floats (0-1) for gradient stops
            Prop("locations") { view: GradientMaskView, locations: List<Double>? ->
                view.setLocations(locations)
            }

            // direction: "top" | "bottom" | "left" | "right"
            Prop("direction") { view: GradientMaskView, direction: String? ->
                view.setDirection(direction ?: "top")
            }

            // maskOpacity: 0 = no mask effect, 1 = full gradient mask
            Prop("maskOpacity") { view: GradientMaskView, opacity: Double? ->
                view.setMaskOpacity(opacity ?: 1.0)
            }
        }
    }
}
