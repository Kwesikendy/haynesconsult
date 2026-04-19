const fs = require('fs');

let indexHtml = fs.readFileSync('D:/Haynes/index.html', 'utf8');

const oldTestimonialsStart = indexHtml.indexOf('<div class="testimonials__track" id="testimonialsTrack">');
const oldTestimonialsEnd = indexHtml.indexOf('</section>', oldTestimonialsStart);

const newTestimonials = `
      <div class="testimonials__track" id="testimonialsTrack">
        <div class="testimonials__slideshow-wrap">
          <div class="testimonials__slideshow" data-autoplay>
            <div class="glass-card testimonials__slide active">
              <div class="testimonials__stars">★★★★★</div>
              <p class="testimonials__quote">"My website now has the wow factor , this is an amazing revamp !"</p>
              <div class="testimonials__author">
                <div class="testimonials__avatar">AM</div>
                <div>
                  <span class="testimonials__name">Dr Dr Ama Agyeibea Amausi</span>
                  <span class="testimonials__role">Ceo / Founder, Newshorn Dental Clinic</span>
                </div>
              </div>
            </div>
            
            <div class="glass-card testimonials__slide">
              <div class="testimonials__stars">★★★★★</div>
              <p class="testimonials__quote">"Our online presence and media exposure and coverage have taken a massive leap forward when Haynes consult took the reigns , I’m glad that they understand our industry and make our lives easier , because of them we were able to win the best media award for 24/25 respectively"</p>
              <div class="testimonials__author">
                <div class="testimonials__avatar">KQ</div>
                <div>
                  <span class="testimonials__name">Dr Kakrabah Quashie</span>
                  <span class="testimonials__role">President of the Ghana Dental Association</span>
                </div>
              </div>
            </div>

            <div class="glass-card testimonials__slide">
              <div class="testimonials__stars">★★★★★</div>
              <p class="testimonials__quote">"Haynes consult was able to produce all our brand assests and website within short notice and delivered greatly on the day of our 2nd Congress ! , This is testimony of their hard work"</p>
              <div class="testimonials__author">
                <div class="testimonials__avatar">OY</div>
                <div>
                  <span class="testimonials__name">~ Prof Obiri Yeboah</span>
                  <span class="testimonials__role">Ghaclip President</span>
                </div>
              </div>
            </div>

            <div class="glass-card testimonials__slide">
              <div class="testimonials__stars">★★★★★</div>
              <p class="testimonials__quote">"Wowww ! This is really nice , I like my colours so much , Thanks for following the brand guidelines ~"</p>
              <div class="testimonials__author">
                <div class="testimonials__avatar">AG</div>
                <div>
                  <span class="testimonials__name">Dr Alan Gaise</span>
                  <span class="testimonials__role">Bright smile Medical and Dental Ltd</span>
                </div>
              </div>
            </div>
          </div>
          <div class="testimonials__slide-dots" aria-hidden="true">
            <span class="testimonials__dot active"></span>
            <span class="testimonials__dot"></span>
            <span class="testimonials__dot"></span>
            <span class="testimonials__dot"></span>
          </div>
        </div>
      </div>
    </div>
  `;

indexHtml = indexHtml.substring(0, oldTestimonialsStart) + newTestimonials + indexHtml.substring(oldTestimonialsEnd);
fs.writeFileSync('D:/Haynes/index.html', indexHtml);

let styleCss = fs.readFileSync('D:/Haynes/src/style.css', 'utf8');
styleCss += `

/* ---- TESTIMONIAL SLIDESHOW ---- */
.testimonials__slideshow-wrap {
  position: relative;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}
.testimonials__slideshow {
  position: relative;
  min-height: 380px; 
}
.testimonials__slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s var(--ease-out), transform 0.6s var(--ease-out);
  pointer-events: none;
  visibility: hidden;
  padding: 40px;
  display: flex !important;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  z-index: 1;
}
.testimonials__slide.active {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
  visibility: visible;
  z-index: 2;
}
@media (max-width: 768px) {
  .testimonials__slideshow { min-height: 500px; }
  .testimonials__slide { padding: 20px; }
}
.testimonials__slide .testimonials__quote {
  font-size: clamp(16px, 3vw, 22px);
  color: var(--navy);
  font-weight: 500;
  line-height: 1.6;
  margin: 24px 0;
  font-style: italic;
}
.testimonials__slide .testimonials__author {
  display: flex;
  align-items: center;
  gap: 16px;
  text-align: left;
}
.testimonials__slide .testimonials__stars {
  color: var(--royal);
  font-size: 24px;
  letter-spacing: 2px;
}
.testimonials__slide-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 30px;
}
.testimonials__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(13, 43, 126, 0.2);
  transition: background 0.3s, transform 0.3s;
  cursor: pointer;
}
.testimonials__dot.active {
  background: var(--royal);
  transform: scale(1.3);
}
`;

fs.writeFileSync('D:/Haynes/src/style.css', styleCss);

let mainJs = fs.readFileSync('D:/Haynes/src/main.js', 'utf8');
mainJs += `
/* ============================================================
   TESTIMONIALS SLIDESHOW (AUTOPLAY)
============================================================ */
document.querySelectorAll('.testimonials__slideshow[data-autoplay]').forEach((show) => {
  const slides = show.querySelectorAll('.testimonials__slide');
  if (slides.length < 2) return;

  const wrap = show.closest('.testimonials__slideshow-wrap');
  const dots  = wrap ? wrap.querySelectorAll('.testimonials__dot') : [];

  let idx = 0;

  let timer = setInterval(nextSlide, 6000);

  function nextSlide() {
    slides[idx].classList.remove('active');
    if (dots[idx]) dots[idx].classList.remove('active');

    idx = (idx + 1) % slides.length;

    slides[idx].classList.add('active');
    if (dots[idx]) dots[idx].classList.add('active');
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      clearInterval(timer);
      slides[idx].classList.remove('active');
      if (dots[idx]) dots[idx].classList.remove('active');
      idx = i;
      slides[idx].classList.add('active');
      if (dots[idx]) dots[idx].classList.add('active');
      timer = setInterval(nextSlide, 6000);
    });
  });
});
`;

fs.writeFileSync('D:/Haynes/src/main.js', mainJs);

console.log('Script executed successfully!');
