"""
External API integration module
Provides access to arXiv, CERN, NASA, and NIST data sources with rate limiting
"""

import os
import time
import json
import requests
from typing import Dict, Any, List, Optional
from urllib.parse import urlencode, quote
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta

# Rate limiting configuration
RATE_LIMITS = {
    "arxiv": {"requests_per_minute": 20, "delay_seconds": 3},
    "cern": {"requests_per_minute": 60, "delay_seconds": 1},
    "nasa": {"requests_per_minute": 30, "delay_seconds": 2},
    "nist": {"requests_per_minute": 40, "delay_seconds": 1.5}
}

# Global rate limiting state
_last_request_times = {}


def api_arxiv(query: str, category: Optional[str] = None, max_results: int = 10,
             sort_by: str = "relevance", download_pdfs: bool = False) -> Dict[str, Any]:
    """Search and download papers from arXiv with metadata extraction"""
    
    _enforce_rate_limit("arxiv")
    
    # Build arXiv API query
    search_query = query
    if category:
        search_query = f"cat:{category} AND ({query})"
    
    params = {
        "search_query": search_query,
        "start": 0,
        "max_results": max_results,
        "sortBy": sort_by,
        "sortOrder": "descending"
    }
    
    url = "http://export.arxiv.org/api/query"
    
    try:
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
    except requests.RequestException as e:
        raise RuntimeError(f"arXiv API request failed: {str(e)}")
    
    # Parse XML response
    try:
        root = ET.fromstring(response.content)
        
        # Extract namespace
        ns = {'atom': 'http://www.w3.org/2005/Atom',
              'arxiv': 'http://arxiv.org/schemas/atom'}
        
        papers = []
        for entry in root.findall('atom:entry', ns):
            paper = _parse_arxiv_entry(entry, ns)
            papers.append(paper)
            
            # Download PDF if requested
            if download_pdfs and paper.get('pdf_url'):
                pdf_path = _download_arxiv_pdf(paper['id'], paper['pdf_url'])
                paper['pdf_local_path'] = pdf_path
                
    except ET.ParseError as e:
        raise RuntimeError(f"Failed to parse arXiv response: {str(e)}")
    
    return {
        "papers": papers,
        "query": query,
        "category": category,
        "total_found": len(papers),
        "max_results": max_results,
        "sort_by": sort_by,
        "meta": {
            "source": "arXiv",
            "api_version": "1.0",
            "search_time": datetime.now().isoformat()
        }
    }


def api_cern(dataset_name: str, experiment: Optional[str] = None,
            data_type: Optional[str] = None, year: Optional[int] = None,
            max_files: int = 5) -> Dict[str, Any]:
    """Access CERN Open Data Portal for particle physics datasets"""
    
    _enforce_rate_limit("cern")
    
    # CERN Open Data API endpoint
    base_url = "https://opendata.cern.ch/api/records"
    
    # Build search parameters
    params = {
        "q": dataset_name,
        "size": max_files,
        "type": "Dataset"
    }
    
    if experiment:
        params["q"] += f" AND experiment:{experiment}"
    if data_type:
        params["q"] += f" AND type:{data_type}"
    if year:
        params["q"] += f" AND year:{year}"
    
    try:
        response = requests.get(base_url, params=params, timeout=30)
        response.raise_for_status()
        data = response.json()
    except requests.RequestException as e:
        raise RuntimeError(f"CERN API request failed: {str(e)}")
    except json.JSONDecodeError as e:
        raise RuntimeError(f"Failed to parse CERN response: {str(e)}")
    
    # Extract dataset information
    datasets = []
    for hit in data.get('hits', {}).get('hits', []):
        dataset = _parse_cern_dataset(hit['_source'])
        datasets.append(dataset)
    
    return {
        "datasets": datasets,
        "search_query": dataset_name,
        "experiment": experiment,
        "data_type": data_type,
        "year": year,
        "total_found": data.get('hits', {}).get('total', 0),
        "returned": len(datasets),
        "meta": {
            "source": "CERN Open Data",
            "api_version": "1.0",
            "search_time": datetime.now().isoformat()
        }
    }


def api_nasa(dataset_type: str, mission: Optional[str] = None,
            instrument: Optional[str] = None, date_range: Optional[Dict] = None,
            coordinates: Optional[Dict] = None, max_results: int = 20) -> Dict[str, Any]:
    """Access NASA datasets and imagery from various missions"""
    
    _enforce_rate_limit("nasa")
    
    # NASA API endpoints (simplified - would need specific API keys for full access)
    if dataset_type == "astronomy":
        return _query_nasa_astronomy(mission, instrument, coordinates, max_results)
    elif dataset_type == "earth":
        return _query_nasa_earth(mission, instrument, date_range, coordinates, max_results)
    elif dataset_type == "planetary":
        return _query_nasa_planetary(mission, instrument, date_range, max_results)
    elif dataset_type == "heliophysics":
        return _query_nasa_heliophysics(mission, instrument, date_range, max_results)
    else:
        raise ValueError(f"Unknown NASA dataset type: {dataset_type}")


def api_nist(data_type: str, element: Optional[str] = None,
            property: Optional[str] = None, temperature: Optional[float] = None,
            pressure: Optional[float] = None, format: str = "json") -> Dict[str, Any]:
    """Access NIST physical data and reference constants"""
    
    _enforce_rate_limit("nist")
    
    if data_type == "atomic":
        return _query_nist_atomic(element, property, format)
    elif data_type == "molecular":
        return _query_nist_molecular(element, property, temperature, format)
    elif data_type == "material":
        return _query_nist_material(property, temperature, pressure, format)
    elif data_type == "constants":
        return _query_nist_constants(property, format)
    elif data_type == "reference":
        return _query_nist_reference(property, format)
    else:
        raise ValueError(f"Unknown NIST data type: {data_type}")


def _enforce_rate_limit(api_name: str):
    """Enforce rate limiting for API requests"""
    current_time = time.time()
    
    if api_name in _last_request_times:
        time_since_last = current_time - _last_request_times[api_name]
        min_delay = RATE_LIMITS[api_name]["delay_seconds"]
        
        if time_since_last < min_delay:
            sleep_time = min_delay - time_since_last
            time.sleep(sleep_time)
    
    _last_request_times[api_name] = time.time()


def _parse_arxiv_entry(entry, ns):
    """Parse a single arXiv entry from XML"""
    paper = {}
    
    # Basic information
    paper['id'] = entry.find('atom:id', ns).text.split('/')[-1]
    paper['title'] = entry.find('atom:title', ns).text.strip()
    paper['summary'] = entry.find('atom:summary', ns).text.strip()
    
    # Authors
    authors = []
    for author in entry.findall('atom:author', ns):
        name = author.find('atom:name', ns).text
        authors.append(name)
    paper['authors'] = authors
    
    # Publication date
    published = entry.find('atom:published', ns).text
    paper['published'] = published
    
    # Categories
    categories = []
    for category in entry.findall('atom:category', ns):
        categories.append(category.get('term'))
    paper['categories'] = categories
    
    # Links
    for link in entry.findall('atom:link', ns):
        if link.get('title') == 'pdf':
            paper['pdf_url'] = link.get('href')
        elif link.get('rel') == 'alternate':
            paper['abs_url'] = link.get('href')
    
    # arXiv specific fields
    primary_category = entry.find('arxiv:primary_category', ns)
    if primary_category is not None:
        paper['primary_category'] = primary_category.get('term')
    
    return paper


def _download_arxiv_pdf(paper_id: str, pdf_url: str) -> str:
    """Download arXiv PDF to local storage"""
    try:
        response = requests.get(pdf_url, timeout=60)
        response.raise_for_status()
        
        # Create artifacts directory
        os.makedirs("artifacts/arxiv_pdfs", exist_ok=True)
        
        # Save PDF
        filename = f"arxiv_{paper_id}.pdf"
        filepath = os.path.join("artifacts/arxiv_pdfs", filename)
        
        with open(filepath, 'wb') as f:
            f.write(response.content)
        
        return filepath
        
    except Exception as e:
        print(f"Warning: Failed to download PDF for {paper_id}: {str(e)}")
        return None


def _parse_cern_dataset(source):
    """Parse CERN dataset information"""
    dataset = {
        "title": source.get("title", ""),
        "description": source.get("abstract", {}).get("description", ""),
        "experiment": source.get("experiment", ""),
        "year": source.get("date_created", ""),
        "doi": source.get("doi", ""),
        "size": source.get("size", ""),
        "format": source.get("distribution", {}).get("formats", []),
        "files": []
    }
    
    # Extract file information
    for file_info in source.get("files", []):
        file_data = {
            "filename": file_info.get("key", ""),
            "size": file_info.get("size", 0),
            "checksum": file_info.get("checksum", ""),
            "uri": file_info.get("uri", "")
        }
        dataset["files"].append(file_data)
    
    return dataset


def _query_nasa_astronomy(mission, instrument, coordinates, max_results):
    """Query NASA astronomy data (simplified implementation)"""
    # This would integrate with specific NASA APIs like:
    # - Hubble Space Telescope Archive
    # - Spitzer Heritage Archive
    # - Kepler/K2 Archive
    
    return {
        "datasets": [],
        "mission": mission,
        "instrument": instrument,
        "coordinates": coordinates,
        "total_found": 0,
        "meta": {
            "source": "NASA Astronomy",
            "note": "Full implementation requires specific API keys and endpoints"
        }
    }


def _query_nasa_earth(mission, instrument, date_range, coordinates, max_results):
    """Query NASA Earth science data"""
    return {
        "datasets": [],
        "mission": mission,
        "instrument": instrument,
        "date_range": date_range,
        "coordinates": coordinates,
        "total_found": 0,
        "meta": {
            "source": "NASA Earth Science",
            "note": "Full implementation requires specific API keys"
        }
    }


def _query_nasa_planetary(mission, instrument, date_range, max_results):
    """Query NASA planetary science data"""
    return {
        "datasets": [],
        "mission": mission,
        "instrument": instrument,
        "date_range": date_range,
        "total_found": 0,
        "meta": {
            "source": "NASA Planetary Science",
            "note": "Full implementation requires PDS API integration"
        }
    }


def _query_nasa_heliophysics(mission, instrument, date_range, max_results):
    """Query NASA heliophysics data"""
    return {
        "datasets": [],
        "mission": mission,
        "instrument": instrument,
        "date_range": date_range,
        "total_found": 0,
        "meta": {
            "source": "NASA Heliophysics",
            "note": "Full implementation requires SPDF/CDAWeb API"
        }
    }


def _query_nist_atomic(element, property, format):
    """Query NIST atomic data"""
    # This would integrate with NIST Atomic Spectra Database
    return {
        "data": [],
        "element": element,
        "property": property,
        "format": format,
        "meta": {
            "source": "NIST Atomic Spectra Database",
            "note": "Full implementation requires NIST API integration"
        }
    }


def _query_nist_molecular(element, property, temperature, format):
    """Query NIST molecular data"""
    return {
        "data": [],
        "element": element,
        "property": property,
        "temperature": temperature,
        "format": format,
        "meta": {
            "source": "NIST Chemistry WebBook",
            "note": "Full implementation requires NIST Chemistry API"
        }
    }


def _query_nist_material(property, temperature, pressure, format):
    """Query NIST material properties"""
    return {
        "data": [],
        "property": property,
        "temperature": temperature,
        "pressure": pressure,
        "format": format,
        "meta": {
            "source": "NIST Material Properties",
            "note": "Full implementation requires NIST Materials API"
        }
    }


def _query_nist_constants(property, format):
    """Query NIST fundamental constants"""
    # Basic implementation for common constants
    constants = {
        "speed_of_light": {"value": 299792458, "unit": "m/s", "uncertainty": 0},
        "planck_constant": {"value": 6.62607015e-34, "unit": "J⋅s", "uncertainty": 0},
        "elementary_charge": {"value": 1.602176634e-19, "unit": "C", "uncertainty": 0},
        "avogadro_constant": {"value": 6.02214076e23, "unit": "mol⁻¹", "uncertainty": 0},
        "boltzmann_constant": {"value": 1.380649e-23, "unit": "J/K", "uncertainty": 0}
    }
    
    if property and property in constants:
        data = [constants[property]]
    else:
        data = list(constants.values())
    
    return {
        "data": data,
        "property": property,
        "format": format,
        "meta": {
            "source": "NIST CODATA 2018",
            "note": "Subset of fundamental constants"
        }
    }


def _query_nist_reference(property, format):
    """Query NIST reference data"""
    return {
        "data": [],
        "property": property,
        "format": format,
        "meta": {
            "source": "NIST Reference Data",
            "note": "Full implementation requires specific NIST APIs"
        }
    }
