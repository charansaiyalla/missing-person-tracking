import { useState, useEffect } from 'react';
import './index.css';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import UploadSection from './components/UploadSection';
import ResultsSection from './components/ResultsSection';
import HowItWorks from './components/HowItWorks';
import Footer from './components/Footer';

const API_URL = 'http://localhost:5000';

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [activeNav, setActiveNav] = useState('home');

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

  const handleSearch = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    setResults(null);
    setError(null);

    const formData = new FormData();
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
      <Navbar activeNav={activeNav} onNav={scrollTo} />
      <main>
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
      </main>
      <Footer />
    </>
  );
}
