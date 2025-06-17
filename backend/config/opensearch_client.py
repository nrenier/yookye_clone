from opensearchpy import OpenSearch
import os
from datetime import datetime
import uuid
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# OpenSearch client (will be None if not available)
opensearch_client = None

# In-memory mockup data storage
mock_data = {'users': [], 'travels': [], 'preferences': [], 'sessions': []}


def init_opensearch():
    """Initialize OpenSearch client or use mockup"""
    global opensearch_client

    try:
        # OpenSearch configuration
        host = os.getenv('OPENSEARCH_HOST', 'localhost')
        port = int(os.getenv('OPENSEARCH_PORT', 9200))
        username = os.getenv('OPENSEARCH_USERNAME', 'admin')
        password = os.getenv('OPENSEARCH_PASSWORD', 'admin')
        use_ssl = os.getenv('OPENSEARCH_USE_SSL', 'false').lower() == 'true'

        opensearch_client = OpenSearch(hosts=[{
            'host': host,
            'port': port
        }],
                                       http_auth=(username, password),
                                       use_ssl=use_ssl,
                                       verify_certs=False,
                                       ssl_show_warn=False)

        # Test connection
        info = opensearch_client.info()
        logger.info(f"✅ Connected to OpenSearch: {info['version']['number']}")

        # Create indices if they don't exist
        create_indices()

    except Exception as e:
        logger.warning(f"⚠️ OpenSearch not available: {e}")
        logger.info("🔧 Using in-memory mockup data storage")
        opensearch_client = None


def create_indices():
    """Create OpenSearch indices if they don't exist"""
    if not opensearch_client:
        return

    indices = {
        'users': {
            'mappings': {
                'properties': {
                    'id': {
                        'type': 'keyword'
                    },
                    'email': {
                        'type': 'keyword'
                    },
                    'password': {
                        'type': 'keyword'
                    },
                    'name': {
                        'type': 'text'
                    },
                    'username': {
                        'type': 'keyword'
                    }
                }
            }
        },
        'travels': {
            'mappings': {
                'properties': {
                    'user_id': {
                        'type': 'keyword'
                    },
                    'passions': {
                        'type': 'keyword'
                    },
                    'destinations': {
                        'type': 'text'
                    },
                    'travel_pace': {
                        'type': 'keyword'
                    },
                    'accommodation_level': {
                        'type': 'keyword'
                    },
                    'accommodation_type': {
                        'type': 'keyword'
                    },
                    'travelers': {
                        'type': 'object'
                    },
                    'budget': {
                        'type': 'keyword'
                    },
                    'email': {
                        'type': 'keyword'
                    },
                    'created_at': {
                        'type': 'date'
                    },
                    'status': {
                        'type': 'keyword'
                    }
                }
            }
        },
        'preferences': {
            'mappings': {
                'properties': {
                    'user_id': {
                        'type': 'keyword'
                    },
                    'preferences': {
                        'type': 'object'
                    },
                    'created_at': {
                        'type': 'date'
                    },
                    'updated_at': {
                        'type': 'date'
                    }
                }
            }
        },
        'sessions': {
            'mappings': {
                'properties': {
                    'session_id': {
                        'type': 'keyword'
                    },
                    'user_id': {
                        'type': 'keyword'
                    },
                    'access_token_jti': {
                        'type': 'keyword'
                    },
                    'refresh_token_jti': {
                        'type': 'keyword'
                    },
                    'created_at': {
                        'type': 'date'
                    },
                    'expires_at': {
                        'type': 'date'
                    },
                    'last_activity': {
                        'type': 'date'
                    },
                    'ip_address': {
                        'type': 'ip'
                    },
                    'user_agent': {
                        'type': 'text'
                    },
                    'is_active': {
                        'type': 'boolean'
                    }
                }
            }
        },
        'travel_packages': {
            'mappings': {
                'properties': {
                    'job_id': {
                        'type': 'keyword'
                    },
                    'user_id': {
                        'type': 'keyword'
                    },
                    'package_id': {
                        'type': 'keyword'
                    },
                    'hotels_selezionati': {
                        'type': 'object',
                        'enabled': False
                    },
                    'esperienze_selezionate': {
                        'type': 'object',
                        'enabled': False
                    },
                    'status': {
                        'type': 'keyword'
                    },
                    'created_at': {
                        'type': 'date'
                    },
                    'updated_at': {
                        'type': 'date'
                    }
                },
                'dynamic': True
            }
        }
    }

    for index_name, mapping in indices.items():
        try:
            if not opensearch_client.indices.exists(index=index_name):
                opensearch_client.indices.create(index=index_name,
                                                 body=mapping)
                logger.info(f"📝 Created index: {index_name}")
        except Exception as e:
            logger.error(f"❌ Error creating index {index_name}: {e}")


class OpenSearchOperations:
    """Wrapper class for OpenSearch operations with mockup fallback"""

    @staticmethod
    def index_document(index, doc_id, body):
        """Index a document"""
        if opensearch_client:
            try:
                response = opensearch_client.index(index=index,
                                                   id=doc_id,
                                                   body=body,
                                                   refresh=True)
                return response
            except Exception as e:
                logger.error(f"OpenSearch index error: {e}")
                return OpenSearchOperations._mock_index(index, doc_id, body)
        else:
            return OpenSearchOperations._mock_index(index, doc_id, body)

    @staticmethod
    def search_documents(index, query=None, size=10):
        """Search documents"""
        if opensearch_client:
            try:
                body = {
                    'size': size,
                    'query': query if query else {
                        'match_all': {}
                    }
                }
                response = opensearch_client.search(index=index, body=body)
                return response
            except Exception as e:
                logger.error(f"OpenSearch search error: {e}")
                return OpenSearchOperations._mock_search(index, query, size)
        else:
            return OpenSearchOperations._mock_search(index, query, size)

    @staticmethod
    def get_document(index, doc_id):
        """Get a document by ID"""
        if opensearch_client:
            try:
                response = opensearch_client.get(index=index, id=doc_id)
                return response
            except Exception as e:
                logger.error(f"OpenSearch get error: {e}")
                return OpenSearchOperations._mock_get(index, doc_id)
        else:
            return OpenSearchOperations._mock_get(index, doc_id)

    @staticmethod
    def update_document(index, doc_id, body):
        """Update a document"""
        if opensearch_client:
            try:
                response = opensearch_client.update(index=index,
                                                    id=doc_id,
                                                    body={'doc': body},
                                                    refresh=True)
                return response
            except Exception as e:
                logger.error(f"OpenSearch update error: {e}")
                return OpenSearchOperations._mock_update(index, doc_id, body)
        else:
            return OpenSearchOperations._mock_update(index, doc_id, body)

    @staticmethod
    def delete_document(index, doc_id):
        """Delete a document"""
        if opensearch_client:
            try:
                response = opensearch_client.delete(index=index,
                                                    id=doc_id,
                                                    refresh=True)
                return response
            except Exception as e:
                logger.error(f"OpenSearch delete error: {e}")
                return OpenSearchOperations._mock_delete(index, doc_id)
        else:
            return OpenSearchOperations._mock_delete(index, doc_id)

    # Mockup implementations
    @staticmethod
    def _mock_index(index, doc_id, body):
        """Mock index operation"""
        if index not in mock_data:
            mock_data[index] = []

        doc = {
            '_id': doc_id,
            '_source': {
                **body, '_timestamp': datetime.utcnow().isoformat()
            }
        }

        # Remove existing document with same ID
        mock_data[index] = [d for d in mock_data[index] if d['_id'] != doc_id]
        mock_data[index].append(doc)

        return {
            '_index': index,
            '_id': doc_id,
            '_version': 1,
            'result': 'created'
        }

    @staticmethod
    def _mock_search(index, query, size):
        """Mock search operation"""
        if index not in mock_data:
            mock_data[index] = []

        hits = mock_data[index][:size]

        return {
            'hits': {
                'total': {
                    'value': len(mock_data[index])
                },
                'hits': hits
            }
        }

    @staticmethod
    def _mock_get(index, doc_id):
        """Mock get operation"""
        if index not in mock_data:
            raise Exception('Index not found')

        for doc in mock_data[index]:
            if doc['_id'] == doc_id:
                return doc

        raise Exception('Document not found')

    @staticmethod
    def _mock_update(index, doc_id, body):
        """Mock update operation"""
        if index not in mock_data:
            raise Exception('Index not found')

        for i, doc in enumerate(mock_data[index]):
            if doc['_id'] == doc_id:
                mock_data[index][i]['_source'].update(body)
                mock_data[index][i]['_source']['_timestamp'] = datetime.utcnow(
                ).isoformat()
                return {
                    '_index': index,
                    '_id': doc_id,
                    '_version': 2,
                    'result': 'updated'
                }

        raise Exception('Document not found')

    @staticmethod
    def _mock_delete(index, doc_id):
        """Mock delete operation"""
        if index not in mock_data:
            raise Exception('Index not found')

        original_length = len(mock_data[index])
        mock_data[index] = [d for d in mock_data[index] if d['_id'] != doc_id]

        if len(mock_data[index]) == original_length:
            raise Exception('Document not found')

        return {
            '_index': index,
            '_id': doc_id,
            '_version': 1,
            'result': 'deleted'
        }

    @staticmethod
    def ensure_index_exists(index_name, mapping=None):
        """Ensure an index exists, create if it doesn't"""
        if not opensearch_client:
            return False
        try:
            if not opensearch_client.indices.exists(index=index_name):
                print(f"Creating index: {index_name}")
                body = {}
                if mapping:
                    body["mappings"] = mapping
                opensearch_client.indices.create(index=index_name, body=body)
                print(f"Index {index_name} created successfully")
            return True
        except Exception as e:
            print(f"Error ensuring index {index_name} exists: {e}")
            return False


# Create instance for easy import
opensearch_ops = OpenSearchOperations()
