import { useState, useEffect } from 'react'
import axios from 'axios'
import { FiShield, FiCheck, FiX, FiLoader, FiFolder, FiEye, FiBarChart2, FiGithub, FiExternalLink } from 'react-icons/fi'
import './App.css'

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT?.replace(/\/$/, '')
const DEFAULT_GITHUB_REPO = import.meta.env.VITE_GITHUB_REPO || 'https://github.com/franzheffa/smith-heffa-deepfakedetection'

function App() {
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [dashboardUrl, setDashboardUrl] = useState(null)
  const [githubRepo, setGithubRepo] = useState(null)

  useEffect(() => {
    // Fetch dashboard and GitHub repo URLs
    const fetchLinks = async () => {
      if (!API_ENDPOINT) {
        setGithubRepo(DEFAULT_GITHUB_REPO)
        return
      }

      try {
        const response = await axios.get(`${API_ENDPOINT}/dashboard`)
        if (response.data) {
          // Handle both string and object responses
          let data = response.data
          if (typeof data === 'string') {
            try {
              data = JSON.parse(data)
            } catch (e) {
              console.warn('Failed to parse response data as JSON:', e)
              data = null
            }
          }
          // Handle nested body structure from API Gateway
          if (data && data.body) {
            if (typeof data.body === 'string') {
              try {
                data = JSON.parse(data.body)
              } catch (e) {
                console.warn('Failed to parse body as JSON:', e)
                data = null
              }
            } else {
              data = data.body
            }
          }
          if (data?.dashboard_url) {
            setDashboardUrl(data.dashboard_url)
          }
          setGithubRepo(data?.github_repo || DEFAULT_GITHUB_REPO)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard info:', error)
        setGithubRepo(DEFAULT_GITHUB_REPO)
      }
    }
    fetchLinks()
  }, [])

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setImage(e.target.result)
      reader.readAsDataURL(file)
      setResult(null)
      setError(null)
    }
  }

  const uploadImage = async () => {
    if (!image) return

    if (!API_ENDPOINT) {
      setError('API endpoint not configured. Set VITE_API_ENDPOINT before production use.')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const base64 = image.split(',')[1]
      const response = await axios.post(`${API_ENDPOINT}/upload`, {
        image: base64
      })
      

      setResult(response.data)
    } catch (error) {
      console.error('Upload failed:', error)
      setError(error.response?.data?.error || 'Upload failed')
    }
    setLoading(false)
  }

  return (
    <div className="app">
      <div className="brand-shell">
        <div className="brand-accent brand-accent-left" aria-hidden="true" />
        <div className="brand-accent brand-accent-right" aria-hidden="true" />

        <div className="brand-hero">
          <div className="brand-kicker">Buttertech AI Ecosystem</div>
          <div className="brand-title-row">
            <FiShield className="brand-mark" />
            <div>
              <h1>Smith-Heffa Deepfake Detection</h1>
              <p>Enterprise-grade media integrity screening for go-to-market, platform trust, and compliance workflows.</p>
            </div>
          </div>
        </div>

      {/* Banner Section */}
      <div className="banner-container">
        {dashboardUrl && (
          <a 
            href={dashboardUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="banner-link"
          >
            <div className="banner dashboard-banner">
              <div className="banner-content">
                <FiBarChart2 className="banner-icon" />
                <span>Monitoring Dashboard</span>
              </div>
              <FiExternalLink className="external-icon" />
            </div>
          </a>
        )}
        {githubRepo && (
          <a 
            href={githubRepo} 
            target="_blank" 
            rel="noopener noreferrer"
            className="banner-link"
          >
            <div className="banner github-banner">
              <div className="banner-content">
                <FiGithub className="banner-icon" />
                <span>GitHub Repository</span>
              </div>
              <FiExternalLink className="external-icon" />
            </div>
          </a>
        )}
      </div>

      <div className="header">
        <FiShield className="header-icon" />
        <h1>Deepfake Detection</h1>
        <p>Advanced deepfake detection powered by NVIDIA AI and cloud-native infrastructure</p>
      </div>
      
      <div className="upload-section">
        <div className="file-input-wrapper">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageUpload}
            id="file-input"
            className="file-input"
          />
          <label htmlFor="file-input" className="file-label">
            <FiFolder />
            Choose Image
          </label>
        </div>
        
        {image && (
          <div className="image-preview">
            <img src={image} alt="Preview" className="preview-img" />
            <button 
              onClick={uploadImage} 
              disabled={loading}
              className="upload-btn"
            >
              {loading ? (
                <>
                  <FiLoader className="spinning" />
                  Analyzing...
                </>
              ) : (
                <>
                  <FiEye />
                  Analyze
                </>
              )}
            </button>
          </div>
        )}
      </div>
      
      {error && (
        <div className="alert error">
          <FiX />
          <span>{error}</span>
        </div>
      )}
      
      {result && result.body?.detection_result && (
        <div className="results-section">
          <div className="results-header">
            <FiEye className="results-icon" />
            <h3>Analysis Complete</h3>
          </div>
          
          {result.body.detection_result.data[0].bounding_boxes.map((detection, i) => {
            const isDeepfake = detection.is_deepfake > 0.5
            const fakeConfidence = (detection.is_deepfake * 100).toFixed(1)
            const realConfidence = ((1 - detection.is_deepfake) * 100).toFixed(1)
            const detectionConf = (detection.bbox_confidence * 100).toFixed(1)
            
            return (
              <div key={i} className={`result-card ${isDeepfake ? 'fake' : 'real'}`}>
                <div className="result-main">
                  <div className="result-icon">
                    {isDeepfake ? <FiX size={24} /> : <FiCheck size={24} />}
                  </div>
                  <div className="result-content">
                    <div className="status-badge">
                      {isDeepfake ? 'DEEPFAKE DETECTED' : 'AUTHENTIC IMAGE'}
                    </div>
                    <div className="confidence-score">
                      {isDeepfake ? 'Fake' : 'Authentic'} Confidence: <strong>{isDeepfake ? fakeConfidence : realConfidence}%</strong>
                    </div>
                    <div className="detection-score">
                      Detection Accuracy: <strong>{detectionConf}%</strong>
                    </div>
                  </div>
                </div>
                <div className="confidence-bar">
                  <div 
                    className={`confidence-fill ${isDeepfake ? 'fake-fill' : 'real-fill'}`}
                    style={{ width: `${isDeepfake ? fakeConfidence : realConfidence}%` }}
                  ></div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      
      <footer style={{ 
        marginTop: '2rem'
      }}>
        <div className="enterprise-footer">
          <div className="footer-top">
            <div>
              <div className="footer-brand">Buttertech</div>
              <p className="footer-copy">
                Enterprise AI platforms for trust, payments, cloud distribution, and intelligent workflow automation.
              </p>
            </div>
            <div className="footer-grid">
              <div>
                <h4>Platform</h4>
                <a href={DEFAULT_GITHUB_REPO} target="_blank" rel="noopener noreferrer">Source Repository</a>
                {dashboardUrl && <a href={dashboardUrl} target="_blank" rel="noopener noreferrer">Monitoring Dashboard</a>}
              </div>
              <div>
                <h4>Ecosystem</h4>
                <span>Vercel</span>
                <span>Google Cloud</span>
                <span>NVIDIA AI Enterprise</span>
              </div>
              <div>
                <h4>Operations</h4>
                <span>Production-ready deployment</span>
                <span>Observability enabled</span>
                <span>Enterprise security baseline</span>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 Buttertech. Smith-Heffa platform.</span>
            <span>Brand system: Pure White / Black / Sun Gold.</span>
          </div>
        </div>
      </footer>
      </div>
    </div>
  )
}

export default App
