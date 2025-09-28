/**
 * Validation schemas for units conversion tools
 */
import { z } from 'zod';
/**
 * Supported unit categories and their units
 */
export declare const UNIT_CATEGORIES: {
    readonly length: readonly ["m", "km", "cm", "mm", "in", "ft", "yd", "mi", "au", "ly", "pc"];
    readonly mass: readonly ["kg", "g", "mg", "lb", "oz", "ton", "u", "M_sun"];
    readonly time: readonly ["s", "ms", "us", "ns", "min", "h", "day", "year"];
    readonly temperature: readonly ["K", "C", "F", "R"];
    readonly energy: readonly ["J", "kJ", "MJ", "eV", "keV", "MeV", "GeV", "cal", "kcal", "Wh", "kWh"];
    readonly power: readonly ["W", "kW", "MW", "hp"];
    readonly force: readonly ["N", "kN", "lbf", "dyn"];
    readonly pressure: readonly ["Pa", "kPa", "MPa", "bar", "atm", "psi", "torr", "mmHg"];
    readonly volume: readonly ["m3", "L", "mL", "gal", "qt", "pt", "cup", "fl_oz"];
    readonly area: readonly ["m2", "km2", "cm2", "mm2", "in2", "ft2", "acre", "ha"];
    readonly velocity: readonly ["m/s", "km/h", "mph", "ft/s", "knot"];
    readonly acceleration: readonly ["m/s2", "ft/s2", "g"];
    readonly frequency: readonly ["Hz", "kHz", "MHz", "GHz"];
    readonly electric_current: readonly ["A", "mA", "uA"];
    readonly electric_potential: readonly ["V", "kV", "mV"];
    readonly electric_resistance: readonly ["ohm", "kohm", "Mohm"];
    readonly electric_capacitance: readonly ["F", "mF", "uF", "nF", "pF"];
    readonly magnetic_field: readonly ["T", "mT", "uT", "G", "mG"];
    readonly luminous_intensity: readonly ["cd"];
    readonly amount_of_substance: readonly ["mol", "kmol"];
    readonly angle: readonly ["rad", "deg", "arcmin", "arcsec"];
    readonly solid_angle: readonly ["sr"];
};
/**
 * All supported units (flattened)
 */
export declare const ALL_UNITS: ("min" | "m" | "km" | "cm" | "mm" | "in" | "ft" | "yd" | "mi" | "au" | "ly" | "pc" | "kg" | "g" | "mg" | "lb" | "oz" | "ton" | "u" | "M_sun" | "s" | "ms" | "us" | "ns" | "h" | "day" | "year" | "K" | "C" | "F" | "R" | "J" | "kJ" | "MJ" | "eV" | "keV" | "MeV" | "GeV" | "cal" | "kcal" | "Wh" | "kWh" | "W" | "kW" | "MW" | "hp" | "N" | "kN" | "lbf" | "dyn" | "Pa" | "kPa" | "MPa" | "bar" | "atm" | "psi" | "torr" | "mmHg" | "m3" | "L" | "mL" | "gal" | "qt" | "pt" | "cup" | "fl_oz" | "m2" | "km2" | "cm2" | "mm2" | "in2" | "ft2" | "acre" | "ha" | "m/s" | "km/h" | "mph" | "ft/s" | "knot" | "m/s2" | "ft/s2" | "Hz" | "kHz" | "MHz" | "GHz" | "A" | "mA" | "uA" | "V" | "kV" | "mV" | "ohm" | "kohm" | "Mohm" | "mF" | "uF" | "nF" | "pF" | "T" | "mT" | "uT" | "G" | "mG" | "cd" | "mol" | "kmol" | "rad" | "deg" | "arcmin" | "arcsec" | "sr")[];
/**
 * Unit string schema with validation
 */
export declare const UnitSchema: z.ZodEffects<z.ZodString, string, string>;
/**
 * Quantity schema (value + unit)
 */
export declare const QuantitySchema: z.ZodObject<{
    value: z.ZodNumber;
    unit: z.ZodEffects<z.ZodString, string, string>;
}, "strip", z.ZodTypeAny, {
    value: number;
    unit: string;
}, {
    value: number;
    unit: string;
}>;
/**
 * Units conversion input schema
 */
export declare const UnitsConvertInputSchema: z.ZodObject<{
    quantity: z.ZodObject<{
        value: z.ZodNumber;
        unit: z.ZodEffects<z.ZodString, string, string>;
    }, "strip", z.ZodTypeAny, {
        value: number;
        unit: string;
    }, {
        value: number;
        unit: string;
    }>;
    to: z.ZodEffects<z.ZodString, string, string>;
}, "strip", z.ZodTypeAny, {
    quantity: {
        value: number;
        unit: string;
    };
    to: string;
}, {
    quantity: {
        value: number;
        unit: string;
    };
    to: string;
}>;
/**
 * Units smart evaluation input schema
 */
export declare const UnitsSmartEvalInputSchema: z.ZodObject<{
    expr: z.ZodString;
    constants: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    expr: string;
    constants?: Record<string, boolean> | undefined;
}, {
    expr: string;
    constants?: Record<string, boolean> | undefined;
}>;
/**
 * Type inference
 */
export type UnitsConvertInput = z.infer<typeof UnitsConvertInputSchema>;
export type UnitsSmartEvalInput = z.infer<typeof UnitsSmartEvalInputSchema>;
export type Quantity = z.infer<typeof QuantitySchema>;
