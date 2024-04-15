import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, SafeAreaView, Dimensions, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { fetchPokemonSuccess } from '../store/pokemonSlice';
import { addToCart } from '../store/cartSlice';
import { AppState, Pokemon, CartItem } from '../types';

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
      setLoading(false);
    } catch (error) {
      console.error('Error fetching Pokémon data:', error);
    }
  };

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
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PokemonListScreen;
