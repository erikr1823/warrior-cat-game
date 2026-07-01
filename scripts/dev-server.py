"""Local dev static server with no-cache headers for ES module development."""
import http.server
import socketserver
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8765


class DevHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Pragma", "no-cache")
        super().end_headers()


if __name__ == "__main__":
    with socketserver.TCPServer(("", PORT), DevHTTPRequestHandler) as httpd:
        print(f"Serving at http://localhost:{PORT}", flush=True)
        print("JS modules are served with no-cache headers.", flush=True)
        httpd.serve_forever()
