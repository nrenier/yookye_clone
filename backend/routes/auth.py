from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity, get_jwt
from flask_bcrypt import check_password_hash, generate_password_hash
from marshmallow import Schema, fields, ValidationError
from email_validator import validate_email, EmailNotValidError
import uuid
from datetime import datetime, timedelta

from config.opensearch_client import opensearch_ops

auth_bp = Blueprint('auth', __name__)

# Validation schemas
class RegisterSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=lambda x: len(x) >= 6)
    name = fields.Str(required=True, validate=lambda x: len(x.strip()) > 0)
    username = fields.Str(required=True, validate=lambda x: len(x.strip()) > 0)

class LoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        # Validate input
        schema = RegisterSchema()
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({'error': 'Validation error', 'details': err.messages}), 400

    try:
        # Check if user already exists
        search_result = opensearch_ops.search_documents(
            'users',
            query={'term': {'email': data['email']}},
            size=1
        )

        if search_result['hits']['total']['value'] > 0:
            return jsonify({'error': 'User already exists'}), 409

        # Create new user
        user_id = str(uuid.uuid4())
        password_hash = generate_password_hash(data['password']).decode('utf-8')

        user_data = {
            'id': user_id,
            'email': data['email'],
            'password': password_hash,
            'name': data['name'],
            'username': data['username']
        }

        # Store user in OpenSearch
        opensearch_ops.index_document('users', user_id, user_data)

        # Create tokens
        access_token = create_access_token(identity=user_id)
        refresh_token = create_refresh_token(identity=user_id)

        return jsonify({
            'message': 'User registered successfully',
            'user': {
                'id': user_id,
                'email': data['email'],
                'name': data['name'],
                'username': data['username']
            },
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 201

    except Exception as e:
        return jsonify({'error': 'Registration failed', 'details': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    try:
        # Validate input
        schema = LoginSchema()
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({'error': 'Validation error', 'details': err.messages}), 400

    try:
        print(f"=== LOGIN ATTEMPT ===")
        print(f"Email provided: {data['email']}")

        # Find user - try exact term search first
        search_result = opensearch_ops.search_documents(
            'users',
            query={'term': {'email': data['email']}},
            size=1
        )

        # If not found, try with match query (case insensitive)
        if search_result['hits']['total']['value'] == 0:
            print("Trying case-insensitive search...")
            search_result = opensearch_ops.search_documents(
                'users',
                query={'match': {'email': data['email']}},
                size=1
            )


        if search_result['hits']['total']['value'] == 0:
            print("User not found!")
            return jsonify({'error': 'Invalid credentials'}), 401

        user_doc = search_result['hits']['hits'][0]
        user_id = user_doc['_id']
        user_data = user_doc['_source']

        # Check password
        stored_hash = user_data['password']
        provided_password = data['password']


        # Try password verification
        password_valid = check_password_hash(stored_hash, provided_password)
        print(f"Password verification result: {password_valid}")

        if not password_valid:
            print("Password verification failed!")
            return jsonify({'error': 'Invalid credentials'}), 401

        # Create tokens with custom claims
        access_jti = str(uuid.uuid4())
        refresh_jti = str(uuid.uuid4())

        access_token = create_access_token(
            identity=user_id,
            additional_claims={'jti': access_jti}
        )
        refresh_token = create_refresh_token(
            identity=user_id,
            additional_claims={'jti': refresh_jti}
        )

        # Create session record
        session_id = str(uuid.uuid4())
        session_data = {
            'session_id': session_id,
            'user_id': user_id,
            'access_token_jti': access_jti,
            'refresh_token_jti': refresh_jti,
            'created_at': datetime.utcnow().isoformat(),
            'expires_at': (datetime.utcnow() + timedelta(days=30)).isoformat(),
            'last_activity': datetime.utcnow().isoformat(),
            'ip_address': request.remote_addr,
            'user_agent': request.headers.get('User-Agent', ''),
            'is_active': True
        }

        opensearch_ops.index_document('sessions', session_id, session_data)

        return jsonify({
            'message': 'Login successful',
            'user': {
                'id': user_id,
                'email': user_data['email'],
                'name': user_data['name'],
                'username': user_data['username']
            },
            'access_token': access_token,
            'refresh_token': refresh_token,
            'session_id': session_id
        }), 200

    except Exception as e:
        print(f"Login exception: {e}")
        print(f"Exception type: {type(e)}")
        return jsonify({'error': 'Login failed', 'details': str(e)}), 500

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token"""
    try:
        current_user_id = get_jwt_identity()

        # Verify user still exists
        user_doc = opensearch_ops.get_document('users', current_user_id)

        # Create new access token
        access_token = create_access_token(identity=current_user_id)

        return jsonify({
            'access_token': access_token
        }), 200

    except Exception as e:
        return jsonify({'error': 'Token refresh failed', 'details': str(e)}), 500

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get user profile"""
    try:
        current_user_id = get_jwt_identity()
        jwt_claims = get_jwt()

        # Validate session is still active
        if 'jti' in jwt_claims:
            access_jti = jwt_claims['jti']
            session_search = opensearch_ops.search_documents(
                'sessions',
                query={
                    'bool': {
                        'must': [
                            {'term': {'access_token_jti': access_jti}},
                            {'term': {'is_active': True}}
                        ]
                    }
                },
                size=1
            )

            if session_search['hits']['total']['value'] == 0:
                return jsonify({'error': 'Session expired or invalid'}), 401

            # Update last activity
            session_doc = session_search['hits']['hits'][0]
            session_id = session_doc['_id']
            opensearch_ops.update_document('sessions', session_id, {
                'last_activity': datetime.utcnow().isoformat()
            })

        # Get user data
        user_doc = opensearch_ops.get_document('users', current_user_id)
        user_data = user_doc['_source']

        return jsonify({
            'user': {
                'id': current_user_id,
                'email': user_data['email'],
                'name': user_data['name'],
                'username': user_data['username']
            }
        }), 200

    except Exception as e:
        return jsonify({'error': 'Failed to get profile', 'details': str(e)}), 500

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile"""
    try:
        current_user_id = get_jwt_identity()
        data = request.json

        # Validate updatable fields
        updatable_fields = ['name', 'username']
        update_data = {k: v for k, v in data.items() if k in updatable_fields and v}

        if not update_data:
            return jsonify({'error': 'No valid fields to update'}), 400

        # Update user
        opensearch_ops.update_document('users', current_user_id, update_data)

        # Get updated user data
        user_doc = opensearch_ops.get_document('users', current_user_id)
        user_data = user_doc['_source']

        return jsonify({
            'message': 'Profile updated successfully',
            'user': {
                'id': current_user_id,
                'email': user_data['email'],
                'name': user_data['name'],
                'username': user_data['username']
            }
        }), 200

    except Exception as e:
        return jsonify({'error': 'Failed to update profile', 'details': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout user and revoke session"""
    try:
        current_user_id = get_jwt_identity()
        jti = get_jwt()['jti']  # JWT Token Identifier

        print(f"=== LOGOUT ATTEMPT ===")
        print(f"User ID: {current_user_id}")
        print(f"JWT ID: {jti}")

        # Add token to blacklist in OpenSearch
        opensearch_ops.create_document('blacklisted_tokens', jti, {
            'jti': jti,
            'user_id': current_user_id,
            'blacklisted_at': datetime.utcnow().isoformat()
        })

        # Deactivate user session
        session_query = {
            "query": {
                "bool": {
                    "must": [
                        {"term": {"user_id": current_user_id}},
                        {"term": {"is_active": True}}
                    ]
                }
            }
        }

        sessions_response = opensearch_ops.search_documents('sessions', session_query)
        print(f"Active sessions found: {len(sessions_response['hits']['hits'])}")

        for hit in sessions_response['hits']['hits']:
            session_id = hit['_id']
            print(f"Deactivating session: {session_id}")
            opensearch_ops.update_document('sessions', session_id, {
                'is_active': False,
                'logout_at': datetime.utcnow().isoformat()
            })

        print("Logout completed successfully")
        return jsonify({'message': 'Logged out successfully'}), 200

    except Exception as e:
        print(f"Logout error: {str(e)}")
        return jsonify({'error': 'Logout failed', 'details': str(e)}), 500

@auth_bp.route('/session-debug', methods=['GET'])
@jwt_required()
def session_debug():
    """Debug endpoint to check session status"""
    try:
        current_user_id = get_jwt_identity()
        jti = get_jwt()['jti']

        print(f"=== SESSION DEBUG ===")
        print(f"User ID: {current_user_id}")
        print(f"JWT ID: {jti}")

        # Check if token is blacklisted
        try:
            blacklist_doc = opensearch_ops.get_document('blacklisted_tokens', jti)
            token_blacklisted = True
            print("Token is blacklisted")
        except:
            token_blacklisted = False
            print("Token is not blacklisted")

        # Get user sessions
        session_query = {
            "query": {
                "term": {"user_id": current_user_id}
            },
            "sort": [{"created_at": {"order": "desc"}}]
        }

        sessions_response = opensearch_ops.search_documents('sessions', session_query)
        sessions = []

        for hit in sessions_response['hits']['hits']:
            session_data = hit['_source']
            session_data['session_id'] = hit['_id']
            sessions.append(session_data)
            print(f"Session {hit['_id']}: active={session_data.get('is_active', False)}")

        # Get user info
        user_doc = opensearch_ops.get_document('users', current_user_id)
        user_info = user_doc['_source']

        debug_info = {
            'user_id': current_user_id,
            'jti': jti,
            'token_blacklisted': token_blacklisted,
            'user_info': {
                'email': user_info.get('email'),
                'name': user_info.get('name'),
                'created_at': user_info.get('created_at')
            },
            'sessions': sessions,
            'total_sessions': len(sessions),
            'active_sessions': len([s for s in sessions if s.get('is_active', False)])
        }

        print(f"Debug info compiled: {debug_info}")
        return jsonify(debug_info), 200

    except Exception as e:
        print(f"Session debug error: {str(e)}")
        return jsonify({'error': 'Session debug failed', 'details': str(e)}), 500

@auth_bp.route('/sessions', methods=['GET'])
@jwt_required()
def get_active_sessions():
    """Get user's active sessions"""
    try:
        current_user_id = get_jwt_identity()

        # Get all active sessions for user
        sessions_result = opensearch_ops.search_documents(
            'sessions',
            query={
                'bool': {
                    'must': [
                        {'term': {'user_id': current_user_id}},
                        {'term': {'is_active': True}}
                    ]
                }
            },
            size=50
        )

        sessions = []
        for hit in sessions_result['hits']['hits']:
            session_data = hit['_source']
            sessions.append({
                'session_id': session_data['session_id'],
                'created_at': session_data['created_at'],
                'last_activity': session_data['last_activity'],
                'ip_address': session_data['ip_address'],
                'user_agent': session_data.get('user_agent', '')[:100] + '...' if len(session_data.get('user_agent', '')) > 100 else session_data.get('user_agent', '')
            })

        return jsonify({
            'sessions': sessions,
            'total_active': len(sessions)
        }), 200

    except Exception as e:
        return jsonify({'error': 'Failed to get sessions', 'details': str(e)}), 500

@auth_bp.route('/sessions/<session_id>', methods=['DELETE'])
@jwt_required()
def revoke_session():
    """Revoke a specific session"""
    try:
        current_user_id = get_jwt_identity()
        session_id = request.view_args['session_id']

        # Verify session belongs to current user
        session_doc = opensearch_ops.get_document('sessions', session_id)
        if session_doc['_source']['user_id'] != current_user_id:
            return jsonify({'error': 'Unauthorized'}), 403

        # Deactivate session
        opensearch_ops.update_document('sessions', session_id, {
            'is_active': False,
            'revoked_at': datetime.utcnow().isoformat()
        })

        return jsonify({'message': 'Session revoked successfully'}), 200

    except Exception as e:
        return jsonify({'error': 'Failed to revoke session', 'details': str(e)}), 500