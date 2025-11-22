IMAGE CAROUSEL SETUP GUIDE
==========================

Where to place your images:
---------------------------

1. About Section Images:
   - Put images in: images/about/
   - Name them: image1.jpg, image2.jpg, image3.jpg
   - You can add more images by adding more <div class="carousel-slide"> in index.html

2. Internship Section Images:
   - Put images in: images/internship/
   - Name them: image1.jpg, image2.jpg, image3.jpg

3. Projects Section Images:
   - Put images in: images/projects/
   - Name them: image1.jpg, image2.jpg, image3.jpg

4. Extracurriculars Section Images:
   - Put images in: images/extracurriculars/
   - Name them: image1.jpg, image2.jpg, image3.jpg

Image Requirements:
-------------------
- Supported formats: .jpg, .jpeg, .png, .webp
- Recommended size: 1200px width or larger
- Aspect ratio: 16:9 or 4:3 works best
- File size: Keep under 2MB per image for fast loading

How to add more images:
-----------------------
1. Add your image file to the appropriate folder
2. Open index.html
3. Find the carousel section you want to update
4. Add a new line like this inside the .carousel-track div:
   <div class="carousel-slide"><img src="images/[folder]/image4.jpg" alt="Description" /></div>

Tips:
-----
- Use descriptive alt text for accessibility
- Optimize images before uploading (use tools like TinyPNG)
- Keep image dimensions consistent for best appearance

