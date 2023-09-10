import http.server
import socketserver
import ssl

PORT = 9000
CERTIFICATE_PATH = './srv/server.crt'
PRIVATE_KEY_PATH = './srv/server.key'

Handler = http.server.SimpleHTTPRequestHandler

httpd = socketserver.TCPServer(("", PORT), Handler)
httpd.socket = ssl.wrap_socket(httpd.socket, keyfile=PRIVATE_KEY_PATH, certfile=CERTIFICATE_PATH, server_side=True)

print(f"Serving at https://localhost:{PORT}")
httpd.serve_forever()
