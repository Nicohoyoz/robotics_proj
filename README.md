# Gesture-Controlled Robotic Gripper

A real-time hand gesture recognition system that controls a 3D-printed robotic gripper using computer vision and embedded systems. A webcam reads the hand, software classifies the gesture, and an Arduino drives a servo to open, close, or hold the gripper. Built for a pick-and-place robotics competition.

## Demo

"live_output"

Open hand opens the jaws, a closed fist closes them, and a peace sign holds the current position.

## How It Works

The pipeline runs end to end in real time:

```
Webcam  ->  OpenCV (capture)  ->  MediaPipe (21 hand landmarks)
        ->  gesture logic (open / close / hold)  ->  PySerial
        ->  Arduino MEGA2560  ->  MG90S servo  ->  gripper jaws move
```

A webcam captures live video. OpenCV processes each frame and passes it to MediaPipe, whose hand landmarker detects 21 points on the hand. Custom logic compares fingertip and knuckle positions to classify the pose into one of three commands. That command is sent over serial to an Arduino MEGA2560, which drives an MG90S micro servo to move the gripper jaws.

## Gesture Controls

| Gesture | Command sent | Gripper action |
| --- | --- | --- |
| Open hand (3+ fingers up) | O | Opens the jaws |
| Closed fist (0 fingers up) | C | Closes the jaws |
| Peace sign (index + middle up) | H | Holds the current position |

## Tech Stack

Software: Python 3.11, OpenCV for webcam capture and frame processing, MediaPipe for real-time hand landmark detection, and PySerial for communication between Python and the Arduino.

Hardware: an Arduino MEGA2560 microcontroller, an MG90S micro servo that actuates the jaws, and a 3D-printed rack and pinion parallel-jaw gripper (PapaBravo design, modified), fabricated on a Bambu Lab P1S printer.

CAD: TinkerCAD for the gripper design and Bambu Studio for slicing and print preparation.

## Project Structure

```
robotics_proj/
  gesture_control.py     Python: webcam, MediaPipe, and serial communication
  gripper_servo.ino      Arduino: servo control via serial commands
  hand_landmarker.task   MediaPipe hand detection model
  README.md
  live_output
```

## Setup and Installation

Prerequisites: Python 3.11 (Anaconda recommended), the Arduino IDE, and an Arduino MEGA2560 connected over USB.

Python dependencies:

```bash
conda create -n robotics python=3.11 -y
conda activate robotics
pip install opencv-python mediapipe pyserial
```

Arduino setup: open gripper_servo.ino in the Arduino IDE, select the Arduino Mega or Mega 2560 board, choose the correct COM port under Tools then Port, and upload the sketch.

Running the system:

```bash
# Close the Arduino IDE Serial Monitor first so the port is free
conda activate robotics
cd path/to/robotics_proj
python gesture_control.py
```

Update SERIAL_PORT in gesture_control.py to match your Arduino's COM port.

## Configuration

In gesture_control.py:

```python
SERIAL_PORT = 'COM3'    # change to your Arduino port
BAUD_RATE   = 9600
```

In gripper_servo.ino:

```cpp
const int ANGLE_OPEN   = 0;    // tune to your gripper's open position
const int ANGLE_CLOSE  = 160;  // tune to your gripper's closed position
const int DETACH_DELAY = 600;  // ms before the servo detaches, prevents overheating
```

## Wiring

| Servo wire | Arduino pin |
| --- | --- |
| Brown (ground) | GND |
| Red (power) | 5V |
| Orange (signal) | Pin 9 |

## Competition

Built for a university pick-and-place robotics competition in Spring 2026. The task was to use hand gesture control to pick up objects and transfer them between boxes within a time limit. Scoring was points per object grasped, with deductions for drops and loss of control.

## Key Design Decisions

The rack and pinion parallel-jaw mechanism moves both jaws at once, which self-centers on objects of any shape. The servo detaches after each move to keep the MG90S from overheating across many consecutive pick cycles. Gesture detection is purely geometric, comparing fingertip and knuckle positions, so it needs no model training and stays reliable in good lighting. The three-state design of open, close, and hold prevents accidental triggering while repositioning.

## References

- PapaBravo rack and pinion gripper: https://www.thingiverse.com/thing:2661755
- MediaPipe hand landmarker: https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker
- Arduino servo library: https://www.arduino.cc/reference/en/libraries/servo/

## Author

Nicolas Hoyos, Spring 2026
EOF