---
title: Physical Constants Library
kind: reference
header_svg:
  src: "/assets/svg/cas-lab-hero.svg"
  static: "/assets/svg/cas-lab-hero-static.svg"
  title: "Physical Constants"
  animate: true
  theme_variant: "auto"
  reduced_motion: "auto"
---

# Physical Constants Library

The Constants Library provides access to the most up-to-date physical constants from CODATA and astrophysical databases. All values include uncertainties and proper units.

## Available Constants

### Fundamental Constants
- **c** - Speed of light in vacuum
- **h** - Planck constant
- **hbar** - Reduced Planck constant (h/2π)
- **e** - Elementary charge
- **k_B** - Boltzmann constant
- **N_A** - Avogadro constant
- **G** - Gravitational constant
- **R** - Universal gas constant

### Electromagnetic Constants
- **epsilon_0** - Electric constant (permittivity of vacuum)
- **mu_0** - Magnetic constant (permeability of vacuum)
- **alpha** - Fine-structure constant
- **a_0** - Bohr radius

### Particle Masses
- **m_e** - Electron mass
- **m_p** - Proton mass
- **m_n** - Neutron mass

### Astrophysical Constants
- **M_sun** - Solar mass
- **pc** - Parsec
- **ly** - Light-year
- **au** - Astronomical unit

## Usage Examples

### Get a Single Constant
```json
{
  "tool": "constants_get",
  "params": {
    "name": "c"
  }
}
```

### Get Multiple Constants
```json
{
  "tool": "constants_get",
  "params": {
    "name": "h"
  }
}
```

## Response Format

Each constant returns:
```json
{
  "name": "c",
  "value": 299792458.0,
  "unit": "m/s",
  "uncertainty": 0.0,
  "description": "Speed of light in vacuum",
  "source": "CODATA 2018"
}
```

## Common Physics Calculations

### Energy-Mass Equivalence
```json
{
  "tool": "cas",
  "params": {
    "expr": "m*c^2",
    "vars": {
      "m": {"value": 1, "unit": "kg"},
      "c": {"value": 299792458, "unit": "m/s"}
    }
  }
}
```

### Planck Energy
```json
{
  "tool": "cas",
  "params": {
    "expr": "hbar*c^5/G",
    "vars": {
      "hbar": {"value": 1.054571817e-34, "unit": "J*s"},
      "c": {"value": 299792458, "unit": "m/s"},
      "G": {"value": 6.67430e-11, "unit": "m^3/kg/s^2"}
    }
  }
}
```

## Accuracy and Sources

- **CODATA 2018**: Latest recommended values for fundamental constants
- **Uncertainties**: All values include standard uncertainties
- **Units**: SI base and derived units with proper formatting
- **Updates**: Constants are updated as new measurements become available

## Integration Examples

### Quantum Mechanics
Calculate the de Broglie wavelength:
```json
{
  "tool": "cas",
  "params": {
    "expr": "h/(m*v)",
    "vars": {
      "h": {"value": 6.62607015e-34, "unit": "J*s"},
      "m": {"value": 9.1093837015e-31, "unit": "kg"},
      "v": {"value": 1e6, "unit": "m/s"}
    }
  }
}
```

### Thermodynamics
Calculate the thermal energy at room temperature:
```json
{
  "tool": "cas",
  "params": {
    "expr": "k_B*T",
    "vars": {
      "k_B": {"value": 1.380649e-23, "unit": "J/K"},
      "T": {"value": 300, "unit": "K"}
    }
  }
}
```

## Educational Applications

- **Problem Setup**: Automatically insert correct constant values
- **Unit Consistency**: Ensure all calculations use proper units
- **Uncertainty Propagation**: Include measurement uncertainties in calculations
- **Current Values**: Always use the most recent constant values
