int beepPin = 11;

int sirenPin = 10;

int passivePin = 9;

bool hasSelfTested = false;

void sirenOn() {
digitalWrite(sirenPin, HIGH);
}

void sirenOff() {
digitalWrite(sirenPin, LOW);
}

void beepOn() {
digitalWrite(beepPin, HIGH);
}

void beepOff() {
digitalWrite(beepPin, LOW);
}

void sos() {
  //S
      beepOn();
      delay(100);
      beepOff(); 
      delay(100);

      beepOn();
      delay(100);
      beepOff(); 
      delay(100);

      beepOn();
      delay(100);
      beepOff(); 
  //Pause

      delay(500);

  //O
      beepOn();
      delay(500);
      beepOff(); 
      delay(500);

      beepOn();
      delay(500);
      beepOff(); 
      delay(500);

      beepOn();
      delay(500);
      beepOff(); 
     
     //pause
      delay(500);

//S

      beepOn();
      delay(100);
      beepOff(); 
      delay(100);

      beepOn();
      delay(100);
      beepOff(); 
      delay(100);

      beepOn();
      delay(100);
      beepOff(); 
      delay(100);
}

void code3() {
    //3 beeps (on .5 sec, off .5 sec)
      beepOn();
      delay(500);
      beepOff(); 
      delay(500);
      
      beepOn();
      delay(500);
      beepOff(); 
      delay(500);
      
      beepOn();
      delay(500);
      beepOff(); 
      delay(500);

    //1 second of silence

      delay(1000);
}

void analogCycle() {

    tone(passivePin, 659, 250);
    delay(250);
    tone(passivePin, 988, 250);
    delay(250);
}

void code3both() {

    //3 beeps (on .5 sec, off .5 sec)
      beepOn();
      analogCycle(); //500ms delay included
      beepOff(); 
      analogCycle();
      
      beepOn();
      analogCycle();
      beepOff(); 
      analogCycle();
      
      beepOn();
      analogCycle();
      beepOff(); 
      analogCycle();

    //1 second of silence

      analogCycle();
      analogCycle();
}

void selfTest() {

//SELF TEST
//Test Siren
  sirenOn();

  //Test active beep
  beepOn();
  delay(1000);
  beepOff();

//A second of silence
  delay(1000);
//Siren off
  sirenOff();

  //System ready!
}

void setup() {
  Serial.begin(9600); 
  pinMode(beepPin, OUTPUT); 
  pinMode(sirenPin, OUTPUT);

}

void loop() {
  if(!hasSelfTested) {
    selfTest();
    hasSelfTested = true;
  }
  while (Serial.available() == 0) {}

  String data = Serial.readString();

if(data == "startup") {
  //A pleasent arpeggio to show the analog buzzer works
    tone(passivePin, 523, 250);
    delay(250);
    tone(passivePin, 659, 250);
    delay(250);
    tone(passivePin, 784, 250);
    delay(250);
    tone(passivePin, 1047, 250);
    delay(250);
    tone(passivePin, 523, 500);
    delay(500);
}

  if (data == "trigger") {
    sirenOn();
    code3both();
    code3both();
    code3both();
    code3both();
    sirenOff();
  }
  if (data == "bye") {
    //A pleasent arpeggio to show the analog buzzer works
    tone(passivePin, 880, 500);
    delay(1000);
    tone(passivePin, 698, 500);
    delay(1000);

  }
}


