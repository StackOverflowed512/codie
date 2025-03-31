from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from models import db, init_db
from auth import auth_bp
from problems import problems_bp
import os

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    # Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///leetcode.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET', 'super-secret-key')
    
    # Initialize extensions
    db.init_app(app)
    JWTManager(app)
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(problems_bp, url_prefix='/api')
    
    return app

if __name__ == '__main__':
    app = create_app()
    init_db(app)  # Initialize database tables
    app.run(debug=True)