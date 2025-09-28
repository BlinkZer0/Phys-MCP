/**
 * Validation schemas for units conversion tools
 */
import { z } from 'zod';
/**
 * Supported unit categories and their units
 */
export const UNIT_CATEGORIES = {
    length: ['m', 'km', 'cm', 'mm', 'in', 'ft', 'yd', 'mi', 'au', 'ly', 'pc'],
    mass: ['kg', 'g', 'mg', 'lb', 'oz', 'ton', 'u', 'M_sun'],
    time: ['s', 'ms', 'us', 'ns', 'min', 'h', 'day', 'year'],
    temperature: ['K', 'C', 'F', 'R'],
    energy: ['J', 'kJ', 'MJ', 'eV', 'keV', 'MeV', 'GeV', 'cal', 'kcal', 'Wh', 'kWh'],
    power: ['W', 'kW', 'MW', 'hp'],
    force: ['N', 'kN', 'lbf', 'dyn'],
    pressure: ['Pa', 'kPa', 'MPa', 'bar', 'atm', 'psi', 'torr', 'mmHg'],
    volume: ['m3', 'L', 'mL', 'gal', 'qt', 'pt', 'cup', 'fl_oz'],
    area: ['m2', 'km2', 'cm2', 'mm2', 'in2', 'ft2', 'acre', 'ha'],
    velocity: ['m/s', 'km/h', 'mph', 'ft/s', 'knot'],
    acceleration: ['m/s2', 'ft/s2', 'g'],
    frequency: ['Hz', 'kHz', 'MHz', 'GHz'],
    electric_current: ['A', 'mA', 'uA'],
    electric_potential: ['V', 'kV', 'mV'],
    electric_resistance: ['ohm', 'kohm', 'Mohm'],
    electric_capacitance: ['F', 'mF', 'uF', 'nF', 'pF'],
    magnetic_field: ['T', 'mT', 'uT', 'G', 'mG'],
    luminous_intensity: ['cd'],
    amount_of_substance: ['mol', 'kmol'],
    angle: ['rad', 'deg', 'arcmin', 'arcsec'],
    solid_angle: ['sr']
};
/**
 * All supported units (flattened)
 */
export const ALL_UNITS = Object.values(UNIT_CATEGORIES).flat();
/**
 * Unit string schema with validation
 */
export const UnitSchema = z.string()
    .min(1, 'Unit cannot be empty')
    .refine((unit) => {
    // Allow compound units like "m/s", "kg*m/s2", etc.
    // This is a simplified check - in practice you'd use a proper unit parser
    const basicUnits = unit.split(/[*/^()0-9\s-]+/).filter(u => u.length > 0);
    return basicUnits.every(u => ALL_UNITS.includes(u));
}, {
    message: 'Invalid unit. Supported units include: ' + ALL_UNITS.slice(0, 20).join(', ') + '...'
})
    .describe('Physical unit (e.g., "m", "kg", "m/s", "J")');
/**
 * Quantity schema (value + unit)
 */
export const QuantitySchema = z.object({
    value: z.number().describe('Numerical value'),
    unit: UnitSchema
}).describe('Physical quantity with value and unit');
/**
 * Units conversion input schema
 */
export const UnitsConvertInputSchema = z.object({
    quantity: QuantitySchema.describe('Input quantity to convert'),
    to: UnitSchema.describe('Target unit for conversion')
});
/**
 * Units smart evaluation input schema
 */
export const UnitsSmartEvalInputSchema = z.object({
    expr: z.string().min(1, 'Expression cannot be empty')
        .describe('Expression with units (e.g., "2 m / 200 ms")'),
    constants: z.record(z.string(), z.boolean()).optional()
        .describe('Physical constants to substitute (e.g., {"c": true, "h": true})')
});
