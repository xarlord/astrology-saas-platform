/**
 * Solar Return Controller - Alias Export
 */

import { SolarReturnController } from '../modules/solar/controllers/solarReturn.controller';

const controller = new SolarReturnController();

export const calculateSolarReturn = controller.calculateSolarReturn;
export const getSolarReturnByYear = controller.getSolarReturnByYear;
export const getSolarReturnById = controller.getSolarReturnById;
