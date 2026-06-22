#include <Servo.h>

Servo gripper;

const int SERVO_PIN    = 9;
const int ANGLE_OPEN   = 0;
const int ANGLE_CLOSE  = 160;
const int DETACH_DELAY = 600;

char incoming    = ' ';
char lastCommand = ' ';

void attachAndMove(int angle) {
  gripper.attach(SERVO_PIN);
  gripper.write(angle);
  delay(DETACH_DELAY);
  gripper.detach();
}

void setup() {
  Serial.begin(9600);
  Serial.println("Gripper Ready. Send O=Open, C=Close, H=Hold");
  attachAndMove(ANGLE_OPEN);
  lastCommand = 'O';
}

void loop() {
  if (Serial.available() > 0) {
    incoming = Serial.read();
    if (incoming == 'O' && lastCommand != 'O') {
      Serial.println("OPEN");
      attachAndMove(ANGLE_OPEN);
      lastCommand = 'O';
    }
    else if (incoming == 'C' && lastCommand != 'C') {
      Serial.println("CLOSE");
      attachAndMove(ANGLE_CLOSE);
      lastCommand = 'C';
    }
    else if (incoming == 'H' && lastCommand != 'H') {
      Serial.println("HOLD");
      gripper.detach();
      lastCommand = 'H';
    }
  }
}