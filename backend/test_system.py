"""
HealWise Backend Testing Suite
Comprehensive testing for all backend endpoints and edge cases
"""

import sys
import asyncio
import json
import pytest
from typing import Dict, List
from fastapi.testclient import TestClient

# Add backend to path
sys.path.append('.')
from app import app

client = TestClient(app)

class HealWiseBackendTester:
    def __init__(self):
        self.test_results = []
        self.critical_errors = []
    
    def test_health_endpoint(self):
        """Test the health check endpoint"""
        print("🧪 Testing health endpoint...")
        
        response = client.get("/health")
        
        test_result = {
            "test": "Health endpoint",
            "status": "✅ PASS" if response.status_code == 200 else "❌ FAIL",
            "details": {
                "status_code": response.status_code,
                "response": response.json() if response.status_code == 200 else None
            }
        }
        self.test_results.append(test_result)
        return test_result
    
    def test_analyze_endpoint_normal_cases(self):
        """Test analyze endpoint with normal inputs"""
        print("🧪 Testing analyze endpoint - normal cases...")
        
        test_cases = [
            {"text": "I'm feeling great today!", "expected_status": 200},
            {"text": "I'm really struggling with anxiety", "expected_status": 200},
            {"text": "Everything is terrible and I can't cope", "expected_status": 200},
            {"text": "Just had an amazing day with friends", "expected_status": 200},
        ]
        
        for i, case in enumerate(test_cases):
            response = client.post("/analyze", json=case)
            
            test_result = {
                "test": f"Analyze normal case {i+1}",
                "status": "✅ PASS" if response.status_code == case["expected_status"] else "❌ FAIL",
                "details": {
                    "input": case["text"][:50] + "...",
                    "status_code": response.status_code,
                    "has_required_fields": self._check_response_fields(response) if response.status_code == 200 else False
                }
            }
            self.test_results.append(test_result)
    
    def test_analyze_endpoint_edge_cases(self):
        """Test analyze endpoint with edge cases"""
        print("🧪 Testing analyze endpoint - edge cases...")
        
        edge_cases = [
            {"text": "", "expected_status": 422, "description": "Empty text"},
            {"text": " " * 100, "expected_status": 200, "description": "Whitespace only"},
            {"text": "A" * 10000, "expected_status": 200, "description": "Very long text"},
            {"text": "🤔😊💭🌟", "expected_status": 200, "description": "Emoji only"},
            {"text": "\n\n\n", "expected_status": 200, "description": "Newlines only"},
        ]
        
        for case in edge_cases:
            try:
                response = client.post("/analyze", json=case)
                
                test_result = {
                    "test": f"Analyze edge case: {case['description']}",
                    "status": "✅ PASS" if response.status_code == case["expected_status"] else "❌ FAIL",
                    "details": {
                        "description": case["description"],
                        "expected_status": case["expected_status"],
                        "actual_status": response.status_code,
                        "text_length": len(case["text"])
                    }
                }
                self.test_results.append(test_result)
            except Exception as e:
                self.critical_errors.append({
                    "component": "analyze_endpoint",
                    "error": str(e),
                    "case": case["description"]
                })
    
    def test_analyze_endpoint_malformed_requests(self):
        """Test analyze endpoint with malformed requests"""
        print("🧪 Testing analyze endpoint - malformed requests...")
        
        malformed_cases = [
            {"request": None, "description": "Null request"},
            {"request": {}, "description": "Missing text field"},
            {"request": {"wrong_field": "value"}, "description": "Wrong field name"},
            {"request": {"text": None}, "description": "Null text value"},
            {"request": {"text": 123}, "description": "Non-string text"},
        ]
        
        for case in malformed_cases:
            try:
                response = client.post("/analyze", json=case["request"])
                
                test_result = {
                    "test": f"Malformed request: {case['description']}",
                    "status": "✅ PASS" if response.status_code in [400, 422] else "❌ FAIL",
                    "details": {
                        "description": case["description"],
                        "status_code": response.status_code,
                        "expected": "4xx error"
                    }
                }
                self.test_results.append(test_result)
            except Exception as e:
                self.critical_errors.append({
                    "component": "analyze_endpoint",
                    "error": str(e),
                    "case": case["description"]
                })
    
    def test_user_profile_header(self):
        """Test X-User-Profile header handling"""
        print("🧪 Testing user profile header...")
        
        profile_cases = [
            {
                "profile": {"personality": "creative", "botPersona": "friend"},
                "description": "Valid profile"
            },
            {
                "profile": "{invalid json}",
                "description": "Invalid JSON profile"
            },
            {
                "profile": None,
                "description": "No profile header"
            }
        ]
        
        for case in profile_cases:
            try:
                headers = {}
                if case["profile"] is not None:
                    if isinstance(case["profile"], dict):
                        headers["X-User-Profile"] = json.dumps(case["profile"])
                    else:
                        headers["X-User-Profile"] = case["profile"]
                
                response = client.post(
                    "/analyze", 
                    json={"text": "I'm feeling okay today"}, 
                    headers=headers
                )
                
                test_result = {
                    "test": f"User profile: {case['description']}",
                    "status": "✅ PASS" if response.status_code == 200 else "❌ FAIL",
                    "details": {
                        "description": case["description"],
                        "status_code": response.status_code,
                        "has_profile": case["profile"] is not None
                    }
                }
                self.test_results.append(test_result)
            except Exception as e:
                self.critical_errors.append({
                    "component": "user_profile",
                    "error": str(e),
                    "case": case["description"]
                })
    
    def test_concurrent_requests(self):
        """Test handling of concurrent requests"""
        print("🧪 Testing concurrent requests...")
        
        async def make_request():
            response = client.post("/analyze", json={"text": "Concurrent test message"})
            return response.status_code == 200
        
        try:
            # Simulate multiple concurrent requests
            results = []
            for _ in range(10):
                response = client.post("/analyze", json={"text": f"Concurrent test {_}"})
                results.append(response.status_code == 200)
            
            success_rate = sum(results) / len(results)
            
            test_result = {
                "test": "Concurrent requests",
                "status": "✅ PASS" if success_rate >= 0.8 else "❌ FAIL",
                "details": {
                    "success_rate": f"{success_rate:.2%}",
                    "successful_requests": sum(results),
                    "total_requests": len(results)
                }
            }
            self.test_results.append(test_result)
        except Exception as e:
            self.critical_errors.append({
                "component": "concurrent_requests",
                "error": str(e)
            })
    
    def _check_response_fields(self, response) -> bool:
        """Check if response has all required fields"""
        if response.status_code != 200:
            return False
        
        try:
            data = response.json()
            required_fields = ["probs", "risk", "supportive_message", "suggested_next_steps", "helpful_resources"]
            return all(field in data for field in required_fields)
        except:
            return False
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting HealWise Backend Test Suite...")
        
        self.test_health_endpoint()
        self.test_analyze_endpoint_normal_cases()
        self.test_analyze_endpoint_edge_cases()
        self.test_analyze_endpoint_malformed_requests()
        self.test_user_profile_header()
        self.test_concurrent_requests()
        
        # Generate report
        return self.generate_report()
    
    def generate_report(self) -> str:
        """Generate comprehensive test report"""
        passed = sum(1 for test in self.test_results if "PASS" in test["status"])
        failed = sum(1 for test in self.test_results if "FAIL" in test["status"])
        
        report = f"""
🧪 HealWise Backend Test Report
=============================
✅ Passed: {passed}
❌ Failed: {failed}
🚨 Critical Errors: {len(self.critical_errors)}

"""
        if self.critical_errors:
            report += "Critical Errors:\n"
            for error in self.critical_errors:
                report += f"• {error['component']}: {error['error']}\n"
            report += "\n"
        
        report += "Test Results:\n"
        for test in self.test_results:
            report += f"{test['status']} {test['test']}\n"
            if 'details' in test:
                for key, value in test['details'].items():
                    report += f"    {key}: {value}\n"
            report += "\n"
        
        return report

if __name__ == "__main__":
    tester = HealWiseBackendTester()
    report = tester.run_all_tests()
    print(report)
    
    # Save report to file
    with open("backend_test_report.txt", "w") as f:
        f.write(report)