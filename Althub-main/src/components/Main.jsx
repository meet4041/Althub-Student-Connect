import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// --- INJECTED STYLES FOR MODERN LANDING PAGE ---
const styles = `
  /* Global Reset & Fonts */
  .landing-wrapper {
    font-family: 'Poppins', sans-serif;
    color: #2d3436;
    background-color: #fff;
    overflow-x: hidden;
  }

  /* --- NAVBAR --- */
  .landing-nav {
    position: fixed;
    top: 0;
    width: 100%;
    height: 80px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 5%;
    z-index: 1000;
    box-shadow: 0 2px 20px rgba(0,0,0,0.05);
  }

  .nav-logo img {
    height: 50px;
    object-fit: contain;
  }

  .nav-buttons {
    display: flex;
    gap: 15px;
  }

  .btn-nav {
    padding: 10px 25px;
    border-radius: 30px;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .btn-login {
    background: transparent;
    border: 2px solid #66bd9e;
    color: #66bd9e;
  }

  .btn-login:hover {
    background: #f0f9f6;
  }

  .btn-register {
    background: #66bd9e;
    border: 2px solid #66bd9e;
    color: #fff;
    box-shadow: 0 4px 15px rgba(102, 189, 158, 0.3);
  }

  .btn-register:hover {
    background: #479378;
    border-color: #479378;
    transform: translateY(-2px);
  }

  /* --- HERO SECTION --- */
  .hero-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 120px 5% 60px; /* Top padding accounts for fixed nav */
    min-height: 90vh;
    background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
  }

  .hero-text {
    flex: 1;
    max-width: 600px;
  }

  .hero-text h1 {
    font-size: 3.5rem;
    font-weight: 800;
    line-height: 1.2;
    margin-bottom: 20px;
    background: linear-gradient(90deg, #2d3436 0%, #66bd9e 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .hero-text p {
    font-size: 1.2rem;
    color: #636e72;
    margin-bottom: 30px;
    line-height: 1.6;
  }

  .hero-img {
    flex: 1;
    display: flex;
    justify-content: center;
  }

  .hero-img img {
    width: 100%;
    max-width: 600px;
    filter: drop-shadow(0 20px 40px rgba(0,0,0,0.1));
    animation: float 6s ease-in-out infinite;
  }

  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
    100% { transform: translateY(0px); }
  }

  /* --- FEATURES GRID --- */
  .features-section {
    padding: 80px 5%;
    background: #fff;
  }

  .section-title {
    text-align: center;
    margin-bottom: 50px;
  }

  .section-title h2 {
    font-size: 2.5rem;
    font-weight: 700;
    color: #2d3436;
    margin-bottom: 10px;
  }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .feature-card {
    background: #fff;
    padding: 30px;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
    text-align: center;
    transition: transform 0.3s;
    border: 1px solid #f0f0f0;
  }

  .feature-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 35px rgba(0,0,0,0.1);
  }

  .feature-icon {
    height: 120px;
    margin-bottom: 20px;
    object-fit: contain;
  }

  .feature-card h3 {
    font-size: 1.5rem;
    margin-bottom: 10px;
    color: #66bd9e;
  }

  .feature-card p {
    color: #636e72;
    line-height: 1.5;
  }

  /* --- TAGS SECTION --- */
  .tags-section {
    padding: 80px 5%;
    background: #f8f9fa;
    text-align: center;
  }

  .tags-wrapper {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 15px;
    max-width: 1000px;
    margin: 0 auto;
  }

  .tag-pill {
    background: #fff;
    border: 1px solid #e0e0e0;
    padding: 10px 25px;
    border-radius: 50px;
    font-size: 0.95rem;
    font-weight: 500;
    color: #555;
    cursor: default;
    transition: all 0.3s;
    box-shadow: 0 2px 5px rgba(0,0,0,0.03);
  }

  .tag-pill:hover {
    border-color: #66bd9e;
    color: #66bd9e;
    background: #f0f9f6;
    transform: scale(1.05);
  }

  /* --- INFO SPLIT SECTION --- */
  .info-section {
    padding: 80px 5%;
    max-width: 1200px;
    margin: 0 auto;
  }

  .info-split {
    display: flex;
    align-items: center;
    gap: 50px;
    margin-bottom: 80px;
  }

  .info-split.reverse {
    flex-direction: row-reverse;
  }

  .info-content {
    flex: 1;
  }

  .info-content h2 {
    font-size: 2.2rem;
    margin-bottom: 20px;
    color: #2d3436;
  }

  .info-list {
    list-style: none;
    padding: 0;
  }

  .info-list li {
    margin-bottom: 15px;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-size: 1.05rem;
    color: #636e72;
  }

  .info-list i {
    color: #66bd9e;
    margin-top: 5px;
  }

  .info-img {
    flex: 1;
  }

  .info-img img {
    width: 100%;
    max-width: 500px;
  }

  /* --- FOOTER --- */
  .modern-footer {
    background: #2d3436;
    color: #fff;
    padding: 60px 5% 20px;
  }

  .footer-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 40px;
    max-width: 1200px;
    margin: 0 auto 40px;
  }

  .footer-col h3 {
    font-size: 1.5rem;
    margin-bottom: 20px;
    color: #66bd9e;
  }

  .footer-col p {
    color: #b2bec3;
    line-height: 1.6;
  }

  .contact-list, .social-list {
    list-style: none;
    padding: 0;
  }

  .contact-list li {
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    gap: 10px;
    color: #dfe6e9;
  }

  .contact-list a, .social-list a {
    color: #dfe6e9;
    text-decoration: none;
    transition: color 0.2s;
  }

  .contact-list a:hover, .social-list a:hover {
    color: #66bd9e;
  }

  .social-list li {
    margin-bottom: 10px;
  }

  .social-list a {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 1rem;
  }

  .footer-bottom {
    text-align: center;
    border-top: 1px solid #4a4a4a;
    padding-top: 20px;
    color: #636e72;
    font-size: 0.9rem;
  }

  /* Responsive */
  @media (max-width: 900px) {
    .hero-section { flex-direction: column-reverse; padding-top: 100px; text-align: center; }
    .hero-text h1 { font-size: 2.5rem; }
    .info-split { flex-direction: column; text-align: center; gap: 30px; }
    .info-split.reverse { flex-direction: column; }
    .info-list li { justify-content: center; text-align: left; }
  }
`;

export default function Main() {
    const nav = useNavigate();
    
    useEffect(() => {
        window.scrollTo(0, 0);
        // Inject styles
        const styleSheet = document.createElement("style");
        styleSheet.innerText = styles;
        document.head.appendChild(styleSheet);
        return () => document.head.removeChild(styleSheet);
    }, []);

    return (
        <div className="landing-wrapper">
            
            {/* --- NAVBAR --- */}
            <nav className="landing-nav">
                <div className="nav-logo">
                    <img src="images/Logo1.jpeg" alt="AltHub Logo" />
                </div>
                <div className="nav-buttons">
                    <button className="btn-nav btn-login" onClick={() => nav('/login')}>Login</button>
                    <button className="btn-nav btn-register" onClick={() => nav('/register')}>Register</button>
                </div>
            </nav>

            {/* --- HERO SECTION --- */}
            <section className="hero-section">
                <div className="hero-text">
                    <h1>Connecting Students & Alumni Together</h1>
                    <p>
                        A comprehensive platform bridging the gap between college management, current students, and alumni. 
                        Unlock career advice, mentorship, and job opportunities in one place.
                    </p>
                    <button className="btn-nav btn-register" onClick={() => nav('/register')} style={{padding: '15px 40px', fontSize: '1.1rem'}}>
                        Get Started
                    </button>
                </div>
                <div className="hero-img">
                    <img src="images/connect.png" alt="Connection Illustration" />
                </div>
            </section>

            {/* --- FEATURES GRID --- */ }
            <section className="features-section">
                <div className="section-title">
                    <h2>Explore Althub</h2>
                    <p>Everything you need to stay connected</p>
                </div>
                
                <div className="cards-grid">
                    <div className="feature-card">
                        <img src="images/event.png" alt="Events" className="feature-icon" />
                        <h3>Events</h3>
                        <p>Keep up with reunions, webinars, and casual hangouts happening at your alma mater.</p>
                    </div>
                    <div className="feature-card">
                        <img src="images/alumini-directory.png" alt="Directory" className="feature-icon" />
                        <h3>Alumni Directory</h3>
                        <p>Find lost classmates, discover mentors, and build a professional network that matters.</p>
                    </div>
                    <div className="feature-card">
                        <img src="images/content-library.png" alt="Connections" className="feature-icon" />
                        <h3>Secure Messaging</h3>
                        <p>Directly connect with like-minded people using our secure, on-demand messaging system.</p>
                    </div>
                </div>
            </section>

            {/* --- JOB TAGS --- */}
            <section className="tags-section">
                <div className="section-title">
                    <h2>Find the Right Connections</h2>
                    <p>Connect with professionals across various fields</p>
                </div>
                <div className="tags-wrapper">
                    {[
                        "Network Administrator", "Designer", "System Analyst", 
                        "Database Administrator", "Full-stack Developer", 
                        "Software Engineer", "Data Scientist", "Cloud Engineer", 
                        "IT Security Specialist", "Analytics Manager"
                    ].map((job, index) => (
                        <div key={index} className="tag-pill">{job}</div>
                    ))}
                </div>
            </section>

            {/* --- INFO SECTIONS --- */}
            <section className="info-section">
                {/* Why Althub */}
                <div className="info-split">
                    <div className="info-content">
                        <h2>Why Choose Althub?</h2>
                        <ul className="info-list">
                            <li><i className="fa-solid fa-check-circle"></i> Provide alumni a reason to give back their time & talent.</li>
                            <li><i className="fa-solid fa-check-circle"></i> Build alumni-centric programs designed for engagement.</li>
                            <li><i className="fa-solid fa-check-circle"></i> No app downloads required – accessible everywhere.</li>
                            <li><i className="fa-solid fa-check-circle"></i> Simple for any age group to participate from anywhere.</li>
                        </ul>
                    </div>
                    <div className="info-img">
                        <img src="images/Alumni-2.svg" alt="Why Althub" />
                    </div>
                </div>

                {/* Alumni Center */}
                <div className="info-split reverse">
                    <div className="info-content">
                        <h2>Alumni at the Center</h2>
                        <p>
                            We believe that a strong alumni network is the backbone of any institution. 
                            In today's value-focused reality, we provide the technology and strategy to make connecting easier, 
                            more meaningful, and mutually beneficial.
                        </p>
                    </div>
                    <div className="info-img">
                        <img src="images/Usability testing-bro.png" alt="Alumni Center" />
                    </div>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="modern-footer">
                <div className="footer-grid">
                    <div className="footer-col">
                        <h3>About Althub</h3>
                        <p>
                            Althub bridges the gap between college management, current students, and alumni. 
                            It enables seamless communication for job vacancies, career advice, and mentorship.
                        </p>
                    </div>
                    <div className="footer-col">
                        <h3>Contact Us</h3>
                        <ul className="contact-list">
                            <li>
                                <i className="fa-solid fa-phone"></i>
                                +91 6352314322
                            </li>
                            <li>
                                <i className="fa-regular fa-envelope"></i>
                                <a href="mailto:althub.daiict@gmail.com">althub.daiict@gmail.com</a>
                            </li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h3>Follow Us</h3>
                        <ul className="social-list">
                            <li>
                                <a href="https://www.linkedin.com/in/meetgandhi4041/" target="_blank" rel="noreferrer">
                                    <i className="fa-brands fa-linkedin"></i> Linkedin
                                </a>
                            </li><br></br>
                            <li>
                                <a href="https://github.com/meet4041" target="_blank" rel="noreferrer">
                                    <i className="fa-brands fa-github"></i> Github
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} Althub. All rights reserved.</p>
                </div>
            </footer>

        </div>
    )
}