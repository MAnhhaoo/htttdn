import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    wishlist: [],
    addresses: [],
  },
  reducers: {
    toggleWishlist: (state, action) => {
      const product = action.payload;
      const exists = state.wishlist.find(item => item.id === product.id);
      if (exists) {
        state.wishlist = state.wishlist.filter(item => item.id !== product.id);
      } else {
        state.wishlist.push(product);
      }
    }
  }
});

export const { toggleWishlist } = userSlice.actions;
export default userSlice.reducer;
