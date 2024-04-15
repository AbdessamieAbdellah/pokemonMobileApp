export interface Pokemon {
    id: number;
    name: string;
    imageUrl: string;
  }
  
  export interface CartItem {
    productID: string;
    title: string;
    quantity: number;
  }
  
  export interface AppState {
    pokemon: Pokemon[];
    cart: CartItem[];
  }
  