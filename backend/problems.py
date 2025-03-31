from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
import pandas as pd
import numpy as np
import json
import os
import math
from datetime import datetime
from models import db, CompletedProblem, User

problems_bp = Blueprint('problems', __name__)

def load_problems_from_csv(page=1, per_page=50):
    csv_path = os.path.join(os.path.dirname(__file__), 'problems.csv')
    try:
        # Read CSV with specific columns
        df = pd.read_csv(csv_path)
        
        # Calculate total pages
        total_problems = len(df)
        total_pages = math.ceil(total_problems / per_page)
        
        # Apply pagination
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        df = df.iloc[start_idx:end_idx]
        
        # Convert NaN values to None
        df = df.replace({np.nan: None})
        
        # Select and rename relevant columns
        problems = df[['id', 'title', 'description', 'difficulty', 'acceptance_rate']].copy()
        
        # Convert to list of dictionaries and clean data
        problems = problems.to_dict('records')
        
        # Clean up data
        for problem in problems:
            problem['id'] = int(problem['id'])
            problem['title'] = str(problem['title'])
            problem['description'] = str(problem['description'])
            problem['difficulty'] = str(problem['difficulty'])
            problem['acceptance_rate'] = float(problem['acceptance_rate']) if problem['acceptance_rate'] else None
            
        return {
            'problems': problems,
            'total_pages': total_pages,
            'current_page': page,
            'total_problems': total_problems
        }
    except Exception as e:
        print(f"Error loading problems: {e}")
        return {'problems': [], 'total_pages': 0, 'current_page': 1, 'total_problems': 0}

@problems_bp.route('/problems', methods=['GET'])
def get_problems():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    result = load_problems_from_csv(page, per_page)
    return jsonify(result)

@problems_bp.route('/problems/completed', methods=['GET'])
@jwt_required()
def get_completed_problems():
    current_user = User.query.filter_by(username=get_jwt_identity()).first()
    completed = CompletedProblem.query.filter_by(user_id=current_user.id).all()
    completed_ids = [c.problem_id for c in completed]
    return jsonify(completed_ids)

@problems_bp.route('/problems/<int:problem_id>/complete', methods=['POST'])
@jwt_required()
def mark_problem_complete(problem_id):
    try:
        current_user = User.query.filter_by(username=get_jwt_identity()).first()
        if not current_user:
            return jsonify({'error': 'User not found'}), 404

        # Check if already completed
        existing = CompletedProblem.query.filter_by(
            user_id=current_user.id,
            problem_id=problem_id
        ).first()

        if not existing:
            completed = CompletedProblem(
                user_id=current_user.id,
                problem_id=problem_id,
                completed_at=datetime.utcnow()
            )
            db.session.add(completed)
            db.session.commit()

        return jsonify({
            'message': 'Problem marked as completed',
            'problem_id': problem_id,
            'completed': True
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@problems_bp.route('/problems/<int:problem_id>/uncomplete', methods=['DELETE'])
@jwt_required()
def mark_problem_incomplete(problem_id):
    current_user = User.query.filter_by(username=get_jwt_identity()).first()
    CompletedProblem.query.filter_by(
        user_id=current_user.id, 
        problem_id=problem_id
    ).delete()
    db.session.commit()
    return jsonify({'message': 'Problem marked as incomplete'})

@problems_bp.route('/problems/<int:problem_id>', methods=['GET'])
def get_problem(problem_id):
    csv_path = os.path.join(os.path.dirname(__file__), 'problems.csv')
    try:
        # Read CSV file
        df = pd.read_csv(csv_path)
        
        # Convert NaN values to None/null
        df = df.replace({np.nan: None})
        
        # Find the problem by ID
        problem = df[df['id'] == problem_id].to_dict('records')
        
        if not problem:
            return jsonify({'error': 'Problem not found'}), 404
        
        # Clean the data before sending
        cleaned_problem = {
            'id': int(problem[0]['id']),
            'title': str(problem[0]['title']),
            'description': str(problem[0]['description']),
            'difficulty': str(problem[0]['difficulty']),
            'acceptance_rate': float(problem[0]['acceptance_rate']) if problem[0]['acceptance_rate'] else None,
            'likes': int(problem[0]['likes']) if problem[0]['likes'] else 0,
            'dislikes': int(problem[0]['dislikes']) if problem[0]['dislikes'] else 0
        }
        
        # Handle similar questions if present
        if problem[0]['similar_questions']:
            try:
                similar_questions = json.loads(problem[0]['similar_questions'].replace("'", '"'))
                cleaned_problem['similar_questions'] = similar_questions
            except:
                cleaned_problem['similar_questions'] = []
                
        return jsonify(cleaned_problem)
        
    except Exception as e:
        print(f"Error fetching problem: {e}")
        return jsonify({'error': 'Failed to fetch problem'}), 500