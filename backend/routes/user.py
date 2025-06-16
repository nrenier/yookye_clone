from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import Schema, fields, ValidationError
from datetime import datetime

from config.opensearch_client import opensearch_ops

user_bp = Blueprint('user', __name__)

# Validation schemas
class PreferencesSchema(Schema):
    travel_style = fields.Str(required=False)
    budget_range = fields.Str(required=False)
    accommodation_preferences = fields.List(fields.Str(), required=False)
    activity_preferences = fields.List(fields.Str(), required=False)
    dietary_restrictions = fields.List(fields.Str(), required=False)
    accessibility_needs = fields.Str(required=False)

@user_bp.route('/preferences', methods=['GET'])
@jwt_required()
def get_user_preferences():
    """Get user preferences"""
    try:
        user_id = get_jwt_identity()

        # Search for user preferences
        search_result = opensearch_ops.search_documents(
            'preferences',
            query={'term': {'user_id': user_id}},
            size=1
        )

        if search_result['hits']['total']['value'] > 0:
            prefs_data = search_result['hits']['hits'][0]['_source']
            return jsonify({
                'preferences': prefs_data.get('preferences', {}),
                'updated_at': prefs_data.get('updated_at')
            }), 200
        else:
            return jsonify({
                'preferences': {},
                'message': 'No preferences found'
            }), 200

    except Exception as e:
        return jsonify({'error': 'Failed to get preferences', 'details': str(e)}), 500

@user_bp.route('/preferences', methods=['POST', 'PUT'])
@jwt_required()
def save_user_preferences():
    """Save or update user preferences"""
    try:
        user_id = get_jwt_identity()

        # Validate input
        schema = PreferencesSchema()
        preferences = schema.load(request.json)

        # Check if preferences already exist
        search_result = opensearch_ops.search_documents(
            'preferences',
            query={'term': {'user_id': user_id}},
            size=1
        )

        prefs_data = {
            'user_id': user_id,
            'preferences': preferences,
            'updated_at': datetime.utcnow().isoformat()
        }

        if search_result['hits']['total']['value'] > 0:
            # Update existing preferences
            prefs_id = search_result['hits']['hits'][0]['_id']
            opensearch_ops.update_document('preferences', prefs_id, prefs_data)
            message = 'Preferences updated successfully'
        else:
            # Create new preferences
            prefs_data['created_at'] = datetime.utcnow().isoformat()
            import uuid
            prefs_id = str(uuid.uuid4())
            opensearch_ops.index_document('preferences', prefs_id, prefs_data)
            message = 'Preferences saved successfully'

        return jsonify({
            'message': message,
            'preferences': preferences
        }), 200

    except ValidationError as err:
        return jsonify({'error': 'Validation error', 'details': err.messages}), 400
    except Exception as e:
        return jsonify({'error': 'Failed to save preferences', 'details': str(e)}), 500

@user_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_user_dashboard():
    """Get user dashboard data"""
    try:
        user_id = get_jwt_identity()

        # Get user profile
        user_doc = opensearch_ops.get_document('users', user_id)
        user_data = user_doc['_source']

        # Get user's recent travels
        travels_result = opensearch_ops.search_documents(
            'travels',
            query={'term': {'user_id': user_id}},
            size=5
        )

        recent_travels = []
        for hit in travels_result['hits']['hits']:
            travel_data = hit['_source']
            recent_travels.append({
                'id': hit['_id'],
                'status': travel_data['status'],
                'created_at': travel_data['created_at'],
                'passions': travel_data['passions'][:3],  # First 3 passions
                'destination_summary': travel_data.get('places_to_visit', 'Italia')
            })

        # Get user preferences
        prefs_result = opensearch_ops.search_documents(
            'preferences',
            query={'term': {'user_id': user_id}},
            size=1
        )

        preferences = {}
        if prefs_result['hits']['total']['value'] > 0:
            preferences = prefs_result['hits']['hits'][0]['_source'].get('preferences', {})

        # Calculate some basic stats
        total_travels = travels_result['hits']['total']['value']
        completed_travels = len([t for t in [hit['_source'] for hit in travels_result['hits']['hits']]
                                if t.get('status') == 'completed'])

        return jsonify({
            'user': {
                'id': user_id,
                'email': user_data['email'],
                'first_name': user_data['first_name'],
                'last_name': user_data['last_name'],
                'member_since': user_data['created_at']
            },
            'statistics': {
                'total_travels': total_travels,
                'completed_travels': completed_travels,
                'pending_travels': total_travels - completed_travels
            },
            'recent_travels': recent_travels,
            'preferences': preferences
        }), 200

    except Exception as e:
        return jsonify({'error': 'Failed to get dashboard data', 'details': str(e)}), 500

@user_bp.route('/activity', methods=['GET'])
@jwt_required()
def get_user_activity():
    """Get user activity log"""
    try:
        user_id = get_jwt_identity()

        # Get user's travels with more details for activity feed
        travels_result = opensearch_ops.search_documents(
            'travels',
            query={'term': {'user_id': user_id}},
            size=20
        )

        activities = []
        for hit in travels_result['hits']['hits']:
            travel_data = hit['_source']
            activities.append({
                'type': 'travel_request',
                'travel_id': hit['_id'],
                'status': travel_data['status'],
                'date': travel_data['created_at'],
                'description': f"Richiesta viaggio per {', '.join(travel_data['passions'][:2])}",
                'details': {
                    'passions': travel_data['passions'],
                    'travelers_count': travel_data['travelers']['adults'] + travel_data['travelers']['children']
                }
            })

        # Sort by date (most recent first)
        activities.sort(key=lambda x: x['date'], reverse=True)

        return jsonify({
            'activities': activities,
            'total': len(activities)
        }), 200

    except Exception as e:
        return jsonify({'error': 'Failed to get activity', 'details': str(e)}), 500

@user_bp.route('/delete-account', methods=['DELETE'])
@jwt_required()
def delete_user_account():
    """Delete user account and all associated data"""
    try:
        user_id = get_jwt_identity()

        # In a real application, you would:
        # 1. Archive the data instead of deleting
        # 2. Send confirmation email
        # 3. Handle ongoing travel bookings
        # 4. Implement a grace period

        # For this mockup, we'll just mark as deleted
        opensearch_ops.update_document('users', user_id, {
            'deleted_at': datetime.utcnow().isoformat(),
            'status': 'deleted'
        })

        return jsonify({
            'message': 'Account deletion initiated. Your data will be removed within 30 days.'
        }), 200

    except Exception as e:
        return jsonify({'error': 'Failed to delete account', 'details': str(e)}), 500

@user_bp.route('/export-data', methods=['GET'])
@jwt_required()
def export_user_data():
    """Export user data (GDPR compliance)"""
    try:
        user_id = get_jwt_identity()

        # Get user profile
        user_doc = opensearch_ops.get_document('users', user_id)
        user_data = user_doc['_source']

        # Get user travels
        travels_result = opensearch_ops.search_documents(
            'travels',
            query={'term': {'user_id': user_id}},
            size=100
        )

        travels = [hit['_source'] for hit in travels_result['hits']['hits']]

        # Get user preferences
        prefs_result = opensearch_ops.search_documents(
            'preferences',
            query={'term': {'user_id': user_id}},
            size=1
        )

        preferences = {}
        if prefs_result['hits']['total']['value'] > 0:
            preferences = prefs_result['hits']['hits'][0]['_source']

        # Prepare export data
        export_data = {
            'user_profile': {
                'email': user_data['email'],
                'first_name': user_data['first_name'],
                'last_name': user_data['last_name'],
                'created_at': user_data['created_at'],
                'last_login': user_data.get('last_login')
            },
            'travel_requests': travels,
            'preferences': preferences,
            'export_date': datetime.utcnow().isoformat()
        }

        return jsonify({
            'message': 'Data export completed',
            'data': export_data
        }), 200

    except Exception as e:
        return jsonify({'error': 'Failed to export data', 'details': str(e)}), 500
