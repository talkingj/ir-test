# IR Ball

Finds an RoboCup Junior soccer IR ball using the 6 sensor IR ring.

Each `update` reads every receiver as fast as possible for the sample
time (default 2500 µs) and counts how often each sees IR. A weighted
vector sum of the counts gives the ball direction; the strongest count
gives a rough distance.

Turn the LED display off (`led.enable(false)`) because
several of these pins are shared with it.

## Python

```python
led.enable(False)
ir_ball.set_sensor(1, DigitalPin.P6, 0)   # optional, defaults shown above

def on_forever():
    ir_ball.update()
    if ir_ball.seen():
        serial.write_value("dir", ir_ball.direction())
basic.forever(on_forever)
```

## Blocks

Everything is in the **IR Ball** category. Use **read all IR sensors**
once per loop; every other block reports the result of that read.

| Block | Python | Gives |
|---|---|---|
| read all IR sensors | `ir_ball.update()` | samples every sensor |
| ball direction | `ir_ball.direction()` | degrees, -180..180 |
| ball strength | `ir_ball.strength()` | strongest sensor, 0-100 % |
| ball seen | `ir_ball.seen()` | true / false |
| all IR strengths | `ir_ball.all_strengths()` | list of 6 strengths (item 0 = sensor 1) |
| IR strength sensor n | `ir_ball.sensor_strength(n)` | one sensor, 0-100 % |
| strongest IR sensor | `ir_ball.strongest_sensor()` | 1-6, 0 if none |
| second strongest IR sensor | `ir_ball.second_strongest_sensor()` | 1-6, 0 if none |
| angle of IR sensor n | `ir_ball.sensor_angle(n)` | degrees |
| IR count sensor n | `ir_ball.count(n)` | raw count |
| IR samples | `ir_ball.samples()` | samples per read |
