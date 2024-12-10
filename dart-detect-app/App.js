import React, {useState, useEffect} from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import PlayPage from "./pages/PlayPage";
import TrainingPage from "./pages/TrainingPage";


import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./services/firebaseConfig";


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();


function Tabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Training" component={TrainingPage} />
      <Tab.Screen name="Play" component={PlayPage} />
    </Tab.Navigator>
  );
}


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
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Tabs" component={Tabs} />
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
