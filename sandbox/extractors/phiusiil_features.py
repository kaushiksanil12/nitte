"""
Extract 54 PhiUSIIL-compatible features from sandbox data
Maps URL, HTML, and network logs to PhiUSIIL feature set
"""

from urllib.parse import urlparse
import re
import tldextract

class PhiUSIILFeatureExtractor:
    """Extract 54 features matching PhiUSIIL dataset format"""
    
    def extract_all_features(self, url, html_content, network_logs):
        """
        Extract all 54 features from sandbox outputs
        
        Args:
            url: The URL string
            html_content: Captured HTML
            network_logs: Network requests (like your paste.txt)
        
        Returns:
            List of 54 float values in correct order
        """
        # Combine all feature sets
        url_features = self._extract_url_features(url)
        network_features = self._extract_network_features(network_logs)
        html_features = self._extract_html_features(html_content)
        
        # Return in exact PhiUSIIL order (54 features)
        return [
            url_features['qty_dot_url'],
            url_features['qty_hyphen_url'],
            url_features['qty_underline_url'],
            url_features['qty_slash_url'],
            url_features['qty_questionmark_url'],
            url_features['qty_equal_url'],
            url_features['qty_at_url'],
            url_features['qty_and_url'],
            url_features['qty_exclamation_url'],
            url_features['qty_space_url'],
            url_features['qty_tilde_url'],
            url_features['qty_comma_url'],
            url_features['qty_plus_url'],
            url_features['qty_asterisk_url'],
            url_features['qty_hashtag_url'],
            url_features['qty_dollar_url'],
            url_features['qty_percent_url'],
            url_features['qty_dot_domain'],
            url_features['qty_hyphen_domain'],
            url_features['qty_underline_domain'],
            url_features['qty_vowels_domain'],
            url_features['url_length'],
            url_features['domain_length'],
            url_features['tld_length'],
            url_features['qty_ip_resolved'],
            network_features['time_response'],
            network_features['qty_redirects'],
            network_features['qty_external_redirection'],
            network_features['qty_ssl'],
            html_features['qty_forms'],
            html_features['qty_iframes'],
            html_features['qty_external_links'],
            # ... continue for all 54 features
        ]
    
    def _extract_url_features(self, url):
        """Extract features from URL string"""
        parsed = urlparse(url)
        extracted = tldextract.extract(url)
        
        return {
            'qty_dot_url': url.count('.'),
            'qty_hyphen_url': url.count('-'),
            'qty_underline_url': url.count('_'),
            'qty_slash_url': url.count('/'),
            'qty_questionmark_url': url.count('?'),
            'qty_equal_url': url.count('='),
            'qty_at_url': url.count('@'),
            'qty_and_url': url.count('&'),
            'qty_exclamation_url': url.count('!'),
            'qty_space_url': url.count(' '),
            'qty_tilde_url': url.count('~'),
            'qty_comma_url': url.count(','),
            'qty_plus_url': url.count('+'),
            'qty_asterisk_url': url.count('*'),
            'qty_hashtag_url': url.count('#'),
            'qty_dollar_url': url.count('$'),
            'qty_percent_url': url.count('%'),
            'qty_dot_domain': parsed.netloc.count('.'),
            'qty_hyphen_domain': parsed.netloc.count('-'),
            'qty_underline_domain': parsed.netloc.count('_'),
            'qty_vowels_domain': len(re.findall(r'[aeiouAEIOU]', parsed.netloc)),
            'url_length': len(url),
            'domain_length': len(parsed.netloc),
            'tld_length': len(extracted.suffix),
            'qty_ip_resolved': 1 if re.search(r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', url) else 0,
        }
    
    def _extract_network_features(self, logs):
        """Extract features from network logs (your paste.txt format)"""
        redirects = 0
        external_redirects = 0
        has_ssl = 0
        total_time = 0
        
        for log in logs:
            try:
                message = log.get('message', {})
                method = message.get('method', '')
                params = message.get('params', {})
                
                # Count redirects
                if 'responseReceived' in method:
                    status = params.get('response', {}).get('status', 0)
                    if 300 <= status < 400:
                        redirects += 1
                
                # Check SSL
                if 'https://' in str(params):
                    has_ssl = 1
                
                # Calculate response time
                if 'timestamp' in params:
                    total_time += params['timestamp']
                    
            except Exception as e:
                continue
        
        return {
            'time_response': total_time / len(logs) if logs else 0,
            'qty_redirects': redirects,
            'qty_external_redirection': external_redirects,
            'qty_ssl': has_ssl,
        }
    
    def _extract_html_features(self, html_content):
        """Extract features from HTML content"""
        return {
            'qty_forms': html_content.count('<form'),
            'qty_iframes': html_content.count('<iframe'),
            'qty_external_links': len(re.findall(r'href="http', html_content)),
            'qty_scripts': html_content.count('<script'),
        }
