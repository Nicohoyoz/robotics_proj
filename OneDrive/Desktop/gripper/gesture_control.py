import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import serial
import time
import urllib.request
import os

# Download hand landmarker model if not present
MODEL_PATH = 'hand_landmarker.task'
if not os.path.exists(MODEL_PATH):
    print("[INFO] Downloading hand landmarker model...")
    urllib.request.urlretrieve(
        'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
        MODEL_PATH
    )
    print("[INFO] Model downloaded.")

SERIAL_PORT = 'COM3'
BAUD_RATE = 9600

FINGERTIP_IDS = [8, 12, 16, 20]
MCP_IDS = [5, 9, 13, 17]

def is_finger_extended(landmarks, tip_id, mcp_id):
    return landmarks[tip_id].y < landmarks[mcp_id].y

def detect_gesture(landmarks):
    fingers_up = []
    for tip_id, mcp_id in zip(FINGERTIP_IDS, MCP_IDS):
        fingers_up.append(is_finger_extended(landmarks, tip_id, mcp_id))
    count = sum(fingers_up)
    if fingers_up[0] and fingers_up[1] and not fingers_up[2] and not fingers_up[3]:
        return 'HOLD'
    elif count >= 3:
        return 'OPEN'
    elif count == 0:
        return 'CLOSE'
    else:
        return 'UNKNOWN'

def connect_serial(port, baud):
    try:
        ser = serial.Serial(port, baud, timeout=1)
        time.sleep(2)
        print(f"[SERIAL] Connected on {port}")
        return ser
    except Exception as e:
        print(f"[SERIAL] Could not connect: {e}")
        print("[DEMO MODE] No serial output")
        return None

def send_command(ser, command, last_command):
    if command != last_command and command in ('O', 'C', 'H'):
        if ser:
            ser.write(command.encode())
            print(f"[SERIAL] Sent: '{command}'")
        else:
            print(f"[DEMO] Would send: '{command}'")
        return command
    return last_command

def draw_ui(frame, gesture, last_command, fps):
    h, w = frame.shape[:2]
    cv2.rectangle(frame, (0, 0), (w, 70), (30, 30, 30), -1)
    gesture_color = {
        'OPEN':    (0, 255, 100),
        'CLOSE':   (0, 100, 255),
        'HOLD':    (0, 255, 255),
        'UNKNOWN': (180, 180, 180),
        'NO HAND': (100, 100, 100)
    }.get(gesture, (255, 255, 255))
    cv2.putText(frame, f"Gesture: {gesture}", (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.9, gesture_color, 2)
    cmd_text = {
        'O': 'Gripper: OPEN',
        'C': 'Gripper: CLOSED',
        'H': 'Gripper: HOLDING'
    }.get(last_command, 'Gripper: WAITING')
    cv2.putText(frame, cmd_text, (10, 58),
                cv2.FONT_HERSHEY_SIMPLEX, 0.65, (200, 200, 200), 1)
    cv2.putText(frame, f"FPS: {fps:.1f}", (w - 110, 25),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (150, 150, 150), 1)
    cv2.rectangle(frame, (0, h - 35), (w, h), (30, 30, 30), -1)
    cv2.putText(frame, "Open=OPEN | Fist=CLOSE | Peace=HOLD | Q=quit",
                (10, h - 12), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (180, 180, 180), 1)
    return frame

def main():
    print("CSIT431 Robot Gripper Gesture Control - Group 5")
    ser = connect_serial(SERIAL_PORT, BAUD_RATE)

    # Setup MediaPipe new API
    base_options = python.BaseOptions(model_asset_path=MODEL_PATH)
    options = vision.HandLandmarkerOptions(
        base_options=base_options,
        num_hands=1,
        min_hand_detection_confidence=0.7,
        min_hand_presence_confidence=0.7,
        min_tracking_confidence=0.7
    )
    detector = vision.HandLandmarker.create_from_options(options)

    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

    last_command = None
    prev_time = time.time()

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.flip(frame, 1)
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
        result = detector.detect(mp_image)

        gesture = 'NO HAND'

        if result.hand_landmarks:
            for hand_landmarks in result.hand_landmarks:
                # Draw landmarks manually
                for landmark in hand_landmarks:
                    h, w = frame.shape[:2]
                    cx, cy = int(landmark.x * w), int(landmark.y * h)
                    cv2.circle(frame, (cx, cy), 3, (0, 255, 100), -1)

                gesture = detect_gesture(hand_landmarks)
                if gesture in ('OPEN', 'CLOSE', 'HOLD'):
                    command = {'OPEN': 'O', 'CLOSE': 'C', 'HOLD': 'H'}[gesture]
                    last_command = send_command(ser, command, last_command)

        curr_time = time.time()
        fps = 1.0 / (curr_time - prev_time + 1e-9)
        prev_time = curr_time

        frame = draw_ui(frame, gesture, last_command, fps)
        cv2.imshow('CSIT431 Gripper Control', frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    detector.close()
    if ser:
        ser.close()

if __name__ == '__main__':
    main()