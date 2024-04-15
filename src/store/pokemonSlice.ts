import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Pokemon } from '../types';

const pokemonSlice = createSlice({
  name: 'pokemon',
  initialState: [] as Pokemon[],
  reducers: {
    fetchPokemonSuccess: (state, action: PayloadAction<Pokemon[]>) => {
      return action.payload;
    },
  },
});

export const { fetchPokemonSuccess } = pokemonSlice.actions;
export default pokemonSlice.reducer;
