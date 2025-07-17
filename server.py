import http.server
import socketserver
import os
import mimetypes
from pathlib import Path

# Configuration
PORT = 5000
HOST = "localhost"
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))

# Ensure proper MIME type handling
mimetypes.add_type("text/javascript", ".js")
mimetypes.add_type("text/css", ".css")
mimetypes.add_type("image/webp", ".webp")
mimetypes.add_type("font/ttf", ".ttf")

class EkatmaHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    # Override default directory for serving files
    def translate_path(self, path):
        # Normalize path and strip query string
        path = path.split('?', 1)[0]
        path = path.split('#', 1)[0]
        path = os.path.normpath(path)

        # Convert to system path
        words = path.split('/')
        words = filter(None, words)  # Remove empty components

        path = ROOT_DIR
        for word in words:
            if os.path.dirname(word) or word in (os.curdir, os.pardir):
                # Ignore components that might navigate outside root
                continue
            path = os.path.join(path, word)

        return path

    def end_headers(self):
        # Add headers to prevent caching for JavaScript and static files
        path = self.path.lower()
        if path.endswith('.js') or path.startswith('/static/'):
            self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')

        # Add Cross-Origin headers for local development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

        super().end_headers()

    def do_GET(self):
        # Handle default routes (/ and /blogs/)
        if self.path == '/' or self.path == '/blogs/':
            # Check for index.html
            index_path = os.path.join(ROOT_DIR,
                                     'index.html' if self.path == '/' else 'blogs/index.html')

            if os.path.exists(index_path):
                self.path = '/index.html' if self.path == '/' else '/blogs/index.html'

        try:
            super().do_GET()
        except FileNotFoundError:
            self.send_error_page(404)

    def send_error_page(self, error_code):
        """Send a custom error page"""
        error_page = os.path.join(ROOT_DIR, '404.html')

        if os.path.exists(error_page):
            self.send_response(error_code)
            self.send_header('Content-type', 'text/html')
            self.end_headers()

            with open(error_page, 'rb') as file:
                self.wfile.write(file.read())
        else:
            self.send_error(error_code)

    def log_message(self, format, *args):
        # More informative logging
        path = self.path
        status = args[1]
        size = args[2]

        # Color coding for status codes
        if status.startswith('2'):  # Success
            status_color = '\033[92m'  # Green
        elif status.startswith('3'):  # Redirect
            status_color = '\033[93m'  # Yellow
        elif status.startswith('4') or status.startswith('5'):  # Client/Server Error
            status_color = '\033[91m'  # Red
        else:
            status_color = '\033[0m'  # Default

        reset_color = '\033[0m'

        print(f"{self.address_string()} - [{self.log_date_time_string()}] "
              f"\"{self.requestline}\" {status_color}{status}{reset_color} {size}")

def run_server():
    handler = EkatmaHTTPRequestHandler

    try:
        socketserver.TCPServer.allow_reuse_address = True
        with socketserver.TCPServer((HOST, PORT), handler) as httpd:
            server_url = f"http://{HOST}:{PORT}"
            print(f"✨ Ekatma server running at {server_url}")
            print(f"📂 Serving from: {ROOT_DIR}")
            print(f"🛑 Press Ctrl+C to stop the server")
            print(f"🔍 Custom 404 page enabled")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except OSError as e:
        if e.errno == 98:  # Address already in use
            print(f"❌ Error: Port {PORT} is already in use")
            print(f"💡 Try changing the PORT value in the script")
        else:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    run_server()
