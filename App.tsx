import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, SafeAreaView, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';

interface Pokemon {
  id: number;
  name: string;
  imageUrl: string;
}

interface CartItem {
  productID: string;
  title: string;
  quantity: number;
}

interface AppState {
  pokemon: Pokemon[];
  cart: CartItem[];
}

// Create bottom tab navigator
const Tab = createBottomTabNavigator();

// Redux slices 
const pokemonSlice = createSlice({
  name: 'pokemon',
  initialState: [] as Pokemon[],
  reducers: {
    fetchPokemonSuccess: (state, action: PayloadAction<Pokemon[]>) => {
      return action.payload;
    },
  },
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: [] as CartItem[],
  reducers: {
    addToCart: (state, action: PayloadAction<Pokemon>) => {
      const { id, name } = action.payload;
      const existingItem = state.find((item) => item.productID === id.toString());
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.push({ productID: id.toString(), title: name, quantity: 1 });
      }
    },
    adjustQuantity: (state, action: PayloadAction<{ productID: string; newQuantity: number }>) => {
      const { productID, newQuantity } = action.payload;
      const existingItem = state.find((item) => item.productID === productID);
      if (existingItem) {
        existingItem.quantity = newQuantity;
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      const productID = action.payload;
      return state.filter((item) => item.productID !== productID);
    },
  },
});

// Create Redux store
const store = configureStore({
  reducer: {
    pokemon: pokemonSlice.reducer,
    cart: cartSlice.reducer,
  },
});

// Destructure actions from slices
const { fetchPokemonSuccess } = pokemonSlice.actions;
const { addToCart, adjustQuantity, removeFromCart } = cartSlice.actions;

// Pokemon List Screen
const PokemonListScreen = () => {
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const pokemonList = useSelector((state: AppState) => state.pokemon);
  const cartItems = useSelector((state: AppState) => state.cart);
  const navigation = useNavigation();

  useEffect(() => {
    fetchPokemonData();
  }, []);

  // Fetch Pokemon data function
  const fetchPokemonData = async () => {
    try {
      const response = await fetch('https://pokeapi.co/api/v2/pokemon');
      const data = await response.json();
      const pokemonData: Pokemon[] = data.results.map((pokemon: any, index: number) => ({
        id: index + 1,
        name: pokemon.name,
        imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${index + 1}.png`,
      }));
      dispatch(fetchPokemonSuccess(pokemonData));
      setLoading(false); // Set loading to false when data is fetched
    } catch (error) {
      console.error('Error fetching Pokémon data:', error);
    }
  };

  // Add Pokemon to cart function
  const handleAddToCart = (pokemon: Pokemon) => {
    dispatch(addToCart(pokemon));
  };

  useEffect(() => {
    const total = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    setTotalItems(total);
  }, [cartItems]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
        <View style={styles.topBar}>
          <View style={styles.totalItemsContainer}>
            <FontAwesome5 name="shopping-cart" size={20} color="#007bff" />
            <Text style={styles.totalItemsLabel}> Total Items:</Text>
            <Text style={styles.totalItems}>{totalItems}</Text>
          </View>
        </View>
      </TouchableOpacity>
      <FlatList
        data={pokemonList}
        renderItem={({ item }: { item: Pokemon }) => (
          <View style={styles.pokemonItem}>
            <Image style={styles.pokemonImage} source={{ uri: item.imageUrl }} />
            <Text style={styles.pokemonName}>{item.name}</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => handleAddToCart(item)}>
              <Text style={styles.buttonText}>Add to Cart</Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        contentContainerStyle={styles.flatListContent}
        key={Dimensions.get('window').width}
      />
    </SafeAreaView>
  );
};

// Cart Screen
const CartScreen = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state: AppState) => state.cart);

  // Adjust quantity of item in cart function
  const handleAdjustQuantity = (productID: string, newQuantity: number) => {
    dispatch(adjustQuantity({ productID, newQuantity }));
  };

  // Remove item from cart function
  const handleRemoveFromCart = (productID: string) => {
    dispatch(removeFromCart(productID));
  };

  // Get total items in cart function
  const getTotalItems = () => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  };

  // Handle buy action function
  const handleBuy = () => {
    const totalItems = getTotalItems();
    const message = `You are buying ${totalItems} items`;
    Alert.alert('Confirm Buy', message);
  };

  // Render each cart item
  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <Text style={styles.cartItemName}>{item.title}</Text>
      <View style={styles.quantityContainer}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => handleAdjustQuantity(item.productID, item.quantity - 1)}
          disabled={item.quantity === 1}
        >
          <Text style={styles.buttonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.quantity}>{item.quantity}</Text>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => handleAdjustQuantity(item.productID, item.quantity + 1)}
        >
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveFromCart(item.productID)}
        >
          <Text style={styles.buttonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.cartTitle}>Your Cart</Text>
        <Text style={styles.totalItems}>Total Items: {getTotalItems()}</Text>
      </View>
      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.productID}
      />
      <TouchableOpacity style={styles.buyButton} onPress={handleBuy}>
        <Text style={styles.buyButtonText}>Confirm Buy</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// Main component
const App = () => {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginHorizontal: 4,
  },
  totalItemsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  totalItemsLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  totalItems: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 5,
  },
  flatListContent: {
    paddingBottom: 100,
  },
  pokemonItem: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
    width: Dimensions.get('window').width / 3 - 20,
  },
  pokemonImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  pokemonName: {
    marginTop: 5,
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    marginTop: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  cartContainer: {
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    marginTop: 20,
  },
  cartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 10,
    marginHorizontal: 10,
  },
  cartItemName: {
    fontSize: 16,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: '#007bff',
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
    borderRadius: 15,
    marginHorizontal: 5,
  },
  removeButton: {
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantity: {
    fontSize: 16,
    marginHorizontal: 10,
  },
  buyButton: {
    backgroundColor: '#007bff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    marginHorizontal: 10,
    borderRadius: 5,
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default App;
