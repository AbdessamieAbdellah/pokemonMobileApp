import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome5 } from '@expo/vector-icons';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import PokemonListScreen from '../components/PokemonListScreen';
import CartScreen from '../components/CartScreen';
import pokemonReducer from '../store/pokemonSlice';
import cartReducer from '../store/cartSlice';

const Tab = createBottomTabNavigator();

const store = configureStore({
  reducer: {
    pokemon: pokemonReducer,
    cart: cartReducer,
  },
});

const AppNavigator = () => {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              if (route.name === 'PokemonList') {
                iconName = focused ? 'list' : 'list';
              } else if (route.name === 'Cart') {
                iconName = focused ? 'shopping-cart' : 'shopping-cart';
              }
              return <FontAwesome5 name={iconName} size={size} color={color} />;
            },
          })}
          tabBarOptions={{
            activeTintColor: '#007bff',
            inactiveTintColor: 'gray',
          }}
        >
          <Tab.Screen name="PokemonList" component={PokemonListScreen} />
          <Tab.Screen name="Cart" component={CartScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </Provider>
  );
};

export default AppNavigator;
