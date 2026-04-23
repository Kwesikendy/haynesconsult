from PIL import Image

# Read the tightly cropped image
im = Image.open('public/clients/client_09.jpeg')

# We want to give it generous padding so it acts like a properly framed logo
# The current size is roughly 491 x 200
# Let's create a white canvas that is roughly 800 x 450 (16:9 ratio roughly, great for cover backgrounds)
padded_w = 800
padded_h = 450

bg = Image.new("RGB", (padded_w, padded_h), (255, 255, 255))

# Calculate center position
offset_x = (padded_w - im.width) // 2
offset_y = (padded_h - im.height) // 2

# Paste the logo
bg.paste(im, (offset_x, offset_y))

bg.save('public/clients/client_09.jpeg', quality=95)
print("Image successfully padded.")
