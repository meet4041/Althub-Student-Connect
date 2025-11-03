import React from 'react'
import { useNavigate } from 'react-router-dom'

function Main() {
    const nav = useNavigate();
    window.scrollTo(0, 0)
    return (
        <>
            <nav className="banner-nav">
                <input type="checkbox" id="check" />
                <label htmlFor="check" className="check-btn"><i className="fa-solid fa-bars"></i></label>
                <ul>
                    <li onClick={() => { nav('/login') }}>Login</li>
                    <li onClick={() => { nav('/register') }}>Register</li>
                </ul>
            </nav>

            <div className="banner-main">
                <div className="banner-left">
                    <img src="images/Logo1.jpeg" alt="logo" id="logo" />
                    <p>A Platform for Alumni and Student to Connect together.</p>
                    <div className="banner-btn">
                        Register Institute
                    </div>
                </div>
                <div className="banner-right">
                    <img src="images/connect.png" alt="" id="main-img" width="100%" height="100%" />
                </div>
            </div>

            <div className="main-section">
                <div className="div5">
                    <div className="div5-left">
                        <h1>Find the right job or internship for you</h1>
                    </div>
                    <div className="div5-right">
                        <button id="btn-job">Network Administrator</button>
                        <button id="btn-job">Designer</button>
                        <button id="btn-job">System Analyst</button>
                        <button id="btn-job">Database Administrator</button>
                        <button id="btn-job">Full-stack Developer</button>
                        <button id="btn-job">Software Engineer</button>
                        <button id="btn-job">Data Scientist</button>
                        <button id="btn-job">Cloud Engineer</button>
                        <button id="btn-job">IT Security Specialist</button>
                        <button id="btn-job">Analytics Manager</button>
                    </div>
                </div>
                <div className="div4">
                    <div className="div4-card">
                        <h3>EVENTS</h3>
                        <img src="images/event.png" alt="events" />
                        <p>Events taking place at Althub. Spin up weekend reunions or casual hangouts.</p>
                    </div>
                    <div className="div4-card">
                        <h3>ALUMINI DIRECTORY</h3>
                        <img src="images/alumini-directory.png" alt="events" />
                        <p>Help alumini discover classmates they have lost touch with, or find mentors who can help with the career change they are lokking to make.</p>
                    </div>
                    <div className="div4-card">
                        <h3>CONTENT LIBRARY</h3>
                        <img src="images/content-library.png" alt="events" />
                        <p>Secure, on-demand libraries for your institute. Create class notes, job hiring by the list of alumni owned businesses.</p>
                    </div>
                </div>
                <div className="div3">
                    <h1>Why Althub ?</h1>
                    <div>
                        <i className="fa-solid fa-pen"></i>
                        In the value-focused reality that our alumni live in, provide them a reason to give back their time,
                        talent, & money by choosing right technology and strategy.
                    </div>
                    <div>
                        <i className="fa-solid fa-pen"></i>
                        Build alumni-centric programs So we build everything with them in mind.
                    </div>
                    <div>
                        <i className="fa-solid fa-pen"></i>
                        Programs work better on Althub base because you can reach your alumni wherever they are.
                    </div>
                    <div>
                        <i className="fa-solid fa-pen"></i>
                        No app downloads or additional sign ups necessary.
                    </div>
                    <div>
                        <i className="fa-solid fa-pen"></i>
                        It’s incredibly easy for any age group to participate from anywhere.
                    </div>
                </div>
                <div className="div2">
                    <div className="div2-img">
                        <img src="images/Alumni-2.svg" alt="alumni" />
                    </div>
                    <div className="div2-text">
                        <h1>We believe your Alumni should be at the Center</h1><br />
                        <p>In the value-focused reality that our alumni live in, provide them a reason to give back their time,
                            talent, & money by choosing the right technology and strategy.</p>
                    </div>
                </div>

            </div>
            <div className="footer">
                <div className="footer-main">
                    <div className="f-about">
                        <h2>About Althub</h2>
                        <p>Althub is a web application that allows college management to store the details of both current and former students of the college. It also enables communication between them, with new students being able to seek information on job vacancies, career advice, and subject details from alumni.</p>
                    </div>
                    <div className="f-links">
                        <h3>Links</h3>
                        <ul>
                            <li>
                                Home
                            </li><br />
                            <li>
                                About
                            </li><br />
                            <li>
                                Services
                            </li><br />
                            <li>
                                Portfolio
                            </li><br />
                            <li>
                                Contact
                            </li><br />
                        </ul>
                    </div>
                    <div className="f-services">
                        <h3>Services</h3>
                        <ul>
                            <li>
                                Alumini
                            </li><br />
                            <li>
                                JOBS
                            </li><br />
                            <li>
                                Internships
                            </li><br />
                            <li>
                                Institute
                            </li><br />
                            <li>
                                Knowledge
                            </li>
                        </ul>
                    </div>
                    <div className="address">
                        <h3>Contact</h3>
                        <ul>
                            <li>
                                <i className="fa-solid fa-phone"></i>
                                +91 6352314322
                            </li><br />
                            <li>
                                <i className="fa-regular fa-envelope"></i>
                                <a href="mailto:althub.daiict@gmail.com" target="_blank" rel="noopener noreferrer">althub.daiict@gmail.com</a>
                            </li>
                        </ul>
                    </div>
                    <div className="Social-media">
                        <h3>Social Media</h3>
                        <ul>
                            <li>
                                <a
                                    href="https://www.linkedin.com/in/meetgandhi4041/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '8px' }}
                                >
                                    <i className="fa-brands fa-linkedin"></i>
                                    LinkedIn
                                </a>
                            </li><br />
                            <li>
                                <a
                                    href="https://github.com/meet4041"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '8px' }}
                                >
                                    <i className="fa-brands fa-github"></i>
                                    Github
                                </a>
                            </li><br />
                        </ul>
                    </div>
                </div>
                <hr />
                <div className="last">
                    <p><i className="fa-regular fa-copyright"></i>
                        Copyright Althub since 2025
                    </p>
                </div>
            </div>
        </>
    )
}

export default Main