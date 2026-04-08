#!/usr/bin/env python3
"""
Missing Person Face Recognition Script
=======================================
Usage: python match_face.py <query_image_path> <dataset_dir>
Output: JSON to stdout
"""

import sys
import os
import json
import re

def extract_meta(filename):
    """Extract camera ID and time from filename like cam1_10am.jpg"""
    base = os.path.splitext(os.path.basename(filename))[0]
    # Pattern: cam<id>_<time>
    match = re.match(r'(cam\d+)_(.+)', base, re.IGNORECASE)
    if match:
        cam = match.group(1).lower()
        raw_time = match.group(2)
        # Format time nicely: 10am -> 10:00 AM, 230pm -> 2:30 PM
        t = format_time(raw_time)
        return cam, t
    return base, 'Unknown'

def format_time(raw):
    """Convert raw time strings like '10am', '230pm', '10_30am' to '10:00 AM'"""
    raw = raw.replace('_', '').lower().strip()
    ampm = 'AM'
    if raw.endswith('pm'):
        ampm = 'PM'
        raw = raw[:-2]
    elif raw.endswith('am'):
        raw = raw[:-2]

    if len(raw) <= 2:
        return f"{raw}:00 {ampm}"
    elif len(raw) == 3:
        return f"{raw[0]}:{raw[1:]}{' '}{ampm}"
    elif len(raw) == 4:
        return f"{raw[:2]}:{raw[2:]} {ampm}"
    return f"{raw} {ampm}"

def time_to_minutes(t):
    """Convert '10:00 AM' to minutes for sorting"""
    try:
        parts = t.split()
        if len(parts) < 2:
            return 0
        hm, meridiem = parts[0], parts[1]
        h, m = map(int, hm.split(':'))
        if meridiem == 'PM' and h != 12:
            h += 12
        if meridiem == 'AM' and h == 12:
            h = 0
        return h * 60 + m
    except:
        return 0

def run_matching(query_path, dataset_dir):
    try:
        import face_recognition
        import numpy as np
    except ImportError:
        return {
            'error': 'face_recognition not installed',
            'install': 'pip install face_recognition'
        }

    # Load query image
    try:
        query_image = face_recognition.load_image_file(query_path)
    except Exception as e:
        return {'error': f'Cannot load query image: {str(e)}'}

    query_encodings = face_recognition.face_encodings(query_image)
    if not query_encodings:
        return {'error': 'no_face', 'message': 'No face detected in the uploaded image'}

    query_encoding = query_encodings[0]

    # Process dataset
    dataset_files = [
        f for f in os.listdir(dataset_dir)
        if f.lower().endswith(('.jpg', '.jpeg', '.png'))
    ]

    if not dataset_files:
        return {'error': 'empty_dataset', 'message': 'No images found in dataset'}

    matches = []
    errors = []

    for filename in dataset_files:
        filepath = os.path.join(dataset_dir, filename)
        try:
            img = face_recognition.load_image_file(filepath)
            encodings = face_recognition.face_encodings(img)

            if not encodings:
                continue  # No face in this dataset image

            for enc in encodings:
                distance = face_recognition.face_distance([query_encoding], enc)[0]
                is_match = face_recognition.compare_faces([query_encoding], enc, tolerance=0.55)[0]

                if is_match:
                    cam, time = extract_meta(filename)
                    confidence = round((1 - distance) * 100, 1)
                    matches.append({
                        'file': filename,
                        'camera': cam,
                        'time': time,
                        'distance': round(float(distance), 4),
                        'confidence': confidence,
                    })
        except Exception as e:
            errors.append({'file': filename, 'error': str(e)})

    if not matches:
        return {
            'status': 'not_found',
            'message': 'Person not found in any CCTV footage',
            'matches': [],
            'lastSeen': None,
            'errors': errors
        }

    # Sort by time
    matches.sort(key=lambda m: time_to_minutes(m['time']))

    # Last seen = latest match
    last_seen = matches[-1].copy()

    return {
        'status': 'found',
        'mode': 'ai',
        'matchCount': len(matches),
        'matches': matches,
        'lastSeen': last_seen,
        'errors': errors
    }

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print(json.dumps({'error': 'Usage: python match_face.py <query_image> <dataset_dir>'}))
        sys.exit(1)

    query_path = sys.argv[1]
    dataset_dir = sys.argv[2]

    if not os.path.exists(query_path):
        print(json.dumps({'error': f'Query image not found: {query_path}'}))
        sys.exit(1)

    if not os.path.isdir(dataset_dir):
        print(json.dumps({'error': f'Dataset directory not found: {dataset_dir}'}))
        sys.exit(1)

    result = run_matching(query_path, dataset_dir)
    print(json.dumps(result))
