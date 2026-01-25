import { store } from "../core/Store.js";
import { candyService } from "./candyService.js";
import { stoneService } from "./stoneService.js";

export const marketplaceService = {
  /**
   * Carga los caramelos comprables
   */
  async getCandyTypes() {
    return candyService.getBuyableCandyTypes();
  },

  /**
   * Carga las piedras comprables
   */
  async getStoneTypes() {
    return stoneService.getBuyableStoneTypes();
  },

  /**
   * Carga todos los items comprables (candies + stones)
   */
  async getAllBuyableItems() {
    const [candies, stones] = await Promise.all([
      this.getCandyTypes(),
      this.getStoneTypes(),
    ]);

    return {
      candies,
      stones,
    };
  },

  /**
   * Compra caramelos
   */
  async buyCandy(candyTypeId, quantity = 1) {
    return candyService.buyCandy(candyTypeId, quantity);
  },

  /**
   * Compra piedras
   */
  async buyStone(stoneTypeId, quantity = 1) {
    return stoneService.buyStone(stoneTypeId, quantity);
  },
};
