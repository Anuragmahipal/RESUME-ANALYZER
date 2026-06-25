import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'
import Lottie from "react-lottie-player"
import robotAnimation from "/src/assets/robot-animation.json"
import resumeAnimation from "/src/assets/resume-animation.json"

const Login = () => {
    const { loading, handleLogin } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        const result = await handleLogin({ email, password })

        if (result.success) navigate("/")
        else alert(result.message)
    }

    if (loading) return <main><h1>Loading...</h1></main>

    return (
        <main>
            <div className="main-title">
            {"RESUME ANALYZER".split("").map((char, index) => (
                <span key={index}>{char === " " ? "\u00A0" : char}</span>
            ))}
            </div>
            {/* Left Robot */}
            <div className="robot-lottie">
                <Lottie
                loop
                animationData={robotAnimation}
                play
                style={{ width: 300, height: 300 }}
                />
            </div>

            {/* Top Right Resume */}
            <div className="resume-lottie">
                <Lottie
                    loop
                    animationData={resumeAnimation}
                    play
                    style={{ width: 300, height: 300 }}
                    />
            </div>

            {/* Login Card */}
            <div className="form-container">
                <h1>Login</h1>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Email</label>
                        <input
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            placeholder="Enter email"
                        />
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <input
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            placeholder="Enter password"
                        />
                    </div>

                    <button className='button primary-button'>Login</button>
                </form>

                <p>
                    Don't have an account? <Link to="/register">Register</Link>
                </p>
            </div>
        </main>
    )
}

export default Login
