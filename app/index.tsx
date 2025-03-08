import React, { useState } from "react";
import {
  Dimensions,
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  GestureResponderEvent,
  Modal,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Measurement from "./measurement"; // Import the measurement calculator

// Get device dimensions. this is to make it compatible on web too, if not resized after loading, that is...
const { width } = Dimensions.get("window");
// Set a base width for the app to start on. it's a basis for rescaling
// your font size and everything follows 350px here in base device view (usually web)
const guidelineBaseWidth = 350;
// Helper function: scale font sizes based on device width.
const scaleFont = (size: number) => size * (width / guidelineBaseWidth);

// props of a custom button tag so I can style it
type CalcButtonProps = {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  buttonStyle?: object;
};

//making the button component CalcButton, it makes use of the props as its own properties
const CalcButton = ({ title, onPress, buttonStyle }: CalcButtonProps) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.button, buttonStyle]}>
      <Text style={styles.buttonText}>{title.trim()}</Text>
    </TouchableOpacity>
  );
};

export default function Index() {
  // mode state: "calculator" or "measurement"
  const [mode, setMode] = useState<"calculator" | "measurement">("calculator");

  // the displays are divided into two: upon pressing an operator after inputting an initial value, the initial input along with the operator will be sent atop the new, second operand value
  // Main (lower) display value
  const [currentValue, setCurrentValue] = useState<string>("0");
  // Stored first operand and operator for the calculation(the upper value; stored previously in your lower value)
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  // Sets the operator used (/, *, +, or -)
  const [operator, setOperator] = useState<string | null>(null);
  // Flag to know if "=" was pressed last. this is to cut a chain of equations
  const [hasResult, setHasResult] = useState<boolean>(false);
  // History array for storing calculation strings
  const [history, setHistory] = useState<string[]>([]);
  // State to control history modal visibility
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // Compute the operation result
  const computeOperation = (a: number, op: string, b: number): number => {
    switch (op) {
      case "+":
        return a + b;
      case "-":
        return a - b;
      case "*":
        return a * b;
      case "/":
        return a / b;
      default:
        return b;
    }
  };

  // dev log: [what I had in mind prior was to use linked lists to store the data in as a chain of integer numbers, or use a stack to read as a stack of numbers. even array would work. but, I remembered vanilla js has this text-to-string feature and tried it on here upon reading the docs, it now works like a string at first before being mutated and read as an integer]
  // Append a number to the current value
  const handleNumber = (num: string) => {
    // Prevent multiple decimal points
    if (num === "." && currentValue.includes(".")) {
      return;
    }
    if (hasResult) {
      setCurrentValue(num);
      setHasResult(false);
    } else {
      setCurrentValue(currentValue === "0" ? num : currentValue + num);
    }
  };

  // Handle operator press for continuous calculations
  const handleOperatorPress = (op: string) => {
    // If no second operand has been entered (currentValue is empty) but there's already a first operand,
    // just update the operator.
    if (currentValue === "" && firstOperand !== null) {
      // Update operator only if it's different.
      if (operator !== op) {
        setOperator(op);
      }
      return;
    }

    // this condition if triggered, sets the first input (or whatever is on the main display) into first operand in order to receive the second operand
    if (hasResult) {
      setFirstOperand(parseFloat(currentValue));
      setOperator(op);
      setCurrentValue("");
      setHasResult(false);
    }
    // this condition triggers if there is a prior value entered, an operator, and a second value entered, it will run upon pressing an operator or the equals button 
    else if (firstOperand !== null && operator && currentValue !== "") {
      // Check for division by zero
      if (operator === "/" && parseFloat(currentValue) === 0) {
        setCurrentValue("Error");
        setFirstOperand(null);
        setOperator(null);
        setHasResult(true);
        return;
      }
      const result = computeOperation(
        firstOperand,
        operator,
        parseFloat(currentValue)
      );

      // Save history entry
      setHistory(prev => [
        ...prev,
        `${firstOperand}${operator}${currentValue}=${result.toString()}`
      ]);
      setFirstOperand(result);
      setOperator(op);
      setCurrentValue("");
    } 
    // this condition runs if you did not put any number at all at the start (so 0), and sets the first operand to 0 to accept the second operand
    else {
      setFirstOperand(parseFloat(currentValue));
      setOperator(op);
      setCurrentValue("");
    }
  };

  // When "=" is pressed, calculate and show the result on the main display.
  const handleEquals = () => {
    if (firstOperand !== null && operator && currentValue !== "") {
      // Check for division by zero
      if (operator === "/" && parseFloat(currentValue) === 0) {
        setCurrentValue("Error");
        setFirstOperand(null);
        setOperator(null);
        setHasResult(true);
        return;
      }
      const result = computeOperation(
        firstOperand,
        operator,
        parseFloat(currentValue)
      );
      // Save history entry
      setHistory(prev => [
        ...prev,
        `${firstOperand}${operator}${currentValue}=${result.toString()}`
      ]);
      setCurrentValue(result.toString());
      // Keep the upper line intact so the user sees what was computed.
      setHasResult(true);
    }
  };

  //function for clearing the displays
  const handleClear = () => {
    setCurrentValue("0");
    setFirstOperand(null);
    setOperator(null);
    setHasResult(false);
  };

  // function for undoing a typed value on the main display
  const handleBackspace = () => {
    setCurrentValue(currentValue.length <= 1 ? "0" : currentValue.slice(0, -1));
  };

  // function for handling percentages - sets the decimal value two digits to the left
  const handlePercent = () => {
    setCurrentValue((parseFloat(currentValue) / 100).toString());
  };

  // Header with History and Measurement buttons
  const Header = () => {
    return (
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowHistory(true)} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>History</Text>
        </TouchableOpacity>
        {mode === "calculator" && (
          <TouchableOpacity onPress={() => setMode("measurement")} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>Measurement</Text>
          </TouchableOpacity>
        )}
        {mode === "measurement" && (
          <TouchableOpacity onPress={() => setMode("calculator")} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>Calculator</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Main render: if in measurement mode, show measurement.tsx; otherwise, show calculator.
  if (mode === "measurement") {
    return (
      <SafeAreaView style={styles.biggest_con}>
        <Header />
        <Measurement />
      </SafeAreaView>
    );
  }

  // display for calculator mode
  return (
    <SafeAreaView style={styles.biggest_con}>
      <Header />
      {/* Dual-line Display */}
      <View style={styles.displaycon}>
        {/* Upper line: shows first operand and operator */}
        <Text style={styles.upperDisplay}>
          {firstOperand !== null && operator ? `${firstOperand}${operator}` : ""}
        </Text>
        {/* Main line: shows current operand or result */}
        <Text style={styles.mainDisplay}>{currentValue}</Text>
      </View>

      {/* Calculator Container (with original columns and borders) */}
      <View style={styles.calccon}>
        {/* Column 1 */}
        <View style={styles.column}>
          <CalcButton title=" C " onPress={handleClear} />
          <CalcButton title=" 7 " onPress={() => handleNumber("7")} />
          <CalcButton title=" 4 " onPress={() => handleNumber("4")} />
          <CalcButton title=" 1 " onPress={() => handleNumber("1")} />
          <CalcButton title=" % " onPress={handlePercent} />
        </View>
        {/* Column 2 */}
        <View style={styles.column}>
          <CalcButton title=" / " onPress={() => handleOperatorPress("/")} />
          <CalcButton title=" 8 " onPress={() => handleNumber("8")} />
          <CalcButton title=" 5 " onPress={() => handleNumber("5")} />
          <CalcButton title=" 2 " onPress={() => handleNumber("2")} />
          <CalcButton title=" 0 " onPress={() => handleNumber("0")} />
        </View>
        {/* Column 3 */}
        <View style={styles.column}>
          <CalcButton title=" * " onPress={() => handleOperatorPress("*")} />
          <CalcButton title=" 9 " onPress={() => handleNumber("9")} />
          <CalcButton title=" 6 " onPress={() => handleNumber("6")} />
          <CalcButton title=" 3 " onPress={() => handleNumber("3")} />
          <CalcButton title="." onPress={() => handleNumber(".")} />
        </View>
        {/* Column 4 */}
        <View style={styles.column}>
          <CalcButton title="<-" onPress={handleBackspace} />
          <CalcButton title=" - " onPress={() => handleOperatorPress("-")} />
          <CalcButton title=" + " onPress={() => handleOperatorPress("+")} />
          {/* Equals button spans two rows vertically */}
          <CalcButton
            title=" = "
            onPress={handleEquals}
            buttonStyle={styles.equalsButton}
          />
        </View>
      </View>

      {/* History Modal */}
      <Modal visible={showHistory} animationType='fade' transparent={true}>
        <View style={styles.historyModalContainer}>
          <View style={styles.historyModal}>
            <Text style={styles.historyTitle}>History</Text>
            <FlatList
              data={history}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <Text style={styles.historyItem}>{item}</Text>
              )}
            />
            <TouchableOpacity
              onPress={() => setShowHistory(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  biggest_con: {
    flex: 1,
    backgroundColor: "Gray",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: "4%",
    paddingVertical: "1.5%",
    backgroundColor: "black",
    borderBottomWidth: 1,
    borderBottomColor: "gray",
  },
  headerButton: {
    padding: 3,
  },
  headerButtonText: {
    fontSize: scaleFont(15),
    color: "lightgray",
  },
  displaycon: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    backgroundColor: "black",
    padding: "5%",
    borderWidth: 5,
    borderColor: "darkgray",
  },
  // Upper line (smaller, responsive font)
  upperDisplay: {
    fontSize: scaleFont(24),
    color: "lightgray",
    alignSelf: "flex-start",
    marginBottom: 5,
  },
  // Main display (larger, responsive font)
  mainDisplay: {
    fontSize: scaleFont(48),
    color: "white",
  },
  calccon: {
    flex: 2,
    flexDirection: "row",
    backgroundColor: "gray",
    borderWidth: 5,
    borderColor: "lightgray",
  },
  column: {
    flex: 1,
    justifyContent: "space-evenly",
    alignItems: "center",
    padding: "2%",
    borderWidth: 1,
    borderColor: "darkgray",
  },
  button: {
    flex: 1,
    width: "90%",
    margin: "2%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 5,
  },
  buttonText: {
    fontSize: scaleFont(24),
  },
  equalsButton: {
    flex: 2, // spans two rows vertically
    width: "90%",
  },
  historyModalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
  },
  historyModal: {
    width: "80%",
    maxHeight: "80%",
    backgroundColor: "black",
    borderRadius: 10,
    padding: 20,
  },
  historyTitle: {
    fontSize: scaleFont(22),
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "left",
    color: 'white',
  },
  historyItem: {
    fontSize: scaleFont(18),
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "lightgray",
    color: 'white',
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    width:'25%'
  },
  closeButtonText: {
    color: "black",
    fontSize: scaleFont(15),
    textAlign:'center'
  },
});
