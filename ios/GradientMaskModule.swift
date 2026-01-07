import ExpoModulesCore

public class GradientMaskModule: Module {
    public func definition() -> ModuleDefinition {
        Name("GradientMask")

        View(GradientMaskView.self) {
            // colors: List of processed colors (from processColor in JS)
            Prop("colors") { (view: GradientMaskView, colors: [Int]?) in
                view.setColors(colors)
            }

            // locations: Array of floats (0-1) for gradient stops
            Prop("locations") { (view: GradientMaskView, locations: [Double]?) in
                view.setLocations(locations)
            }

            // direction: "top" | "bottom" | "left" | "right"
            Prop("direction") { (view: GradientMaskView, direction: String?) in
                view.setDirection(direction ?? "top")
            }

            // maskOpacity: 0 = no mask effect, 1 = full gradient mask
            Prop("maskOpacity") { (view: GradientMaskView, opacity: Double?) in
                view.setMaskOpacity(opacity ?? 1.0)
            }
        }
    }
}
