import requests
from datetime import datetime
from marshmallow import Schema, fields, ValidationError
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import urllib3
import ssl
import os
import uuid

from config.opensearch_client import opensearch_ops

# Disable SSL warnings for development
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

travel_bp = Blueprint('travel', __name__)


def map_form_data_to_external_format(form_data):
    """Map internal form data to external API format"""

    # Map transportation
    transportation_known = form_data.get('transportation_known', '')
    trasporti = {
        "conosci_arrivo_e_partenza": transportation_known == 'yes',
        "description": form_data.get('arrival_departure', ''),
        "auto_propria": transportation_known == 'car',
        "Unknown": transportation_known == 'no'
    }

    # Map places
    luoghi_da_non_perdere = {
        "city": form_data.get('places_to_visit', ''),
        "luoghi_specifici": form_data.get('specific_places') == 'yes'
    }

    # Map travelers
    viaggiatori = {
        "adults_number": form_data.get('adults', 1),
        "children_number": form_data.get('children', 0),
        "baby_number": form_data.get('infants', 0)
    }

    # Map dates - convert date objects to strings
    check_in = form_data.get('check_in', '')
    check_out = form_data.get('check_out', '')
    
    # Convert date objects to string format if they exist
    if hasattr(check_in, 'isoformat'):
        check_in = check_in.isoformat()
    if hasattr(check_out, 'isoformat'):
        check_out = check_out.isoformat()
    
    date = {
        "check_in_time": check_in,
        "check_out_time": check_out
    }

    # Map budget
    budget = form_data.get('budget', '')
    budget_per_persona_giorno = {
        "economico": budget == 'budget',
        "fascia_media": budget == 'midrange',
        "comfort": budget == 'comfort',
        "lusso": budget == 'luxury',
        "ultra_lusso": False  # Not in our form
    }

    # Map accommodation
    acc_level = form_data.get('accommodation_level', '')
    acc_type = form_data.get('accommodation_type', '')
    sistemazione = {
        "livello": {
            "fascia_media": acc_level == 'mid',

"boutique": acc_level == 'boutique',
            "eleganti": acc_level == 'luxury'
        },
        "tipologia": {
            "hotel": acc_type == 'hotel',
            "b&b": acc_type == 'bnb',
            "agriturismo": acc_type == 'agriturismo',
            "villa": acc_type == 'villa',
            "appartamento": acc_type == 'appartamento',
            "glamping": acc_type == 'glamping'
        }
    }

    # Map passions to interests
    passions = form_data.get('passions', [])
    interessi = {
        "storia_e_arte": {
            "musei_e_gallerie": "Musei e gallerie" in passions,
            "siti_archeologici": "Siti archeologici" in passions,
            "monumenti_e_architettura": "Monumenti e architetture" in passions
        },
        "Food_&_wine": {
            "visite_alle_cantine": "Visite alle cantine" in passions,
            "corsi_di_cucina": "Corsi di cucina" in passions,
            "soggiorni_nella_wine_country": "Soggiorni nella Wine Country" in passions
        },
        "vacanze_attive": {
            "trekking_di_piu_giorni": "Trekking tour" in passions,
            "tour_in_e_bike_di_piu_giorni": "Tour in e-bike" in passions,
            "sci_snowboard_di_piu_giorni": "Sci/snowboard" in passions
        },
        "vita_locale": "Local Life" in passions,
        "salute_e_benessere": "Salute & Benessere" in passions
    }

    # Map traveler type
    traveler_type = form_data.get('traveler_type', '')
    tipologia_viaggiatore = {
        "family": traveler_type == 'famiglia',
        "amici": traveler_type == 'amici',
        "coppia": traveler_type == 'coppia',
        "single": False  # Not explicitly in our form
    }

    # Map travel pace
    pace = form_data.get('travel_pace', '')
    ritmo_ideale = {
        "veloce": pace == 'fast',
        "moderato": pace == 'moderate',
        "rilassato": pace == 'relaxed'
    }

    return {
        "trasporti": trasporti,
        "luoghi_da_non_perdere": luoghi_da_non_perdere,
        "viaggiatori": viaggiatori,
        "date": date,
        "budget_per_persona_giorno": budget_per_persona_giorno,
        "sistemazione": sistemazione,
        "esigenze_particolari": form_data.get('special_services', ''),
        "interessi": interessi,
        "tipologia_viaggiatore": tipologia_viaggiatore,
        "ritmo_ideale": ritmo_ideale
    }


def save_travel_packages(job_id, packages_data, user_id=None):
    """Save travel packages received from external API to database"""
    try:
        packages_saved = 0
        
        for package in packages_data:
            package_id = str(uuid.uuid4())
            
            # Prepare package data for storage
            package_doc = {
                'job_id': job_id,
                'user_id': user_id,
                'package_id': package.get('id_pacchetto', f'package_{packages_saved + 1}'),
                'hotels_selezionati': package.get('hotels_selezionati', {}),
                'esperienze_selezionate': package.get('esperienze_selezionate', {}),
                'status': 'available',
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }
            
            # Store package in OpenSearch
            opensearch_ops.index_document('travel_packages', package_id, package_doc)
            packages_saved += 1
            
            print(f"[DEBUG] Saved package {package_doc['package_id']} with ID {package_id} for user {user_id}")
        
        return packages_saved
        
    except Exception as e:
        print(f"[ERROR] Failed to save travel packages: {str(e)}")
        return 0

    # Map passions to interests
    passions = form_data.get('passions', [])
    interessi = {
        "storia_e_arte": {
            "musei_e_gallerie": "Musei e gallerie" in passions,
            "siti_archeologici": "Siti archeologici" in passions,
            "monumenti_e_architettura": "Monumenti e architetture" in passions
        },
        "Food_&_wine": {
            "visite_alle_cantine":
            "Visite alle cantine" in passions,
            "corsi_di_cucina":
            "Corsi di cucina" in passions,
            "soggiorni_nella_wine_country":
            "Soggiorni nella Wine Country" in passions
        },
        "vacanze_attive": {
            "trekking_di_piu_giorni": "Trekking tour" in passions,
            "tour_in_e_bike_di_piu_giorni": "Tour in e-bike" in passions,
            "sci_snowboard_di_piu_giorni": "Sci/snowboard" in passions
        },
        "vita_locale": "Local Life" in passions,
        "salute_e_benessere": "Salute & Benessere" in passions
    }

    # Map traveler type
    traveler_type = form_data.get('traveler_type', '')
    tipologia_viaggiatore = {
        "family": traveler_type == 'famiglia',
        "amici": traveler_type == 'amici',
        "coppia": traveler_type == 'coppia',
        "single": False  # Not explicitly in our form
    }

    # Map travel pace
    pace = form_data.get('travel_pace', '')
    ritmo_ideale = {
        "veloce": pace == 'fast',
        "moderato": pace == 'moderate',
        "rilassato": pace == 'relaxed'
    }

    return {
        "trasporti": trasporti,
        "luoghi_da_non_perdere": luoghi_da_non_perdere,
        "viaggiatori": viaggiatori,
        "date": date,
        "budget_per_persona_giorno": budget_per_persona_giorno,
        "sistemazione": sistemazione,
        "esigenze_particolari": form_data.get('special_services', ''),
        "interessi": interessi,
        "tipologia_viaggiatore": tipologia_viaggiatore,
        "ritmo_ideale": ritmo_ideale
    }


def authenticate_external_api():
    """Authenticate with external travel API and return access token"""
    try:
        # Get configuration from environment
        api_url = os.getenv('TRAVEL_API_URL')
        api_username = os.getenv('TRAVEL_API_USERNAME')
        api_password = os.getenv('TRAVEL_API_PASSWORD')

        print(f"[DEBUG] External API Configuration:")
        print(f"[DEBUG] API URL: {api_url}")
        print(f"[DEBUG] API Username: {api_username}")
        print(
            f"[DEBUG] API Password: {'*' * len(api_password) if api_password else 'None'}"
        )

        if not all([api_url, api_username, api_password]):
            raise Exception("External API configuration is missing")

        # Prepare authentication data
        auth_data = {'username': api_username, 'password': api_password}

        # Make authentication request
        auth_url = f"{api_url}/api/auth/token"

        # Make authentication request with SSL verification disabled for development
        # In production, you should use proper SSL certificates
        verify_ssl = not api_url.startswith('https://localhost')

        print(f"[DEBUG] Making authentication request to: {auth_url}")
        print(f"[DEBUG] Request method: POST")
        print(
            f"[DEBUG] Request headers: {{'Content-Type': 'application/x-www-form-urlencoded'}}"
        )
        print(
            f"[DEBUG] Request data: {{'username': '{api_username}', 'password': '***'}}"
        )
        print(f"[DEBUG] SSL verification: {verify_ssl}")
        print(f"[DEBUG] Timeout: 10 seconds")

        response = requests.post(
            auth_url,
            data=auth_data,  # OAuth2PasswordRequestForm expects form data
            headers={'Content-Type': 'application/x-www-form-urlencoded'},
            timeout=10,
            verify=verify_ssl)

        print(f"[DEBUG] Response received:")
        print(f"[DEBUG] Status code: {response.status_code}")
        print(f"[DEBUG] Response headers: {dict(response.headers)}")
        print(f"[DEBUG] Response content: {response.text}")

        if response.status_code == 401:
            print(f"[DEBUG] Authentication failed: Invalid credentials")
            raise Exception("Invalid credentials for external API")

        if not response.ok:
            print(
                f"[DEBUG] Authentication failed: HTTP {response.status_code}")
            raise Exception(
                f"External API authentication failed: {response.status_code}")

        try:
            token_data = response.json()
            print(f"[DEBUG] Token data received: {token_data}")
            access_token = token_data.get('access_token')
            print(
                f"[DEBUG] Access token extracted: {'***' + access_token[-10:] if access_token else 'None'}"
            )
            return access_token
        except ValueError as e:
            print(f"[DEBUG] Failed to parse JSON response: {str(e)}")
            raise Exception(
                f"Invalid JSON response from external API: {str(e)}")

    except requests.exceptions.ConnectTimeout:
        print(f"[DEBUG] Connection timeout to {auth_url}")
        raise Exception(f"Connection timeout to external API: {auth_url}")
    except requests.exceptions.ConnectionError as e:
        print(f"[DEBUG] Connection error: {str(e)}")
        raise Exception(f"Failed to connect to external API: {str(e)}")
    except requests.exceptions.RequestException as e:
        print(f"[DEBUG] Request exception: {str(e)}")
        raise Exception(f"Failed to connect to external API: {str(e)}")
    except Exception as e:
        print(f"[DEBUG] Unexpected error: {str(e)}")
        raise Exception(f"External API authentication error: {str(e)}")


def send_search_request_to_external_api(access_token, search_data):
    """Send search request to external API and return job ID"""
    try:
        api_url = os.getenv('TRAVEL_API_URL')
        if not api_url:
            raise Exception("External API URL not configured")

        search_url = f"{api_url}/api/search"

        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }

        print(f"[DEBUG] Sending search request to: {search_url}")
        print(f"[DEBUG] Request headers: {headers}")
        print(f"[DEBUG] Request body: {search_data}")

        # Make search request with SSL verification disabled for development
        verify_ssl = not api_url.startswith('https://localhost')

        response = requests.post(search_url,
                                 json=search_data,
                                 headers=headers,
                                 timeout=30,
                                 verify=verify_ssl)

        print(f"[DEBUG] Search response status: {response.status_code}")
        print(f"[DEBUG] Search response content: {response.text}")

        if response.status_code == 401:
            raise Exception("Authentication failed for search request")

        if not response.ok:
            raise Exception(
                f"Search request failed: {response.status_code} - {response.text}"
            )

        try:
            response_data = response.json()
            job_id = response_data.get('job_id') or response_data.get(
                'id') or response_data.get('task_id')

            if not job_id:
                print(f"[DEBUG] No job ID found in response: {response_data}")
                raise Exception("No job ID returned from search request")

            print(f"[DEBUG] Job ID received: {job_id}")
            return job_id

        except ValueError as e:
            print(f"[DEBUG] Failed to parse search response JSON: {str(e)}")
            raise Exception(f"Invalid JSON response from search API: {str(e)}")

    except requests.exceptions.ConnectTimeout:
        print(f"[DEBUG] Search request timeout to {search_url}")
        raise Exception(f"Search request timeout to external API")
    except requests.exceptions.ConnectionError as e:
        print(f"[DEBUG] Search request connection error: {str(e)}")
        raise Exception(f"Failed to connect to search API: {str(e)}")
    except requests.exceptions.RequestException as e:
        print(f"[DEBUG] Search request exception: {str(e)}")
        raise Exception(f"Search request failed: {str(e)}")
    except Exception as e:
        print(f"[DEBUG] Unexpected search error: {str(e)}")
        raise Exception(f"Search request error: {str(e)}")


# Validation schema for travel form
class TravelFormSchema(Schema):
    passions = fields.List(fields.Str(), required=True)
    specific_places = fields.Str(required=False, allow_none=True)
    places_to_visit = fields.Str(required=False, allow_none=True)
    preferred_destinations = fields.Str(required=False, allow_none=True)
    travel_pace = fields.Str(required=False, allow_none=True)
    accommodation_level = fields.Str(required=False, allow_none=True)
    accommodation_type = fields.Str(required=False, allow_none=True)
    adults = fields.Int(required=True, validate=lambda x: x >= 1)
    children = fields.Int(required=False, missing=0)
    infants = fields.Int(required=False, missing=0)
    rooms = fields.Int(required=True, validate=lambda x: x >= 1)
    traveler_type = fields.Str(required=False, allow_none=True)
    check_in = fields.Date(required=False, allow_none=True)
    check_out = fields.Date(required=False, allow_none=True)
    transportation_known = fields.Str(required=False, allow_none=True)
    arrival_departure = fields.Str(required=False, allow_none=True)
    budget = fields.Str(required=False, allow_none=True)
    special_services = fields.Str(required=False, allow_none=True)
    email = fields.Email(required=True)


@travel_bp.route('/submit-form', methods=['POST'])
def submit_travel_form():
    """Submit travel configuration form"""
    try:
        # Validate input
        schema = TravelFormSchema()
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({
            'error': 'Validation error',
            'details': err.messages
        }), 400

    try:
        # Authenticate with external travel API
        print(f"[DEBUG] Starting external API authentication process...")
        try:
            external_token = authenticate_external_api()
            print(
                f"[DEBUG] Successfully authenticated with external API, token received: {'***' + external_token[-10:] if external_token else 'None'}"
            )
        except Exception as e:
            print(f"[DEBUG] External API authentication failed: {str(e)}")
            return jsonify({
                'error': 'External service authentication failed',
                'details': str(e)
            }), 503

        # Map form data to external API format
        print(f"[DEBUG] Mapping form data to external API format...")
        external_search_data = map_form_data_to_external_format(data)
        print(f"[DEBUG] Mapped data: {external_search_data}")

        # Send search request to external API
        print(f"[DEBUG] Sending search request to external API...")
        try:
            job_id = send_search_request_to_external_api(
                external_token, external_search_data)
            print(f"[DEBUG] Search job started successfully with ID: {job_id}")
        except Exception as e:
            print(f"[DEBUG] External search request failed: {str(e)}")
            return jsonify({
                'error': 'External search request failed',
                'details': str(e)
            }), 503

        # Generate travel request ID
        travel_id = str(uuid.uuid4())

        # Get user ID if authenticated, otherwise None
        user_id = None
        try:
            from flask_jwt_extended import verify_jwt_in_request
            verify_jwt_in_request(optional=True)
            user_id = get_jwt_identity()
        except:
            pass  # Anonymous submission allowed

        # Prepare travel data
        travel_data = {
            'user_id': user_id,
            'passions': data['passions'],
            'specific_places': data.get('specific_places'),
            'places_to_visit': data.get('places_to_visit'),
            'preferred_destinations': data.get('preferred_destinations'),
            'travel_pace': data.get('travel_pace'),
            'accommodation_level': data.get('accommodation_level'),
            'accommodation_type': data.get('accommodation_type'),
            'travelers': {
                'adults': data['adults'],
                'children': data.get('children', 0),
                'infants': data.get('infants', 0),
                'rooms': data['rooms']
            },
            'traveler_type': data.get('traveler_type'),
            'dates': {
                'check_in': data.get('check_in'),
                'check_out': data.get('check_out')
            },
            'transportation': {
                'known': data.get('transportation_known'),
                'arrival_departure': data.get('arrival_departure')
            },
            'budget': data.get('budget'),
            'special_services': data.get('special_services'),
            'contact_email': data['email'],
            'status': 'submitted',
            'external_api_authenticated': True,
            'external_token_obtained_at': datetime.utcnow().isoformat(),
            'external_job_id': job_id,
            'external_search_data': external_search_data,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }

        # Store in OpenSearch
        opensearch_ops.index_document('travels', travel_id, travel_data)

        # TODO: In a real application, you would:
        # 1. Send email notification to local experts
        # 2. Queue for processing
        # 3. Send confirmation email to user

        return jsonify({
            'message':
            'Travel request submitted successfully',
            'travel_id':
            travel_id,
            'status':
            'submitted',
            'external_api_authenticated':
            True,
            'external_job_id':
            job_id,
            'next_steps':
            'Our virtual expert will review your request and send you personalized proposals within 2-3 minutes.'
        }), 201

    except Exception as e:
        return jsonify({
            'error': 'Failed to submit travel request',
            'details': str(e)
        }), 500


@travel_bp.route('/my-travels', methods=['GET'])
@jwt_required()
def get_user_travels():
    """Get user's travel requests"""
    try:
        user_id = get_jwt_identity()

        # Search for user's travels
        search_result = opensearch_ops.search_documents(
            'travels', query={'term': {
                'user_id': user_id
            }}, size=50)

        travels = []
        for hit in search_result['hits']['hits']:
            travel_data = hit['_source']
            travels.append({
                'id': hit['_id'],
                'status': travel_data['status'],
                'created_at': travel_data['created_at'],
                'passions': travel_data['passions'],
                'travelers': travel_data['travelers'],
                'budget': travel_data.get('budget'),
                'contact_email': travel_data['contact_email']
            })

        return jsonify({'travels': travels, 'total': len(travels)}), 200

    except Exception as e:
        return jsonify({
            'error': 'Failed to get travels',
            'details': str(e)
        }), 500


@travel_bp.route('/travel/<travel_id>', methods=['GET'])
@jwt_required()
def get_travel_details(travel_id):
    """Get specific travel request details"""
    try:
        user_id = get_jwt_identity()

        # Get travel document
        travel_doc = opensearch_ops.get_document('travels', travel_id)
        travel_data = travel_doc['_source']

        # Check if user owns this travel request
        if travel_data.get('user_id') != user_id:
            return jsonify({'error': 'Access denied'}), 403

        return jsonify({'travel': {'id': travel_id, **travel_data}}), 200

    except Exception as e:
        if 'not found' in str(e).lower():
            return jsonify({'error': 'Travel request not found'}), 404
        return jsonify({
            'error': 'Failed to get travel details',
            'details': str(e)
        }), 500


@travel_bp.route('/travel/<travel_id>/status', methods=['PUT'])
@jwt_required()
def update_travel_status(travel_id):
    """Update travel request status (for admin/expert use)"""
    try:
        user_id = get_jwt_identity()
        data = request.json

        if 'status' not in data:
            return jsonify({'error': 'Status is required'}), 400

        # Valid status transitions
        valid_statuses = [
            'submitted', 'processing', 'proposals_sent', 'booked', 'completed',
            'cancelled'
        ]
        if data['status'] not in valid_statuses:
            return jsonify({'error': 'Invalid status'}), 400

        # Get travel document
        travel_doc = opensearch_ops.get_document('travels', travel_id)
        travel_data = travel_doc['_source']

        # Update status
        opensearch_ops.update_document(
            'travels', travel_id, {
                'status': data['status'],
                'updated_at': datetime.utcnow().isoformat(),
                'updated_by': user_id
            })

        return jsonify({
            'message': 'Travel status updated successfully',
            'travel_id': travel_id,
            'status': data['status']
        }), 200

    except Exception as e:
        if 'not found' in str(e).lower():
            return jsonify({'error': 'Travel request not found'}), 404
        return jsonify({
            'error': 'Failed to update travel status',
            'details': str(e)
        }), 500


@travel_bp.route('/statistics', methods=['GET'])
@jwt_required()
def get_travel_statistics():
    """Get travel statistics (for dashboard)"""
    try:
        user_id = get_jwt_identity()

        # Get user's travels
        search_result = opensearch_ops.search_documents(
            'travels', query={'term': {
                'user_id': user_id
            }}, size=100)

        travels = [hit['_source'] for hit in search_result['hits']['hits']]

        # Calculate statistics
        total_travels = len(travels)
        status_counts = {}

        for travel in travels:
            status = travel.get('status', 'unknown')
            status_counts[status] = status_counts.get(status, 0) + 1

        # Most popular passions
        passion_counts = {}
        for travel in travels:
            for passion in travel.get('passions', []):
                passion_counts[passion] = passion_counts.get(passion, 0) + 1

        return jsonify({
            'statistics': {
                'total_travels':
                total_travels,
                'status_breakdown':
                status_counts,
                'popular_passions':
                dict(
                    sorted(passion_counts.items(),
                           key=lambda x: x[1],
                           reverse=True)[:5])
            }
        }), 200

    except Exception as e:
        return jsonify({
            'error': 'Failed to get statistics',
            'details': str(e)
        }), 500


@travel_bp.route('/poll-job/<job_id>', methods=['GET'])
def poll_job_status(job_id):
    """Poll external API for job status"""
    try:
        # Get fresh token for the request
        external_token = authenticate_external_api()
        
        api_url = os.getenv('TRAVEL_API_URL')
        if not api_url:
            raise Exception("External API URL not configured")

        status_url = f"{api_url}/api/search/{job_id}"
        
        headers = {
            'Authorization': f'Bearer {external_token}',
            'Content-Type': 'application/json'
        }

        print(f"[DEBUG] Polling job status for job_id: {job_id}")
        print(f"[DEBUG] Status URL: {status_url}")

        # Make status request with SSL verification disabled for development
        verify_ssl = not api_url.startswith('https://localhost')

        response = requests.get(status_url,
                                headers=headers,
                                timeout=30,
                                verify=verify_ssl)

        print(f"[DEBUG] Status response: {response.status_code}")
        print(f"[DEBUG] Status content: {response.text}")

        if response.status_code == 401:
            raise Exception("Authentication failed for status request")

        if not response.ok:
            raise Exception(f"Status request failed: {response.status_code} - {response.text}")

        try:
            status_data = response.json()
            return jsonify(status_data), 200

        except ValueError as e:
            print(f"[DEBUG] Failed to parse status response JSON: {str(e)}")
            raise Exception(f"Invalid JSON response from status API: {str(e)}")

    except Exception as e:
        print(f"[DEBUG] Job status polling error: {str(e)}")
        return jsonify({
            'error': 'Failed to poll job status',
            'details': str(e)
        }), 500


@travel_bp.route('/get-job-result/<job_id>', methods=['GET'])
def get_job_result(job_id):
    """Get job result from external API when completed"""
    try:
        # Get fresh token for the request
        external_token = authenticate_external_api()
        
        api_url = os.getenv('TRAVEL_API_URL')
        if not api_url:
            raise Exception("External API URL not configured")

        result_url = f"{api_url}/api/search/{job_id}/result"
        
        headers = {
            'Authorization': f'Bearer {external_token}',
            'Content-Type': 'application/json'
        }

        print(f"[DEBUG] Getting job result for job_id: {job_id}")
        print(f"[DEBUG] Result URL: {result_url}")

        # Make result request with SSL verification disabled for development
        verify_ssl = not api_url.startswith('https://localhost')

        response = requests.get(result_url,
                                headers=headers,
                                timeout=30,
                                verify=verify_ssl)

        print(f"[DEBUG] Result response: {response.status_code}")
        print(f"[DEBUG] Result content: {response.text}")

        if response.status_code == 401:
            raise Exception("Authentication failed for result request")

        if not response.ok:
            raise Exception(f"Result request failed: {response.status_code} - {response.text}")

        try:
            result_data = response.json()
            
            # Log the result as requested
            print(f"[INFO] JOB RESULT RECEIVED:")
            print(f"[INFO] Job ID: {job_id}")
            print(f"[INFO] Result Data: {result_data}")
            
            # Get user_id from the travel request associated with this job
            user_id = None
            try:
                # Find the travel request with this external_job_id
                travels_result = opensearch_ops.search_documents(
                    'travels',
                    query={'term': {'external_job_id': job_id}},
                    size=1
                )
                if travels_result['hits']['total']['value'] > 0:
                    travel_data = travels_result['hits']['hits'][0]['_source']
                    user_id = travel_data.get('user_id')
                    print(f"[DEBUG] Found user_id {user_id} for job {job_id}")
            except Exception as e:
                print(f"[ERROR] Failed to find user for job {job_id}: {str(e)}")
            
            # Save travel packages to database
            if isinstance(result_data, list) and result_data:
                packages_saved = save_travel_packages(job_id, result_data, user_id)
                print(f"[INFO] Saved {packages_saved} travel packages for job {job_id} and user {user_id}")
            
            return jsonify(result_data), 200

        except ValueError as e:
            print(f"[DEBUG] Failed to parse result response JSON: {str(e)}")
            raise Exception(f"Invalid JSON response from result API: {str(e)}")

    except Exception as e:
        print(f"[DEBUG] Job result retrieval error: {str(e)}")
        return jsonify({
            'error': 'Failed to get job result',
            'details': str(e)
        }), 500


@travel_bp.route('/destinations', methods=['GET'])
def get_destinations():
    """Get available destinations (public endpoint)"""
    # This would typically come from a database
    destinations = [{
        'id': 'sardegna',
        'name': 'Sardegna',
        'region': 'Isole'
    }, {
        'id': 'toscana',
        'name': 'Toscana',
        'region': 'Centro'
    }, {
        'id': 'sicilia',
        'name': 'Sicilia',
        'region': 'Isole'
    }, {
        'id': 'piemonte',
        'name': 'Piemonte',
        'region': 'Nord'
    }, {
        'id': 'trentino-alto-adige',
        'name': 'Trentino-Alto Adige',
        'region': 'Nord'
    }, {
        'id': 'campania',
        'name': 'Campania',
        'region': 'Sud'
    }, {
        'id': 'veneto',
        'name': 'Veneto',
        'region': 'Nord'
    }, {
        'id': 'liguria',
        'name': 'Liguria',
        'region': 'Nord'
    }, {
        'id': 'puglia',
        'name': 'Puglia',
        'region': 'Sud'
    }, {
        'id': 'friuli-venezia-giulia',
        'name': 'Friuli-Venezia Giulia',
        'region': 'Nord'
    }, {
        'id': 'valle-d-aosta',
        'name': "Valle d'Aosta",
        'region': 'Nord'
    }, {
        'id': 'lombardia',
        'name': 'Lombardia',
        'region': 'Nord'
    }, {
        'id': 'emilia-romagna',
        'name': 'Emilia-Romagna',
        'region': 'Nord'
    }, {
        'id': 'lazio',
        'name': 'Lazio',
        'region': 'Centro'
    }, {
        'id': 'calabria',
        'name': 'Calabria',
        'region': 'Sud'
    }, {
        'id': 'molise',
        'name': 'Molise',
        'region': 'Sud'
    }, {
        'id': 'basilicata',
        'name': 'Basilicata',
        'region': 'Sud'
    }, {
        'id': 'marche',
        'name': 'Marche',
        'region': 'Centro'
    }, {
        'id': 'umbria',
        'name': 'Umbria',
        'region': 'Centro'
    }]

    return jsonify({'destinations': destinations}), 200


@travel_bp.route('/my-packages', methods=['GET'])
@jwt_required()
def get_user_packages():
    """Get user's travel packages"""
    try:
        user_id = get_jwt_identity()

        # Get user's travels to find associated job IDs
        travels_result = opensearch_ops.search_documents(
            'travels', 
            query={'term': {'user_id': user_id}}, 
            size=100
        )

        job_ids = []
        travels_map = {}
        for hit in travels_result['hits']['hits']:
            travel_data = hit['_source']
            external_job_id = travel_data.get('external_job_id')
            if external_job_id:
                job_ids.append(external_job_id)
                travels_map[external_job_id] = {
                    'travel_id': hit['_id'],
                    'travel_data': travel_data
                }

        if not job_ids:
            return jsonify({'packages': [], 'total': 0}), 200

        # Search for packages associated with user's job IDs or directly with user_id
        should_clauses = [{'term': {'job_id': job_id}} for job_id in job_ids]
        should_clauses.append({'term': {'user_id': user_id}})
        
        packages_query = {
            'bool': {
                'should': should_clauses
            }
        }

        packages_result = opensearch_ops.search_documents(
            'travel_packages',
            query=packages_query,
            size=100
        )

        packages = []
        for hit in packages_result['hits']['hits']:
            package_data = hit['_source']
            job_id = package_data['job_id']
            
            # Get associated travel info
            travel_info = travels_map.get(job_id, {})
            
            # Calculate total price
            total_price = calculate_package_price(package_data)
            
            # Get destinations from hotels
            destinations = list(package_data.get('hotels_selezionati', {}).keys())
            
            packages.append({
                'id': hit['_id'],
                'package_id': package_data['package_id'],
                'job_id': job_id,
                'travel_id': travel_info.get('travel_id'),
                'destinations': destinations,
                'hotels': package_data.get('hotels_selezionati', {}),
                'experiences': package_data.get('esperienze_selezionate', {}),
                'total_price': total_price,
                'status': package_data.get('status', 'available'),
                'created_at': package_data.get('created_at'),
                'original_request': {
                    'passions': travel_info.get('travel_data', {}).get('passions', []),
                    'travelers': travel_info.get('travel_data', {}).get('travelers', {}),
                    'dates': travel_info.get('travel_data', {}).get('dates', {})
                }
            })

        # Sort by creation date (most recent first)
        packages.sort(key=lambda x: x.get('created_at', ''), reverse=True)

        return jsonify({'packages': packages, 'total': len(packages)}), 200

    except Exception as e:
        return jsonify({
            'error': 'Failed to get travel packages',
            'details': str(e)
        }), 500


def calculate_package_price(package_data):
    """Calculate total price for a travel package"""
    try:
        total_price = 0
        
        # Sum hotel prices
        hotels = package_data.get('hotels_selezionati', {})
        for city, hotel in hotels.items():
            daily_price = hotel.get('daily_prices', 0)
            if isinstance(daily_price, (int, float)):
                # Calculate nights between check-in and check-out
                checkin = hotel.get('checkin', '')
                checkout = hotel.get('checkout', '')
                
                if checkin and checkout:
                    try:
                        from datetime import datetime
                        checkin_date = datetime.strptime(checkin, '%d/%m/%Y')
                        checkout_date = datetime.strptime(checkout, '%d/%m/%Y')
                        nights = (checkout_date - checkin_date).days
                        total_price += daily_price * nights
                    except:
                        # Default to 1 night if date parsing fails
                        total_price += daily_price
                else:
                    total_price += daily_price
        
        return round(total_price, 2)
        
    except Exception as e:
        print(f"[ERROR] Failed to calculate package price: {str(e)}")
        return 0

