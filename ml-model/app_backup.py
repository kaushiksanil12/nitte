"""
Feature extraction from raw URL and network logs
All preprocessing happens in ML service
"""

import json
from urllib.parse import urlparse
from collections import Counter
import math
import re

class FeatureExtractor:
    """Extract 30 features from raw URL and Chrome network logs"""
    
    SUSPICIOUS_TLDS = ['.tk', '.ga', '.cf', '.ml', '.gq', '.xyz', '.top', '.pw']
    SUSPICIOUS_KEYWORDS = ['login', 'verify', 'account', 'secure', 'update', 'confirm', 'banking']
    
    def extract_features_from_raw(self, url, network_logs):
        """
        Main method: Extract all features from raw data
        
        Args:
            url: String - the visited URL
            network_logs: List[dict] - Chrome performance logs
        
        Returns:
            List[float] - 30 feature values in fixed order
        """
        # Extract features
        url_features = self._extract_url_features(url)
        network_features = self._extract_network_features(network_logs)
        
        # Combine all features
        all_features = {**url_features, **network_features}
        
        # Return as ordered list (same order as training)
        feature_order = [
            # URL features (10)
            'url_length', 'domain_length', 'path_length', 'has_https', 'has_ip',
            'subdomain_count', 'special_char_count', 'digit_count', 'url_entropy', 'suspicious_tld',
            
            # Network features (20)
            'total_requests', 'unique_domains', 'external_domain_ratio',
            'avg_response_time', 'max_response_time',
            'has_tls_13', 'secure_request_ratio',
            'http2_ratio', 'http3_ratio',
            'redirect_count', 'error_count', 'success_ratio',
            'script_count', 'image_count', 'css_count', 'script_ratio',
            'total_data_kb', 'avg_data_size_kb',
            'cookie_count', 'has_cookies'
        ]
        
        return [all_features.get(key, 0.0) for key in feature_order]
    
    def _extract_url_features(self, url):
        """Extract 10 features from URL string"""
        parsed = urlparse(url)
        domain = parsed.netloc
        path = parsed.path
        
        features = {
            'url_length': len(url),
            'domain_length': len(domain),
            'path_length': len(path),
            'has_https': 1 if parsed.scheme == 'https' else 0,
            'has_ip': 1 if self._has_ip_address(domain) else 0,
            'subdomain_count': max(0, domain.count('.') - 1),
            'special_char_count': len([c for c in url if not c.isalnum() and c not in [':', '/', '.']]),
            'digit_count': len([c for c in url if c.isdigit()]),
            'url_entropy': self._calculate_entropy(url),
            'suspicious_tld': 1 if any(url.lower().endswith(tld) for tld in self.SUSPICIOUS_TLDS) else 0
        }
        
        return features
    
    def _extract_network_features(self, logs):
        """Extract 20 features from Chrome network logs"""
        
        if not logs or not isinstance(logs, list):
            return self._get_empty_network_features()
        
        # Parse all logs
        requests = []
        responses = []
        domains = set()
        protocols = []
        status_codes = []
        content_types = []
        security_details = []
        timing_data = []
        cookies = []
        data_sizes = []
        
        for log in logs:
            try:
                msg = log.get('message', {})
                method = msg.get('method', '')
                params = msg.get('params', {})
                
                # Parse requests
                if 'requestWillBeSent' in method:
                    request = params.get('request', {})
                    url_str = request.get('url', '')
                    
                    if url_str:
                        parsed = urlparse(url_str)
                        if parsed.netloc:
                            domains.add(parsed.netloc)
                        requests.append(request)
                
                # Parse responses
                if 'responseReceived' in method:
                    response = params.get('response', {})
                    
                    # Status code
                    status = response.get('status', 0)
                    if status > 0:
                        status_codes.append(status)
                    
                    # Protocol
                    protocol = response.get('protocol', '')
                    if protocol:
                        protocols.append(protocol)
                    
                    # Security
                    sec_details = response.get('securityDetails', {})
                    if sec_details:
                        security_details.append(sec_details)
                    
                    # Timing
                    timing = response.get('timing', {})
                    if timing:
                        timing_data.append(timing)
                    
                    # Content type
                    headers = response.get('headers', {})
                    ct = headers.get('content-type', headers.get('Content-Type', ''))
                    if ct:
                        content_types.append(ct.lower())
                    
                    # Data size
                    encoded_size = response.get('encodedDataLength', 0)
                    if encoded_size > 0:
                        data_sizes.append(encoded_size)
                
                # Data received
                if 'dataReceived' in method:
                    data_len = params.get('dataLength', 0)
                    if data_len > 0:
                        data_sizes.append(data_len)
                
                # Cookies
                if 'Cookie' in str(params) or 'cookie' in str(params).lower():
                    cookies.append(params)
                    
            except Exception as e:
                continue
        
        # Calculate features
        total_requests = len(requests)
        unique_domains = len(domains)
        
        # Timing statistics
        response_times = [t.get('receiveHeadersEnd', 0) for t in timing_data if t.get('receiveHeadersEnd', 0) > 0]
        avg_response_time = sum(response_times) / len(response_times) if response_times else 0
        max_response_time = max(response_times) if response_times else 0
        
        # Security
        has_tls_13 = sum(1 for s in security_details if 'TLS 1.3' in str(s.get('protocol', '')))
        total_secure = len(security_details)
        
        # Protocols
        h2_count = sum(1 for p in protocols if p == 'h2')
        h3_count = sum(1 for p in protocols if p in ['h3', 'quic'])
        
        # Status codes
        redirect_count = sum(1 for s in status_codes if 300 <= s < 400)
        error_count = sum(1 for s in status_codes if s >= 400)
        success_count = sum(1 for s in status_codes if 200 <= s < 300)
        
        # Content types
        script_count = sum(1 for ct in content_types if 'javascript' in ct or 'script' in ct)
        image_count = sum(1 for ct in content_types if 'image' in ct)
        css_count = sum(1 for ct in content_types if 'css' in ct)
        
        # Data
        total_data = sum(data_sizes)
        avg_data_size = total_data / len(data_sizes) if data_sizes else 0
        
        return {
            'total_requests': total_requests,
            'unique_domains': unique_domains,
            'external_domain_ratio': (unique_domains - 1) / unique_domains if unique_domains > 1 else 0,
            'avg_response_time': avg_response_time,
            'max_response_time': max_response_time,
            'has_tls_13': 1 if has_tls_13 > 0 else 0,
            'secure_request_ratio': total_secure / total_requests if total_requests > 0 else 0,
            'http2_ratio': h2_count / total_requests if total_requests > 0 else 0,
            'http3_ratio': h3_count / total_requests if total_requests > 0 else 0,
            'redirect_count': redirect_count,
            'error_count': error_count,
            'success_ratio': success_count / len(status_codes) if status_codes else 0,
            'script_count': script_count,
            'image_count': image_count,
            'css_count': css_count,
            'script_ratio': script_count / total_requests if total_requests > 0 else 0,
            'total_data_kb': total_data / 1024.0,
            'avg_data_size_kb': avg_data_size / 1024.0,
            'cookie_count': len(cookies),
            'has_cookies': 1 if len(cookies) > 0 else 0
        }
    
    def _get_empty_network_features(self):
        """Return zero values when no network logs available"""
        return {
            'total_requests': 0, 'unique_domains': 0, 'external_domain_ratio': 0,
            'avg_response_time': 0, 'max_response_time': 0,
            'has_tls_13': 0, 'secure_request_ratio': 0,
            'http2_ratio': 0, 'http3_ratio': 0,
            'redirect_count': 0, 'error_count': 0, 'success_ratio': 0,
            'script_count': 0, 'image_count': 0, 'css_count': 0, 'script_ratio': 0,
            'total_data_kb': 0, 'avg_data_size_kb': 0,
            'cookie_count': 0, 'has_cookies': 0
        }
    
    def _has_ip_address(self, domain):
        """Check if domain is an IP address"""
        ip_pattern = r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$'
        return bool(re.match(ip_pattern, domain))
    
    def _calculate_entropy(self, text):
        """Calculate Shannon entropy of text"""
        if not text:
            return 0.0
        counter = Counter(text)
        length = len(text)
        entropy = -sum((count / length) * math.log2(count / length) for count in counter.values())
        return entropy
