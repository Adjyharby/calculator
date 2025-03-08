import React, { useState } from "react";
import {
  Dimensions,
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  GestureResponderEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Get device dimensions. This is to make it compatible on web too, if not resized after loading.
const { width } = Dimensions.get("window");
// Set a base width for the app to start on. It's a basis for rescaling
// your font size and everything follows 350px here in base device view (usually web)
const guidelineBaseWidth = 350;
// Helper function: scale font sizes based on device width.
const scaleFont = (size: number) => size * (width / guidelineBaseWidth);

// Available units for measurement conversion.
const availableUnits = ["picas", "inches", "cm", "mm"];
// Conversion factors: conversion to inches for each unit.
// 1 pica = 1/6 inches, 1 cm = 1/2.54 inches, 1 mm = 1/25.4 inches.
const conversionFactors: { [key: string]: number } = {
  inches: 1,
  picas: 1 / 6,
  cm: 1 / 2.54,
  mm: 1 / 25.4,
};

// Props of a custom button tag so I can style it
type CalcButtonProps = {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  buttonStyle?: object;
};

// Making the button component CalcButton, it makes use of the props as its own properties
const CalcButton = ({ title, onPress, buttonStyle }: CalcButtonProps) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.button, buttonStyle]}>
      <Text style={styles.buttonText}>{title.trim()}</Text>
    </TouchableOpacity>
  );
};

export default function Measurement() {
  // Editable left box value
  const [inputValue, setInputValue] = useState<string>("0");
  // Left and right unit states; you can toggle these.
  const [leftUnit, setLeftUnit] = useState<string>("inches");
  const [rightUnit, setRightUnit] = useState<string>("cm");

  // Function to compute the conversion result.
  // It converts the input value from the left unit to inches,
  // then from inches to the right unit.
  const getConvertedValue = (): string => {
    const num = parseFloat(inputValue);
    if (isNaN(num)) return "";
    const valueInInches = num * conversionFactors[leftUnit];
    const converted = valueInInches / conversionFactors[rightUnit];
    // Round up the converted value to 10 significant digits.
    return converted.toPrecision(10);
  };

  // Append a number to the input value
  const handleNumber = (num: string) => {
    // Prevent multiple decimal points.
    if (num === "." && inputValue.includes(".")) return;
    // Limit input to 10 digits (ignoring non-digit characters).
    const digitsOnly = inputValue.replace(/\D/g, "");
    if (digitsOnly.length >= 10) return;
    if (inputValue === "0") {
      setInputValue(num);
    } else {
      setInputValue(inputValue + num);
    }
  };

  // "Enter" button handler.
  // In this example, conversion is live so Enter does nothing.
  const handleEnter = () => {
    // You can modify this to, for example, store the conversion in history.
  };

  // Backspace: remove the last digit.
  const handleBackspace = () => {
    setInputValue(inputValue.length <= 1 ? "0" : inputValue.slice(0, -1));
  };

  // Toggle the left unit by cycling through available units.
  const toggleLeftUnit = () => {
    const currentIndex = availableUnits.indexOf(leftUnit);
    const nextIndex = (currentIndex + 1) % availableUnits.length;
    setLeftUnit(availableUnits[nextIndex]);
  };

  // Toggle the right unit by cycling through available units.
  const toggleRightUnit = () => {
    const currentIndex = availableUnits.indexOf(rightUnit);
    const nextIndex = (currentIndex + 1) % availableUnits.length;
    setRightUnit(availableUnits[nextIndex]);
  };

  return (
    <SafeAreaView style={styles.biggest_con}>
      {/* Display area with two toggleable boxes */}
      <View style={styles.measureDisplayCon}>
        {/* Editable left box */}
        <View style={styles.measureBox}>
          <Text style={styles.measureValue}>{inputValue}</Text>
          <TouchableOpacity onPress={toggleLeftUnit} style={styles.unitToggle}>
            <Text style={styles.unitText}>{leftUnit}</Text>
          </TouchableOpacity>
        </View>
        {/* Non-editable right box: shows converted value */}
        <View style={styles.measureBox}>
          <Text style={styles.measureValue}>{getConvertedValue()}</Text>
          <TouchableOpacity onPress={toggleRightUnit} style={styles.unitToggle}>
            <Text style={styles.unitText}>{rightUnit}</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Number pad: contains digits 0-9, decimal point, enter and backspace */}
      <View style={styles.numPad}>
        {/* Row 1 */}
        <View style={styles.numPadRow}>
          <CalcButton title="7" onPress={() => handleNumber("7")} />
          <CalcButton title="8" onPress={() => handleNumber("8")} />
          <CalcButton title="9" onPress={() => handleNumber("9")} />
        </View>
        {/* Row 2 */}
        <View style={styles.numPadRow}>
          <CalcButton title="4" onPress={() => handleNumber("4")} />
          <CalcButton title="5" onPress={() => handleNumber("5")} />
          <CalcButton title="6" onPress={() => handleNumber("6")} />
        </View>
        {/* Row 3 */}
        <View style={styles.numPadRow}>
          <CalcButton title="1" onPress={() => handleNumber("1")} />
          <CalcButton title="2" onPress={() => handleNumber("2")} />
          <CalcButton title="3" onPress={() => handleNumber("3")} />
        </View>
        {/* Row 4 */}
        <View style={styles.numPadRow}>
          <CalcButton title="0" onPress={() => handleNumber("0")} />
          <CalcButton title="." onPress={() => handleNumber(".")} />
          <CalcButton title="Enter" onPress={handleEnter} />
        </View>
        {/* Optional Backspace row */}
        <View style={styles.numPadRow}>
          <CalcButton title="<-" onPress={handleBackspace} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  biggest_con: {
    flex: 1,
    backgroundColor: "black",
  },
  measureDisplayCon: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "darkgray",
    borderWidth: 5,
  },
  measureBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "gray",
    borderRadius: 5,
    padding: 10,
    margin: 10,
    width: "85%",
    justifyContent: "space-between",
  },
  measureValue: {
    marginLeft: "1%",
    fontSize: scaleFont(15),
    color: "white",
  },
  unitToggle: {
    backgroundColor: "white",
    padding: 5,
    borderRadius: 3,
  },
  unitText: {
    fontSize: scaleFont(18),
    color: "black",
  },
  numPad: {
    flex: 2,
    padding: "5%",
    justifyContent: "space-around",
    borderColor: "lightgray",
    borderWidth: 5,
    backgroundColor: "gray",
  },
  numPadRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 5,
  },
  button: {
    flex: 1,
    margin: "2%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 5,
    padding: 10,
  },
  buttonText: {
    fontSize: scaleFont(24),
  },
});
