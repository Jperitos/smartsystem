#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include "HX711.h"
#include <SoftwareSerial.h>

// Initialize LCD
LiquidCrystal_I2C lcd(0x27, 16, 2);

// HX711 Load Cell Pins (3 Sensors)
#define DT1  8
#define SCK1 9
#define DT2 10
#define SCK2 11
#define DT3 12
#define SCK3 13

// Ultrasonic Sensor Pins
const int trig1 = 2, echo1 = 3;
const int trig2 = 4, echo2 = 5;
const int trig3 = 6, echo3 = 7;

// Buzzer & SIM800L
#define BUZZER A0
#define SIM_TX A2
#define SIM_RX A3

// LED Alert Pin
#define LED_ALERT A1

// Define Load Cells
HX711 scale1, scale2, scale3;
SoftwareSerial sim800l(SIM_TX, SIM_RX);

// Constants and thresholds
const float calibration_factor = 7050;  // Adjust to your load cells' calibration
const float maxWeight = 5000.0;          // Max weight in grams
const int minDistance = 11;              // Ultrasonic min distance (cm)
const int maxDistance = 35;              // Ultrasonic max distance (cm)
const int alertThreshold = 85;           // Alert threshold in percent
const long interval = 1000;               // Sensor read interval (ms)
const char phoneNumber[] = "+639766262752";

// Variables for SMS alerts and call management
bool smsSent1 = false, smsSent2 = false, smsSent3 = false;
bool callMade = false;
bool callInProgress = false;
unsigned long callStartTime = 0;
const unsigned long callDuration = 25000; // 25 seconds call duration
unsigned long previousMillis = 0;

// Function prototypes
float getStableWeight(HX711 &scale);
int getDistance(int trigPin, int echoPin);
int getHeightPercentage(int distance);
void alertBuzzer(int count);
void fullBinAlert();
void sendSMSFormatted(const char* title, int weight, int weightPerc, int height, int heightPerc, int level);
void makeCall();
void manageCall();
void sendBinData(float w1, int h1, float w2, int h2, float w3, int h3);
void checkESP32Commands();
void sendManualSMS();

void setup() {
  Serial.begin(9600);       // Hardware Serial for ESP32 communication
  sim800l.begin(9600);

  lcd.init();
  lcd.backlight();

  pinMode(BUZZER, OUTPUT);
  digitalWrite(BUZZER, LOW);
  pinMode(LED_ALERT, OUTPUT);
  digitalWrite(LED_ALERT, LOW);

  scale1.begin(DT1, SCK1);
  scale2.begin(DT2, SCK2);
  scale3.begin(DT3, SCK3);

  // Set calibration factor & tare scales
  scale1.set_scale(calibration_factor);
  scale2.set_scale(calibration_factor);
  scale3.set_scale(calibration_factor);

  delay(1000); // Allow some settling
  scale1.tare();
  scale2.tare();
  scale3.tare();

  pinMode(trig1, OUTPUT); pinMode(echo1, INPUT);
  pinMode(trig2, OUTPUT); pinMode(echo2, INPUT);
  pinMode(trig3, OUTPUT); pinMode(echo3, INPUT);

  lcd.setCursor(0, 0);
  lcd.print("B1    % B2    %");
  lcd.setCursor(0, 1);
  lcd.print("B3    %");
}

void loop() {
  manageCall();  // Handle ongoing call (hang up if timed out)

  unsigned long currentMillis = millis();
  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;

    // Read sensors and process data
    float weight1 = getStableWeight(scale1);
    float weight2 = getStableWeight(scale2);
    float weight3 = getStableWeight(scale3);

    weight1 *= 1000;
    weight2 *= 1000;
    weight3 *= 1000;

    float weightPerc1 = min((weight1 / maxWeight) * 100.0, 100.0);
    float weightPerc2 = min((weight2 / maxWeight) * 100.0, 100.0);
    float weightPerc3 = min((weight3 / maxWeight) * 100.0, 100.0);

    int distance1 = getDistance(trig1, echo1);
    int distance2 = getDistance(trig2, echo2);
    int distance3 = getDistance(trig3, echo3);

    int heightPerc1 = getHeightPercentage(distance1);
    int heightPerc2 = getHeightPercentage(distance2);
    int heightPerc3 = getHeightPercentage(distance3);

    float bin1 = (weightPerc1 + heightPerc1) / 2.0;
    float bin2 = (weightPerc2 + heightPerc2) / 2.0;
    float bin3 = (weightPerc3 + heightPerc3) / 2.0;

    // Send data to ESP32
    sendBinData(weight1, heightPerc1, weight2, heightPerc2, weight3, heightPerc3);

    // Debug prints
    Serial.println("===== BIN LEVEL REPORT =====");
    Serial.print("Bin 1 - Weight: "); Serial.print(weight1, 1); Serial.print(" g ("); Serial.print(weightPerc1, 1); Serial.println("%)");
    Serial.print("Bin 1 - Height: "); Serial.print(distance1); Serial.print(" cm ("); Serial.print(heightPerc1); Serial.println("%)");
    Serial.print("Bin 1 - Final Bin Level: "); Serial.print(bin1, 1); Serial.println("%\n");

    Serial.print("Bin 2 - Weight: "); Serial.print(weight2, 1); Serial.print(" g ("); Serial.print(weightPerc2, 1); Serial.println("%)");
    Serial.print("Bin 2 - Height: "); Serial.print(distance2); Serial.print(" cm ("); Serial.print(heightPerc2); Serial.println("%)");
    Serial.print("Bin 2 - Final Bin Level: "); Serial.print(bin2, 1); Serial.println("%\n");

    Serial.print("Bin 3 - Weight: "); Serial.print(weight3, 1); Serial.print(" g ("); Serial.print(weightPerc3, 1); Serial.println("%)");
    Serial.print("Bin 3 - Height: "); Serial.print(distance3); Serial.print(" cm ("); Serial.print(heightPerc3); Serial.println("%)");
    Serial.print("Bin 3 - Final Bin Level: "); Serial.print(bin3, 1); Serial.println("%\n");

    Serial.println("============================\n");

    // Alert buzzer logic
    if (bin1 >= 95 || bin2 >= 95 || bin3 >= 95) {
      fullBinAlert();
    } else {
      int binCount = (bin1 >= alertThreshold) + (bin2 >= alertThreshold) + (bin3 >= alertThreshold);
      if (binCount > 0) alertBuzzer(binCount);
    }

    // SMS alerts with percentages
    if (bin1 >= alertThreshold && !smsSent1) {
      sendSMSFormatted("Bin 1 Alert!", (int)(weight1 + 0.5), (int)(weightPerc1 + 0.5),
                       (distance1 == -1 ? 0 : distance1), heightPerc1, (int)(bin1 + 0.5));
      smsSent1 = true;
    }
    if (bin2 >= alertThreshold && !smsSent2) {
      sendSMSFormatted("Bin 2 Alert!", (int)(weight2 + 0.5), (int)(weightPerc2 + 0.5),
                       (distance2 == -1 ? 0 : distance2), heightPerc2, (int)(bin2 + 0.5));
      smsSent2 = true;
    }
    if (bin3 >= alertThreshold && !smsSent3) {
      sendSMSFormatted("Bin 3 Alert!", (int)(weight3 + 0.5), (int)(weightPerc3 + 0.5),
                       (distance3 == -1 ? 0 : distance3), heightPerc3, (int)(bin3 + 0.5));
      smsSent3 = true;
    }

    if (bin1 < alertThreshold) smsSent1 = false;
    if (bin2 < alertThreshold) smsSent2 = false;
    if (bin3 < alertThreshold) smsSent3 = false;

    if (bin1 >= 95 || bin2 >= 95 || bin3 >= 95) {
      digitalWrite(LED_ALERT, HIGH);
    } else {
      digitalWrite(LED_ALERT, LOW);
    }

    if ((bin1 >= 95 || bin2 >= 95 || bin3 >= 95) && !callMade && !callInProgress) {
      delay(2000);
      makeCall();
      callMade = true;
    }

    if (bin1 < 95 && bin2 < 95 && bin3 < 95 && !callInProgress) {
      callMade = false;
    }

    lcd.setCursor(3, 0);
    lcd.print((int)bin1);
    lcd.print("%  ");
    lcd.setCursor(11, 0);
    lcd.print((int)bin2);
    lcd.print("%  ");
    lcd.setCursor(3, 1);
    lcd.print((int)bin3);
    lcd.print("%  ");
  }

  // Check for manual SMS command from ESP32
  checkESP32Commands();
}

float getStableWeight(HX711 &scale) {
  if (!scale.is_ready()) return 0;
  float sum = 0;
  const int samples = 5;
  for (int i = 0; i < samples; i++) {
    sum += scale.get_units(1);
    delay(5);
  }
  float avg = sum / samples;
  if (avg < 0) avg = 0;
  if (avg > (maxWeight / 1000.0)) avg = maxWeight / 1000.0;
  if (avg < 0.01) avg = 0;
  return avg;
}

int getDistance(int trigPin, int echoPin) {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  int duration = pulseIn(echoPin, HIGH, 30000);
  return (duration == 0) ? -1 : duration * 0.034 / 2;
}

int getHeightPercentage(int distance) {
  if (distance == -1) return 0;
  if (distance <= minDistance) return 100;
  if (distance >= maxDistance) return 0;
  return map(distance, maxDistance, minDistance, 0, 100);
}

void alertBuzzer(int count) {
  for (int i = 0; i < count; i++) {
    digitalWrite(BUZZER, HIGH);
    delay(500);
    digitalWrite(BUZZER, LOW);
    delay(500);
  }
}

void fullBinAlert() {
  for (int i = 0; i < 5; i++) {
    digitalWrite(BUZZER, HIGH);
    delay(150);
    digitalWrite(BUZZER, LOW);
    delay(150);
  }
}

void sendSMSFormatted(const char* title, int weight, int weightPerc, int height, int heightPerc, int level) {
  Serial.println("Sending SMS...");
  sim800l.println("AT+CMGF=1");
  delay(500);
  sim800l.print("AT+CMGS=\"");
  sim800l.print(phoneNumber);
  sim800l.println("\"");
  delay(500);

  sim800l.print(title);
  sim800l.print("\r\n");
  delay(200);

  sim800l.print("Weight: ");
  sim800l.print(weight);
  sim800l.print("g (");
  sim800l.print(weightPerc);
  sim800l.print("%)\r\n");
  delay(200);

  sim800l.print("Height: ");
  sim800l.print(height);
  sim800l.print("cm (");
  sim800l.print(heightPerc);
  sim800l.print("%)\r\n");
  delay(200);

  sim800l.print("Level: ");
  sim800l.print(level);
  sim800l.print("%\r\n");
  delay(200);

  sim800l.write(26);  // CTRL+Z to send SMS
  delay(3000);
  Serial.println("SMS Sent!");
}

void makeCall() {
  if (!callInProgress) {
    Serial.println("Making call...");
    sim800l.print("ATD");
    sim800l.print(phoneNumber);
    sim800l.println(";");
    callStartTime = millis();
    callInProgress = true;
    callMade = true;
  }
}

void manageCall() {
  if (callInProgress) {
    if (millis() - callStartTime >= callDuration) {
      Serial.println("Call duration reached, hanging up...");
      sim800l.println("ATH"); // Hang up
      delay(500);             // Brief delay for hang up command
      callInProgress = false;
      Serial.println("Call ended.");
    }
  }
}

void sendBinData(float w1, int h1, float w2, int h2, float w3, int h3) {
  String data = "<BIN>";
  data += String(w1, 1) + "," + String(h1) + ",";
  data += String(w2, 1) + "," + String(h2) + ",";
  data += String(w3, 1) + "," + String(h3);
  data += "</BIN>";
  Serial.println(data);
}

void checkESP32Commands() {
  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');
    command.trim();
    if (command == "<MANUAL_SMS>") {
      Serial.println("Manual SMS request received from ESP32");
      sendManualSMS();
    }
  }
}

void sendManualSMS() {
  float weight1 = getStableWeight(scale1) * 1000;
  float weight2 = getStableWeight(scale2) * 1000;
  float weight3 = getStableWeight(scale3) * 1000;

  int distance1 = getDistance(trig1, echo1);
  int distance2 = getDistance(trig2, echo2);
  int distance3 = getDistance(trig3, echo3);

  int heightPerc1 = getHeightPercentage(distance1);
  int heightPerc2 = getHeightPercentage(distance2);
  int heightPerc3 = getHeightPercentage(distance3);

  float bin1 = (min((weight1 / maxWeight) * 100.0, 100.0) + heightPerc1) / 2.0;
  float bin2 = (min((weight2 / maxWeight) * 100.0, 100.0) + heightPerc2) / 2.0;
  float bin3 = (min((weight3 / maxWeight) * 100.0, 100.0) + heightPerc3) / 2.0;

  int validDist1 = (distance1 == -1) ? 0 : distance1;
  int validDist2 = (distance2 == -1) ? 0 : distance2;
  int validDist3 = (distance3 == -1) ? 0 : distance3;

  char msg[512];
  snprintf(msg, sizeof(msg),
    "Manual bin Notification\n"
    "Bin1\n"
    "Weight: %d g (%d%%)\n"
    "Height: %d cm (%d%%)\n"
    "Average: %d%%\n\n"
    "Bin2\n"
    "Weight: %d g (%d%%)\n"
    "Height: %d cm (%d%%)\n"
    "Average: %d%%\n\n"
    "Bin3\n"
    "Weight: %d g (%d%%)\n"
    "Height: %d cm (%d%%)\n"
    "Average: %d%%",
    (int)(weight1 + 0.5), (int)min((weight1 / maxWeight) * 100, 100.0), validDist1, heightPerc1, (int)(bin1 + 0.5),
    (int)(weight2 + 0.5), (int)min((weight2 / maxWeight) * 100, 100.0), validDist2, heightPerc2, (int)(bin2 + 0.5),
    (int)(weight3 + 0.5), (int)min((weight3 / maxWeight) * 100, 100.0), validDist3, heightPerc3, (int)(bin3 + 0.5)
  );

  Serial.println("Sending manual SMS with full bin data:");
  Serial.println(msg);

  sim800l.println("AT+CMGF=1");  // SMS text mode
  delay(500);
  while (sim800l.available()) sim800l.read(); // flush buffer

  sim800l.print("AT+CMGS=\"");
  sim800l.print(phoneNumber);
  sim800l.println("\"");
  delay(500);
  while (sim800l.available()) sim800l.read(); // flush buffer

  sim800l.print(msg);
  delay(500);

  sim800l.write(26);  // CTRL+Z to send SMS
  delay(3000);
  while (sim800l.available()) Serial.write(sim800l.read());

  Serial.println("Manual SMS Sent!");
}
