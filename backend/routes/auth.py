from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from flask_bcrypt import check_password_hash, generate_password_hash
from marshmallow import Schema, fields, ValidationError
from email_validator import validate_email, EmailNotValidError
import uuid
from datetime import datetime

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
        # Find user
        search_result = opensearch_ops.search_documents(
            'users',
            query={'term': {'email': data['email']}},
            size=1
        )

        if search_result['hits']['total']['value'] == 0:
            return jsonify({'error': 'Invalid credentials'}), 401

        user_doc = search_result['hits']['hits'][0]
        user_id = user_doc['_id']
        user_data = user_doc['_source']

        # Check password
        stored_hash = user_data['password']
        provided_password = data['password']
        
        # Debug logging (remove in production)
        print(f"=== LOGIN DEBUG ===")
        print(f"Email found: {user_data['email']}")
        print(f"Stored hash: {stored_hash}")
        print(f"Stored hash type: {type(stored_hash)}")
        print(f"Provided password: {provided_password}")
        print(f"Hash starts with $2b$: {stored_hash.startswith('$2b$')}")
        
        # Try password verification
        password_valid = check_password_hash(stored_hash, provided_password)
        print(f"Password verification result: {password_valid}")
        
        if not password_valid:
            # Try manual bcrypt check as fallback
            try:
                import bcrypt
                manual_check = bcrypt.checkpw(provided_password.encode('utf-8'), stored_hash.encode('utf-8'))
                print(f"Manual bcrypt check result: {manual_check}")
                if not manual_check:
                    return jsonify({'error': 'Invalid credentials'}), 401
            except Exception as bcrypt_error:
                print(f"Manual bcrypt check failed: {bcrypt_error}")
                return jsonify({'error': 'Invalid credentials'}), 401

        # Create tokens
        access_token = create_access_token(identity=user_id)
        refresh_token = create_refresh_token(identity=user_id)

        return jsonify({
            'message': 'Login successful',
            'user': {
                'id': user_id,
                'email': user_data['email'],
                'name': user_data['name'],
                'username': user_data['username']
            },
            'access_token': access_token,
            'refresh_token': refresh_token
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
    """Logout user (token blacklisting would be implemented here in production)"""
    return jsonify({'message': 'Logout successful'}), 200
