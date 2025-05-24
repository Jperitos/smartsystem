#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "SCC_COMPLAB_4G";
const char* password = "P@ss@2024";

// WebSocket server info
const char* websocket_host = "192.168.1.22"; // Your backend LAN IP
const uint16_t websocket_port = 9001;
const char* websocket_path = "/";

WebSocketsClient webSocket;
String incomingData = "";
String line = "";

float lastBinHeights[3] = {39.0, 39.0, 39.0};  // fallback heights

#define BUTTON_PIN 18
#define BUTTON_PRESSED LOW  // assuming button pulls to ground

bool lastButtonState = HIGH;
bool currentButtonState = HIGH;
unsigned long lastDebounceTime = 0;
const unsigned long debounceDelay = 50;

void setup() {
  Serial.begin(115200);
  Serial1.begin(9600, SERIAL_8N1, 16, 17); // RX=16, TX=17

  pinMode(BUTTON_PIN, INPUT_PULLUP);  // Button with internal pull-up

  Serial.println("🔌 ESP32 Booting...");
  WiFi.begin(ssid, password);

  Serial.print("🌐 Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ WiFi connected.");
  Serial.print("📡 IP Address: ");
  Serial.println(WiFi.localIP());

  webSocket.begin(websocket_host, websocket_port, websocket_path);
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000);

  Serial.println("🌐 Connecting to WebSocket...");
}

void loop() {
  webSocket.loop();

  // Handle button press with debounce
  handleButton();

  while (Serial1.available()) {
    char c = Serial1.read();
    incomingData += c;

    // Buffer lines from serial (until newline)
    if (c == '\n') {
      line = incomingData;
      incomingData = "";

      // Parse line for height info
      if (line.startsWith("Bin ")) {
        int binNum = line.substring(4, 5).toInt();
        int heightIndex = line.indexOf("Height:");
        int cmIndex = line.indexOf(" cm", heightIndex);

        if (heightIndex != -1 && cmIndex != -1 && binNum >= 1 && binNum <= 3) {
          String heightStr = line.substring(heightIndex + 7, cmIndex);
          heightStr.trim();
          float heightVal = heightStr.toFloat();
          lastBinHeights[binNum - 1] = heightVal;
        }
      }
    }

    if (incomingData.indexOf("<BIN>") != -1 && incomingData.indexOf("</BIN>") != -1) {
      int start = incomingData.indexOf("<BIN>") + 5;
      int end = incomingData.indexOf("</BIN>");
      String binData = incomingData.substring(start, end);
      binData.trim();

      Serial.println("\n\n🧾 Raw Serial Payload:");
      Serial.println(line);  // print last line for debugging

      sendParsedJson(binData);

      incomingData = "";
      line = "";
    }

    if (incomingData.length() > 1024) {
      incomingData = "";
      line = "";
    }
  }
}

void handleButton() {
  int reading = digitalRead(BUTTON_PIN);

  if (reading != lastButtonState) {
    lastDebounceTime = millis();
  }

  if ((millis() - lastDebounceTime) > debounceDelay) {
    if (reading != currentButtonState) {
      currentButtonState = reading;

      if (currentButtonState == BUTTON_PRESSED) {
        Serial.println("📱 Button pressed - Sending <MANUAL_SMS> command to Arduino");
        Serial1.println("<MANUAL_SMS>");
      }
    }
  }

  lastButtonState = reading;
}

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_CONNECTED:
      Serial.println("✅ WebSocket connected");
      break;
    case WStype_DISCONNECTED:
      Serial.println("❌ WebSocket disconnected");
      break;
    case WStype_ERROR:
      Serial.println("⚠️ WebSocket error");
      break;
    case WStype_TEXT:
      Serial.printf("📨 Server says: %s\n", payload);
      break;
    default:
      break;
  }
}

void sendParsedJson(String binData) {
  float values[6] = {0};
  int idx = 0;

  while (binData.length() > 0 && idx < 6) {
    int commaIndex = binData.indexOf(',');
    String val;

    if (commaIndex != -1) {
      val = binData.substring(0, commaIndex);
      binData = binData.substring(commaIndex + 1);
    } else {
      val = binData;
      binData = "";
    }

    val.trim();
    values[idx] = val.toFloat();
    idx++;
  }

  if (idx < 6) {
    Serial.println("⚠️ Incomplete data received, skipping.");
    return;
  }

  // Replace heights from parsed data with last known raw heights from serial lines
  for (int i = 0; i < 3; i++) {
    values[i * 2 + 1] = lastBinHeights[i];
  }

  StaticJsonDocument<256> doc;

  JsonObject bin1 = doc.createNestedObject("bin1");
  bin1["weight"] = values[0];
  bin1["height"] = values[1];
  bin1["average"] = (values[0] / 3000.0 * 100.0 + values[1]) / 2.0;

  JsonObject bin2 = doc.createNestedObject("bin2");
  bin2["weight"] = values[2];
  bin2["height"] = values[3];
  bin2["average"] = (values[2] / 3000.0 * 100.0 + values[3]) / 2.0;

  JsonObject bin3 = doc.createNestedObject("bin3");
  bin3["weight"] = values[4];
  bin3["height"] = values[5];
  bin3["average"] = (values[4] / 3000.0 * 100.0 + values[5]) / 2.0;

  String jsonStr;
  serializeJson(doc, jsonStr);

  Serial.println("📤 Sent JSON to backend via WebSocket:");
  Serial.println(jsonStr);

  if (webSocket.isConnected()) {
    webSocket.sendTXT(jsonStr);
  } else {
    Serial.println("⚠️ WebSocket not connected, can't send data.");
  }
}
