import React, { createContext, useState, useContext, useEffect } from 'react';


export const CartContext = createContext();


export const CartProvider = ({ children }) => {

  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('agrosmart_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });


  useEffect(() => {
    localStorage.setItem('agrosmart_cart', JSON.stringify(cart));
  }, [cart]);


  const addToCart = (producto, cantidad) => {
    setCart((prevCart) => {
      const existe = prevCart.find(item => item.id === producto.id);
      if (existe) {

        return prevCart.map(item =>
          item.id === producto.id
            ? { ...item, cantidad: Math.min(item.cantidad + cantidad, producto.stock) }
            : item
        );
      }

      return [...prevCart, { ...producto, cantidad }];
    });
  };


  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter(item => item.id !== id));
  };


  const updateQuantity = (id, nuevaCantidad) => {
    setCart((prevCart) =>
      prevCart.map(item => {
        if (item.id === id) {

          const cantidadValidada = Math.max(1, Math.min(nuevaCantidad, item.stock));
          return { ...item, cantidad: cantidadValidada };
        }
        return item;
      })
    );
  };


  const clearCart = () => setCart([]);


  const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);
  const totalPrice = cart.reduce((acc, item) => acc + (item.precio_clp * item.cantidad), 0);

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
};


export const useCart = () => useContext(CartContext);