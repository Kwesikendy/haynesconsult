from PIL import Image

def manual_trim(im):
    pixels = im.load()
    w, h = im.size
    
    def is_bg(r, g, b):
        return r > 230 and g > 230 and b > 230
        
    top = 20
    for y in range(20, h-20):
        row_has_fg = False
        for x in range(20, w-20):
            if not is_bg(*pixels[x,y]):
                row_has_fg = True
                break
        if row_has_fg:
            top = y
            break
            
    bottom = h-20
    for y in range(h-20, 20, -1):
        row_has_fg = False
        for x in range(20, w-20):
            if not is_bg(*pixels[x,y]):
                row_has_fg = True
                break
        if row_has_fg:
            bottom = y + 1
            break
            
    left = 20
    for x in range(20, w-20):
        col_has_fg = False
        for y in range(top, bottom):
            if not is_bg(*pixels[x,y]):
                col_has_fg = True
                break
        if col_has_fg:
            left = x
            break
            
    right = w-20
    for x in range(w-20, 20, -1):
        col_has_fg = False
        for y in range(top, bottom):
            if not is_bg(*pixels[x,y]):
                col_has_fg = True
                break
        if col_has_fg:
            right = x + 1
            break

    print(f"Bounding box found: ({left}, {top}, {right}, {bottom})")
    
    padding = 30
    box = (
        max(0, left - padding),
        max(0, top - padding),
        min(w, right + padding),
        min(h, bottom + padding)
    )
    return im.crop(box)

img = Image.open('public/clients/client_09.jpeg').convert('RGB')
cropped = manual_trim(img)
cropped.save('public/clients/client_09.jpeg')
print(f"Trimmed size: {cropped.size}")
