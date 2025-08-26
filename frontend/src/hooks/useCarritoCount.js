import { useSelector } from 'react-redux';

/**
 * Hook personalizado para obtener la cantidad total de productos en el carrito
 * @returns {number} Cantidad total de productos en el carrito
 */
export const useCarritoCount = () => {
  return useSelector(state => {
    if (!state.carrito || !state.carrito.items) {
      return 0;
    }
    return state.carrito.items.reduce((total, item) => total + item.cantidad, 0);
  });
};
