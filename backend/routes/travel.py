from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import Schema, fields, ValidationError
import uuid
import os
import requests
from datetime import datetime

from config.opensearch_client import opensearch_ops

travel_bp = Blueprint('travel', __name__)

def authenticate_external_api():
    """Authenticate with external travel API and return access token"""
    try:
        # Get configuration from environment
        api_url = os.getenv('TRAVEL_API_URL')
        api_username = os.getenv('TRAVEL_API_USERNAME')
        api_password = os.getenv('TRAVEL_API_PASSWORD')
        
        if not all([api_url, api_username, api_password]):
            raise Exception("External API configuration is missing")
        
        # Prepare authentication data
        auth_data = {
            'username': api_username,
            'password': api_password
        }
        
        # Make authentication request
        auth_url = f"{api_url}/api/auth/token"
        
        response = requests.post(
            auth_url,
            data=auth_data,  # OAuth2PasswordRequestForm expects form data
            headers={'Content-Type': 'application/x-www-form-urlencoded'},
            timeout=10
        )
        
        if response.status_code == 401:
            raise Exception("Invalid credentials for external API")
        
        if not response.ok:
            raise Exception(f"External API authentication failed: {response.status_code}")
        
        token_data = response.json()
        return token_data.get('access_token')
        
    except requests.exceptions.RequestException as e:
        raise Exception(f"Failed to connect to external API: {str(e)}")
    except Exception as e:
        raise Exception(f"External API authentication error: {str(e)}")

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
        return jsonify({'error': 'Validation error', 'details': err.messages}), 400

    try:
        # Authenticate with external travel API
        try:
            external_token = authenticate_external_api()
            print(f"Successfully authenticated with external API, token received")
        except Exception as e:
            print(f"External API authentication failed: {str(e)}")
            return jsonify({
                'error': 'External service authentication failed', 
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
            'message': 'Travel request submitted successfully',
            'travel_id': travel_id,
            'status': 'submitted',
            'external_api_authenticated': True,
            'next_steps': 'Our local experts will review your request and send you personalized proposals via email within 24-48 hours.'
        }), 201

    except Exception as e:
        return jsonify({'error': 'Failed to submit travel request', 'details': str(e)}), 500

@travel_bp.route('/my-travels', methods=['GET'])
@jwt_required()
def get_user_travels():
    """Get user's travel requests"""
    try:
        user_id = get_jwt_identity()

        # Search for user's travels
        search_result = opensearch_ops.search_documents(
            'travels',
            query={'term': {'user_id': user_id}},
            size=50
        )

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

        return jsonify({
            'travels': travels,
            'total': len(travels)
        }), 200

    except Exception as e:
        return jsonify({'error': 'Failed to get travels', 'details': str(e)}), 500

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

        return jsonify({
            'travel': {
                'id': travel_id,
                **travel_data
            }
        }), 200

    except Exception as e:
        if 'not found' in str(e).lower():
            return jsonify({'error': 'Travel request not found'}), 404
        return jsonify({'error': 'Failed to get travel details', 'details': str(e)}), 500

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
        valid_statuses = ['submitted', 'processing', 'proposals_sent', 'booked', 'completed', 'cancelled']
        if data['status'] not in valid_statuses:
            return jsonify({'error': 'Invalid status'}), 400

        # Get travel document
        travel_doc = opensearch_ops.get_document('travels', travel_id)
        travel_data = travel_doc['_source']

        # Update status
        opensearch_ops.update_document('travels', travel_id, {
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
        return jsonify({'error': 'Failed to update travel status', 'details': str(e)}), 500

@travel_bp.route('/statistics', methods=['GET'])
@jwt_required()
def get_travel_statistics():
    """Get travel statistics (for dashboard)"""
    try:
        user_id = get_jwt_identity()

        # Get user's travels
        search_result = opensearch_ops.search_documents(
            'travels',
            query={'term': {'user_id': user_id}},
            size=100
        )

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
                'total_travels': total_travels,
                'status_breakdown': status_counts,
                'popular_passions': dict(sorted(passion_counts.items(), key=lambda x: x[1], reverse=True)[:5])
            }
        }), 200

    except Exception as e:
        return jsonify({'error': 'Failed to get statistics', 'details': str(e)}), 500

@travel_bp.route('/destinations', methods=['GET'])
def get_destinations():
    """Get available destinations (public endpoint)"""
    # This would typically come from a database
    destinations = [
        {'id': 'sardegna', 'name': 'Sardegna', 'region': 'Isole'},
        {'id': 'toscana', 'name': 'Toscana', 'region': 'Centro'},
        {'id': 'sicilia', 'name': 'Sicilia', 'region': 'Isole'},
        {'id': 'piemonte', 'name': 'Piemonte', 'region': 'Nord'},
        {'id': 'trentino-alto-adige', 'name': 'Trentino-Alto Adige', 'region': 'Nord'},
        {'id': 'campania', 'name': 'Campania', 'region': 'Sud'},
        {'id': 'veneto', 'name': 'Veneto', 'region': 'Nord'},
        {'id': 'liguria', 'name': 'Liguria', 'region': 'Nord'},
        {'id': 'puglia', 'name': 'Puglia', 'region': 'Sud'},
        {'id': 'friuli-venezia-giulia', 'name': 'Friuli-Venezia Giulia', 'region': 'Nord'},
        {'id': 'valle-d-aosta', 'name': "Valle d'Aosta", 'region': 'Nord'},
        {'id': 'lombardia', 'name': 'Lombardia', 'region': 'Nord'},
        {'id': 'emilia-romagna', 'name': 'Emilia-Romagna', 'region': 'Nord'},
        {'id': 'lazio', 'name': 'Lazio', 'region': 'Centro'},
        {'id': 'calabria', 'name': 'Calabria', 'region': 'Sud'},
        {'id': 'molise', 'name': 'Molise', 'region': 'Sud'},
        {'id': 'basilicata', 'name': 'Basilicata', 'region': 'Sud'},
        {'id': 'marche', 'name': 'Marche', 'region': 'Centro'},
        {'id': 'umbria', 'name': 'Umbria', 'region': 'Centro'}
    ]

    return jsonify({'destinations': destinations}), 200
