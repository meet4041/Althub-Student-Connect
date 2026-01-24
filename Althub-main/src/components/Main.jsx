import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowRight,
    CheckCircle,
    Calendar,
    Users,
    MessageSquare,
    Linkedin,
    Github,
    Mail,
    Phone
} from 'lucide-react';
import "../styles/Main.css";

export default function Main() {
    const nav = useNavigate();

    useEffect(() => { window.scrollTo(0, 0); }, []);

    return (
        <div className="page-wrapper">

            {/* --- NAVBAR --- */}
            <nav className="nav-glass">
                <div className="section-container">
                    <div className="nav-inner">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
                            {/* Ensure you have a logo that fits, or use this text fallback */}
                            <img src="images/Logo1.jpeg" alt="AltHub" className="h-12 w-100 rounded-lg shadow-sm" />
                            {/* <span className="nav-logo-text">AltHub</span> */}
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="btn-nav-login" onClick={() => nav('/login')}>
                                Log in
                            </button>
                            <button className="btn-primary" onClick={() => nav('/register')}>
                                Get Started
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* --- HERO SECTION --- */}
            <section className="hero-section">
                <div className="section-container grid lg:grid-cols-2 gap-16 items-center">

                    {/* Left Content */}
                    <div className="z-10">
                        <div className="hero-badge">
                            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
                            Connecting DAU
                        </div>

                        <h1 className="hero-title">
                            Connecting Students & <br />
                            <span className="hero-gradient-text">Alumni Together</span>
                        </h1>

                        <p className="hero-desc">
                            A comprehensive platform bridging the gap between campus life and professional careers. Unlock career advice, mentorship, and job opportunities in one place.
                        </p>

                        <button onClick={() => nav('/register')} className="btn-hero-cta group">
                            Join the Community
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    {/* Right Image */}
                    <div className="hero-image-wrapper">
                        {/* New Theme Blobs: Teal and Emerald */}
                        <div className="bg-blob bg-brand-200 top-0 right-0 w-72 h-72"></div>
                        <div className="bg-blob bg-secondary-200 bottom-0 left-0 w-72 h-72 animation-delay-2000"></div>

                        <img
                            src="images/connect.png"
                            alt="Connection Illustration"
                            className="hero-img"
                        />
                    </div>
                </div>
            </section>

            {/* --- FEATURES SECTION --- */}
            <section className="features-section">
                <div className="section-container">
                    <div className="section-header">
                        <span className="section-tag">Features</span>
                        <h2 className="section-title">Everything you need to grow</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="feature-card group">
                            <div className="feature-icon-box bg-orange-50 text-orange-500">
                                <Calendar className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Events & Reunions</h3>
                            <p className="text-slate-500 leading-relaxed">
                                Keep up with reunions, webinars, and casual hangouts happening at your alma mater.
                            </p>
                        </div>

                        {/* Feature 2 (Main) */}
                        <div className="feature-card group">
                            <div className="feature-icon-box bg-brand-50 text-brand-600">
                                <Users className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Alumni Directory</h3>
                            <p className="text-slate-500 leading-relaxed">
                                Find lost classmates, discover mentors, and build a professional network that matters.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="feature-card group">
                            <div className="feature-icon-box bg-secondary-50 text-secondary-600">
                                <MessageSquare className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Secure Messaging</h3>
                            <p className="text-slate-500 leading-relaxed">
                                Directly connect with like-minded people using our secure, on-demand messaging system.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- TAGS SECTION --- */}
            <section className="tags-section">
                <div className="section-container text-center">
                    <h2 className="text-3xl font-bold text-slate-900 mb-8">Find Connections in Top Fields</h2>
                    <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
                        {[
                            "Network Administrator", "UI/UX Designer", "System Analyst",
                            "Database Admin", "Full-stack Developer",
                            "Software Engineer", "Data Scientist", "Cloud Engineer",
                            "Cyber Security", "Product Manager"
                        ].map((job, index) => (
                            <span key={index} className="job-tag">
                                {job}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- WHY US SECTION --- */}
            <section className="info-section">
                <div className="section-container space-y-32">

                    {/* Block 1 */}
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <span className="section-tag text-brand-600">Why Althub?</span>
                            <h2 className="text-4xl font-extrabold text-slate-900 mb-8">Empowering the Alumni Network</h2>
                            <div className="space-y-2">
                                {[
                                    "Provide alumni a reason to give back their time & talent.",
                                    "Build alumni-centric programs designed for engagement.",
                                    "No app downloads required – accessible everywhere.",
                                    "Simple for any age group to participate."
                                ].map((text, i) => (
                                    <div key={i} className="info-list-item">
                                        <CheckCircle className="check-icon" />
                                        <p className="text-slate-700 font-medium">{text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-center relative">
                            {/* Teal Glow */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-brand-100 to-transparent rounded-full blur-3xl opacity-50 -z-10"></div>
                            <img src="images/Alumni-2.svg" alt="Why Althub" className="w-full max-w-md drop-shadow-xl hover:-translate-y-2 transition-transform duration-500" />
                        </div>
                    </div>

                    {/* Block 2 */}
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="order-2 md:order-1 flex justify-center relative">
                            {/* Emerald Glow */}
                            <div className="absolute inset-0 bg-gradient-to-bl from-secondary-100 to-transparent rounded-full blur-3xl opacity-50 -z-10"></div>
                            <img src="images/Usability testing-bro.png" alt="Alumni Center" className="w-full max-w-md drop-shadow-xl hover:-translate-y-2 transition-transform duration-500" />
                        </div>
                        <div className="order-1 md:order-2">
                            <h2 className="text-4xl font-extrabold text-slate-900 mb-6">Alumni at the Center</h2>
                            <p className="text-lg text-slate-600 leading-loose">
                                We believe that a strong alumni network is the backbone of any institution.
                                In today's value-focused reality, we provide the technology and strategy to make connecting easier,
                                more meaningful, and mutually beneficial for everyone involved.
                            </p>
                        </div>
                    </div>

                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="footer-root">
                <div className="section-container grid md:grid-cols-4 gap-12">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="text-2xl font-bold text-white">AltHub</span>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-400 max-w-sm">
                            Bridging the gap between college management, current students, and alumni.
                            Seamless communication for job vacancies, career advice, and mentorship.
                        </p>
                    </div>

                    <div>
                        <h4 className="footer-heading">Contact Us</h4>
                        <div className="space-y-4 text-sm">
                            <div className="footer-link">
                                <Phone className="w-4 h-4" /> +91 6352314322
                            </div>
                            <a href="mailto:althub.daiict@gmail.com" className="footer-link">
                                <Mail className="w-4 h-4" /> althub.daiict@gmail.com
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="footer-heading">Follow Us</h4>
                        <div className="space-y-4 text-sm">
                            <a href="https://www.linkedin.com/in/meetgandhi4041/" target="_blank" rel="noreferrer" className="footer-link">
                                <Linkedin className="w-4 h-4" /> LinkedIn
                            </a>
                            <a href="https://github.com/meet4041" target="_blank" rel="noreferrer" className="footer-link">
                                <Github className="w-4 h-4" /> GitHub
                            </a>
                        </div>
                    </div>
                </div>

                <div className="section-container mt-16 pt-8 border-t border-slate-800 text-center text-sm text-slate-600">
                    &copy; {new Date().getFullYear()} Althub. All rights reserved.
                </div>
            </footer>
        </div>
    )
}