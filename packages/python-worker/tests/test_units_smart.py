"""
Tests for smart units evaluation functionality
"""

import pytest
import sys
import os

# Add src directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from units_smart import evaluate_with_units, round_trip_test

class TestUnitsSmartEval:
    """Test smart units evaluation"""
    
    def test_simple_unit_expression(self):
        """Test basic unit expression evaluation"""
        result = evaluate_with_units("2 m / 1 s")
        
        assert result['value'] == 2.0
        assert 'm/s' in result['unit'] or 'meter/second' in result['unit']
        assert result['source'] == 'smart_evaluation'
    
    def test_constant_substitution(self):
        """Test physical constant substitution"""
        result = evaluate_with_units("c * 1 s", constants={"c": True})
        
        assert result['value'] == pytest.approx(299792458.0, rel=1e-6)
        assert 'm' in result['unit']
        assert 'c' in result['constants_used']
    
    def test_complex_expression(self):
        """Test complex expression with multiple units"""
        result = evaluate_with_units("(100 kg) * (10 m/s)^2 / 2")
        
        # Kinetic energy: 0.5 * m * v^2 = 0.5 * 100 * 100 = 5000 J
        assert result['value'] == pytest.approx(5000.0, rel=1e-6)
        assert 'J' in result['unit'] or 'joule' in result['unit']
    
    def test_dimensionless_expression(self):
        """Test expression without units"""
        result = evaluate_with_units("2 + 3 * 4")
        
        assert result['value'] == 14.0
        assert result['unit'] == 'dimensionless'
    
    def test_invalid_unit(self):
        """Test handling of invalid units"""
        with pytest.raises(ValueError, match="Invalid unit"):
            evaluate_with_units("5 invalidunit")
    
    def test_invalid_expression(self):
        """Test handling of invalid expressions"""
        with pytest.raises(ValueError, match="Could not evaluate"):
            evaluate_with_units("2 + + 3")

class TestRoundTripConversion:
    """Test round-trip unit conversion accuracy"""
    
    def test_length_conversion(self):
        """Test length unit round-trip"""
        result = round_trip_test(1.0, 'm', 'ft')
        
        assert result['passed'] is True
        assert result['relative_error'] < 1e-9
        assert result['converted_value'] == pytest.approx(3.28084, rel=1e-5)
    
    def test_energy_conversion(self):
        """Test energy unit round-trip"""
        result = round_trip_test(1.0, 'J', 'eV')
        
        assert result['passed'] is True
        assert result['relative_error'] < 1e-9
    
    def test_temperature_conversion(self):
        """Test temperature unit round-trip"""
        result = round_trip_test(273.15, 'K', 'C')
        
        assert result['passed'] is True
        assert result['converted_value'] == pytest.approx(0.0, abs=1e-10)
    
    def test_high_precision_requirement(self):
        """Test with very strict tolerance"""
        result = round_trip_test(1.0, 'm', 'ft', tolerance=1e-15)
        
        # Should still pass for exact conversions
        assert result['passed'] is True
    
    def test_incompatible_units(self):
        """Test conversion between incompatible units"""
        result = round_trip_test(1.0, 'm', 'kg')
        
        assert result['passed'] is False
        assert 'error' in result

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
