#!/usr/bin/env python3
"""
Skill: performance-profiling
Script: lighthouse_audit.py
Purpose: Run Lighthouse performance audit on a URL
Usage: python lighthouse_audit.py https://example.com
Output: JSON with performance scores
Note: Requires lighthouse CLI (npm install -g lighthouse)
"""
import subprocess
import json
import sys
import os
import tempfile

def run_lighthouse(url: str) -> dict:
    """Run Lighthouse audit on URL."""
    try:
        with tempfile.NamedTemporaryFile(suffix='.json', delete=False) as f:
            output_path = f.name
        
        is_windows = sys.platform == "win32"
        result = subprocess.run(
            [
                "npx",
                "-y",
                "lighthouse",
                url,
                "--output=json",
                f"--output-path={output_path}",
                "--chrome-flags=--headless",
                "--only-categories=performance,accessibility,best-practices,seo",
                "--no-enable-error-reporting",
                "--quiet"
            ],
            capture_output=True,
            text=True,
            timeout=300,
            shell=is_windows
        )
        
        if os.path.exists(output_path):
            with open(output_path, 'r', encoding='utf-8') as f:
                report = json.load(f)
            os.unlink(output_path)
            
            categories = report.get("categories", {})
            def safe_score(cat_name):
                cat = categories.get(cat_name, {})
                score = cat.get("score")
                return int(score * 100) if score is not None else 0

            return {
                "url": url,
                "scores": {
                    "performance": safe_score("performance"),
                    "accessibility": safe_score("accessibility"),
                    "best_practices": safe_score("best-practices"),
                    "seo": safe_score("seo")
                },
                "summary": get_summary(categories)
            }
        else:
            return {"error": "Lighthouse failed to generate report", "stderr": result.stderr[:500]}
            
    except subprocess.TimeoutExpired:
        return {"error": "Lighthouse audit timed out"}
    except FileNotFoundError:
        return {"error": "Lighthouse CLI not found. Install with: npm install -g lighthouse"}

def get_summary(categories: dict) -> str:
    """Generate summary based on scores."""
    score = categories.get("performance", {}).get("score")
    perf = int(score * 100) if score is not None else 0
    if perf >= 90:
        return "[OK] Excellent performance"
    elif perf >= 50:
        return "[!] Needs improvement"
    else:
        return "[X] Poor performance"

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python lighthouse_audit.py <url>"}))
        sys.exit(1)
    
    result = run_lighthouse(sys.argv[1])
    print(json.dumps(result, indent=2))
