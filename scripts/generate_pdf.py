import os
import sys
import time
import asyncio
import threading
from http.server import SimpleHTTPRequestHandler
from socketserver import TCPServer
from pyppeteer import launch

PORT = 8999
DIRECTORY = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

class ThreadedHTTPServer:
    def __init__(self, port, directory):
        self.port = port
        self.directory = directory
        self.server = None
        self.thread = None

    def start(self):
        # Serve files from the workspace directory
        class Handler(SimpleHTTPRequestHandler):
            def __init__(self, *args, **kwargs):
                super().__init__(*args, directory=DIRECTORY, **kwargs)

        TCPServer.allow_reuse_address = True
        self.server = TCPServer(("", self.port), Handler)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        print(f"Temporary server started at http://localhost:{self.port} serving {self.directory}")

    def stop(self):
        if self.server:
            self.server.shutdown()
            self.server.server_close()
            print("Temporary server stopped.")

async def generate_pdf():
    # Start temporary local HTTP server to avoid local file path origin restrictions
    server = ThreadedHTTPServer(PORT, DIRECTORY)
    server.start()

    time.sleep(1) # Wait for server to bind

    url = f"http://localhost:{PORT}/research/probaseball-go-analysis-ko.html"
    output_pdf = os.path.join(DIRECTORY, "data", "probaseball-go-analysis-ko.pdf")
    
    # Ensure target directory exists
    os.makedirs(os.path.dirname(output_pdf), exist_ok=True)

    print(f"Launching browser to open {url}...")
    browser = await launch(
        executablePath=r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        headless=True,
        args=['--no-sandbox', '--disable-setuid-sandbox']
    )
    
    try:
        page = await browser.newPage()
        # Set viewport to standard high resolution desktop size
        await page.setViewport({'width': 1200, 'height': 1600})
        
        print("Navigating to page...")
        await page.goto(url, {'waitUntil': 'networkidle0', 'timeout': 60000})
        
        print("Waiting for charts and diagrams to draw...")
        # Give Mermaid.js and Chart.js 4 seconds to settle down
        await asyncio.sleep(4)
        
        print(f"Exporting PDF to {output_pdf}...")
        await page.pdf({
            'path': output_pdf,
            'format': 'A4',
            'printBackground': True,
            'margin': {
                'top': '15mm',
                'bottom': '15mm',
                'left': '10mm',
                'right': '10mm'
            }
        })
        print("PDF generated successfully!")
    except Exception as e:
        print(f"Error during PDF generation: {e}", file=sys.stderr)
        raise e
    finally:
        await browser.close()
        server.stop()

if __name__ == "__main__":
    asyncio.get_event_loop().run_until_complete(generate_pdf())
