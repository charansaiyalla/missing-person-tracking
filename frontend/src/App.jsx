import { useState, useEffect } from 'react';
import './index.css';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import UploadSection from './components/UploadSection';
import ResultsSection from './components/ResultsSection';
import HowItWorks from './components/HowItWorks';
import Footer from './components/Footer';
import Login from './components/Login';
import PoliceDashboard from './components/PoliceDashboard';

const API_URL = 'http://localhost:5000';

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [activeNav, setActiveNav] = useState('home');
  const [view, setView] = useState('login'); // login | citizen | police
  const [userRole, setUserRole] = useState(null);
  const [username, setUsername] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);

  // Load recent searches from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('trackai_searches');
    if (saved) {
      try { setRecentSearches(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  // Cleanup object URL on unmount/change
  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  const handleFileSelect = (file) => {
    if (!file) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResults(null);
    setError(null);
  };

  const handleClear = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setResults(null);
    setError(null);
  };

  const handleLogin = (role, user) => {
    setUserRole(role);
    setUsername(user);
    if (role === 'police') {
      setView('police');
    } else {
      setView('citizen');
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    setUsername(null);
    setView('login');
    handleClear();
  };

  const handleSearch = async (formData) => {
    if (!selectedFile) return;
    setIsLoading(true);
    setResults(null);
    setError(null);

    formData.append('image', selectedFile);

    try {
      const res = await fetch(`${API_URL}/api/search`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Search failed');
      if (data.error && data.error !== 'no_face' && data.error !== 'not_found' && data.error !== 'empty_dataset') {
        throw new Error(data.error);
      }

      setResults(data);
      
      // Save search history
      if (data && data.caseDetails) {
         const newHistory = [{
           id: data.caseDetails.name + '-' + Date.now(),
           name: data.caseDetails.name,
           time: new Date().toLocaleTimeString(),
           date: new Date().toLocaleDateString(),
           lastSeenLocation: data.lastSeen?.location || 'Unknown',
         }, ...recentSearches].slice(0, 5);
         setRecentSearches(newHistory);
         localStorage.setItem('trackai_searches', JSON.stringify(newHistory));
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const scrollTo = (id) => {
    setActiveNav(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <Navbar activeNav={activeNav} onNav={scrollTo} view={view} onLogout={handleLogout} username={username} />
      <main>
        {view === 'login' && (
          <div className="container">
            <Login onLogin={handleLogin} />
          </div>
        )}

        {view === 'police' && (
          <div className="container">
             <PoliceDashboard apiUrl={API_URL} />
          </div>
        )}

        {view === 'citizen' && (
          <>
            <section id="home">
              <HeroSection />
            </section>
    
            <div className="container">
              <UploadSection
                selectedFile={selectedFile}
                previewUrl={previewUrl}
                isLoading={isLoading}
                onFileSelect={handleFileSelect}
                onClear={handleClear}
                onSearch={handleSearch}
                recentSearches={recentSearches}
              />
    
              {(isLoading || results || error) && (
                <ResultsSection
                  isLoading={isLoading}
                  results={results}
                  error={error}
                  onReset={handleClear}
                  apiUrl={API_URL}
                />
              )}
    
              <section id="about">
                <HowItWorks />
              </section>
            </div>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
