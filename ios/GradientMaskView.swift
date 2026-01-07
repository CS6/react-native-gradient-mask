import ExpoModulesCore
import UIKit

class GradientMaskView: ExpoView {

    // MARK: - Properties

    private let gradientMaskLayer = CAGradientLayer()
    /// Used to overlay gradient when maskOpacity = 0, making content fully visible
    private let solidMaskLayer = CALayer()

    private var _colors: [CGColor] = [
        UIColor.clear.cgColor,
        UIColor.black.cgColor
    ]

    private var _locations: [NSNumber] = [0, 1]
    private var _direction: String = "top"
    private var _maskOpacity: CGFloat = 1.0

    // MARK: - Initialization

    required init(appContext: AppContext? = nil) {
        super.init(appContext: appContext)
        setupView()
    }

    private func setupView() {
        backgroundColor = .clear
        clipsToBounds = true

        // Initialize gradient mask layer
        gradientMaskLayer.colors = _colors
        gradientMaskLayer.locations = _locations

        // Initialize solid mask layer (opaque black, used to overlay gradient)
        solidMaskLayer.backgroundColor = UIColor.black.cgColor
        // Initially solidMaskLayer is invisible (opacity = 1 - maskOpacity = 0)
        // So mask effect shows full gradient
        solidMaskLayer.opacity = 0.0

        updateGradientDirection()
    }

    // MARK: - Props Setters

    func setColors(_ colors: [Int]?) {
        guard let colors = colors else { return }
        _colors = colors.map { colorValue -> CGColor in
            let intValue = UInt32(bitPattern: Int32(truncatingIfNeeded: colorValue))
            return UIColor(
                red: CGFloat((intValue >> 16) & 0xFF) / 255.0,
                green: CGFloat((intValue >> 8) & 0xFF) / 255.0,
                blue: CGFloat(intValue & 0xFF) / 255.0,
                alpha: CGFloat((intValue >> 24) & 0xFF) / 255.0
            ).cgColor
        }
        updateGradientMask()
    }

    func setLocations(_ locations: [Double]?) {
        guard let locations = locations else { return }
        _locations = locations.map { NSNumber(value: $0) }
        updateGradientMask()
    }

    func setDirection(_ direction: String) {
        _direction = direction
        updateGradientDirection()
        updateGradientMask()
    }

    func setMaskOpacity(_ opacity: Double) {
        _maskOpacity = CGFloat(opacity)
        updateMaskOpacity()
    }

    // MARK: - Layout

    override func layoutSubviews() {
        super.layoutSubviews()
        updateGradientMask()
    }

    // MARK: - Gradient Mask

    private func updateGradientMask() {
        gradientMaskLayer.frame = bounds
        solidMaskLayer.frame = bounds

        gradientMaskLayer.colors = _colors
        gradientMaskLayer.locations = _locations

        updateGradientDirection()

        // Create composite mask: gradient + solid overlay
        let compositeMask = CALayer()
        compositeMask.frame = bounds
        compositeMask.addSublayer(gradientMaskLayer)
        compositeMask.addSublayer(solidMaskLayer)

        layer.mask = compositeMask
    }

    private func updateMaskOpacity() {
        CATransaction.begin()
        CATransaction.setDisableActions(true)
        // maskOpacity = 0 → solidMaskLayer.opacity = 1 → content fully visible
        // maskOpacity = 1 → solidMaskLayer.opacity = 0 → full gradient effect
        solidMaskLayer.opacity = Float(1.0 - _maskOpacity)
        CATransaction.commit()
    }

    private func updateGradientDirection() {
        switch _direction {
        case "top":
            gradientMaskLayer.startPoint = CGPoint(x: 0.5, y: 0)
            gradientMaskLayer.endPoint = CGPoint(x: 0.5, y: 1)
        case "bottom":
            gradientMaskLayer.startPoint = CGPoint(x: 0.5, y: 1)
            gradientMaskLayer.endPoint = CGPoint(x: 0.5, y: 0)
        case "left":
            gradientMaskLayer.startPoint = CGPoint(x: 0, y: 0.5)
            gradientMaskLayer.endPoint = CGPoint(x: 1, y: 0.5)
        case "right":
            gradientMaskLayer.startPoint = CGPoint(x: 1, y: 0.5)
            gradientMaskLayer.endPoint = CGPoint(x: 0, y: 0.5)
        default:
            gradientMaskLayer.startPoint = CGPoint(x: 0.5, y: 0)
            gradientMaskLayer.endPoint = CGPoint(x: 0.5, y: 1)
        }
    }
}
