#!/usr/bin/env python3
"""Project-local, dependency-free source preview using the libraries in .tools/.

Serves only portfolio assets, never the repository or arbitrary local files.
Normal development and production builds continue to use npm/webpack.
"""
import argparse
import fcntl
import mimetypes
import socket
import struct
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
VENDORS = {
    '/vendor/three.js': ROOT / '.tools/three/build/three.module.js',
    '/vendor/howler.js': ROOT / '.tools/howler/dist/howler.js',
}


def asset(path):
    """Return (bytes, content type), or None for paths outside the allowlist."""
    path = unquote(urlsplit(path).path)
    if path in ('/', '/index.html'):
        html = (ROOT / 'src/index.html').read_text()
        additions = '''<link rel="stylesheet" href="/src/style.css">
<script type="importmap">{"imports":{"three":"/vendor/three.js","gsap":"/vendor/gsap/index.js","howler":"/vendor/howler-wrapper.js"}}</script>
<script src="/vendor/howler.js"></script><script type="module" src="/src/script.js"></script>'''
        return html.replace('</head>', additions + '</head>').encode(), 'text/html; charset=utf-8'
    if path == '/vendor/howler-wrapper.js':
        return b'export const Howl = window.Howl;', 'text/javascript'
    file = VENDORS.get(path)
    if file is None:
        for prefix, folder, suffixes in [
            ('/src/', ROOT / 'src', {'.js', '.mjs', '.css'}),
            ('/vendor/gsap/', ROOT / '.tools/gsap/esm', {'.js'}),
            ('/sounds/', ROOT / 'static/sounds', {'.mp3'}),
            ('/certifications/', ROOT / 'static/certifications', {'.png', '.jpg', '.jpeg', '.webp', '.svg'}),
        ]:
            if path.startswith(prefix):
                candidate = (folder / path[len(prefix):]).resolve()
                if candidate.is_relative_to(folder.resolve()) and candidate.suffix in suffixes:
                    file = candidate
                break
    if file is None or not file.is_file():
        return None
    data = file.read_bytes()
    if path == '/src/script.js':
        data = data.replace(b"import './style.css';", b'')
    mime = 'text/javascript' if file.suffix in ('.js', '.mjs') else mimetypes.guess_type(str(file))[0]
    return data, mime or 'application/octet-stream'


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        result = asset(self.path)
        if result is None:
            self.send_error(404)
            return
        data, content_type = result
        self.send_response(200)
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', str(len(data)))
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(data)


def interface_ip(name):
    if len(name.encode()) > 15:
        raise ValueError('Interface name is too long')
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
        result = fcntl.ioctl(sock.fileno(), 0x8915, struct.pack('256s', name.encode()))
        return socket.inet_ntoa(result[20:24])


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--interface', help='Bind only to this interface’s IPv4 address')
    parser.add_argument('--host', default='127.0.0.1')
    parser.add_argument('--port', type=int, default=8080)
    args = parser.parse_args()
    required = [*VENDORS.values(), ROOT / '.tools/gsap/esm/index.js']
    missing = [str(path.relative_to(ROOT)) for path in required if not path.is_file()]
    if missing:
        parser.error('Missing local preview dependencies: ' + ', '.join(missing))
    host = interface_ip(args.interface) if args.interface else args.host
    server = ThreadingHTTPServer((host, args.port), Handler)
    print(f'Portfolio preview: http://{host}:{args.port}', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == '__main__':
    main()
