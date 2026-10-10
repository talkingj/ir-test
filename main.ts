/**
 * IR ball sensing for RoboCup Junior soccer.
 * Pulse counting over a ring of IR receivers (e.g. IRM-V838M3) whose
 * outputs go LOW when they see the ball.
 */
//% color="#d9480f" icon="" block="IR Ball"
//% groups='["Read", "Setup", "Raw data"]'
namespace irBall {
    const DEG = Math.PI / 180

    // defaults match the robot PCB: IR_1..IR_6 on P6 P7 P9 P10 P4 P5
    let sensorPins: DigitalPin[] = [DigitalPin.P6, DigitalPin.P7, DigitalPin.P9,
    DigitalPin.P10, DigitalPin.P4, DigitalPin.P5]
    let angles: number[] = [0, 60, 120, 180, 240, 300]
    let cosT: number[] = []
    let sinT: number[] = []
    let counts: number[] = [0, 0, 0, 0, 0, 0]
    let sampleCount = 0
    let sampleTimeUs = 2500
    let threshold = 5
    let dir = 0
    let strengthPct = 0
    let ready = false

    // pull-ups and the trig table, done once (or again after a change)
    function setup(): void {
        cosT = []
        sinT = []
        for (let i = 0; i < sensorPins.length; i++) {
            pins.setPull(sensorPins[i], PinPullMode.PullUp)
            cosT.push(Math.cos(angles[i] * DEG))
            sinT.push(Math.sin(angles[i] * DEG))
        }
        ready = true
    }

    /**
     * Read all sensors for the sample time, then work out the ball's
     * direction and strength. Call this once per loop.
     */
    //% block="update IR ball"
    //% group="Read" weight=100
    export function update(): void {
        if (!ready) setup()
        const n = sensorPins.length
        for (let i = 0; i < n; i++) counts[i] = 0
        let samples = 0
        const end = input.runningTimeMicros() + sampleTimeUs
        while (input.runningTimeMicros() < end) {
            for (let j = 0; j < n; j++) {
                // pin reads 0 when it sees IR, so 1 - read adds 1
                counts[j] += 1 - pins.digitalReadPin(sensorPins[j])
            }
            samples++
        }
        sampleCount = samples

        // weighted vector sum -> angle; strongest sensor -> rough distance
        let x = 0
        let y = 0
        let best = 0
        for (let k = 0; k < n; k++) {
            x += counts[k] * cosT[k]
            y += counts[k] * sinT[k]
            if (counts[k] > best) best = counts[k]
        }
        strengthPct = Math.round(best * 100 / Math.max(1, samples))
        dir = Math.atan2(y, x) / DEG
    }

    /**
     * Ball direction in degrees from the last update.
     * 0 = straight ahead, positive = clockwise, range -180 to 180.
     */
    //% block="ball direction"
    //% group="Read" weight=90
    export function direction(): number {
        return dir
    }

    /**
     * Ball strength 0-100 % from the last update. Bigger = closer.
     */
    //% block="ball strength"
    //% group="Read" weight=80
    export function strength(): number {
        return strengthPct
    }

    /**
     * True if the ball strength is at or above the threshold.
     */
    //% block="ball seen"
    //% group="Read" weight=70
    export function seen(): boolean {
        return strengthPct >= threshold
    }

    /**
     * Set the pin and facing angle of one sensor.
     * @param sensor sensor number 1-6, eg: 1
     * @param pin the receiver's output pin
     * @param angle degrees, 0 = straight ahead, clockwise positive, eg: 0
     */
    //% block="set IR sensor $sensor to pin $pin facing $angle °"
    //% sensor.min=1 sensor.max=6
    //% group="Setup" weight=60
    export function setSensor(sensor: number, pin: DigitalPin, angle: number): void {
        const i = Math.constrain(sensor, 1, 6) - 1
        sensorPins[i] = pin
        angles[i] = angle
        ready = false
    }

    /**
     * How long each update samples for, in microseconds.
     * The ball's pattern repeats every ~833 us, so use 2500 or more.
     * @param us microseconds, eg: 2500
     */
    //% block="set IR sample time to $us µs"
    //% group="Setup" weight=50
    export function setSampleTime(us: number): void {
        sampleTimeUs = Math.max(100, us)
    }

    /**
     * Strength % below which the ball counts as not seen.
     * @param percent eg: 5
     */
    //% block="set no-ball threshold to $percent \\%"
    //% percent.min=0 percent.max=100
    //% group="Setup" weight=40
    export function setThreshold(percent: number): void {
        threshold = percent
    }

    /**
     * Raw count for one sensor from the last update.
     * @param sensor sensor number 1-6, eg: 1
     */
    //% block="IR count sensor $sensor"
    //% sensor.min=1 sensor.max=6
    //% group="Raw data" weight=30
    export function count(sensor: number): number {
        return counts[Math.constrain(sensor, 1, 6) - 1]
    }

    /**
     * How many times all sensors were read in the last update.
     */
    //% block="IR samples"
    //% group="Raw data" weight=20
    export function samples(): number {
        return sampleCount
    }
}