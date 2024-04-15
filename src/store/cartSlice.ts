import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem } from '../types';

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

export const { addToCart, adjustQuantity, removeFromCart } = cartSlice.actions;
export default cartSlice.reducer;
