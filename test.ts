// Only compiled when testing the extension itself
irBall.setSampleTime(2500)
irBall.setThreshold(5)
basic.forever(function () {
    irBall.update()
    serial.writeValue("dir", irBall.direction())
    serial.writeValue("str", irBall.strength())
})