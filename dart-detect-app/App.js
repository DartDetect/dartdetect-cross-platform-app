import React, {useState, useEffect} from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./services/firebaseConfig";


const Stack = createStackNavigator();


export default function App() {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);
  
  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LoginPage">
        {user ? (
          <Stack.Screen name="Dashboard" component={Dashboard} />
        ): 
        (
          <>
          <Stack.Screen name = "LoginPage" component={LoginPage}/>
          <Stack.Screen name="SignupPage" component={SignupPage}/>
          </>  
        )}  
      </Stack.Navigator>
    </NavigationContainer>
  );
}
