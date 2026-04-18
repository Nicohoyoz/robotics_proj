# 🤖 Gesture-Controlled Robot Gripper
### CSIT431 Introduction to Robotics — Montclair State University

A real-time hand gesture recognition system that controls a 3D-printed robotic gripper using computer vision and embedded systems. Built for a pick-and-place robotics competition.

---

## 📸 Demo

> Open hand → gripper opens | Closed fist → gripper closes | Peace sign → gripper holds

---

## 🧠 How It Works

```
Webcam → OpenCV (capture) → MediaPipe (21 hand landmarks) 
→ Gesture logic (open/close/hold) → PySerial (serial comm) 
→ Arduino MEGA2560 → MG90S Servo → Gripper jaws move
```

1. A webcam captures live video feed
2. OpenCV processes each frame and passes it to MediaPipe
3. MediaPipe's hand landmarker detects 21 landmarks on the hand in real time
4. Custom gesture logic classifies the hand pose into one of three commands
5. The command is sent over serial to an Arduino MEGA2560
6. The Arduino drives an MG90S micro servo to open or close the gripper jaws

---

## ✋ Gesture Controls

| Gesture | Command Sent | Gripper Action |
|---|---|---|
| Open hand (3+ fingers up) | `O` | Opens jaws |
| Closed fist (0 fingers up) | `C` | Closes jaws |
| Peace sign (index + middle up) | `H` | Holds current position |

---

## 🛠️ Tech Stack

**Software**
- Python 3.11
- OpenCV — webcam capture and frame processing
- MediaPipe — real-time hand landmark detection (21 points)
- PySerial — serial communication between Python and Arduino

**Hardware**
- Arduino MEGA2560 — microcontroller
- MG90S Micro Servo — actuates the gripper jaws
- 3D Printed Rack & Pinion Parallel Jaw Gripper (PapaBravo design, modified)
- Bambu Lab P1S — 3D printer used for fabrication

**CAD**
- TinkerCAD — gripper design and modification
- Bambu Studio — slicing and print preparation

---

## 📁 Project Structure

```
robotics_proj/
├── gesture_control.py      # Python: webcam + MediaPipe + serial communication
├── gripper_servo.ino       # Arduino: servo control via serial commands
├── hand_landmarker.task    # MediaPipe hand detection model
└── README.md
```

---

## 🚀 Setup & Installation

### Prerequisites
- Python 3.11 (via Anaconda recommended)
- Arduino IDE
- Arduino MEGA2560 connected via USB

### Python Dependencies
```bash
conda create -n robotics python=3.11 -y
conda activate robotics
pip install opencv-python mediapipe pyserial
```

### Arduino Setup
1. Open `gripper_servo.ino` in Arduino IDE
2. Select board: **Arduino Mega or Mega 2560**
3. Select correct COM port under Tools → Port
4. Upload the sketch

### Running The System
```bash
# Make sure Arduino IDE Serial Monitor is CLOSED first
conda activate robotics
cd path/to/robotics_proj
python gesture_control.py
```

> ⚠️ Update `SERIAL_PORT = 'COM3'` in `gesture_control.py` to match your Arduino's COM port

---

## ⚙️ Configuration

In `gesture_control.py`:
```python
SERIAL_PORT = 'COM3'    # Change to your Arduino port
BAUD_RATE   = 9600
```

In `gripper_servo.ino`:
```cpp
const int ANGLE_OPEN   = 0;    // Tune to your gripper's open position
const int ANGLE_CLOSE  = 160;  // Tune to your gripper's closed position
const int DETACH_DELAY = 600;  // ms before servo detaches (prevents overheating)
```

---

## 🔌 Wiring

| Servo Wire | Arduino Pin |
|---|---|
| Brown (GND) | GND |
| Red (Power) | 5V |
| Orange (Signal) | Pin 9 |

---

## 🏆 Competition

Built for the CSIT431 pick-and-place robotics competition — April 23, 2026, Montclair State University. Task: use hand gesture control to pick up 20 objects and transfer them between boxes within a 10 second time limit per object.

**Scoring:** Points per object grasped, deductions for drops and gripper loss of control.

---

## 💡 Key Design Decisions

- **Rack & pinion parallel jaw mechanism** — both jaws move simultaneously, self-centering on any object shape
- **`servo.detach()` after each move** — prevents MG90S overheating during 20 consecutive pick cycles
- **Landmark-based gesture detection** — no ML training required, purely geometric comparison of fingertip vs knuckle y-coordinates, 100% reliable in good lighting
- **3-state gesture system** — open/close/hold prevents accidental triggering during repositioning

---

## 📚 References

- [PapaBravo Rack & Pinion Gripper](https://www.thingiverse.com/thing:2661755)
- [MediaPipe Hand Landmarker](https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker)
- [Arduino Servo Library](https://www.arduino.cc/reference/en/libraries/servo/)

---

## 👤 Author

**Nicolas** — Group 5, CSIT431 Introduction to Robotics  
Montclair State University, Spring 2026
