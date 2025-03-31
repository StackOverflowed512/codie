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

def parse_similar_questions(similar_str):
    if not similar_str or pd.isna(similar_str):
        return []
    try:
        similar_str = similar_str.replace("'", '"')
        return json.loads(similar_str)
    except json.JSONDecodeError:
        return []

def load_problems_from_csv(page=1, per_page=50, difficulty_filter="All", status_filter=None, user_id=None):
    csv_path = os.path.join(os.path.dirname(__file__), 'problems.csv')
    try:
        df = pd.read_csv(csv_path)
        
        # Get completed problem IDs if status filter is active
        completed_ids = set()
        if status_filter and user_id:
            completed = CompletedProblem.query.filter_by(user_id=user_id).all()
            completed_ids = {c.problem_id for c in completed}
            
            if status_filter == "solved":
                df = df[df['id'].isin(completed_ids)]
            elif status_filter == "unsolved":
                df = df[~df['id'].isin(completed_ids)]
        
        # Apply difficulty filter
        if difficulty_filter != "All":
            df = df[df['difficulty'] == difficulty_filter]
        
        total_problems = len(df)
        total_pages = math.ceil(total_problems / per_page)
        
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        df = df.iloc[start_idx:end_idx]
        
        df = df.replace({np.nan: None})
        
        problems = df[['id', 'title', 'description', 'difficulty', 'acceptance_rate']].copy()
        problems = problems.to_dict('records')
        
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
@jwt_required(optional=True)
def get_problems():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    difficulty = request.args.get('difficulty', 'All')
    status = request.args.get('status', None)
    
    user_id = None
    if get_jwt_identity():
        current_user = User.query.filter_by(username=get_jwt_identity()).first()
        user_id = current_user.id if current_user else None
    
    result = load_problems_from_csv(
        page=page,
        per_page=per_page,
        difficulty_filter=difficulty,
        status_filter=status,
        user_id=user_id
    )
    return jsonify(result)

@problems_bp.route('/problems/<int:problem_id>', methods=['GET'])
def get_problem(problem_id):
    csv_path = os.path.join(os.path.dirname(__file__), 'problems.csv')
    try:
        df = pd.read_csv(csv_path)
        df = df.replace({np.nan: None})
        
        problem = df[df['id'] == problem_id].to_dict('records')
        
        if not problem:
            return jsonify({'error': 'Problem not found'}), 404
        
        similar_questions = parse_similar_questions(problem[0].get('similar_questions'))
        
        cleaned_problem = {
            'id': int(problem[0]['id']),
            'title': str(problem[0]['title']),
            'description': str(problem[0]['description']),
            'difficulty': str(problem[0]['difficulty']),
            'acceptance_rate': float(problem[0]['acceptance_rate']) if problem[0]['acceptance_rate'] else None,
            'likes': int(problem[0]['likes']) if problem[0]['likes'] else 0,
            'dislikes': int(problem[0]['dislikes']) if problem[0]['dislikes'] else 0,
            'similar_questions': similar_questions
        }
        
        return jsonify(cleaned_problem)
    except Exception as e:
        print(f"Error fetching problem: {e}")
        return jsonify({'error': 'Failed to fetch problem'}), 500

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