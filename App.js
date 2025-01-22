import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LOGIN from "./project/frontend/login";
import Biit from "./project/frontend/biitOfficialWall";  // Make sure to import the component correctly

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,  // Optionally hide headers if not needed
        }}
      >
        {/* Ensure to pass the component prop correctly */}
        <Stack.Screen name="Login" component={LOGIN} />
        <Stack.Screen name="BiitOfficialWall" component={Biit} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
