
import React from 'react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">K</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">KinSeeker</h1>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="#how-it-works" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">How it Works</a>
            <a href="#search" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Archives</a>
            <a href="#visual" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Visual ID</a>
            <a href="#genetics" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Genetics</a>
            <a href="#signs" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Signs</a>
          </nav>
          <div className="flex items-center">
            <span className="text-xs font-semibold px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full">Secure Haven</span>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-white font-semibold mb-4">About KinSeeker</h3>
              <p className="text-sm leading-relaxed">
                Dedicated to uncovering hidden truths and helping families reconnect with their biological history through reputable archives and genetic data.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Privacy Policy</h3>
              <p className="text-sm leading-relaxed">
                Your searches are private. We do not store personal identification data. This is a safe space for self-discovery.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Disclaimer</h3>
              <p className="text-sm leading-relaxed text-slate-500">
                Information provided is for research purposes only. Always consult legal and medical professionals for critical decisions.
              </p>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 text-center text-xs">
            &copy; {new Date().getFullYear()} KinSeeker Discovery Hub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
