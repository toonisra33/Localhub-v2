import struct
import zlib
import os
import math

def create_png(width, height, draw_func, filename):
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0)  # filter type 0 (None)
        for x in range(width):
            r, g, b, a = draw_func(x, y, width, height)
            raw_data.extend([r, g, b, a])
    
    def chunk(tag, data):
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)

    ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    compressed = zlib.compress(bytes(raw_data), 9)
    
    png = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', ihdr) + chunk(b'IDAT', compressed) + chunk(b'IEND', b'')
    
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with open(filename, 'wb') as f:
        f.write(png)
    print(f"Generated {filename} ({width}x{height})")

# Draw function for standard icon (192x192 & 512x512)
def draw_standard(x, y, w, h):
    # Normalized coords from -1 to 1
    nx = (x / w) * 2 - 1
    ny = (y / h) * 2 - 1
    dist = math.sqrt(nx*nx + ny*ny)
    
    # Rounded squircle background: dark blue / indigo gradient
    bg_t = (ny + 1) / 2
    r_bg = int(30 + 10 * bg_t)
    g_bg = int(58 + 40 * bg_t)
    b_bg = int(138 + 90 * bg_t)
    
    # Check if inside squircle: |nx|^3.5 + |ny|^3.5 <= 0.85
    sq = (abs(nx)**3.5 + abs(ny)**3.5)
    if sq > 0.85:
        # Transparent outside
        return (0, 0, 0, 0)
    
    # White radio / location beacon symbol in center
    # Center circle at (0, -0.15)
    c_dist = math.sqrt(nx*nx + (ny + 0.15)**2)
    
    # Central dot
    if c_dist < 0.14:
        return (255, 255, 255, 255)
    
    # Wave 1
    if 0.24 < c_dist < 0.34 and ny < 0.2:
        return (255, 255, 255, 240)
        
    # Wave 2
    if 0.44 < c_dist < 0.54 and ny < 0.25:
        return (255, 255, 255, 220)
        
    # Antenna / transmitter base line & legs
    if abs(nx) < 0.05 and -0.05 < ny < 0.55:
        return (255, 255, 255, 255)
        
    # Transmitter legs
    leg1 = abs(ny - 0.45 - (nx * 1.5))
    leg2 = abs(ny - 0.45 - (-nx * 1.5))
    if 0.35 < ny < 0.65 and (abs(nx + (ny-0.45)*0.6) < 0.05 or abs(nx - (ny-0.45)*0.6) < 0.05):
        return (255, 255, 255, 255)
        
    # Emergency beacon pulse dot at bottom
    if math.sqrt(nx*nx + (ny - 0.68)**2) < 0.07:
        return (239, 68, 68, 255) # Red emergency dot
        
    return (r_bg, g_bg, b_bg, 255)

# Maskable icon: Full-bleed background with icons inside safe zone (central 80%)
def draw_maskable(x, y, w, h):
    nx = (x / w) * 2 - 1
    ny = (y / h) * 2 - 1
    
    # Full bleed gradient background
    bg_t = (ny + 1) / 2
    r_bg = int(24 + 12 * bg_t)
    g_bg = int(48 + 45 * bg_t)
    b_bg = int(120 + 95 * bg_t)
    
    # Scale down geometry by 0.75 for safe zone
    sx = nx / 0.75
    sy = ny / 0.75
    
    c_dist = math.sqrt(sx*sx + (sy + 0.15)**2)
    
    if c_dist < 0.14:
        return (255, 255, 255, 255)
    if 0.24 < c_dist < 0.34 and sy < 0.2:
        return (255, 255, 255, 240)
    if 0.44 < c_dist < 0.54 and sy < 0.25:
        return (255, 255, 255, 220)
    if abs(sx) < 0.05 and -0.05 < sy < 0.55:
        return (255, 255, 255, 255)
    if 0.35 < sy < 0.65 and (abs(sx + (sy-0.45)*0.6) < 0.05 or abs(sx - (sy-0.45)*0.6) < 0.05):
        return (255, 255, 255, 255)
    if math.sqrt(sx*sx + (sy - 0.68)**2) < 0.07:
        return (239, 68, 68, 255)
        
    return (r_bg, g_bg, b_bg, 255)

if __name__ == '__main__':
    create_png(192, 192, draw_standard, 'public/pwa-192x192.png')
    create_png(512, 512, draw_standard, 'public/pwa-512x512.png')
    create_png(512, 512, draw_maskable, 'public/pwa-maskable-512x512.png')
    create_png(180, 180, draw_standard, 'public/apple-touch-icon.png')
    create_png(64, 64, draw_standard, 'public/favicon.ico')
